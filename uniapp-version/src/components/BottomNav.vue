<template>
  <view class="bottom-nav">
    <view 
      class="nav-item"
      :class="{ 'nav-item-active': activeTab === 'home' }"
      @click="emit('tabChange', 'home')"
    >
      <view class="icon-container">
        <!-- Home Icon -->
        <AppIcon 
          name="home" 
          :size="28" 
          color="#000000"
          :stroke-width="2.2"
        />
      </view>
      <text 
        class="nav-label"
        :class="activeTab === 'home' ? 'label-active' : 'label-inactive'"
      >
        首页
      </text>
    </view>
    
    <view 
      class="nav-item"
      :class="{ 'nav-item-active': activeTab === 'standard' }"
      @click="emit('tabChange', 'standard')"
    >
      <view class="icon-container">
        <!-- Checklist Icon -->
        <AppIcon 
          name="clipboard" 
          :size="28" 
          color="#000000"
          :stroke-width="2.2"
        />
      </view>
      <text 
        class="nav-label"
        :class="activeTab === 'standard' ? 'label-active' : 'label-inactive'"
      >
        标准服务
      </text>
    </view>
    
    <view 
      class="nav-item"
      :class="{ 'nav-item-active': activeTab === 'custom' }"
      @click="emit('tabChange', 'custom')"
    >
      <view class="icon-container">
        <!-- Headphones Icon -->
        <AppIcon 
          name="headphones" 
          :size="28" 
          color="#000000"
          :stroke-width="2.2"
        />
      </view>
      <text 
        class="nav-label"
        :class="activeTab === 'custom' ? 'label-active' : 'label-inactive'"
      >
        定制服务
      </text>
    </view>
    
    <view 
      class="nav-item"
      :class="{ 'nav-item-active': activeTab === 'profile' }"
      @click="emit('tabChange', 'profile')"
    >
      <view class="icon-container">
        <!-- User Icon -->
        <AppIcon 
          name="user" 
          :size="28" 
          color="#000000"
          :stroke-width="2.2"
        />
      </view>
      <text 
        class="nav-label"
        :class="activeTab === 'profile' ? 'label-active' : 'label-inactive'"
      >
        我的
      </text>
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

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px; /* Increased slightly */
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #ffffff;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
  box-shadow: 0 -1px 3px rgba(0,0,0,0.02);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Slightly bold the icons by default stroke-width from Icons.vue */
}

/* We removed text icons, so these classes are redundant for icons but active state is handled via props */

.nav-label {
  font-size: 11px; /* Keep font size small for compactness */
  font-weight: 500;
  margin-top: 2px;
}

.label-active {
  color: #059669;
  font-weight: 600; /* Bolder text for active */
}

.label-inactive {
  color: #9ca3af;
}
</style>
