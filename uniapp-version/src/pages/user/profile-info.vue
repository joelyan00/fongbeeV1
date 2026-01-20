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
        <view class="avatar-circle" @click="uploadAvatar">
             <image v-if="avatarUrl" :src="avatarUrl" class="avatar-image" mode="aspectFill" />
             <text v-else class="avatar-text">{{ formData.name ? formData.name.charAt(0).toUpperCase() : 'U' }}</text>
             <view class="avatar-edit-icon">
                <AppIcon name="camera" :size="16" color="#ffffff" />
             </view>
        </view>
        <text class="avatar-hint">点击更换头像</text>
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

    <!-- Cropper -->
    <AvatarCropper 
      :show="showCropper" 
      :image-src="tempAvatarSrc" 
      @confirm="onCropConfirm" 
      @cancel="onCropCancel" 
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';
import AvatarCropper from '@/components/AvatarCropper.vue';
import { getUserInfo, authApi, setUserInfo, getToken, uploadApi } from '@/services/api';

const safeAreaTop = ref(0);
const userInfo = ref<any>({});
const formData = reactive({ name: '' });
const avatarUrl = ref('');

// Cropper
const showCropper = ref(false);
const tempAvatarSrc = ref('');

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
    
    const u = getUserInfo();
    userInfo.value = u || {};
    formData.name = u?.name || '';
    avatarUrl.value = u?.avatar_url || '';
});

const goBack = () => uni.navigateBack();

const handleSave = async () => {
    if (!formData.name) return uni.showToast({ title: '姓名不能为空', icon: 'none' });
    
    uni.showLoading({ title: '保存中...' });
    try {
        const res = await authApi.updateProfile({ 
            name: formData.name,
            avatar: avatarUrl.value
        });
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

const uploadAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            tempAvatarSrc.value = res.tempFilePaths[0];
            showCropper.value = true;
        }
    });
};

const onCropConfirm = async (croppedPath: string) => {
    showCropper.value = false;
    uni.showLoading({ title: '上传中...' });
    
    try {
        const cloudUrl = await uploadApi.uploadFile(croppedPath);
        avatarUrl.value = cloudUrl;
        uni.hideLoading();
        uni.showToast({ title: '头像已更新预览', icon: 'success' });
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '上传失败', icon: 'none' });
    }
};

const onCropCancel = () => {
    showCropper.value = false;
    tempAvatarSrc.value = '';
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
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.avatar-image {
    width: 100%;
    height: 100%;
}
.avatar-edit-icon {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2px;
}
.avatar-hint {
    font-size: 12px;
    color: #6b7280;
    margin-top: 8px;
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
