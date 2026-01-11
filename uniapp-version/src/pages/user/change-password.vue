<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view @click="goBack" class="back-btn">
          <AppIcon name="arrow-left" :size="22" color="#ffffff" />
        </view>
        <text class="header-title">修改登录密码</text>
        <view class="header-action">
           <!-- Placeholder for balance layout -->
        </view>
      </view>
    </view>

    <!-- Content -->
    <view class="content">
      <view class="form-card">
        <view class="form-group">
          <text class="label">原密码</text>
          <view class="input-wrapper">
             <view class="input-icon">
                 <AppIcon name="lock" :size="20" color="#9ca3af" />
             </view>
             <input 
                class="input" 
                v-model="form.oldPassword" 
                password 
                placeholder="请输入当前使用的密码" 
                placeholder-class="placeholder"
             />
          </view>
        </view>

        <view class="divider"></view>

        <view class="form-group">
          <text class="label">新密码</text>
          <view class="input-wrapper">
             <view class="input-icon">
                 <AppIcon name="key" :size="20" color="#9ca3af" />
             </view>
             <input 
                class="input" 
                v-model="form.newPassword" 
                password 
                placeholder="设置新密码 (8-20位字符)" 
                placeholder-class="placeholder"
             />
          </view>
        </view>

        <view class="divider"></view>

        <view class="form-group">
          <text class="label">确认密码</text>
          <view class="input-wrapper">
             <view class="input-icon">
                 <AppIcon name="check-circle" :size="20" color="#9ca3af" />
             </view>
             <input 
                class="input" 
                v-model="form.confirmPassword" 
                password 
                placeholder="再次输入新密码" 
                placeholder-class="placeholder"
             />
          </view>
        </view>
      </view>

      <view class="hint-box">
         <AppIcon name="info" :size="16" color="#6b7280" style="margin-top: 2px;" />
         <text class="hint-text">为了您的账户安全，密码必须包含 8-20 个字符，且同时包含字母和数字。修改后需要重新登录。</text>
      </view>

      <view class="submit-btn" @click="handleSave">
        <view v-if="loading" class="spinner"></view>
        <text v-else class="btn-text">确认修改</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { authApi } from '@/services/api';

const loading = ref(false);
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

const goBack = () => uni.navigateBack();

const handleSave = async () => {
    if (!form.oldPassword || !form.newPassword) return uni.showToast({ title: '请填写完整信息', icon: 'none' });
    if (form.newPassword !== form.confirmPassword) return uni.showToast({ title: '两次密码不一致', icon: 'none' });
    if (form.newPassword.length < 8) return uni.showToast({ title: '密码长度至少8位', icon: 'none' });

    loading.value = true;
    try {
        await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
        uni.showToast({ title: '修改成功，请重新登录', icon: 'success' });
        setTimeout(() => {
            // Logout logic usually clears token
            uni.removeStorageSync('token');
            uni.reLaunch({ url: '/pages/index/index' });
        }, 1500);
    } catch (e: any) {
        uni.showToast({ title: e.message || '修改失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #111827;
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.header {
  position: relative;
  padding-bottom: 12px;
  flex-shrink: 0;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-bottom: 1px solid #374151;
  border-radius: 0 0 24px 24px;
}

.header-content {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.header-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.header-action { width: 40px; }

/* Content */
.content {
  padding: 24px 20px;
  position: relative;
  z-index: 5;
}

.form-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 20px;
  padding: 8px 20px;
  margin-bottom: 24px;
}

.form-group {
  padding: 16px 0;
}

.label {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  padding: 4px 12px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.input-icon {
  margin-right: 12px;
  opacity: 0.7;
}

.input {
  flex: 1;
  height: 40px;
  font-size: 15px;
  color: #ffffff;
}

.placeholder {
  color: #6b7280;
}

.divider {
  height: 1px;
  background: #374151;
  width: 100%;
}

.hint-box {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  padding: 0 8px;
  margin-bottom: 40px;
}

.hint-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  flex: 1;
}

.submit-btn {
  height: 52px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  margin-bottom: 20px;
}

.submit-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
