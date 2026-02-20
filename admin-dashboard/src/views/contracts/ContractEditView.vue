<template>
  <div class="p-6">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">控制台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/dashboard/contracts' }">合同管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ isNew ? '新建合同' : '编辑合同' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Contract Builder -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Basic Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">基本信息</h3>
          <el-form :model="form" label-position="top">
            <el-form-item label="服务类别" required>
              <el-select
                v-model="selectedCategory"
                placeholder="选择服务类别 (仅限复杂定制服务)"
                class="w-full"
                @change="handleCategoryChange"
              >
                <el-option
                  v-for="cat in availableCategories"
                  :key="cat"
                  :label="cat"
                  :value="cat"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="关联服务表单" required>
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
              <el-input v-model="form.name" placeholder="例如：搬家服务合同" />
            </el-form-item>

            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio-button label="draft">草稿</el-radio-button>
                <el-radio-button label="published">已发布</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>

        <!-- Clauses Builder -->
        <draggable
          v-model="clauses"
          item-key="id"
          handle=".clause-handle"
          class="space-y-4"
        >
          <template #item="{ element: clause, index: idx }">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <el-icon class="clause-handle cursor-move text-gray-400 mr-1"><Rank /></el-icon>
                  <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                    {{ idx + 1 }}
                  </div>
                  <el-input
                    v-model="clause.title"
                    placeholder="条款标题，如：第一条 服务内容"
                    style="width: 280px"
                  />
                </div>
                <el-button type="danger" link @click="removeClause(idx)">
                  <el-icon><Delete /></el-icon>
                  删除条款
                </el-button>
              </div>

              <el-input
                v-model="clause.content"
                type="textarea"
                :rows="4"
                placeholder="在此编写条款内容，可以使用右侧变量（如 {{party_a_name}}）"
                resize="none"
              />

              <!-- Quick Variable Insert -->
              <div class="flex flex-wrap gap-1.5 mt-3">
                <span class="text-xs text-gray-400">快速插入：</span>
                <el-tag
                  v-for="v in quickVars"
                  :key="v.key"
                  size="small"
                  class="cursor-pointer hover:bg-emerald-50 hover:border-emerald-300"
                  @click="insertToClause(clause, v.key)"
                >
                  {{ v.key }}
                </el-tag>
              </div>
            </div>
          </template>
        </draggable>

        <!-- Add Clause -->
        <el-button @click="addClause" class="w-full" size="large">
          <el-icon class="mr-1"><Plus /></el-icon>
          添加条款
        </el-button>
      </div>

      <!-- Right: Sidebar -->
      <div class="space-y-6">

        <!-- Preview -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">合同预览</h3>
            <el-switch v-model="showPreview" active-text="开启" inactive-text="关闭" inline-prompt />
          </div>

          <div v-if="showPreview" class="bg-gray-50 rounded-xl border border-gray-200 p-4 max-h-[60vh] overflow-y-auto">
            <div class="text-center mb-6">
              <h2 class="text-base font-bold">{{ form.name || '合同名称' }}</h2>
              <p class="text-xs text-gray-400 mt-1">合同编号：{{ previewContractNo }} | 日期：{{ previewCreatedAt }}</p>
            </div>
            <div v-if="clauses.length === 0" class="text-center py-8 text-gray-300 text-sm">暂无条款，请在左侧添加</div>
            <div v-for="(clause, idx) in clauses" :key="clause.id" class="mb-4">
              <p class="font-bold text-sm text-gray-800">{{ clause.title || `第${idx + 1}条` }}</p>
              <p class="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">{{ clause.content }}</p>
            </div>
            <div v-if="clauses.length > 0" class="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
              <span>甲方签名：__________</span>
              <span>乙方签名：__________</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3 mt-4">
            <el-button type="primary" class="w-full" :loading="saving" @click="saveContract">
              <el-icon class="mr-1"><Check /></el-icon>
              {{ isNew ? '创建合同' : '保存修改' }}
            </el-button>
            <el-button class="w-full" @click="$router.back()">取消</el-button>
          </div>
        </div>

        <!-- Variables Reference -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="font-bold text-gray-800 mb-3">可用变量</h3>
          <div class="text-xs text-gray-400 mb-3">点击可复制变量，粘贴到条款内容中</div>

          <div v-for="(group, idx) in variableGroups" :key="idx" class="mb-4">
            <div class="text-xs font-bold text-gray-500 uppercase mb-2">{{ group.title }}</div>
            <div class="space-y-1.5">
              <div
                v-for="v in group.vars"
                :key="v.key"
                class="flex items-center justify-between p-2 rounded bg-gray-50 cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 border border-transparent transition-colors"
                @click="copyToClipboard(v.key)"
              >
                <span class="font-mono text-xs text-emerald-600 font-bold">{{ v.key }}</span>
                <span class="text-xs text-gray-400">{{ v.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 class="font-bold text-blue-800 mb-2">💡 提示</h4>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• 拖动条款可以调整顺序</li>
            <li>• 使用变量让合同自动填入信息</li>
            <li>• 右侧"开启预览"可实时查看效果</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Rank, Check } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { contractsApi, formTemplatesApi } from '../../services/api'

const route = useRoute()
const router = useRouter()
const saving = ref(false)
const showPreview = ref(true)

const allFormTemplates = ref<any[]>([])
const selectedCategory = ref('')
const currentFormFields = ref<any[]>([])

const id = computed(() => route.params.id as string)
const isNew = computed(() => id.value === 'new')

// Contract form data
const form = reactive({
  name: '',
  status: 'draft',
  form_template_id: '' as string | null
})

// Clauses (structured contract content)
interface Clause {
  id: string
  title: string
  content: string
}
const clauses = ref<Clause[]>([
  { id: '_c1', title: '第一条 服务内容', content: '乙方（{{party_b_name}}）同意为甲方（{{party_a_name}}）提供服务，具体服务地点为 {{service_address}}。' },
  { id: '_c2', title: '第二条 费用及付款', content: '本合同总金额为 {{total_amount}} 加元，双方同意按约定方式付款。' },
  { id: '_c3', title: '第三条 双方权利义务', content: '甲乙双方应按本合同约定履行各自义务，任何一方不得无故违约。' },
])

const generateId = () => '_c' + Math.random().toString(36).substr(2, 9)

// Categories derived from form templates (text-based matching)
const availableCategories = computed(() => {
  const cats = allFormTemplates.value
    .map((t: any) => t.category)
    .filter((c: any) => c && c !== '')
  return [...new Set(cats)]
})

const filteredFormTemplates = computed(() => {
  if (!selectedCategory.value) return []
  return allFormTemplates.value.filter((t: any) => t.category === selectedCategory.value)
})

// Base variable groups
const baseVariableGroups = [
  {
    title: 'Contract Info',
    vars: [
      { key: '{{contract_no}}', desc: '合同编号' },
      { key: '{{created_at}}', desc: '签署日期' },
      { key: '{{total_amount}}', desc: '合同总金额' },
    ]
  },
  {
    title: 'Parties',
    vars: [
      { key: '{{party_a_name}}', desc: '甲方（客户）姓名' },
      { key: '{{party_a_phone}}', desc: '甲方联系电话' },
      { key: '{{party_b_name}}', desc: '乙方（服务商）名称' },
      { key: '{{party_b_phone}}', desc: '乙方联系电话' },
    ]
  },
  {
    title: 'Project Info',
    vars: [
      { key: '{{project_name}}', desc: '项目/服务名称' },
      { key: '{{service_address}}', desc: '服务地点' },
    ]
  }
]

const variableGroups = computed(() => {
  const groups = [...baseVariableGroups]
  if (currentFormFields.value.length > 0) {
    groups.push({
      title: '表单字段',
      vars: currentFormFields.value.map((f: any) => ({
        key: `{{field_${f.key}}}`,
        desc: f.label || f.key
      }))
    })
  }
  return groups
})

// Quick vars for inline insertion
// Preview placeholder strings (avoid TS treating them as Vue template expressions)
const previewContractNo = '{{contract_no}}'
const previewCreatedAt = '{{created_at}}'

const quickVars = computed(() => {
  const base = [
    { key: '{{party_a_name}}' },
    { key: '{{party_b_name}}' },
    { key: '{{total_amount}}' },
    { key: '{{service_address}}' },
    { key: '{{created_at}}' },
  ]
  const formVars = currentFormFields.value.slice(0, 3).map((f: any) => ({ key: `{{field_${f.key}}}` }))
  return [...base, ...formVars]
})

onMounted(async () => {
  try {
    const res = await formTemplatesApi.getAll({ type: 'custom' })
    allFormTemplates.value = res.templates || []
  } catch (e) {
    console.error('Failed to load form templates:', e)
  }

  if (!isNew.value) {
    try {
      const res = await contractsApi.getById(id.value)
      const data = res.template
      form.name = data.name
      form.status = data.status
      form.form_template_id = data.form_template_id

      // Load clauses from stored content JSON
      if (data.content) {
        try {
          const parsed = JSON.parse(data.content)
          if (Array.isArray(parsed)) {
            clauses.value = parsed.map((c: any) => ({ ...c, id: c.id || generateId() }))
          }
        } catch {
          // Legacy HTML content: show as single clause
          clauses.value = [{ id: generateId(), title: '合同内容', content: data.content }]
        }
      }

      // Restore category selection
      if (data.form_template_id) {
        const tpl = allFormTemplates.value.find((t: any) => t.id === data.form_template_id)
        if (tpl) {
          selectedCategory.value = tpl.category
          handleFormTemplateChange(data.form_template_id)
        }
      }
    } catch (error: any) {
      ElMessage.error('加载详情失败')
      router.back()
    }
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
  const tpl = allFormTemplates.value.find((t: any) => t.id === val)
  if (tpl && tpl.steps) {
    const fields: any[] = []
    tpl.steps.forEach((step: any) => {
      if (step.fields) fields.push(...step.fields)
    })
    currentFormFields.value = fields
  } else {
    currentFormFields.value = []
  }
}

const addClause = () => {
  clauses.value.push({
    id: generateId(),
    title: `第${clauses.value.length + 1}条 `,
    content: ''
  })
}

const removeClause = (idx: number) => {
  clauses.value.splice(idx, 1)
}

const insertToClause = (clause: Clause, variable: string) => {
  clause.content += variable
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(`已复制 ${text}`)
  }).catch(() => {
    ElMessage.info(`请手动复制: ${text}`)
  })
}

const saveContract = async () => {
  if (!form.name || !form.form_template_id) {
    ElMessage.warning('请填写合同名称并关联服务表单')
    return
  }
  if (clauses.value.length === 0) {
    ElMessage.warning('请至少添加一个合同条款')
    return
  }

  saving.value = true
  try {
    // Store clauses as JSON string in content field
    const payload = {
      ...form,
      content: JSON.stringify(clauses.value)
    }

    if (isNew.value) {
      await contractsApi.create(payload)
      ElMessage.success('合同创建成功')
    } else {
      await contractsApi.update(id.value, payload)
      ElMessage.success('合同更新成功')
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
