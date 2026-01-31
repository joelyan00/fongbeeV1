<template>
  <view class="min-h-screen bg-gray-50" style="background-color: #f9fafb; min-height: 100vh; display: flex; flex-direction: column;">
      <!-- Header aligned with Capsule Button -->
      <view class="bg-white border-b border-gray-100" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 200; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
        <view style="display: flex !important; flex-direction: row !important; align-items: center !important;" :style="{height: navBarHeight + 'px'}">
          <view @click="handleBack" style="width: 40px; height: 100%; display: flex; align-items: center; justify-content: flex-start;">
            <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }"/>
          </view>
          <text style="font-weight: bold; font-size: 18px; flex: 1; text-align: center; padding-right: 40px; color: #1f2937;">开具发票</text>
        </view>
      </view>
      
      <!-- Spacer for fixed header -->
      <view :style="{height: (statusBarHeight + navBarHeight) + 'px', flexShrink: 0}"></view>

      <!-- Main Content -->
      <scroll-view scroll-y class="flex-1" style="flex: 1;">
        <view style="padding: 16px 20px 40px 20px;">
            <!-- Request Button Card -->
            <view class="bg-emerald-600 text-white p-4 rounded-xl shadow-lg" @click="handleRequestInvoice" style="background: #059669; color: #ffffff; padding: 20px 16px; border-radius: 16px; display: flex; flex-direction: row; align-items: center; justify-content: space-between; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3); margin-bottom: 24px;">
                <view style="flex: 1;">
                    <text class="font-bold text-lg" style="font-weight: 700; font-size: 19px; color: #ffffff; display: block; margin-bottom: 4px;">申请开发票</text>
                    <text style="color: rgba(255,255,255,0.85); font-size: 12px;">支持按订单或金额开票</text>
                </view>
                <view style="background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                    <AppIcon name="plus" :size="24" color="#ffffff" />
                </view>
            </view>
            
            <view style="padding: 0 4px; margin-bottom: 12px;">
              <text style="font-size: 15px; font-weight: 700; color: #1f2937;">开票记录</text>
            </view>
            
            <!-- Empty State -->
            <view v-if="invoices.length === 0" class="flex flex-col items-center justify-center p-10" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
                <view class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4" style="width: 64px; height: 64px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                     <AppIcon name="file-text" :size="32" color="#9ca3af" />
                </view>
                <text class="text-gray-400 text-sm" style="color: #9ca3af; font-size: 14px;">暂无开票记录</text>
            </view>

            <!-- List -->
            <view v-else class="flex flex-col gap-3" style="display: flex; flex-direction: column; gap: 12px;">
                <view v-for="inv in invoices" :key="inv.id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100" style="background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f3f4f6;">
                    <view class="flex flex-row justify-between items-start mb-2" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: flex-start; margin-bottom: 8px;">
                        <text class="font-bold text-gray-900 text-base" style="font-weight: 700; color: #111827; font-size: 16px;">{{ inv.title }}</text>
                        <text class="font-bold text-gray-900 text-base" style="font-weight: 700; color: #111827; font-size: 16px;">CAD ${{ inv.amount }}</text>
                    </view>
                    <view class="flex flex-row justify-between items-center text-xs text-gray-500" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center; font-size: 12px; color: #6b7280;">
                        <text>{{ inv.date }}</text>
                        <view class="px-2 py-1 rounded bg-green-50 text-emerald-600 font-medium" v-if="inv.status === 'issued'" style="padding: 4px 8px; border-radius: 4px; background: #ecfdf5; color: #059669; font-weight: 500;">已开具</view>
                        <view class="px-2 py-1 rounded bg-orange-50 text-orange-600 font-medium" v-else style="padding: 4px 8px; border-radius: 4px; background: #fff7ed; color: #ea580c; font-weight: 500;">处理中</view>
                    </view>
                </view>
            </view>
        </view>
      </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const invoices = ref<any[]>([
    // Mock data for display
    { id: 1, title: '家庭清洁服务费', amount: '120.00', date: '2025-12-20 14:30', status: 'issued' },
    { id: 2, title: '管道维修服务费', amount: '85.50', date: '2025-11-15 09:20', status: 'issued' }
]);

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

const handleBack = () => uni.navigateBack();

const handleRequestInvoice = () => {
    uni.showToast({ title: '功能开发中', icon: 'none' });
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.flex-1 { flex: 1; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.border-b { border-bottom-width: 1px; }
.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.rounded-xl { border-radius: 12px; }
.rounded-full { border-radius: 9999px; }
.font-bold { font-weight: 700; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
</style>
