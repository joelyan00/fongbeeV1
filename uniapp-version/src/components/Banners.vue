<template>
  <view :style="{ padding: '0px ' + capsuleMargin + 'px 10px ' + capsuleMargin + 'px' }">
    <swiper
      style="height: 176px; border-radius: 8px; overflow: hidden;"
      :indicator-dots="true"
      indicator-color="rgba(255,255,255,0.4)"
      indicator-active-color="#ffffff"
      :autoplay="true"
      :interval="4000"
      :circular="true"
    >
      <swiper-item v-for="(banner, index) in (banners || [])" :key="index">
        <!-- 1. Dynamic Image Banner (Backend) -->
        <view v-if="banner.image_url" style="width: 100%; height: 100%; position: relative; background-color: #f3f4f6; border-radius: 8px; overflow: hidden;" @click="handleBannerClick(banner)">
            <image 
                :src="banner.image_url" 
                mode="aspectFill" 
                style="width: 100%; height: 100%; border-radius: 8px;"
                @error="banner.image_url = ''"
            />
        </view>
        
        <!-- 2. Legacy Gradient Banner -->
        <view v-else style="width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 16px; box-sizing: border-box; border-radius: 8px; overflow: hidden;" :style="{ background: banner.gradient || 'linear-gradient(135deg, #00a980 0%, #006e56 100%)' }">
          <!-- Badge -->
          <view style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); background-color: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 6px;" v-if="banner.badge">
            <text style="font-size: 12px; color: white; font-weight: 600;">{{ banner.badge }}</text>
          </view>
          
          <!-- Main Content -->
          <view style="flex: 1; display: flex; align-items: center; justify-content: center; padding-top: 20px;">
            <view style="display: flex; flex-direction: row; align-items: baseline;">
              <text style="font-size: 20px; font-weight: 700; color: rgba(255,255,255,0.9);">{{ banner.prefix }}</text>
              <text style="font-size: 48px; font-weight: 800; color: white; margin: 0 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">{{ banner.highlight }}</text>
              <text style="font-size: 20px; font-weight: 700; color: rgba(255,255,255,0.9);">{{ banner.suffix }}</text>
            </view>
          </view>
          
          <!-- CTA Button -->
          <view style="align-self: center; background-color: white; padding: 8px 24px; border-radius: 9999px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" v-if="banner.cta">
            <text style="font-size: 14px; font-weight: 700; color: #374151;">{{ banner.cta }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { bannersApi } from '@/services/api';

// #ifdef MP-WEIXIN
defineOptions({
  options: {
    styleIsolation: 'shared'
  }
})
// #endif

const props = defineProps({
  currentLocation: {
    type: String,
    default: '多伦多'
  }
});

const DEFAULT_BANNER_GRADIENT = 'linear-gradient(135deg, #00a980 0%, #006e56 100%)';

const ALL_BANNERS = [
  {
    cities: ['all'],
    gradient: DEFAULT_BANNER_GRADIENT,
    badge: '✨ 双十二感恩季 ✨',
    prefix: '领',
    highlight: '165',
    suffix: '元维修补贴',
    cta: '立即领取'
  },
  {
    cities: ['多伦多', '万锦', 'Markham', 'Toronto'],
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    badge: '多伦多专属',
    prefix: 'GTA',
    highlight: '开荒保洁',
    suffix: '8折起',
    cta: '预约保洁'
  },
  {
    cities: ['温哥华', 'Vancouver', 'Richmond'],
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    badge: '温哥华特惠',
    prefix: '雨季',
    highlight: '屋顶检修',
    suffix: '免费上门',
    cta: '立即咨询'
  }
];

// Source of truth for all available banners (API + Mock fallback)
const sourceBanners = ref<any[]>(ALL_BANNERS);
// Displayed banners after filtering
const banners = ref<any[]>([]);
const capsuleMargin = ref(12); // Default fallback

const handleBannerClick = (banner: any) => {
    if (!banner.link_url) return;
    
    let url = banner.link_url.trim();

    // 1. Auto-fix "www." to "https://www."
    if (url.startsWith('www.')) {
        url = 'https://' + url;
    }

    // 2. External Link Handling
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // #ifdef H5
        window.open(url, '_blank');
        // #endif
        
        // #ifndef H5
        // For App/MiniProgram, simple copy or todo webview
        uni.setClipboardData({
            data: url,
            success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
        });
        // #endif
    } else {
        // 3. Internal Page Handling
        // Ensure it starts with /
        if (!url.startsWith('/')) {
            url = '/' + url;
        }
        
        uni.navigateTo({
            url: url,
            fail: (err) => {
                console.log('Navigate failed, trying switchTab', err);
                uni.switchTab({
                    url: url,
                    fail: (e) => {
                        console.error('Navigation failed', e);
                        uni.showToast({ title: '无法跳转', icon: 'none' });
                    }
                });
            }
        });
    }
};

// Filter when location OR source data changes
watch([() => props.currentLocation, sourceBanners], () => {
    filterBanners();
}, { immediate: true, deep: true });

    function filterBanners() {
        // Backend returns 'target_cities', not 'cities'
        // If items come from API and don't have target_cities, we assume they are global (show everywhere)
        
        let filtered = sourceBanners.value.filter(b => {
            // Check target_cities (from API) or cities (from mock data)
            const cityList = b.target_cities || b.cities;
            
            // If no cities defined, show to all
            if (!cityList || cityList.length === 0) return true;
            // If 'all' is present
            if (cityList.includes('all')) return true;
            // Check location match
            return cityList.some((c: string) => props.currentLocation.includes(c));
        });
    
        // Fallback 1: Try to find globals
        if (filtered.length === 0 && sourceBanners.value.length > 0) {
            const globals = sourceBanners.value.filter(b => {
                const cityList = b.target_cities || b.cities;
                return !cityList || cityList.includes('all');
            });
            if (globals.length > 0) {
                filtered = globals;
            }
        }
        
        // Fallback 2: Absolutely ensure we show something if source exists
        if (filtered.length === 0 && sourceBanners.value.length > 0) {
            filtered = [sourceBanners.value[0]];
        }
        
        // Fallback 3: If somehow source is empty (e.g. API returned [], wiped defaults), restore defaults
        if (filtered.length === 0) {
            filtered = ALL_BANNERS;
        }
    
        banners.value = filtered;
    }

onMounted(async () => {
    const info = uni.getSystemInfoSync();
    
    // #ifdef MP-WEIXIN
    try {
      const capsule = uni.getMenuButtonBoundingClientRect();
      const margin = info.screenWidth - capsule.right;
      if (margin > 0) {
        capsuleMargin.value = margin;
      }
    } catch (e) {
      console.error('Banners: Get capsule info failed', e);
    }
    // #endif

    try {
        const res = await bannersApi.getActive();
        if (res && res.length > 0) {
            // Process API banners to ensure they have default styling and minimal data
            const processed = res.map(b => ({
                id: b.id,
                image_url: b.image_url,
                link_url: b.link_url,
                gradient: b.gradient || DEFAULT_BANNER_GRADIENT,
                badge: b.badge,
                prefix: b.prefix,
                highlight: b.highlight,
                suffix: b.suffix,
                cta: b.cta,
                target_cities: b.target_cities
            }));
            sourceBanners.value = processed;
        }
    } catch (e) {
        console.error('Fetch banner error', e); 
        // Keep using ALL_BANNERS (initial value of sourceBanners)
    }
});
</script>

<style scoped>
.banner-wrapper {
  padding: 12px 16px;
}

.banner-swiper {
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.banner-badge {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.25);
  padding: 4px 12px;
  border-radius: 6px;
}

.badge-text {
  font-size: 11px;
  color: #ffffff;
  font-weight: 600;
}

.banner-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
}

.text-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.prefix-text {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.highlight-text {
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 4px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.suffix-text {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.cta-btn {
  align-self: center;
  background-color: #ffffff;
  padding: 8px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cta-text {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}
</style>
