<template>
  <view class="header-container">
    <!-- Top Row: Location & Brand -->
    <view class="top-row">
      <!-- Location (Left) -->
      <view class="location-btn" @click="emit('locationClick')">
        <text class="location-icon">📍</text>
        <text class="location-text">{{ locationName }}</text>
        <text class="chevron-icon">⌄</text>
      </view>

      <!-- Centered Title -->
      <text class="brand-title">Fongbee/优服佳</text>
      
      <!-- Placeholder (Right) -->
      <view class="placeholder-right"></view>
    </view>

    <!-- Search Row -->
    <view class="search-row">
      <!-- Search Input -->
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          placeholder="输入需求..." 
          class="input-field"
          confirm-type="search"
        />
      </view>
      
      <!-- AI Button -->
      <view class="ai-btn" @click="emit('searchClick')">
        <text class="ai-icon-text">✨</text>
        <text class="ai-text">AI助手</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  locationName: string
}>();

const emit = defineEmits(['searchClick', 'locationClick']);
</script>

<style scoped>
.header-container {
  background-color: #ffffff;
  padding: 0 16px 12px 16px;
  /* Default for H5 */
  padding-top: calc(env(safe-area-inset-top) + 12px);
  position: sticky;
  top: 0;
  z-index: 50;
}

/* #ifdef MP-WEIXIN */
.header-container {
  /* Increase padding for Wechat Mini Program to avoid status bar/capsule overlap */
  padding-top: calc(env(safe-area-inset-top) + 50px);
}
/* #endif */

.top-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.location-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
}

.location-icon {
  font-size: 16px;
}

.location-text {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.chevron-icon {
  color: #6b7280;
  font-size: 14px;
}

.brand-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.placeholder-right {
  width: 60px;
}

.search-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.search-input {
  flex: 1;
  height: 40px;
  background-color: #f3f4f6;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 14px;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  height: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111827;
}

.ai-btn {
  height: 40px;
  padding: 0 14px;
  background-color: #059669;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.ai-btn:active {
  background-color: #047857;
}

.ai-icon-text {
  font-size: 14px;
}

.ai-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}
</style>
