<template>
  <view class="modal-overlay" @click.stop="emit('close')" @touchmove.stop.prevent="">
    <view class="modal-container bg-white" @click.stop>
      <view class="close-btn" @click="emit('close')">
        <AppIcon name="x" :size="20" color="#999" />
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
            <text class="prefix">+1</text>
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
  return phone.value.length >= 10; // Simple validation for now
});

const canSubmit = computed(() => {
  return isValidPhone.value && code.value.length === 6;
});

const handleSendCode = async () => {
  if (countdown.value > 0 || !isValidPhone.value) return;

  try {
    uni.showLoading({ title: '正在发送' });
    // Use 'change_phone' or similar type that fits the backend verification logic
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
    
    // Update local storage user info with the new phone
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
  background-color: rgba(0,0,0,0.6);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 90%;
  max-width: 400px;
  border-radius: 24px;
  padding: 32px 24px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 4px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.icon-box {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
}

.form {
  margin-bottom: 24px;
}

.input-wrapper {
  background-color: #f3f4f6;
  border-radius: 14px;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  background-color: #fff;
  border-color: #10b981;
}

.prefix {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-right: 12px;
}

.input-field {
  flex: 1;
  height: 100%;
  font-size: 16px;
  color: #111827;
}

.placeholder {
  color: #9ca3af;
}

.code-btn {
  padding: 4px 12px;
  border-left: 1px solid #e5e7eb;
}

.code-btn-text {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.code-btn.disabled .code-btn-text {
  color: #9ca3af;
}

.submit-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 14px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  box-shadow: 0 8px 16px rgba(5, 150, 105, 0.15);
}

.btn-disabled {
  opacity: 0.6;
}

.footer-tips {
  text-align: center;
}

.tips-text {
  font-size: 12px;
  color: #9ca3af;
}

.mt-4 {
  margin-top: 16px;
}
</style>
