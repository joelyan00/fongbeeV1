<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header-gradient" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="header-icon"><AppIcon name="chevron-left" :size="24" color="#ffffff" /></view>
       <text class="header-title">修改密码</text>
       <view class="header-action" @click="handleSave">
           <text class="header-action-text">提交</text>
       </view>
    </view>

    <view class="form-section">
         <view class="form-item">
             <text class="form-label">原密码</text>
             <input class="form-input" v-model="form.oldPassword" password placeholder="请输入原密码" />
         </view>
         <view class="form-item">
             <text class="form-label">新密码</text>
             <input class="form-input" v-model="form.newPassword" password placeholder="请输入新密码" />
         </view>
         <view class="form-item form-item-last">
             <text class="form-label">确认密码</text>
             <input class="form-input" v-model="form.confirmPassword" password placeholder="请再次输入新密码" />
         </view>
    </view>
    
    <view class="hint-section">
        <text class="hint-text">密码需包含8-20个字符，且包含字母和数字。</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { authApi } from '@/services/api';

const safeAreaTop = ref(0);
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
});

const goBack = () => uni.navigateBack();

const handleSave = async () => {
    if (!form.oldPassword || !form.newPassword) return uni.showToast({ title: '请填写完整信息', icon: 'none' });
    if (form.newPassword !== form.confirmPassword) return uni.showToast({ title: '两次密码不一致', icon: 'none' });

    uni.showLoading({ title: '提交中...' });
    try {
        await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
        uni.hideLoading();
        uni.showToast({ title: '修改成功，请重新登录', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1500);
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
.header-action {
    width: 40px;
    text-align: right;
}
.header-action-text {
    color: #ffffff;
    font-weight: bold;
    font-size: 14px;
}
.form-section {
    background-color: #fff;
    margin: 16px;
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
    background-color: transparent;
}
.hint-section {
    padding-left: 16px;
    padding-right: 16px;
    margin-top: 8px;
}
.hint-text {
    font-size: 12px;
    color: #9ca3af;
}
</style>
