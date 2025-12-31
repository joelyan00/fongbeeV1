<template>
  <view class="min-h-screen bg-white flex flex-col">
    <!-- Header Removed for Cleaner Look -->

    <!-- Content -->
    <scroll-view scroll-y class="flex-1 bg-gray-50">
      <view class="p-6 pb-32">
        
        <!-- Step 1: Select Category -->
        <view v-if="currentStep === 0" class="animate-slide-up">
            <text class="text-xl font-bold text-gray-900 mb-2 block">选择服务类型</text>
            <text class="text-sm text-gray-500 mb-6 block">请选择您想要申请开通的服务类型</text>
            
            <view v-if="loadingCategories" class="flex items-center justify-center py-10">
                <text class="text-gray-400">加载中...</text>
            </view>
            
            <view v-else class="grid grid-cols-2 gap-4">
                <view 
                    v-for="cat in categories" 
                    :key="cat.name"
                    class="bg-white p-4 rounded-xl border transition-all flex flex-col items-center gap-2 active:scale-95"
                    :class="selectedCategory === cat.name ? 'border-emerald-500 shadow-emerald-100 ring-2 ring-emerald-500/20' : 'border-gray-200'"
                    @click="handleCategorySelect(cat.name)"
                >
                    <view 
                        class="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                        :class="selectedCategory === cat.name ? 'bg-emerald-100' : 'bg-gray-100'"
                    >
                         <!-- Support Image URL or Icon Name -->
                         <image 
                            v-if="cat.icon && cat.icon.startsWith('http')" 
                            :src="cat.icon" 
                            class="w-8 h-8 rounded-full"
                         />
                         <AppIcon v-else :name="cat.icon || 'grid'" :size="24" :class="selectedCategory === cat.name ? 'text-emerald-600' : 'text-gray-500'"/>
                    </view>
                    <text 
                        class="text-sm font-bold text-center"
                        :class="selectedCategory === cat.name ? 'text-emerald-700' : 'text-gray-700'"
                    >
                        {{ cat.name }}
                    </text>
                </view>
            </view>
        </view>

        <!-- Step 2+: Dynamic Form -->
        <view v-else class="animate-slide-up">
             <!-- Progress for Form Steps -->
             <view v-if="template && template.steps.length > 1" class="flex flex-row items-center justify-between mb-8 px-2">
                 <view v-for="(step, idx) in template.steps" :key="idx" class="flex flex-col items-center relative z-10 w-full">
                     <!-- Line -->
                     <view v-if="idx < template.steps.length - 1" class="absolute top-3 left-1/2 w-full h-0.5 bg-gray-200 -z-10"></view>
                     
                     <view 
                        class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors bg-white"
                        :class="formStepIndex >= idx ? 'border-emerald-500 text-emerald-600' : 'border-gray-300 text-gray-400'"
                     >
                        {{ idx + 1 }}
                     </view>
                     <text class="text-[10px] mt-1 text-gray-500">{{ step.title }}</text>
                 </view>
             </view>

             <view class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <view class="mb-6">
                    <text class="text-xl font-bold text-gray-900 block mb-1">
                        {{ currentStepData.title }}
                    </text>
                    <text v-if="currentStepData.description" class="text-sm text-gray-500 block">
                        {{ currentStepData.description }}
                    </text>
                </view>

                <!-- Fields Renderer -->
                <view class="space-y-6">
                    <view v-for="field in currentStepData.fields" :key="field.key" class="flex flex-col">
                        <view class="mb-2 flex flex-row items-center gap-1" v-if="!['image'].includes(field.type)">
                             <text class="text-sm font-bold text-gray-700">{{ field.label }}</text>
                             <text v-if="field.required" class="text-red-500">*</text>
                        </view>
                        
                        <!-- Text/Number -->
                        <input 
                            v-if="['text', 'number', 'tel', 'email'].includes(field.type)"
                            :type="field.type === 'number' ? 'number' : 'text'"
                            :placeholder="field.placeholder || '请输入'"
                            class="w-full h-12 bg-gray-50 rounded-xl px-4 text-gray-900 border border-transparent focus:bg-white focus:border-emerald-500 transition-all text-sm"
                            v-model="formData[field.key]"
                        />

                        <!-- Textarea -->
                        <textarea 
                            v-if="field.type === 'textarea'"
                            :placeholder="field.placeholder || '请输入'"
                            class="w-full h-24 bg-gray-50 rounded-xl p-3 text-gray-900 border border-transparent focus:bg-white focus:border-emerald-500 transition-all text-sm"
                            v-model="formData[field.key]"
                        />

                        <!-- Upload Image -->
                        <view v-if="field.type === 'image'" class="flex flex-col gap-3">
                             <view class="flex flex-row items-center gap-1">
                                 <text class="text-sm font-bold text-gray-700">{{ field.label }}</text>
                                  <text v-if="field.required" class="text-red-500">*</text>
                             </view>
                             <view class="grid grid-cols-3 gap-3">
                                 <view 
                                    v-for="(img, idx) in (formData[field.key] || [])" 
                                    :key="idx" 
                                    class="aspect-square rounded-xl bg-gray-100 relative overflow-hidden"
                                 >
                                     <image :src="img" mode="aspectFill" class="w-full h-full" @click="previewImage(formData[field.key], idx)" />
                                     <view @click.stop="removeImage(field.key, idx)" class="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                                         <AppIcon name="x" :size="12" class="text-white"/>
                                     </view>
                                 </view>
                                 <view 
                                    v-if="(formData[field.key] || []).length < 9"
                                    @click="chooseImage(field.key)"
                                    class="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center active:bg-gray-100"
                                 >
                                     <AppIcon name="plus" :size="24" class="text-gray-400"/>
                                     <text class="text-xs text-gray-400 mt-1">上传</text>
                                 </view>
                             </view>
                        </view>
                        
                        <!-- Select Logic (Simplified) -->
                         <picker 
                            v-if="field.type === 'select'" 
                            :range="field.options" 
                            range-key="label"
                            @change="(e) => formData[field.key] = field.options[e.detail.value].value"
                        >
                            <view class="w-full h-12 bg-gray-50 rounded-xl px-4 flex flex-row items-center justify-between">
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

    <!-- Footer -->
    <view class="p-4 bg-white border-t border-gray-100 pb-safe">
        <button 
            @click="handleNext"
            class="w-full bg-emerald-600 text-white font-bold h-12 rounded-xl flex items-center justify-center shadow-lg active:bg-emerald-700"
            :disabled="submitting"
        >
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
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
