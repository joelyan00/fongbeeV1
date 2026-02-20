<template>
  <div class="p-6 h-screen flex flex-col">
    <el-breadcrumb separator="/" class="mb-4 shrink-0">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">控制台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/dashboard/contracts' }">合同管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ isNew ? '新建合同' : '编辑合同' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="flex-1 flex gap-6 overflow-hidden min-h-0">
      <!-- Left: Editor/Preview -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-none">
          <div class="font-bold text-gray-700">Contract Editor</div>
          <el-switch
            v-model="showPreview"
            active-text="Real-time Preview"
            inactive-text="Edit Source"
            @change="handlePreviewToggle"
          />
        </div>

        <div class="flex-1 overflow-auto p-6 relative">
          <template v-if="!showPreview">
             <el-form :model="form" label-width="100px" label-position="top" class="h-full flex flex-col">
              <el-form-item label="服务类别" required>
                <el-select 
                  v-model="selectedCategory" 
                  placeholder="选择服务类别 (仅限复杂定制服务)" 
                  class="w-full"
                  @change="handleCategoryChange"
                >
                  <el-option
                    v-for="cat in customCategories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="服务表单" required>
                <el-select 
                  v-model="form.form_template_id" 
                  placeholder="选择关联的复杂定制服务表单" 
                  class="w-full"
                  :disabled="!selectedCategory"
                  @change="handleFormTemplateChange"
                >
                  <el-option
                    v-for="tpl in filteredFormTemplates"
                    :key="tpl.id"
                    :label="tpl.name"
                    :value="tpl.id"
                  />
                </el-select>
                <div v-if="!selectedCategory" class="text-xs text-gray-400 mt-1">请先选择服务类别</div>
              </el-form-item>

              <el-form-item label="合同名称" required>
                <el-input v-model="form.name" placeholder="请输入合同名称" />
              </el-form-item>
              
              <el-form-item label="合同内容 (支持 HTML)" required class="flex-1 flex flex-col min-h-0">
                <el-input 
                  id="contract-content-textarea"
                  v-model="form.content" 
                  type="textarea" 
                  class="h-full flex-1"
                  :rows="20"
                  placeholder="请输入合同内容 HTML" 
                  resize="none"
                />
              </el-form-item>
    
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio-button label="draft">草稿</el-radio-button>
                  <el-radio-button label="published">已发布</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </template>

          <template v-else>
            <div v-loading="previewLoading" class="preview-container prose max-w-none" v-html="previewHtml"></div>
          </template>
        </div>

        <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 flex-none">
           <el-button @click="$router.back()">取消</el-button>
           <el-button type="primary" :loading="saving" @click="saveContract">保存合同</el-button>
        </div>
      </div>

      <!-- Right: Variables Sidebar -->
      <div class="w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden flex-none">
        <div class="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
          Available Variables
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <div class="text-xs text-gray-500 mb-4">
            Click variable to insert into cursor position.
          </div>
          
          <div v-for="(group, idx) in variableGroups" :key="idx" class="mb-6">
            <div class="font-bold text-gray-900 mb-2 text-sm">{{ group.title }}</div>
            <div class="space-y-2">
              <div 
                v-for="v in group.vars" 
                :key="v.key"
                class="group flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-emerald-50 cursor-pointer border border-transparent hover:border-emerald-100 transition-colors"
                @click="insertVariable(v.key)"
              >
                <div>
                   <div class="font-mono text-xs text-emerald-600 font-bold">{{ v.key }}</div>
                   <div class="text-xs text-gray-500">{{ v.desc }}</div>
                </div>
                <div class="opacity-0 group-hover:opacity-100 text-emerald-500">
                  <el-icon><Plus /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { contractsApi, formTemplatesApi, customServiceCategoriesApi } from '../../services/api'

const route = useRoute()
const router = useRouter()
const saving = ref(false)
const showPreview = ref(false)
const previewLoading = ref(false)
const previewHtml = ref('')

const customCategories = ref<any[]>([])
const allFormTemplates = ref<any[]>([])
const selectedCategory = ref('')
const currentFormFields = ref<any[]>([])

const id = computed(() => route.params.id as string)
const isNew = computed(() => id.value === 'new')

const form = reactive({
  name: '',
  content: '',
  status: 'draft',
  form_template_id: '' as string | null
})

const filteredFormTemplates = computed(() => {
  if (!selectedCategory.value) return []
  return allFormTemplates.value.filter(t => t.category === selectedCategory.value)
})

// Variable Definitions
const baseVariableGroups = [
  {
    title: 'Contract Info',
    vars: [
      { key: '{{contract_no}}', desc: 'Auto-generated Contract Number' },
      { key: '{{created_at}}', desc: 'Creation Date (YYYY-MM-DD)' },
      { key: '{{total_amount}}', desc: 'Total Quote Amount' },
    ]
  },
  {
    title: 'Parties',
    vars: [
      { key: '{{party_a_name}}', desc: 'Client Name' },
      { key: '{{party_a_phone}}', desc: 'Client Phone' },
      { key: '{{party_b_name}}', desc: 'Provider Company Name' },
      { key: '{{party_b_phone}}', desc: 'Provider Phone' },
    ]
  },
  {
    title: 'Project Info',
    vars: [
      { key: '{{project_name}}', desc: 'Service / Project Title' },
      { key: '{{service_address}}', desc: 'Service Location Address' },
    ]
  }
]

const variableGroups = computed(() => {
  const groups = [...baseVariableGroups]
  if (currentFormFields.value.length > 0) {
    groups.push({
      title: 'Form Fields',
      vars: currentFormFields.value.map(f => ({
        key: `{{field_${f.key}}}`,
        desc: f.label || f.key
      }))
    })
  }
  return groups
})

onMounted(async () => {
  // Load initial data
  Promise.all([
    customServiceCategoriesApi.getAll(),
    formTemplatesApi.getAll({ type: 'custom' })
  ]).then(([catRes, formRes]) => {
    customCategories.value = catRes.categories
    allFormTemplates.value = formRes.templates
    
    // If editing existing, select correct category
    if (!isNew.value && form.form_template_id) {
       const tpl = allFormTemplates.value.find(t => t.id === form.form_template_id)
       if (tpl) {
         selectedCategory.value = tpl.category
         handleFormTemplateChange(form.form_template_id)
       }
    }
  })

  if (!isNew.value) {
    try {
      const res = await contractsApi.getById(id.value)
      const data = res.template
      form.name = data.name
      form.content = data.content
      form.status = data.status
      form.form_template_id = data.form_template_id
    } catch (error: any) {
      ElMessage.error('加载详情失败')
      router.back()
    }
  } else {
    // Default Content for new contract
    form.content = `<div style="padding: 20px; font-family: sans-serif;">
  <h2 style="text-align: center;">Service Contract</h2>
  <p><strong>Contract No:</strong> {{contract_no}}</p>
  <p><strong>Date:</strong> {{created_at}}</p>
  
  <hr />
  
  <p><strong>Party A (Client):</strong> {{party_a_name}}</p>
  <p><strong>Party B (Provider):</strong> {{party_b_name}}</p>
  
  <h3>1. Service Content</h3>
  <p>Party B agrees to provide <strong>{{project_name}}</strong> at <strong>{{service_address}}</strong>.</p>
  
  <h3>2. Payment</h3>
  <p>Total Amount: <strong>{{total_amount}}</strong>.</p>
  
  <div style="margin-top: 50px; display: flex; justify-content: space-between;">
    <div>Signature A: _____________</div>
    <div>Signature B: _____________</div>
  </div>
</div>`
  }
})

const handleCategoryChange = () => {
  form.form_template_id = null
  currentFormFields.value = []
}

const handleFormTemplateChange = (val: string | null) => {
  if (!val) {
    currentFormFields.value = []
    return
  }
  const tpl = allFormTemplates.value.find(t => t.id === val)
  if (tpl && tpl.steps) {
    const fields: any[] = []
    tpl.steps.forEach((step: any) => {
      if (step.fields) {
        fields.push(...step.fields)
      }
    })
    currentFormFields.value = fields
  }
}

const handlePreviewToggle = async (val: boolean) => {
  if (val) {
    previewLoading.value = true
    try {
      const res = await contractsApi.preview({
        templateContent: form.content
      })
      previewHtml.value = res.html
    } catch (e) {
      ElMessage.error('Failed to generate preview')
    } finally {
      previewLoading.value = false
    }
  }
}

const insertVariable = (variable: string) => {
  if (showPreview.value) {
    ElMessage.warning('Switch to Edit mode to insert variables')
    return;
  }
  
  const textarea = document.getElementById('contract-content-textarea') as HTMLTextAreaElement
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Insert text
    const text = form.content
    const before = text.substring(0, start)
    const after = text.substring(end)
    form.content = before + variable + after
    
    // Restore cursor (deferred)
    setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  } else {
    form.content += variable
  }
}

const saveContract = async () => {
  if (!form.name || !form.content || !form.form_template_id) {
    ElMessage.warning('请填写完整信息，包括关联的表单')
    return
  }

  saving.value = true
  try {
    if (isNew.value) {
      await contractsApi.create(form)
      ElMessage.success('创建成功')
    } else {
      await contractsApi.update(id.value, form)
      ElMessage.success('更新成功')
    }
    router.push('/dashboard/contracts')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Optional styling */
</style>
