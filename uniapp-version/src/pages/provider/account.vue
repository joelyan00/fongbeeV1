<template>
  <view class="page-container">
    <!-- Gradient Header -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view @click="goBack" class="back-btn">
          <AppIcon name="arrow-left" :size="22" color="#ffffff" />
        </view>
        <view class="header-info">
          <text class="header-title">账户信息</text>
        </view>
        <view class="save-btn" @click="handleSave">
           <text class="save-text">保存</text>
        </view>
      </view>
    </view>

    <!-- Avatar Section -->
    <view class="avatar-section">
        <view class="avatar-circle">
             <text class="avatar-text">{{ formData.name ? formData.name.charAt(0).toUpperCase() : 'U' }}</text>
        </view>
        <text class="avatar-hint">点击头像更换 (暂不支持)</text>
    </view>

    <!-- Form Section -->
    <view class="form-container">
         <view class="form-item">
             <text class="form-label">姓名</text>
             <input class="form-input" v-model="formData.name" placeholder="请输入姓名" placeholder-class="placeholder" />
         </view>
         
         <view class="form-item" @click="toChangeContact('phone')">
             <view class="form-row-content">
                 <text class="form-label">手机号码</text>
                 <view class="form-val-row">
                    <text class="form-value">{{ userInfo.phone || '未绑定' }}</text>
                    <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
             </view>
         </view>

         <view class="form-item last-item" @click="toChangeContact('email')">
             <view class="form-row-content">
                 <text class="form-label">邮箱</text>
                 <view class="form-val-row">
                    <text class="form-value">{{ userInfo.email || '未绑定' }}</text>
                    <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
             </view>
         </view>
    </view>

    <view class="info-note">
        <AppIcon name="info" :size="14" color="#6b7280" />
        <text class="note-text">如需修改手机号或邮箱，请点击对应栏目进行验证修改。</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { getUserInfo, authApi, setUserInfo } from '@/services/api';

const userInfo = ref<any>({});
const formData = reactive({ name: '' });

onMounted(() => {
    const u = getUserInfo();
    userInfo.value = u || {};
    formData.name = u?.name || '';
});

const goBack = () => uni.navigateBack();

const handleSave = async () => {
    if (!formData.name) return uni.showToast({ title: '姓名不能为空', icon: 'none' });
    
    uni.showLoading({ title: '保存中...' });
    try {
        const res = await authApi.updateProfile({ name: formData.name });
        setUserInfo(res.user);
        userInfo.value = res.user;
        uni.hideLoading();
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1000);
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
};

const toChangeContact = (type: string) => {
    uni.navigateTo({ url: `/pages/provider/change-contact?type=${type}` });
};
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: #111827;
  padding-top: env(safe-area-inset-top);
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.header {
  position: relative;
  background: #1f2937;
  border-bottom: 1px solid #374151;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.header-content {
  position: relative;
  z-index: 10;
  padding: 12px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
  box-sizing: border-box;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-info {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.save-btn {
    padding: 6px 16px;
    background: #10b981;
    border-radius: 20px;
}

.save-text {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
}

/* Avatar */
.avatar-section {
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.2);
    border: 2px solid rgba(16, 185, 129, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
}

.avatar-text {
    font-size: 32px;
    font-weight: bold;
    color: #10b981;
}

.avatar-hint {
    font-size: 12px;
    color: #6b7280;
}

/* Form */
.form-container {
    background: #1f2937;
    margin: 0 20px;
    border-radius: 16px;
    border: 1px solid #374151;
    overflow: hidden;
}

.form-item {
    padding: 16px;
    border-bottom: 1px solid #374151;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.last-item {
    border-bottom: none;
}

.form-label {
    font-size: 13px;
    color: #9ca3af;
}

.form-input {
    font-size: 16px;
    color: #ffffff;
    background: transparent;
    border: none;
    height: 24px;
    line-height: 24px;
}

.placeholder {
    color: #4b5563;
}

.form-row-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.form-val-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}

.form-value {
    font-size: 15px;
    color: #d1d5db;
}

.info-note {
    margin: 20px 24px;
    display: flex;
    flex-direction: row;
    gap: 8px;
}

.note-text {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.4;
    flex: 1;
}
</style>
