<template>
  <view class="page-container">
    <!-- Header aligned with Capsule Button -->
    <view
      style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;"
      :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}"
    >
      <view
        style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;"
        :style="{height: navBarHeight + 'px'}"
      >
        <view @click="goBack" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}">
          <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" />
        </view>
        <text style="font-size: 18px; font-weight: bold; color: #1f2937; position: absolute; left: 50%; transform: translateX(-50%);">
          {{ type === 'phone' ? '修改手机号' : '修改邮箱' }}
        </text>
        <view style="width: 40px;"></view>
      </view>
    </view>

    <!-- Spacer -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <!-- Content -->
    <view style="padding: 20px 16px;">

      <!-- 当前信息卡片 -->
      <view style="background: #ffffff; border-radius: 16px; padding: 16px 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
        <text style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 6px;">
          当前{{ type === 'phone' ? '手机号' : '邮箱' }}
        </text>
        <text style="font-size: 16px; color: #1f2937; font-weight: 500;">{{ displayCurrentValue }}</text>
      </view>

      <!-- 表单卡片 -->
      <view style="background: #ffffff; border-radius: 16px; padding: 8px 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">

        <!-- 新号码/邮箱 -->
        <view style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
          <text style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 8px;">
            新{{ type === 'phone' ? '手机号' : '邮箱' }}
          </text>
          <view style="display: flex; flex-direction: row; align-items: center; background: #f9fafb; border-radius: 12px; padding: 0 12px; border: 1px solid #e5e7eb; height: 44px;">
            <input
              v-model="newValue"
              :placeholder="type === 'phone' ? '请输入新手机号' : '请输入新邮箱'"
              :type="type === 'phone' ? 'number' : 'text'"
              placeholder-class="placeholder-text"
              style="flex: 1; height: 44px; font-size: 15px; color: #1f2937;"
            />
          </view>
        </view>

        <!-- 验证码 -->
        <view style="padding: 16px 0;">
          <text style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 8px;">验证码</text>
          <view style="display: flex; flex-direction: row; align-items: center; gap: 12px;">
            <view style="flex: 1; display: flex; flex-direction: row; align-items: center; background: #f9fafb; border-radius: 12px; padding: 0 12px; border: 1px solid #e5e7eb; height: 44px;">
              <input
                v-model="code"
                placeholder="请输入验证码"
                type="number"
                placeholder-class="placeholder-text"
                style="flex: 1; height: 44px; font-size: 15px; color: #1f2937;"
              />
            </view>
            <view
              @click="!isSending && countdown <= 0 && sendCode()"
              style="height: 44px; border-radius: 12px; padding: 0 16px; display: flex; align-items: center; justify-content: center;"
              :style="{background: (countdown > 0 || isSending) ? '#e5e7eb' : '#dcfce7', minWidth: '96px'}"
            >
              <text :style="{color: (countdown > 0 || isSending) ? '#9ca3af' : '#059669', fontSize: '14px', fontWeight: '600'}">
                {{ isSending ? '发送中' : countdown > 0 ? countdown + 's' : '获取验证码' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view
        @click="handleSubmit"
        style="height: 52px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.2); margin-top: 8px;"
      >
        <text style="color: #ffffff; font-size: 16px; font-weight: 700; letter-spacing: 1px;">确认修改</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { getUserInfo, authApi, setUserInfo } from '@/services/api';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const type = ref('phone'); // 'phone' or 'email'
const currentValue = ref('');
const newValue = ref('');
const code = ref('');
const countdown = ref(0);
const isSending = ref(false);
let timer: any = null;

// 隐藏占位邮箱
const displayCurrentValue = computed(() => {
    if (type.value === 'email') {
        if (!currentValue.value || currentValue.value.endsWith('@phone.user')) return '未绑定';
    }
    return currentValue.value || '未绑定';
});

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

    // Get type from URL params
    const pages = getCurrentPages();
    const currentPage: any = pages[pages.length - 1];
    const options = currentPage.options || {};
    type.value = options.type || 'phone';

    const userInfo = getUserInfo();
    currentValue.value = type.value === 'phone' ? userInfo?.phone : userInfo?.email;
});

const goBack = () => uni.navigateBack();

const sendCode = async () => {
    if (!newValue.value) {
        return uni.showToast({ title: `请输入新${type.value === 'phone' ? '手机号' : '邮箱'}`, icon: 'none' });
    }

    isSending.value = true;
    try {
        uni.showLoading({ title: '发送中...' });
        if (type.value === 'phone') {
            await authApi.sendPhoneCode(newValue.value, 'change_phone');
        } else {
            await authApi.sendCode(newValue.value, 'change_email');
        }
        uni.hideLoading();
        uni.showToast({ title: '验证码已发送', icon: 'success' });

        // Start countdown
        countdown.value = 60;
        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '发送失败', icon: 'none' });
    } finally {
        isSending.value = false;
    }
};

const handleSubmit = async () => {
    if (!newValue.value) {
        return uni.showToast({ title: `请输入新${type.value === 'phone' ? '手机号' : '邮箱'}`, icon: 'none' });
    }
    if (!code.value) {
        return uni.showToast({ title: '请输入验证码', icon: 'none' });
    }

    try {
        uni.showLoading({ title: '修改中...' });
        const res = await authApi.updateContact(type.value as any, newValue.value, code.value);
        setUserInfo(res.user);
        uni.hideLoading();
        uni.showToast({ title: '修改成功', icon: 'success' });
        setTimeout(() => goBack(), 1000);
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
.placeholder-text {
    color: #9ca3af;
}
</style>
