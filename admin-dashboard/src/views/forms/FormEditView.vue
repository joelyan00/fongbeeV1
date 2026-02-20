<template>
  <div class="p-6">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">控制台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/dashboard/forms' }">表单管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ isNewTemplate ? '新建模板' : '编辑模板' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form Builder -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Form Type Info Banner -->
        <div 
          class="rounded-xl p-4 border flex items-center gap-3"
          :class="template.type === 'standard' ? 'bg-blue-50 border-blue-200' : (template.type === 'provider_reg' ? 'bg-emerald-50 border-emerald-200' : (template.type === 'complex' ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'))"
        >
          <el-icon :size="24" :class="template.type === 'standard' ? 'text-blue-500' : (template.type === 'provider_reg' ? 'text-emerald-500' : (template.type === 'complex' ? 'text-purple-500' : 'text-orange-500'))">
            <component :is="template.type === 'standard' ? Briefcase : (template.type === 'provider_reg' ? Coordinate : (template.type === 'complex' ? Document : Edit))" />
          </el-icon>
          <div>
            <h4 class="font-bold" :class="template.type === 'standard' ? 'text-blue-800' : (template.type === 'provider_reg' ? 'text-emerald-800' : (template.type === 'complex' ? 'text-purple-800' : 'text-orange-800'))">
              {{ template.type === 'standard' ? '标准服务表单' : (template.type === 'provider_reg' ? '服务商注册表单' : (template.type === 'complex' ? '复杂定制表单' : '简单定制表单')) }}
            </h4>
            <p class="text-sm" :class="template.type === 'standard' ? 'text-blue-600' : (template.type === 'provider_reg' ? 'text-emerald-600' : (template.type === 'complex' ? 'text-purple-600' : 'text-orange-600'))">
              {{ template.type === 'standard' ? '此表单供服务商项目发布使用' : (template.type === 'provider_reg' ? '此表单供新服务商申请入驻时填写' : (template.type === 'complex' ? '此表单供用户提交复杂需求，支持草稿与合同签署' : '此表单供普通用户提交简单需求')) }}
            </p>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">基本信息</h3>
          <el-form :model="template" label-width="100px">
            <el-form-item label="表单类型">
              <el-tag :type="template.type === 'standard' ? 'primary' : (template.type === 'provider_reg' ? 'success' : (template.type === 'complex' ? 'danger' : 'warning'))" size="large">
                {{ template.type === 'standard' ? '标准服务表单' : (template.type === 'provider_reg' ? '服务商注册表单' : (template.type === 'complex' ? '复杂定制表单' : '简单定制表单')) }}
              </el-tag>
              <span class="text-sm text-gray-500 ml-2">
                (适用于: {{ template.type === 'provider_reg' ? '申请入驻的服务商' : (template.type === 'standard' ? '服务商发布' : '普通用户需求') }})
              </span>
            </el-form-item>
            <el-form-item label="绑定服务类别">
              <el-select v-model="template.category" placeholder="请选择该表单对应的服务类别" class="w-full">
                <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
              </el-select>
              <p class="text-xs text-gray-400 mt-1">用户在申请时选择此类别，将加载本表单内容</p>
            </el-form-item>
            
            <!-- Contract Template Selection for Complex Types -->
            <el-form-item v-if="template.type === 'complex'" label="关联合同模板">
              <el-select v-model="template.contract_template_id" placeholder="请选择合同模板 (发布时必填，草稿可跳过)" class="w-full" clearable>
                <el-option v-for="c in contractTemplates" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
              <p class="text-xs text-gray-400 mt-1">
                草稿阶段可暂不关联，<strong class="text-orange-500">发布前必须关联合同模板</strong>，用户提交需求后可查看并签署此合同
              </p>
            </el-form-item>

            <el-form-item label="模板名称">
              <el-input v-model="template.name" placeholder="如: 搬家服务" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="template.description" type="textarea" rows="2" placeholder="模板描述" />
            </el-form-item>
            <el-form-item v-if="template.type === 'custom'" label="报价消耗积分">
               <el-input-number v-model="template.quote_credit_cost" :min="0" :step="1" />
               <p class="text-xs text-gray-400 mt-1">服务商对此类需求进行报价时，将扣除设定的积分</p>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="template.active" active-text="启用" inactive-text="禁用" />
            </el-form-item>
          </el-form>
        </div>

        <!-- Steps -->
        <!-- Steps -->
        <draggable
          v-model="template.steps"
          item-key="_uId"
          handle=".step-handle"
          class="space-y-6"
        >
          <template #item="{ element: step, index: stepIndex }">
            <div 
              class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <el-icon class="step-handle cursor-move text-gray-400 mr-2"><Rank /></el-icon>
                  <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    {{ stepIndex + 1 }}
                  </div>
                  <el-input v-model="step.title" placeholder="步骤标题" style="width: 200px" />
                </div>
                <el-button type="danger" link @click="removeStep(stepIndex)">
                  <el-icon><Delete /></el-icon>
                  删除步骤
                </el-button>
              </div>
              
              <el-input v-model="step.description" placeholder="步骤描述 (可选)" class="mb-4" />

              <!-- Fields -->
              <div class="space-y-3">
                <draggable
                  v-model="step.fields"
                  item-key="key"
                  handle=".field-handle"
                  group="fields"
                  class="space-y-3"
                >
                  <template #item="{ element: field, index: fieldIndex }">
                    <div 
                      class="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <!-- Field Main Config -->
                      <div class="flex items-center gap-3 w-full">
                        <el-icon class="field-handle cursor-move text-gray-400"><Rank /></el-icon>
                        <el-input v-model="field.label" placeholder="字段名称" style="width: 150px" />
                        <el-select v-model="field.type" placeholder="类型" style="width: 120px">
                          <el-option label="文本" value="text" />
                          <el-option label="手机号码" value="phone" />
                          <el-option label="数字" value="number" />
                          <el-option label="货币" value="currency" />
                          <el-option label="日期" value="date" />
                          <el-option label="时间" value="time" />
                          <el-option label="下拉选择" value="select" />
                          <el-option label="单选" value="radio" />
                          <el-option label="多选" value="checkbox" />
                          <el-option label="多行文本" value="textarea" />
                          <el-option label="图片上传" value="image" />
                          <el-option label="地址" value="address" />
                          <el-option label="工作时间" value="working_hours" />
                        </el-select>
                        <el-input v-model="field.placeholder" placeholder="占位符 (提示语)" style="width: 180px" />
                        <el-input v-model="field.default_value" placeholder="默认值 (预填内容)" style="width: 180px">
                          <template #prefix>
                            <el-icon class="text-gray-400"><EditPen /></el-icon>
                          </template>
                        </el-input>
                        <el-checkbox v-model="field.required">必填</el-checkbox>
                        <el-button type="danger" link @click="removeField(stepIndex, fieldIndex)" class="ml-auto">
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>

                      <!-- Options Editor -->
                      <div v-if="['select', 'radio', 'checkbox'].includes(field.type)" class="pl-8 w-full">
                        <div class="bg-white p-3 rounded border border-gray-200">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-xs text-gray-500 font-bold">选项配置</span>
                            <el-button size="small" type="primary" link @click="addOption(field)">
                              + 添加选项
                            </el-button>
                          </div>
                          
                          <div v-if="!field.options || field.options.length === 0" class="text-xs text-gray-400 text-center py-2">
                            暂无选项，请添加
                          </div>

                          <div v-for="(opt, optIndex) in field.options" :key="optIndex" class="flex gap-2 mb-2 items-center">
                            <el-input v-model="opt.label" placeholder="显示文本" size="small" style="width: 150px">
                              <template #prefix>名</template>
                            </el-input>
                            <el-input v-model="opt.value" placeholder="内部值" size="small" style="width: 150px">
                              <template #prefix>值</template>
                            </el-input>
                            <el-button type="danger" link size="small" @click="removeOption(field, optIndex)">
                              <el-icon><Delete /></el-icon>
                            </el-button>
                          </div>
                        </div>
                      </div>

                      <!-- Currency Selector -->
                      <div v-if="field.type === 'currency'" class="pl-8 w-full">
                        <div class="bg-white p-3 rounded border border-gray-200">
                          <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-500 font-bold">货币类型</span>
                            <el-select v-model="field.currency" placeholder="选择货币" size="small" style="width: 150px">
                              <el-option label="加元 (CAD)" value="CAD" />
                              <el-option label="美元 (USD)" value="USD" />
                              <el-option label="人民币 (CNY)" value="CNY" />
                              <el-option label="欧元 (EUR)" value="EUR" />
                              <el-option label="英镑 (GBP)" value="GBP" />
                              <el-option label="日元 (JPY)" value="JPY" />
                            </el-select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>

              <el-button class="mt-4" @click="addField(stepIndex)">
                <el-icon class="mr-1"><Plus /></el-icon>
                添加字段
              </el-button>
            </div>
          </template>
        </draggable>

        <el-button @click="addStep" class="w-full" size="large">
          <el-icon class="mr-1"><Plus /></el-icon>
          添加步骤
        </el-button>
      </div>

      <!-- Preview & Actions -->
      <div class="space-y-6">
        <!-- Preview Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">实时预览</h3>
            <el-switch
              v-model="showPreview"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
            />
          </div>
          
          
          <div v-if="showPreview" class="preview-container bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[500px] overflow-y-auto max-h-[70vh]">
            <!-- Phone Header Mock -->
            <div class="w-full h-6 bg-gray-200 rounded-t-lg mb-4 flex items-center px-3 gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            </div>

            <div v-if="template.steps.length === 0" class="text-center py-20 text-gray-400">
              <el-icon :size="48" class="mb-2 opacity-20"><View /></el-icon>
              <p>暂无步骤，请在左侧添加</p>
            </div>

            <div v-else class="space-y-6">
              <!-- Step Indicator (Mock) -->
              <div v-if="template.steps.length > 1" class="flex items-center justify-between px-2 mb-6">
                <div v-for="(s, i) in template.steps" :key="i" class="flex flex-col items-center gap-1">
                  <div 
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    :class="i === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'"
                  >
                    {{ i + 1 }}
                  </div>
                  <text class="text-[10px] text-gray-400">{{ s.title }}</text>
                </div>
              </div>

              <!-- Current Step Preview (Step 1) -->
              <div class="space-y-5">
                <div class="mb-2">
                  <h4 class="font-bold text-gray-900">{{ template.steps[0].title }}</h4>
                  <p v-if="template.steps[0].description" class="text-xs text-gray-500 mt-1">{{ template.steps[0].description }}</p>
                </div>

                <div v-for="(field, fIdx) in template.steps[0].fields" :key="fIdx" class="preview-field">
                  <label class="block text-sm font-bold text-gray-700 mb-2">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500 ml-1">*</span>
                  </label>

                  <!-- Text/Number/Date Input -->
                  <div v-if="['text', 'number', 'date'].includes(field.type)" class="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 flex items-center text-gray-400 text-sm">
                    {{ field.placeholder || '请输入' + field.label }}
                  </div>

                  <!-- Phone Input -->
                  <div v-else-if="field.type === 'phone'" class="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 flex items-center gap-2">
                    <span class="text-gray-600 text-sm">+1</span>
                    <span class="text-gray-400 text-sm">{{ field.placeholder || '请输入手机号码' }}</span>
                  </div>

                  <!-- Time Input -->
                  <div v-else-if="field.type === 'time'" class="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 flex items-center justify-between">
                    <span class="text-gray-400 text-sm">{{ field.placeholder || '请选择时间' }}</span>
                    <el-icon class="text-gray-400"><Clock /></el-icon>
                  </div>

                  <!-- Currency Input -->
                  <div v-else-if="field.type === 'currency'" class="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 flex items-center gap-2">
                    <span class="text-gray-600 text-sm font-bold">{{ field.currency || 'CAD' }}</span>
                    <span class="text-gray-400 text-sm">{{ field.placeholder || '请输入金额' }}</span>
                  </div>

                  <!-- Textarea -->
                  <div v-else-if="field.type === 'textarea'" class="w-full h-20 bg-white border border-gray-200 rounded-lg p-3 text-gray-400 text-sm">
                    {{ field.placeholder || '请输入内容' }}
                  </div>

                  <!-- Select -->
                  <div v-else-if="field.type === 'select'" class="w-full h-10 bg-white border border border-gray-200 rounded-lg px-3 flex items-center justify-between text-gray-400 text-sm">
                    <span>{{ field.placeholder || '请选择' }}</span>
                    <el-icon><ArrowDown /></el-icon>
                  </div>

                  <!-- Radio/Checkbox -->
                  <div v-else-if="['radio', 'checkbox'].includes(field.type)" class="flex flex-wrap gap-2">
                    <div 
                      v-for="(opt, oIdx) in field.options" 
                      :key="oIdx"
                      class="px-3 py-1.5 rounded-lg border border border-gray-200 text-xs text-gray-600 bg-white"
                    >
                      {{ opt.label }}
                    </div>
                  </div>

                  <!-- Image -->
                  <div v-else-if="field.type === 'image'" class="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                    <el-icon :size="24" class="mb-1"><Picture /></el-icon>
                    <span class="text-xs">点击上传图片</span>
                  </div>

                  <!-- Address -->
                  <div v-else-if="field.type === 'address'" class="space-y-2">
                    <div class="w-full h-10 bg-white border border border-gray-200 rounded-lg px-3 flex items-center text-gray-400 text-sm">详细地址</div>
                    <div class="flex gap-2">
                      <div class="flex-1 h-10 bg-white border border border-gray-200 rounded-lg px-3 flex items-center text-gray-400 text-sm">城市</div>
                      <div class="flex-1 h-10 bg-white border border border-gray-200 rounded-lg px-3 flex items-center text-gray-400 text-sm">省份</div>
                    </div>
                  </div>
                </div>

                <div v-if="template.steps[0].fields.length === 0" class="text-center py-10 text-gray-300 italic text-sm">
                  此步骤暂无任何字段
                </div>
              </div>

              <!-- Submit Button Mock -->
              <div class="pt-6">
                <div 
                  class="w-full h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
                  :style="{ backgroundColor: template.color || '#10b981' }"
                >
                  {{ template.steps.length > 1 ? '下一步' : '提交' }}
                </div>
              </div>
            </div>
          </div>
          <!-- Placeholder removed as per request: gray area hidden when preview closed -->
          <!-- <div v-else class="flex flex-col items-center justify-center py-32 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
            <el-icon :size="48" class="mb-4 opacity-30"><View /></el-icon>
            <p>预览已关闭</p>
            <el-button size="small" type="primary" link @click="showPreview = true" class="mt-2">重新开启</el-button>
          </div> -->
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">操作</h3>
          
          <!-- Status Badge -->
          <div class="mb-4 p-3 rounded-lg" :class="template.status === 'published' ? 'bg-green-50' : 'bg-yellow-50'">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium" :class="template.status === 'published' ? 'text-green-700' : 'text-yellow-700'">
                当前状态：{{ template.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </div>
          </div>
          
          <div class="space-y-3">
            <el-button type="primary" class="w-full" :loading="saving" @click="saveTemplate">
              <el-icon class="mr-1"><Check /></el-icon>
              {{ isNewTemplate ? '创建模板' : '保存修改' }}
            </el-button>
            <el-button 
              type="success" 
              class="w-full" 
              :disabled="isNewTemplate || template.status === 'published'"
              @click="publishTemplate"
            >
              <el-icon class="mr-1"><Check /></el-icon>
              {{ template.status === 'published' ? '已发布' : '发布模板' }}
            </el-button>
            <el-button class="w-full" disabled>
              <el-icon class="mr-1"><View /></el-icon>
              右侧实时预览
            </el-button>
            <el-button class="w-full" @click="$router.back()">取消</el-button>
          </div>
        </div>

        <!-- Tips -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 class="font-bold text-blue-800 mb-2">💡 提示</h4>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• 拖动字段可以调整顺序</li>
            <li>• 地址类型会自动生成完整地址表单</li>
            <li>• 修改后需要保存才能生效</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Delete, Rank, View, Check, Briefcase, Edit, Coordinate, ArrowDown, Picture, Clock, Document, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formTemplatesApi, categoriesApi, contractsApi } from '../../services/api'

import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const showPreview = ref(false)

// Make templateId reactive to route changes
const templateId = computed(() => route.params.id as string)

// Check if creating a new template
const isNewTemplate = computed(() => templateId.value === 'new')

// Get form type from URL query parameter (for new templates)
const formType = computed(() => {
  if (isNewTemplate.value) {
    const type = route.query.type as string
    return type === 'provider_reg' ? 'provider_reg' : (type === 'custom' ? 'custom' : (type === 'complex' ? 'complex' : 'standard'))
  }
  return template.type || 'custom'
})

// Helper for unique ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9)

const categories = ref<string[]>([])
const contractTemplates = ref<any[]>([]) // Store contract templates

// Template data
const template = reactive({
  id: '',
  name: '',
  description: '',
  active: true,
  status: 'draft' as 'draft' | 'published' | 'archived',
  type: 'custom' as 'standard' | 'custom' | 'complex' | 'provider_reg',
  category: '' as string,
  contract_template_id: '' as string, // Contract Template ID
  color: '#10b981',
  quote_credit_cost: 0,
  steps: [
    {
      _uId: generateId(), // Internal stable ID for drag key
      title: '基本信息',
      description: '',
      fields: [] as any[]
    }
  ]
})

// Load existing template if editing
onMounted(async () => {
  // Load categories (required)
  try {
      const catRes = await categoriesApi.getAll();
      categories.value = catRes.categories.map(c => c.name)
  } catch (e) {
      console.error('Failed to load categories', e)
  }

  // Load contracts (optional - may not exist yet)
  try {
      const contractRes = await contractsApi.getAll()
      contractTemplates.value = contractRes.templates || []
  } catch (e) {
      console.warn('Failed to load contracts (table may not exist yet)', e)
      contractTemplates.value = []
  }

  if (!isNewTemplate.value) {
    loading.value = true
    try {
      const response = await formTemplatesApi.getById(templateId.value)
      const t = response.template
      template.id = t.id
      template.name = t.name || ''
      template.description = t.description || ''
      template.status = t.status || 'draft'
      template.type = t.type || 'custom'
      template.category = t.category || ''
      template.contract_template_id = t.contract_template_id || '' // Load contract ID
      template.color = t.color || '#10b981'
      template.quote_credit_cost = t.quote_credit_cost || 0
      template.steps = (t.steps || []).map((s: any) => ({
          ...s,
          _uId: generateId() // Ensure ID
      }))
      if (template.steps.length === 0) {
           template.steps.push({ _uId: generateId(), title: '基本信息', description: '', fields: [] })
      }
      template.active = t.status === 'published'
    } catch (error: any) {
      ElMessage.error(error.message || '加载模板失败')
    } finally {
      loading.value = false
    }
  } else {
    // New template - set type from query
    template.type = formType.value as 'standard' | 'custom' | 'complex' | 'provider_reg'
  }
})

const addStep = () => {
  template.steps.push({
    _uId: generateId(),
    title: '新步骤',
    description: '',
    fields: []
  })
}

const removeStep = (index: number) => {
  template.steps.splice(index, 1)
}

const addField = (stepIndex: number) => {
  template.steps[stepIndex].fields.push({
    key: 'field_' + Date.now(),
    label: '新字段',
    type: 'text',
    placeholder: '',
    required: false,
    options: []
  })
}

const removeField = (stepIndex: number, fieldIndex: number) => {
  template.steps[stepIndex].fields.splice(fieldIndex, 1)
}

const addOption = (field: any) => {
  if (!field.options) field.options = []
  field.options.push({ label: '新选项', value: 'option_' + Date.now() })
}

const removeOption = (field: any, index: any) => {
  field.options.splice(index, 1)
}

// Save template (create or update)
const saveTemplate = async () => {
  if (!template.name) {
    ElMessage.warning('请输入模板名称')
    return
  }
  
  saving.value = true
  try {
    const data = {
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      contract_template_id: template.contract_template_id || null, // include in save
      color: template.color,
      quote_credit_cost: template.quote_credit_cost,
      steps: template.steps
    }
    
    if (isNewTemplate.value) {
      // Create new
      const response = await formTemplatesApi.create(data)
      template.id = response.template.id
      ElMessage.success('模板创建成功')
      // Redirect to edit page
      router.replace(`/dashboard/forms/${response.template.id}`)
    } else {
      // Update existing
      await formTemplatesApi.update(templateId.value, data)
      ElMessage.success('模板保存成功')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// Publish template
const publishTemplate = async () => {
  if (isNewTemplate.value) {
    ElMessage.warning('请先保存模板')
    return
  }

  // For complex forms, contract template must be linked before publishing
  if (template.type === 'complex' && !template.contract_template_id) {
    ElMessage.error('复杂定制表单发布前必须关联合同模板，请先创建并关联对应的合同模板')
    return
  }
  
  try {
    await ElMessageBox.confirm('发布后前端用户将可以使用此表单，确认发布？', '确认发布', {
      confirmButtonText: '确认发布',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    await formTemplatesApi.publish(templateId.value)
    template.status = 'published'
    template.active = true
    ElMessage.success('模板已发布！前端用户现在可以使用了')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发布失败')
    }
  }
}
</script>
