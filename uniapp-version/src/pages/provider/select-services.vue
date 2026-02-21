<template>
  <view class="page-bg">
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">选择开通服务类型</text>
      <view style="width:40px;" />
    </view>

    <scroll-view scroll-y style="flex:1;width:100%;">
      <view style="padding:16px 20px 40px;">
        <view v-if="loading" style="display:flex;flex-direction:column;align-items:center;padding:80px 0;">
          <view class="spinner" />
          <text style="color:#64748b;font-size:14px;margin-top:12px;">加载类目中...</text>
        </view>

        <view v-else style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
          <view
            v-for="cat in filteredCategories"
            :key="cat.name"
            class="cat-card"
            @click="selectCategory(cat)"
          >
            <view
              class="cat-icon-wrap"
              :style="{ background: cat.standard_enabled ? 'rgba(52,211,153,0.12)' : 'rgba(167,139,250,0.12)' }"
            >
              <image v-if="cat.icon && cat.icon.startsWith('http')" :src="cat.icon" style="width:36px;height:36px;" />
              <AppIcon v-else :name="cat.icon || 'grid'" :size="36" :color="cat.standard_enabled ? '#34d399' : '#a78bfa'" />
            </view>
            <text style="font-size:17px;font-weight:700;color:#fff;margin-bottom:10px;">{{ cat.name }}</text>
            <view style="display:flex;flex-direction:row;flex-wrap:wrap;gap:4px;justify-content:center;">
              <view v-if="cat.standard_enabled" class="badge-std"><text style="font-size:10px;color:#34d399;font-weight:600;">标准</text></view>
              <view v-if="cat.custom_enabled" class="badge-cus"><text style="font-size:10px;color:#a78bfa;font-weight:600;">定制</text></view>
            </view>
          </view>
        </view>

        <view v-if="!loading && filteredCategories.length === 0" style="display:flex;flex-direction:column;align-items:center;padding:120px 0;opacity:0.6;">
          <AppIcon name="inbox" :size="48" color="#64748b"/>
          <text style="color:#94a3b8;margin-top:16px;">暂无可用服务类目</text>
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

onMounted(() => { loadCategories(); });

const loadCategories = async () => {
    try {
        const res = await categoriesApi.getAll();
        categories.value = res.categories || [];
    } catch {
        uni.showToast({ title: '加载分类失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const filteredCategories = computed(() =>
    categories.value.filter(c => c.standard_enabled || c.custom_enabled)
);

const handleBack = () => { uni.navigateBack(); };

const selectCategory = (cat: any) => {
    uni.navigateTo({
        url: `/pages/provider/provider-apply-form?category=${encodeURIComponent(cat.name)}&categoryId=${cat.id || ''}`
    });
};
</script>

<style scoped>
.page-bg {
  min-height: 100vh;
  background: #0f172a;
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
}
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; flex-shrink: 0;
}
.back-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
}
.header-title { font-size: 18px; font-weight: 700; color: #fff; }
.cat-card {
  background: rgba(30,41,59,0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px; padding: 22px 14px;
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
}
.cat-card:active { opacity: 0.75; }
.cat-icon-wrap {
  width: 64px; height: 64px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
  border: 1px solid rgba(255,255,255,0.08);
}
.badge-std { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); padding: 2px 6px; border-radius: 6px; }
.badge-cus { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.25); padding: 2px 6px; border-radius: 6px; }
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: #10b981;
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
</style>
