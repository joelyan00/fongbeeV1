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
          <text class="header-title">服务区域管理</text>
          <text class="header-subtitle">设置您提供服务的具体区域范围</text>
        </view>
      </view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content-scroll">
      <view class="content">
        <view class="section-title">当前服务区域</view>
        
        <view v-if="loading" class="loading-state">
            <AppIcon name="loader" :size="24" color="#10b981" class="animate-spin" />
            <text class="loading-text">加载中...</text>
        </view>

        <view v-else class="area-list">
           <view v-for="(area, index) in areas" :key="index" class="area-card">
              <view class="area-info">
                 <view class="area-icon">
                    <AppIcon name="map-pin" :size="20" color="#10b981" />
                 </view>
                 <view>
                    <text class="area-name">{{ area }}</text>
                    <text class="area-desc">全区服务</text>
                 </view>
              </view>
              <view class="delete-btn" @click="handleDelete(index)">
                 <AppIcon name="trash" :size="18" color="#ef4444" />
              </view>
           </view>
        </view>

        <view class="add-btn-card" @click="showAddModal = true">
            <view class="add-icon-bg">
                <AppIcon name="plus" :size="24" color="#10b981" />
            </view>
            <text class="add-text">添加新的服务区域</text>
        </view>
      </view>
    </scroll-view>

    <!-- Add City Modal -->
    <view v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
        <view class="modal-content" @click.stop>
            <view class="modal-header">
                <text class="modal-title">选择服务城市</text>
                <view @click="showAddModal = false" class="close-btn">
                    <AppIcon name="x" :size="20" color="#9ca3af" />
                </view>
            </view>
            <scroll-view scroll-y class="city-list">
                <view 
                    v-for="city in availableCities" 
                    :key="city.id" 
                    class="city-item"
                    @click="handleSelectCity(city)"
                >
                    <text class="city-name">{{ city.name }}</text>
                    <AppIcon name="plus-circle" :size="20" color="#10b981" />
                </view>
                <view v-if="availableCities.length === 0" class="empty-city">
                    <text class="empty-text">暂无更多可选城市</text>
                </view>
            </scroll-view>
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { citiesApi, providersApi } from '@/services/api';

const areas = ref<string[]>([]);
const allCities = ref<any[]>([]);
const loading = ref(true);
const showAddModal = ref(false);

const availableCities = computed(() => {
    return allCities.value.filter(c => !areas.value.includes(c.name));
});

onMounted(async () => {
    loadData();
});

const loadData = async () => {
    loading.value = true;
    try {
        // 1. Fetch Active Cities
        const cities = await citiesApi.getActive();
        allCities.value = cities || [];

        // 2. Fetch Provider Profile
        const res = await providersApi.getMyProfile();
        if (res.profile && res.profile.service_city) {
            // Handle both JSON string array and simple string
            let cityData = res.profile.service_city;
            let loadedAreas: string[] = [];

            try {
                // Try parsing as JSON first (e.g. '["Toronto","Markham"]')
                const parsed = JSON.parse(cityData);
                if (Array.isArray(parsed)) {
                    loadedAreas = parsed;
                } else {
                    // If parsed but not array, treat as single item
                    loadedAreas = [cityData];
                }
            } catch (e) {
                // Not JSON, assume comma-separated string or single string
                if (cityData.includes(',')) {
                    loadedAreas = cityData.split(',').map((s: string) => s.trim());
                } else {
                    loadedAreas = [cityData];
                }
            }

            // STRICT FILTER: Only keep cities that exist in the active list
            // This ensures "Scarborough" does not show if it's not in DB
            if (allCities.value.length > 0) {
                 const validNames = allCities.value.map(c => c.name);
                 areas.value = loadedAreas.filter(name => validNames.includes(name));
            } else {
                // Should not happen if API is working, but fallback
                areas.value = loadedAreas;
            }
        }
    } catch (error) {
        console.error('Load data error:', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const goBack = () => uni.navigateBack();

const handleSelectCity = async (city: any) => {
    areas.value.push(city.name);
    showAddModal.value = false;
    await saveProfile();
    uni.showToast({ title: '已添加', icon: 'success' });
};

const handleDelete = (index: number) => {
    uni.showModal({
        title: '确认删除',
        content: '确定要删除该服务区域吗？',
        success: async (res) => {
            if (res.confirm) {
                areas.value.splice(index, 1);
                await saveProfile();
                uni.showToast({ title: '已删除', icon: 'none' });
            }
        }
    });
};

const saveProfile = async () => {
    try {
        // Store as JSON string to support multiple cities in a TEXT column
        const service_city = JSON.stringify(areas.value);
        await providersApi.updateProfile({ service_city });
    } catch (error) {
        console.error('Save profile error:', error);
        uni.showToast({ title: '保存失败', icon: 'none' });
    }
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
  margin-top: 4px;
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

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
    gap: 12px;
}

.loading-text {
    color: #6b7280;
    font-size: 14px;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.area-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
}

.area-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.area-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
}

.area-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(16, 185, 129, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.area-name {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    display: block;
}

.area-desc {
    color: #6b7280;
    font-size: 13px;
    margin-top: 2px;
    display: block;
}

.delete-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
}

.add-btn-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed #4b5563;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.add-btn-card:active {
    background: rgba(255,255,255,0.05);
}

.add-icon-bg {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-text {
    color: #10b981;
    font-size: 14px;
    font-weight: 500;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal-content {
    width: 100%;
    max-width: 320px;
    background: #1f2937;
    border-radius: 16px;
    border: 1px solid #374151;
    overflow: hidden;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 16px;
    border-bottom: 1px solid #374151;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
}

.close-btn {
    padding: 4px;
}

.city-list {
    max-height: 400px;
    min-height: 100px;
}

.city-item {
    padding: 16px;
    border-bottom: 1px solid #374151;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.city-item:active {
    background: rgba(255,255,255,0.05);
}

.city-name {
    color: #d1d5db;
    font-size: 15px;
}

.empty-city {
    padding: 32px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-text {
    color: #6b7280;
    font-size: 14px;
}
</style>
