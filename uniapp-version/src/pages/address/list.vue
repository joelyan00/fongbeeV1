<template>
  <view class="min-h-screen bg-gray-50 pb-safe" style="background-color: #f9fafb; min-height: 100vh;">
    <!-- Header aligned with Capsule Button -->
    <view class="header-light" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
      <view class="header-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" :style="{height: navBarHeight + 'px'}">
        <view class="header-back" @click="handleBack" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}">
          <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" />
        </view>
        <text class="header-title" style="font-size: 18px; font-weight: bold; color: #1f2937; position: absolute; left: 50%; transform: translateX(-50%);">地址管理</text>
        <view class="header-placeholder" style="width: 40px;"></view>
      </view>
    </view>
    
    <!-- Spacer to push content below fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <!-- Content -->
    <view class="mb-20" style="padding: 16px 20px; margin-bottom: 80px;">
        <view v-if="loading" class="py-10 flex items-center justify-center" style="padding-top: 40px; padding-bottom: 40px; display: flex; align-items: center; justify-content: center;">
            <text class="text-gray-400" style="color: #9ca3af;">加载中...</text>
        </view>
        <view v-else-if="addresses.length === 0" class="py-12 flex flex-col items-center justify-center" style="padding-top: 48px; padding-bottom: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
             <view class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4" style="width: 80px; height: 80px; background-color: #f3f4f6; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                 <AppIcon name="map-pin" :size="32" class="text-gray-300" />
             </view>
             <text class="text-gray-500 text-base font-medium mb-2" style="color: #6b7280; font-size: 16px; font-weight: 500; margin-bottom: 8px;">暂无收货地址</text>
             <text class="text-gray-400 text-sm mb-6" style="color: #9ca3af; font-size: 14px; margin-bottom: 24px;">添加地址以方便服务上门</text>
        </view>
        <view v-else class="flex flex-col gap-3" style="display: flex; flex-direction: column; gap: 12px;">
            <view v-for="addr in addresses" :key="addr.id" 
                class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:opacity-90 service-card"
                style="background-color: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6;"
                @click="handleEdit(addr)"
            >
                <view class="flex flex-row justify-between mb-2" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; margin-bottom: 8px;">
                    <view class="flex flex-row items-center gap-2" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px;">
                        <text class="text-gray-900 font-bold text-lg" style="color: #111827; font-weight: 700; font-size: 18px;">{{ addr.name }}</text>
                        <text class="text-gray-500 text-sm" style="color: #6b7280; font-size: 14px;">{{ addr.phone }}</text>
                    </view>
                     <text v-if="addr.is_default" class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" style="font-size: 12px; color: #059669; background-color: #ecfdf5; padding-left: 8px; padding-right: 8px; padding-top: 2px; padding-bottom: 2px; border-radius: 4px; border-width: 1px; border-color: #a7f3d0;">默认</text>
                </view>
                <view class="text-gray-600 text-sm leading-normal" style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                    {{ addr.address_line1 }} {{ addr.address_line2 || '' }}
                </view>
                <view class="text-gray-600 text-sm leading-normal" style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                    {{ addr.city }}, {{ addr.state }} {{ addr.postal_code }}
                </view>

                <view class="flex flex-row justify-end mt-3 pt-3 border-t border-gray-50 gap-4" style="display: flex !important; flex-direction: row !important; justify-content: flex-end !important; margin-top: 12px; padding-top: 12px; border-top-width: 1px; border-color: #f9fafb; gap: 16px;" @click.stop="">
                    <view v-if="!addr.is_default" class="text-gray-400 text-sm flex items-center p-2" style="color: #9ca3af; font-size: 14px; display: flex; align-items: center; padding: 8px;" @click.stop="handleSetDefault(addr)">
                        设为默认
                    </view>
                    <view class="flex flex-row gap-4" style="display: flex !important; flex-direction: row !important; gap: 16px;">
                        <view class="flex items-center gap-1 p-2" style="display: flex !important; align-items: center !important; gap: 4px; padding: 8px;" @click.stop="handleEdit(addr)">
                            <AppIcon name="edit" :size="14" class="text-gray-400" />
                            <text class="text-gray-400 text-sm" style="color: #9ca3af; font-size: 14px;">编辑</text>
                        </view>
                         <view class="flex items-center gap-1 p-2" style="display: flex !important; align-items: center !important; gap: 4px; padding: 8px;" @click.stop="handleDelete(addr.id)">
                            <AppIcon name="trash" :size="14" class="text-gray-400" />
                            <text class="text-gray-400 text-sm" style="color: #9ca3af; font-size: 14px;">删除</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
    
    <!-- Footer Button - Add Address -->
    <view class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe-bottom" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background-color: #ffffff; border-top-width: 1px; border-color: #f3f4f6;">
      <button class="add-btn" @click="handleAdd" style="width: 100%; height: 48px; background: linear-gradient(90deg, #047857 0%, #059669 100%); color: #ffffff; border-radius: 12px; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center;">
        <AppIcon name="plus" :size="20" color="#ffffff" style="margin-right: 8px;" />
        添加新地址
      </button>
    </view>

    <!-- Delete Confirmation Modal -->
    <ActionModal
      v-model:visible="showDeleteModal"
      title="删除地址"
      message="确定要删除这个地址吗？删除后将无法找回。"
      icon="trash"
      icon-color="#ef4444"
      icon-bg-color="#fef2f2"
      confirm-text="确定删除"
      cancel-text="取消"
      confirm-bg="#ef4444"
      @confirm="confirmDelete"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppIcon from '../../components/Icons.vue';
import ActionModal from '../../components/ActionModal.vue';
import { addressApi } from '../../services/api';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const addresses = ref<any[]>([]);
const loading = ref(true);

const showDeleteModal = ref(false);
const addressToDelete = ref<string | null>(null);

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

onMounted(() => {
    // #ifdef MP-WEIXIN
    const menuBtn = uni.getMenuButtonBoundingClientRect();
    const sysInfo = uni.getSystemInfoSync();
    statusBarHeight.value = sysInfo.statusBarHeight || 44;
    navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
    capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
    // #endif
    // #ifndef MP-WEIXIN
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
    navBarHeight.value = 44;
    capsuleWidth.value = 0;
    // #endif
});

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

const handleDelete = (id: string) => {
    addressToDelete.value = id;
    showDeleteModal.value = true;
};

const confirmDelete = async () => {
    if (!addressToDelete.value) return;
    try {
        uni.showLoading({ title: '删除中...' });
        await addressApi.delete(addressToDelete.value);
        fetchAddresses();
        uni.showToast({ title: '已删除', icon: 'success' });
    } catch {
        uni.showToast({ title: '删除失败', icon: 'none' });
    } finally {
        uni.hideLoading();
        addressToDelete.value = null;
    }
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
.py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
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
