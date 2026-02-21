<template>
  <view class="min-h-screen page-container bg-dark-gradient flex flex-col">

    <!-- ===== FULL PAGE REGISTRATION FORM ===== -->
    <view v-if="showFormPage" class="form-page">
      <!-- Header -->
      <view class="header">
        <view class="back-btn" @click="closeFormPage">
          <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
        </view>
        <text class="header-title">{{ selectedCat?.name }} · 开通申请</text>
        <view class="placeholder-btn" />
      </view>

      <!-- Loading -->
      <view v-if="formLoading" class="flex flex-col items-center justify-center flex-1">
        <view class="w-10 h-10 border-4 border-t-emerald-500 rounded-full animate-spin mb-4" style="border-color: rgba(255,255,255,0.15); border-top-color: #10b981;" />
        <text class="text-slate-400 text-sm">加载申请表单中...</text>
      </view>

      <!-- No form found -->
      <view v-else-if="!registrationForm" class="flex flex-col items-center justify-center flex-1 px-8 text-center">
        <AppIcon name="clipboard" :size="56" color="#475569" />
        <text class="text-white text-lg font-bold mt-5 mb-2">该类别暂无专属申请表单</text>
        <text class="text-slate-400 text-sm mb-8">您可以继续填写基本信息提交申请</text>
        <view class="btn-primary w-full" @click="goToCreateService">
          <text class="text-white font-bold text-base">继续申请</text>
        </view>
      </view>

      <!-- Form Content -->
      <scroll-view v-else scroll-y style="flex: 1; overflow: hidden;">
        <view class="px-5 pt-4 pb-10">

          <!-- Step Progress Bar -->
          <view style="display: flex; flex-direction: row; gap: 6px; margin-bottom: 24px;">
            <view
              v-for="(step, i) in registrationForm.steps"
              :key="i"
              style="height: 6px; border-radius: 3px; flex: 1; transition: background 0.3s;"
              :style="{ background: i <= currentStep ? '#10b981' : 'rgba(255,255,255,0.15)' }"
            />
          </view>

          <!-- Step Info -->
          <text class="text-white text-xl font-bold block mb-1">
            {{ registrationForm.steps[currentStep]?.title || '申请信息' }}
          </text>
          <text v-if="registrationForm.steps[currentStep]?.description" class="text-slate-400 text-sm block mb-6">
            {{ registrationForm.steps[currentStep].description }}
          </text>

          <!-- Fields -->
          <view style="display: flex; flex-direction: column; gap: 20px; margin-top: 16px;">
            <view
              v-for="field in registrationForm.steps[currentStep]?.fields || []"
              :key="field.key"
            >
              <text class="text-slate-300 text-sm font-medium block mb-2">
                {{ field.label }}<text v-if="field.required" style="color: #f87171;"> *</text>
              </text>

              <!-- Textarea -->
              <textarea
                v-if="field.type === 'textarea'"
                class="field-input"
                :placeholder="field.placeholder || ('请输入' + field.label)"
                :value="formData[field.key] || ''"
                @input="(e: any) => formData[field.key] = e.detail.value"
                style="min-height: 90px;"
                auto-height
                cursor-spacing="20"
              />

              <!-- Select Picker -->
              <picker
                v-else-if="field.type === 'select'"
                :range="(field.options || []).map((o: any) => o.label)"
                @change="(e: any) => handlePickerChange(field.key, field.options, e)"
              >
                <view class="field-input" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                  <text :style="{ color: formData[field.key] ? '#f1f5f9' : '#64748b', fontSize: '15px' }">
                    {{ getSelectLabel(field.key, field.options) || field.placeholder || '请选择' }}
                  </text>
                  <AppIcon name="chevron-down" :size="18" color="#64748b" />
                </view>
              </picker>

              <!-- Date Picker -->
              <picker
                v-else-if="field.type === 'date'"
                mode="date"
                @change="(e: any) => formData[field.key] = e.detail.value"
              >
                <view class="field-input" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                  <text :style="{ color: formData[field.key] ? '#f1f5f9' : '#64748b', fontSize: '15px' }">
                    {{ formData[field.key] || field.placeholder || '请选择日期' }}
                  </text>
                  <AppIcon name="calendar" :size="18" color="#64748b" />
                </view>
              </picker>

              <!-- Text / Number input -->
              <input
                v-else
                class="field-input"
                :type="field.type === 'number' ? 'number' : 'text'"
                :placeholder="field.placeholder || ('请输入' + field.label)"
                :value="formData[field.key] || ''"
                @input="(e: any) => formData[field.key] = e.detail.value"
                cursor-spacing="20"
              />
            </view>
          </view>

          <!-- Navigation Buttons -->
          <view style="display: flex; flex-direction: row; gap: 12px; margin-top: 40px;">
            <view v-if="currentStep > 0" class="btn-secondary" style="flex: 1;" @click="currentStep--">
              <text style="color: #cbd5e1; font-weight: 700; font-size: 15px;">上一步</text>
            </view>
            <view
              class="btn-primary"
              style="flex: 1;"
              :style="{ opacity: submitting ? 0.6 : 1 }"
              @click="currentStep < (registrationForm.steps.length - 1) ? nextStep() : submitApplication()"
            >
              <text style="color: #fff; font-weight: 700; font-size: 15px;">
                {{ submitting ? '提交中...' : (currentStep < (registrationForm.steps.length - 1) ? '下一步' : '提交申请') }}
              </text>
            </view>
          </view>

        </view>
      </scroll-view>
    </view>

    <!-- ===== CATEGORY SELECTION PAGE ===== -->
    <template v-else>
      <!-- Header -->
      <view class="header">
        <view class="back-btn" @click="handleBack">
          <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
        </view>
        <text class="header-title">选择开通服务类型</text>
        <view class="placeholder-btn" />
      </view>

      <!-- Content -->
      <scroll-view scroll-y class="flex-1 w-full mt-4">
        <view class="px-5 pb-10">
          <!-- Loading -->
          <view v-if="loading" class="flex flex-col items-center justify-center py-20">
            <view class="w-10 h-10 border-4 border-t-emerald-500 rounded-full animate-spin mb-4" style="border-color: rgba(255,255,255,0.15); border-top-color: #10b981;" />
            <text class="text-slate-500 text-sm">加载类目中...</text>
          </view>

          <!-- Categories Grid -->
          <view v-else class="grid grid-cols-2 gap-4">
            <view
              v-for="cat in filteredCategories"
              :key="cat.name"
              class="cat-card"
              @click="selectCategory(cat)"
            >
              <view class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity" />
              <view
                class="cat-icon-wrap"
                :style="{ background: cat.standard_enabled ? 'rgba(52,211,153,0.12)' : 'rgba(167,139,250,0.12)' }"
              >
                <image v-if="cat.icon && cat.icon.startsWith('http')" :src="cat.icon" style="width: 36px; height: 36px;" />
                <AppIcon v-else :name="cat.icon || 'grid'" :size="36" :color="cat.standard_enabled ? '#34d399' : '#a78bfa'" />
              </view>
              <text class="text-lg font-bold text-white mb-3">{{ cat.name }}</text>
              <view style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: center;">
                <view v-if="cat.standard_enabled" class="badge badge-std"><text class="badge-text-std">标准</text></view>
                <view v-if="cat.custom_enabled" class="badge badge-cus"><text class="badge-text-cus">定制</text></view>
              </view>
            </view>
          </view>

          <!-- Empty -->
          <view v-if="!loading && filteredCategories.length === 0" class="flex flex-col items-center justify-center py-32 opacity-60">
            <AppIcon name="inbox" :size="48" color="#64748b"/>
            <text class="text-slate-400 font-medium mt-4">暂无可用服务类目</text>
          </view>
        </view>
      </scroll-view>
    </template>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { categoriesApi, formTemplatesApi, providersApi } from '@/services/api';

const categories = ref<any[]>([]);
const loading = ref(true);

// Full-page form state
const showFormPage = ref(false);
const formLoading = ref(false);
const registrationForm = ref<any>(null);
const selectedCat = ref<any>(null);
const currentStep = ref(0);
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

onMounted(() => { loadCategories(); });

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

const filteredCategories = computed(() =>
    categories.value.filter(c => c.standard_enabled || c.custom_enabled)
);

const handleBack = () => { uni.navigateBack(); };

const selectCategory = async (cat: any) => {
    selectedCat.value = cat;
    formData.value = {};
    currentStep.value = 0;
    registrationForm.value = null;
    showFormPage.value = true;
    formLoading.value = true;
    try {
        const res = await formTemplatesApi.getRegistrationForm(cat.name);
        registrationForm.value = res?.template || null;
    } catch {
        registrationForm.value = null;
    } finally {
        formLoading.value = false;
    }
};

const closeFormPage = () => {
    showFormPage.value = false;
    registrationForm.value = null;
    selectedCat.value = null;
};

const goToCreateService = () => {
    showFormPage.value = false;
    const cat = selectedCat.value;
    if (cat) {
        uni.navigateTo({ url: `/pages/provider/create-service?category=${encodeURIComponent(cat.name)}&categoryId=${cat.id || ''}` });
    }
};

const handlePickerChange = (key: string, options: any[], e: any) => {
    formData.value[key] = options[Number(e.detail.value)]?.value;
};

const getSelectLabel = (key: string, options: any[]) =>
    options.find(o => o.value === formData.value[key])?.label || '';

const nextStep = () => {
    const fields = registrationForm.value?.steps?.[currentStep.value]?.fields || [];
    for (const f of fields) {
        if (f.required && !formData.value[f.key]) {
            uni.showToast({ title: `请填写「${f.label}」`, icon: 'none' });
            return;
        }
    }
    currentStep.value++;
};

const submitApplication = async () => {
    const fields = registrationForm.value?.steps?.[currentStep.value]?.fields || [];
    for (const f of fields) {
        if (f.required && !formData.value[f.key]) {
            uni.showToast({ title: `请填写「${f.label}」`, icon: 'none' });
            return;
        }
    }
    submitting.value = true;
    try {
        await providersApi.applyServiceType({
            category: selectedCat.value?.name || '',
            reason: '通过申请表单提交',
            extra_data: { form_template_id: registrationForm.value?.id, form_data: { ...formData.value } }
        });
        showFormPage.value = false;
        uni.showToast({ title: '申请已提交，等待审核', icon: 'success', duration: 2500 });
        setTimeout(() => uni.navigateBack(), 2500);
    } catch (e: any) {
        uni.showToast({ title: e?.message || '提交失败，请重试', icon: 'none' });
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #0f172a;
  padding-top: env(safe-area-inset-top);
  width: 100%;
  position: relative;
}

/* Full-page form */
.form-page {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  z-index: 500;
  padding-top: env(safe-area-inset-top);
}

/* Shared header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
}
.back-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.placeholder-btn {
  width: 40px; height: 40px;
}
.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

/* Form input */
.field-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 14px 16px;
  color: #f1f5f9;
  font-size: 15px;
}

/* Category card */
.cat-card {
  position: relative;
  background: rgba(30, 41, 59, 0.5);
  padding: 24px 16px;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
}
.cat-card:active { opacity: 0.75; transform: scale(0.97); }
.cat-icon-wrap {
  width: 64px; height: 64px;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
  border: 1px solid rgba(255,255,255,0.08);
}

/* Badges */
.badge { padding: 2px 6px; border-radius: 6px; }
.badge-std { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); }
.badge-cus { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.25); }
.badge-text-std { font-size: 10px; color: #34d399; font-weight: 600; }
.badge-text-cus { font-size: 10px; color: #a78bfa; font-weight: 600; }

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #059669, #047857);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.35);
}
.btn-secondary {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex; align-items: center; justify-content: center;
}

/* Misc */
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4 { gap: 16px; }
.px-5 { padding-left: 20px; padding-right: 20px; }
.pb-10 { padding-bottom: 40px; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.text-white { color: #fff; }
.text-slate-500 { color: #64748b; }
.text-slate-400 { color: #94a3b8; }
.text-slate-300 { color: #cbd5e1; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.block { display: block; }
.w-full { width: 100%; }
.opacity-60 { opacity: 0.6; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-8 { margin-bottom: 32px; }
.mt-4 { margin-top: 16px; }
.mt-5 { margin-top: 20px; }
.py-20 { padding-top: 80px; padding-bottom: 80px; }
.py-32 { padding-top: 128px; padding-bottom: 128px; }
.px-8 { padding-left: 32px; padding-right: 32px; }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
