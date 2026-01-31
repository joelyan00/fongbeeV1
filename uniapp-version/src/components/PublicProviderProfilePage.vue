<template>
  <view style="padding-bottom: env(safe-area-inset-bottom);">
    <!-- Global Navbar (Handles status bar + nav) -->
    <GlobalNavbar 
      title="服务商详情" 
      background-color="#ffffff" 
      title-color="#111827" 
      icon-color="#111827"
      :show-back="true"
      :fixed="true"
      @back="$emit('back')"
    />

    <!-- Profile Card (overlapping gradient) -->
    <view style="padding: 0 16px; margin-top: 20px; position: relative; z-index: 10;">
      <view style="background: #1f2937; border-radius: 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; align-items: center; border: 1px solid #374151;">
        <!-- Avatar -->
        <view style="width: 80px; height: 80px; border-radius: 50%; background: #064e3b; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 16px;">
          <image v-if="profile?.user?.avatar" :src="profile.user.avatar" style="width: 100%; height: 100%; border-radius: 50%;" />
          <AppIcon v-else name="user" :size="40" color="#10b981" />
          <!-- Verified Badge -->
          <view style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #1f2937;">
            <AppIcon name="star" :size="10" color="#ffffff" />
          </view>
        </view>

        <!-- Name & Rating -->
        <text style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">{{ profile?.company_name || profile?.user?.name || '优质服务商' }}</text>
        <view style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <view style="display: flex; align-items: center; background: rgba(251, 191, 36, 0.15); padding: 4px 8px; border-radius: 6px; gap: 4px;">
            <AppIcon name="star" :size="12" color="#fbbf24" />
            <text style="font-size: 12px; font-weight: 700; color: #fbbf24;">5.0</text>
          </view>
          <text style="font-size: 12px; color: #9ca3af;">已服务 100+ 次</text>
        </view>

        <!-- Stats Row -->
        <view style="display: flex; width: 100%; justify-content: space-around; padding-top: 16px; border-top: 1px solid #374151;">
          <view style="display: flex; flex-direction: column; align-items: center;">
            <text style="font-size: 18px; font-weight: 700; color: #10b981;">{{ profile?.experience_years || '5+' }}</text>
            <text style="font-size: 11px; color: #9ca3af; margin-top: 2px;">从业年限</text>
          </view>
          <view style="width: 1px; height: 32px; background: #374151;"></view>
          <view style="display: flex; flex-direction: column; align-items: center;">
            <text style="font-size: 18px; font-weight: 700; color: #ffffff;">100%</text>
            <text style="font-size: 11px; color: #9ca3af; margin-top: 2px;">好评率</text>
          </view>
          <view style="width: 1px; height: 32px; background: #374151;"></view>
          <view style="display: flex; flex-direction: column; align-items: center;">
            <text style="font-size: 18px; font-weight: 700; color: #ffffff;">2h</text>
            <text style="font-size: 11px; color: #9ca3af; margin-top: 2px;">响应速度</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Loading State -->
    <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0;">
      <view style="width: 32px; height: 32px; border: 3px solid rgba(16, 185, 129, 0.3); border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite;"></view>
      <text style="margin-top: 16px; font-size: 14px; color: #9ca3af;">加载中...</text>
    </view>

    <!-- Content -->
    <view v-else-if="profile" style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
      <!-- About Section -->
      <view style="background: #1f2937; border-radius: 20px; padding: 20px; border: 1px solid #374151;">
        <view style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <view style="width: 4px; height: 16px; background: #10b981; border-radius: 2px;"></view>
          <text style="font-size: 16px; font-weight: 700; color: #ffffff;">品牌介绍</text>
        </view>
        <text style="font-size: 14px; color: #9ca3af; line-height: 1.6;">{{ profile.description || '该服务商暂时还未在主页分享其品牌故事。' }}</text>
      </view>

      <!-- Services Section -->
      <view style="background: #1f2937; border-radius: 20px; padding: 20px; border: 1px solid #374151;">
        <view style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <view style="width: 4px; height: 16px; background: #10b981; border-radius: 2px;"></view>
          <text style="font-size: 16px; font-weight: 700; color: #ffffff;">服务能力</text>
        </view>

        <!-- Business Scope -->
        <view style="display: flex; align-items: flex-start; margin-bottom: 20px;">
          <view style="width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; background: rgba(59, 130, 246, 0.15);">
            <AppIcon name="grid" :size="16" color="#60a5fa" />
          </view>
          <view style="flex: 1;">
            <text style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; display: block;">主营业务</text>
            <view style="display: flex; flex-wrap: wrap; gap: 8px;">
              <view v-for="tag in parsedBusinessScope" :key="tag" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2);">
                {{ tag }}
              </view>
              <text v-if="parsedBusinessScope.length === 0" style="font-size: 14px; color: #9ca3af;">专业全品类家政</text>
            </view>
          </view>
        </view>

        <!-- Service Cities -->
        <view style="display: flex; align-items: flex-start; margin-bottom: 20px;">
          <view style="width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; background: rgba(16, 185, 129, 0.15);">
            <AppIcon name="location" :size="16" color="#10b981" />
          </view>
          <view style="flex: 1;">
            <text style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; display: block;">覆盖城市</text>
            <view style="display: flex; flex-wrap: wrap; gap: 8px;">
              <view v-for="city in parsedCities" :key="city" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);">
                {{ city }}
              </view>
              <text v-if="parsedCities.length === 0" style="font-size: 14px; color: #9ca3af;">全城可约</text>
            </view>
          </view>
        </view>

        <!-- Languages -->
        <view style="display: flex; align-items: flex-start; margin-bottom: 0;">
          <view style="width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; background: rgba(139, 92, 246, 0.15);">
            <AppIcon name="user" :size="16" color="#a78bfa" />
          </view>
          <view style="flex: 1;">
            <text style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; display: block;">语言能力</text>
            <view style="display: flex; flex-wrap: wrap; gap: 8px;">
              <view v-for="lang in parsedLanguages" :key="lang" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2);">
                {{ lang }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Photos Section -->
      <view v-if="profile.albums && profile.albums.length > 0" style="background: #1f2937; border-radius: 20px; padding: 20px; border: 1px solid #374151;">
        <view style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <view style="width: 4px; height: 16px; background: #10b981; border-radius: 2px;"></view>
          <text style="font-size: 16px; font-weight: 700; color: #ffffff;">服务实拍</text>
        </view>
        <scroll-view scroll-x style="width: 100%; white-space: nowrap;" :show-scrollbar="false">
          <view style="display: flex; gap: 12px;">
            <image 
              v-for="(photo, index) in profile.albums" 
              :key="index" 
              :src="photo" 
              style="width: 120px; height: 120px; border-radius: 12px; background: #374151; flex-shrink: 0;"
              mode="aspectFill"
            />
          </view>
        </scroll-view>
      </view>

      <!-- Reviews Section -->
      <view v-if="profile.reviews && profile.reviews.length > 0" style="background: #1f2937; border-radius: 20px; padding: 20px; border: 1px solid #374151;">
        <view style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <view style="width: 4px; height: 16px; background: #10b981; border-radius: 2px;"></view>
          <text style="font-size: 16px; font-weight: 700; color: #ffffff;">用户评价 ({{ profile.reviews.length }})</text>
        </view>
        <view style="display: flex; flex-direction: column; gap: 16px;">
          <view v-for="review in profile.reviews" :key="review.id" style="padding-bottom: 16px; border-bottom: 1px solid #374151;">
            <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <view style="display: flex; align-items: center; gap: 8px;">
                <image 
                  :src="review.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + review.user" 
                  style="width: 24px; height: 24px; border-radius: 50%; background: #374151;"
                />
                <text style="font-size: 13px; font-weight: 600; color: #e5e7eb;">{{ review.user }}</text>
              </view>
              <text style="font-size: 11px; color: #9ca3af;">{{ review.date }}</text>
            </view>
            <view style="display: flex; gap: 2px; margin-bottom: 8px;">
              <AppIcon v-for="i in 5" :key="i" name="star" :size="12" :color="i <= review.rating ? '#d97706' : '#4b5563'" />
            </view>
            <text style="font-size: 13px; color: #d1d5db; line-height: 1.5; white-space: normal;">{{ review.content }}</text>
          </view>
        </view>
      </view>

      <!-- Platform Standards Card -->
      <view style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; padding: 20px; position: relative; overflow: hidden;">
        <view style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <view style="width: 40px; height: 40px; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <AppIcon name="shield-check" :size="20" color="#ffffff" />
          </view>
          <view style="display: flex; flex-direction: column;">
            <text style="color: #10b981; font-size: 15px; font-weight: 700;">优服佳服务标准</text>
            <view style="display: flex; flex-direction: row; gap: 8px; margin-top: 6px;">
              <text style="padding: 2px 8px; background: rgba(16, 185, 129, 0.2); border-radius: 4px; font-size: 10px; color: #34d399; font-weight: 500;">数据驱动</text>
              <text style="padding: 2px 8px; background: rgba(16, 185, 129, 0.2); border-radius: 4px; font-size: 10px; color: #34d399; font-weight: 500;">真实反馈</text>
              <text style="padding: 2px 8px; background: rgba(16, 185, 129, 0.2); border-radius: 4px; font-size: 10px; color: #34d399; font-weight: 500;">高效连接</text>
            </view>
          </view>
        </view>
        <text style="color: #34d399; font-size: 12px; line-height: 1.6; opacity: 0.9;">
          优服佳不参与服务定价，也不为主观信用背书。我们建立了一套严谨的服务存证机制，将每一位服务商的交付速度、用户反馈和履约记录客观呈现。
        </text>
      </view>
    </view>

    <!-- Error State -->
    <view v-else style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 32px; text-align: center;">
      <view style="width: 64px; height: 64px; background: #1f2937; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <AppIcon name="alert-circle" :size="32" color="#9ca3af" />
      </view>
      <text style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">服务商不存在</text>
      <text style="font-size: 14px; color: #9ca3af; margin-bottom: 24px;">我们暂时无法检索到该服务商的数据。</text>
      <view @click="$emit('back')" style="background: #10b981; padding: 12px 32px; border-radius: 24px;">
        <text style="color: #ffffff; font-size: 14px; font-weight: 600;">返回</text>
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

/* Header styles removed, replaced by GlobalNavbar */

/* Profile Card */
.profile-card-wrapper {
  padding: 0 16px;
  /* Add margin to account for fixed navbar (StatusBar + 44px) */
  margin-top: 20px; 
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
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
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
  color: #065f46;
  font-size: 15px;
  font-weight: 700;
}

.standards-tags {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 6px;
}

.standard-tag {
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 4px;
  font-size: 10px;
  color: #34d399;
  font-weight: 500;
}

.assurance-desc {
  color: #047857;
  font-size: 12px;
  line-height: 1.6;
  opacity: 0.8;
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
  background: #10b981;
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
.icon-gray-light { color: #e5e7eb; }

/* Photos Section */
.photos-scroll {
  width: 100%;
  white-space: nowrap;
}

.photos-container {
  display: flex;
  gap: 12px;
}

.portfolio-photo {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: #f3f4f6;
  flex-shrink: 0;
}

/* Reviews Section */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f3f4f6;
}

.review-username {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.review-date {
  font-size: 11px;
  color: #9ca3af;
}

.review-rating {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.review-content {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
  white-space: normal;
}

</style>
