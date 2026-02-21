<template>
  <!-- Category List -->
  <view v-if="!showFormPage" class="page-bg">
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">选择开通服务类型</text>
      <view class="placeholder-btn" />
    </view>

    <scroll-view scroll-y style="flex: 1; width: 100%;">
      <view class="px-5 pb-10 mt-4">
        <view v-if="loading" style="display:flex; flex-direction:column; align-items:center; padding: 80px 0;">
          <view class="spinner" />
          <text style="color:#64748b; font-size:14px; margin-top:12px;">加载类目中...</text>
        </view>

        <view v-else style="display:grid; grid-template-columns:repeat(2,1fr); gap:16px;">
          <view
            v-for="cat in filteredCategories"
            :key="cat.name"
            class="cat-card"
            @click="selectCategory(cat)"
          >
            <view
              class="cat-icon-wrap"
              :style="{ background: cat.standard_enabled ? 'rgba(52,211,153,0.12)' : 'rgba(167,139,250,0.12)' }"
            >
              <image v-if="cat.icon && cat.icon.startsWith('http')" :src="cat.icon" style="width:36px;height:36px;" />
              <AppIcon v-else :name="cat.icon || 'grid'" :size="36" :color="cat.standard_enabled ? '#34d399' : '#a78bfa'" />
            </view>
            <text style="font-size:17px; font-weight:700; color:#fff; margin-bottom:10px;">{{ cat.name }}</text>
            <view style="display:flex; flex-direction:row; flex-wrap:wrap; gap:4px; justify-content:center;">
              <view v-if="cat.standard_enabled" class="badge-std"><text style="font-size:10px; color:#34d399; font-weight:600;">标准</text></view>
              <view v-if="cat.custom_enabled" class="badge-cus"><text style="font-size:10px; color:#a78bfa; font-weight:600;">定制</text></view>
            </view>
          </view>
        </view>

        <view v-if="!loading && filteredCategories.length === 0" style="display:flex; flex-direction:column; align-items:center; padding:120px 0; opacity:0.6;">
          <AppIcon name="inbox" :size="48" color="#64748b"/>
          <text style="color:#94a3b8; margin-top:16px;">暂无可用服务类目</text>
        </view>
      </view>
    </scroll-view>
  </view>

  <!-- Registration Form Page -->
  <view v-else class="page-bg">
    <view class="header">
      <view class="back-btn" @click="closeFormPage">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">{{ selectedCat?.name }} · 开通申请</text>
      <view class="placeholder-btn" />
    </view>

    <!-- Loading template -->
    <view v-if="formLoading" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;">
      <view class="spinner" />
      <text style="color:#94a3b8; font-size:14px; margin-top:12px;">加载申请表单...</text>
    </view>

    <!-- No form fallback -->
    <view v-else-if="!registrationForm" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 32px; text-align:center;">
      <AppIcon name="clipboard" :size="56" color="#475569" />
      <text style="color:#fff; font-size:18px; font-weight:700; margin-top:20px; margin-bottom:8px;">该类别暂无专属申请表单</text>
      <text style="color:#94a3b8; font-size:14px; margin-bottom:32px;">您可以继续填写基本信息提交申请</text>
      <view class="btn-primary" style="width:100%;" @click="goToCreateService">
        <text style="color:#fff; font-weight:700; font-size:15px;">继续申请</text>
      </view>
    </view>

    <!-- Dynamic form -->
    <scroll-view v-else scroll-y style="flex:1;">
      <view style="padding: 16px 20px 60px;">

        <!-- Step progress bars -->
        <view style="display:flex; flex-direction:row; gap:6px; margin-bottom:20px;">
          <view
            v-for="(s, i) in registrationForm.steps"
            :key="i"
            style="height:5px; border-radius:3px; flex:1; transition:background 0.3s;"
            :style="{ background: i <= currentStep ? '#10b981' : 'rgba(255,255,255,0.15)' }"
          />
        </view>

        <text style="color:#fff; font-size:20px; font-weight:700; display:block; margin-bottom:4px;">
          {{ registrationForm.steps[currentStep]?.title || '申请信息' }}
        </text>
        <text v-if="registrationForm.steps[currentStep]?.description" style="color:#94a3b8; font-size:13px; display:block; margin-bottom:20px;">
          {{ registrationForm.steps[currentStep].description }}
        </text>

        <!-- Fields -->
        <view style="display:flex; flex-direction:column; gap:18px; margin-top:12px;">
          <view v-for="field in registrationForm.steps[currentStep]?.fields || []" :key="field.key">
            <text style="color:#cbd5e1; font-size:14px; font-weight:500; display:block; margin-bottom:8px;">
              {{ field.label }}<text v-if="field.required" style="color:#f87171;"> *</text>
            </text>

            <textarea
              v-if="field.type === 'textarea'"
              class="field-input"
              :placeholder="field.placeholder || ('请输入' + field.label)"
              :value="formData[field.key] || ''"
              @input="(e) => formData[field.key] = e.detail.value"
              style="min-height:80px;"
              cursor-spacing="30"
            />

            <picker
              v-else-if="field.type === 'select'"
              :range="(field.options || []).map((o) => o.label)"
              @change="(e) => handlePickerChange(field.key, field.options, e)"
            >
              <view class="field-input" style="display:flex; flex-direction:row; justify-content:space-between; align-items:center;">
                <text :style="{ color: formData[field.key] ? '#f1f5f9' : '#64748b', fontSize:'15px' }">
                  {{ getSelectLabel(field.key, field.options) || field.placeholder || '请选择' }}
                </text>
                <AppIcon name="chevron-down" :size="18" color="#64748b" />
              </view>
            </picker>

            <picker
              v-else-if="field.type === 'date'"
              mode="date"
              @change="(e) => formData[field.key] = e.detail.value"
            >
              <view class="field-input" style="display:flex; flex-direction:row; justify-content:space-between; align-items:center;">
                <text :style="{ color: formData[field.key] ? '#f1f5f9' : '#64748b', fontSize:'15px' }">
                  {{ formData[field.key] || field.placeholder || '请选择日期' }}
                </text>
                <AppIcon name="calendar" :size="18" color="#64748b" />
              </view>
            </picker>

            <input
              v-else
              class="field-input"
              :type="field.type === 'number' ? 'number' : 'text'"
              :placeholder="field.placeholder || ('请输入' + field.label)"
              :value="formData[field.key] || ''"
              @input="(e) => formData[field.key] = e.detail.value"
              cursor-spacing="30"
            />
          </view>
        </view>

        <!-- Buttons -->
        <view style="display:flex; flex-direction:row; gap:12px; margin-top:40px;">
          <view v-if="currentStep > 0" class="btn-secondary" style="flex:1;" @click="currentStep--">
            <text style="color:#cbd5e1; font-weight:700; font-size:15px;">上一步</text>
          </view>
          <view
            class="btn-primary"
            style="flex:1;"
            :style="{ opacity: submitting ? 0.6 : 1 }"
            @click="currentStep < (registrationForm.steps.length - 1) ? nextStep() : submitApplication()"
          >
            <text style="color:#fff; font-weight:700; font-size:15px;">
              {{ submitting ? '提交中...' : (currentStep < registrationForm.steps.length - 1 ? '下一步' : '提交申请') }}
            </text>
          </view>
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
    } catch {
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
    if (cat) uni.navigateTo({ url: `/pages/provider/create-service?category=${encodeURIComponent(cat.name)}&categoryId=${cat.id || ''}` });
};

const handlePickerChange = (key: string, options: any[], e: any) => {
    formData.value[key] = options[Number(e.detail.value)]?.value;
};

const getSelectLabel = (key: string, options: any[]) =>
    options.find((o: any) => o.value === formData.value[key])?.label || '';

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
.page-bg {
  min-height: 100vh;
  background: #0f172a;
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; flex-shrink: 0;
}
.back-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
}
.placeholder-btn { width: 40px; height: 40px; }
.header-title { font-size: 18px; font-weight: 700; color: #fff; }

.px-5 { padding-left: 20px; padding-right: 20px; }
.pb-10 { padding-bottom: 40px; }
.mt-4 { margin-top: 16px; }

.cat-card {
  background: rgba(30,41,59,0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px;
  padding: 22px 14px;
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
}
.cat-card:active { opacity: 0.75; }

.cat-icon-wrap {
  width: 64px; height: 64px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
  border: 1px solid rgba(255,255,255,0.08);
}

.badge-std { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); padding: 2px 6px; border-radius: 6px; }
.badge-cus { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.25); padding: 2px 6px; border-radius: 6px; }

.field-input {
  width: 100%; box-sizing: border-box;
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(255,255,255,0.13);
  border-radius: 12px;
  padding: 13px 15px;
  color: #f1f5f9;
  font-size: 15px;
}

.btn-primary {
  background: linear-gradient(135deg, #059669, #047857);
  border-radius: 14px; padding: 16px 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(5,150,105,0.35);
}
.btn-secondary {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px; padding: 16px 20px;
  display: flex; align-items: center; justify-content: center;
}

.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: #10b981;
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
