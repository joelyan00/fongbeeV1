<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#059669"/>
      </view>
      <text class="header-title">收件箱</text>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Unified Tab Filters -->
    <view class="tabs-wrapper px-4 py-3">
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

    <!-- List Area -->
    <scroll-view scroll-y class="list-container flex-1 h-0" @refresherrefresh="onRefresh" :refresher-enabled="true" :refresher-triggered="refreshing">
      <view v-if="loading && !refreshing" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- Empty State -->
      <view v-else-if="currentList.length === 0" class="empty-container">
        <view class="empty-circle">
          <AppIcon :name="activeTab === 'messages' ? 'message-circle' : 'bell'" :size="48" color="#d1d5db" />
        </view>
        <text class="empty-title">暂无{{ activeTab === 'messages' ? '消息' : '通知' }}</text>
        <text class="empty-desc">当有新{{ activeTab === 'messages' ? '消息' : '动态' }}时，将在这里显示</text>
      </view>

      <!-- Message Sessions List -->
      <view v-else-if="activeTab === 'messages'" class="session-list px-4">
        <view 
          v-for="session in sessions" 
          :key="session.id"
          class="session-card"
          @click="openChat(session)"
        >
          <view class="session-body">
            <view class="avatar-wrap">
              <image :src="session.otherParty?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.otherParty?.name || 'U')}&background=random`" class="avatar-img" mode="aspectFill" />
              <view v-if="session.unreadCount > 0" class="unread-count-badge">
                <text class="badge-text">{{ session.unreadCount }}</text>
              </view>
            </view>
            <view class="content-wrap">
              <view class="session-header">
                <text class="session-name">{{ session.otherParty?.name || '服务商' }}</text>
                <text class="session-time">{{ formatTime(session.updatedAt) }}</text>
              </view>
              <view class="session-service">
                <text class="service-tag">{{ session.serviceName }}</text>
              </view>
              <text class="session-preview">{{ session.lastMessage?.content || '(暂无消息)' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- System Notifications List -->
      <view v-else-if="activeTab === 'notifications'" class="notification-list">
        <view 
          v-for="note in notifications" 
          :key="note.id"
          :class="['note-card', note.is_read ? '' : 'unread']"
          @click="handleNotificationClick(note)"
        >
          <view class="card-body">
            <view class="icon-wrap" :class="getIconClass(note.type)">
              <AppIcon :name="getIconName(note.type)" :size="20" color="#fff" />
            </view>
            <view class="content-wrap">
              <view class="msg-header">
                <text class="msg-title">{{ note.title }}</text>
                <text class="msg-time">{{ formatTime(note.created_at) }}</text>
              </view>
              <text class="msg-preview">{{ note.content }}</text>
            </view>
            <view v-if="!note.is_read" class="unread-dot"></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { API_BASE_URL, getToken } from '@/services/api';

const loading = ref(true);
const refreshing = ref(false);
const activeTab = ref('messages');

const sessions = ref<any[]>([]);
const notifications = ref<any[]>([]);

const tabs = computed(() => [
  { key: 'messages', label: '沟通', count: sessions.value.reduce((sum, s) => sum + (s.unreadCount || 0), 0) },
  { key: 'notifications', label: '通知', count: notifications.value.filter(n => !n.is_read).length },
]);

const currentList = computed(() => {
  return activeTab.value === 'messages' ? sessions.value : notifications.value;
});

onShow(() => {
  fetchData();
});

const onRefresh = async () => {
  refreshing.value = true;
  await fetchData();
  refreshing.value = false;
};

const fetchData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchSessions(),
      fetchNotifications()
    ]);
  } finally {
    loading.value = false;
  }
};

const fetchSessions = async () => {
  try {
    const token = await getToken();
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/messages/sessions?role=user`,
      header: { Authorization: `Bearer ${token}` }
    });
    const data = res.data as any;
    if (data.success) {
      sessions.value = data.sessions || [];
    }
  } catch (e) {
    console.error('Fetch sessions failed:', e);
  }
};

const fetchNotifications = async () => {
  try {
    const token = await getToken();
    const res = await uni.request({
      url: `${API_BASE_URL}/notifications`,
      header: { Authorization: `Bearer ${token}` }
    });
    const data = res.data as any;
    if (data.success) {
      // Filter out chat messages from notifications list as they are in sessions now
      notifications.value = (data.notifications || []).filter((n: any) => n.type !== 'chat');
    }
  } catch (e) {
    console.error('Fetch notifications failed:', e);
  }
};

const openChat = (session: any) => {
  uni.navigateTo({
    url: `/pages/order/order-chat?id=${session.id}&orderNo=${session.orderNo}`
  });
};

const handleNotificationClick = async (note: any) => {
  // Mark as read
  if (!note.is_read) {
    const token = await getToken();
    uni.request({
      url: `${API_BASE_URL}/notifications/${note.id}/read`,
      method: 'POST',
      header: { Authorization: `Bearer ${token}` }
    });
    note.is_read = true;
  }

  // Handle navigation based on related_order_id or extra_data
  if (note.related_order_id) {
    uni.navigateTo({
      url: `/pages/index/index?tab=profile&orderId=${note.related_order_id}`
    });
  }
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  
  if (d.toDateString() === now.toDateString()) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }
  
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // Fallback to home page or personal center
    uni.reLaunch({
      url: '/pages/index/index?tab=profile'
    });
  }
};

const getIconName = (type: string) => {
  const icons: Record<string, string> = {
    'order': 'package',
    'payment': 'credit-card',
    'system': 'bell'
  };
  return icons[type] || 'bell';
};

const getIconClass = (type: string) => {
  const classes: Record<string, string> = {
    'order': 'bg-blue-500',
    'payment': 'bg-amber-500',
    'system': 'bg-emerald-500'
  };
  return classes[type] || 'bg-gray-400';
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.header {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.back-btn, .placeholder-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

/* Tabs */
.tabs-row {
  display: flex;
  flex-direction: row;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  border-radius: 10px;
  transition: all 0.2s;
}

.tab-active {
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tab-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.tab-label-active {
  color: #059669;
  font-weight: 600;
}

.tab-badge {
  margin-left: 6px;
  min-width: 16px;
  height: 16px;
  background: #ef4444;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.badge-text {
  font-size: 10px;
  color: #fff;
  font-weight: 700;
}

/* Session Cards */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 10px;
}

.session-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.session-body {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.avatar-wrap {
  position: relative;
  width: 50px;
  height: 50px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 25px;
  background: #f3f4f6;
}

.unread-count-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  background: #ef4444;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.content-wrap {
  flex: 1;
  min-width: 0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.session-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.session-time {
  font-size: 12px;
  color: #9ca3af;
}

.service-tag {
  font-size: 11px;
  color: #059669;
  background: #ecfdf5;
  padding: 1px 6px;
  border-radius: 4px;
}

.session-preview {
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

/* Notification List */
.notification-list {
  padding: 0 16px;
}

.note-card {
  margin-bottom: 12px;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
}

.note-card.unread {
  background-color: #f0fdf4;
}

.card-body {
  display: flex;
  gap: 12px;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-blue-500 { background-color: #3b82f6; }
.bg-amber-500 { background-color: #f59e0b; }
.bg-emerald-500 { background-color: #10b981; }
.bg-gray-400 { background-color: #9ca3af; }

.msg-header {
  display: flex;
  justify-content: space-between;
}

.msg-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.msg-time {
  font-size: 12px;
  color: #9ca3af;
}

.msg-preview {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #10b981;
  margin-top: 4px;
}

.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-title {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.empty-desc {
  font-size: 14px;
  color: #9ca3af;
}
</style>
