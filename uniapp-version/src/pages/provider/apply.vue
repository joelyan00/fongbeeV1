<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between border-b border-gray-100 pt-custom">
      <text class="text-gray-500 text-base" @click="handleCancel">取消</text>
      <text class="text-lg font-bold text-gray-900">服务商入驻</text>
      <view class="w-12"></view>
    </view>

    <!-- Step Indicator -->
    <view class="bg-white px-4 py-4 border-b border-gray-100">
      <view class="flex flex-row items-start justify-between">
        <!-- Step 1 -->
        <view class="flex flex-col items-center flex-1">
          <view 
            class="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
            :class="currentStep >= 1 ? 'bg-emerald-500' : 'bg-gray-200'"
          >
            <text v-if="currentStep > 1" class="text-white text-sm">✓</text>
            <text v-else class="text-sm" :class="currentStep >= 1 ? 'text-white font-bold' : 'text-gray-400'">1</text>
          </view>
          <text class="text-xs" :class="currentStep >= 1 ? 'text-emerald-600 font-bold' : 'text-gray-400'">基本资料</text>
        </view>
        
        <!-- Line -->
        <view class="flex-1 h-0.5 mt-4" :class="currentStep >= 2 ? 'bg-emerald-500' : 'bg-gray-200'"></view>
        
        <!-- Step 2 -->
        <view class="flex flex-col items-center flex-1">
          <view 
            class="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
            :class="currentStep >= 2 ? 'bg-emerald-500' : 'bg-gray-200'"
          >
            <text v-if="currentStep > 2" class="text-white text-sm">✓</text>
            <text v-else class="text-sm" :class="currentStep >= 2 ? 'text-white font-bold' : 'text-gray-400'">2</text>
          </view>
          <text class="text-xs" :class="currentStep >= 2 ? 'text-emerald-600 font-bold' : 'text-gray-400'">业务范围</text>
        </view>
        
        <!-- Line -->
        <view class="flex-1 h-0.5 mt-4" :class="currentStep >= 3 ? 'bg-emerald-500' : 'bg-gray-200'"></view>
        
        <!-- Step 3 -->
        <view class="flex flex-col items-center flex-1">
          <view 
            class="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
            :class="currentStep >= 3 ? 'bg-emerald-500' : 'bg-gray-200'"
          >
            <text class="text-sm" :class="currentStep >= 3 ? 'text-white font-bold' : 'text-gray-400'">3</text>
          </view>
          <text class="text-xs" :class="currentStep >= 3 ? 'text-emerald-600 font-bold' : 'text-gray-400'">资质上传</text>
        </view>
      </view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="px-4 py-5">
        
        <!-- Step 1: 基本资料 -->
        <view v-if="currentStep === 1">
          <view class="mb-4">
            <text class="text-lg font-bold text-gray-900">基本身份信息</text>
            <text class="text-xs text-gray-400 ml-1">请填写您的公司或个人基本资料</text>
          </view>

          <!-- Company Name -->
          <view class="form-group mb-4">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-medium text-gray-700">公司/个人名称</text>
              <text class="text-red-500 ml-1">*</text>
            </view>
            <input 
              v-model="formData.companyName"
              class="form-input"
              placeholder="请输入名称"
            />
          </view>

          <!-- Phone -->
          <view class="form-group mb-4">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-medium text-gray-700">联系电话</text>
              <text class="text-red-500 ml-1">*</text>
            </view>
            <input 
              v-model="formData.phone"
              class="form-input"
              type="tel"
              placeholder="请输入联系电话"
            />
          </view>

          <!-- Email -->
          <view class="form-group mb-4">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-medium text-gray-700">电子邮箱</text>
              <text class="text-red-500 ml-1">*</text>
            </view>
            <input 
              v-model="formData.email"
              class="form-input"
              type="email"
              placeholder="请输入电子邮箱"
            />
          </view>

          <!-- Address -->
          <view class="form-group mb-4">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-medium text-gray-700">公司地址</text>
              <text class="text-red-500 ml-1">*</text>
            </view>
            <input 
              v-model="formData.street"
              class="form-input mb-3"
              placeholder="街道名及门牌号"
            />
            <input 
              v-model="formData.city"
              class="form-input mb-3"
              placeholder="城市"
            />
            <input 
              v-model="formData.province"
              class="form-input mb-3"
              placeholder="省份"
            />
            <input 
              v-model="formData.postalCode"
              class="form-input"
              placeholder="邮政编码"
            />
          </view>
        </view>

        <!-- Step 2: 业务范围 -->
        <view v-else-if="currentStep === 2">
          <view class="mb-4">
            <text class="text-lg font-bold text-gray-900">选择业务范围</text>
            <text class="text-xs text-gray-400 ml-1">请选择您提供的服务类型</text>
          </view>

          <view v-if="loadingCategories" class="py-8 text-center">
            <text class="text-gray-400 text-sm">加载中...</text>
          </view>
          
          <view v-else class="space-y-3">
            <view 
              v-for="cat in categories" 
              :key="cat.name"
              class="flex flex-row items-center p-4 bg-white rounded-xl border-2 transition-all"
              :class="selectedCategories.includes(cat.name) 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-100'"
              @click="toggleCategory(cat.name)"
            >
              <view 
                class="w-5 h-5 rounded border-2 mr-3 flex items-center justify-center"
                :class="selectedCategories.includes(cat.name) 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-gray-300'"
              >
                <text v-if="selectedCategories.includes(cat.name)" class="text-white text-xs">✓</text>
              </view>
              <text 
                class="text-base"
                :class="selectedCategories.includes(cat.name) ? 'text-emerald-700 font-medium' : 'text-gray-700'"
              >
                {{ cat.name }}
              </text>
            </view>
          </view>
        </view>

        <!-- Step 3: 资质上传 -->
        <view v-else-if="currentStep === 3">
          <view class="mb-4">
            <text class="text-lg font-bold text-gray-900">资质文件上传</text>
            <text class="text-xs text-gray-400 ml-1">上传相关资质证明（可选）</text>
          </view>

          <!-- Description/Experience -->
          <view class="form-group mb-4">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-medium text-gray-700">服务经验描述</text>
            </view>
            <textarea 
              v-model="formData.notes"
              class="form-textarea"
              placeholder="请简要描述您的服务经验或特长..."
            />
          </view>

          <!-- License Upload -->
          <view class="form-group mb-4">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-medium text-gray-700">营业执照/资质证书</text>
              <text class="text-gray-400 text-xs ml-2">(可选)</text>
            </view>
            <view class="flex flex-row flex-wrap gap-3">
              <view 
                v-for="(img, idx) in formData.licenseImages" 
                :key="idx"
                class="w-20 h-20 rounded-xl bg-gray-100 relative overflow-hidden"
              >
                <image :src="img" mode="aspectFill" class="w-full h-full" />
                <view 
                  @click="removeImage('licenseImages', idx)"
                  class="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <text class="text-white text-xs">×</text>
                </view>
              </view>
              <view 
                v-if="formData.licenseImages.length < 3"
                @click="chooseImage('licenseImages')"
                class="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center"
              >
                <text class="text-gray-400 text-2xl">+</text>
                <text class="text-gray-400 text-xs">上传</text>
              </view>
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- Footer -->
    <view class="bg-white border-t border-gray-100 px-4 py-4 pb-safe">
      <view class="flex flex-row gap-3">
        <button 
          v-if="currentStep > 1"
          @click="handlePrev"
          class="flex-1 h-12 rounded-xl font-bold text-base flex items-center justify-center bg-gray-100 text-gray-600 active:bg-gray-200"
        >
          上一步
        </button>
        <button 
          @click="handleNext"
          class="flex-1 h-12 rounded-xl font-bold text-base flex items-center justify-center"
          :class="submitting ? 'bg-gray-400' : 'bg-emerald-600 active:bg-emerald-700'"
          :disabled="submitting"
          style="color: white;"
        >
          <view v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></view>
          {{ currentStep === 3 ? (submitting ? '提交中...' : '提交申请') : '下一步' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { categoriesApi, providersApi, getUserInfo } from '@/services/api';

const currentStep = ref(1); // 1: 基本资料, 2: 业务范围, 3: 资质上传
const categories = ref<any[]>([]);
const loadingCategories = ref(true);
const selectedCategories = ref<string[]>([]);
const submitting = ref(false);

// Form data with typed structure
const formData = ref({
    companyName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    licenseImages: [] as string[]
});

onMounted(() => {
    loadCategories();
    prefillUserInfo();
});

// Auto-fill user's phone and email from logged-in info
const prefillUserInfo = () => {
    const user = getUserInfo();
    if (user) {
        formData.value.email = user.email || '';
        formData.value.phone = user.phone || '';
    }
};

const loadCategories = async () => {
    try {
        const res = await categoriesApi.getAll();
        categories.value = res.categories || [];
    } catch (e) {
        console.error('Failed to load categories', e);
    } finally {
        loadingCategories.value = false;
    }
};

const toggleCategory = (catName: string) => {
    const idx = selectedCategories.value.indexOf(catName);
    if (idx >= 0) {
        selectedCategories.value.splice(idx, 1);
    } else {
        selectedCategories.value.push(catName);
    }
};

const handleCancel = () => {
    uni.navigateBack();
};

const handlePrev = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const handleNext = async () => {
    // Step 1 validation
    if (currentStep.value === 1) {
        if (!formData.value.companyName) {
            return uni.showToast({ title: '请输入公司/个人名称', icon: 'none' });
        }
        if (!formData.value.phone) {
            return uni.showToast({ title: '请输入联系电话', icon: 'none' });
        }
        if (!formData.value.email) {
            return uni.showToast({ title: '请输入电子邮箱', icon: 'none' });
        }
        if (!formData.value.street || !formData.value.city || !formData.value.province) {
            return uni.showToast({ title: '请填写完整地址', icon: 'none' });
        }
        currentStep.value = 2;
        return;
    }

    // Step 2 validation
    if (currentStep.value === 2) {
        if (selectedCategories.value.length === 0) {
            return uni.showToast({ title: '请至少选择一个服务类型', icon: 'none' });
        }
        currentStep.value = 3;
        return;
    }

    // Step 3: Submit
    if (currentStep.value === 3) {
        await submitApplication();
    }
};

const submitApplication = async () => {
    submitting.value = true;
    try {
        // Submit the provider application
        await providersApi.apply({
            company_name: formData.value.companyName,
            phone: formData.value.phone,
            email: formData.value.email,
            company_address: `${formData.value.street}, ${formData.value.city}, ${formData.value.province} ${formData.value.postalCode}`,
            service_city: formData.value.city,
            description: formData.value.notes,
            extra_data: {
                address: {
                    street: formData.value.street,
                    city: formData.value.city,
                    province: formData.value.province,
                    postal_code: formData.value.postalCode
                },
                selected_categories: selectedCategories.value,
                license_images: formData.value.licenseImages
            }
        });

        uni.showToast({ title: '申请已提交，请等待审核', icon: 'success' });
        
        setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/index' });
        }, 1500);
    } catch (e: any) {
        uni.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
        submitting.value = false;
    }
};

// Image upload handlers
const chooseImage = (key: string) => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            if (key === 'licenseImages') {
                formData.value.licenseImages.push(res.tempFilePaths[0]);
            }
        }
    });
};

const removeImage = (key: string, idx: number) => {
    if (key === 'licenseImages') {
        formData.value.licenseImages.splice(idx, 1);
    }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.form-input {
    width: 100%;
    height: 48px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0 16px;
    font-size: 14px;
    color: #111827;
}

.form-input:focus {
    background-color: #fff;
    border-color: #10b981;
}

.form-textarea {
    width: 100%;
    height: 100px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    color: #111827;
}

.form-textarea:focus {
    background-color: #fff;
    border-color: #10b981;
}

.space-y-5 > view + view { margin-top: 20px; }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
