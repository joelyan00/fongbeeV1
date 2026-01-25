<template>
  <view class="min-h-screen bg-page-background flex flex-col font-sans">
    <!-- Header matched with Cart -->
    <view class="header-light pt-safe">
       <view class="header-row">
         <view @click="handleBack" class="header-back"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title">退款/售后</text>
         <view class="header-placeholder"></view>
       </view>
    </view>

    <!-- Scrollable Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="p-4 space-y-5">
        
        <!-- Empty State -->
        <view v-if="ordersToApply.length === 0" class="flex flex-col items-center pt-32">
          <view class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <AppIcon name="clipboard" :size="28" color="#D1D5DB" />
          </view>
          <text class="text-gray-400 text-sm font-medium">暂无售后订单</text>
        </view>

        <!-- Premium Service Card -->
        <view 
          v-for="order in ordersToApply" 
          :key="order.id"
          class="premium-card"
        >
          <!-- Order ID & Copy Action -->
          <view class="flex flex-row items-center justify-between mb-3">
             <view class="flex flex-row items-center gap-1.5" @click="handleCopy(order.orderNo)">
                <text class="text-[11px] text-gray-300 font-medium">ID: {{ order.orderNo }}</text>
                <AppIcon name="clipboard" :size="10" color="#D1D5DB" />
             </view>
          </view>

          <!-- 16:9 Banner Image -->
          <view class="banner-wrapper mb-4">
            <image 
              :src="order.image" 
              class="banner-image"
              mode="aspectFill"
            />
          </view>

          <!-- Core Information Area -->
          <view class="flex flex-col gap-3">
            <view class="flex flex-row items-start justify-between">
                <text class="flex-1 text-lg font-bold text-gray-900 leading-snug mr-4">
                  {{ order.title }}
                </text>
                <view class="status-indicator-tag">已完成</view>
            </view>
            
            <view class="flex flex-row items-center gap-2">
                <text class="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-sm">{{ order.category }}</text>
                <text class="text-gray-200">|</text>
                <text class="text-xs text-gray-400">{{ order.time }}</text>
            </view>
            
            <view class="flex flex-row items-baseline mt-1">
              <text class="text-2xl font-black text-emerald-600">¥{{ order.price }}</text>
            </view>
          </view>

          <!-- Interaction: Outline Button -->
          <view class="flex flex-row justify-end mt-5 pt-4 border-t border-gray-50">
            <button 
              class="outline-apply-btn"
              @click="handleApplyAfterSales(order)"
            >申请售后服务</button>
          </view>
        </view>

        <!-- Refined Support Section (Complaint & Message) -->
        <view class="support-box-premium" @click="handleApplyAfterSales(null)">
          <view class="flex flex-row items-center gap-4">
            <view class="support-icon-circle">
              <AppIcon name="message-square" :size="20" color="#059669" />
            </view>
            <view class="flex-1">
              <text class="title-main">投诉服务商 / 给平台留言</text>
              <text class="desc-sub">遇到困难或对服务商不满？请告诉我们</text>
            </view>
            <view class="flex flex-row items-center gap-0.5">
              <text class="text-sm font-bold text-emerald-600">立即留言</text>
              <AppIcon name="chevron-right" :size="14" color="#059669" />
            </view>
          </view>
        </view>

        <view class="h-20"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

const showComplaintModal = ref(false); // Deprecated, kept to avoid template errors if any
const ordersToApply = ref([
  {
    id: '1',
    orderNo: 'ORD202601249821',
    title: '全屋深度保洁 - 100-120㎡',
    category: '家庭保洁',
    price: '399.00',
    time: '2026-01-24 14:00',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=450'
  }
]);

const handleBack = () => {
  uni.navigateBack();
};

const handleCopy = (text: string) => {
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '单号已复制', icon: 'none' })
  });
};

const handleApplyAfterSales = (order: any) => {
  const orderId = order?.id || ordersToApply.value[0]?.id || '1'; // Default to first order or 1
  uni.navigateTo({
    url: `/pages/user/apply-after-sales?orderId=${orderId}`
  });
};

const handleContactSupport = () => {
    uni.showToast({ title: '连接客服中', icon: 'none' });
};

onMounted(() => {
  console.log('After-sales Page Loaded: v1.0.6 - Navigation Flow Update');
});
</script>

<style scoped>
.pt-custom-safe { padding-top: env(safe-area-inset-top); }
.bg-page-background { background-color: #FAFAFA; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  background: #ffffff;
  border-radius: 32px 32px 0 0;
  padding: 24px 24px calc(24px + env(safe-area-inset-bottom));
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.chip-tag {
  padding: 8px 16px;
  background: #F3F4F6;
  color: #4B5563;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.chip-active {
  background: #ECFDF5;
  color: #059669;
}

.message-textarea {
  width: 100%;
  height: 120px;
  background: #F9FAFB;
  border-radius: 16px;
  padding: 16px;
  font-size: 14px;
  color: #111827;
  border: 1px solid #F3F4F6;
}

.submit-message-btn {
  width: 100%;
  height: 52px;
  background: #111827;
  color: #ffffff;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-message-btn[disabled] {
  opacity: 0.5;
  background: #9CA3AF;
}

/* Premium Card Aesthetics */
.premium-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
}

/* 16:9 Banner ratio logic */
.banner-wrapper {
  width: 100%;
  padding-top: 56.25%; /* 16:9 ratio */
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f8f9fa;
}

.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* Sophisticated Status Tag */
.status-indicator-tag {
  background: #ECFDF5;
  color: #059669;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

/* Outline Button Styling */
.outline-apply-btn {
  background: transparent;
  color: #059669;
  border: 1.5px solid #059669;
  height: 40px;
  padding: 0 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  line-height: normal;
}

.outline-apply-btn:active {
  background: rgba(5, 150, 105, 0.04);
  transform: scale(0.98);
}

/* Support Section (Horizontal Flex) */
.support-box-premium {
  background: #F0FDF4; /* Mint substrates */
  border-radius: 16px;
  padding: 16px 20px;
  border: 1px solid rgba(5, 150, 105, 0.05);
}

.support-icon-circle {
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.title-main {
  color: #064E3B;
  font-size: 14px;
  font-weight: 800;
  display: block;
}

.desc-sub {
  color: #059669;
  font-size: 11px;
  font-weight: 500;
  display: block;
  margin-top: 2px;
}

/* Utils */
.active-opacity:active { opacity: 0.7; }
.tracking-tight { letter-spacing: -0.015em; }

button::after { border: none; }

/* Header Styles from Cart Page */
.header-light {
    background: #ffffff;
    padding-left: 16px;
    padding-right: 16px;
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid #f3f4f6;
}
.header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}
.header-back {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 6px;
}
.header-title {
    font-size: 19px;
    font-weight: bold;
    color: #1f2937;
    line-height: 56px;
}
.header-placeholder {
    width: 40px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
}
</style>
