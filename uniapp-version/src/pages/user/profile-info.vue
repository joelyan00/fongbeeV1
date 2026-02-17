<template>
  <view class="page-container">
    <!-- Global Navbar -->
    <GlobalNavbar
      title="个人信息"
      background-color="#ffffff"
      :show-back="true"
      :fixed="true"
      @back="goBack"
    >
      <template #right>
        <view class="header-action" @click="handleSave">
             <text class="header-action-text">保存</text>
        </view>
      </template>
    </GlobalNavbar>

    <!-- Spacer to push content below fixed navbar -->
    <view :style="{height: navBarOffset + 'px'}"></view>

    <view class="avatar-section" style="display: flex; flex-direction: column; align-items: center; padding: 28px 24px 20px;">
        <view class="avatar-circle" @click="uploadAvatar" style="display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden; width: 90px; height: 90px; border-radius: 45px; background-color: #d1fae5; box-shadow: 0 4px 12px rgba(5,150,105,0.15);">
             <image v-if="avatarUrl" :src="avatarUrl" class="avatar-image" mode="aspectFill" style="width: 90px; height: 90px;" />
             <text v-else class="avatar-text" style="font-size: 32px; font-weight: bold; color: #059669;">{{ formData.name ? formData.name.charAt(0).toUpperCase() : 'U' }}</text>
             <view class="avatar-edit-icon" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 30%; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;">
                <AppIcon name="camera" :size="14" color="#ffffff" />
             </view>
        </view>
        <text class="avatar-hint" style="font-size: 12px; color: #9ca3af; margin-top: 10px;">点击更换头像</text>
    </view>

    <view class="form-section" style="background: #ffffff; margin: 0 16px; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
         <!-- 姓名 -->
         <view class="form-item" style="padding: 16px; border-bottom: 1px solid #f3f4f6;">
             <text class="form-label" style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 6px;">姓名</text>
             <input class="form-input" v-model="formData.name" placeholder="请输入姓名" placeholder-class="placeholder-text" style="width: 100%; font-size: 16px; color: #1f2937; height: 32px;" />
         </view>
         <!-- 手机号 -->
         <view class="form-item-row" style="padding: 16px; border-bottom: 1px solid #f3f4f6; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
             <view style="flex: 1;">
                 <text style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 6px;">手机号码</text>
                 <text style="font-size: 16px; color: #1f2937;">{{ userInfo.phone || '未绑定' }}</text>
             </view>
             <text class="form-action" @click="toChangeContact('phone')" style="color: #059669; font-size: 14px; font-weight: 500; padding: 4px 8px;">修改</text>
         </view>
         <!-- 邮箱 -->
         <view class="form-item-row" style="padding: 16px; border-bottom: 1px solid #f3f4f6; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
             <view style="flex: 1;">
                 <text style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 6px;">邮箱</text>
                 <text style="font-size: 16px; color: #1f2937;">{{ displayEmail }}</text>
             </view>
             <text class="form-action" @click="toChangeContact('email')" style="color: #059669; font-size: 14px; font-weight: 500; padding: 4px 8px;">修改</text>
         </view>
         <!-- 密码 -->
         <view class="form-item-row" style="padding: 16px; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
             <view style="flex: 1;">
                 <text style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 6px;">密码</text>
                 <text style="font-size: 16px; color: #1f2937; letter-spacing: 2px;">••••••••</text>
             </view>
             <text class="form-action" @click="toChangePassword" style="color: #059669; font-size: 14px; font-weight: 500; padding: 4px 8px;">修改</text>
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
import { ref, onMounted, reactive, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import AvatarCropper from '@/components/AvatarCropper.vue';
import { getUserInfo, authApi, setUserInfo, uploadApi } from '@/services/api';

const navBarOffset = ref(88);
const userInfo = ref<any>({});
const formData = reactive({ name: '' });
const avatarUrl = ref('');

// Cropper
const showCropper = ref(false);
const tempAvatarSrc = ref('');

// 隐藏占位邮箱（手机号注册用户的占位邮箱）
const displayEmail = computed(() => {
    const email = userInfo.value?.email;
    if (!email || email.endsWith('@phone.user')) return '未绑定';
    return email;
});

onMounted(async () => {
    // 计算导航栏高度（对齐微信胶囊按钮）
    // #ifdef MP-WEIXIN
    const menuBtn = uni.getMenuButtonBoundingClientRect();
    const sysInfo = uni.getSystemInfoSync();
    const statusBarH = sysInfo.statusBarHeight || 44;
    const navBarH = (menuBtn.top - statusBarH) * 2 + menuBtn.height;
    navBarOffset.value = statusBarH + navBarH;
    // #endif
    // #ifndef MP-WEIXIN
    navBarOffset.value = 64;
    // #endif

    // 先用本地缓存快速渲染，避免白屏
    const u = getUserInfo();
    userInfo.value = u || {};
    formData.name = u?.name || '';
    avatarUrl.value = u?.avatar_url || '';

    // 再从服务器获取最新数据（确保 email 等信息是最新的）
    try {
        const res = await authApi.getMe();
        if (res?.user) {
            userInfo.value = res.user;
            setUserInfo(res.user); // 更新本地缓存
            if (!formData.name) formData.name = res.user.name || '';
            if (!avatarUrl.value) avatarUrl.value = res.user.avatar_url || '';
        }
    } catch (e) {
        // 静默失败，保持本地缓存数据显示
    }
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

.placeholder-text {
    color: #d1d5db;
}
</style>
