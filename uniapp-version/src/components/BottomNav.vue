<template>
  <view 
    style="position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; height: 110rpx !important; background-color: #ffffff !important; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-around !important; border-top: 1rpx solid #f3f4f6 !important; z-index: 10000 !important; padding-bottom: env(safe-area-inset-bottom) !important; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.03) !important;"
  >
    <view 
      @click="emit('tabChange', 'home')"
      style="flex: 1 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important;"
    >
      <AppIcon 
        name="home" 
        :size="26" 
        :color="activeTab === 'home' ? '#059669' : '#9ca3af'"
        :stroke-width="2.2"
      />
      <text :style="{ fontSize: '22rpx', marginTop: '6rpx', color: activeTab === 'home' ? '#059669' : '#9ca3af', fontWeight: activeTab === 'home' ? '600' : '400' }">首页</text>
    </view>
    
    <view 
      @click="emit('tabChange', 'standard')"
      style="flex: 1 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important;"
    >
      <AppIcon 
        name="clipboard" 
        :size="26" 
        :color="activeTab === 'standard' ? '#059669' : '#9ca3af'"
        :stroke-width="2.2"
      />
      <text :style="{ fontSize: '22rpx', marginTop: '6rpx', color: activeTab === 'standard' ? '#059669' : '#9ca3af', fontWeight: activeTab === 'standard' ? '600' : '400' }">标准服务</text>
    </view>
    
    <view 
      @click="emit('tabChange', 'custom')"
      style="flex: 1 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important;"
    >
      <AppIcon 
        name="headphones" 
        :size="26" 
        :color="activeTab === 'custom' ? '#059669' : '#9ca3af'"
        :stroke-width="2.2"
      />
      <text :style="{ fontSize: '22rpx', marginTop: '6rpx', color: activeTab === 'custom' ? '#059669' : '#9ca3af', fontWeight: activeTab === 'custom' ? '600' : '400' }">定制服务</text>
    </view>
    
    <view 
      @click="emit('tabChange', 'profile')"
      style="flex: 1 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important;"
    >
      <AppIcon 
        name="user" 
        :size="26" 
        :color="activeTab === 'profile' ? '#059669' : '#9ca3af'"
        :stroke-width="2.2"
      />
      <text :style="{ fontSize: '22rpx', marginTop: '6rpx', color: activeTab === 'profile' ? '#059669' : '#9ca3af', fontWeight: activeTab === 'profile' ? '600' : '400' }">我的</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from './Icons.vue';

defineProps<{
  activeTab: string
}>();

const emit = defineEmits(['tabChange']);
</script>

<style>
/* No styles needed, using inline above */
</style>
