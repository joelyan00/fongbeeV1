<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <view class="header-center-column">
        <text class="header-title">已开具发票</text>
        <text class="header-subtitle">查看和管理您的业务发票记录</text>
      </view>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Filter Tabs -->
    <view class="tabs-scroll-view">
      <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
        <view class="tabs-row">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="activeTab = index"
            :class="['tab-item', activeTab === index ? 'tab-active' : '']"
          >
            <text :class="['tab-text', activeTab === index ? 'tab-text-active' : '']">{{ tab }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Invoice List -->
    <scroll-view scroll-y class="content-scroll">
      <view v-if="loading" class="loading-state">
        <view class="spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="filteredInvoices.length === 0" class="empty-state">
        <view class="empty-icon-bg">
          <AppIcon name="file-text" :size="40" color="#6b7280" />
        </view>
        <text class="empty-text">暂无发票记录</text>
      </view>

      <view v-else class="invoice-list">
        <view v-for="invoice in filteredInvoices" :key="invoice.id" class="invoice-card">
          <!-- Card Top: Title & Amount -->
          <view class="card-top">
            <view class="flex flex-row items-center gap-2">
              <view class="icon-box">
                <AppIcon name="file-text" :size="20" :color="invoice.amount > 1000 ? '#10b981' : '#3b82f6'" />
              </view>
              <text class="card-title">{{ invoice.title }}</text>
            </view>
            <text class="amount">${{ invoice.amount.toLocaleString() }}</text>
          </view>
          
          <!-- Card Middle: Info -->
          <view class="card-middle">
            <view class="info-row">
              <text class="label">发票号码</text>
              <text class="value font-mono">{{ invoice.invoiceNo }}</text>
            </view>
            <view class="info-row">
              <text class="label">开票日期</text>
              <text class="value">{{ invoice.date }}</text>
            </view>
            <view class="info-row">
              <text class="label">发票类型</text>
              <text class="value">{{ invoice.type }}</text>
            </view>
            <view class="info-row">
              <text class="label">状态</text>
              <view :class="['status-badge', getStatusClass(invoice.status)]">
                <text class="status-text">{{ getStatusText(invoice.status) }}</text>
              </view>
            </view>
          </view>
          
          <!-- Card Bottom: Actions -->
          <view class="card-actions">
            <view class="action-btn-secondary" @click="handleView(invoice)">
              <text class="action-text-secondary">查看详情</text>
            </view>
            <view class="action-btn-primary" @click="handleDownload(invoice)">
              <AppIcon name="download" :size="14" color="#ffffff" style="margin-right: 4px;" />
              <text class="action-text-primary">下载发票</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Safe Area for Bottom Button -->
      <view class="h-24"></view>
    </scroll-view>

    <!-- Bottom Button -->
    <view class="bottom-action-bar">
      <view class="action-bar-content">
        <view class="apply-btn" @click="handleApplyInvoice">
          <text class="apply-btn-text">申请开票</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';

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
