<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header-gradient" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="header-icon"><AppIcon name="chevron-left" :size="24" color="#ffffff" /></view>
       <text class="header-title">{{ type === 'phone' ? '修改手机号' : '修改邮箱' }}</text>
       <view class="header-placeholder"></view>
    </view>

    <view class="form-section">
        <view class="current-info">
            <text class="info-label">当前{{ type === 'phone' ? '手机号' : '邮箱' }}</text>
            <text class="info-value">{{ currentValue || '未绑定' }}</text>
        </view>

        <view class="form-group">
            <text class="form-label">新{{ type === 'phone' ? '手机号' : '邮箱' }}</text>
            <input 
                class="form-input" 
                v-model="newValue" 
                :placeholder="type === 'phone' ? '请输入新手机号' : '请输入新邮箱'"
                :type="type === 'phone' ? 'number' : 'text'"
            />
        </view>

        <view class="form-group">
            <text class="form-label">验证码</text>
            <view class="code-input-row">
                <input class="form-input code-input" v-model="code" placeholder="请输入验证码" />
                <button class="send-code-btn" :disabled="countdown > 0" @click="sendCode">
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </button>
            </view>
        </view>

        <button class="submit-btn" @click="handleSubmit">确认修改</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { getUserInfo, authApi, setUserInfo } from '@/services/api';

const safeAreaTop = ref(0);
const type = ref('phone'); // 'phone' or 'email'
const currentValue = ref('');
const newValue = ref('');
const code = ref('');
const countdown = ref(0);
let timer: any = null;

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
    
    // Get type from URL params
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
        // For phone, we use a different endpoint or skip verification for now
        if (type.value === 'email') {
            await authApi.sendCode(newValue.value, 'register');
        }
        uni.hideLoading();
        uni.showToast({ title: '验证码已发送', icon: 'success' });
        
        // Start countdown
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
.page-container {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 40px;
}
.header-gradient {
    background: linear-gradient(180deg, #047857 0%, #059669 100%);
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
}
.header-icon {
    padding: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
}
.header-placeholder {
    width: 40px;
}
.form-section {
    padding: 16px;
}
.current-info {
    background-color: #fff;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
}
.info-label {
    font-size: 12px;
    color: #6b7280;
    display: block;
    margin-bottom: 6px;
}
.info-value {
    font-size: 16px;
    color: #1f2937;
    font-weight: 500;
}
.form-group {
    background-color: #fff;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
}
.form-label {
    font-size: 12px;
    color: #6b7280;
    display: block;
    margin-bottom: 8px;
}
.form-input {
    width: 100%;
    height: 44px;
    font-size: 16px;
    color: #1f2937;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0 12px;
    box-sizing: border-box;
}
.code-input-row {
    display: flex;
    flex-direction: row;
    gap: 12px;
}
.code-input {
    flex: 1;
}
.send-code-btn {
    min-width: 100px;
    height: 44px;
    background-color: #059669;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
}
.send-code-btn[disabled] {
    background-color: #9ca3af;
}
.submit-btn {
    width: 100%;
    height: 48px;
    background: linear-gradient(90deg, #047857 0%, #059669 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    margin-top: 24px;
}
</style>
