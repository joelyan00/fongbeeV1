<template>
  <view class="navbar-container" :style="{ backgroundColor: backgroundColor }">
    <!-- Status Bar Spacer (Dynamic Height) -->
    <view :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- Nav Content (Fixed Height) -->
    <view class="nav-content" :style="{ 
        height: navBarHeight + 'px',
        paddingRight: (capsuleWidth + 16) + 'px'
    }">
      <!-- Left: Back Button or Slot -->
      <view class="nav-left">
        <view v-if="showBack" class="back-btn" @click="handleBack">
          <AppIcon name="chevron-left" :size="24" :color="iconColor"/>
        </view>
        <slot name="left"></slot>
      </view>

      <!-- Center: Title -->
      <view class="nav-center">
        <text class="nav-title" :style="{ color: titleColor }">{{ title }}</text>
      </view>

      <!-- Right: Actions Slot -->
      <view class="nav-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
  <!-- Spacer to prevent content overlap -->
  <view v-if="fixed" :style="{ height: (statusBarHeight + navBarHeight) + 'px' }"></view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  titleColor: {
    type: String,
    default: '#111827'
  },
  iconColor: {
    type: String,
    default: '#111827'
  },
  showBack: {
    type: Boolean,
    default: true
  },
  fixed: {
    type: Boolean,
    default: true
  },
  customBack: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['back']);
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(0);

const initHeaderMetrics = () => {
    // #ifdef MP-WEIXIN
    const sysInfo = uni.getSystemInfoSync();
    statusBarHeight.value = sysInfo.statusBarHeight || 44;
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    capsuleWidth.value = menuButtonInfo.width;
    navBarHeight.value = (menuButtonInfo.top - statusBarHeight.value) * 2 + menuButtonInfo.height;
    // #endif
    // #ifdef H5
    statusBarHeight.value = 0;
    navBarHeight.value = 54;
    capsuleWidth.value = 0;
    // #endif
};

onMounted(() => {
  initHeaderMetrics();
});

const handleBack = () => {
  if (props.customBack) {
    props.customBack();
    return;
  }
  
  emit('back');
  
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // Fallback to home if no history
    uni.reLaunch({ url: '/pages/index/index' });
  }
};
</script>

<style scoped>
.navbar-container {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
  min-width: 40px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 17px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 40px;
}
</style>
