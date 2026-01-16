<template>
  <view class="timeline-container">
    <view class="section-header">
      <view class="header-dot"></view>
      <text class="section-title">服务动态</text>
    </view>
    
    <view v-if="loading" class="loading-state">
      <view class="mini-spinner"></view>
      <text class="loading-text">加载动态...</text>
    </view>

    <view v-else-if="verifications.length === 0" class="empty-state">
      <text class="empty-text">暂无服务记录</text>
    </view>

    <view v-else class="timeline">
      <view v-for="(v, index) in verifications" :key="v.id" class="timeline-item">
        <view class="timeline-line" v-if="index !== verifications.length - 1"></view>
        <view class="timeline-node" :class="getTypeClass(v.type)">
          <AppIcon :name="getVIcon(v.type)" :size="14" color="#fff" />
        </view>
        <view class="timeline-content">
          <view class="v-header">
            <text class="v-type-label">{{ getTypeLabel(v.type) }}</text>
            <text class="v-time">{{ formatDate(v.created_at) }}</text>
          </view>
          
          <view v-if="v.photos?.length" class="photos-grid">
            <image 
              v-for="(photo, pIndex) in v.photos" 
              :key="pIndex"
              :src="photo"
              mode="aspectFill"
              class="timeline-photo"
              @click="previewPhoto(v.photos, pIndex)"
            />
          </view>

          <view v-if="v.description" class="v-desc-bubble" :class="{ 'is-action': v.description.includes('验证') }">
            <text class="v-desc-text">{{ v.description }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import AppIcon from './Icons.vue';
import { getToken, API_BASE_URL } from '@/services/api';

const props = defineProps<{
  orderId: string;
  refreshKey?: number;
}>();

const verifications = ref<any[]>([]);
const loading = ref(true);

const fetchData = async () => {
  if (!props.orderId) return;
  
  loading.value = true;
  try {
    const res: any = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${props.orderId}/verifications`,
      method: 'GET',
      header: { Authorization: `Bearer ${getToken()}` }
    });
    verifications.value = res.data?.verifications || [];
  } catch (e) {
    console.error('Fetch verifications error:', e);
  } finally {
    loading.value = false;
  }
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'service_start': '服务已开始',
    'completion': '服务已完工',
    'rework_request': '客户请求返工',
    'rework_completion': '返工已完成'
  };
  return map[type] || type;
};

const getTypeClass = (type: string) => {
  if (type.includes('rework')) return 'node-rework';
  if (type === 'completion') return 'node-success';
  return 'node-blue';
};

const getVIcon = (type: string) => {
  if (type === 'service_start') return 'play';
  if (type === 'completion') return 'check';
  if (type === 'rework_request') return 'rotate-ccw';
  return 'check-circle';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const previewPhoto = (photos: string[], index: any) => {
  uni.previewImage({ current: index, urls: photos });
};

watch(() => props.refreshKey, () => fetchData());
watch(() => props.orderId, () => fetchData());

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.timeline-container {
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.header-dot {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #10b981;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.loading-state, .empty-state {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 8px;
}

.loading-text, .empty-text {
  font-size: 12px;
  color: #6b7280;
}

.timeline {
  padding-left: 10px;
}

.timeline-item {
  position: relative;
  padding-left: 36px;
  padding-bottom: 30px;
}

.timeline-line {
  position: absolute;
  left: 8px;
  top: 24px;
  bottom: -6px;
  width: 2px;
  background: #374151;
}

.timeline-node {
  position: absolute;
  left: 0;
  top: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 0 0 4px #111827;
}

.node-blue { background: #3b82f6; }
.node-success { background: #10b981; }
.node-rework { background: #f59e0b; }

.v-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.v-type-label {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.v-time {
  font-size: 11px;
  color: #6b7280;
}

.timeline-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.timeline-photo {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: #374151;
}

.v-desc-bubble {
  background: rgba(255, 255, 255, 0.03);
  padding: 8px;
  border-radius: 6px;
}

.v-desc-text {
  font-size: 13px;
  color: #d1d5db;
  line-height: 1.4;
}

.v-desc-bubble.is-action {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.v-desc-bubble.is-action .v-desc-text {
  color: #10b981;
  font-weight: 600;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
