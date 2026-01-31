<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);">
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="已开具发票" 
      background-color="#0f172a" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    />

    <!-- Filter Tabs -->
    <view style="padding: 8px 16px 0 16px;">
      <scroll-view scroll-x :show-scrollbar="false" style="white-space: nowrap;">
        <view style="display: inline-flex; flex-direction: row; gap: 12px;">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="activeTab = index"
            :style="{
              padding: '8px 20px',
              borderRadius: '100px',
              background: activeTab === index ? 'rgba(16, 185, 129, 0.15)' : '#1f2937',
              border: activeTab === index ? '1px solid #10b981' : '1px solid #374151'
            }"
          >
            <text :style="{ fontSize: '14px', color: activeTab === index ? '#10b981' : '#9ca3af' }">{{ tab }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Invoice List -->
    <scroll-view scroll-y style="height: calc(100vh - 180px); padding: 16px; box-sizing: border-box; width: 100%; overflow-x: hidden;">
      <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0;">
        <text style="color: #9ca3af;">加载中...</text>
      </view>
      
      <view v-else-if="filteredInvoices.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0;">
        <view style="width: 80px; height: 80px; background: #1f2937; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <AppIcon name="file-text" :size="40" color="#6b7280" />
        </view>
        <text style="font-size: 14px; color: #6b7280;">暂无发票记录</text>
      </view>

      <view v-else>
        <view v-for="invoice in filteredInvoices" :key="invoice.id" 
          style="background: #1f2937; border-radius: 16px; padding: 16px; margin-bottom: 12px; border: 1px solid #374151; box-sizing: border-box; overflow: hidden;">
          
          <!-- Card Top: Title & Amount -->
          <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <view style="display: flex; flex-direction: row; align-items: center; gap: 12px;">
              <view :style="{
                width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: invoice.amount > 1000 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'
              }">
                <AppIcon name="file-text" :size="20" :color="invoice.amount > 1000 ? '#10b981' : '#3b82f6'" />
              </view>
              <text style="font-size: 16px; font-weight: 600; color: #ffffff;">{{ invoice.title }}</text>
            </view>
            <text style="font-size: 18px; font-weight: 700; color: #10b981;">${{ invoice.amount.toLocaleString() }}</text>
          </view>
          
          <!-- Card Middle: Info -->
          <view style="margin-bottom: 16px;">
            <view style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 8px;">
              <text style="font-size: 13px; color: #6b7280;">发票号码</text>
              <text style="font-size: 13px; color: #e5e7eb; font-family: monospace;">{{ invoice.invoiceNo }}</text>
            </view>
            <view style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 8px;">
              <text style="font-size: 13px; color: #6b7280;">开票日期</text>
              <text style="font-size: 13px; color: #e5e7eb;">{{ invoice.date }}</text>
            </view>
            <view style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 8px;">
              <text style="font-size: 13px; color: #6b7280;">发票类型</text>
              <text style="font-size: 13px; color: #e5e7eb;">{{ invoice.type }}</text>
            </view>
            <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
              <text style="font-size: 13px; color: #6b7280;">状态</text>
              <view :style="{
                padding: '4px 12px',
                borderRadius: '20px',
                background: invoice.status === 'issued' ? 'rgba(16, 185, 129, 0.15)' : invoice.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'
              }">
                <text :style="{
                  fontSize: '12px',
                  color: invoice.status === 'issued' ? '#10b981' : invoice.status === 'pending' ? '#f59e0b' : '#ef4444'
                }">{{ getStatusText(invoice.status) }}</text>
              </view>
            </view>
          </view>
          
          <!-- Card Bottom: Actions -->
          <view style="display: flex; flex-direction: row; gap: 12px; padding-top: 12px; border-top: 1px solid #374151;">
            <view @click="handleView(invoice)" style="flex: 1; padding: 10px; background: #374151; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <text style="font-size: 14px; color: #e5e7eb;">查看详情</text>
            </view>
            <view @click="handleDownload(invoice)" style="flex: 1; padding: 10px; background: #10b981; border-radius: 8px; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 4px;">
              <AppIcon name="download" :size="14" color="#ffffff" />
              <text style="font-size: 14px; color: #ffffff;">下载发票</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Safe Area -->
      <view style="height: 80px;"></view>
    </scroll-view>

    <!-- Bottom Button -->
    <view style="position: fixed; bottom: 0; left: 0; right: 0; background: #0f172a; padding: 16px; padding-bottom: 32px; border-top: 1px solid #374151;">
      <view @click="handleApplyInvoice" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 14px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <text style="font-size: 16px; font-weight: 600; color: #ffffff;">申请开票</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';

const loading = ref(false);
const activeTab = ref(0);
const tabs = ['全部', '普票', '专票'];

interface Invoice {
  id: string;
  invoiceNo: string;
  title: string;
  amount: number;
  type: string;
  status: 'issued' | 'pending' | 'failed';
  date: string;
}

const invoices = ref<Invoice[]>([
  {
    id: '1',
    invoiceNo: 'INV20240105001',
    title: '平台服务费',
    amount: 2500,
    type: '增值税普通发票',
    status: 'issued',
    date: '2024-01-05'
  },
  {
    id: '2',
    invoiceNo: 'INV20240103002',
    title: '技术服务费',
    amount: 850,
    type: '增值税普通发票',
    status: 'issued',
    date: '2024-01-03'
  },
  {
    id: '3',
    invoiceNo: 'INV20240102003',
    title: '推广服务费',
    amount: 1200,
    type: '增值税专用发票',
    status: 'pending',
    date: '2024-01-02'
  }
]);

const filteredInvoices = computed(() => {
  if (activeTab.value === 0) return invoices.value;
  const types = ['', '增值税普通发票', '增值税专用发票'];
  return invoices.value.filter(i => i.type === types[activeTab.value]);
});

const getStatusClass = (status: string) => {
  switch(status) {
    case 'issued': return 'status-success';
    case 'pending': return 'status-warning';
    case 'failed': return 'status-error';
    default: return 'status-default';
  }
};

const getStatusText = (status: string) => {
  switch(status) {
    case 'issued': return '已开具';
    case 'pending': return '开具中';
    case 'failed': return '失败';
    default: return status;
  }
};

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

const handleView = (invoice: Invoice) => {
  uni.showToast({ title: '查看发票详情', icon: 'none' });
};

const handleDownload = (invoice: Invoice) => {
  uni.showToast({ title: '开始下载...', icon: 'none' });
};

const handleApplyInvoice = () => {
  uni.showToast({ title: '申请功能开发中', icon: 'none' });
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Standard Header */
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

.header-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
  text-align: center;
}.header-center-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}




/* Tabs */
.tabs-scroll-view {
  padding: 0 16px;
  margin-top: 10px; /* Increased top margin for spacing */
  margin-bottom: 16px;
  position: relative;
  z-index: 5;
}

.tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.tab-item {
  padding: 6px 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
}

.tab-active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.tab-text {
  font-size: 13px;
  color: #9ca3af;
}

.tab-text-active {
  color: #10b981;
  font-weight: 600;
}

/* List */
.content-scroll {
  flex: 1;
}

.invoice-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invoice-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.card-top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #374151;
  margin-bottom: 12px;
}

.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.amount {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.card-middle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 13px;
  color: #9ca3af;
}

.value {
  font-size: 13px;
  color: #d1d5db;
}

.font-mono {
  font-family: monospace;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 6px;
}

.status-text {
  font-size: 11px;
  font-weight: 500;
}

.status-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.card-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.action-btn-secondary {
  flex: 1;
  height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text-secondary {
  font-size: 13px;
  color: #9ca3af;
}

.action-btn-primary {
  flex: 1;
  height: 36px;
  border-radius: 10px;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text-primary {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
}

/* Bottom Bar */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #111827;
  border-top: 1px solid #374151;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 100;
}

.apply-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.apply-btn-text {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon-bg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-text {
  color: #6b7280;
  font-size: 14px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16, 185, 129, 0.3);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text { color: #9ca3af; font-size: 13px; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

.h-24 { height: 96px; }
</style>
