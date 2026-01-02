<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-10 border-b border-gray-100" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="p-1"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="text-lg font-bold text-gray-800">修改密码</text>
       <view class="w-10 flex items-end" @click="handleSave">
           <text class="text-emerald-600 font-bold text-sm">提交</text>
       </view>
    </view>

    <view class="bg-white mt-4">
         <view class="px-4 py-3 border-b border-gray-100">
             <text class="text-xs text-gray-500 mb-1 block">原密码</text>
             <input class="w-full text-base text-gray-800 h-8" v-model="form.oldPassword" password placeholder="请输入原密码" />
         </view>
         <view class="px-4 py-3 border-b border-gray-100">
             <text class="text-xs text-gray-500 mb-1 block">新密码</text>
             <input class="w-full text-base text-gray-800 h-8" v-model="form.newPassword" password placeholder="请输入新密码" />
         </view>
         <view class="px-4 py-3 border-b border-gray-100">
             <text class="text-xs text-gray-500 mb-1 block">确认密码</text>
             <input class="w-full text-base text-gray-800 h-8" v-model="form.confirmPassword" password placeholder="请再次输入新密码" />
         </view>
    </view>
    
    <view class="px-4 mt-2">
        <text class="text-xs text-gray-400">密码需包含8-20个字符，且包含字母和数字。</text>
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
