<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header-light pt-safe">
       <view class="header-row">
         <view @click="goBack" class="header-back"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title">个人信息</text>
         <view class="header-action" @click="handleSave">
             <text class="header-action-text">保存</text>
         </view>
       </view>
    </view>

    <view class="avatar-section">
        <view class="avatar-circle">
             <text class="avatar-text">{{ formData.name ? formData.name.charAt(0).toUpperCase() : 'U' }}</text>
        </view>
    </view>

    <view class="form-section">
         <view class="form-item">
             <text class="form-label">姓名</text>
             <input class="form-input" v-model="formData.name" placeholder="请输入姓名" />
         </view>
         <view class="form-item form-item-row">
             <view class="form-content">
                 <text class="form-label">手机号码</text>
                 <text class="form-value">{{ userInfo.phone || '未绑定' }}</text>
             </view>
             <text class="form-action" @click="toChangeContact('phone')">修改</text>
         </view>
         <view class="form-item form-item-row">
             <view class="form-content">
                 <text class="form-label">邮箱</text>
                 <text class="form-value">{{ userInfo.email || '未绑定' }}</text>
             </view>
             <text class="form-action" @click="toChangeContact('email')">修改</text>
         </view>
         <view class="form-item form-item-row form-item-last">
             <view class="form-content">
                 <text class="form-label">密码</text>
                 <text class="form-value">••••••••</text>
             </view>
             <text class="form-action" @click="toChangePassword">修改</text>
         </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { getUserInfo, authApi, setUserInfo, getToken } from '@/services/api';

const safeAreaTop = ref(0);
const userInfo = ref<any>({});
const formData = reactive({ name: '' });

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
    
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
    uni.navigateTo({ url: `/pages/user/change-contact?type=${type}` });
};

const toChangePassword = () => {
    uni.navigateTo({ url: '/pages/user/change-password' });
};
</script>

<style scoped>
.page-container {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 40px;
}
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
.header-action {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.header-action-text {
    color: #059669;
    font-weight: bold;
    font-size: 14px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
}
.avatar-section {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #d1fae5;
    display: flex;
    align-items: center;
    justify-content: center;
}
.avatar-text {
    font-size: 28px;
    font-weight: bold;
    color: #059669;
}
.form-section {
    background-color: #fff;
    margin: 0 16px;
    border-radius: 12px;
    overflow: hidden;
}
.form-item {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
}
.form-item-last {
    border-bottom: none;
}
.form-item-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}
.form-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 6px;
    display: block;
}
.form-input {
    width: 100%;
    font-size: 16px;
    color: #1f2937;
    height: 32px;
    border: none;
    outline: none;
}
.form-content {
    flex: 1;
}
.form-value {
    font-size: 16px;
    color: #1f2937;
}
.form-action {
    color: #059669;
    font-size: 14px;
    font-weight: 500;
}
</style>
