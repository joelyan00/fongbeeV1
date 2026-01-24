<template>
  <view class="min-h-screen page-container bg-dark-gradient flex flex-col">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">选择开通服务类型</text>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1 w-full mt-4">
      <view class="px-5 pb-10">
        <!-- Loading -->
        <view v-if="loading" class="flex flex-col items-center justify-center py-20">
          <view class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></view>
          <text class="text-slate-500 text-sm">加载类目中...</text>
        </view>

        <!-- Categories Grid -->
        <view v-else class="grid grid-cols-2 gap-4">
          <view 
            v-for="cat in filteredCategories" 
            :key="cat.name"
            class="group relative bg-slate-800/40 rounded-[24px] p-6 border border-white/5 flex flex-col items-center text-center transition-all duration-300 active:scale-95 active:bg-slate-800/60 overflow-hidden"
            @click="selectCategory(cat)"
          >
            <!-- Hover/Active Gradient Background -->
            <view class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-active:opacity-100 transition-opacity"></view>
            
            <!-- Icon -->
            <view 
              class="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 border border-white/10 shadow-lg"
              :class="cat.standard_enabled ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5' : 'bg-gradient-to-br from-violet-500/20 to-violet-500/5'"
            >
                <image 
                  v-if="cat.icon && cat.icon.startsWith('http')" 
                  :src="cat.icon" 
                  class="w-10 h-10"
                />
                <AppIcon 
                  v-else 
                  :name="cat.icon || 'grid'" 
                  :size="36" 
                  :color="cat.standard_enabled ? '#34d399' : '#a78bfa'"
                />
            </view>
            
            <!-- Text Content -->
            <text class="text-lg font-bold text-white mb-3 tracking-wide leading-tight">{{ cat.name }}</text>
            
            <!-- Badges -->
            <view class="flex flex-row flex-wrap gap-1.5 justify-center w-full">
                <view 
                  v-if="cat.standard_enabled" 
                  class="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm"
                >
                    <text class="text-[10px] text-emerald-400 font-medium">标准</text>
                </view>
                <view 
                  v-if="cat.custom_enabled" 
                  class="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm"
                >
                    <text class="text-[10px] text-violet-400 font-medium">定制</text>
                </view>
            </view>

          </view>
        </view>

        <!-- Empty State -->
        <view v-if="!loading && filteredCategories.length === 0" class="flex flex-col items-center justify-center py-32 opacity-60">
          <view class="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
            <AppIcon name="inbox" :size="48" color="#64748b"/>
          </view>
          <text class="text-slate-400 font-medium">暂无可用服务类目</text>
          <text class="text-slate-600 text-xs mt-2">请联系管理员开通相关服务权限</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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

const filteredCategories = computed(() => {
    return categories.value.filter(c => c.standard_enabled || c.custom_enabled);
});

const handleBack = () => {
    uni.navigateBack();
};

const selectCategory = (cat: any) => {
    uni.navigateTo({
        url: `/pages/provider/create-service?category=${encodeURIComponent(cat.name)}&categoryId=${cat.id || ''}`
    });
};
</script>

<style scoped>
/* Base Layout */
.min-h-screen { min-height: 100vh; }
.page-container {
  min-height: 100vh;
  background: #0f172a;
  padding-top: env(safe-area-inset-top);
  width: 100%;
}

/* Header - Exactly matching transactions.vue */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
}

.back-btn, .placeholder-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.placeholder-btn {
  background: transparent;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

/* Page Colors & Gradients */
.bg-dark-gradient { background: #0f172a; }
.bg-slate-800\/40 { background-color: rgba(30, 41, 59, 0.4); }
.bg-slate-800\/60 { background-color: rgba(30, 41, 59, 0.6); }

/* Borders */
.border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
.border-white\/10 { border-color: rgba(255, 255, 255, 0.1); }

/* Text */
.text-white { color: #ffffff; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-emerald-400 { color: #34d399; }
.text-violet-400 { color: #a78bfa; }

/* Utilities */
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4 { gap: 16px; }

.rounded-\[24px\] { border-radius: 24px; }
.rounded-3xl { border-radius: 24px; }
.rounded-md { border-radius: 6px; }
.rounded-full { border-radius: 9999px; }

.p-6 { padding: 24px; }
.px-5 { padding-left: 20px; padding-right: 20px; }
.pb-10 { padding-bottom: 40px; }
.text-center { text-align: center; }

.backdrop-blur-sm { backdrop-filter: blur(4px); }

/* Animation */
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 300ms; }
.active\:scale-95:active { transform: scale(0.98); }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

</style>
