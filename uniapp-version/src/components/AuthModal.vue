<template>
  <view class="auth-modal-overlay" @click.stop="emit('close')" @touchmove.stop.prevent="">
    <view class="auth-modal-container bg-white" @click.stop>
      <!-- Header Area (Logo & Title) -->
      <view class="auth-header-center" v-if="mode === 'login'">
        <view class="logo-box">
             <text class="logo-text">Y</text>
        </view>
        <text class="welcome-text">欢迎回来</text>
      </view>
      <view class="auth-header-center" v-else>
         <view class="logo-box">
             <text class="logo-text">Y</text>
        </view>
        <text class="welcome-text">创建账号</text>
      </view>

      <!-- Tabs (Login Mode) -->
      <view class="auth-tabs" v-if="mode === 'login'">
        <view class="tab-item" @click="activeTab = 'account'">
          <text 
            class="tab-text" 
            :class="{ 'tab-text-active': activeTab === 'account' }"
          >密码登录</text>
          <view v-if="activeTab === 'account'" class="tab-indicator"></view>
        </view>
        <view class="tab-item" @click="activeTab = 'code'">
          <text 
            class="tab-text" 
            :class="{ 'tab-text-active': activeTab === 'code' }"
          >验证码登录</text>
          <view v-if="activeTab === 'code'" class="tab-indicator"></view>
        </view>
      </view>

      <!-- Form Content -->
      <view class="auth-form">
        <!-- Login Mode -->
        <template v-if="mode === 'login'">
            <view class="input-group">
              <input 
                class="auth-input" 
                placeholder="电子邮箱" 
                placeholder-class="input-placeholder"
                v-model="email"
              />
            </view>
    
            <view class="input-group mt-4">
               <template v-if="activeTab === 'code'">
                  <view class="flex-row w-full input-container-border">
                      <input 
                        class="auth-input flex-1 no-border" 
                        placeholder="请输入验证码" 
                        placeholder-class="input-placeholder"
                        v-model="code"
                      />
                      <view class="code-btn-wrapper" @click="handleSendCode('login')">
                        <text class="code-btn-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
                      </view>
                  </view>
               </template>
               <template v-else>
                  <view class="flex-row w-full input-container-border" style="position: relative;">
                      <input 
                        class="auth-input flex-1 no-border" 
                        placeholder="密码" 
                        :password="!showPassword"
                        placeholder-class="input-placeholder"
                        v-model="password"
                      />
                      <view class="password-toggle" @click.stop="showPassword = !showPassword">
                          <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="20" color="#999" />
                      </view>
                  </view>
               </template>
            </view>
            
            <view class="forgot-wrapper" v-if="activeTab === 'account'">
                <text class="forgot-text">忘记密码?</text>
            </view>
        </template>

        <!-- Register Mode -->
        <template v-else>
            <view class="input-group mt-4">
              <input class="auth-input" placeholder="电子邮箱" v-model="email" />
            </view>
            
            <!-- Email Code for Register -->
            <view class="input-group mt-4">
                <view class="flex-row w-full input-container-border">
                    <input 
                      class="auth-input flex-1 no-border" 
                      placeholder="邮箱验证码" 
                      placeholder-class="input-placeholder"
                      v-model="code"
                    />
                    <view class="code-btn-wrapper" @click="handleSendCode('register')">
                      <text class="code-btn-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
                    </view>
                </view>
            </view>

            <view class="input-group mt-4">
                 <view class="flex-row w-full input-container-border" style="position: relative;">
                    <input 
                        class="auth-input flex-1 no-border" 
                        placeholder="设置密码 (至少6位)" 
                        :password="!showPassword" 
                        v-model="password" 
                    />
                    <view class="password-toggle" @click.stop="showPassword = !showPassword">
                        <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="20" color="#999" />
                    </view>
                </view>
            </view>
        </template>

        <!-- Terms (Both Modes needs agreement? Usually Register needs it strictly. Login maybe auto-agree or just link. PC has checkbox for register. H5 usually forces agreement.) -->
        <view class="terms-container" v-if="mode === 'register'">
          <view 
            class="checkbox" 
            :class="{ 'checkbox-checked': agreed }"
            @click="agreed = !agreed"
          >
             <AppIcon v-if="agreed" name="check" :size="12" color="#fff" />
          </view>
          <text class="terms-text">
            我已阅读并接受 <text class="link">用户协议</text> 和 <text class="link">隐私政策</text>
          </text>
        </view>


        <!-- Action Button -->
        <button 
          class="login-btn" 
          hover-class="login-btn-hover"
          @click="handleSubmit"
        >
          {{ mode === 'login' ? '登录' : '立即注册' }}
        </button>

        <!-- Quick Login -->
        <view class="quick-login-section">
          <view class="divider-box">
             <view class="line"></view>
             <text class="quick-login-title">快捷登录</text>
             <view class="line"></view>
          </view>
          
          <view class="social-icons">
             <view class="social-btn" @click="handleGoogleLogin">
                <AppIcon name="google" :size="20" color="#DB4437" />
                <text class="social-text">Google</text>
             </view>
             <view class="social-btn">
                <AppIcon name="wechat" :size="20" color="#09BB07" />
                 <text class="social-text">微信</text>
             </view>
          </view>
        </view>

        <!-- Footer -->
        <view class="auth-footer" @click="toggleMode">
           <text class="footer-text">{{ mode === 'login' ? '还没有账号？ 立即注册' : '已有账号？ 立即登录' }}</text>
        </view>

      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from './Icons.vue';
import { authApi, setToken, setUserInfo } from '../services/api';

const emit = defineEmits(['close', 'login-success']);

const mode = ref<'login' | 'register'>('login');
const activeTab = ref('account'); // 'account' (password) or 'code'
const email = ref('');
const password = ref('');
const code = ref('');
const name = ref('');
const phone = ref('');
const agreed = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const countdown = ref(0);

// Send Code Logic
const handleSendCode = async (type: string) => {
    if (!email.value) {
        uni.showToast({ title: '请输入邮箱', icon: 'none' });
        return;
    }
    if (countdown.value > 0) return;
    
    try {
        await authApi.sendCode(email.value, type as any);
        countdown.value = 60;
        uni.showToast({ title: '验证码已发送', icon: 'none' });
        
        const timer = setInterval(() => {
            if (countdown.value <= 0) {
                clearInterval(timer);
                return;
            }
            countdown.value--;
        }, 1000);
    } catch (error: any) {
        uni.showToast({ title: error.message || '发送失败', icon: 'none' });
    }
}

const handleLogin = async () => {


  const payload = activeTab.value === 'code' 
        ? { email: email.value, code: code.value }
        : { email: email.value, password: password.value };

  if (!payload.email || (!payload.password && !payload.code)) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }

  loading.value = true;
  uni.showLoading({ title: '登录中...' });

  try {
     // Check if login request supports object payload in H5 api wrapper
     // The original AuthModal called authApi.login(email, password) - we need to see layout
     // PC uses object. H5 might be using positional args. I'll check api.ts later. 
     // For now I'll assume I can pass object or need to update api.ts.
     // Let's assume standardized API.
     const response = await authApi.login(payload); 
    
    setToken(response.token);
    setUserInfo(response.user);
    
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    
    if (response.user?.role === 'provider' || response.user?.role === 'service_provider') {
        uni.reLaunch({ url: '/pages/provider/order-hall' });
    } else if (response.user?.role === 'sales_partner') {
        uni.reLaunch({ url: '/pages/sales/dashboard' });
    } else {
        emit('login-success');
        emit('close');
    }
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '登录失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意协议', icon: 'none' });
    return;
  }

  if (!email.value || !password.value || !code.value) {
    uni.showToast({ title: '请填写邮箱、密码和验证码', icon: 'none' });
    return;
  }

  loading.value = true;
  uni.showLoading({ title: '注册中...' });

  try {
    const response = await authApi.register({
      email: email.value,
      password: password.value,
      code: code.value,
      name: name.value,
      phone: phone.value,
      role: 'user'
    });
    
    setToken(response.token);
    setUserInfo(response.user);
    
    uni.hideLoading();
    uni.showToast({ title: '注册成功', icon: 'success' });
    emit('login-success');
    emit('close');
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '注册失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const toggleMode = () => {
    mode.value = mode.value === 'login' ? 'register' : 'login';
    // Reset fields
    password.value = '';
    code.value = '';
    agreed.value = false;
};

const handleSubmit = () => {
    if (mode.value === 'login') handleLogin();
    else handleRegister();
};

const handleGoogleLogin = async () => {
    // Only works in browser environment
    if (typeof window === 'undefined') {
        uni.showToast({ title: '请在浏览器中使用', icon: 'none' });
        return;
    }

    try {
        uni.showLoading({ title: '连接Google...' });
        
        // Load Script if not present
        if (!(window as any).google?.accounts) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Google SDK load failed'));
                document.head.appendChild(script);
            });
        }
        
        // Check for client ID
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
             uni.hideLoading();
             console.error('Missing VITE_GOOGLE_CLIENT_ID');
             uni.showToast({ title: '配置缺失: Google Client ID', icon: 'none' });
             return;
        }

        const client = (window as any).google.accounts.oauth2.initCodeClient({
            client_id: clientId,
            scope: 'email profile openid',
            ux_mode: 'popup',
            callback: async (response: any) => {
                if (response.code) {
                    uni.showLoading({ title: '登录中...' });
                    try {
                        const res = await authApi.googleLogin({ code: response.code });
                        setToken(res.token);
                        setUserInfo(res.user);
                        uni.hideLoading();
                        uni.showToast({ title: '登录成功', icon: 'success' });
                        emit('login-success');
                        emit('close');
                    } catch(e: any) {
                        uni.hideLoading();
                        console.error('Google Auth API Error:', e);
                        uni.showToast({ title: e.message || 'Google登录失败', icon: 'none' });
                    }
                }
            },
        });
        
        uni.hideLoading();
        client.requestCode();
        
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: '无法连接Google服务', icon: 'none' });
        console.error(e);
    }
};
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-modal-container {
  width: 85%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 24px;
  padding: 30px 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* Header Center */
.auth-header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
}
.logo-box {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.logo-text {
    font-size: 32px;
    font-weight: bold;
    color: #fff;
    font-family: serif;
}
.welcome-text {
    font-size: 24px;
    font-weight: bold;
    color: #111827;
}

/* Tabs */
.auth-tabs {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 2px;
}
.tab-item {
  position: relative;
  padding-bottom: 10px;
  cursor: pointer;
}
.tab-text {
  font-size: 16px;
  color: #6b7280;
  transition: all 0.3s;
}
.tab-text-active {
  color: #10b981;
  font-weight: 600;
}
.tab-indicator {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #10b981;
  border-radius: 2px;
}

/* Inputs */
.input-group {
    margin-bottom: 16px;
}
.auth-input {
    width: 100%;
    height: 50px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0 16px;
    font-size: 15px;
    color: #1f2937;
    transition: all 0.2s;
}
.auth-input:focus {
    background-color: #fff;
    border-color: #10b981;
}
.input-placeholder {
    color: #9ca3af;
}

/* Input Container with Border (for group inputs) */
.input-container-border {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    overflow: hidden;
}
.no-border {
    border: none;
    background-color: transparent;
}
.code-btn-wrapper {
    padding: 0 16px;
    height: 100%;
    display: flex;
    align-items: center;
    border-left: 1px solid #e5e7eb;
}
.code-btn-text {
    color: #10b981;
    font-size: 14px;
    font-weight: 500;
}
.password-toggle {
    padding: 0 16px;
    height: 100%;
    display: flex;
    align-items: center;
}

.forgot-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}
.forgot-text {
    color: #10b981;
    font-size: 13px;
    font-weight: 500;
}

/* Terms */
.terms-container {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
}
.checkbox {
    width: 18px;
    height: 18px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.checkbox-checked {
    background-color: #10b981;
    border-color: #10b981;
}
.terms-text {
    font-size: 12px;
    color: #4b5563;
}
.link {
    color: #10b981;
}

/* Main Button */
.login-btn {
    width: 100%;
    height: 52px;
    background-color: #111827; /* Dark black/gray */
    color: #fff;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 30px;
}
.login-btn-hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

/* Quick Login */
.quick-login-section {
    margin-bottom: 20px;
}
.divider-box {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}
.line {
    flex: 1;
    height: 1px;
    background-color: #f3f4f6;
}
.quick-login-title {
    margin: 0 15px;
    font-size: 12px;
    color: #9ca3af;
}

.social-icons {
    display: flex;
    gap: 16px;
    justify-content: center;
}
.social-btn {
    flex: 1;
    height: 48px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #fff;
    transition: all 0.2s;
}
.social-text {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}
.flex-row {
    display: flex;
    flex-direction: row;
}
.flex-1 {
    flex: 1;
}

/* Footer */
.auth-footer {
    text-align: center;
}
.footer-text {
    font-size: 14px;
    color: #4b5563;
}
</style>
