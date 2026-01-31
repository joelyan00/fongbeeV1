<template>
  <view class="page-container" style="background-color: #f9fafb; min-height: 100vh; display: flex; flex-direction: column;">
    <!-- Header aligned with Capsule Button -->
    <view class="bg-white border-b border-gray-100" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
      <view style="display: flex !important; flex-direction: row !important; align-items: center !important;" :style="{height: navBarHeight + 'px'}">
        <view @click="handleBack" style="width: 40px; height: 100%; display: flex; align-items: center; justify-content: flex-start;">
          <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" />
        </view>
        <text style="font-weight: bold; font-size: 19px; flex: 1; text-align: center; padding-right: 40px; color: #1f2937;">申请售后服务</text>
      </view>
    </view>
    
    <!-- Spacer for fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px', flexShrink: 0}"></view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1" style="flex: 1;">
      <view style="padding: 16px 20px;">
        
        <!-- Problem Description Card -->
        <view class="card-box" style="background: #ffffff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-bottom: 16px; border: 1px solid #f3f4f6;">
           <view class="flex flex-row items-center mb-3" style="display: flex !important; flex-direction: row !important; align-items: center !important; margin-bottom: 12px;">
             <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2" style="width: 4px; height: 16px; background-color: #10b981; border-radius: 99px; margin-right: 8px;"></view>
             <text class="font-bold text-gray-900" style="font-size: 15px; color: #111827; font-weight: 700;">问题描述</text>
           </view>
           <view class="input-area" style="background-color: #f9fafb; border-radius: 12px; padding: 12px; border: 1px solid #f3f4f6;">
             <textarea 
                v-model="description"
                class="w-full h-32 text-gray-800 leading-relaxed"
                style="width: 100%; height: 128px; color: #1f2937; line-height: 1.6; font-size: 14px; background: transparent; border: none;"
                placeholder="请详细描述您遇到的问题，以便服务商尽快为您解决..."
                placeholder-style="color: #9CA3AF; font-size: 14px;"
                :maxlength="500"
             />
             <text class="text-xs text-gray-400 text-right block mt-2" style="display: block; font-size: 12px; color: #9ca3af; text-align: right; margin-top: 8px;">{{ description.length }}/500</text>
           </view>
        </view>

        <!-- Photo Upload Card -->
        <view class="card-box" style="background: #ffffff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-bottom: 16px; border: 1px solid #f3f4f6;">
           <view class="flex flex-row items-center mb-4" style="display: flex !important; flex-direction: row !important; align-items: center !important; margin-bottom: 16px;">
             <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2" style="width: 4px; height: 16px; background-color: #10b981; border-radius: 99px; margin-right: 8px;"></view>
             <text class="font-bold text-gray-900" style="font-size: 15px; color: #111827; font-weight: 700;">上传照片</text>
             <text class="text-xs text-gray-400 ml-2" style="font-size: 12px; color: #9ca3af; margin-left: 8px;">(可选，最多5张)</text>
           </view>
           
           <view class="flex flex-row flex-wrap gap-4" style="display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 16px !important;">
              <!-- Image Previews -->
              <view 
                v-for="(img, index) in images" 
                :key="index" 
                class="preview-box"
                style="position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 1px solid #f3f4f6;"
              >
                <image :src="img" mode="aspectFill" class="preview-image" style="width: 100%; height: 100%;" />
                <view style="position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.6); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-bottom-left-radius: 12px;" @click.stop="removeImage(index)">
                   <AppIcon name="x" :size="12" color="#fff" />
                </view>
              </view>
              
              <!-- Upload Button -->
              <view 
                v-if="images.length < 5"
                class="upload-btn"
                @click="chooseImage"
                style="width: 80px; height: 80px; background-color: #f9fafb; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #d1d5db;"
              >
                <AppIcon name="camera" :size="24" color="#9CA3AF" />
                <text class="text-gray-400 mt-1" style="font-size: 10px; color: #9ca3af; margin-top: 4px;">上传凭证</text>
              </view>
           </view>
        </view>

      </view>
    </scroll-view>

    <!-- Bottom Submit Bar -->
    <view class="bg-white px-4 py-3 pb-safe border-t border-gray-100" style="background: #ffffff; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid #f3f4f6;">
       <button 
         class="w-full h-11 bg-emerald-600 text-white rounded-full font-bold flex items-center justify-center shadow-lg active:scale-[0.98] transition-all"
         style="width: 100%; height: 44px; background: #059669; color: #ffffff; border-radius: 22px; font-weight: 700; font-size: 16px; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.2);"
         @click="submitApplication"
         :disabled="submitting || !description"
         :style="{ opacity: (!description || submitting) ? '0.5' : '1' }"
       >
         {{ submitting ? '正在提交...' : '提交申请' }}
       </button>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { ordersV2Api, uploadApi } from '@/services/api';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const description = ref('');
const images = ref<string[]>([]);
const submitting = ref(false);
const orderId = ref('');

onLoad((options: any) => {
    if (options?.orderId) {
        orderId.value = options.orderId;
    }
});

onMounted(() => {
  // #ifdef MP-WEIXIN
  const menuBtn = uni.getMenuButtonBoundingClientRect();
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 44;
  navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
  capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
  // #endif
  // #ifndef MP-WEIXIN
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
  navBarHeight.value = 44;
  capsuleWidth.value = 0;
  // #endif
});

const handleBack = () => uni.navigateBack();

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - images.value.length,
    success: async (res) => {
      uni.showLoading({ title: '上传中...' });
      try {
          for (const path of res.tempFilePaths) {
              const url = await uploadApi.uploadFile(path);
              images.value.push(url);
          }
      } catch (e: any) {
          uni.showToast({ title: e.message || '上传失败', icon: 'none' });
      } finally {
          uni.hideLoading();
      }
    }
  });
};

const removeImage = (index: number) => {
  images.value.splice(index, 1);
};

const submitApplication = async () => {
  if (!description.value) return;
  if (!orderId.value) return uni.showToast({ title: '订单信息缺失', icon: 'none' });
  
  submitting.value = true;
  
  try {
      await ordersV2Api.submitComplaint(orderId.value, {
          content: description.value,
          images: images.value,
          type: '售后申请'
      });
      
      uni.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
  } catch (e: any) {
      uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  } finally {
      submitting.value = false;
  }
};

onMounted(() => {
  // #ifdef MP-WEIXIN
  const menuBtn = uni.getMenuButtonBoundingClientRect();
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 44;
  navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
  capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
  // #endif
  // #ifndef MP-WEIXIN
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
  navBarHeight.value = 44;
  capsuleWidth.value = 0;
  // #endif
});
</script>

<style scoped>
/* Page Layout */
.page-container {
    min-height: 100vh;
    background-color: #F9FAFB; /* Gray-50 force */
    display: flex;
    flex-direction: column;
}

/* Header Styles */
.header-light {
    background: #ffffff;
    padding-left: 16px;
    padding-right: 16px;
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid #f3f4f6;
}
.header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}
.header-back {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 6px;
}
.header-title {
    font-size: 19px;
    font-weight: bold;
    color: #1f2937;
    line-height: 56px;
}
.header-placeholder {
    width: 40px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
}
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}

/* Card Styles - Explicit to fix UI issues */
.card-box {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    margin-bottom: 16px;
    border: 1px solid #f3f4f6;
}

.input-area {
    background-color: #F9FAFB;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid #F3F4F6;
}

/* Upload Styles */
.preview-box {
    position: relative;
    width: 96px;
    height: 96px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    border: 1px solid #F3F4F6;
}

.preview-image {
    width: 100%;
    height: 100%;
}

.upload-btn {
    width: 96px;
    height: 96px;
    background-color: #F9FAFB;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #D1D5DB;
    transition: background-color 0.2s;
}

.upload-btn:active {
    background-color: #F3F4F6;
}

.active-opacity:active { opacity: 0.7; }
</style>
