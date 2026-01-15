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
            我已阅读并接受 <text class="link" @click="viewAgreement('user-agreement')">用户协议</text> 和 <text class="link" @click="viewAgreement('privacy-policy')">隐私政策</text>
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
             <view class="social-icon-btn" @click="handleGoogleLogin" title="Google 登录">
                <view class="icon-circle border-google">
                    <AppIcon name="google" :size="24" color="#DB4437" />
                </view>
                <text class="social-btn-label">Google</text>
             </view>
             <view class="social-icon-btn" @click="handleAppleLogin" title="Apple ID 登录">
                <view class="icon-circle border-apple">
                    <AppIcon name="apple" :size="24" color="#000000" />
                </view>
                <text class="social-btn-label">Apple ID</text>
             </view>
             <view class="social-icon-btn" @click="handleWechatLogin" title="微信登录">
                <view class="icon-circle border-wechat">
                    <AppIcon name="wechat" :size="24" color="#09BB07" />
                </view>
                <text class="social-btn-label">微信</text>
             </view>
          </view>
          <!-- Additional Disclaimer (H5 Style) -->
          <view class="mt-4 px-2" v-if="mode === 'login'">
              <text class="text-[10px] text-gray-400 text-center leading-tight block scale-90 origin-top opacity-80">
                  使用快捷方式登录，即代表同意 <text class="text-emerald-600" @click="viewAgreement('user-agreement')">用户协议</text> 和 <text class="text-emerald-600" @click="viewAgreement('privacy-policy')">隐私政策</text>
              </text>
          </view>
        </view>

        <!-- Footer -->
        <view class="auth-footer" @click="toggleMode">
           <text class="footer-text">{{ mode === 'login' ? '还没有账号？ ' : '已有账号？ ' }}<text class="footer-link">{{ mode === 'login' ? '立即注册' : '立即登录' }}</text></text>
        </view>

      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import AppIcon from './Icons.vue';
import { authApi, setToken, setUserInfo } from '../services/api';

const emit = defineEmits(['close', 'login-success', 'view-article']);

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

const viewAgreement = (slug: string) => {
    emit('view-article', { slug });
    emit('close'); // Close modal when viewing agreement to show the content underneath
};

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
     const response = await authApi.login(payload); 
    
    setToken(response.token);
    setUserInfo(response.user);
    
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    
    if (response.user?.role === 'provider') {
        uni.reLaunch({ url: '/pages/provider/order-hall' });
    } else if (response.user?.role === 'sales') {
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
    if (typeof window === 'undefined') {
        uni.showToast({ title: '请在浏览器中使用', icon: 'none' });
        return;
    }

    try {
        uni.showLoading({ title: '连接Google...' });
        
        if (!(window as any).google?.accounts) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Google SDK load failed'));
                document.head.appendChild(script);
            });
        }
        
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

// Apple Login Handler
const handleAppleLogin = async () => {
    // Only works in browser environment
    if (typeof window === 'undefined') {
        uni.showToast({ title: '请在浏览器中使用', icon: 'none' });
        return;
    }

    try {
        uni.showLoading({ title: '连接Apple...' });
        
        // Load Script if not present
        if (!(window as any).AppleID) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Apple SDK load failed'));
                document.head.appendChild(script);
            });
        }
        
        // Check for config
        const clientId = import.meta.env.VITE_APPLE_CLIENT_ID || 'com.youfujia.services.h5';
        const redirectURI = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin;

        (window as any).AppleID.auth.init({
            clientId: clientId,
            scope: 'name email',
            redirectURI: redirectURI,
            state: 'login',
            usePopup: true
        });

        const response = await (window as any).AppleID.auth.signIn();
        
        if (response.authorization) {
            uni.showLoading({ title: '登录中...' });
            try {
                // response.user is only provided on the first login
                const res = await authApi.appleLogin({ 
                    id_token: response.authorization.id_token,
                    user: response.user 
                });
                
                setToken(res.token);
                setUserInfo(res.user);
                
                uni.hideLoading();
                uni.showToast({ title: '登录成功', icon: 'success' });
                emit('login-success');
                emit('close');
            } catch(e: any) {
                uni.hideLoading();
                console.error('Apple Auth API Error:', e);
                uni.showToast({ title: e.message || 'Apple登录失败', icon: 'none' });
            }
        }
        
    } catch (e: any) {
        uni.hideLoading();
        if (e.error !== 'user_cancelled') {
            uni.showToast({ title: '无法连接Apple服务', icon: 'none' });
            console.error(e);
        }
    }
};

const handleWechatLogin = () => {
    // Generate WeChat Mini Program URL Scheme
    // For production, this should be fetched from backend or generated via WeChat API
    // weixin://dl/business/?t=...
    const miniProgramUrlScheme = "weixin://dl/business/?t=T6x2Z3E6W4v"; 
    
    // In H5, we can use window.location.href to jump
    // #ifdef H5
    window.location.href = miniProgramUrlScheme;
    // #endif
    
    // #ifndef H5
    uni.showToast({ title: '请在手机浏览器中使用微信快捷登录', icon: 'none' });
    // #endif
};
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.auth-modal-container {
  width: 90%;
  max-width: 420px;
  background-color: #fff;
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  position: relative;
}

/* Close Button (Optional if you want a visible one, currently overlay handles it) */

/* Header Center */
.auth-header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
}
.logo-box {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
}
.logo-text {
    font-size: 36px;
    font-weight: bold;
    color: #fff;
    font-family: serif;
}
.welcome-text {
    font-size: 26px;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.5px;
}

/* Tabs */
.auth-tabs {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
}
.tab-item {
  position: relative;
  padding-bottom: 8px;
  cursor: pointer;
}
.tab-text {
  font-size: 16px;
  color: #9ca3af;
  transition: all 0.3s ease;
  font-weight: 500;
}
.tab-text-active {
  color: #059669;
  font-weight: 700;
}
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background-color: #059669;
  border-radius: 2px;
}

/* Inputs */
.input-group {
    margin-bottom: 12px;
}
.auth-input {
    width: 100%;
    height: 56px;
    background-color: #f3f4f6;
    border: 2px solid transparent;
    border-radius: 16px;
    padding: 0 20px;
    font-size: 16px;
    color: #1f2937;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.auth-input:focus {
    background-color: #fff;
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.input-placeholder {
    color: #9ca3af;
}

/* Input Container with Border (for group inputs) */
.input-container-border {
    background-color: #f3f4f6;
    border: 2px solid transparent;
    border-radius: 16px;
    display: flex;
    align-items: center;
    overflow: hidden;
    height: 56px;
    transition: all 0.2s;
}
.input-container-border:focus-within {
    background-color: #fff;
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.no-border {
    border: none;
    background-color: transparent;
}
.code-btn-wrapper {
    padding: 0 20px;
    height: 100%;
    display: flex;
    align-items: center;
    border-left: 1px solid #e5e7eb;
}
.code-btn-text {
    color: #059669;
    font-size: 14px;
    font-weight: 600;
}
.password-toggle {
    padding: 0 20px;
    height: 100%;
    display: flex;
    align-items: center;
}

.forgot-wrapper {
    display: flex;
    justify-content: flex-end;
    margin: 8px 0 24px;
}
.forgot-text {
    color: #059669;
    font-size: 14px;
    font-weight: 600;
}

/* Terms */
.terms-container {
    display: flex;
    align-items: flex-start;
    margin-top: 16px;
    margin-bottom: 24px;
}
.checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid #d1d5db;
    border-radius: 6px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
}
.checkbox-checked {
    background-color: #10b981;
    border-color: #10b981;
}
.terms-text {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
}
.link {
    color: #059669;
    font-weight: 600;
}

/* Main Button */
.login-btn {
    width: 100%;
    height: 56px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
    border-radius: 18px;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(5, 150, 105, 0.2);
    margin-bottom: 32px;
    transition: all 0.3s;
}
.login-btn-active:active {
    transform: scale(0.98);
}

/* Quick Login */
.quick-login-section {
    margin-bottom: 32px;
}
.divider-box {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
}
.line {
    flex: 1;
    height: 1.5px;
    background-color: #f3f4f6;
}
.quick-login-title {
    margin: 0 20px;
    font-size: 13px;
    color: #9ca3af;
    font-weight: 600;
}

.social-icons {
    display: flex;
    justify-content: space-around;
    padding: 0 10px;
}
.social-icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
.icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border: 1.5px solid #f3f4f6;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.icon-circle:active {
    transform: scale(0.9);
    background-color: #f9fafb;
}

/* Specific borders if wanted or just shadow */
/* .border-google { border-color: #f3f4f6; } */

.social-btn-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
}

/* Footer */
.auth-footer {
    text-align: center;
}
.footer-text {
    font-size: 15px;
    color: #6b7280;
}
.footer-link {
    color: #059669;
    font-weight: 700;
    margin-left: 4px;
}

.flex-row { display: flex; flex-direction: row; }
.flex-1 { flex: 1; }
.w-full { width: 100%; }
.mt-4 { margin-top: 16px; }
</style>
