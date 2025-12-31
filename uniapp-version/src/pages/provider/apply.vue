<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between border-b border-gray-100 pt-custom">
      <text class="text-emerald-600 text-base" @click="handleCancel">取消</text>
      <text class="text-lg font-bold text-gray-900">服务商入驻</text>
      <view class="w-12"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="px-4 py-6">
        <!-- Subtitle -->
        <text class="text-sm text-gray-500 text-center block mb-6">请填写您的公司或个人基本资料</text>

        <!-- Form -->
        <view class="space-y-5">
          <!-- Company/Personal Name -->
          <view class="form-group">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-bold text-gray-700">公司/个人名称</text>
              <text class="text-red-500 ml-1">*</text>
            </view>
            <input 
              v-model="formData.companyName"
              class="form-input"
              placeholder="请输入名称"
            />
          </view>

          <!-- Contact Phone -->
          <view class="form-group">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-bold text-gray-700">联系电话</text>
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
          <view class="form-group">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-bold text-gray-700">电子邮箱</text>
              <text class="text-red-500 ml-1">*</text>
            </view>
            <input 
              v-model="formData.email"
              class="form-input"
              type="email"
              placeholder="请输入电子邮箱"
            />
          </view>

          <!-- Address Section -->
          <view class="form-group">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-bold text-gray-700">公司地址</text>
              <text class="text-red-500 ml-1">*</text>
            </view>
            <input 
              v-model="formData.street"
              class="form-input mb-3"
              placeholder="街道名及门牌号"
            />
            <view class="flex flex-row gap-3 mb-3">
              <input 
                v-model="formData.city"
                class="form-input flex-1"
                placeholder="城市"
              />
              <input 
                v-model="formData.province"
                class="form-input flex-1"
                placeholder="省份"
              />
            </view>
            <input 
              v-model="formData.postalCode"
              class="form-input"
              placeholder="邮政编码"
            />
          </view>

          <!-- Service Categories (Optional) -->
          <view class="form-group">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-bold text-gray-700">服务类型</text>
              <text class="text-gray-400 text-xs ml-2">(可选)</text>
            </view>
            <view v-if="loadingCategories" class="py-4 text-center">
              <text class="text-gray-400 text-sm">加载中...</text>
            </view>
            <view v-else class="flex flex-row flex-wrap gap-2">
              <view 
                v-for="cat in categories" 
                :key="cat.name"
                class="px-4 py-2 rounded-full border text-sm"
                :class="selectedCategories.includes(cat.name) 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-white border-gray-200 text-gray-600'"
                @click="toggleCategory(cat.name)"
              >
                {{ cat.name }}
              </view>
            </view>
          </view>

          <!-- Notes -->
          <view class="form-group">
            <view class="flex flex-row items-center mb-2">
              <text class="text-sm font-bold text-gray-700">备注说明</text>
              <text class="text-gray-400 text-xs ml-2">(可选)</text>
            </view>
            <textarea 
              v-model="formData.notes"
              class="form-textarea"
              placeholder="请简要描述您的服务经验或特长..."
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Footer Progress + Submit -->
    <view class="bg-white border-t border-gray-100 px-4 py-4 pb-safe">
      <!-- Progress Bar -->
      <view class="h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <view class="h-full bg-emerald-500 transition-all" :style="{ width: progressWidth }"></view>
      </view>
      
      <button 
        @click="handleSubmit"
        class="w-full h-12 rounded-xl font-bold text-base flex items-center justify-center"
        :class="submitting ? 'bg-gray-400' : 'bg-emerald-600 active:bg-emerald-700'"
        :disabled="submitting"
        style="color: white;"
      >
        <view v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></view>
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { categoriesApi, providersApi, getUserInfo } from '@/services/api';

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
    notes: ''
});

// Calculate progress based on filled fields
const progressWidth = computed(() => {
    const requiredFields = ['companyName', 'phone', 'email', 'street', 'city', 'province', 'postalCode'];
    let filled = 0;
    requiredFields.forEach(key => {
        if ((formData.value as any)[key]) filled++;
    });
    const percent = Math.round((filled / requiredFields.length) * 100);
    return `${percent}%`;
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

const handleSubmit = async () => {
    // Validation
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

    submitting.value = true;
    try {
        // Submit the provider basic info using existing apply method
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
                selected_categories: selectedCategories.value
            }
        });

        uni.showToast({ title: '基本信息已提交', icon: 'success' });
        
        // Navigate to service type selection page
        setTimeout(() => {
            uni.redirectTo({ url: '/pages/provider/select-services' });
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
