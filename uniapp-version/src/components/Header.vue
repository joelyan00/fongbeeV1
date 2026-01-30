<template>
  <view class="header-container">
    <!-- Fixed Header -->
    <view class="fixed-header bg-white" style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; z-index: 9999 !important;">
        <!-- Top Spacer for Status Bar -->
        <view :style="{ height: statusBarHeight + 'px' }"></view>
        
        <!-- Nav Row: Location & Capsule Spacer -->
        <view class="nav-row" :style="{ 
            height: navHeight + 'px', 
            paddingLeft: '16px', 
            paddingRight: capsuleMargin + 'px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start'
        }">
            <view class="location-btn" @click="emit('locationClick')" style="display: flex; flex-direction: row; align-items: center;">
                <AppIcon name="map-pin" :size="20" color="#111827" style="margin-right: 4px;" />
                <text class="location-text" style="font-size: 17px; font-weight: 700; color: #111827; margin-right: 2px;">{{ locationName }}</text>
                <AppIcon name="chevron-right" :size="16" color="#9ca3af" />
            </view>
        </view>

        <!-- Search Row -->
        <view class="search-row" style="padding: 6px 16px 12px 16px; width: 100%; box-sizing: border-box;">
            <view 
                class="search-input-box" 
                style="display: flex; flex-direction: row; align-items: center; width: 100%; height: 38px; background-color: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 19px; padding: 0 12px; box-sizing: border-box;"
            >
                <AppIcon name="search" :size="16" color="#9CA3AF" style="margin-right: 8px;" @click="handleSearch" />
                <input 
                    type="text" 
                    v-model="searchQuery"
                    placeholder="搜索服务、需求或常见问题..." 
                    confirm-type="search"
                    @confirm="handleSearch"
                    style="font-size: 14px; color: #111827; flex: 1; background: transparent; border: none; height: 100%;"
                />
                <view v-if="searchQuery" @click="searchQuery = ''" style="padding: 4px;">
                    <AppIcon name="x" :size="14" color="#9ca3af" />
                </view>
            </view>
        </view>
    </view>

    <!-- Spacer to prevent content overlap -->
    <view class="header-spacer" :style="{ height: (statusBarHeight + navHeight + 50) + 'px' }"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from './Icons.vue';

defineProps<{
  locationName: string
}>();

const emit = defineEmits(['search', 'locationClick']);
const searchQuery = ref('');
const statusBarHeight = ref(20);
const navHeight = ref(44); // Height of the capsule row
const capsuleMargin = ref(12);
const totalHeaderHeight = ref(0);

onMounted(() => {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight || 20;
  
  // #ifdef MP-WEIXIN
  try {
    const capsule = uni.getMenuButtonBoundingClientRect();
    // Nav height is usually defined by capsule height + top/bottom padding relative to status bar end?
    // Actually, accurate unified nav bar logic: 
    // TitleBar Top = StatusBarHeight
    // TitleBar Height = (CapsuleTop - StatusBarHeight) * 2 + CapsuleHeight
    const barHeight = (capsule.top - statusBarHeight.value) * 2 + capsule.height;
    navHeight.value = barHeight > 0 ? barHeight : 44;
    
    const margin = info.screenWidth - capsule.right;
    capsuleMargin.value = margin > 0 ? margin : 12;
  } catch (e) {
    console.error('Get capsule info failed', e);
  }
  // #endif

  // Header consists of (StatusBar) + (NavRow) + (SearchRow 60px: 40px input + 10px padding * 2)
  // Search row padding is 10px top/bottom, input is 40px. Total 60px.
  totalHeaderHeight.value = statusBarHeight.value + navHeight.value + 60;
});

const handleSearch = () => {
    emit('search', searchQuery.value);
};
</script>

<style scoped>
.header-container {
    width: 100%;
}

.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
}

.nav-row {
  display: flex;
  align-items: center;
}

.location-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
}

.location-text {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 4rpx;
  line-height: normal;
}

.search-input {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    background-color: #f3f4f6;
    border: none;
    border-radius: 20px;
    padding: 0 12px;
}

.search-input input {
    flex: 1;
    height: 100%;
    font-size: 14px;
    color: #111827;
    background-color: transparent;
}
</style>
