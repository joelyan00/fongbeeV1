<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <!-- Header -->
    <view class="header-light pt-safe px-4">
      <view class="header-row">
        <view class="header-back" @click="handleBack">
          <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" />
        </view>
        <text class="header-title">地址管理</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- Content -->
    <view class="p-4 mb-20">
        <view v-if="loading" class="py-10 flex items-center justify-center">
            <text class="text-gray-400">加载中...</text>
        </view>
        <view v-else-if="addresses.length === 0" class="py-12 flex flex-col items-center justify-center">
             <view class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <AppIcon name="map-pin" :size="32" class="text-gray-300" />
             </view>
             <text class="text-gray-500 text-base font-medium mb-2">暂无收货地址</text>
             <text class="text-gray-400 text-sm mb-6">添加地址以方便服务上门</text>
        </view>
        <view v-else class="flex flex-col gap-3">
            <view v-for="addr in addresses" :key="addr.id" 
                class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:opacity-90 service-card"
                @click="handleEdit(addr)"
            >
                <view class="flex flex-row justify-between mb-2">
                    <view class="flex flex-row items-center gap-2">
                        <text class="text-gray-900 font-bold text-lg">{{ addr.name }}</text>
                        <text class="text-gray-500 text-sm">{{ addr.phone }}</text>
                    </view>
                     <text v-if="addr.is_default" class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">默认</text>
                </view>
                <view class="text-gray-600 text-sm leading-normal">
                    {{ addr.address_line1 }} {{ addr.address_line2 || '' }}
                </view>
                <view class="text-gray-600 text-sm leading-normal">
                    {{ addr.city }}, {{ addr.state }} {{ addr.postal_code }}
                </view>

                <view class="flex flex-row justify-end mt-3 pt-3 border-t border-gray-50 gap-4" @click.stop="">
                    <view v-if="!addr.is_default" class="text-gray-400 text-sm flex items-center p-2" @click.stop="handleSetDefault(addr)">
                        设为默认
                    </view>
                    <view class="flex flex-row gap-4">
                        <view class="flex items-center gap-1 p-2" @click.stop="handleEdit(addr)">
                            <AppIcon name="edit" :size="14" class="text-gray-400" />
                            <text class="text-gray-400 text-sm">编辑</text>
                        </view>
                         <view class="flex items-center gap-1 p-2" @click.stop="handleDelete(addr.id)">
                            <AppIcon name="trash" :size="14" class="text-gray-400" />
                            <text class="text-gray-400 text-sm">删除</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
    
    <!-- Footer Button -->
    <view class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe-bottom">
      <button class="add-btn" @click="handleAdd">
        <AppIcon name="plus" :size="20" color="#ffffff" class="mr-2" />
        添加新地址
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppIcon from '../../components/Icons.vue';
import { addressApi } from '../../services/api';

const addresses = ref<any[]>([]);
const loading = ref(true);

const fetchAddresses = async () => {
    loading.value = true;
    try {
        const res = await addressApi.getAll();
        addresses.value = res.addresses || [];
    } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

onShow(() => {
    fetchAddresses();
});

const handleBack = () => {
    const pages = getCurrentPages();
    if(pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.reLaunch({ url: '/pages/index/index' });
    }
};

const handleAdd = () => {
    uni.navigateTo({ url: '/pages/address/edit' });
};

const handleEdit = (addr: any) => {
    uni.navigateTo({ url: `/pages/address/edit?data=${encodeURIComponent(JSON.stringify(addr))}` });
};

const handleDelete = async (id: string) => {
    uni.showModal({
        title: '提示',
        content: '确定要删除这个地址吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await addressApi.delete(id);
                    fetchAddresses();
                } catch {
                    uni.showToast({ title: '删除失败', icon: 'none' });
                }
            }
        }
    })
};

const handleSetDefault = async (addr: any) => {
    try {
        await addressApi.update(addr.id, { ...addr, is_default: true });
        fetchAddresses();
    } catch {
        uni.showToast({ title: '设置失败', icon: 'none' });
    }
};

</script>

<style scoped>
/* Utility Classes (Mini-Tailwind) */
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-white-20 { background-color: rgba(255, 255, 255, 0.2); }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-emerald-50 { background-color: #ecfdf5; }

.text-white { color: #ffffff; }
.text-gray-900 { color: #111827; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-gray-600 { color: #4b5563; }
.text-gray-300 { color: #d1d5db; }
.text-emerald-600 { color: #059669; }

.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-base { font-size: 16px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.header-light { background: #ffffff; border-bottom: 1px solid #f3f4f6; padding-left: 16px; padding-right: 16px; }
.header-row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 56px; }
.header-back { width: 40px; height: 56px; display: flex; align-items: center; justify-content: flex-start; margin-left: 6px; }
.header-title { font-size: 18px; font-weight: bold; color: #1f2937; line-height: 56px; }
.header-placeholder { width: 40px; }

.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pb-safe-bottom { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }

.w-10 { width: 40px; }
.h-10 { height: 40px; }
.w-20 { width: 80px; }
.h-20 { height: 80px; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.rounded { border-radius: 4px; }

.border { border-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-50 { border-color: #f9fafb; }
.border-emerald-200 { border-color: #a7f3d0; }

.p-4 { padding: 16px; }
.p-2 { padding: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.py-12 { padding-top: 48px; padding-bottom: 48px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.py-0.5 { padding-top: 2px; padding-bottom: 2px; }
.pt-3 { padding-top: 12px; }
.mt-3 { margin-top: 12px; }

.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-20 { margin-bottom: 80px; }
.mr-2 { margin-right: 8px; }

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.fixed { position: fixed; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }

.add-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #047857 0%, #059669 100%);
  color: #ffffff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
