<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">{{ type === 'phone' ? '修改手机号' : '修改邮箱' }}</text>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Form Section -->
    <view class="form-container">
        <!-- Current Value -->
        <view class="form-group">
            <text class="group-label">当前{{ type === 'phone' ? '手机号' : '邮箱' }}</text>
            <view class="info-box">
                 <text class="info-text">{{ currentValue || '未绑定' }}</text>
            </view>
        </view>

        <!-- New Value -->
        <view class="form-group">
            <text class="group-label">新{{ type === 'phone' ? '手机号' : '邮箱' }}</text>
            <input 
                class="form-input" 
                v-model="newValue" 
                :placeholder="type === 'phone' ? '请输入新手机号' : '请输入新邮箱'"
                :type="type === 'phone' ? 'number' : 'text'"
                placeholder-class="placeholder"
            />
        </view>

        <!-- Verification Code -->
        <view class="form-group">
            <text class="group-label">验证码</text>
            <view class="code-row">
                <input 
                  class="form-input code-input" 
                  v-model="code" 
                  placeholder="请输入验证码" 
                  placeholder-class="placeholder"
                  type="number"
                />
                <button class="code-btn" :class="{ 'btn-disabled': countdown > 0 }" :disabled="countdown > 0" @click="sendCode">
                    <text class="code-btn-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
                </button>
            </view>
        </view>

        <!-- Submit Button -->
        <view class="submit-section">
            <button class="submit-btn" @click="handleSubmit">
                <text class="submit-text">确认修改</text>
            </button>
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { getUserInfo, authApi, setUserInfo } from '@/services/api';

const type = ref('phone'); // 'phone' or 'email'
const currentValue = ref('');
const newValue = ref('');
const code = ref('');
const countdown = ref(0);
let timer: any = null;

onMounted(() => {
    // Get type from params
    const pages = getCurrentPages();
    const currentPage: any = pages[pages.length - 1];
    const options = currentPage.options || {};
    type.value = options.type || 'phone';
    
    const userInfo = getUserInfo();
    currentValue.value = type.value === 'phone' ? userInfo?.phone : userInfo?.email;
});

const goBack = () => uni.navigateBack();

const sendCode = async () => {
    if (!newValue.value) {
        return uni.showToast({ title: `请输入新${type.value === 'phone' ? '手机号' : '邮箱'}`, icon: 'none' });
    }
    
    try {
        uni.showLoading({ title: '发送中...' });
        if (type.value === 'email') {
            await authApi.sendCode(newValue.value, 'register');
        } else {
             // Mock sending code for phone for now as per original logic
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        uni.hideLoading();
        uni.showToast({ title: '验证码已发送', icon: 'success' });
        
        countdown.value = 60;
        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '发送失败', icon: 'none' });
    }
};

const handleSubmit = async () => {
    if (!newValue.value) {
        return uni.showToast({ title: `请输入新${type.value === 'phone' ? '手机号' : '邮箱'}`, icon: 'none' });
    }
    if (!code.value) {
        return uni.showToast({ title: '请输入验证码', icon: 'none' });
    }
    
    try {
        uni.showLoading({ title: '修改中...' });
        const payload = type.value === 'phone' 
            ? { phone: newValue.value, code: code.value }
            : { email: newValue.value, code: code.value };
        
        const res = await authApi.updateProfile(payload);
        setUserInfo(res.user);
        uni.hideLoading();
        uni.showToast({ title: '修改成功', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1000);
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '修改失败', icon: 'none' });
    }
};
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
}

.header-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

/* Form */
.form-container {
    padding: 24px 20px;
}

.form-group {
    margin-bottom: 24px;
}

.group-label {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 8px;
    display: block;
    font-weight: 500;
}

.info-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 14px 16px;
}

.info-text {
    font-size: 16px;
    color: #d1d5db;
    font-weight: 500;
}

.form-input {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 16px;
    color: #ffffff;
    height: 48px;
    box-sizing: border-box;
}

.placeholder {
    color: #4b5563;
}

.code-row {
    display: flex;
    flex-direction: row;
    gap: 12px;
}

.code-input {
    flex: 1;
}

.code-btn {
    width: 120px;
    height: 48px;
    background: #10b981;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    padding: 0;
}

.btn-disabled {
    background: #374151;
    opacity: 0.8;
}

.code-btn-text {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
}

.submit-section {
    margin-top: 40px;
}

.submit-btn {
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.submit-text {
    font-size: 16px;
    color: #ffffff;
    font-weight: 700;
}
</style>
