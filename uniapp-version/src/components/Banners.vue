<template>
  <view class="banner-wrapper">
    <swiper
      class="banner-swiper"
      :indicator-dots="true"
      indicator-color="rgba(255,255,255,0.4)"
      indicator-active-color="#ffffff"
      :autoplay="true"
      :interval="4000"
      :circular="true"
    >
      <swiper-item v-for="(banner, index) in banners" :key="index">
        <!-- 1. Dynamic Image Banner (Backend) -->
        <view v-if="banner.image_url" class="banner-item" style="padding:0; position:relative;" @click="handleBannerClick(banner)">
            <image :src="banner.image_url" mode="aspectFill" style="width:100%; height:100%; border-radius:8px;" />
        </view>
        
        <!-- 2. Legacy Gradient Banner (Fallback) -->
        <view v-else class="banner-item" :style="{ background: banner.gradient }">
          <!-- Badge -->
          <view class="banner-badge" v-if="banner.badge">
            <text class="badge-text">{{ banner.badge }}</text>
          </view>
          
          <!-- Main Content -->
          <view class="banner-content">
            <view class="text-row">
              <text class="prefix-text">{{ banner.prefix }}</text>
              <text class="highlight-text">{{ banner.highlight }}</text>
              <text class="suffix-text">{{ banner.suffix }}</text>
            </view>
          </view>
          
          <!-- CTA Button -->
          <view class="cta-btn">
            <text class="cta-text">{{ banner.cta }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { bannersApi } from '@/services/api';

const props = defineProps({
  currentLocation: {
    type: String,
    default: '多伦多'
  }
});

const ALL_BANNERS = [
  {
    cities: ['all'],
    gradient: 'linear-gradient(135deg, #00a980 0%, #006e56 100%)', // Match PC Primary Green
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

const banners = ref<any[]>([]);

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

watch(() => props.currentLocation, (newVal) => {
    filterBanners();
}, { immediate: true });

function filterBanners() {
    // Priority: API data if available (mocked for now as we don't have real city field in API yet)
    // Mixing local mock data for demo purpose:
    const mockFiltered = ALL_BANNERS.filter(b => 
        !b.cities || b.cities.includes('all') || b.cities.some(c => props.currentLocation.includes(c))
    );
    banners.value = mockFiltered.length ? mockFiltered : [ALL_BANNERS[0]];
}

onMounted(async () => {
    try {
        const res = await bannersApi.getActive();
        if (res && res.length > 0) {
            // For production, we would filter 'res' based on city if backend supported it.
            // For now, we prefer local mock to show the "difference" requested by user.
            // banners.value = res; 
        }
    } catch (e) {
        console.error('Fetch banner error', e); 
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
