<template>
  <view class="page-container">
    <!-- Gradient Header (Minimalist) -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view @click="goBack" class="back-btn">
          <AppIcon name="arrow-left" :size="22" color="#ffffff" />
        </view>
        <view class="header-info">
          <text class="header-title">收件箱</text>
        </view>
      </view>
    </view>

    <!-- Tab Filters (Fixed Center Layout) -->
    <view class="tabs-wrapper">
       <view class="tabs-row">
         <view 
           v-for="tab in tabs" 
           :key="tab.key"
           @click="activeTab = tab.key"
           :class="['tab-item', activeTab === tab.key ? 'tab-active' : 'tab-inactive']"
         >
           <text :class="['tab-label', activeTab === tab.key ? 'tab-label-active' : '']">{{ tab.label }}</text>
           <view v-if="tab.count > 0" :class="['tab-badge', activeTab === tab.key ? 'badge-active' : '']">
             <text class="badge-text">{{ tab.count }}</text>
           </view>
         </view>
       </view>
    </view>

    <!-- Message List -->
    <scroll-view scroll-y class="list-container" :style="{ height: listHeight }">
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="filteredMessages.length === 0" class="empty-container">
        <view class="empty-illustration">
          <view class="empty-circle">
            <view class="empty-icon-wrap">
              <AppIcon name="message-square" :size="48" color="#10b981" />
            </view>
          </view>
        </view>
        <text class="empty-title">暂无消息</text>
        <text class="empty-desc">当有新消息时，将在这里显示</text>
      </view>

      <view v-else class="message-list">
        <view 
          v-for="msg in filteredMessages" 
          :key="msg.id"
          :class="['message-card', msg.read ? 'card-read' : 'card-unread']"
          @click="openMessage(msg)"
        >
          <view class="card-body">
            <view :class="['icon-wrap', getIconClass(msg.type)]">
              <AppIcon :name="getIconName(msg.type)" :size="20" :color="getIconColor(msg.type)" />
            </view>
            <view class="content-wrap">
              <view class="msg-header">
                <text class="msg-title">{{ msg.title }}</text>
                <text class="msg-time">{{ msg.time }}</text>
              </view>
              <text class="msg-preview">{{ msg.preview }}</text>
            </view>
            <view v-if="!msg.read" class="unread-dot"></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';

const loading = ref(false);
const activeTab = ref('all');
const listHeight = ref('calc(100vh - 160px)'); 

const tabs = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'unread', label: '未读', count: 0 },
  { key: 'order', label: '订单', count: 0 },
  { key: 'system', label: '系统通知', count: 0 },
];

// Mock messages
const messages = ref<any[]>([
     // { id: 1, type: 'order', title: '新订单通知', preview: '您有一个新的订单需要处理...', time: '10分钟前', read: false },
]);

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') return messages.value;
  if (activeTab.value === 'unread') return messages.value.filter(m => !m.read);
  return messages.value.filter(m => m.type === activeTab.value);
});

const goBack = () => {
  uni.navigateBack();
};

const openMessage = (msg: any) => {
  msg.read = true;
  console.log('Open message:', msg);
};

const getIconClass = (type: string) => {
  const map: any = {
    'order': 'bg-teal-500/10',
    'system': 'bg-blue-500/10',
    'other': 'bg-pink-500/10'
  };
  return map[type] || 'bg-gray-700/30';
};

const getIconName = (type: string) => {
  const map: any = {
    'order': 'clipboard',
    'system': 'bell',
    'other': 'message-circle'
  };
  return map[type] || 'message-square';
};

const getIconColor = (type: string) => {
  const map: any = {
    'order': '#10b981',
    'system': '#3b82f6',
    'other': '#ec4899'
  };
  return map[type] || '#9ca3af';
};
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: #111827;
  padding-top: env(safe-area-inset-top);
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Header */
.header {
  position: relative;
  border-bottom: 1px solid #374151;
  background: #1f2937;
}

.header-bg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.header-content {
  position: relative;
  z-index: 10;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  display: block;
}

/* Tabs Wrapper (Fixed Center Layout) */
.tabs-wrapper {
  margin: 16px 0;
  padding: 0 16px; /* Side padding */
}

/* Flex Row for Fixed Items */
.tabs-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px; /* Small gap between items */
  width: 100%;
}

/* Minimalist Chip Styles */
.tab-item {
  flex: 1; /* Divide space equally */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  height: 36px;
  border-radius: 100px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  background: #1f2937;
  border: 1px solid #374151;
}

.tab-inactive {
  background: transparent;
  border-color: #374151;
}

.tab-active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.tab-label {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

.tab-label-active {
  color: #10b981;
  font-weight: 600;
}

.tab-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  margin-left: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-active {
  background: #10b981;
}

.badge-text {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 600;
}

.badge-active .badge-text {
  color: #ffffff;
}

/* List Container */
.list-container {
  padding: 0 20px 20px 20px;
  width: 100%;
  box-sizing: border-box;
}

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
  padding: 40px 0;
}

.empty-circle {
  width: 100px;
  height: 100px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon-wrap {
  width: 70px;
  height: 70px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #9ca3af;
}

/* Message List */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  background: #1f2937;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  border: 1px solid #374151;
}

.card-read {
  border-color: #374151;
}
.card-unread {
  border-color: rgba(16, 185, 129, 0.4);
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.content-wrap {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.msg-title {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.msg-time {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  margin-left: 8px;
}

.msg-preview {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #10b981;
  margin-top: 6px;
  flex-shrink: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
