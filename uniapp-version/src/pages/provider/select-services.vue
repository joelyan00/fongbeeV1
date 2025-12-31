<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between border-b border-gray-100 pt-custom">
      <view @click="handleBack" class="w-8 h-8 flex items-center justify-center">
        <AppIcon name="chevron-left" :size="24" class="text-gray-600"/>
      </view>
      <text class="text-lg font-bold text-gray-900">选择服务类型</text>
      <view class="w-8"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="px-4 py-6">
        <!-- Subtitle -->
        <text class="text-sm text-gray-500 text-center block mb-6">请选择您想要申请开通的服务类型</text>

        <!-- Loading -->
        <view v-if="loading" class="flex items-center justify-center py-12">
          <view class="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></view>
        </view>

        <!-- Categories Grid -->
        <view v-else class="grid grid-cols-2 gap-4">
          <view 
            v-for="cat in categories" 
            :key="cat.name"
            class="bg-white p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3"
            :class="selectedCategories.includes(cat.name) 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-100 active:border-gray-200'"
            @click="toggleCategory(cat.name)"
          >
            <view 
              class="w-14 h-14 rounded-xl flex items-center justify-center"
              :class="selectedCategories.includes(cat.name) ? 'bg-emerald-500' : 'bg-gray-100'"
            >
              <image 
                v-if="cat.icon && cat.icon.startsWith('http')" 
                :src="cat.icon" 
                class="w-8 h-8 rounded"
              />
              <AppIcon 
                v-else 
                :name="cat.icon || 'briefcase'" 
                :size="28" 
                :class="selectedCategories.includes(cat.name) ? 'text-white' : 'text-gray-600'"
              />
            </view>
            <text 
              class="text-sm font-bold text-center"
              :class="selectedCategories.includes(cat.name) ? 'text-emerald-700' : 'text-gray-800'"
            >
              {{ cat.name }}
            </text>
            <!-- Check indicator -->
            <view v-if="selectedCategories.includes(cat.name)" class="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <AppIcon name="check" :size="12" class="text-white"/>
            </view>
          </view>
        </view>

        <!-- Selected Summary -->
        <view v-if="selectedCategories.length > 0" class="mt-6 bg-emerald-50 rounded-xl p-4">
          <text class="text-sm text-emerald-700 font-bold mb-2 block">已选择 {{ selectedCategories.length }} 个服务类型：</text>
          <view class="flex flex-row flex-wrap gap-2">
            <view 
              v-for="cat in selectedCategories" 
              :key="cat"
              class="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold"
            >
              {{ cat }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Footer -->
    <view class="bg-white border-t border-gray-100 px-4 py-4 pb-safe">
      <button 
        @click="handleSubmit"
        class="w-full h-12 rounded-xl font-bold text-base flex items-center justify-center"
        :class="submitting || selectedCategories.length === 0 ? 'bg-gray-300' : 'bg-emerald-600 active:bg-emerald-700'"
        :disabled="submitting || selectedCategories.length === 0"
        style="color: white;"
      >
        <view v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></view>
        {{ submitting ? '提交中...' : (selectedCategories.length === 0 ? '请至少选择一个服务' : '提交申请') }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { categoriesApi, providersApi } from '@/services/api';

const categories = ref<any[]>([]);
const loading = ref(true);
const selectedCategories = ref<string[]>([]);
const submitting = ref(false);

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

const toggleCategory = (catName: string) => {
    const idx = selectedCategories.value.indexOf(catName);
    if (idx >= 0) {
        selectedCategories.value.splice(idx, 1);
    } else {
        selectedCategories.value.push(catName);
    }
};

const handleBack = () => {
    uni.navigateBack();
};

const handleSubmit = async () => {
    if (selectedCategories.value.length === 0) {
        return uni.showToast({ title: '请至少选择一个服务类型', icon: 'none' });
    }

    submitting.value = true;
    try {
        // Submit each selected category as a service type application
        for (const category of selectedCategories.value) {
            await providersApi.applyServiceType({
                category,
                reason: `申请开通 [${category}] 服务`
            });
        }

        uni.showToast({ title: '申请已提交，等待审核', icon: 'success' });
        
        setTimeout(() => {
            // Go back to home or provider dashboard
            uni.reLaunch({ url: '/pages/index/index' });
        }, 1500);
    } catch (e: any) {
        uni.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.grid-cols-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
