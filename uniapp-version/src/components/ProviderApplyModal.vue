<template>
  <view class="modal-container" @touchmove.stop.prevent="">
    <!-- Header -->
    <view class="header">
         <text @click="handleBack" class="back-btn">
             {{ currentStep === 1 ? '取消' : '上一步' }}
         </text>
         <text class="header-title">服务商入驻</text>
         <text class="header-spacer"></text>
    </view>

    <!-- Scrollable Content -->
    <scroll-view scroll-y class="scroll-content">
        <!-- Step Indicator -->
        <view class="step-indicator-container">
            <view class="step-indicator-row">
                <!-- Line Background -->
                <view class="step-line"></view>
                
                <!-- Moving Arrow -->
                <view 
                    class="step-arrow"
                    :style="{ left: currentStep === 1 ? '16.6%' : currentStep === 2 ? '50%' : '83.3%' }"
                >
                    <view class="arrow-diamond"></view>
                </view>
    
                <view v-for="s in [1, 2, 3]" :key="s" class="step-item">
                    <view 
                        class="step-circle"
                        :class="[
                            currentStep > s ? 'step-done' : 
                            currentStep === s ? 'step-active' : 'step-pending'
                        ]"
                        @click="s < currentStep ? currentStep = s : null"
                    >
                        <text v-if="currentStep > s" class="step-check">✓</text>
                        <text v-else class="step-num">{{ s }}</text>
                    </view>
                    <text 
                        class="step-label"
                        :class="currentStep === s ? 'step-label-active' : currentStep > s ? 'step-label-done' : ''"
                    >
                        {{ s === 1 ? '基本资料' : s === 2 ? '业务范围' : '资质上传' }}
                    </text>
                </view>
            </view>
        </view>
    
        <view class="content-area">
            <view class="card">
                <!-- Step 1: Identity (Read-only for existing provider) -->
                <view v-if="currentStep === 1" class="animate-fade-in">
                    <view class="section-header">
                        <text class="section-title">基本身份信息</text>
                        <text class="section-subtitle">请填写您的公司或个人基本资料</text>
                    </view>
    
                    <view class="form-item">
                        <text class="label">公司/个人名称 <text class="required">*</text></text>
                        <input v-model="form.company_name" class="input-box" placeholder="请输入名称" />
                    </view>
    
                    <view class="form-item">
                        <text class="label">联系电话 <text class="required">*</text></text>
                        <input v-model="form.phone" class="input-box" placeholder="请输入联系电话" type="tel" />
                    </view>
    
                    <view class="form-item">
                        <text class="label">电子邮箱 <text class="required">*</text></text>
                        <input v-model="form.email" class="input-box" placeholder="请输入电子邮箱" type="email" />
                    </view>
    
                    <view class="form-item">
                        <text class="label">公司地址 <text class="required">*</text></text>
                        <view class="address-grid">
                            <input v-model="form.street" class="address-input full" placeholder="街道名及门牌号" />
                            <view class="address-row">
                                <input v-model="form.city" class="address-input half" placeholder="城市" />
                                <input v-model="form.province" class="address-input half" placeholder="省份" />
                            </view>
                            <input v-model="form.postal_code" class="address-input full" placeholder="邮政编码" />
                        </view>
                    </view>
                    
                    <button class="next-btn" @click="nextStep">下一步</button>
                </view>
    
                <!-- Step 2: Select New Category -->
                <view v-if="currentStep === 2" class="animate-fade-in">
                    <view class="section-header">
                        <text class="section-title">选择服务类型</text>
                        <text class="section-subtitle">请选择您要申请的服务类别</text>
                    </view>
    
                    <view v-if="loadingCategories" class="loading-state">
                        <text class="loading-text">加载中...</text>
                    </view>

                    <view v-else class="category-grid">
                        <view 
                            v-for="cat in categories" 
                            :key="cat.name"
                            class="category-tag"
                            :class="{ 'active': selectedCategory === cat.name }"
                            @click="selectedCategory = cat.name"
                        >
                            <text class="category-text" :class="{ 'active-text': selectedCategory === cat.name }">
                                {{ cat.name }}
                            </text>
                        </view>
                    </view>
    
                    <button 
                        class="next-btn"
                        :class="{'disabled': !selectedCategory}"
                        :disabled="!selectedCategory"
                        @click="handleStep2Next"
                    >下一步</button>
                </view>
    
                <!-- Step 3: Qualification Materials -->
                <view v-if="currentStep === 3" class="animate-fade-in">
                    <view class="section-header">
                        <text class="section-title">资质与材料</text>
                        <text class="section-subtitle">完善行业特定的资质证明</text>
                    </view>
    
                    <view v-if="regTemplate" class="space-y-6">
                        <view class="template-info">
                            <text class="template-title">{{ selectedCategory }}行业要求</text>
                            <text class="template-desc">{{ regTemplate?.description || '请提供以下资料以完成入驻审核。' }}</text>
                        </view>
    
                        <view v-for="(step, sIdx) in regTemplate.steps" :key="sIdx">
                            <view v-for="(field, fIdx) in step.fields" :key="fIdx" class="form-item">
                                <text class="label">{{ field.label }} <text v-if="field.required" class="required">*</text></text>
                                
                                <input v-if="['text', 'number'].includes(field.type)" v-model="regData[field.key]" class="input-box" :placeholder="field.placeholder || ('请输入' + field.label)" />
                                
                                <textarea v-else-if="field.type === 'textarea'" v-model="regData[field.key]" class="textarea-box" :placeholder="field.placeholder || '请输入详细描述'" />
                                
                                <picker v-else-if="field.type === 'select'" @change="(e: any) => regData[field.key] = field.options[e.detail.value].value" :range="field.options.map((o: any) => o.label)" class="input-box picker-box">
                                    <text :class="regData[field.key] ? 'picker-selected' : 'picker-placeholder'">{{ regData[field.key] ? field.options.find((o: any) => o.value === regData[field.key])?.label : '请选择' }}</text>
                                </picker>
    
                                <view v-else-if="field.type === 'image'" class="upload-box" @click="uploadDynamicImage(field.key)">
                                    <template v-if="regData[field.key]">
                                        <AppIcon name="check-circle" :size="24" class="upload-icon-done"/>
                                        <text class="upload-done-text">已选择</text>
                                    </template>
                                    <template v-else>
                                        <AppIcon name="image" :size="24" class="upload-icon" />
                                        <text class="upload-text">点击上传{{ field.label }}</text>
                                    </template>
                                </view>
                            </view>
                        </view>
                    </view>
                    
                    <view v-else-if="loadingTemplate" class="loading-state">
                        <text class="loading-text">正在加载表单...</text>
                    </view>
    
                    <view v-else class="empty-state">
                        <AppIcon name="check-circle" :size="48" class="empty-icon"/>
                        <text class="empty-text">该行业暂无特殊资质要求，您可以直接提交申请。</text>
                    </view>
    
                    <button class="submit-btn" :disabled="submitting" @click="submitApply">
                        <text v-if="submitting">提交中...</text>
                        <text v-else>确认并提交申请</text>
                    </button>
                </view>
            </view>
        </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { categoriesApi, formTemplatesApi, providersApi } from '@/services/api';

const emit = defineEmits(['close', 'success']);

const currentStep = ref(1);
const loadingCategories = ref(true);
const loadingTemplate = ref(false);
const submitting = ref(false);
const selectedCategory = ref('');
const categories = ref<any[]>([]);

const form = reactive({
    company_name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    province: '',
    postal_code: ''
});

const regTemplate = ref<any>(null);
const regData = reactive<any>({});

const handleBack = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    } else {
        emit('close');
    }
};

const nextStep = () => {
    if (currentStep.value === 1) {
        // Validate step 1
        if (!form.company_name || !form.phone || !form.email) {
            uni.showToast({ title: '请填写必填项', icon: 'none' });
            return;
        }
    }
    currentStep.value++;
};

onMounted(async () => {
    console.log('ProviderApplyModal mounted');
    
    // 1. Load Profile to pre-fill Step 1
    try {
        const { profile } = await providersApi.getMyProfile();
        if (profile) {
            form.company_name = profile.company_name || '';
            form.phone = profile.service_phone || profile.phone || '';
            form.email = profile.email || ''; 
            
            // Parse address if available
            if (profile.company_address) {
                const parts = profile.company_address.split(',').map((p: string) => p.trim());
                if (parts.length >= 3) {
                    form.street = parts[0];
                    form.city = parts[1];
                    form.province = parts[2];
                    if (parts[3]) form.postal_code = parts[3];
                } else {
                    form.street = profile.company_address;
                }
            }
        }
    } catch (e) {
        console.error('Failed to load profile', e);
    }

    // 2. Load Categories
    try {
        const res = await categoriesApi.getAll();
        categories.value = res.categories || [];
    } catch (e) {
        console.error('Failed to load categories', e);
    } finally {
        loadingCategories.value = false;
    }
});

const handleStep2Next = async () => {
    if (!selectedCategory.value) return;
    
    currentStep.value = 3;
    loadingTemplate.value = true;
    regTemplate.value = null;
    
    Object.keys(regData).forEach(key => delete regData[key]);

    try {
        const res = await formTemplatesApi.getPublished('provider_reg', selectedCategory.value);
        if (res.templates && res.templates.length > 0) {
            regTemplate.value = res.templates[0];
            regTemplate.value.steps.forEach((step: any) => {
                step.fields.forEach((field: any) => {
                    regData[field.key] = '';
                });
            });
        }
    } catch (e) {
        // No template
    } finally {
        loadingTemplate.value = false;
    }
};

const uploadDynamicImage = (key: string) => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                regData[key] = e.target?.result;
            };
            // @ts-ignore
            reader.readAsDataURL(res.tempFiles[0]);
        }
    })
};

const submitApply = async () => {
    submitting.value = true;
    try {
        const companyAddress = [form.street, form.city, form.province, form.postal_code].filter(Boolean).join(', ');
        
        await providersApi.applyServiceType({
            category: selectedCategory.value,
            reason: JSON.stringify(regData),
            extra_data: regData
        });
        
        uni.showToast({ title: '申请提交成功', icon: 'success' });
        setTimeout(() => {
            emit('success');
            emit('close');
        }, 1500);
    } catch (e: any) {
        uni.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
/* Full Screen Modal Container */
.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background-color: #f9fafb;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Header */
.header {
    background-color: #ffffff;
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top));
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
}

.back-btn {
    color: #6b7280;
    font-size: 16px;
    min-width: 60px;
}

.header-title {
    flex: 1;
    text-align: center;
    font-weight: 700;
    font-size: 18px;
    color: #111827;
}

.header-spacer {
    min-width: 60px;
}

/* Scroll Content */
.scroll-content {
    flex: 1;
    overflow-y: auto;
}

/* Step Indicator */
.step-indicator-container {
    padding: 32px;
    background-color: #ffffff;
    margin-bottom: 16px;
    border-bottom: 1px solid #f9fafb;
}

.step-indicator-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
    width: 100%;
}

.step-line {
    position: absolute;
    left: 10%;
    right: 10%;
    height: 2px;
    background-color: #f3f4f6;
    top: 20px;
    z-index: 1;
}

.step-arrow {
    position: absolute;
    top: 8px;
    z-index: 2;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%);
}

.arrow-diamond {
    width: 24px;
    height: 24px;
    background-color: #10b981;
    transform: rotate(45deg);
    border-radius: 4px;
    border: 4px solid white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 3;
    flex: 1;
}

.step-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border-width: 2px;
    border-style: solid;
    transition: all 0.5s;
}

.step-done {
    background-color: #10b981;
    border-color: #10b981;
    color: #ffffff;
}

.step-active {
    background-color: #ffffff;
    border-color: #10b981;
    color: #059669;
}

.step-pending {
    background-color: #ffffff;
    border-color: #e5e7eb;
    color: #9ca3af;
}

.step-check {
    font-weight: 700;
    font-size: 18px;
}

.step-num {
    font-size: 16px;
}

.step-label {
    font-size: 14px;
    margin-top: 12px;
    font-weight: 700;
    white-space: nowrap;
    color: #9ca3af;
}

.step-label-active {
    color: #059669;
}

.step-label-done {
    color: #10b981;
}

/* Content Area */
.content-area {
    padding: 16px;
    padding-bottom: 40px;
}

.card {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.section-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.section-subtitle {
    font-size: 12px;
    color: #6b7280;
    margin-top: 8px;
}

/* Form Elements */
.form-item {
    margin-bottom: 20px;
}

.label {
    font-size: 14px;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 12px;
    display: block;
}

.required {
    color: #ef4444;
    margin-left: 2px;
}

.input-box {
    width: 100%;
    height: 48px;
    background-color: #f9fafb;
    border-radius: 12px;
    padding: 0 16px;
    font-size: 16px;
    border: 1px solid #e5e7eb;
    box-sizing: border-box;
}

.textarea-box {
    width: 100%;
    height: 100px;
    background-color: #f9fafb;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid #e5e7eb;
    box-sizing: border-box;
}

/* Address Grid */
.address-grid {
    display: flex;
    flex-direction: column;
}

.address-input {
    background-color: #f8fafc;
    border-radius: 12px;
    height: 52px;
    padding: 0 16px;
    font-size: 15px;
    margin-bottom: 12px;
    border: 1px solid #f1f5f9;
    box-sizing: border-box;
}

.address-input.full {
    width: 100%;
}

.address-input.half {
    flex: 1;
}

.address-row {
    display: flex;
    flex-direction: row;
    gap: 12px;
}

/* Category Grid */
.category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.category-tag {
    height: 48px;
    background-color: #ffffff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #f1f5f9;
    transition: all 0.2s;
}

.category-tag.active {
    background-color: #ecfdf5;
    border-color: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}

.category-text {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}

.category-text.active-text {
    color: #059669;
    font-weight: 800;
}

/* Template Info */
.template-info {
    background-color: #ecfdf5;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    border: 1px solid #d1fae5;
}

.template-title {
    font-size: 14px;
    font-weight: 700;
    color: #065f46;
    display: block;
    margin-bottom: 4px;
}

.template-desc {
    font-size: 12px;
    color: #059669;
}

/* Upload Box */
.upload-box {
    width: 100%;
    height: 120px;
    background-color: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.upload-icon {
    color: #9ca3af;
    margin-bottom: 8px;
}

.upload-icon-done {
    color: #059669;
    margin-bottom: 4px;
}

.upload-text {
    font-size: 14px;
    color: #9ca3af;
}

.upload-done-text {
    font-size: 14px;
    font-weight: 700;
    color: #059669;
}

/* Picker */
.picker-box {
    display: flex;
    align-items: center;
}

.picker-placeholder {
    color: #9ca3af;
}

.picker-selected {
    color: #111827;
}

/* States */
.loading-state {
    padding: 40px 0;
    display: flex;
    justify-content: center;
}

.loading-text {
    color: #9ca3af;
    font-size: 14px;
}

.empty-state {
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.empty-icon {
    color: #10b981;
    opacity: 0.2;
    margin-bottom: 16px;
}

.empty-text {
    font-size: 14px;
    color: #9ca3af;
}

/* Buttons */
.next-btn {
    margin-top: 32px;
    width: 100%;
    height: 48px;
    background-color: #059669;
    color: #ffffff;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.next-btn.disabled {
    opacity: 0.5;
}

.submit-btn {
    margin-top: 32px;
    width: 100%;
    height: 48px;
    background-color: #059669;
    color: #ffffff;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
