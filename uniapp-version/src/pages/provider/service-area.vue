<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); display: flex; flex-direction: column;">
    <!-- Header -->
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="服务区域管理" 
      background-color="#ffffff" 
      title-color="#111827" 
      icon-color="#111827"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    />

    <!-- Content -->
    <scroll-view scroll-y style="flex: 1;">
      <view style="padding: 0 16px 40px;">
        <view style="font-size: 14px; font-weight: 600; color: #9ca3af; margin-bottom: 22px; margin-top: 10px; margin-left: 4px;">当前服务区域</view>
        
        <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; padding: 40px 0; gap: 12px;">
            <AppIcon name="loader" :size="24" color="#10b981" style="animation: spin 1s linear infinite;" />
            <text style="color: #6b7280; font-size: 14px;">加载中...</text>
        </view>

        <view v-else style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
           <view v-for="(area, index) in areas" :key="index" style="background: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 16px; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
              <view style="display: flex; flex-direction: row; align-items: center; gap: 12px;">
                 <view style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center;">
                    <AppIcon name="map-pin" :size="20" color="#10b981" />
                 </view>
                 <view>
                    <text style="color: #ffffff; font-size: 16px; font-weight: 600; display: block;">{{ area }}</text>
                    <text style="color: #6b7280; font-size: 13px; margin-top: 2px; display: block;">全区服务</text>
                 </view>
              </view>
              <view @click="handleDelete(index)" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                 <AppIcon name="trash" :size="18" color="#ef4444" />
              </view>
           </view>
        </view>

        <view @click="showAddModal = true" style="background: rgba(255, 255, 255, 0.03); border: 1px dashed #4b5563; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
            <view style="width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center;">
                <AppIcon name="plus" :size="24" color="#10b981" />
            </view>
            <text style="color: #10b981; font-size: 14px; font-weight: 500;">添加新的服务区域</text>
        </view>
      </view>
    </scroll-view>

    <!-- Add City Modal -->
    <view v-if="showAddModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px;" @click="showAddModal = false">
        <view style="width: 100%; max-width: 320px; background: #1f2937; border-radius: 16px; border: 1px solid #374151; overflow: hidden; max-height: 80vh; display: flex; flex-direction: column;" @click.stop>
            <view style="padding: 16px; border-bottom: 1px solid #374151; display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                <text style="color: #ffffff; font-size: 16px; font-weight: 600;">选择服务城市</text>
                <view @click="showAddModal = false" style="padding: 4px;">
                    <AppIcon name="x" :size="20" color="#9ca3af" />
                </view>
            </view>
            <scroll-view scroll-y style="max-height: 400px; min-height: 100px;">
                <view 
                    v-for="city in availableCities" 
                    :key="city.id" 
                    @click="handleSelectCity(city)"
                    style="padding: 16px; border-bottom: 1px solid #374151; display: flex; flex-direction: row; justify-content: space-between; align-items: center;"
                >
                    <text style="color: #d1d5db; font-size: 15px;">{{ city.name }}</text>
                    <AppIcon name="plus-circle" :size="20" color="#10b981" />
                </view>
                <view v-if="availableCities.length === 0" style="padding: 32px 0; display: flex; align-items: center; justify-content: center;">
                    <text style="color: #6b7280; font-size: 14px;">暂无更多可选城市</text>
                </view>
            </scroll-view>
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';
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

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

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
