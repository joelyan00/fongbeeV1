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
                    <el-form-item label="服务标题" required>
                        <el-input v-model="formData.title" placeholder="例如：专业家庭保洁2小时" />
                    </el-form-item>
                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="价格 (元)" required>
                            <el-input v-model="formData.price" type="number" placeholder="0.00" />
                        </el-form-item>
                        <el-form-item label="单位" required>
                             <el-input v-model="formData.unit" placeholder="次/小时" />
                        </el-form-item>
                    </div>
                    <el-form-item label="服务描述">
                        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="描述服务内容..." />
                    </el-form-item>
                </el-form>
                <div class="mt-4 flex justify-between">
                    <el-button link @click="activeStep = 1">返回上一步</el-button>
                </div>
            </div>
        </div>

        <template #footer>
            <div v-if="activeStep === 2">
                <el-button @click="createDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">提交审核</el-button>
            </div>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Box, Plus, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { categoriesApi, formTemplatesApi, submissionsApi } from '../../services/api'

// Main View State
const activeTab = ref('all')
const dateRange = ref('')
const services = ref<any[]>([])

// Create Modal State
const createDialogVisible = ref(false)
const activeStep = ref(0)
const loading = ref(false)
const submitting = ref(false)

const categories = ref<any[]>([])
const templates = ref<any[]>([])
const selectedCategory = ref<any>(null)
const selectedTemplate = ref<any>(null)

const formData = ref({
    title: '',
    price: '',
    unit: '次',
    description: ''
})

const handleTabClick = (tab: any) => {
    console.log('Switch to', tab.props.name)
}

const handleCreate = async () => {
    createDialogVisible.value = true
    activeStep.value = 0
    // Load categories
    loading.value = true
    try {
        const res = await categoriesApi.getAll()
        // Filter logic could go here based on user profile
        categories.value = res.categories || []
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
