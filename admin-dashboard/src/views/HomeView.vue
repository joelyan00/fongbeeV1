<template>
  <div class="p-6">
    <!-- Page Title -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">控制台</h1>
      <p class="text-gray-500 mt-1">数据概览与统计</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">今日新增需求</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ stats.todayRequests }}</p>
            <p class="text-emerald-500 text-sm mt-1">↑ 12% 较昨日</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <el-icon :size="24" class="text-blue-500"><Document /></el-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">待处理需求</p>
            <p class="text-3xl font-bold text-orange-500 mt-2">{{ stats.pendingRequests }}</p>
            <p class="text-gray-400 text-sm mt-1">需要尽快处理</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <el-icon :size="24" class="text-orange-500"><Clock /></el-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">活跃服务商</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ stats.activeProviders }}</p>
            <p class="text-emerald-500 text-sm mt-1">↑ 5 本周新增</p>
          </div>
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <el-icon :size="24" class="text-emerald-500"><User /></el-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">本月成交额</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">${{ stats.monthlyRevenue.toLocaleString() }}</p>
            <p class="text-emerald-500 text-sm mt-1">↑ 23% 较上月</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <el-icon :size="24" class="text-purple-500"><Money /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Recent Requests Chart Placeholder -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4">需求趋势 (近7天)</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <el-icon :size="48" class="text-gray-300 mb-2"><TrendCharts /></el-icon>
            <p class="text-gray-400">图表区域</p>
            <p class="text-gray-300 text-sm">可接入 ECharts</p>
          </div>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4">服务类型分布</h3>
        <div class="space-y-4">
          <div v-for="cat in categoryStats" :key="cat.name">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">{{ cat.name }}</span>
              <span class="text-gray-800 font-medium">{{ cat.count }} 单</span>
            </div>
            <el-progress :percentage="cat.percentage" :color="cat.color" :show-text="false" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Requests Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">最新服务需求</h3>
        <el-button type="primary" text @click="$router.push('/dashboard/requests')">查看全部</el-button>
      </div>
      <el-table :data="recentRequests" style="width: 100%">
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="service" label="服务类型" width="150" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="date" label="提交时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="$router.push(`/dashboard/requests/${row.id}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Document, Clock, User, Money, TrendCharts } from '@element-plus/icons-vue'

// Mock Stats Data
const stats = ref({
  todayRequests: 24,
  pendingRequests: 8,
  activeProviders: 156,
  monthlyRevenue: 45820
})

const categoryStats = ref([
  { name: '搬家服务', count: 45, percentage: 35, color: '#10b981' },
  { name: '家庭清洁', count: 38, percentage: 30, color: '#3b82f6' },
  { name: '家电维修', count: 25, percentage: 20, color: '#f59e0b' },
  { name: '装修服务', count: 12, percentage: 10, color: '#8b5cf6' },
  { name: '其他服务', count: 6, percentage: 5, color: '#6b7280' }
])

const recentRequests = ref([
  { id: 'REQ001', service: '搬家服务', user: '张先生', date: '2024-12-17 14:30', status: '待处理' },
  { id: 'REQ002', service: '家庭清洁', user: '李女士', date: '2024-12-17 13:15', status: '已派单' },
  { id: 'REQ003', service: '空调维修', user: '王先生', date: '2024-12-17 11:20', status: '进行中' },
  { id: 'REQ004', service: '搬家服务', user: '赵女士', date: '2024-12-17 10:00', status: '已完成' },
  { id: 'REQ005', service: '管道疏通', user: '刘先生', date: '2024-12-17 09:30', status: '待处理' }
])

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '待处理': 'warning',
    '已派单': 'primary',
    '进行中': '',
    '已完成': 'success',
    '已取消': 'info'
  }
  return map[status] || ''
}
</script>
