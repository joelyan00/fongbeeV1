<template>
  <view class="service-grid-wrapper">
    <!-- Green Title Bar -->
    <view class="title-bar">
      <text class="title-text">标准服务，省时，省心</text>
    </view>
    
    <!-- White Card Container -->
    <view class="service-card">
      <swiper 
        class="swiper-container"
        :indicator-dots="false"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(pageItems, pageIndex) in pages" :key="pageIndex">
          <view class="grid-container">
            <view 
              v-for="(service, idx) in pageItems" 
              :key="idx" 
              class="grid-item"
              @click="emit('categorySelect', service.name)"
            >
              <view class="icon-wrapper" :style="{ backgroundColor: service.bgColor }">
                 <image 
                   v-if="service.iconName?.startsWith('http') || service.iconName?.startsWith('/static')" 
                   :src="service.iconName" 
                   class="w-8 h-8"
                   mode="aspectFit"
                 />
                <AppIcon v-else :name="service.iconName" :size="32" :style="{ color: service.iconColor }" />
              </view>
              <text class="service-name">{{ service.name }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      
      <!-- Pagination Dots -->
      <view class="dots-container">
        <view
          v-for="(_, index) in pages"
          :key="index"
          class="dot"
          :class="{ 'dot-active': currentPage === index }"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from './Icons.vue';
import { categoriesApi } from '@/services/api';

const emit = defineEmits(['categorySelect']);

defineProps<{
  selectedCategory?: string
}>();

const currentPage = ref(0);
const services = ref<any[]>([]);

const onSwiperChange = (e: any) => {
  currentPage.value = e.detail.current;
};

// Pastel colors for icons
// Modern minimalist colors
const COLORS = [
  { icon: '#3D8E63', bg: '#F5F7FA' },
  { icon: '#4A90E2', bg: '#F5F7FA' },
  { icon: '#F5A623', bg: '#F5F7FA' },
  { icon: '#E94E77', bg: '#F5F7FA' },
  { icon: '#7B61FF', bg: '#F5F7FA' },
  { icon: '#00BFA5', bg: '#F5F7FA' },
  { icon: '#FF6F61', bg: '#F5F7FA' },
  { icon: '#5C6BC0', bg: '#F5F7FA' }
];

const ITEMS_PER_PAGE = 8;
const pages = computed(() => {
    const p: any[] = [];
    for (let i = 0; i < services.value.length; i += ITEMS_PER_PAGE) {
        p.push(services.value.slice(i, i + ITEMS_PER_PAGE));
    }
    return p;
});

onMounted(async () => {
    try {
        const [standardRes, customRes] = await Promise.all([
            categoriesApi.getAll({ service_type: 'standard' }),
            categoriesApi.getAll({ service_type: 'custom' })
        ]);

        const stdCats = standardRes.categories || [];
        const custCats = customRes.categories || [];

        // Merge logic: Prioritize Standard
        const unifiedMap = new Map();

        // 1. Add Custom
        custCats.forEach((cat: any) => {
            unifiedMap.set(cat.name, {
                name: cat.name,
                iconName: cat.icon || 'grid',
                type: 'custom' // mark as custom
            });
        });

        // 2. Add/Overwrite Standard
        stdCats.forEach((cat: any) => {
            unifiedMap.set(cat.name, {
                name: cat.name,
                iconName: cat.icon || 'grid',
                type: 'standard' // mark as standard
            });
        });

        // convert to array and map colors
        const merged = Array.from(unifiedMap.values());
        
        // Add "All Services"
        merged.push({ name: '全部服务', iconName: 'grid', type: 'all' });

        services.value = merged.map((cat: any, index: number) => {
            const color = COLORS[index % COLORS.length];
            return {
                name: cat.name,
                iconName: cat.iconName,
                iconColor: color.icon,
                bgColor: color.bg,
                type: cat.type
            };
        });

    } catch (e) {
        console.error('Fetch categories failed', e);
    }
});
</script>

<style scoped>
.service-grid-wrapper {
  padding: 16px 20px;
}

.title-bar {
  background: linear-gradient(135deg, #3D8E63 0%, #2A6B4A 100%);
  border-radius: 12px;
  padding: 14px 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(61, 142, 99, 0.15);
}

.title-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  display: block;
  letter-spacing: 0.5px;
}

.service-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f8fafc;
}

.swiper-container {
  height: 240px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 8px;
  padding: 0 4px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.icon-wrapper {
  width: 58px;
  height: 58px;
  border-radius: 18px; /* Squircle style */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.grid-item:active .icon-wrapper {
  transform: scale(0.92);
}

.service-name {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  text-align: center;
  white-space: nowrap;
}

.dots-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #e2e8f0;
  transition: all 0.3s;
}

.dot-active {
  width: 14px;
  border-radius: 10px;
  background-color: #3D8E63;
}
</style>
