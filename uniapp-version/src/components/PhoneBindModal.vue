<template>
  <view class="modal-overlay" @click.stop="emit('close')" @touchmove.stop.prevent="">
    <view class="modal-container bg-white" @click.stop>
      <!-- Close Button -->
      <view class="close-btn" @click="emit('close')">
        <AppIcon name="x" :size="22" color="#CBD5E1" />
      </view>

      <view class="header">
        <view class="icon-box">
          <AppIcon name="phone" :size="32" color="#fff" />
        </view>
        <text class="title">验证手机号</text>
        <text class="subtitle">为了保障服务顺利进行，下单前请先绑定并验证您的手机号码。</text>
      </view>

      <view class="form">
        <view class="input-group">
          <view class="input-wrapper">
            <view class="prefix-box">
                <text class="prefix">+1</text>
                <view class="divider-v"></view>
            </view>
            <input 
              class="input-field" 
              type="number" 
              v-model="phone" 
              placeholder="请输入手机号码" 
              placeholder-class="placeholder"
              maxlength="11"
            />
          </view>
        </view>

        <view class="input-group mt-4">
          <view class="input-wrapper">
            <input 
              class="input-field" 
              type="number" 
              v-model="code" 
              placeholder="动态验证码" 
              placeholder-class="placeholder"
              maxlength="6"
            />
            <view class="code-btn" @click="handleSendCode" :class="{ 'disabled': countdown > 0 || !isValidPhone }">
              <text class="code-btn-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
            </view>
          </view>
        </view>

        <button 
          class="submit-btn" 
          :class="{ 'btn-disabled': !canSubmit || loading }"
          :style="{ opacity: !canSubmit ? 0.6 : 1 }"
          :disabled="!canSubmit || loading"
          @click="handleVerify"
        >
          <text v-if="!loading">立即验证并下单</text>
          <text v-else>处理中...</text>
        </button>
      </view>

      <view class="footer-tips">
        <text class="tips-text">验证成功后将自动继续您的订单流程</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import AppIcon from './Icons.vue';
import { authApi, setUserInfo, getUserInfo } from '../services/api';

const emit = defineEmits(['close', 'success']);

const phone = ref('');
const code = ref('');
const countdown = ref(0);
const loading = ref(false);
let timer: any = null;

const isValidPhone = computed(() => {
  return phone.value.length >= 10;
});

const canSubmit = computed(() => {
  return isValidPhone.value && code.value.length === 6;
});

const handleSendCode = async () => {
  if (countdown.value > 0 || !isValidPhone.value) return;

  try {
    uni.showLoading({ title: '正在发送' });
    await authApi.sendPhoneCode(phone.value, 'change_phone');
    uni.hideLoading();
    uni.showToast({ title: '验证码已发送', icon: 'success' });
    
    startCountdown();
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '发送失败', icon: 'none' });
  }
};

const startCountdown = () => {
  countdown.value = 60;
  timer = setInterval(() => {
    if (countdown.value <= 0) {
      clearInterval(timer);
      return;
    }
    countdown.value--;
  }, 1000);
};

const handleVerify = async () => {
  if (!canSubmit.value || loading.value) return;

  loading.value = true;
  try {
    const res = await authApi.updateContact('phone', phone.value, code.value);
    
    // Update local storage user info
    const currentUser = getUserInfo();
    if (currentUser) {
      currentUser.phone = phone.value;
      setUserInfo(currentUser);
    }

    uni.showToast({ title: '验证成功', icon: 'success' });
    emit('success', phone.value);
  } catch (error: any) {
    uni.showToast({ title: error.message || '验证失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.75);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.modal-container {
  width: 88%;
  max-width: 380px;
  background-color: #ffffff;
  border-radius: 32px;
  padding: 40px 24px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F8FAFC;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:active {
  transform: scale(0.9);
  background-color: #F1F5F9;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;
}

.icon-box {
  width: 68px;
  height: 68px;
  background: linear-gradient(135deg, #3D8E63 0%, #2D6A4F 100%);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 10px 20px rgba(61, 142, 99, 0.25);
}

.title {
  font-size: 24px;
  font-weight: 800;
  color: #1E293B;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  color: #64748B;
  text-align: center;
  line-height: 1.6;
  padding: 0 10px;
}

.form {
  margin-bottom: 28px;
}

.input-wrapper {
  background-color: #F8FAFC;
  border-radius: 18px;
  height: 58px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border: 1.5px solid #F1F5F9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper:focus-within {
  background-color: #ffffff;
  border-color: #3D8E63;
  box-shadow: 0 0 0 4px rgba(61, 142, 99, 0.1);
}

.prefix-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 16px;
}

.prefix {
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
  margin-right: 12px;
}

.divider-v {
    width: 1px;
    height: 20px;
    background-color: #E2E8F0;
}

.input-field {
  flex: 1;
  height: 100%;
  font-size: 16px;
  color: #1E293B;
  font-weight: 500;
}

.placeholder {
  color: #94A3B8;
  font-weight: 400;
}

.code-btn {
  padding-left: 16px;
  transition: opacity 0.2s;
}

.code-btn:active:not(.disabled) {
    opacity: 0.7;
}

.code-btn-text {
  font-size: 14px;
  font-weight: 700;
  color: #3D8E63;
}

.code-btn.disabled .code-btn-text {
  color: #94A3B8;
}

.submit-btn {
  width: 100%;
  height: 58px;
  background: linear-gradient(135deg, #3D8E63 0%, #2D6A4F 100%);
  border-radius: 18px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-top: 28px;
  box-shadow: 0 12px 24px rgba(61, 142, 99, 0.2);
  border: none;
  transition: all 0.2s;
}

.submit-btn:active:not(.btn-disabled) {
  transform: translateY(1px);
  box-shadow: 0 6px 12px rgba(61, 142, 99, 0.2);
}

.btn-disabled {
  background: #E2E8F0 !important;
  color: #94A3B8 !important;
  box-shadow: none !important;
}

.footer-tips {
  text-align: center;
}

.tips-text {
  font-size: 12px;
  color: #94A3B8;
  font-weight: 500;
}

.mt-4 {
  margin-top: 16px;
}
</style>
