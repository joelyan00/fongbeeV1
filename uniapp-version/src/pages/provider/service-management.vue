<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">标准服务管理</text>
      <view class="placeholder-btn"></view>
    </view>
    
    <!-- Filter Tabs (Minimalist Chips) -->
    <view class="tabs-section">
      <scroll-view 
        scroll-x 
        :show-scrollbar="false" 
        class="tabs-scroll"
        @scroll="onTabScroll"
      >
        <view class="tabs-row">
          <view 
            v-for="tab in statusTabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['tab-item', activeTab === tab.key ? 'tab-active' : 'tab-inactive']"
          >
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
                  <text class="price-symbol">$</text>
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
        <text class="fab-text">创建标准服务</text>
      </view>
    </view>

    <!-- Professional PC Reminder Modal -->
    <view v-if="showPCModal" class="modal-overlay" @click="showPCModal = false" @touchmove.stop.prevent>
      <view class="modal-content animate-pop" @click.stop>
        <view class="modal-icon-bg">
          <AppIcon name="monitor" :size="48" color="#10b981" />
        </view>
        
        <view class="modal-text-group">
          <text class="modal-title">请使用电脑端操作</text>
          <text class="modal-body">为了提供更优质的编辑体验，标准服务的创建与深度管理需要在电脑端后台进行。</text>
        </view>

        <view class="modal-tip-box">
          <AppIcon name="info" :size="14" color="#9ca3af" />
          <text class="modal-tip-text">电脑端访问地址与小程序账号通用</text>
        </view>

        <view class="modal-btn" @click="showPCModal = false">
          <text class="modal-btn-text">我知道了</text>
        </view>
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
  status: 'editing' | 'draft' | 'pending' | 'approved' | 'rejected';
  image?: string;
  created_at: string;
}

const loading = ref(false);
const activeTab = ref('all');
const listHeight = ref('calc(100vh - 280px)');
const showPCModal = ref(false);

// Scroll indicator
const scrollPosition = ref(0);
const scrollThumbWidth = ref(30);

const onTabScroll = (e: any) => {
  const scrollLeft = e.detail.scrollLeft;
  const scrollWidth = e.detail.scrollWidth;
  const clientWidth = 375; 
  const maxScroll = scrollWidth - clientWidth;
  if (maxScroll > 0) {
    scrollPosition.value = (scrollLeft / maxScroll) * (100 - scrollThumbWidth.value);
  }
};

const statusTabs = [
  { key: 'all', label: '全部', icon: 'grid', iconColor: '#6b7280' },
  { key: 'editing', label: '编辑中', icon: 'edit', iconColor: '#3b82f6' },
  { key: 'pending', label: '审核中', icon: 'clock', iconColor: '#f59e0b' },
  { key: 'approved', label: '已上架', icon: 'check-circle', iconColor: '#10b981' },
  { key: 'rejected', label: '未通过', icon: 'x-circle', iconColor: '#ef4444' },
  { key: 'draft', label: '仓库中', icon: 'inbox', iconColor: '#6b7280' },
];

const services = ref<Service[]>([]);

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
    'editing': '编辑中',
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
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // No history, navigate to provider workspace
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

const createService = () => {
  showPCModal.value = true;
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
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
}

/* Header */
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

/* Tabs Section */
.tabs-section {
  background: #1f2937;
  /* Removed border/shadow/radius container style to make it "flat" in the page flow? 
     Or keep chips on page bg? 
     User said "Remove overlap".
     If I make chips just sit on page bg (#111827), it's very clean.
  */
  margin: 16px 0; /* Vertical spacing */
  padding: 0;
  /* Remove container styling */
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0 16px;
}

/* Minimalist Chip Styles */
.tab-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid transparent;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background: #1f2937; /* Dark bubbles on dark bg */
  border: 1px solid #374151;
}

.tab-active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.tab-label {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

.tab-label-active {
  color: #10b981;
  font-weight: 600;
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-active {
  background: #10b981;
}

.badge-text {
  font-size: 11px;
  color: #9ca3af;
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
  background: rgba(16, 185, 129, 0.1);
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
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
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
  color: #ffffff;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
}

.empty-tip {
  margin-top: 20px;
  font-size: 13px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
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
  background: #1f2937;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  border: 1px solid #374151;
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #374151;
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
.status-editing { background: #dbeafe; }
.status-pending { background: #fef3c7; }
.status-approved { background: #d1fae5; }
.status-rejected { background: #fee2e2; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
}

.status-draft .status-dot { background: #6b7280; }
.status-editing .status-dot { background: #3b82f6; }
.status-pending .status-dot { background: #f59e0b; }
.status-approved .status-dot { background: #10b981; }
.status-rejected .status-dot { background: #ef4444; }

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.status-draft .status-text { color: #6b7280; }
.status-editing .status-text { color: #2563eb; }
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
  background: rgba(16, 185, 129, 0.1);
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
  color: #ffffff;
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
  font-size: 18px;
  color: #ffffff;
  font-weight: 700;
  margin-left: 2px;
}

/* Card Footer */
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #374151;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.create-time {
  font-size: 12px;
  color: #6b7280;
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
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #10b981;
}

.btn-secondary {
  background: #374151;
  border: 1px solid #4b5563;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 6px 8px; /* Square-ish for icon only */
}

.btn-text {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
}

.btn-text-gray {
  color: #d1d5db;
}

/* FAB */
.fab-container {
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 50;
  pointer-events: none; /* Let clicks pass through container */
}

.fab-button {
  pointer-events: auto;
  background: #10b981;
  border-radius: 28px;
  padding: 12px 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

.fab-button:active {
  background: #059669;
}

.fab-text {
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Professional Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40px;
}

.modal-content {
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-icon-bg {
  width: 100px;
  height: 100px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.modal-text-group {
  text-align: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  display: block;
}

.modal-body {
  font-size: 15px;
  color: #9ca3af;
  line-height: 1.6;
}

.modal-tip-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
}

.modal-tip-text {
  font-size: 13px;
  color: #9ca3af;
}

.modal-btn {
  width: 100%;
  background: #10b981;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.modal-btn:active {
  transform: scale(0.98);
  background: #059669;
}

.modal-btn-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.animate-pop {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
