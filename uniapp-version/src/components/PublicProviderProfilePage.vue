<template>
  <view class="provider-profile-page">
    <!-- Premium Header with Gradient (Now Transparent) -->
    <view class="header-gradient">
      <!-- Back Button -->
      <view class="back-button" @click="$emit('back')">
        <AppIcon name="chevron-left" :size="24" class="icon-dark" />
      </view>
    </view>

    <!-- Profile Card (overlapping gradient) -->
    <view class="profile-card-wrapper">
      <view class="profile-card">
        <!-- Avatar -->
        <view class="avatar-container">
          <image v-if="profile?.user?.avatar" :src="profile.user.avatar" class="avatar-img" />
          <AppIcon v-else name="user" :size="40" class="icon-emerald" />
          <!-- Verified Badge -->
          <view class="verified-badge">
            <AppIcon name="star" :size="10" class="icon-white" />
          </view>
        </view>

        <!-- Name & Rating -->
        <text class="provider-name">{{ profile?.company_name || profile?.user?.name || '优质服务商' }}</text>
        <view class="rating-row">
          <view class="rating-badge">
            <AppIcon name="star" :size="12" class="icon-amber" />
            <text class="rating-text">5.0</text>
          </view>
          <text class="service-count">已服务 100+ 次</text>
        </view>

        <!-- Stats Row -->
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-value">{{ profile?.experience_years || '5+' }}</text>
            <text class="stat-label">从业年限</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">100%</text>
            <text class="stat-label">好评率</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">2h</text>
            <text class="stat-label">响应速度</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Loading State -->
    <view v-if="loading" class="loading-container">
      <view class="spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Content -->
    <view v-else-if="profile" class="content-section">
      <!-- About Section -->
      <view class="info-card">
        <view class="section-header">
          <view class="section-indicator"></view>
          <text class="section-title">品牌介绍</text>
        </view>
        <text class="description-text">{{ profile.description || '该服务商暂时还未在主页分享其品牌故事。' }}</text>
      </view>

      <!-- Services Section -->
      <view class="info-card">
        <view class="section-header">
          <view class="section-indicator"></view>
          <text class="section-title">服务能力</text>
        </view>

        <!-- Business Scope -->
        <view class="info-row">
          <view class="info-icon blue">
            <AppIcon name="grid" :size="16" class="icon-blue" />
          </view>
          <view class="info-content">
            <text class="info-label">主营业务</text>
            <view class="tag-container">
              <view v-for="tag in parsedBusinessScope" :key="tag" class="tag blue">
                {{ tag }}
              </view>
              <text v-if="parsedBusinessScope.length === 0" class="info-value">专业全品类家政</text>
            </view>
          </view>
        </view>

        <!-- Service Cities -->
        <view class="info-row">
          <view class="info-icon green">
            <AppIcon name="location" :size="16" class="icon-green" />
          </view>
          <view class="info-content">
            <text class="info-label">覆盖城市</text>
            <view class="tag-container">
              <view v-for="city in parsedCities" :key="city" class="tag green">
                {{ city }}
              </view>
              <text v-if="parsedCities.length === 0" class="info-value">全城可约</text>
            </view>
          </view>
        </view>

        <!-- Languages -->
        <view class="info-row">
          <view class="info-icon purple">
            <AppIcon name="user" :size="16" class="icon-purple" />
          </view>
          <view class="info-content">
            <text class="info-label">语言能力</text>
            <view class="tag-container">
              <view v-for="lang in parsedLanguages" :key="lang" class="tag purple">
                {{ lang }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Platform Assurance Card -->
      <view class="assurance-card">
        <view class="assurance-header">
          <view class="shield-icon">
            <AppIcon name="shield-check" :size="20" class="icon-white" />
          </view>
          <view class="assurance-text">
            <text class="assurance-title">平台交易保障</text>
            <text class="assurance-subtitle">资金安全 · 服务到家 · 售后无忧</text>
          </view>
        </view>
        <text class="assurance-desc">
          为您保障每一笔订单。请在此平台下单支付以确保您的财产安全及售后维权。
        </text>
      </view>
    </view>

    <!-- Error State -->
    <view v-else class="error-container">
      <view class="error-icon-wrap">
        <AppIcon name="alert-triangle" :size="32" class="icon-gray" />
      </view>
      <text class="error-title">服务商不存在</text>
      <text class="error-desc">我们暂时无法检索到该服务商的数据。</text>
      <view class="back-btn" @click="$emit('back')">
        <text class="back-btn-text">返回</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from './Icons.vue';
import { providersApi } from '@/services/api';

const props = defineProps<{
  providerId: string;
}>();

defineEmits(['back']);

const loading = ref(true);
const profile = ref<any>(null);

// Parsing helpers
const parsedCities = computed(() => {
  if (!profile.value?.service_city) return [];
  try {
    if (typeof profile.value.service_city === 'string' && profile.value.service_city.startsWith('[')) {
      return JSON.parse(profile.value.service_city);
    }
    if (Array.isArray(profile.value.service_city)) return profile.value.service_city;
    if (typeof profile.value.service_city === 'string') {
      return profile.value.service_city.split(',').map((c: string) => c.trim()).filter(Boolean);
    }
  } catch (e) {
    console.warn('Failed to parse cities:', e);
  }
  return [];
});

const parsedBusinessScope = computed(() => {
  if (!profile.value?.business_scope) return [];
  return profile.value.business_scope.split(/[，,]/).map((s: string) => s.trim()).filter(Boolean);
});

const parsedLanguages = computed(() => {
  if (!profile.value?.languages) return ['国语'];
  return profile.value.languages.split(/[，,]/).map((s: string) => s.trim()).filter(Boolean);
});

const loadProfile = async () => {
  if (!props.providerId) return;
  loading.value = true;
  try {
    const res = await providersApi.getPublicProfile(props.providerId);
    profile.value = res.profile;
  } catch (error) {
    console.error('Failed to load profile:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.provider-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Header area */
.header-gradient {
  background: transparent;
  height: auto;
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-top: calc(12px + env(safe-area-inset-top));
  padding-bottom: 12px;
  z-index: 20;
}

.back-button {
  margin-left: 16px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Profile Card */
.profile-card-wrapper {
  padding: 0 16px;
  margin-top: 0;
  position: relative;
  z-index: 10;
}

.profile-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 16px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.verified-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.provider-name {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.rating-badge {
  display: flex;
  align-items: center;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 6px;
  gap: 4px;
}

.rating-text {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
}

.service-count {
  font-size: 12px;
  color: #9ca3af;
}

/* Stats Row */
.stats-row {
  display: flex;
  width: 100%;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #f3f4f6;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #d1fae5;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #9ca3af;
}

/* Content Section */
.content-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-indicator {
  width: 4px;
  height: 16px;
  background: #10b981;
  border-radius: 2px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.description-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

/* Info Rows */
.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.info-icon.blue { background: #dbeafe; }
.info-icon.green { background: #d1fae5; }
.info-icon.purple { background: #ede9fe; }

.info-content {
  flex: 1;
}

.info-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.info-value {
  font-size: 14px;
  color: #6b7280;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag.blue {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.tag.green {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.tag.purple {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}

/* Assurance Card */
.assurance-card {
  background: linear-gradient(135deg, #1f2937, #111827);
  border-radius: 20px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.assurance-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.shield-icon {
  width: 40px;
  height: 40px;
  background: #10b981;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assurance-text {
  display: flex;
  flex-direction: column;
}

.assurance-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.assurance-subtitle {
  color: #34d399;
  font-size: 11px;
  margin-top: 2px;
}

.assurance-desc {
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.6;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}

.error-icon-wrap {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.error-desc {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 24px;
}

.back-btn {
  background: #111827;
  padding: 12px 32px;
  border-radius: 24px;
}

.back-btn-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

/* Icon Colors */
.icon-white { color: #ffffff; }
.icon-dark { color: #111827; }
.icon-emerald { color: #059669; }
.icon-amber { color: #d97706; }
.icon-blue { color: #2563eb; }
.icon-green { color: #059669; }
.icon-purple { color: #7c3aed; }
.icon-gray { color: #d1d5db; }
</style>
