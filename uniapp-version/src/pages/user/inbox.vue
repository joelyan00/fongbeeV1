<template>
  <view class="inbox-page">
    <!-- Header -->
    <view class="header">
      <view class="header-row">
        <view @click="goBack" class="header-back">
          <AppIcon name="chevron-left" :size="28" color="#059669" />
        </view>
        <text class="header-title">收件箱</text>
        <view v-if="notifications.length > 0" @click="markAllRead" class="header-action">
          <text class="header-action-text">全部已读</text>
        </view>
        <view v-else class="header-placeholder"></view>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <view class="spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Empty State -->
    <view v-else-if="notifications.length === 0" class="empty-state">
      <AppIcon name="inbox" :size="64" color="#d1d5db" />
      <text class="empty-title">暂无消息</text>
      <text class="empty-subtitle">您的通知会显示在这里</text>
    </view>

    <!-- Notification List -->
    <scroll-view v-else scroll-y class="notification-list" @scrolltolower="loadMore">
      <view 
        v-for="item in notifications" 
        :key="item.id" 
        class="notification-item"
        :class="{ 'unread': !item.is_read }"
        @click="handleNotificationClick(item)"
      >
        <!-- Icon -->
        <view class="notification-icon" :class="getIconClass(item.type)">
          <AppIcon :name="getIcon(item.type)" :size="20" color="#fff" />
        </view>
        
        <!-- Content -->
        <view class="notification-content">
          <view class="notification-header">
            <text class="notification-title">{{ item.title }}</text>
            <view v-if="!item.is_read" class="unread-dot"></view>
          </view>
          <text class="notification-text">{{ item.content }}</text>
          <text class="notification-time">{{ formatTime(item.created_at) }}</text>
        </view>

        <!-- Arrow -->
        <AppIcon name="chevron-right" :size="16" color="#d1d5db" />
      </view>

      <!-- Load More -->
      <view v-if="hasMore" class="load-more">
        <text class="load-more-text">{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { API_BASE_URL, getToken } from '@/services/api';

const loading = ref(true);
const loadingMore = ref(false);
const notifications = ref<any[]>([]);
const page = ref(1);
const hasMore = ref(false);
const unreadCount = ref(0);

const fetchNotifications = async (loadMore = false) => {
  if (loadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const res: any = await uni.request({
      url: `${API_BASE_URL}/notifications?page=${page.value}&limit=20`,
      method: 'GET',
      header: { Authorization: `Bearer ${getToken()}` }
    });

    if (res.data?.success) {
      if (loadMore) {
        notifications.value = [...notifications.value, ...res.data.notifications];
      } else {
        notifications.value = res.data.notifications || [];
      }
      unreadCount.value = res.data.unread_count || 0;
      hasMore.value = notifications.value.length < res.data.total;
    }
  } catch (e) {
    console.error('Fetch notifications error:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    page.value++;
    fetchNotifications(true);
  }
};

const markAllRead = async () => {
  try {
    await uni.request({
      url: `${API_BASE_URL}/notifications/read-all`,
      method: 'POST',
      header: { Authorization: `Bearer ${getToken()}` }
    });
    
    // Update local state
    notifications.value.forEach(n => n.is_read = true);
    unreadCount.value = 0;
    uni.showToast({ title: '已全部标记为已读', icon: 'success' });
  } catch (e) {
    console.error('Mark all read error:', e);
  }
};

const handleNotificationClick = async (item: any) => {
  // Mark as read
  if (!item.is_read) {
    try {
      await uni.request({
        url: `${API_BASE_URL}/notifications/${item.id}/read`,
        method: 'POST',
        header: { Authorization: `Bearer ${getToken()}` }
      });
      item.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (e) {
      console.error('Mark read error:', e);
    }
  }

  // Navigate based on type
  if (item.related_order_id) {
    // Go to order detail
    uni.navigateTo({
      url: `/pages/index/index?tab=profile&orderId=${item.related_order_id}`
    });
  }
};

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    'order_status': 'package',
    'quote_received': 'file-text',
    'payment': 'credit-card',
    'review_reminder': 'star',
    'promotion': 'gift',
    'message': 'message-circle',
    'system': 'bell'
  };
  return icons[type] || 'bell';
};

const getIconClass = (type: string) => {
  const classes: Record<string, string> = {
    'order_status': 'icon-blue',
    'quote_received': 'icon-green',
    'payment': 'icon-amber',
    'review_reminder': 'icon-yellow',
    'promotion': 'icon-pink',
    'message': 'icon-cyan',
    'system': 'icon-gray'
  };
  return classes[type] || 'icon-gray';
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
};

const goBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.inbox-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.header {
  background: #ffffff;
  padding-left: 16px;
  padding-right: 16px;
  padding-top: env(safe-area-inset-top);
  position: sticky;
  top: 0;
  z-index: 10;
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
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
}

.header-action {
  padding: 8px 12px;
}

.header-action-text {
  font-size: 14px;
  color: #059669;
  font-weight: 500;
}

.header-placeholder {
  width: 60px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120px;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #9ca3af;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-title {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.empty-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: #9ca3af;
}

.notification-list {
  height: calc(100vh - 56px - env(safe-area-inset-top));
}

.notification-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
}

.notification-item.unread {
  background: #f0fdf4;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.icon-green { background: linear-gradient(135deg, #10b981, #059669); }
.icon-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.icon-yellow { background: linear-gradient(135deg, #eab308, #ca8a04); }
.icon-pink { background: linear-gradient(135deg, #ec4899, #db2777); }
.icon-cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.icon-gray { background: linear-gradient(135deg, #6b7280, #4b5563); }

.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.notification-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 12px;
  color: #9ca3af;
}

.load-more {
  padding: 20px;
  text-align: center;
}

.load-more-text {
  font-size: 13px;
  color: #9ca3af;
}
</style>
