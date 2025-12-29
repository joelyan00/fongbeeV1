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
            <!-- List item template for future use -->
            <div v-for="service in services" :key="service.id" class="border p-4 rounded-lg flex justify-between">
                <div>{{ service.name }}</div>
                <el-tag>{{ service.status }}</el-tag>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Box, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('all')
const dateRange = ref('')
const services = ref<any[]>([]) // Currently empty matching the screenshot

const handleTabClick = (tab: any) => {
    console.log('Switch to', tab.props.name)
    // Fetch data logic here
}

const handleCreate = () => {
    ElMessage.info('创建服务功能开发中')
}
</script>

<style scoped>
/* Customize Tabs to match the clean look */
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
