<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-10 border-b border-gray-100" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="p-1"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="text-lg font-bold text-gray-800">个人信息</text>
       <view class="w-10 flex items-end" @click="handleSave">
           <text class="text-emerald-600 font-bold text-sm">保存</text>
       </view>
    </view>

    <view class="p-4 flex flex-col items-center mt-4">
        <view class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
             <text class="text-2xl font-bold text-emerald-600" style="line-height: 80px; text-align: center;">{{ formData.name ? formData.name.charAt(0).toUpperCase() : 'U' }}</text>
        </view>
    </view>

    <view class="bg-white mt-4">
         <view class="px-4 py-3 border-b border-gray-100">
             <text class="text-xs text-gray-500 mb-1 block">姓名</text>
             <input class="w-full text-base text-gray-800 h-8" v-model="formData.name" placeholder="请输入姓名" />
         </view>
         <view class="px-4 py-3 border-b border-gray-100 flex flex-row items-center justify-between">
             <view class="flex-1">
                 <text class="text-xs text-gray-500 mb-1 block">手机号码</text>
                 <text class="text-base text-gray-800">{{ userInfo.phone || '未绑定' }}</text>
             </view>
             <text class="text-emerald-600 text-sm font-medium" @click="toChangeContact('phone')">修改</text>
         </view>
         <view class="px-4 py-3 border-b border-gray-100 flex flex-row items-center justify-between">
             <view class="flex-1">
                 <text class="text-xs text-gray-500 mb-1 block">邮箱</text>
                 <text class="text-base text-gray-800">{{ userInfo.email || '未绑定' }}</text>
             </view>
             <text class="text-emerald-600 text-sm font-medium" @click="toChangeContact('email')">修改</text>
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
        // Update local storage
        setUserInfo(res.user);
        
        userInfo.value = res.user; // Update view
        uni.hideLoading();
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1000);
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
};

const toChangeContact = (type: string) => {
    uni.showToast({ title: '功能开发中', icon: 'none' });
};
</script>
