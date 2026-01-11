<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" class="text-white"/>
      </view>
      <view class="header-center-column">
        <text class="header-title">合同管理</text>
        <text class="header-subtitle">查看和管理您签订的各类业务协议</text>
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

    <!-- Contract List -->
    <scroll-view scroll-y class="content-scroll">
      <view v-if="loading" class="loading-state">
        <view class="spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="filteredContracts.length === 0" class="empty-state">
        <view class="empty-icon-bg">
          <AppIcon name="file" :size="40" color="#6b7280" />
        </view>
        <text class="empty-text">暂无合同记录</text>
      </view>

      <view v-else class="contract-list">
        <view v-for="contract in filteredContracts" :key="contract.id" class="contract-card">
          <!-- Card Top: Title & Status -->
          <view class="card-top">
            <view class="flex flex-row items-center gap-2 flex-1">
              <view class="icon-box">
                <AppIcon name="file" :size="20" color="#60a5fa" />
              </view>
              <view class="flex flex-col">
                <text class="card-title">{{ contract.title }}</text>
                <text class="card-subtitle">{{ contract.contractNo }}</text>
              </view>
            </view>
            <view :class="['status-badge', getStatusClass(contract.status)]">
              <text class="status-text">{{ getStatusText(contract.status) }}</text>
            </view>
          </view>
          
          <!-- Card Middle: Dates -->
          <view class="card-middle">
            <view class="grid-2">
              <view class="info-item">
                <text class="label">签订日期</text>
                <text class="value">{{ contract.signDate }}</text>
              </view>
              <view class="info-item text-right">
                <text class="label">到期日期</text>
                <text class="value">{{ contract.expireDate }}</text>
              </view>
            </view>
          </view>
          
          <!-- Card Bottom: Actions -->
          <view class="card-actions">
            <view class="action-btn-secondary" @click="handleView(contract)">
              <text class="action-text-secondary">预览合同</text>
            </view>
            <view class="action-btn-primary" @click="handleDownload(contract)">
              <AppIcon name="download" :size="14" color="#ffffff" style="margin-right: 4px;" />
              <text class="action-text-primary">下载 PDF</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Safe Area -->
      <view class="h-8"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';

const loading = ref(false);
const activeTab = ref(0);
const tabs = ['全部', '服务合同', '框架协议', '保密协议'];

interface Contract {
  id: string;
  contractNo: string;
  title: string;
  type: string;
  status: 'active' | 'expired' | 'pending';
  signDate: string;
  expireDate: string;
}

const contracts = ref<Contract[]>([
  {
    id: '1',
    contractNo: 'CT20240101001',
    title: '家政服务合作协议',
    type: '服务合同',
    status: 'active',
    signDate: '2024-01-01',
    expireDate: '2025-01-01'
  },
  {
    id: '2',
    contractNo: 'CT20231201002',
    title: '平台服务框架协议',
    type: '框架协议',
    status: 'active',
    signDate: '2023-12-01',
    expireDate: '2024-12-01'
  },
  {
    id: '3',
    contractNo: 'CT20231115003',
    title: '保密及竞业禁止协议',
    type: '保密协议',
    status: 'active',
    signDate: '2023-11-15',
    expireDate: '2026-11-15'
  }
]);

const filteredContracts = computed(() => {
  if (activeTab.value === 0) return contracts.value;
  const types = ['', '服务合同', '框架协议', '保密协议'];
  return contracts.value.filter(c => c.type === types[activeTab.value]);
});

const getStatusClass = (status: string) => {
  switch(status) {
    case 'active': return 'status-success';
    case 'pending': return 'status-warning';
    case 'expired': return 'status-error';
    default: return 'status-default';
  }
};

const getStatusText = (status: string) => {
  switch(status) {
    case 'active': return '生效中';
    case 'pending': return '待签署';
    case 'expired': return '已过期';
    default: return status;
  }
};

const goBack = () => {
  uni.navigateBack();
};

const handleView = (contract: Contract) => {
  uni.showToast({ title: '预览合同', icon: 'none' });
};

const handleDownload = (contract: Contract) => {
  uni.showToast({ title: '开始下载...', icon: 'none' });
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #111827;
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
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
}

.header-center-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Tabs */
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
  color: #10b981;
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

.contract-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contract-card {
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
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 1px solid #374151;
  margin-bottom: 12px;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(96, 165, 250, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.card-subtitle {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
  margin-top: 2px;
}

.card-middle {
  margin-bottom: 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.text-right {
  text-align: right;
  align-items: flex-end;
}

.label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.value {
  font-size: 13px;
  color: #d1d5db;
  font-weight: 500;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  margin-left: 8px;
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

.h-8 { height: 32px; }
</style>
