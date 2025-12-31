<template>
  <view class="container">
    <view class="header">
      <text class="title">注册账号</text>
    </view>

    <!-- Sales Invite Banner -->
    <view v-if="isSalesInvite" class="invite-banner">
      <view class="checkbox-wrapper">
         <text style="color:#059669; font-weight:bold;">✔</text>
      </view>
      <text class="invite-text">注册成为销售合伙人</text>
    </view>

    <!-- Provider Invite Banner -->
    <view v-if="targetRole === 'provider'" class="invite-banner">
      <view class="checkbox-wrapper">
         <text style="color:#059669; font-weight:bold;">✔</text>
      </view>
      <text class="invite-text">注册成为服务商</text>
    </view>

    <view class="form-group">
      <text class="label">邮箱</text>
      <input class="input" v-model="form.email" placeholder="请输入邮箱" />
    </view>

    <view class="form-group" v-if="!isInvitedEmailMatch">
      <text class="label">验证码</text>
      <view class="code-wrapper">
        <input class="input code-input" v-model="form.code" placeholder="输入验证码" />
        <button class="code-btn" :disabled="timer > 0" @click="sendCode">
          {{ timer > 0 ? `${timer}s` : '获取验证码' }}
        </button>
      </view>
    </view>
    
    <!-- Name field removed as requested -->

    <view class="form-group">
      <text class="label">密码</text>
      <view class="password-wrapper">
        <input class="input password-input" :password="!showPassword" v-model="form.password" placeholder="设置密码" autocomplete="new-password" />
        <view class="eye-icon" @click="showPassword = !showPassword">
          <text>{{ showPassword ? '👁️' : '🙈' }}</text>
        </view>
      </view>
    </view>

    <button class="submit-btn" :loading="loading" @click="handleRegister">注册</button>

    <view style="margin-top: 20px; text-align: center;">
      <text style="color: #666; font-size: 14px;">已有账号？</text>
      <text style="color: #10b981; font-weight: bold; font-size: 14px; margin-left: 5px;" @click="goToLogin">立即登录</text>
    </view>

    <!-- Social Login -->
    <view class="social-login-container">
        <view class="divider">
            <view class="line"></view>
            <text class="divider-text">快捷登录</text>
            <view class="line"></view>
        </view>
        
        <view class="social-buttons">
            <view class="social-btn" @click="handleGoogleLogin">
                <image src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" class="social-icon" />
                <text>Google</text>
            </view>
            <view class="social-btn" @click="handleWeChatLogin">
                <!-- Using a simple SVG via inline image or text for now, or a known CDN icon. Let's use image for better compatibility -->
                 <image src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/WeChat_Icon_2016.svg/100px-WeChat_Icon_2016.svg.png" class="social-icon" />
                <text>微信</text>
            </view>
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { authApi } from '@/services/api'

const form = reactive({
  email: '',
  code: '',
  name: '',
  password: '',
  inviteCode: ''
})

const isSalesInvite = ref(false)
const targetRole = ref('user') // Default to user
const loading = ref(false)
const timer = ref(0)
const invitedEmail = ref('')
const showPassword = ref(false)

const isInvitedEmailMatch = computed(() => {
    return invitedEmail.value && form.email === invitedEmail.value
})

onLoad((options: any) => {
  if (options.role_invite === 'sales') {
    isSalesInvite.value = true
    targetRole.value = 'sales'
  } else if (options.role === 'provider' || options.role_invite === 'provider') {
      targetRole.value = 'provider'
  }
  if (options.contact) {
      form.email = options.contact
      invitedEmail.value = options.contact
  }
  // Capture referral code from URL params (ref or inviteCode)
  if (options.ref || options.inviteCode) {
      form.inviteCode = options.ref || options.inviteCode
  }
})

const sendCode = async () => {
    if (!form.email) return uni.showToast({ title: '请输入邮箱', icon: 'none' })
    try {
        await authApi.sendCode(form.email, 'register')
        uni.showToast({ title: '验证码已发送' })
        timer.value = 60
        const i = setInterval(() => {
            timer.value--
            if (timer.value <= 0) clearInterval(i)
        }, 1000)
    } catch (e: any) {
        uni.showToast({ title: e.message || '发送失败', icon: 'none' })
    }
}

const handleRegister = async () => {
    // Validate: Code is required ONLY if email doesn't match invited email
    const codeRequired = !isInvitedEmailMatch.value;
    
    if(!form.email || !form.password || (codeRequired && !form.code)) {
        return uni.showToast({ title: '请填写完整', icon: 'none' })
    }
    loading.value = true
    try {
        const role = targetRole.value
        await authApi.register({
            email: form.email,
            password: form.password,
            code: codeRequired ? form.code : undefined, // Send undefined if skipped
            role: role as any,
            name: form.name,
            inviteCode: form.inviteCode
        })
        uni.showToast({ title: '注册成功' })
        setTimeout(() => {
             if (role === 'provider') {
                 // Redirect to provider application flow
                 uni.reLaunch({ url: '/pages/provider/apply' })
             } else {
                 // Go to home
                 uni.reLaunch({ url: '/pages/index/index' })
             }
        }, 1500)
    } catch (e: any) {
        uni.showToast({ title: e.message || '注册失败', icon: 'none' })
    } finally {
        loading.value = false
    }
}

const goToLogin = () => {
    // Assuming login page exists? If not, create it or mock.
    // For now, simple redirect
    uni.navigateTo({ url: '/pages/index/login' }) // Hopefully exists?
}

const handleGoogleLogin = () => {
    uni.showToast({ title: 'Google 登录开发中...', icon: 'none' })
    // In real app, redirect to OAuth URL
}

const handleWeChatLogin = () => {
    uni.showToast({ title: '微信登录开发中...', icon: 'none' })
}
</script>

<style>
.container { padding: 30px 20px; }
.header { margin-bottom: 40px; }
.title { font-size: 28px; font-weight: bold; color: #333; }
.invite-banner { 
    background-color: #ecfdf5; 
    border: 1px solid #d1fae5; 
    border-radius: 8px; 
    padding: 12px; 
    display: flex; 
    align-items: center;
    margin-bottom: 20px;
}
.invite-text { color: #047857; font-weight: bold; font-size: 14px; margin-left: 10px;}
.form-group { margin-bottom: 20px; }
.label { font-size: 14px; color: #666; margin-bottom: 8px; display: block; }
.input { 
    width: 100%; 
    height: 48px; 
    background: #f9f9f9; 
    border-radius: 8px; 
    padding: 0 15px; 
    box-sizing: border-box;
    font-size: 16px;
}
.code-wrapper { display: flex; gap: 10px; }
.code-input { flex: 1; }
.code-btn { 
    width: 120px; 
    height: 48px; 
    font-size: 14px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    background: #e5e7eb; 
    color: #333;
    border-radius: 8px;
}
.submit-btn {
    margin-top: 40px;
    height: 50px;
    background: #10b981;
    color: white;
    border-radius: 25px;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}
.password-wrapper { 
    position: relative; 
    display: flex; 
    align-items: center; 
}
.password-input { flex: 1; padding-right: 40px; }
.eye-icon {
    position: absolute;
    right: 15px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    padding: 0 5px;
}
.social-login-container {
    margin-top: 40px;
}
.divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}
.line { 
    height: 1px;
    background-color: #eee;
    flex: 1;
}
.divider-text {
    font-size: 12px;
    color: #999;
    padding: 0 15px;
}
.social-buttons {
    display: flex;
    justify-content: space-between;
    gap: 15px;
}
.social-btn {
    flex: 1;
    height: 44px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
}
.social-btn:active {
    background-color: #f9f9f9;
}
.social-icon {
    width: 20px;
    height: 20px;
}
/* Hide WebKit Autofill Icons */
:deep(input::-webkit-contacts-auto-fill-button), 
:deep(input::-webkit-credentials-auto-fill-button) {
  visibility: hidden;
  display: none !important;
  pointer-events: none;
  height: 0;
  width: 0;
  margin: 0;
}
</style>
