<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" class="text-white"/>
      </view>
      <text class="header-title">账户信息</text>
      <view class="save-btn" @click="handleSave">
        <text class="save-text">保存</text>
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

    <view class="section-title">评价奖励设置</view>
    <view class="form-container">
         <view class="form-item last-item">
             <text class="form-label">评价奖励积分</text>
             <view class="input-with-hint">
               <input 
                 class="form-input" 
                 type="number" 
                 v-model="formData.review_reward_points" 
                 placeholder="0" 
                 placeholder-class="placeholder" 
               />
               <text class="input-hint">用户评价后获得的积分奖励</text>
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
const formData = reactive({ 
    name: '',
    review_reward_points: 0
});

onMounted(async () => {
    const u = getUserInfo();
    userInfo.value = u || {};
    formData.name = u?.name || '';
    
    // Fetch latest provider profile to get points setting
    try {
        const res = await authApi.getProviderProfile();
        if (res.profile) {
            formData.review_reward_points = res.profile.review_reward_points || 0;
        }
    } catch (e) {
        console.error('Failed to fetch provider profile:', e);
    }
});

const goBack = () => uni.navigateBack();

const handleSave = async () => {
    if (!formData.name) return uni.showToast({ title: '姓名不能为空', icon: 'none' });
    
    uni.showLoading({ title: '保存中...' });
    try {
        // Update basic profile and reward points
        const res = await authApi.updateProfile({ name: formData.name });
        await authApi.updateProviderProfile({ 
            review_reward_points: Number(formData.review_reward_points) 
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
  background: #1f2937;
  border-bottom: 1px solid #374151;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
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
    margin-bottom: 20px;
}

.section-title {
    margin: 20px 24px 10px;
    font-size: 14px;
    font-weight: 600;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

.input-with-hint {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.input-hint {
    font-size: 12px;
    color: #6b7280;
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
