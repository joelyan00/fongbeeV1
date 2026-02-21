<template>
  <view class="min-h-screen page-container bg-dark-gradient flex flex-col">
    
    <!-- Registration Form Sheet (shows when a form is found) -->
    <view v-if="showFormSheet" class="form-sheet-overlay" @click.self="closeFormSheet">
      <view class="form-sheet">
        <!-- Sheet Header -->
        <view class="form-sheet-header">
          <view @click="closeFormSheet" class="form-sheet-close-btn">
            <AppIcon name="x" :size="20" color="#94a3b8" />
          </view>
          <text class="form-sheet-title">{{ selectedCat?.name }} · 开通申请</text>
          <view style="width: 32px;" />
        </view>

        <!-- Loading form template -->
        <view v-if="formLoading" class="flex flex-col items-center justify-center py-16">
          <view class="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
          <text class="text-slate-400 text-sm">加载申请表单中...</text>
        </view>

        <!-- No form found for category -->
        <view v-else-if="!registrationForm" class="flex flex-col items-center justify-center py-16 px-6 text-center">
          <AppIcon name="clipboard" :size="48" color="#475569" />
          <text class="text-white font-bold mt-4 mb-2">该类别暂无专属申请表单</text>
          <text class="text-slate-400 text-sm mb-6">您可以继续填写基本信息提交申请</text>
          <view class="btn-primary" @click="goToCreateService">
            <text class="text-white font-bold">继续申请</text>
          </view>
        </view>

        <!-- Dynamic Form Steps -->
        <scroll-view v-else scroll-y class="form-scroll">
          <view class="px-5 py-4">
            <!-- Step Progress -->
            <view class="flex flex-row items-center gap-2 mb-6">
              <view
                v-for="(step, i) in registrationForm.steps"
                :key="i"
                class="step-dot"
                :class="i <= currentStep ? 'step-dot-active' : 'step-dot-inactive'"
              />
            </view>

            <!-- Current Step Title -->
            <view class="mb-4">
              <text class="text-white text-lg font-bold">
                {{ registrationForm.steps[currentStep]?.title || '申请信息' }}
              </text>
              <text v-if="registrationForm.steps[currentStep]?.description" class="text-slate-400 text-sm block mt-1">
                {{ registrationForm.steps[currentStep].description }}
              </text>
            </view>

            <!-- Fields -->
            <view class="flex flex-col gap-4">
              <view
                v-for="field in registrationForm.steps[currentStep]?.fields || []"
                :key="field.key"
                class="flex flex-col gap-1.5"
              >
                <text class="text-slate-300 text-sm font-medium">
                  {{ field.label }}<text v-if="field.required" class="text-red-400"> *</text>
                </text>

                <!-- Text / Number -->
                <input
                  v-if="field.type === 'text' || field.type === 'number'"
                  class="form-input"
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :placeholder="field.placeholder || '请输入' + field.label"
                  v-model="formData[field.key]"
                />

                <!-- Textarea -->
                <textarea
                  v-else-if="field.type === 'textarea'"
                  class="form-textarea"
                  :placeholder="field.placeholder || '请输入' + field.label"
                  v-model="formData[field.key]"
                  auto-height
                />

                <!-- Select -->
                <picker
                  v-else-if="field.type === 'select'"
                  :range="field.options.map((o: any) => o.label)"
                  @change="(e: any) => handlePickerChange(field.key, field.options, e)"
                >
                  <view class="form-input flex flex-row justify-between items-center">
                    <text :class="formData[field.key] ? 'text-white' : 'text-slate-500'">
                      {{ getSelectLabel(field.key, field.options) || (field.placeholder || '请选择') }}
                    </text>
                    <AppIcon name="chevron-down" :size="16" color="#64748b" />
                  </view>
                </picker>

                <!-- Date -->
                <picker
                  v-else-if="field.type === 'date'"
                  mode="date"
                  @change="(e: any) => formData[field.key] = e.detail.value"
                >
                  <view class="form-input flex flex-row justify-between items-center">
                    <text :class="formData[field.key] ? 'text-white' : 'text-slate-500'">
                      {{ formData[field.key] || (field.placeholder || '请选择日期') }}
                    </text>
                    <AppIcon name="calendar" :size="16" color="#64748b" />
                  </view>
                </picker>

                <!-- Default text -->
                <input
                  v-else
                  class="form-input"
                  :placeholder="field.placeholder || '请输入' + field.label"
                  v-model="formData[field.key]"
                />
              </view>
            </view>

            <!-- Navigation Buttons -->
            <view class="flex flex-row gap-3 mt-8 pb-8">
              <view v-if="currentStep > 0" class="btn-secondary flex-1" @click="currentStep--">
                <text class="text-slate-300 font-bold">上一步</text>
              </view>
              <view
                class="btn-primary flex-1"
                :class="{ 'opacity-60': submitting }"
                @click="currentStep < (registrationForm.steps.length - 1) ? nextStep() : submitApplication()"
              >
                <text class="text-white font-bold">
                  {{ submitting ? '提交中...' : (currentStep < (registrationForm.steps.length - 1) ? '下一步' : '提交申请') }}
                </text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">选择开通服务类型</text>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="flex-1 w-full mt-4">
      <view class="px-5 pb-10">
        <!-- Loading -->
        <view v-if="loading" class="flex flex-col items-center justify-center py-20">
          <view class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></view>
          <text class="text-slate-500 text-sm">加载类目中...</text>
        </view>

        <!-- Categories Grid -->
        <view v-else class="grid grid-cols-2 gap-4">
          <view 
            v-for="cat in filteredCategories" 
            :key="cat.name"
            class="group relative bg-slate-800/40 p-6 border border-white/5 flex flex-col items-center text-center transition-all duration-300 active:scale-95 active:bg-slate-800/60 overflow-hidden"
            style="border-radius: 24px;"
            @click="selectCategory(cat)"
          >
            <view class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-active:opacity-100 transition-opacity"></view>
            
            <view 
              class="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 border border-white/10 shadow-lg"
              :class="cat.standard_enabled ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5' : 'bg-gradient-to-br from-violet-500/20 to-violet-500/5'"
            >
                <image 
                  v-if="cat.icon && cat.icon.startsWith('http')" 
                  :src="cat.icon" 
                  class="w-10 h-10"
                />
                <AppIcon 
                  v-else 
                  :name="cat.icon || 'grid'" 
                  :size="36" 
                  :color="cat.standard_enabled ? '#34d399' : '#a78bfa'"
                />
            </view>
            
            <text class="text-lg font-bold text-white mb-3 tracking-wide leading-tight">{{ cat.name }}</text>
            
            <view class="flex flex-row flex-wrap gap-1 justify-center w-full">
                <view 
                  v-if="cat.standard_enabled" 
                  class="flex items-center justify-center px-1 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm"
                >
                    <text class="text-emerald-400 font-medium" style="font-size: 10px;">标准</text>
                </view>
                <view 
                  v-if="cat.custom_enabled" 
                  class="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm"
                >
                    <text class="text-violet-400 font-medium" style="font-size: 10px;">定制</text>
                </view>
            </view>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="!loading && filteredCategories.length === 0" class="flex flex-col items-center justify-center py-32 opacity-60">
          <view class="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
            <AppIcon name="inbox" :size="48" color="#64748b"/>
          </view>
          <text class="text-slate-400 font-medium">暂无可用服务类目</text>
          <text class="text-slate-600 text-xs mt-2">请联系管理员开通相关服务权限</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { categoriesApi, formTemplatesApi, providersApi } from '@/services/api';

const categories = ref<any[]>([]);
const loading = ref(true);

// Form sheet state
const showFormSheet = ref(false);
const formLoading = ref(false);
const registrationForm = ref<any>(null);
const selectedCat = ref<any>(null);
const currentStep = ref(0);
const formData = ref<Record<string, any>>({});
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
        loading.value = false;
    }
};

const filteredCategories = computed(() => {
    return categories.value.filter(c => c.standard_enabled || c.custom_enabled);
});

const handleBack = () => {
    uni.navigateBack();
};

const selectCategory = async (cat: any) => {
    selectedCat.value = cat;
    formData.value = {};
    currentStep.value = 0;
    showFormSheet.value = true;
    formLoading.value = true;
    registrationForm.value = null;

    try {
        const res = await formTemplatesApi.getRegistrationForm(cat.name);
        registrationForm.value = res?.template || null;
    } catch (e) {
        // No form found, show fallback "continue" button
        registrationForm.value = null;
    } finally {
        formLoading.value = false;
    }
};

const closeFormSheet = () => {
    showFormSheet.value = false;
    registrationForm.value = null;
    selectedCat.value = null;
};

const goToCreateService = () => {
    showFormSheet.value = false;
    const cat = selectedCat.value;
    if (cat) {
        uni.navigateTo({
            url: `/pages/provider/create-service?category=${encodeURIComponent(cat.name)}&categoryId=${cat.id || ''}`
        });
    }
};

const handlePickerChange = (key: string, options: any[], e: any) => {
    const idx = Number(e.detail.value);
    formData.value[key] = options[idx]?.value;
};

const getSelectLabel = (key: string, options: any[]) => {
    const val = formData.value[key];
    return options.find(o => o.value === val)?.label || '';
};

const nextStep = () => {
    // Validate required fields in current step
    const step = registrationForm.value?.steps?.[currentStep.value];
    for (const field of (step?.fields || [])) {
        if (field.required && !formData.value[field.key]) {
            uni.showToast({ title: `请填写「${field.label}」`, icon: 'none' });
            return;
        }
    }
    currentStep.value++;
};

const submitApplication = async () => {
    // Validate last step
    const step = registrationForm.value?.steps?.[currentStep.value];
    for (const field of (step?.fields || [])) {
        if (field.required && !formData.value[field.key]) {
            uni.showToast({ title: `请填写「${field.label}」`, icon: 'none' });
            return;
        }
    }

    submitting.value = true;
    try {
        // Submit as service type application with the form data
        await providersApi.applyServiceType({
            category: selectedCat.value?.name || '',
            reason: '通过申请表单提交',
            extra_data: {
                form_template_id: registrationForm.value?.id,
                form_data: { ...formData.value }
            }
        });

        showFormSheet.value = false;
        uni.showToast({ title: '申请已提交，等待审核', icon: 'success', duration: 2500 });
        setTimeout(() => uni.navigateBack(), 2000);
    } catch (e: any) {
        uni.showToast({ title: e?.message || '提交失败，请重试', icon: 'none' });
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.page-container {
  min-height: 100vh;
  background: #0f172a;
  padding-top: env(safe-area-inset-top);
  width: 100%;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
}
.back-btn, .placeholder-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.placeholder-btn { background: transparent; }
.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

/* Form Sheet */
.form-sheet-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.form-sheet {
  background: #1e293b;
  border-radius: 24px 24px 0 0;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.form-sheet-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.form-sheet-close-btn {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.form-sheet-title {
  font-size: 17px;
  font-weight: 700;
  color: #f1f5f9;
}
.form-scroll { flex: 1; overflow: hidden; }

/* Form inputs */
.form-input {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: #f1f5f9;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
}
.form-textarea {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: #f1f5f9;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
  min-height: 80px;
}

/* Step Progress Dots */
.step-dot {
  height: 6px; border-radius: 3px; flex: 1;
  transition: background 0.3s;
}
.step-dot-active { background: #10b981; }
.step-dot-inactive { background: rgba(255,255,255,0.15); }

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #059669, #047857);
  border-radius: 14px;
  padding: 14px 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3);
}
.btn-secondary {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px 20px;
  display: flex; align-items: center; justify-content: center;
}

/* Colors */
.bg-dark-gradient { background: #0f172a; }
.text-white { color: #ffffff; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-emerald-400 { color: #34d399; }
.text-violet-400 { color: #a78bfa; }
.text-slate-300 { color: #cbd5e1; }
.text-red-400 { color: #f87171; }

/* Grid */
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4 { gap: 16px; }
.gap-3 { gap: 12px; }
.gap-2 { gap: 8px; }
.gap-1 { gap: 4px; }
.gap-1\.5 { gap: 6px; }
.gap-4 { gap: 16px; }

.rounded-3xl { border-radius: 24px; }
.rounded-md { border-radius: 6px; }
.rounded-full { border-radius: 9999px; }

.p-6 { padding: 24px; }
.px-5 { padding-left: 20px; padding-right: 20px; }
.pb-10 { padding-bottom: 40px; }

.border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
.border-white\/10 { border-color: rgba(255, 255, 255, 0.1); }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.text-center { text-align: center; }

.backdrop-blur-sm { backdrop-filter: blur(4px); }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 300ms; }
.active\:scale-95:active { transform: scale(0.98); }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.opacity-60 { opacity: 0.6; }
</style>
