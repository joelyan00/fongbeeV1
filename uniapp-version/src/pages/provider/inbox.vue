<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); display: flex; flex-direction: column;">
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="收件箱" 
      background-color="#0f172a"
      title-color="#ffffff"
      icon-color="#ffffff"
      :show-back="true"
      :fixed="true"
      @back="goBack"
    />

    <!-- Tabs - 2x2 Grid Style -->
    <view style="padding: 88px 16px 0 16px;">
      <view style="display: flex; flex-direction: row; gap: 12px;">
        <view 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :style="{
            flex: '1',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            borderRadius: '12px',
            background: activeTab === tab.key ? 'rgba(16, 185, 129, 0.15)' : '#1f2937',
            border: activeTab === tab.key ? '1px solid #10b981' : '1px solid #374151'
          }"
        >
          <text :style="{ fontSize: '14px', fontWeight: '600', color: activeTab === tab.key ? '#10b981' : '#9ca3af' }">{{ tab.label }}</text>
          <view v-if="tab.count > 0" :style="{
            minWidth: '20px',
            height: '20px',
            padding: '0 6px',
            marginLeft: '8px',
            background: activeTab === tab.key ? '#10b981' : '#374151',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }">
            <text :style="{ fontSize: '11px', fontWeight: '700', color: activeTab === tab.key ? '#ffffff' : '#9ca3af' }">{{ tab.count }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- List Area -->
    <scroll-view scroll-y @refresherrefresh="onRefresh" :refresher-enabled="true" :refresher-triggered="refreshing" style="flex: 1; padding: 16px;">
      <!-- Loading -->
      <view v-if="loading && !refreshing" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0;">
        <text style="color: #9ca3af;">加载中...</text>
      </view>

      <!-- Empty State -->
      <view v-else-if="currentList.length === 0" style="display: flex; flex-direction: column; align-items: center; padding: 60px 0;">
        <view style="width: 100px; height: 100px; background: rgba(16, 185, 129, 0.05); border-radius: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <view style="width: 70px; height: 70px; background: #1f2937; border: 1px solid #374151; border-radius: 35px; display: flex; align-items: center; justify-content: center;">
            <AppIcon :name="activeTab === 'messages' ? 'message-circle' : 'bell'" :size="36" color="#10b981" />
          </view>
        </view>
        <text style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">暂无{{ activeTab === 'messages' ? '消息' : '通知' }}</text>
        <text style="font-size: 14px; color: #6b7280;">当有新{{ activeTab === 'messages' ? '消息' : '动态' }}时，将在这里显示</text>
      </view>

      <!-- Message Sessions List -->
      <view v-else-if="activeTab === 'messages'">
        <view 
          v-for="session in sessions" 
          :key="session.id"
          @click="openChat(session)"
          style="background: #1f2937; border-radius: 16px; border: 1px solid #374151; margin-bottom: 12px; padding: 16px;"
        >
          <view style="display: flex; flex-direction: row; align-items: center; gap: 14px;">
            <view style="position: relative; width: 52px; height: 52px; flex-shrink: 0;">
              <image :src="session.otherParty?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.otherParty?.name || 'U')}&background=random`" style="width: 100%; height: 100%; border-radius: 50%; background: #374151;" mode="aspectFill" />
              <view v-if="session.unreadCount > 0" style="position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px; padding: 0 4px; background: #ef4444; border: 2px solid #1f2937; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <text style="font-size: 10px; color: #ffffff; font-weight: 700;">{{ session.unreadCount }}</text>
              </view>
            </view>
            <view style="flex: 1; min-width: 0;">
              <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <text style="font-size: 15px; font-weight: 700; color: #ffffff;">订单号：{{ session.orderNo }}</text>
                <text style="font-size: 11px; color: #6b7280;">{{ formatTime(session.updatedAt) }}</text>
              </view>
              <view style="margin-bottom: 4px;">
                <text style="font-size: 10px; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600;">{{ session.otherParty?.name || '用户' }} | {{ session.serviceName }}</text>
              </view>
              <text style="font-size: 13px; color: #9ca3af;">{{ session.lastMessage?.content || '(暂无消息)' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- System Notifications List -->
      <view v-else-if="activeTab === 'notifications'">
        <view 
          v-for="note in notifications" 
          :key="note.id"
          @click="handleNotificationClick(note)"
          :style="{
            background: '#1f2937',
            borderRadius: '12px',
            border: '1px solid #374151',
            borderLeft: !note.is_read ? '3px solid #10b981' : '1px solid #374151',
            marginBottom: '12px',
            padding: '16px'
          }"
        >
          <view style="display: flex; flex-direction: row; align-items: flex-start; gap: 12px;">
            <view :style="{
              width: '40px', height: '40px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0',
              background: note.type === 'order' ? 'rgba(16, 185, 129, 0.1)' : note.type === 'payment' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'
            }">
              <AppIcon :name="getIconName(note.type)" :size="20" :color="getIconColor(note.type)" />
            </view>
            <view style="flex: 1; min-width: 0;">
              <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                <text style="font-size: 15px; font-weight: 600; color: #ffffff;">{{ note.title }}</text>
                <text style="font-size: 11px; color: #6b7280; white-space: nowrap; margin-left: 8px;">{{ formatTime(note.created_at) }}</text>
              </view>
              <text style="font-size: 13px; color: #9ca3af; line-height: 20px;">{{ note.content }}</text>
            </view>
            <view v-if="!note.is_read" style="width: 8px; height: 8px; border-radius: 4px; background: #10b981; margin-top: 6px; flex-shrink: 0;"></view>
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
      url: `${API_BASE_URL}/orders-v2/messages/sessions?role=provider`,
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
      url: `${API_BASE_URL}/notifications?role=provider`,
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
      url: `/pages/provider/order-detail?id=${note.related_order_id}`
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
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

const getIconClass = (type: string) => {
  const map: any = {
    'order': 'bg-teal-500/10',
    'system': 'bg-blue-500/10',
    'payment': 'bg-amber-500/10'
  };
  return map[type] || 'bg-gray-700/30';
};

const getIconName = (type: string) => {
  const map: any = {
    'order': 'clipboard',
    'system': 'bell',
    'payment': 'credit-card'
  };
  return map[type] || 'info';
};

const getIconColor = (type: string) => {
  const map: any = {
    'order': '#10b981',
    'system': '#3b82f6',
    'payment': '#f59e0b'
  };
  return map[type] || '#9ca3af';
};
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: #111827;
  /* padding-top handled by GlobalNavbar */
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Header styles removed, replaced by GlobalNavbar */

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

/* List Area */
.list-container {
  padding: 0 16px 20px 16px;
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
  padding: 60px 0;
}

.empty-circle {
  width: 100px;
  height: 100px;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #6b7280;
}

/* Session List (Direct Messages) */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-card {
  background: #1f2937;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #374151;
  transition: all 0.2s ease;
}

.session-card:active {
  transform: scale(0.98);
  background: #252f3f;
}

.session-body {
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
}

.avatar-wrap {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #374151;
}

.unread-count-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ef4444;
  border: 2px solid #1f2937;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.unread-count-badge .badge-text {
  font-size: 10px;
  color: #fff;
  font-weight: 700;
}

.session-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.session-name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.session-time {
  font-size: 11px;
  color: #6b7280;
}

.session-service {
  margin-bottom: 4px;
}

.service-tag {
  font-size: 10px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.session-preview {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 480rpx;
}

/* Notification List */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-card {
  background: #1f2937;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #374151;
}

.card-unread {
  border-left: 3px solid #10b981;
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
