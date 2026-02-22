<template>
  <view class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <GlobalNavbar
      :title="catName + ' · 开通申请'"
      background-color="#1f2937"
      title-color="#ffffff"
      icon-color="#ffffff"
      :show-back="true"
      :custom-back="handleBack"
      :fixed="true"
    />

    <!-- Loading -->
    <view v-if="loading" class="flex-1 flex items-center justify-center">
      <view class="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></view>
    </view>

    <!-- No form -->
    <view v-else-if="!tpl" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <text class="text-white text-lg font-bold mb-2">暂无专属申请表单</text>
      <text class="text-gray-400 text-sm mb-6">请联系管理员配置该类别的申请表单</text>
      <view class="w-full h-12 rounded-xl bg-teal-600 flex items-center justify-center" @click="handleBack">
        <text class="text-white font-bold">返回</text>
      </view>
    </view>

    <!-- Form -->
    <scroll-view v-else scroll-y class="flex-1">
      <view class="p-4 flex flex-col gap-4">

        <!-- Step Progress -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2 flex flex-row items-center gap-2">
          <text class="text-teal-400 text-xs font-bold">步骤 {{ currentStep + 1 }} / {{ tpl.steps.length }}</text>
          <view class="flex-1 flex flex-row gap-1">
            <view
              v-for="(s, i) in tpl.steps"
              :key="i"
              class="flex-1 rounded-full"
              :class="Number(i) <= currentStep ? 'bg-teal-500' : 'bg-gray-600'"
              style="height:4px;"
            />
          </view>
        </view>

        <!-- Step Title -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">{{ tpl.steps[currentStep]?.title || '申请信息' }}</text>
        </view>

        <!-- Dynamic Fields - using SAME pattern as create-service.vue -->
        <view
          v-for="field in tpl.steps[currentStep]?.fields || []"
          :key="field.key"
          class="bg-gray-800 rounded-xl p-4"
        >
          <text class="text-white font-medium mb-2 block">
            {{ field.label }}
            <text v-if="field.required" class="text-red-400">*</text>
          </text>

          <!-- Text input - same as create-service.vue -->
          <input
            v-if="field.type === 'text' || field.type === 'number' || (!['textarea','select','date'].includes(field.type))"
            v-model="formValues[field.key]"
            :type="field.type === 'number' ? 'number' : 'text'"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            :placeholder="field.placeholder || ('请输入' + field.label)"
          />

          <!-- Textarea - same as create-service.vue -->
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model="formValues[field.key]"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            :placeholder="field.placeholder || ('请输入' + field.label)"
            style="height: 100px;"
          />

          <!-- Select via picker -->
          <picker
            v-else-if="field.type === 'select'"
            :range="(field.options || []).map((o: any) => o.label)"
            @change="(e: any) => { formValues[field.key] = (field.options || [])[Number(e.detail.value)]?.value || ''; }"
          >
            <view class="w-full bg-gray-700 rounded-lg px-3 py-3 text-sm flex flex-row items-center justify-between">
              <text :class="formValues[field.key] ? 'text-white' : 'text-gray-500'">
                {{ formValues[field.key] ? (field.options || []).find((o: any) => o.value === formValues[field.key])?.label : (field.placeholder || '请选择') }}
              </text>
              <AppIcon name="chevron-down" :size="16" color="#6b7280"/>
            </view>
          </picker>

          <!-- Date picker -->
          <picker
            v-else-if="field.type === 'date'"
            mode="date"
            @change="(e: any) => { formValues[field.key] = e.detail.value; }"
          >
            <view class="w-full bg-gray-700 rounded-lg px-3 py-3 text-sm flex flex-row items-center justify-between">
              <text :class="formValues[field.key] ? 'text-white' : 'text-gray-500'">
                {{ formValues[field.key] || field.placeholder || '请选择日期' }}
              </text>
              <AppIcon name="calendar" :size="16" color="#6b7280"/>
            </view>
          </picker>
        </view>

        <view class="h-4"></view>
      </view>
    </scroll-view>

    <!-- Footer buttons - same as create-service.vue -->
    <view v-if="tpl" class="bg-gray-800 border-t border-gray-700 px-4 py-4 pb-safe flex flex-row gap-3">
      <view
        v-if="currentStep > 0"
        @click="currentStep--"
        class="flex-1 h-12 rounded-xl border border-gray-600 flex items-center justify-center"
      >
        <text class="text-gray-300 font-medium">上一步</text>
      </view>
      <view
        @click="handleNext"
        :class="['flex-1 h-12 rounded-xl flex items-center justify-center',
          submitting ? 'bg-gray-600' : 'bg-teal-600 active:bg-teal-700']"
      >
        <text class="text-white font-bold">
          {{ submitting ? '提交中...' : (isLastStep ? '提交申请' : '下一步') }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';
import { formTemplatesApi, providersApi } from '@/services/api';

const catName = ref('');
const catId = ref('');
const loading = ref(true);
const tpl = ref<any>(null);
const currentStep = ref(0);
const submitting = ref(false);

// Use reactive object - same pattern as create-service.vue's form ref
const formValues = reactive<Record<string, string>>({});

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage.$page?.options || currentPage.options || {};
  catName.value = decodeURIComponent(options.category || '');
  catId.value = options.categoryId || '';

  try {
    const res = await formTemplatesApi.getRegistrationForm(catName.value);
    tpl.value = res?.template || null;

    // Pre-initialize all field keys in reactive object
    if (tpl.value?.steps) {
      for (const step of tpl.value.steps) {
        for (const field of step.fields || []) {
          formValues[field.key] = '';
        }
      }
    }
  } catch {
    tpl.value = null;
  } finally {
    loading.value = false;
  }
});

const isLastStep = computed(() => currentStep.value >= (tpl.value?.steps?.length ?? 1) - 1);

const validate = () => {
  for (const f of tpl.value?.steps?.[currentStep.value]?.fields || []) {
    if (f.required && !formValues[f.key]) {
      uni.showToast({ title: `请填写「${f.label}」`, icon: 'none' });
      return false;
    }
  }
  return true;
};

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
      extra_data: {
        form_template_id: tpl.value?.id,
        form_data: { ...formValues }
      }
    });
    uni.showToast({ title: '申请已提交，等待审核', icon: 'success', duration: 2500 });
    setTimeout(() => uni.navigateBack({ delta: 2 }), 2500);
  } catch (e: any) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const handleBack = () => uni.navigateBack();
</script>

<style scoped>
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
