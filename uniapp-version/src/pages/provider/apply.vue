<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Gradient Header -->
    <view class="header-gradient pt-custom px-4 pb-8">
      <view class="flex flex-row items-center py-3">
        <view @click="handleBack" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
          <AppIcon name="chevron-left" :size="24" class="text-white"/>
        </view>
        <text class="text-xl font-bold text-white">服务商入驻</text>
      </view>
      
      <!-- Progress Indicator -->
      <view class="flex flex-row items-center mt-4 px-2">
        <view class="flex flex-col items-center flex-1">
          <view class="w-8 h-8 rounded-full flex items-center justify-center" 
                :class="currentStep >= 0 ? 'bg-white text-emerald-600' : 'bg-white/30 text-white'">
            <text class="font-bold">1</text>
          </view>
          <text class="text-xs mt-1" :class="currentStep >= 0 ? 'text-white' : 'text-white/60'">选择服务</text>
        </view>
        <view class="flex-1 h-0.5" :class="currentStep >= 1 ? 'bg-white' : 'bg-white/30'"></view>
        <view class="flex flex-col items-center flex-1">
          <view class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="currentStep >= 1 ? 'bg-white text-emerald-600' : 'bg-white/30 text-white'">
            <text class="font-bold">2</text>
          </view>
          <text class="text-xs mt-1" :class="currentStep >= 1 ? 'text-white' : 'text-white/60'">填写资料</text>
        </view>
        <view class="flex-1 h-0.5" :class="currentStep >= 2 ? 'bg-white' : 'bg-white/30'"></view>
        <view class="flex flex-col items-center flex-1">
          <view class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="currentStep >= 2 ? 'bg-white text-emerald-600' : 'bg-white/30 text-white'">
            <text class="font-bold">3</text>
          </view>
          <text class="text-xs mt-1" :class="currentStep >= 2 ? 'text-white' : 'text-white/60'">提交审核</text>
        </view>
      </view>
    </view>

    <!-- Content Area -->
    <scroll-view scroll-y class="flex-1 -mt-4">
      <view class="px-4 pb-32">
        
        <!-- Step 1: Select Category -->
        <view v-if="currentStep === 0" class="animate-slide-up">
          <view class="bg-white rounded-2xl p-5 shadow-card">
            <view class="flex flex-row items-center mb-4">
              <view class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mr-3">
                <AppIcon name="grid" :size="20" class="text-emerald-600"/>
              </view>
              <view>
                <text class="text-lg font-bold text-gray-900 block">选择服务类型</text>
                <text class="text-sm text-gray-500">请选择您想要开通的服务</text>
              </view>
            </view>
            
            <view v-if="loadingCategories" class="flex items-center justify-center py-12">
              <view class="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></view>
            </view>
            
            <view v-else class="space-y-3">
              <view 
                v-for="cat in categories" 
                :key="cat.name"
                class="flex flex-row items-center p-4 rounded-xl border-2 transition-all"
                :class="selectedCategory === cat.name 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-100 bg-gray-50 active:bg-gray-100'"
                @click="handleCategorySelect(cat.name)"
              >
                <view 
                  class="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  :class="selectedCategory === cat.name ? 'bg-emerald-500' : 'bg-white'"
                >
                  <image 
                    v-if="cat.icon && cat.icon.startsWith('http')" 
                    :src="cat.icon" 
                    class="w-7 h-7 rounded"
                  />
                  <AppIcon 
                    v-else 
                    :name="cat.icon || 'briefcase'" 
                    :size="24" 
                    :class="selectedCategory === cat.name ? 'text-white' : 'text-gray-600'"
                  />
                </view>
                <view class="flex-1">
                  <text 
                    class="text-base font-bold block"
                    :class="selectedCategory === cat.name ? 'text-emerald-700' : 'text-gray-800'"
                  >
                    {{ cat.name }}
                  </text>
                  <text class="text-xs text-gray-400">点击选择此服务类型</text>
                </view>
                <view v-if="selectedCategory === cat.name" class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <AppIcon name="check" :size="14" class="text-white"/>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Step 2+: Dynamic Form -->
        <view v-else class="animate-slide-up">
          <view class="bg-white rounded-2xl p-5 shadow-card">
            <view class="flex flex-row items-center mb-6">
              <view class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-3">
                <AppIcon name="file-text" :size="20" class="text-blue-600"/>
              </view>
              <view>
                <text class="text-lg font-bold text-gray-900 block">{{ currentStepData.title }}</text>
                <text v-if="currentStepData.description" class="text-sm text-gray-500">{{ currentStepData.description }}</text>
              </view>
            </view>

            <!-- Fields -->
            <view class="space-y-5">
              <view v-for="field in currentStepData.fields" :key="field.key" class="flex flex-col">
                <view class="mb-2 flex flex-row items-center gap-1" v-if="!['image'].includes(field.type)">
                  <text class="text-sm font-bold text-gray-700">{{ field.label }}</text>
                  <text v-if="field.required" class="text-red-500 text-sm">*</text>
                </view>
                
                <!-- Text/Number Input -->
                <input 
                  v-if="['text', 'number', 'tel', 'email'].includes(field.type)"
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :placeholder="field.placeholder || '请输入'"
                  class="w-full h-12 bg-gray-50 rounded-xl px-4 text-gray-900 border border-gray-200 focus:border-emerald-500 focus:bg-white transition-all text-sm"
                  v-model="formData[field.key]"
                />

                <!-- Textarea -->
                <textarea 
                  v-if="field.type === 'textarea'"
                  :placeholder="field.placeholder || '请输入'"
                  class="w-full h-28 bg-gray-50 rounded-xl p-4 text-gray-900 border border-gray-200 focus:border-emerald-500 focus:bg-white transition-all text-sm"
                  v-model="formData[field.key]"
                />

                <!-- Image Upload -->
                <view v-if="field.type === 'image'" class="flex flex-col gap-3">
                  <view class="flex flex-row items-center gap-1">
                    <text class="text-sm font-bold text-gray-700">{{ field.label }}</text>
                    <text v-if="field.required" class="text-red-500 text-sm">*</text>
                  </view>
                  <view class="flex flex-row flex-wrap gap-3">
                    <view 
                      v-for="(img, idx) in (formData[field.key] || [])" 
                      :key="idx" 
                      class="w-20 h-20 rounded-xl bg-gray-100 relative overflow-hidden"
                    >
                      <image :src="img" mode="aspectFill" class="w-full h-full" @click="previewImage(formData[field.key], Number(idx))" />
                      <view @click.stop="removeImage(field.key, Number(idx))" class="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                        <AppIcon name="x" :size="12" class="text-white"/>
                      </view>
                    </view>
                    <view 
                      v-if="(formData[field.key] || []).length < 9"
                      @click="chooseImage(field.key)"
                      class="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center active:bg-gray-100"
                    >
                      <AppIcon name="camera" :size="24" class="text-gray-400"/>
                      <text class="text-xs text-gray-400 mt-1">上传</text>
                    </view>
                  </view>
                </view>
                
                <!-- Select -->
                <picker 
                  v-if="field.type === 'select'" 
                  :range="field.options" 
                  range-key="label"
                  @change="(e: any) => formData[field.key] = field.options[e.detail.value].value"
                >
                  <view class="w-full h-12 bg-gray-50 rounded-xl px-4 flex flex-row items-center justify-between border border-gray-200">
                    <text :class="formData[field.key] ? 'text-gray-900' : 'text-gray-400 text-sm'">
                      {{ getSelectedLabel(field) || field.placeholder || '请选择' }}
                    </text>
                    <AppIcon name="chevron-down" :size="20" class="text-gray-400"/>
                  </view>
                </picker>
              </view>
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- Footer Button -->
    <view class="p-4 bg-white border-t border-gray-100 pb-safe">
      <button 
        @click="handleNext"
        class="w-full h-12 rounded-xl font-bold text-base flex items-center justify-center shadow-lg transition-all"
        :class="submitting ? 'bg-gray-400' : 'bg-emerald-600 active:bg-emerald-700'"
        :disabled="submitting"
        style="color: white;"
      >
        <view v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></view>
        {{ submitting ? '提交中...' : (currentStep === 0 ? '下一步' : (isLastStep ? '提交申请' : '下一步')) }}
      </button>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { categoriesApi, formTemplatesApi, providersApi } from '@/services/api';

const currentStep = ref(0); // 0 = Category Select, 1+ = Form Steps
const formStepIndex = ref(0); // Internal step index for the form wizard
const categories = ref<any[]>([]);
const loadingCategories = ref(true);
const selectedCategory = ref('');
const template = ref<any>(null);
const formData = ref<any>({});
const submitting = ref(false);

onMounted(() => {
    loadCategories();
});

const loadCategories = async () => {
    try {
        const res = await categoriesApi.getAll();
        categories.value = res.categories || [];
    } catch (e) {
        uni.showToast({ title: '加载分类失败', icon: 'none' });
    } finally {
        loadingCategories.value = false;
    }
}

const handleCategorySelect = (catName: string) => {
    selectedCategory.value = catName;
    // Auto advance? No, user clicks Next? 
    // UX: Select highlights, Next confirms.
}

const handleBack = () => {
    if (formStepIndex.value > 0) {
        formStepIndex.value--;
    } else if (currentStep.value > 0) {
        currentStep.value = 0;
        selectedCategory.value = '';
        template.value = null;
        formData.value = {};
    } else {
        uni.navigateBack();
    }
}

const loadTemplate = async () => {
    uni.showLoading({ title: '加载表单...' });
    try {
        // Fetch 'provider_reg' type template for this category
        const res = await formTemplatesApi.getPublished('provider_reg', selectedCategory.value);
        if (res.templates && res.templates.length > 0) {
            template.value = res.templates[0];
        } else {
            // Fallback: Generic Provider Application Form
            template.value = {
                id: 'fallback',
                steps: [{
                    title: '申请资料',
                    fields: [
                        { key: 'reason', label: '申请理由/经验描述', type: 'textarea', required: true, placeholder: '请描述您在这个领域的经验和资质...' },
                        { key: 'images', label: '资质证明/作品集', type: 'image', required: false }
                    ]
                }]
            };
        }
        currentStep.value = 1; // Move to form
        formStepIndex.value = 0;
    } catch (e) {
        uni.showToast({ title: '加载表单失败', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
}

const currentStepData = computed(() => {
    if (!template.value) return { title: '', description: '', fields: [] };
    return template.value.steps[formStepIndex.value];
});

const isLastStep = computed(() => {
    if (!template.value) return false;
    return formStepIndex.value === template.value.steps.length - 1;
});

const handleNext = async () => {
    if (currentStep.value === 0) {
        if (!selectedCategory.value) {
            uni.showToast({ title: '请选择服务类型', icon: 'none' });
            return;
        }
        await loadTemplate();
        return;
    }

    // Validate Form Fields
    const fields = currentStepData.value.fields;
    for(const f of fields) {
        if (f.required && !formData.value[f.key]) {
            uni.showToast({ title: `请填写${f.label}`, icon: 'none' });
            return;
        }
    }

    if (!isLastStep.value) {
        formStepIndex.value++;
    } else {
        submitApplication();
    }
}

const submitApplication = async () => {
    submitting.value = true;
    try {
        await providersApi.applyServiceType({
            category: selectedCategory.value,
            // We use 'extra_data' to store the full form data
            // We can also extract 'reason' if it exists in the form for backward compatibility
            reason: formData.value.reason || `申请加入 [${selectedCategory.value}] 服务`, 
            extra_data: formData.value
        });
        uni.showToast({ title: '申请已提交', icon: 'success' });
        setTimeout(() => {
            uni.navigateBack();
        }, 1500);
    } catch (e: any) {
        uni.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
        submitting.value = false;
    }
}

const getSelectedLabel = (field: any) => {
    const val = formData.value[field.key];
    if (!val) return '';
    return field.options.find((o: any) => o.value === val)?.label || val;
}

// Helpers
const chooseImage = (key: string) => {
    uni.chooseImage({
        count: 1,
        success: (res) => {
            const arr = formData.value[key] || [];
            // In real app, upload to server here. Mock uses temp path.
            // For H5 base64:
            // ... (Simple implementation for now)
            formData.value[key] = [...arr, res.tempFilePaths[0]];
        }
    })
}

const removeImage = (key: string, idx: number) => {
    const arr = formData.value[key];
    arr.splice(idx, 1);
}
const previewImage = (urls: string[], idx: number) => {
    uni.previewImage({ urls, current: idx });
}
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.header-gradient {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.shadow-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.space-y-3 > view + view { margin-top: 12px; }
.space-y-5 > view + view { margin-top: 20px; }
</style>
