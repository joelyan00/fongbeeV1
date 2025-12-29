<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="bg-white p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 class="text-lg font-bold text-gray-800">任务大厅</h2>
      
      <div class="flex flex-col md:flex-row md:items-center gap-4 text-sm">
        <div class="text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          当前服务区域: <span class="font-medium text-gray-700">明月街206号</span>
          <span class="mx-2">|</span>
          服务范围: <span class="font-medium text-gray-700">10公里</span>
          <button class="ml-3 text-red-500 hover:text-red-600 hover:underline">修改区域</button>
        </div>
        
        <el-select v-model="categoryFilter" placeholder="项目类别筛选" class="w-40">
          <el-option label="全部" value="all" />
          <el-option label="家庭清洁" value="cleaning" />
          <el-option label="维修服务" value="repair" />
        </el-select>
      </div>
    </div>

    <!-- Task List -->
    <div class="flex-1 overflow-y-auto bg-white p-6">
      <div class="max-w-5xl mx-auto divide-y divide-gray-100">
        
        <!-- Task Item -->
        <div v-for="task in tasks" :key="task.id" class="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors px-4 rounded-lg -mx-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <a href="#" class="text-blue-600 font-bold hover:underline truncate">{{ task.title }}</a>
              <span 
                class="px-2 py-0.5 text-xs rounded"
                :class="task.type === 'simple' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
              >
                {{ task.type === 'simple' ? '简单任务' : '复杂任务' }}
              </span>
            </div>
            
            <div class="flex items-center gap-6 text-sm text-gray-500 mb-2">
              <span>发布时间: {{ task.time }}</span>
              <span class="truncate">所在位置: {{ task.location }}</span>
            </div>
            
            <div class="text-sm text-gray-600 truncate">
              客户留言: {{ task.message }}
            </div>
          </div>

          <div class="flex md:flex-col items-center justify-between md:items-end gap-4 md:w-48 whitespace-nowrap">
            <div class="text-orange-500 text-sm font-medium">
                {{ task.statusText }}
            </div>
            
            <div class="flex flex-col items-end gap-2">
                <span v-if="task.hasQuoted" class="text-xs text-blue-600 font-medium">我已报价</span>
                <el-button type="primary" size="small">查看详情</el-button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="tasks.length === 0" class="text-center py-20 text-gray-400">
           暂无匹配的任务
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const categoryFilter = ref('all')

const tasks = ref([
    {
        id: 1,
        title: '项目名称',
        type: 'simple',
        time: '2025/07/28 17:40',
        location: '世博路1131号门市',
        message: '寻找一名清洁工，每周打扫一次出租屋，4间卧室, 3间浴室...',
        statusText: '寻找服务商中',
        hasQuoted: false
    },
    {
        id: 2,
        title: '项目名称',
        type: 'complex',
        time: '2025/07/28 17:40',
        location: '世博路1131号门市',
        message: '寻找一名清洁工，每周打扫一次出租屋，4间卧室, 3间浴室...',
        statusText: '寻找服务商中',
        hasQuoted: true
    },
    // Add more mock data if needed
])
</script>
