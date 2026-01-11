<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view @click="goBack" class="back-btn">
          <AppIcon name="arrow-left" :size="22" color="#ffffff" />
        </view>
        <view class="header-info">
          <text class="header-title">服务时间管理</text>
          <text class="header-subtitle">配置您的每周服务时间表</text>
        </view>
      </view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content-scroll">
      <view class="content">
        <view class="section-title">每周营业时间</view>
        
        <view class="schedule-list">
           <view v-for="(day, index) in schedule" :key="index" class="schedule-card">
              <view class="card-header">
                 <view class="flex flex-row items-center gap-2">
                    <view :class="['day-badge', day.enabled ? 'day-active' : 'day-inactive']">
                        <text :class="['day-text', day.enabled ? 'text-white' : 'text-gray-500']">{{ day.name }}</text>
                    </view>
                    <text class="status-label" v-if="!day.enabled">休息</text>
                 </view>
                 <switch :checked="day.enabled" color="#10b981" @change="e => toggleDay(index, e)" style="transform:scale(0.8)" />
              </view>
              
              <view v-if="day.enabled" class="time-selector">
                 <view class="time-box">
                    <text class="time-label">开始</text>
                    <picker mode="time" :value="day.start" @change="e => onTimeChange(index, 'start', e)">
                        <text class="time-value">{{ day.start }}</text>
                    </picker>
                 </view>
                 <view class="time-divider"></view>
                 <view class="time-box">
                    <text class="time-label">结束</text>
                    <picker mode="time" :value="day.end" @change="e => onTimeChange(index, 'end', e)">
                        <text class="time-value">{{ day.end }}</text>
                    </picker>
                 </view>
              </view>
           </view>
        </view>

        <view class="save-btn-container">
            <view class="save-btn" @click="handleSave">
                <text class="save-text">保存设置</text>
            </view>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '@/components/Icons.vue';

const schedule = ref([
    { name: '周一', enabled: true, start: '09:00', end: '18:00' },
    { name: '周二', enabled: true, start: '09:00', end: '18:00' },
    { name: '周三', enabled: true, start: '09:00', end: '18:00' },
    { name: '周四', enabled: true, start: '09:00', end: '18:00' },
    { name: '周五', enabled: true, start: '09:00', end: '18:00' },
    { name: '周六', enabled: false, start: '10:00', end: '17:00' },
    { name: '周日', enabled: false, start: '10:00', end: '17:00' }
]);

const goBack = () => uni.navigateBack();

const toggleDay = (index: number, e: any) => {
    schedule.value[index].enabled = e.detail.value;
};

const onTimeChange = (index: number, type: 'start' | 'end', e: any) => {
    schedule.value[index][type] = e.detail.value;
};

const handleSave = () => {
    uni.showLoading({ title: '保存中' });
    setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: '设置已保存', icon: 'success' });
        setTimeout(goBack, 1000);
    }, 1000);
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

/* Header */
.header {
  position: relative;
  padding-bottom: 24px;
  flex-shrink: 0;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-bottom: 1px solid #374151;
  border-radius: 0 0 24px 24px;
}

.header-content {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.header-info {
  margin-left: 12px;
  flex: 1;
}

.header-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  display: block;
}

.header-subtitle {
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  margin-top: 4px;
  display: block;
}

/* Content */
.content-scroll { flex: 1; }
.content { padding: 0 16px 40px; }

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #9ca3af;
    margin-bottom: 12px;
    margin-left: 4px;
}

.schedule-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 100px;
}

.schedule-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.day-badge {
    padding: 4px 10px;
    border-radius: 8px;
    transition: all 0.3s;
}

.day-active {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.day-inactive {
    background: #374151;
    border: 1px solid #4b5563;
}

.day-text {
    font-size: 14px;
    font-weight: 600;
}

.status-label {
    font-size: 13px;
    color: #6b7280;
}

.time-selector {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #374151;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.time-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.time-label {
    font-size: 12px;
    color: #6b7280;
}

.time-value {
    font-size: 18px;
    color: #ffffff;
    font-weight: 500;
    font-family: monospace;
}

.time-divider {
    width: 20px;
    height: 1px;
    background: #4b5563;
    margin: 0 16px;
    align-self: flex-end;
    margin-bottom: 12px;
}

.save-btn-container {
    padding: 24px 0;
}

.save-btn {
    height: 50px;
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.save-btn:active {
    transform: scale(0.98);
}

.save-text {
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
}
</style>
