<template>
  <view class="page-container">
    <!-- Gradient Header -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view @click="goBack" class="back-btn">
          <AppIcon name="arrow-left" :size="22" color="#ffffff" />
        </view>
        <view class="header-info">
          <text class="header-title">标准服务管理</text>
          <text class="header-subtitle">管理您的服务，让更多客户找到您</text>
        </view>
      </view>
      
      <!-- Stats Cards -->
      <view class="stats-row">
        <view class="stat-card">
          <text class="stat-number">{{ getTabCount('all') }}</text>
          <text class="stat-label">全部服务</text>
        </view>
        <view class="stat-card stat-card-success">
          <text class="stat-number">{{ getTabCount('approved') }}</text>
          <text class="stat-label">已上架</text>
        </view>
        <view class="stat-card stat-card-warning">
          <text class="stat-number">{{ getTabCount('pending') }}</text>
          <text class="stat-label">审核中</text>
        </view>
      </view>
    </view>
    
    <!-- Filter Tabs - Horizontal Scroll -->
    <view class="tabs-container">
      <scroll-view scroll-x :show-scrollbar="false" class="tabs-scroll">
        <view class="tabs-row">
          <view 
            v-for="tab in statusTabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['tab-item', activeTab === tab.key ? 'tab-active' : '']"
          >
            <view :class="['tab-icon-wrap', `tab-icon-${tab.key}`]">
              <AppIcon :name="tab.icon" :size="16" :color="activeTab === tab.key ? '#ffffff' : tab.iconColor" />
            </view>
            <text :class="['tab-label', activeTab === tab.key ? 'tab-label-active' : '']">{{ tab.label }}</text>
            <view v-if="getTabCount(tab.key) > 0" :class="['tab-badge', activeTab === tab.key ? 'badge-active' : '']">
              <text class="badge-text">{{ getTabCount(tab.key) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Service List -->
    <scroll-view scroll-y class="list-container" :style="{ height: listHeight }">
      <!-- Loading State -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- Empty State -->
      <view v-else-if="filteredServices.length === 0" class="empty-container">
        <view class="empty-illustration">
          <view class="empty-circle">
            <view class="empty-icon-wrap">
              <AppIcon name="package" :size="48" color="#10b981" />
            </view>
          </view>
          <view class="empty-decorations">
            <view class="deco-dot deco-1"></view>
            <view class="deco-dot deco-2"></view>
            <view class="deco-dot deco-3"></view>
          </view>
        </view>
        <text class="empty-title">还没有服务哦~</text>
        <text class="empty-desc">点击下方按钮，创建您的第一个标准服务</text>
        <text class="empty-tip">📌 完善服务信息可获得更多曝光</text>
      </view>

      <!-- Service Cards -->
      <view v-else class="service-list">
        <view 
          v-for="service in filteredServices" 
          :key="service.id"
          class="service-card"
          @click="viewService(service)"
        >
          <!-- Card Header with Status -->
          <view class="card-header">
            <view :class="['status-tag', `status-${service.status}`]">
              <view class="status-dot"></view>
              <text class="status-text">{{ getStatusLabel(service.status) }}</text>
            </view>
            <text class="service-id">ID: {{ service.id.slice(0, 8) }}</text>
          </view>
          
          <!-- Card Body -->
          <view class="card-body">
            <view class="service-image-wrap">
              <image v-if="service.image" :src="service.image" mode="aspectFill" class="service-image" />
              <view v-else class="service-placeholder">
                <text class="placeholder-emoji">🛠️</text>
              </view>
            </view>
            <view class="service-info">
              <text class="service-title">{{ service.title }}</text>
              <view class="service-meta">
                <view class="meta-item">
                  <AppIcon name="tag" :size="12" color="#9ca3af" />
                  <text class="meta-text">{{ service.category }}</text>
                </view>
              </view>
              <view class="price-row">
                <text class="price-label">服务价格</text>
                <view class="price-value-wrap">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ service.price }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- Card Footer -->
          <view class="card-footer">
            <text class="create-time">{{ formatDate(service.created_at) }} 创建</text>
            <view class="action-buttons">
              <view 
                v-if="service.status === 'draft'" 
                @click.stop="submitService(service)"
                class="btn btn-primary"
              >
                <text class="btn-text">提交审核</text>
              </view>
              <view 
                @click.stop="editService(service)" 
                class="btn btn-secondary"
              >
                <AppIcon name="edit" :size="14" color="#6b7280" />
                <text class="btn-text btn-text-gray">编辑</text>
              </view>
              <view 
                @click.stop="deleteService(service)" 
                class="btn btn-danger"
              >
                <AppIcon name="trash" :size="14" color="#ef4444" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Floating Action Button -->
    <view class="fab-container">
      <view @click="createService" class="fab-button">
        <view class="fab-icon">
          <AppIcon name="plus" :size="24" color="#ffffff" />
        </view>
        <text class="fab-text">创建服务</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  image?: string;
  created_at: string;
}

const loading = ref(false);
const activeTab = ref('all');
const listHeight = ref('calc(100vh - 320px)');

const statusTabs = [
  { key: 'all', label: '全部', icon: 'grid', iconColor: '#6b7280' },
  { key: 'draft', label: '仓库中', icon: 'inbox', iconColor: '#6b7280' },
  { key: 'pending', label: '审核中', icon: 'clock', iconColor: '#f59e0b' },
  { key: 'approved', label: '已上架', icon: 'check-circle', iconColor: '#10b981' },
  { key: 'rejected', label: '未通过', icon: 'x-circle', iconColor: '#ef4444' },
];

// Mock services - replace with API data
const services = ref<Service[]>([
  // Example data commented out
  // { id: '1abc2345', title: '家庭深度保洁服务', category: '清洁服务', price: 150, status: 'approved', created_at: '2024-01-05T10:00:00Z' },
  // { id: '2def6789', title: '空调清洗维护', category: '家电维修', price: 120, status: 'pending', created_at: '2024-01-04T15:30:00Z' },
]);

const filteredServices = computed(() => {
  if (activeTab.value === 'all') return services.value;
  return services.value.filter(s => s.status === activeTab.value);
});

const getTabCount = (key: string) => {
  if (key === 'all') return services.value.length;
  return services.value.filter(s => s.status === key).length;
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'draft': '草稿',
    'pending': '审核中',
    'approved': '已上架',
    'rejected': '未通过',
  };
  return map[status] || status;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const goBack = () => {
  uni.navigateBack();
};

const createService = () => {
  uni.navigateTo({
    url: '/pages/provider/select-services'
  });
};

const viewService = (service: Service) => {
  uni.showToast({ title: '查看服务详情', icon: 'none' });
};

const editService = (service: Service) => {
  uni.showToast({ title: '编辑服务', icon: 'none' });
};

const deleteService = (service: Service) => {
  uni.showModal({
    title: '删除服务',
    content: '确定要删除这个服务吗？此操作不可恢复。',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已删除', icon: 'success' });
      }
    }
  });
};

const submitService = (service: Service) => {
  uni.showModal({
    title: '提交审核',
    content: '确定要提交此服务进行审核吗？审核通过后将自动上架。',
    confirmColor: '#10b981',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已提交审核', icon: 'success' });
      }
    }
  });
};

onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #f9fafb 100%);
  padding-top: env(safe-area-inset-top);
}

/* Header */
.header {
  position: relative;
  padding-bottom: 60px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
  border-radius: 0 0 24px 24px;
}

.header-content {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  margin-left: 12px;
  flex: 1;
}

.header-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  display: block;
}

.header-subtitle {
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  margin-top: 4px;
  display: block;
}

/* Stats Cards */
.stats-row {
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0 16px;
  margin-top: 16px;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.stat-card-success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.stat-card-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* Tabs */
.tabs-container {
  padding: 16px 0 8px 0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 0 16px;
}

.tab-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.tab-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.tab-icon-wrap {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.tab-active .tab-icon-wrap {
  background: rgba(255,255,255,0.2);
}

.tab-label {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

.tab-label-active {
  color: #ffffff;
}

.tab-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-active {
  background: rgba(255,255,255,0.3);
}

.badge-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.badge-active .badge-text {
  color: #ffffff;
}

/* List Container */
.list-container {
  padding: 0 16px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #9ca3af;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.empty-illustration {
  position: relative;
  width: 140px;
  height: 140px;
  margin-bottom: 24px;
}

.empty-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 10px;
  left: 10px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: #ffffff;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
}

.empty-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.deco-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background: #10b981;
}

.deco-1 { top: 0; right: 20px; opacity: 0.3; }
.deco-2 { bottom: 20px; right: 0; width: 8px; height: 8px; opacity: 0.5; }
.deco-3 { top: 40px; left: 0; width: 6px; height: 6px; opacity: 0.4; }

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.empty-tip {
  margin-top: 20px;
  font-size: 13px;
  color: #059669;
  background: #ecfdf5;
  padding: 10px 16px;
  border-radius: 20px;
}

/* Service Cards */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 100px;
}

.service-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  border: 1px solid #f3f4f6;
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
}

.status-tag {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
}

.status-draft { background: #f3f4f6; }
.status-pending { background: #fef3c7; }
.status-approved { background: #d1fae5; }
.status-rejected { background: #fee2e2; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
}

.status-draft .status-dot { background: #6b7280; }
.status-pending .status-dot { background: #f59e0b; }
.status-approved .status-dot { background: #10b981; }
.status-rejected .status-dot { background: #ef4444; }

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.status-draft .status-text { color: #6b7280; }
.status-pending .status-text { color: #b45309; }
.status-approved .status-text { color: #059669; }
.status-rejected .status-text { color: #dc2626; }

.service-id {
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}

.card-body {
  display: flex;
  flex-direction: row;
  gap: 14px;
  padding: 16px;
}

.service-image-wrap {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.service-image {
  width: 100%;
  height: 100%;
}

.service-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-emoji {
  font-size: 32px;
}

.service-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.service-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-meta {
  margin-top: 6px;
}

.meta-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.meta-text {
  font-size: 12px;
  color: #9ca3af;
}

.price-row {
  margin-top: auto;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
}

.price-label {
  font-size: 12px;
  color: #9ca3af;
}

.price-value-wrap {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
}

.price-value {
  font-size: 22px;
  color: #10b981;
  font-weight: 700;
  margin-left: 2px;
}

.card-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.create-time {
  font-size: 12px;
  color: #9ca3af;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-secondary {
  background: #f3f4f6;
}

.btn-danger {
  background: #fee2e2;
  padding: 8px;
}

.btn-text {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.btn-text-gray {
  color: #6b7280;
}

/* Floating Action Button */
.fab-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(249,250,251,0) 0%, rgba(249,250,251,1) 30%);
}

.fab-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.fab-icon {
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
