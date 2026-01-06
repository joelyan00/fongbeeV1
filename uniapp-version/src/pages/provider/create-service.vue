<template>
  <view class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <view class="bg-gray-800 px-4 py-3 flex flex-row items-center justify-between border-b border-gray-700 pt-custom">
      <view @click="handleBack" class="w-8 h-8 flex items-center justify-center">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="text-lg font-bold text-white">创建标准服务</text>
      <view class="w-8"></view>
    </view>

    <!-- Category Badge -->
    <view class="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
      <view class="flex flex-row items-center gap-2">
        <text class="text-gray-400 text-sm">所属类目：</text>
        <view class="bg-teal-600/20 px-3 py-1 rounded-full">
          <text class="text-teal-400 text-sm font-medium">{{ categoryName }}</text>
        </view>
      </view>
    </view>

    <!-- Form Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="p-4 flex flex-col gap-4">
        <!-- Service Title -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务标题 <text class="text-red-400">*</text></text>
          <input 
            v-model="form.title"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="请输入服务标题，如：专业家庭保洁服务"
            maxlength="50"
          />
          <text class="text-gray-500 text-xs mt-2 block">{{ form.title.length }}/50</text>
        </view>

        <!-- Service Description -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务描述 <text class="text-red-400">*</text></text>
          <textarea 
            v-model="form.description"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="请详细描述您提供的服务内容、服务特点等"
            :maxlength="500"
            style="height: 120px;"
          />
          <text class="text-gray-500 text-xs mt-2 block">{{ form.description.length }}/500</text>
        </view>

        <!-- Price -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务价格 <text class="text-red-400">*</text></text>
          <view class="flex flex-row items-center gap-2">
            <text class="text-gray-400">¥</text>
            <input 
              v-model="form.price"
              type="digit"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="请输入价格"
            />
            <view class="flex flex-row gap-2">
              <view 
                v-for="unit in priceUnits"
                :key="unit.value"
                @click="form.priceUnit = unit.value"
                :class="['px-3 py-2 rounded-lg text-sm', 
                  form.priceUnit === unit.value 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-700 text-gray-400']"
              >
                <text :class="form.priceUnit === unit.value ? 'text-white' : 'text-gray-400'">{{ unit.label }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Service Duration -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务时长</text>
          <view class="flex flex-row items-center gap-2">
            <input 
              v-model="form.duration"
              type="number"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="如：2"
            />
            <view class="bg-gray-700 px-4 py-3 rounded-lg">
              <text class="text-gray-400 text-sm">小时</text>
            </view>
          </view>
        </view>

        <!-- Service Area -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务区域</text>
          <input 
            v-model="form.serviceArea"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="请输入服务覆盖区域，如：北京市朝阳区"
          />
        </view>

        <!-- Service Images (Placeholder) -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务图片</text>
          <view class="flex flex-row flex-wrap gap-2">
            <view 
              @click="uploadImage"
              class="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center border border-dashed border-gray-600"
            >
              <AppIcon name="plus" :size="24" color="#6b7280"/>
            </view>
            <view 
              v-for="(img, idx) in form.images"
              :key="idx"
              class="relative w-20 h-20 rounded-lg overflow-hidden"
            >
              <image :src="img" mode="aspectFill" class="w-full h-full"/>
              <view 
                @click="removeImage(idx)"
                class="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
              >
                <AppIcon name="x" :size="12" color="#ffffff"/>
              </view>
            </view>
          </view>
          <text class="text-gray-500 text-xs mt-2 block">最多上传5张图片</text>
        </view>
      </view>
    </scroll-view>

    <!-- Footer -->
    <view class="bg-gray-800 border-t border-gray-700 px-4 py-4 pb-safe flex flex-row gap-3">
      <view 
        @click="saveDraft"
        class="flex-1 h-12 rounded-xl border border-gray-600 flex items-center justify-center"
      >
        <text class="text-gray-300 font-medium">保存草稿</text>
      </view>
      <view 
        @click="submitForReview"
        :class="['flex-1 h-12 rounded-xl flex items-center justify-center',
          canSubmit ? 'bg-teal-600 active:bg-teal-700' : 'bg-gray-600']"
      >
        <text class="text-white font-bold">{{ submitting ? '提交中...' : '提交审核' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { providersApi } from '@/services/api';

const categoryName = ref('');
const categoryId = ref('');
const submitting = ref(false);

const form = ref({
  title: '',
  description: '',
  price: '',
  priceUnit: 'per_service',
  duration: '',
  serviceArea: '',
  images: [] as string[],
});

const priceUnits = [
  { value: 'per_service', label: '每次' },
  { value: 'per_hour', label: '每小时' },
];

const canSubmit = computed(() => {
  return form.value.title.trim() && 
         form.value.description.trim() && 
         form.value.price && 
         !submitting.value;
});

onMounted(() => {
  // Get category from URL params
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage.$page?.options || currentPage.options || {};
  
  categoryName.value = decodeURIComponent(options.category || '');
  categoryId.value = options.categoryId || '';
});

const handleBack = () => {
  uni.navigateBack();
};

const uploadImage = () => {
  if (form.value.images.length >= 5) {
    return uni.showToast({ title: '最多上传5张图片', icon: 'none' });
  }
  
  uni.chooseImage({
    count: 5 - form.value.images.length,
    success: (res) => {
      form.value.images.push(...res.tempFilePaths);
    }
  });
};

const removeImage = (idx: number) => {
  form.value.images.splice(idx, 1);
};

const saveDraft = async () => {
  if (!form.value.title.trim()) {
    return uni.showToast({ title: '请输入服务标题', icon: 'none' });
  }
  
  try {
    // TODO: Save draft API
    uni.showToast({ title: '草稿已保存', icon: 'success' });
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
};

const submitForReview = async () => {
  if (!canSubmit.value) {
    return uni.showToast({ title: '请填写必填项', icon: 'none' });
  }
  
  submitting.value = true;
  try {
    await providersApi.createService({
      category: categoryName.value,
      categoryId: categoryId.value,
      title: form.value.title,
      description: form.value.description,
      price: parseFloat(form.value.price),
      priceUnit: form.value.priceUnit,
      duration: form.value.duration ? parseInt(form.value.duration) : null,
      serviceArea: form.value.serviceArea,
      images: form.value.images,
    });
    
    uni.showToast({ title: '服务已提交审核', icon: 'success' });
    
    setTimeout(() => {
      uni.navigateBack({ delta: 2 }); // Go back to service management
    }, 1500);
  } catch (e: any) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-600 { background-color: #4b5563; }
.bg-teal-600 { background-color: #0d9488; }
.border-gray-700 { border-color: #374151; }
.border-gray-600 { border-color: #4b5563; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-teal-400 { color: #2dd4bf; }
.text-red-400 { color: #f87171; }
</style>
