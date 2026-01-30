<template>
  <view class="px-4 pb-4 mt-2">
    <!-- Loading State -->
    <view v-if="loading" class="py-10 flex items-center justify-center">
      <text class="text-gray-400">加载中...</text>
    </view>

    <view v-else>
      <!-- Standard Services Section (Grouped Vertically) -->
      <view class="mb-6">
        <view class="flex items-center justify-between mb-2 px-1">
          <view class="flex items-center gap-2">
            <view class="w-1.5 h-4.5 rounded-full" style="background-color: #3D8E63;"></view>
            <text class="text-base font-bold text-gray-900">推荐标准服务</text>
          </view>
          <view @click="emit('viewStandard')" class="flex items-center gap-1 active-opacity-60">
            <text class="text-sm text-emerald-600 font-bold">更多</text>
            <text class="text-xs text-emerald-600">›</text>
          </view>
        </view>

        <!-- Dynamic Groups -->
        <view v-if="groupedStandardServices && groupedStandardServices.length > 0">
          <view 
            v-for="group in (groupedStandardServices || [])" 
            :key="group.category"
            class="mb-6"
          >
            <!-- Sub-category Header -->
            <view class="flex flex-row items-center mb-2 px-1">
               <text class="text-sm font-bold text-gray-700">{{ group.category }}</text>
            </view>

            <!-- Services in this Category -->
            <view class="flex flex-col gap-3 mb-2" v-if="group.services">
                <view 
                  v-for="item in (group.services || [])" 
                  :key="item.id"
                  class="daowei-card-home active-scale-99"
                  style="display: flex !important; flex-direction: row !important; align-items: stretch !important; width: auto !important; margin: 0 4px 20px 4px !important; box-sizing: border-box !important;"
                  @click="emit('serviceClick', item)"
                >
                  <!-- Left: Image (Fixed size for horizontal layout) -->
                  <view class="card-left" style="width: 100px !important; height: 100px !important; flex-shrink: 0 !important; margin-right: 12px !important;">
                      <image v-if="item.images?.[0]" :src="item.images[0]" mode="aspectFill" class="service-img rounded-xl" style="width: 100% !important; height: 100% !important;" />
                      <view v-else class="service-img rounded-xl flex items-center justify-center bg-gray-50 text-2xl" style="width: 100% !important; height: 100% !important;">🛠️</view>
                      <view class="badge-overlay-mini">
                          <view class="mini-tag">直选</view>
                      </view>
                  </view>
  
                  <!-- Right: Details -->
                  <view class="card-right" style="flex: 1 !important; min-width: 0 !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; padding: 2px 0 !important;">
                      <view style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: flex-start !important; width: 100% !important;">
                          <text class="service-title line-clamp-2" style="font-size: 16px !important; font-weight: 700 !important; color: #1e293b !important; flex: 1 !important; margin-right: 8px !important;">{{ item.title }}</text>
                          <view class="price-wrap shrink-0" style="display: flex !important; flex-direction: row !important; align-items: baseline !important;">
                              <text class="price-val" style="font-size: 18px !important; font-weight: 800 !important; color: #ef4444 !important;">${{ item.price }}</text>
                              <text class="price-unit" style="font-size: 11px !important; color: #94a3b8 !important; margin-left: 2px !important;">/{{ item.unit || '次' }}</text>
                          </view>
                      </view>
                      <text class="service-desc line-clamp-1" style="font-size: 13px !important; color: #64748b !important; margin: 4px 0 !important;">{{ item.description || '由优服佳认证服务商提供的专业优质服务。' }}</text>
                      <view style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-top: auto !important;">
                          <view class="stats-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 4px !important;">
                              <AppIcon name="star" :size="12" color="#f59e0b" />
                              <text class="stat-text" style="font-size: 12px !important; color: #94a3b8 !important; font-weight: 600 !important;">5.0 · 已售 100+</text>
                          </view>
                          <view style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 2px !important;">
                              <text class="go-detail" style="font-size: 13px !important; color: #3D8E63 !important; font-weight: 800 !important;">立即预约</text>
                              <text style="font-size: 12px !important; color: #3D8E63 !important; font-weight: 800 !important; margin-left: 2px !important;">></text>
                          </view>
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
        <view class="flex items-center justify-between mb-2 mt-2 px-1">
          <view class="flex items-center gap-2">
            <view class="w-1 h-4 rounded-full" style="background-color: #3D8E63;"></view>
            <text class="text-base font-bold text-gray-900">推荐定制服务</text>
          </view>
          <view @click="emit('viewCustom')" class="flex items-center gap-1 active-opacity-60">
            <text class="text-sm text-emerald-600 font-bold">更多</text>
            <text class="text-xs text-emerald-600">›</text>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="!(hotCustomTemplates && hotCustomTemplates.length > 0)" class="bg-white rounded-2xl py-8 flex flex-col items-center justify-center shadow-sm border border-gray-50">
          <AppIcon name="sparkles" :size="40" class="text-gray-100 mb-2"/>
          <text class="text-gray-400 text-sm">暂无热门定制服务</text>
        </view>

        <!-- Premium Icon Garden (Matching main Service Grid exactly) -->
        <view v-else class="service-card-premium" style="background-color: #ffffff !important; border-radius: 30px !important; padding: 24px 8px !important; margin: 0 4px 24px 4px !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.06) !important; width: auto !important;">
          <view style="display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; width: 100% !important; justify-content: flex-start !important;">
            <view 
              v-for="template in (hotCustomTemplates || [])" 
              :key="template.id"
              class="grid-item-garden"
              style="width: 25% !important; display: flex !important; flex-direction: column !important; align-items: center !important; padding: 12px 0 !important; gap: 8px !important;"
              @tap.stop="handleTemplateClick(template)"
            >
              <view 
                class="icon-wrapper-garden" 
                style="width: 58px !important; height: 58px !important; border-radius: 18px !important; background-color: #F8FAFC !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;"
              >
                  <AppIcon 
                    :name="getIconName(template.name)" 
                    :size="32" 
                    :color="getTemplateColor(template) || '#3D8E63'"
                    :stroke-width="1.5"
                  />
              </view>
              <text class="service-name-garden" style="font-size: 11px !important; font-weight: 600 !important; color: #475569 !important; text-align: center !important; width: 100% !important; padding: 0 2px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important;">{{ template.name }}</text>
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
  if (!name) return 'clipboard';
  const n = name.toLowerCase();
  if (n.includes('清洁') || n.includes('保洁') || n.includes('cleaning')) return 'sparkles';
  if (n.includes('搬家') || n.includes('搬运') || n.includes('moving')) return 'truck';
  if (n.includes('维修') || n.includes('修理') || n.includes('repair')) return 'wrench';
  if (n.includes('接送') || n.includes('接机') || n.includes('机场') || n.includes('transport')) return 'car';
  if (n.includes('安装')) return 'hammer';
  if (n.includes('管道') || n.includes('疏通')) return 'droplet';
  if (n.includes('园艺') || n.includes('除草') || n.includes('garden')) return 'leaf';
  if (n.includes('陪诊') || n.includes('看护') || n.includes('care')) return 'heart';
  if (n.includes('宠物') || n.includes('pet')) return 'paw-print';
  return 'clipboard';
};

const handleTemplateClick = (template: any) => {
    emit('template-click', template);
};

const getTemplateColor = (template: any): string => {
  const name = template.name || '';
  const n = name.toLowerCase();
  // Force H5 colors: Blue for cleaning, Green for others
  if (n.includes('清洁') || n.includes('保洁') || n.includes('cleaning')) return '#4A90E2';
  if (n.includes('搬家') || n.includes('搬运') || n.includes('moving')) return '#3D8E63';
  if (n.includes('维修') || n.includes('修理') || n.includes('repair')) return '#3D8E63';
  if (n.includes('接送') || n.includes('接机') || n.includes('transport')) return '#3D8E63';
  if (n.includes('园艺') || n.includes('garden')) return '#3D8E63';
  // If template has a custom color from DB and it's not black, use it as fallback
  if (template.color && template.color !== '#000000' && template.color !== '#111827') return template.color;
  return '#3D8E63';
};

const fetchHotServices = async () => {
  loading.value = true;
  try {
    const standardRes = await servicesApi.getOfferings({ city: props.currentCity || '' });
    // Map only essential fields to reduce setData size
    hotStandardServices.value = (standardRes.services || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      price: s.price,
      unit: s.unit,
      images: s.images || [],
      category: s.category || '其他服务',
      original: s // Keep for full access if needed on click
    }));

    const customRes = await formTemplatesApi.getPublished();
    const popularTemplates = (customRes.templates || []).filter(
      (t: any) => t.is_popular && ['custom', 'complex'].includes(t.type)
    );
    // Map only essential fields
    hotCustomTemplates.value = popularTemplates.slice(0, 8).map((t: any) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      type: t.type
    }));
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
.w-2 { width: 8px; }
.h-5 { height: 20px; }
.h-2 { height: 8px; }
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
    border-radius: 24px;
    padding: 14px;
    display: flex !important;
    flex-direction: row !important;
    gap: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.06) !important;
    border: 1px solid rgba(255,255,255,0.8) !important;
    margin-bottom: 20px !important;
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
  border-radius: 50%;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: #F8FAFC;
  transition: all 0.2s;
}

.inner-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
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
