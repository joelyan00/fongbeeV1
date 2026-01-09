<template>
  <div class="h-full flex flex-col">
    <!-- Header / Tools -->
    <div class="bg-white p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Tabs -->
      <el-tabs v-model="activeTab" class="provider-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="仓库中(0)" name="draft" />
        <el-tab-pane label="审核中(0)" name="pending" />
        <el-tab-pane label="已上架(0)" name="published" />
        <el-tab-pane label="审核未通过(0)" name="rejected" />
      </el-tabs>

      <!-- Right Actions -->
      <div class="flex items-center gap-4">
        <el-button type="primary" link @click="handleCreate">
            <el-icon class="mr-1"><Plus /></el-icon> 创建标准服务
        </el-button>
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            class="!w-60"
        />
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 px-6 overflow-y-auto bg-white m-4 rounded-xl shadow-sm relative">
        <!-- Empty State -->
        <div v-if="services.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <el-icon :size="64" class="mb-4 text-gray-300"><Box /></el-icon>
            <div class="text-sm">暂无服务数据</div>
        </div>

        <!-- Service List (Hidden if empty) -->
        <div v-else class="py-6 space-y-4">
            <div v-for="service in services" :key="service.id" class="border p-4 rounded-lg flex justify-between">
                <div>{{ service.name }}</div>
                <el-tag>{{ service.status }}</el-tag>
            </div>
        </div>
    </div>

    <!-- Create Service Dialog -->
    <el-dialog
        v-model="createDialogVisible"
        title="创建标准服务"
        width="600px"
        destroy-on-close
    >
        <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 20px;">
            <el-step title="选择类目" />
            <el-step title="选择模板" />
            <el-step title="填写详情" />
        </el-steps>

        <div v-loading="loading" class="min-h-[300px]">
            <!-- Step 1: Categories -->
            <div v-if="activeStep === 0">
                <div class="grid grid-cols-2 gap-4">
                    <div 
                        v-for="cat in categories" 
                        :key="cat.id"
                        class="border p-4 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 flex justify-between items-center transition-all"
                        @click="handleCategorySelect(cat)"
                    >
                        <span>{{ cat.name }}</span>
                        <el-icon><ArrowRight /></el-icon>
                    </div>
                    <div v-if="categories.length === 0" class="col-span-2 text-center text-gray-400 py-10">
                        暂无可用服务类目
                    </div>
                </div>
            </div>

            <!-- Step 2: Templates -->
            <div v-if="activeStep === 1">
                <div class="mb-2 text-sm text-gray-500">已选类目: <span class="font-bold text-gray-800">{{ selectedCategory?.name }}</span></div>
                <div class="space-y-3">
                    <div 
                        v-for="tmpl in templates"
                        :key="tmpl.id"
                        class="border p-4 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                        @click="handleTemplateSelect(tmpl)"
                    >
                        <div class="font-bold mb-1">{{ tmpl.name }}</div>
                        <div class="text-xs text-gray-500">{{ tmpl.description }}</div>
                    </div>
                </div>
                <div class="mt-4">
                    <el-button link @click="activeStep = 0">返回上一步</el-button>
                </div>
            </div>

            <!-- Step 3: Form -->
            <div v-if="activeStep === 2">
                <el-form label-position="top">
                    <!-- Dynamic Steps & Fields -->
                    <template v-if="selectedTemplate?.steps">
                        <div v-for="(step, sIdx) in selectedTemplate.steps" :key="sIdx" class="mb-6">
                            <h4 v-if="step.title" class="font-bold text-gray-800 mb-3">{{ step.title }}</h4>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <template v-for="field in step.fields" :key="field.key">
                                    <div :class="{ 'col-span-2': ['address', 'textarea', 'radio', 'checkbox', 'image'].includes(field.type) || field.key === 'title' }">
                                        <el-form-item :label="field.label" :required="field.required">
                                            
                                            <!-- Text / Number -->
                                            <el-input 
                                                v-if="['text', 'number'].includes(field.type)"
                                                v-model="formData[field.key]" 
                                                :type="field.type === 'number' ? 'number' : 'text'"
                                                :placeholder="field.fill_by === 'customer' ? '由用户填写' : field.placeholder"
                                                :disabled="field.fill_by === 'customer'"
                                            />

                                            <!-- Textarea -->
                                            <el-input 
                                                v-if="field.type === 'textarea'"
                                                v-model="formData[field.key]" 
                                                type="textarea"
                                                :rows="3"
                                                :placeholder="field.fill_by === 'customer' ? '由用户填写' : field.placeholder"
                                                :disabled="field.fill_by === 'customer'"
                                            />

                                            <!-- Select -->
                                            <el-select 
                                                v-if="field.type === 'select'"
                                                v-model="formData[field.key]" 
                                                :placeholder="field.fill_by === 'customer' ? '由用户填写' : (field.placeholder || '请选择')"
                                                class="w-full"
                                                :disabled="field.fill_by === 'customer'"
                                            >
                                                <el-option 
                                                    v-for="opt in field.options" 
                                                    :key="typeof opt === 'string' ? opt : opt.value" 
                                                    :label="typeof opt === 'string' ? opt : opt.label" 
                                                    :value="typeof opt === 'string' ? opt : opt.value" 
                                                />
                                            </el-select>

                                            <!-- Radio -->
                                            <el-radio-group 
                                                v-if="field.type === 'radio'"
                                                v-model="formData[field.key]"
                                                :disabled="field.fill_by === 'customer'"
                                            >
                                                <el-radio 
                                                    v-for="opt in field.options" 
                                                    :key="typeof opt === 'string' ? opt : opt.value" 
                                                    :label="typeof opt === 'string' ? opt : opt.value"
                                                >
                                                    {{ typeof opt === 'string' ? opt : opt.label }}
                                                </el-radio>
                                            </el-radio-group>

                                            <!-- Checkbox (Single) -->
                                            <el-checkbox 
                                                v-if="field.type === 'checkbox'"
                                                v-model="formData[field.key]"
                                                :label="field.placeholder || field.label"
                                                :disabled="field.fill_by === 'customer'"
                                            />

                                            <!-- City Select -->
                                            <el-select 
                                                v-if="field.type === 'city_select'"
                                                v-model="formData[field.key]" 
                                                multiple
                                                :placeholder="field.fill_by === 'customer' ? '由用户填写' : '请选择服务城市'"
                                                class="w-full"
                                                :disabled="field.fill_by === 'customer'"
                                            >
                                                <el-option 
                                                    v-for="city in cities" 
                                                    :key="city.id" 
                                                    :label="city.name" 
                                                    :value="city.id" 
                                                />
                                            </el-select>

                                        </el-form-item>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                    <div v-else class="text-center text-gray-400 py-10">
                        模板未定义字段
                    </div>
                </el-form>
                <div class="mt-4 flex justify-between">
                    <el-button link @click="activeStep = 1">返回上一步</el-button>
                </div>
            </div>
        </div>

        <template #footer>
            <div v-if="activeStep === 2" class="flex justify-end gap-3">
                <el-button @click="createDialogVisible = false">取消</el-button>
                <el-button type="info" plain @click="showPreview = true">
                    <el-icon class="mr-1"><View /></el-icon>预览
                </el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">提交审核</el-button>
            </div>
        </template>
    </el-dialog>

    <!-- Preview Dialog -->
    <el-dialog
        v-model="showPreview"
        title="服务预览"
        width="480px"
        destroy-on-close
    >
        <div class="text-center text-xs text-gray-400 mb-4">以下是用户将在前端看到的效果</div>
        
        <!-- User-Facing Service Card Preview -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <!-- Image/Icon Header -->
            <div class="h-40 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <el-icon :size="64" class="text-white/80"><Box /></el-icon>
            </div>
            
            <!-- Content -->
            <div class="p-5">
                <h3 class="text-lg font-bold text-gray-900 mb-2">{{ formData.title || '服务标题' }}</h3>
                
                <div class="flex items-baseline gap-1 mb-3">
                    <span class="text-2xl font-bold text-emerald-600">¥{{ formData.price || '0' }}</span>
                    <span class="text-sm text-gray-500">/ {{ formData.unit || '次' }}</span>
                </div>
                
                <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ formData.description || '暂无描述' }}</p>
                
                <!-- Provider Info -->
                <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <el-icon class="text-emerald-600"><User /></el-icon>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900 flex items-center gap-1">
                            {{ providerName }}
                            <span class="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">已认证</span>
                        </div>
                        <div class="text-xs text-gray-500">{{ selectedCategory?.name || '服务类目' }}</div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <el-button @click="showPreview = false">关闭预览</el-button>
            <el-button type="primary" @click="showPreview = false; handleSubmit()">确认提交</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Plus, ArrowRight, View, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { categoriesApi, formTemplatesApi, submissionsApi, citiesApi } from '../../services/api'

// Main View State
const activeTab = ref('all')
const dateRange = ref('')
const services = ref<any[]>([])

// Create Modal State
const createDialogVisible = ref(false)
const activeStep = ref(0)
const loading = ref(false)
const submitting = ref(false)
const showPreview = ref(false)

const categories = ref<any[]>([])
const cities = ref<any[]>([])
const templates = ref<any[]>([])
const selectedCategory = ref<any>(null)
const selectedTemplate = ref<any>(null)

const formData = ref<any>({})

// Get provider name from localStorage
const providerName = computed(() => {
    try {
        const userStr = localStorage.getItem('admin_user')
        if (userStr) {
            const user = JSON.parse(userStr)
            return user.name || user.company_name || '服务商'
        }
    } catch {}
    return '服务商'
})

const handleTabClick = (tab: any) => {
    console.log('Switch to', tab.props.name)
}

const handleCreate = async () => {
    createDialogVisible.value = true
    activeStep.value = 0
    formData.value = {} // Reset form
    // Load categories & cities
    loading.value = true
    try {
        const [catRes, cityRes] = await Promise.all([
            categoriesApi.getAll(),
            citiesApi.getActive()
        ])
        categories.value = catRes.categories || []
        cities.value = cityRes || []
    } catch (e) {
        console.error(e)
        // Mock fallback
        categories.value = [
            { id: '1', name: '清洁服务' },
            { id: '2', name: '接送服务' }
        ]
    } finally {
        loading.value = false
    }
}

const handleCategorySelect = async (cat: any) => {
    selectedCategory.value = cat
    loading.value = true
    try {
        const res = await formTemplatesApi.getPublished('standard', cat.id)
        templates.value = res.templates || []
        activeStep.value = 1
    } catch (e) {
        console.error(e)
        // Mock fallback
        templates.value = [
            { id: 't1', name: `${cat.name} - 标准模板`, description: '基础服务模板' }
        ]
        activeStep.value = 1
    } finally {
        loading.value = false
    }
}

const handleTemplateSelect = (tmpl: any) => {
    selectedTemplate.value = tmpl
    activeStep.value = 2
}

const handleSubmit = async () => {
    if (!formData.value.title || !formData.value.price) {
        ElMessage.warning('请填写完整信息')
        return
    }
    
    submitting.value = true
    try {
        await submissionsApi.create({
            templateId: selectedTemplate.value.id,
            formData: {
                ...formData.value,
                categoryId: selectedCategory.value.id,
                type: 'standard_service'
            }
        })
        ElMessage.success('提交成功，等待审核')
        createDialogVisible.value = false
        // Refresh list...
    } catch (e: any) {
        console.error(e)
        ElMessage.error(e.message || '提交失败')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
:deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: transparent;
}
:deep(.el-tabs__item) {
    font-size: 14px;
    color: #6b7280;
    font-weight: normal;
}
:deep(.el-tabs__item.is-active) {
    color: #2563eb;
    font-weight: bold;
}
:deep(.el-tabs__active-bar) {
    background-color: #2563eb;
}
</style>
