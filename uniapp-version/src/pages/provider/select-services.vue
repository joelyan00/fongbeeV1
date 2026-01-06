<template>
  <view class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <view class="bg-gray-800 px-4 py-3 flex flex-row items-center justify-between border-b border-gray-700 pt-custom">
      <view @click="handleBack" class="w-8 h-8 flex items-center justify-center">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="text-lg font-bold text-white">选择服务类型</text>
      <view class="w-8"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="py-4">
        <!-- Subtitle -->
        <text class="text-sm text-gray-400 text-center block mb-4 px-4">请选择您想要创建的服务所属类目</text>

        <!-- Loading -->
        <view v-if="loading" class="flex items-center justify-center py-12">
          <view class="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></view>
        </view>

        <!-- Categories List (Horizontal Rows) -->
        <view v-else class="flex flex-col">
          <view 
            v-for="cat in categories" 
            :key="cat.name"
            class="flex flex-row items-center px-4 py-4 border-b border-gray-800 active:bg-gray-800"
            @click="selectCategory(cat)"
          >
            <!-- Icon -->
            <view class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mr-4">
              <image 
                v-if="cat.icon && cat.icon.startsWith('http')" 
                :src="cat.icon" 
                class="w-7 h-7 rounded"
              />
              <AppIcon 
                v-else 
                :name="cat.icon || 'briefcase'" 
                :size="24" 
                color="#9ca3af"
              />
            </view>
            
            <!-- Category Info -->
            <view class="flex-1">
              <text class="text-base font-medium text-white block">{{ cat.name }}</text>
              <text class="text-xs text-gray-500 mt-1 block">{{ cat.description || '提供专业' + cat.name + '服务' }}</text>
            </view>
            
            <!-- Arrow -->
            <AppIcon name="chevron-right" :size="20" color="#6b7280"/>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="!loading && categories.length === 0" class="flex flex-col items-center py-20">
          <view class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <AppIcon name="inbox" :size="40" color="#4b5563"/>
          </view>
          <text class="text-gray-400">暂无可用服务类目</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { categoriesApi } from '@/services/api';

const categories = ref<any[]>([]);
const loading = ref(true);

onMounted(() => {
    loadCategories();
});

const loadCategories = async () => {
    try {
        const res = await categoriesApi.getAll();
        categories.value = res.categories || [];
    } catch (e) {
        uni.showToast({ title: '加载分类失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const handleBack = () => {
    uni.navigateBack();
};

const selectCategory = (cat: any) => {
    // Navigate to create service form with selected category
    uni.navigateTo({
        url: `/pages/provider/create-service?category=${encodeURIComponent(cat.name)}&categoryId=${cat.id || ''}`
    });
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }

.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.border-gray-700 { border-color: #374151; }
.border-gray-800 { border-color: #1f2937; }
.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
