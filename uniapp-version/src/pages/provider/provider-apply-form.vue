<template>
  <view class="page-bg">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">{{ catName }} · 开通申请</text>
      <view style="width:40px;" />
    </view>

    <!-- Loading -->
    <view v-if="loading" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <view class="spinner" />
      <text style="color:#94a3b8;font-size:14px;margin-top:12px;">加载申请表单...</text>
    </view>

    <!-- No form -->
    <view v-else-if="!template" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 32px;text-align:center;">
      <AppIcon name="clipboard" :size="56" color="#475569" />
      <text style="color:#fff;font-size:18px;font-weight:700;margin-top:20px;margin-bottom:8px;">暂无专属申请表单</text>
      <text style="color:#94a3b8;font-size:14px;margin-bottom:32px;">请联系管理员配置该类别的申请表单</text>
      <view class="btn-primary" style="width:100%;" @click="handleBack">
        <text style="color:#fff;font-weight:700;">返回</text>
      </view>
    </view>

    <!-- Form -->
    <scroll-view v-else scroll-y style="flex:1;">
      <view style="padding:16px 20px 80px;">

        <!-- Step bars -->
        <view style="display:flex;flex-direction:row;gap:6px;margin-bottom:20px;">
          <view
            v-for="(s, i) in template.steps"
            :key="i"
            style="height:5px;border-radius:3px;flex:1;"
            :style="{ background: Number(i) <= currentStep ? '#10b981' : 'rgba(255,255,255,0.15)' }"
          />
        </view>

        <text style="color:#fff;font-size:20px;font-weight:700;display:block;margin-bottom:4px;">
          {{ currentStepData.title }}
        </text>
        <text v-if="currentStepData.description" style="color:#94a3b8;font-size:13px;display:block;margin-bottom:20px;">
          {{ currentStepData.description }}
        </text>

        <!-- Each field -->
        <view style="display:flex;flex-direction:column;gap:18px;margin-top:12px;">
          <view v-for="field in currentStepData.fields || []" :key="field.key">
            <text style="color:#cbd5e1;font-size:14px;font-weight:500;display:block;margin-bottom:8px;">
              {{ field.label }}<text v-if="field.required" style="color:#f87171;"> *</text>
            </text>

            <!-- Textarea -->
            <textarea
              v-if="field.type === 'textarea'"
              class="field-input"
              :placeholder="field.placeholder || ('请输入' + field.label)"
              style="min-height:80px;"
              cursor-spacing="30"
              @input="onInput(field.key, $event)"
            />

            <!-- Select -->
            <picker
              v-else-if="field.type === 'select'"
              :range="fieldOptions(field)"
              @change="onPickerChange(field.key, field.options, $event)"
            >
              <view class="field-input" style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;">
                <text :style="{ color: formData[field.key] ? '#f1f5f9' : '#64748b', fontSize:'15px' }">
                  {{ formData[field.key] ? selectedLabel(field.key, field.options) : (field.placeholder || '请选择') }}
                </text>
                <AppIcon name="chevron-down" :size="18" color="#64748b" />
              </view>
            </picker>

            <!-- Date -->
            <picker
              v-else-if="field.type === 'date'"
              mode="date"
              @change="onDateChange(field.key, $event)"
            >
              <view class="field-input" style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;">
                <text :style="{ color: formData[field.key] ? '#f1f5f9' : '#64748b', fontSize:'15px' }">
                  {{ formData[field.key] || field.placeholder || '请选择日期' }}
                </text>
                <AppIcon name="calendar" :size="18" color="#64748b" />
              </view>
            </picker>

            <!-- Text / Number -->
            <input
              v-else
              class="field-input"
              :type="field.type === 'number' ? 'number' : 'text'"
              :placeholder="field.placeholder || ('请输入' + field.label)"
              cursor-spacing="30"
              @input="onInput(field.key, $event)"
            />
          </view>
        </view>

        <!-- Nav buttons -->
        <view style="display:flex;flex-direction:row;gap:12px;margin-top:40px;">
          <view v-if="currentStep > 0" class="btn-secondary" style="flex:1;" @click="prevStep">
            <text style="color:#cbd5e1;font-weight:700;font-size:15px;">上一步</text>
          </view>
          <view
            class="btn-primary"
            style="flex:1;"
            :style="{ opacity: submitting ? 0.6 : 1 }"
            @click="handleNext"
          >
            <text style="color:#fff;font-weight:700;font-size:15px;">
              {{ submitting ? '提交中...' : (isLastStep ? '提交申请' : '下一步') }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { formTemplatesApi, providersApi } from '@/services/api';

const catName = ref('');
const catId = ref('');
const loading = ref(true);
const template = ref<any>(null);
const currentStep = ref(0);
const submitting = ref(false);

// Plain object — no reactive wrapping issues
const formData: Record<string, string> = {};

onLoad((options: any) => {
    catName.value = decodeURIComponent(options?.category || '');
    catId.value = options?.categoryId || '';
});

onMounted(async () => {
    if (!catName.value) {
        // Fallback if onLoad runs after onMounted
        await new Promise(r => setTimeout(r, 100));
    }
    try {
        const res = await formTemplatesApi.getRegistrationForm(catName.value);
        template.value = res?.template || null;
    } catch {
        template.value = null;
    } finally {
        loading.value = false;
    }
});

const currentStepData = computed(() => template.value?.steps?.[currentStep.value] || { title: '', fields: [] });
const isLastStep = computed(() => currentStep.value >= (template.value?.steps?.length ?? 1) - 1);

const fieldOptions = (field: any) => (field.options || []).map((o: any) => o.label);
const selectedLabel = (key: string, options: any[]) => options.find((o: any) => o.value === formData[key])?.label || '';

const onInput = (key: string, e: any) => {
    formData[key] = e.detail?.value ?? '';
};
const onPickerChange = (key: string, options: any[], e: any) => {
    formData[key] = options[Number(e.detail.value)]?.value ?? '';
};
const onDateChange = (key: string, e: any) => {
    formData[key] = e.detail?.value ?? '';
};

const validate = () => {
    for (const f of currentStepData.value.fields || []) {
        if (f.required && !formData[f.key]) {
            uni.showToast({ title: `请填写「${f.label}」`, icon: 'none' });
            return false;
        }
    }
    return true;
};

const prevStep = () => { currentStep.value--; };

const handleNext = () => {
    if (!validate()) return;
    if (!isLastStep.value) { currentStep.value++; return; }
    submitApplication();
};

const submitApplication = async () => {
    submitting.value = true;
    try {
        await providersApi.applyServiceType({
            category: catName.value,
            reason: '通过申请表单提交',
            extra_data: { form_template_id: template.value?.id, form_data: { ...formData } }
        });
        uni.showToast({ title: '申请已提交，等待审核', icon: 'success', duration: 2500 });
        setTimeout(() => uni.navigateBack({ delta: 2 }), 2500);
    } catch (e: any) {
        uni.showToast({ title: e?.message || '提交失败，请重试', icon: 'none' });
    } finally {
        submitting.value = false;
    }
};

const handleBack = () => uni.navigateBack();
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
.header-title { font-size: 17px; font-weight: 700; color: #fff; }
.field-input {
  width: 100%; box-sizing: border-box;
  background: rgba(255,255,255,0.08);
  border: 1.5px solid rgba(255,255,255,0.13);
  border-radius: 12px;
  padding: 13px 15px;
  color: #f1f5f9;
  font-size: 15px;
}
.btn-primary {
  background: linear-gradient(135deg,#059669,#047857);
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
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
</style>
