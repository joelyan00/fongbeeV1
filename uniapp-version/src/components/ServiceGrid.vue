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
                   v-if="service.iconName?.startsWith('http')" 
                   :src="service.iconName" 
                   class="w-8 h-8 rounded-full"
                   mode="aspectFill"
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
const COLORS = [
  { icon: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
  { icon: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  { icon: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  { icon: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
  { icon: '#475569', bg: 'rgba(71, 85, 105, 0.1)' },
  { icon: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  { icon: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  { icon: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' }
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
  padding: 12px 16px;
}

.title-bar {
  background: linear-gradient(90deg, #047857 0%, #059669 100%);
  border-radius: 8px;
  padding: 12px 24px;
  margin-bottom: 16px;
}

.title-text {
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  display: block;
}

.service-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.swiper-container {
  height: 220px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 4px;
  padding: 0 8px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Added for image clipping */
}

.service-name {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  text-align: center;
}

.dots-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #e5e7eb;
  transition: all 0.3s;
}

.dot-active {
  width: 20px;
  background-color: #047857;
}

/* Unified deep green color for all icons */
.text-green-600 { color: #047857; }
</style>
