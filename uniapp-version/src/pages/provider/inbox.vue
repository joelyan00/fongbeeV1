<template>
  <view class="inbox-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="arrow-left" :size="20" color="#fff" />
      </view>
      <text class="title">收件箱</text>
      <view class="placeholder"></view>
    </view>

    <!-- Filter Tabs -->
    <view class="filter-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <view v-if="tab.count > 0" class="badge">{{ tab.count }}</view>
      </view>
    </view>

    <!-- Message List -->
    <scroll-view 
      scroll-y 
      class="message-list"
      v-if="messages.length > 0"
    >
      <view 
        v-for="msg in filteredMessages" 
        :key="msg.id"
        :class="['message-item', { unread: !msg.read }]"
        @click="openMessage(msg)"
      >
        <view :class="['avatar', msg.type]">
          {{ msg.type === 'order' ? '订' : msg.type === 'system' ? '系' : '消' }}
        </view>
        <view class="content">
          <view class="top-row">
            <text class="msg-title">{{ msg.title }}</text>
            <text class="time">{{ msg.time }}</text>
          </view>
          <text class="preview">{{ msg.preview }}</text>
        </view>
        <view v-if="!msg.read" class="unread-dot"></view>
      </view>
    </scroll-view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <AppIcon name="message-square" :size="48" color="#ccc" />
      <text class="empty-text">暂无消息</text>
      <text class="empty-sub">当有新消息时，将在这里显示</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const activeTab = ref('all');

const tabs = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'unread', label: '未读', count: 0 },
  { key: 'order', label: '订单', count: 0 },
  { key: 'system', label: '系统', count: 0 },
];

// Mock messages - replace with API data
const messages = ref<any[]>([
  // { id: 1, type: 'order', title: '新订单通知', preview: '您有一个新的订单需要处理...', time: '10分钟前', read: false },
  // { id: 2, type: 'system', title: '系统通知', preview: '您的账户信息已更新...', time: '1小时前', read: true },
  // { id: 3, type: 'message', title: '客户留言', preview: '请问明天可以上门服务吗？', time: '2小时前', read: false },
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
  // Mark as read and open detail
  msg.read = true;
  console.log('Open message:', msg);
};
</script>

<style scoped>
.inbox-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  padding: 60rpx 32rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}

.filter-tabs {
  background: #fff;
  display: flex;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab.active {
  color: #22c55e;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background: #22c55e;
  border-radius: 2rpx;
}

.badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: #ef4444;
  color: #fff;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  border-radius: 16rpx;
  padding: 0 8rpx;
}

.message-list {
  flex: 1;
  background: #fff;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.message-item.unread {
  background: #f0fdfa;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar.order {
  background: #22c55e;
}

.avatar.system {
  background: #3b82f6;
}

.avatar.message {
  background: #ec4899;
}

.content {
  flex: 1;
  min-width: 0;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.msg-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.time {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.preview {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  width: 16rpx;
  height: 16rpx;
  background: #ef4444;
  border-radius: 50%;
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-top: 32rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: #bbb;
  margin-top: 16rpx;
}
</style>
