<template>
  <view class="px-4 pb-4 mt-2">
    <!-- Loading State -->
    <view v-if="loading" class="py-10 flex items-center justify-center">
      <text class="text-gray-400">加载中...</text>
    </view>

    <view v-else>
      <!-- Standard Services Section (Grouped Vertically) -->
      <view class="mb-6">
        <view class="flex items-center justify-between mb-4">
          <view class="flex items-center gap-2">
            <view class="w-1 h-5 bg-[#3D8E63] rounded-full"></view>
            <text class="text-base font-bold text-gray-900">推荐标准服务</text>
          </view>
          <view @click="emit('viewStandard')" class="flex items-center gap-1 active-opacity-60">
            <text class="text-xs text-gray-500">更多</text>
            <text class="text-xs text-gray-500">›</text>
          </view>
        </view>

        <!-- Dynamic Groups -->
        <view v-if="groupedStandardServices.length > 0">
          <view 
            v-for="group in groupedStandardServices" 
            :key="group.category"
            class="mb-6"
          >
            <!-- Sub-category Header -->
            <view class="flex flex-row items-center mb-3">
               <view class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></view>
               <text class="text-sm font-bold text-gray-700">{{ group.category }}</text>
            </view>

            <!-- Services in this Category -->
            <view class="flex flex-col gap-3">
              <view 
                v-for="item in group.services" 
                :key="item.id"
                class="daowei-card-home active-scale-99"
                @click="emit('serviceClick', item)"
              >
                <!-- Left: Image -->
                <view class="card-left">
                    <image v-if="item.images?.[0]" :src="item.images[0]" mode="aspectFill" class="service-img rounded-xl" />
                    <view v-else class="service-img rounded-xl flex items-center justify-center bg-gray-50 text-2xl">🛠️</view>
                    <view class="badge-overlay-mini">
                        <view class="mini-tag">直选</view>
                    </view>
                </view>

                <!-- Right: Details -->
                <view class="card-right">
                    <view class="flex flex-row justify-between items-start">
                        <text class="service-title line-clamp-1">{{ item.title }}</text>
                        <view class="price-wrap">
                            <text class="price-val">${{ item.price }}</text>
                            <text class="price-unit">/{{ item.unit || '次' }}</text>
                        </view>
                    </view>
                    <text class="service-desc line-clamp-2">{{ item.description || '由优服佳认证服务商提供的专业优质服务。' }}</text>
                    <view class="flex flex-row items-center justify-between mt-auto">
                        <view class="stats-row">
                            <AppIcon name="star" :size="10" class="text-amber-400" />
                            <text class="stat-text">5.0 · 已售 100+</text>
                        </view>
                        <text class="go-detail">立即预约 ></text>
                    </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Empty State -->
        <view v-else class="bg-white rounded-2xl py-8 flex flex-col items-center justify-center shadow-sm border border-gray-50">
          <AppIcon name="clipboard" :size="40" class="text-gray-100 mb-2"/>
          <text class="text-gray-400 text-sm">暂无热门标准服务</text>
        </view>
      </view>

      <!-- Hot Custom Services Section -->
      <view>
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center gap-2">
            <view class="w-1 h-5 bg-[#3D8E63] rounded-full"></view>
            <text class="text-base font-bold text-gray-900">推荐定制服务</text>
          </view>
          <view @click="emit('viewCustom')" class="flex items-center gap-1 active-opacity-60">
            <text class="text-xs text-gray-500">更多</text>
            <text class="text-xs text-gray-500">›</text>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="hotCustomTemplates.length === 0" class="bg-white rounded-2xl py-8 flex flex-col items-center justify-center shadow-sm border border-gray-50">
          <AppIcon name="sparkles" :size="40" class="text-gray-100 mb-2"/>
          <text class="text-gray-400 text-sm">暂无热门定制服务</text>
        </view>

        <!-- Premium Icon Garden (Matching main Service Grid exactly) -->
        <view v-else class="service-card-premium">
          <view class="flex flex-row flex-wrap">
            <view 
              v-for="template in hotCustomTemplates" 
              :key="template.id"
              class="grid-item-garden active-scale-98"
              @tap.stop="handleTemplateClick(template)"
            >
              <view 
                class="icon-wrapper-garden" 
                style="background-color: #F5F7FA"
              >
                <AppIcon 
                  :name="getIconName(template.name)" 
                  :size="30" 
                  :style="{ color: getTemplateColor(template) || '#f97316' }" 
                />
              </view>
              <text class="service-name-garden">{{ template.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { servicesApi, formTemplatesApi } from '@/services/api';
import AppIcon from '@/components/Icons.vue';

const props = defineProps<{
  currentCity?: string;
}>();

const emit = defineEmits(['viewStandard', 'viewCustom', 'serviceClick', 'template-click']);

const loading = ref(true);
const hotStandardServices = ref<any[]>([]);
const hotCustomTemplates = ref<any[]>([]);

const groupedStandardServices = computed(() => {
    if (hotStandardServices.value.length === 0) return [];
    
    const groups: Record<string, any[]> = {};
    hotStandardServices.value.forEach(svc => {
        const cat = svc.category || '其他服务';
        if (!groups[cat]) groups[cat] = [];
        if (groups[cat].length < 4) {
            groups[cat].push(svc);
        }
    });
    
    return Object.keys(groups).map(cat => ({
        category: cat,
        services: groups[cat]
    }));
});

const getIconName = (name: string): string => {
  if (name.includes('清洁') || name.includes('保洁')) return 'sparkles';
  if (name.includes('搬家') || name.includes('搬运')) return 'truck';
  if (name.includes('维修') || name.includes('修理')) return 'wrench';
  if (name.includes('接送') || name.includes('接机') || name.includes('送机')) return 'car';
  if (name.includes('安装')) return 'hammer';
  if (name.includes('管道') || name.includes('疏通')) return 'droplet';
  if (name.includes('园艺') || name.includes('除草')) return 'leaf';
  if (name.includes('陪诊') || name.includes('看护')) return 'heart';
  if (name.includes('宠物')) return 'paw';
  return 'clipboard';
};

const handleTemplateClick = (template: any) => {
    emit('template-click', template);
};

const getTemplateColor = (template: any): string => {
  if (template.color) return template.color;
  const name = template.name;
  if (name.includes('清洁') || name.includes('保洁')) return '#3D8E63';
  if (name.includes('搬家') || name.includes('搬运')) return '#4A90E2';
  if (name.includes('维修') || name.includes('修理')) return '#F5A623';
  if (name.includes('接送') || name.includes('接机')) return '#E94E77';
  if (name.includes('园艺')) return '#3D8E63';
  return '#f97316';
};

const fetchHotServices = async () => {
  loading.value = true;
  try {
    const standardRes = await servicesApi.getOfferings({ city: props.currentCity || '' });
    hotStandardServices.value = standardRes.services || [];

    const customRes = await formTemplatesApi.getPublished();
    const popularTemplates = (customRes.templates || []).filter(
      (t: any) => t.is_popular && ['custom', 'complex'].includes(t.type)
    );
    hotCustomTemplates.value = popularTemplates.slice(0, 8);
  } catch (error) {
    console.error('Failed to fetch hot services:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.currentCity, () => {
  fetchHotServices();
});

onMounted(() => {
  fetchHotServices();
});
</script>

<style scoped>
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.text-gray-900 { color: #111827; }
.text-gray-700 { color: #374151; }
.text-gray-500 { color: #64748b; }
.text-gray-400 { color: #94a3b8; }
.text-gray-300 { color: #cbd5e1; }
.text-gray-100 { color: #f1f5f9; }
.text-red-500 { color: #ef4444; }

.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f8fafc; }
.bg-gray-100 { background-color: #f1f5f9; }
.bg-emerald-500 { background-color: #10b981; }

.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.px-4 { padding-left: 16px; padding-right: 16px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.p-1 { padding: 4px; }
.pb-2 { padding-bottom: 8px; }
.pb-4 { padding-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.mt-auto { margin-top: auto; }
.ml-1 { margin-left: 4px; }
.mr-2 { margin-right: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.w-1 { width: 4px; }
.w-1.5 { width: 6px; }
.h-5 { height: 20px; }
.h-1.5 { height: 6px; }
.w-full { width: 100%; }
.h-full { height: 100%; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }
.border { border-width: 1px; }
.border-gray-50 { border-color: #f8fafc; }
.border-gray-100 { border-color: #f1f5f9; }
.shadow-sm { box-shadow: 0 1px 2.5px 0 rgba(0, 0, 0, 0.04); }

.relative { position: relative; }
.absolute { position: absolute; }

.shrink-0 { flex-shrink: 0; }
.overflow-hidden { overflow: hidden; }
.whitespace-nowrap { white-space: nowrap; }

.flex-wrap { flex-wrap: wrap; }

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.block { display: block; }
.active-opacity-60:active { opacity: 0.6; }
.active-scale-99:active { transform: scale(0.99); }
.active-scale-98:active { transform: scale(0.95); opacity: 0.8;}

.daowei-card-home {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    flex-direction: row;
    gap: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    border: 0.5px solid #f1f5f9;
}

.card-left {
    position: relative;
    width: 100px;
    height: 100px;
}

.service-img {
    width: 100px;
    height: 100px;
    object-fit: cover;
}

.badge-overlay-mini {
    position: absolute;
    top: 6px;
    left: 6px;
}

.mini-tag {
    background: linear-gradient(135deg, #45423c, #1a1a1a);
    color: #f8e1c3;
    font-size: 8px;
    font-weight: 800;
    padding: 1px 4px;
    border-radius: 3px;
    letter-spacing: 0.5px;
}

.card-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.service-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    flex: 1;
    margin-right: 8px;
}

.price-wrap {
    display: flex;
    flex-direction: row;
    align-items: baseline;
}

.price-val {
    font-size: 16px;
    font-weight: 800;
    color: #ef4444;
}

.price-unit {
    font-size: 10px;
    color: #94a3b8;
    margin-left: 2px;
}

.service-desc {
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
    margin-top: 4px;
}

.stats-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
}

.stat-text {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 600;
}

.go-detail {
    font-size: 10px;
    color: #3D8E63;
    font-weight: 700;
}

.service-card-premium {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 20px 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-top: 4px;
  border: 1px solid #f8fafc;
}

.grid-item-garden {
  width: 25%;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 14px 0;
  gap: 8px;
}

.icon-wrapper-garden {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
}

.service-name-garden {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-align: center;
  width: 100%;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
