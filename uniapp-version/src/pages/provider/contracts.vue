<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); width: 100%; overflow-x: hidden; box-sizing: border-box;">
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="合同管理" 
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

    <!-- Contract List -->
    <scroll-view scroll-y style="height: calc(100vh - 180px); padding: 16px; box-sizing: border-box; width: 100%; overflow-x: hidden;">
      <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0;">
        <text style="color: #9ca3af;">加载中...</text>
      </view>
      
      <view v-else-if="filteredContracts.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0;">
        <view style="width: 80px; height: 80px; background: #1f2937; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <AppIcon name="file" :size="40" color="#6b7280" />
        </view>
        <text style="font-size: 14px; color: #6b7280;">暂无合同记录</text>
      </view>

      <view v-else>
        <view v-for="contract in filteredContracts" :key="contract.id" 
          style="background: #1f2937; border-radius: 16px; padding: 16px; margin-bottom: 12px; border: 1px solid #374151; box-sizing: border-box; overflow: hidden;">
          
          <!-- Card Top: Title & Status -->
          <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <view style="display: flex; flex-direction: row; align-items: center; gap: 12px; flex: 1; min-width: 0;">
              <view style="width: 40px; height: 40px; border-radius: 10px; background: rgba(96, 165, 250, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <AppIcon name="file" :size="20" color="#60a5fa" />
              </view>
              <view style="flex: 1; min-width: 0;">
                <text style="font-size: 15px; font-weight: 600; color: #ffffff; display: block; margin-bottom: 4px;">{{ contract.title }}</text>
                <text style="font-size: 12px; color: #6b7280; display: block;">{{ contract.contractNo }}</text>
              </view>
            </view>
            <view :style="{
              padding: '4px 10px',
              borderRadius: '20px',
              marginLeft: '8px',
              flexShrink: '0',
              background: contract.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : contract.status === 'expired' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'
            }">
              <text :style="{
                fontSize: '11px',
                color: contract.status === 'active' ? '#10b981' : contract.status === 'expired' ? '#ef4444' : '#f59e0b'
              }">{{ getStatusText(contract.status) }}</text>
            </view>
          </view>
          
          <!-- Card Middle: Dates -->
          <view style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <view>
              <text style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 4px;">签订日期</text>
              <text style="font-size: 13px; color: #e5e7eb;">{{ contract.signDate }}</text>
            </view>
            <view style="text-align: right;">
              <text style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 4px;">到期日期</text>
              <text style="font-size: 13px; color: #e5e7eb;">{{ contract.expireDate }}</text>
            </view>
          </view>
          
          <!-- Card Bottom: Actions -->
          <view style="display: flex; flex-direction: row; gap: 12px;">
            <view @click="handleView(contract)" style="flex: 1; padding: 10px; background: #374151; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <text style="font-size: 14px; color: #e5e7eb;">预览合同</text>
            </view>
            <view @click="handleDownload(contract)" style="flex: 1; padding: 10px; background: #3b82f6; border-radius: 8px; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 4px;">
              <AppIcon name="download" :size="14" color="#ffffff" />
              <text style="font-size: 14px; color: #ffffff;">下载 PDF</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Safe Area -->
      <view style="height: 32px;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';

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
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
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
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
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
