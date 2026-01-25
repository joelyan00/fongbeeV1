<template>
  <view class="page-container">
    <!-- Header matched with Cart -->
    <view class="header-light pt-safe">
       <view class="header-row">
         <view @click="handleBack" class="header-back"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title">申请售后服务</text>
         <view class="header-placeholder"></view>
       </view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="p-4 space-y-4">
        
        <!-- Problem Description Card -->
        <view class="card-box">
           <view class="flex flex-row items-center mb-3">
             <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
             <text class="text-[15px] font-bold text-gray-900">问题描述</text>
           </view>
           <view class="input-area">
             <textarea 
                v-model="description"
                class="w-full h-32 text-[14px] text-gray-800 leading-relaxed"
                placeholder="请详细描述您遇到的问题，以便服务商尽快为您解决..."
                placeholder-style="color: #9CA3AF; font-size: 14px;"
                :maxlength="500"
             />
             <text class="text-xs text-gray-400 text-right block mt-2">{{ description.length }}/500</text>
           </view>
        </view>

        <!-- Photo Upload Card -->
        <view class="card-box">
           <view class="flex flex-row items-center mb-4">
             <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
             <text class="text-[15px] font-bold text-gray-900">上传照片</text>
             <text class="text-xs text-gray-400 ml-2">(可选，最多5张)</text>
           </view>
           
           <view class="flex flex-row flex-wrap gap-4">
              <!-- Image Previews -->
              <view 
                v-for="(img, index) in images" 
                :key="index" 
                class="preview-box"
              >
                <image :src="img" mode="aspectFill" class="preview-image" />
                <view class="absolute top-0 right-0 bg-black/60 w-6 h-6 flex items-center justify-center rounded-bl-xl active-opacity" @click.stop="removeImage(index)">
                   <AppIcon name="x" :size="12" color="#fff" />
                </view>
              </view>
              
              <!-- Upload Button -->
              <view 
                v-if="images.length < 5"
                class="upload-btn active-opacity"
                @click="chooseImage"
              >
                <AppIcon name="camera" :size="28" color="#9CA3AF" />
                <text class="text-[11px] text-gray-400 mt-2 font-medium">上传凭证</text>
              </view>
           </view>
        </view>

      </view>
    </scroll-view>

    <!-- Bottom Submit Bar -->
    <view class="bg-white px-4 py-3 pb-safe border-t border-gray-100">
       <button 
         class="w-full h-11 bg-emerald-600 text-white rounded-full font-bold text-[16px] flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
         @click="submitApplication"
         :disabled="submitting || !description"
         :class="[!description ? 'opacity-50 grayscale' : '']"
       >
         {{ submitting ? '正在提交...' : '提交申请' }}
       </button>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { ordersV2Api, uploadApi } from '@/services/api';

const description = ref('');
const images = ref<string[]>([]);
const submitting = ref(false);
const orderId = ref('');

onLoad((options: any) => {
    if (options?.orderId) {
        orderId.value = options.orderId;
    }
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
