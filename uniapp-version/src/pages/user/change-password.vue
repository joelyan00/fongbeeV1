<template>
  <view class="page-container" style="min-height: 100vh; background: #f9fafb;">
    <!-- Header aligned with Capsule Button -->
    <view class="header-light" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
       <view class="header-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" :style="{height: navBarHeight + 'px'}">
         <view @click="goBack" class="header-back" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title" style="font-size: 18px; font-weight: bold; color: #1f2937; position: absolute; left: 50%; transform: translateX(-50%);">修改登录密码</text>
         <view class="header-placeholder" style="width: 40px;"></view>
       </view>
    </view>
    
    <!-- Spacer to push content below fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <!-- Content -->
    <view class="content" style="padding: 24px 20px; position: relative; z-index: 5;">
      <view class="form-card" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 8px 20px; margin-bottom: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <view class="form-group" style="padding: 16px 0;">
          <text class="label" style="font-size: 13px; color: #6b7280; margin-bottom: 8px; display: block;">原密码</text>
          <view class="input-wrapper" style="display: flex !important; flex-direction: row !important; align-items: center !important; background: #f9fafb; border-radius: 12px; padding: 4px 12px; border: 1px solid #e5e7eb;">
             <view class="input-icon" style="margin-right: 12px; opacity: 0.7;">
                 <AppIcon name="lock" :size="20" color="#9ca3af" />
             </view>
             <input 
                class="input" 
                v-model="form.oldPassword" 
                password 
                placeholder="请输入当前使用的密码" 
                placeholder-class="placeholder"
                style="flex: 1; height: 40px; font-size: 15px; color: #1f2937;"
             />
          </view>
        </view>

        <view class="divider" style="height: 1px; background: #f3f4f6; width: 100%;"></view>

        <view class="form-group" style="padding: 16px 0;">
          <text class="label" style="font-size: 13px; color: #6b7280; margin-bottom: 8px; display: block;">新密码</text>
          <view class="input-wrapper" style="display: flex !important; flex-direction: row !important; align-items: center !important; background: #f9fafb; border-radius: 12px; padding: 4px 12px; border: 1px solid #e5e7eb;">
             <view class="input-icon" style="margin-right: 12px; opacity: 0.7;">
                 <AppIcon name="key" :size="20" color="#9ca3af" />
             </view>
             <input 
                class="input" 
                v-model="form.newPassword" 
                password 
                placeholder="设置新密码 (8-20位字符)" 
                placeholder-class="placeholder"
                style="flex: 1; height: 40px; font-size: 15px; color: #1f2937;"
             />
          </view>
        </view>

        <view class="divider" style="height: 1px; background: #f3f4f6; width: 100%;"></view>

        <view class="form-group" style="padding: 16px 0;">
          <text class="label" style="font-size: 13px; color: #6b7280; margin-bottom: 8px; display: block;">确认密码</text>
          <view class="input-wrapper" style="display: flex !important; flex-direction: row !important; align-items: center !important; background: #f9fafb; border-radius: 12px; padding: 4px 12px; border: 1px solid #e5e7eb;">
             <view class="input-icon" style="margin-right: 12px; opacity: 0.7;">
                 <AppIcon name="check-circle" :size="20" color="#9ca3af" />
             </view>
             <input 
                class="input" 
                v-model="form.confirmPassword" 
                password 
                placeholder="再次输入新密码" 
                placeholder-class="placeholder"
                style="flex: 1; height: 40px; font-size: 15px; color: #1f2937;"
             />
          </view>
        </view>
      </view>

      <view class="hint-box" style="display: flex !important; flex-direction: row !important; align-items: flex-start !important; gap: 8px; padding: 0 8px; margin-bottom: 40px;">
         <AppIcon name="info" :size="16" color="#6b7280" style="margin-top: 2px;" />
         <text class="hint-text" style="font-size: 13px; color: #6b7280; line-height: 1.5; flex: 1;">为了您的账户安全，密码必须包含 8-20 个字符，且同时包含字母和数字。修改后需要重新登录。</text>
      </view>

      <view class="submit-btn" @click="handleSave" style="height: 52px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); margin-bottom: 20px;">
        <view v-if="loading" class="spinner"></view>
        <text v-else class="btn-text" style="color: #ffffff; font-size: 16px; font-weight: 700; letter-spacing: 1px;">确认修改</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { authApi } from '@/services/api';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);
const loading = ref(false);
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

onMounted(() => {
    // #ifdef MP-WEIXIN
    const menuBtn = uni.getMenuButtonBoundingClientRect();
    const sysInfo = uni.getSystemInfoSync();
    statusBarHeight.value = sysInfo.statusBarHeight || 44;
    navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
    capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
    // #endif
    // #ifndef MP-WEIXIN
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
    navBarHeight.value = 44;
    capsuleWidth.value = 0;
    // #endif
});

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
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.header-light {
    background: #ffffff;
    padding-left: 16px;
    padding-right: 16px;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #f3f4f6;
}
.header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}
.header-back {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 6px;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    line-height: 56px;
}
.header-placeholder {
    width: 40px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
}

/* Content */
.content {
  padding: 24px 20px;
  position: relative;
  z-index: 5;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 8px 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.form-group {
  padding: 16px 0;
}

.label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #f9fafb;
  border-radius: 12px;
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #10b981;
  background: #ffffff;
}

.input-icon {
  margin-right: 12px;
  opacity: 0.7;
}

.input {
  flex: 1;
  height: 40px;
  font-size: 15px;
  color: #1f2937;
}

.placeholder {
  color: #9ca3af;
}

.divider {
  height: 1px;
  background: #f3f4f6;
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
