<template>
  <view class="min-h-screen bg-gray-900 pt-custom">
    <!-- Header -->
    <view class="flex flex-row items-center px-4 py-3 bg-gray-800 sticky top-0 z-10">
      <view @click="goBack" class="w-10 h-10 flex items-center justify-center">
        <AppIcon name="arrow-left" :size="20" color="#ffffff" />
      </view>
      <text class="text-white font-bold text-lg ml-2">标准服务管理</text>
    </view>

    <!-- Filter Tabs -->
    <view class="px-4 py-3">
      <scroll-view scroll-x class="whitespace-nowrap">
        <view class="flex flex-row gap-2">
          <view 
            v-for="tab in statusTabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['px-3 py-2 rounded-lg text-sm border', 
              activeTab === tab.key 
                ? 'bg-teal-600 text-white border-teal-600' 
                : 'bg-gray-800 text-gray-400 border-gray-700']"
          >
            <text>{{ tab.label }}({{ getTabCount(tab.key) }})</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Service List -->
    <scroll-view scroll-y class="flex-1 px-4" style="height: calc(100vh - 200px);">
      <view v-if="loading" class="flex items-center justify-center py-20">
        <view class="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></view>
      </view>

      <view v-else-if="filteredServices.length === 0" class="flex flex-col items-center justify-center py-20">
        <view class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <AppIcon name="package" :size="40" color="#4b5563" />
        </view>
        <text class="text-gray-500">暂无服务数据</text>
        <text class="text-gray-600 text-sm mt-2">点击下方按钮创建您的第一个服务</text>
      </view>

      <view v-else class="flex flex-col gap-3 pb-20">
        <view 
          v-for="service in filteredServices" 
          :key="service.id"
          class="bg-gray-800 rounded-xl p-4 border border-gray-700"
          @click="viewService(service)"
        >
          <view class="flex flex-row items-start gap-3">
            <view class="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <image v-if="service.image" :src="service.image" mode="aspectFill" class="w-full h-full rounded-lg" />
              <text v-else class="text-2xl">🛠️</text>
            </view>
            <view class="flex-1 min-w-0">
              <text class="text-white font-medium block truncate">{{ service.title }}</text>
              <text class="text-gray-500 text-xs mt-1 block">{{ service.category }}</text>
              <view class="flex flex-row items-center justify-between mt-2">
                <text class="text-teal-400 font-bold">¥{{ service.price }}</text>
                <view :class="['px-2 py-0.5 rounded text-xs', getStatusClass(service.status)]">
                  <text>{{ getStatusLabel(service.status) }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="flex flex-row items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <text class="text-xs text-gray-500">创建于 {{ formatDate(service.created_at) }}</text>
            <view class="flex flex-row gap-2">
              <view 
                v-if="service.status === 'draft'" 
                @click.stop="submitService(service)"
                class="px-3 py-1 bg-teal-600 rounded text-xs text-white"
              >
                <text class="text-white">提交审核</text>
              </view>
              <view 
                @click.stop="editService(service)" 
                class="px-3 py-1 bg-gray-700 rounded text-xs"
              >
                <text class="text-gray-300">编辑</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Create Service Button -->
    <view class="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gray-900 border-t border-gray-800">
      <view 
        @click="createService" 
        class="bg-teal-600 rounded-xl py-3 flex items-center justify-center active:bg-teal-700"
      >
        <AppIcon name="plus" :size="18" color="#ffffff" />
        <text class="text-white font-bold ml-2">创建标准服务</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  image?: string;
  created_at: string;
}

const loading = ref(false);
const activeTab = ref('all');

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '仓库中' },
  { key: 'pending', label: '审核中' },
  { key: 'approved', label: '已上架' },
  { key: 'rejected', label: '审核未通过' },
];

// Mock services - replace with API data
const services = ref<Service[]>([
  // Example data
  // { id: '1', title: '家庭保洁服务', category: '清洁服务', price: 150, status: 'approved', created_at: '2024-01-05T10:00:00Z' },
]);

const filteredServices = computed(() => {
  if (activeTab.value === 'all') return services.value;
  return services.value.filter(s => s.status === activeTab.value);
});

const getTabCount = (key: string) => {
  if (key === 'all') return services.value.length;
  return services.value.filter(s => s.status === key).length;
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'draft': '草稿',
    'pending': '审核中',
    'approved': '已上架',
    'rejected': '未通过',
  };
  return map[status] || status;
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'draft': 'bg-gray-600 text-gray-300',
    'pending': 'bg-yellow-500/20 text-yellow-400',
    'approved': 'bg-teal-500/20 text-teal-400',
    'rejected': 'bg-red-500/20 text-red-400',
  };
  return map[status] || 'bg-gray-600 text-gray-300';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

const goBack = () => {
  uni.navigateBack();
};

const createService = () => {
  uni.navigateTo({
    url: '/pages/provider/select-services'
  });
};

const viewService = (service: Service) => {
  uni.showToast({ title: '查看服务详情', icon: 'none' });
};

const editService = (service: Service) => {
  uni.showToast({ title: '编辑服务', icon: 'none' });
};

const submitService = (service: Service) => {
  uni.showModal({
    title: '提交审核',
    content: '确定要提交此服务进行审核吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已提交审核', icon: 'success' });
      }
    }
  });
};

onMounted(() => {
  // Fetch services from API
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-600 { background-color: #4b5563; }
.bg-teal-600 { background-color: #0d9488; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-teal-400 { color: #2dd4bf; }
.border-gray-700 { border-color: #374151; }
.border-gray-800 { border-color: #1f2937; }
.border-teal-600 { border-color: #0d9488; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
