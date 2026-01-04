<template>
  <view class="min-h-screen bg-profile-gray pb-24">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-container">
      <!-- Green Header (Compact) -->
      <view class="header-gradient pt-custom px-4 pb-6">
        <view class="flex flex-row justify-end gap-4 py-2">
          <view class="w-8 h-8 flex items-center justify-center">
            <AppIcon name="headphones" :size="22" :style="{ color: '#ffffff' }" />
          </view>
        </view>
        
        <!-- Login/Auth Title -->
        <view class="flex flex-col items-center mt-2">
          <view class="w-16 h-16 rounded-full bg-white-20 flex items-center justify-center mb-2">
             <text class="text-white text-3xl font-serif font-bold">Y</text>
          </view>
          <text class="text-white text-lg font-bold">
              {{ activeTab === 'register' ? '创建账号' : (activeTab === 'forgot' ? '重置密码' : '欢迎回来') }}
          </text>
          <text class="text-white-70 text-xs mt-1">
              {{ activeTab === 'register' ? '注册后享受更多服务' : (activeTab === 'forgot' ? '找回您的账号' : '登录后享受更多服务') }}
          </text>
        </view>
      </view>
      
      <!-- Auth Card -->
      <view class="mx-4 -mt-6 bg-white rounded-2xl p-6 shadow-md">
        
        <!-- ============================================ -->
        <!--  适配：H5 / App 端显示 (密码、验证码、Google)   -->
        <!-- ============================================ -->
        <!-- #ifndef MP-WEIXIN -->
        
        <!-- Login Sub-Tabs (Password vs Code) -->
        <view v-if="activeTab === 'login' || activeTab === 'login-code'" class="flex flex-row mb-5 bg-gray-100 p-1">
          <view 
            class="flex-1 text-center py-2 cursor-pointer transition-all"
            :class="activeTab === 'login' ? 'bg-white' : ''"
            @click="activeTab = 'login'"
          >
            <text :class="activeTab === 'login' ? 'text-emerald-600 font-bold' : 'text-gray-400'">密码登录</text>
          </view>
          <view 
            class="flex-1 text-center py-2 cursor-pointer transition-all"
            :class="activeTab === 'login-code' ? 'bg-white' : ''"
            @click="activeTab = 'login-code'"
          >
            <text :class="activeTab === 'login-code' ? 'text-emerald-600 font-bold' : 'text-gray-400'">验证码登录</text>
          </view>
        </view>

        <!-- Mode: LOGIN (Password) -->
        <view v-if="activeTab === 'login'" class="form-section">
          <!-- ... Existing Password Login Form ... -->
          <view class="input-group mb-4">
            <AppIcon name="mail" :size="20" :style="{ color: '#9ca3af' }" />
            <input 
              v-model="loginForm.email" 
              class="input-field" 
              placeholder="请输入邮箱" 
              placeholder-class="placeholder-text"
            />
          </view>
          <view class="input-group mb-2" style="position: relative;">
            <AppIcon name="lock" :size="20" :style="{ color: '#9ca3af' }" />
            <input 
              v-model="loginForm.password" 
              class="input-field" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码" 
              placeholder-class="placeholder-text"
              style="padding-right: 40px;"
            />
            <view class="password-toggle" @click.stop="showPassword = !showPassword">
                 <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="20" color="#9ca3af" />
             </view>
          </view>

          <view class="flex flex-row justify-end mb-6">
              <text class="text-sm text-emerald-600 font-medium" @click="activeTab = 'forgot'">忘记密码？</text>
          </view>
          
          <view class="terms-container mb-4">
               <view class="checkbox" :class="{ 'checkbox-checked': agreed }" @click="agreed = !agreed">
                    <AppIcon v-if="agreed" name="check" :size="12" color="#fff" />
               </view>
               <text class="terms-text">登录即代表同意 <text class="link">用户协议</text> 和 <text class="link">隐私政策</text></text>
          </view>

          <button class="login-btn" @click="handleLogin">登录</button>
        </view>
        
        <!-- Mode: LOGIN (Code) -->
        <view v-else-if="activeTab === 'login-code'" class="form-section">
             <!-- ... Existing Code Login Form ... -->
             <view class="input-group mb-4">
                <AppIcon name="mail" :size="20" :style="{ color: '#9ca3af' }" />
                <input 
                  v-model="loginForm.email" 
                  class="input-field" 
                  placeholder="请输入邮箱" 
                  placeholder-class="placeholder-text"
                />
              </view>
              <view class="flex flex-row gap-2 mb-6">
                  <view class="input-group flex-1">
                    <AppIcon name="key" :size="20" :style="{ color: '#9ca3af' }" />
                    <input 
                      v-model="loginForm.code" 
                      class="input-field" 
                      placeholder="验证码" 
                      type="number"
                      placeholder-class="placeholder-text"
                    />
                  </view>
                  <button 
                    class="bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl px-2 w-[100px] flex items-center justify-center border border-emerald-200 active:bg-emerald-100"
                    :disabled="countDown > 0 || isSending"
                    @click="handleSendCode('login')"
                  >
                    {{ countDown > 0 ? `${countDown}s` : '获取验证码' }}
                  </button>
              </view>

              <view class="terms-container mb-4">
                   <view class="checkbox" :class="{ 'checkbox-checked': agreed }" @click="agreed = !agreed">
                        <AppIcon v-if="agreed" name="check" :size="12" color="#fff" />
                   </view>
                   <text class="terms-text">登录即代表同意 <text class="link">用户协议</text> 和 <text class="link">隐私政策</text></text>
              </view>

              <button class="login-btn" @click="handleLogin">登录</button>
        </view>

        <!-- Mode: REGISTER -->
        <view v-else-if="activeTab === 'register'" class="form-section pt-2">
            <!-- Reuse existing Register Form Code -->
            <view class="flex flex-row mb-5 bg-gray-100 p-1">
            <view 
              class="flex-1 text-center py-2 cursor-pointer transition-all"
              :class="registerType === 'user' ? 'bg-white' : ''"
              @click="registerType = 'user'"
            >
              <text :class="registerType === 'user' ? 'text-emerald-600 font-bold' : 'text-gray-400'">普通用户</text>
            </view>
            <view 
              class="flex-1 text-center py-2 cursor-pointer transition-all"
              :class="registerType === 'provider' ? 'bg-white' : ''"
              @click="registerType = 'provider'"
            >
              <text :class="registerType === 'provider' ? 'text-emerald-600 font-bold' : 'text-gray-400'">服务商注册</text>
            </view>
          </view>

          <!-- Provider: Show Name and Phone -->
          <view v-if="registerType === 'provider'">
            <view class="input-group mb-4">
              <AppIcon name="user" :size="20" :style="{ color: '#9ca3af' }" />
              <input 
                v-model="registerForm.name" 
                class="input-field" 
                placeholder="真实姓名" 
                placeholder-class="placeholder-text"
              />
            </view>
            <view class="input-group mb-4">
               <AppIcon name="phone" :size="20" :style="{ color: '#9ca3af' }" />
               <input 
                 v-model="registerForm.phone" 
                 class="input-field" 
                 placeholder="手机号码" 
                 placeholder-class="placeholder-text"
               />
             </view>
          </view>

          <!-- Common: Email -->
          <view class="input-group mb-4">
            <AppIcon name="mail" :size="20" :style="{ color: '#9ca3af' }" />
            <input 
              v-model="registerForm.email" 
              class="input-field" 
              placeholder="电子邮箱" 
              placeholder-class="placeholder-text"
            />
          </view>

          <!-- Verification Code (Register) -->
          <view class="flex flex-row gap-2 mb-4">
              <view class="input-group flex-1">
                <AppIcon name="key" :size="20" :style="{ color: '#9ca3af' }" />
                <input 
                  v-model="registerForm.code" 
                  class="input-field" 
                  placeholder="邮箱验证码" 
                  type="number"
                  placeholder-class="placeholder-text"
                />
              </view>
              <button 
                class="bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl px-2 w-[100px] flex items-center justify-center border border-emerald-200"
                :disabled="countDown > 0 || isSending"
                @click="handleSendCode('register')"
              >
                {{ countDown > 0 ? `${countDown}s` : '获取验证码' }}
              </button>
          </view>

          <view class="input-group mb-4" style="position: relative;">
            <AppIcon name="lock" :size="20" :style="{ color: '#9ca3af' }" />
            <input 
              v-model="registerForm.password" 
              class="input-field" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="设置密码（至少6位）" 
              placeholder-class="placeholder-text"
              style="padding-right: 40px;"
            />
            <view class="password-toggle" @click.stop="showPassword = !showPassword">
                 <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="20" color="#9ca3af" />
             </view>
          </view>
          
          <view class="terms-container mb-6">
            <view class="checkbox" :class="{ 'checkbox-checked': agreed }" @click="agreed = !agreed">
                 <AppIcon v-if="agreed" name="check" :size="12" color="#fff" />
            </view>
            <text class="terms-text">我已阅读并接受 <text class="link">{{ registerType === 'provider' ? '服务商协议' : '用户协议' }}</text> 和 <text class="link">隐私政策</text></text>
          </view>

          <button class="login-btn" @click="handleRegister">
            {{ registerType === 'provider' ? '下一步' : '立即注册' }}
          </button>
        </view>

        <!-- Mode: FORGOT PASSWORD -->
        <view v-else-if="activeTab === 'forgot'" class="form-section pt-2">
             <!-- ... Existing Forgot Form ... -->
             <view class="input-group mb-4">
              <AppIcon name="mail" :size="20" :style="{ color: '#9ca3af' }" />
              <input 
                v-model="forgotForm.email" 
                class="input-field" 
                placeholder="请输入注册邮箱" 
                placeholder-class="placeholder-text"
              />
            </view>
  
            <view class="flex flex-row gap-2 mb-4">
                <view class="input-group flex-1">
                  <AppIcon name="key" :size="20" :style="{ color: '#9ca3af' }" />
                  <input 
                    v-model="forgotForm.code" 
                    class="input-field" 
                    placeholder="验证码" 
                    type="number"
                    placeholder-class="placeholder-text"
                  />
                </view>
                <button 
                  class="bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl px-2 w-[100px] flex items-center justify-center border border-emerald-200"
                  :disabled="countDown > 0 || isSending"
                  @click="handleSendCode('forgot')"
                >
                  {{ countDown > 0 ? `${countDown}s` : '获取验证码' }}
                </button>
            </view>
  
            <view class="input-group mb-4" style="position: relative;">
              <AppIcon name="lock" :size="20" :style="{ color: '#9ca3af' }" />
              <input 
                v-model="forgotForm.password" 
                class="input-field" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="设置新密码" 
                placeholder-class="placeholder-text"
                style="padding-right: 40px;"
              />
              <view class="password-toggle" @click.stop="showPassword = !showPassword">
                   <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="20" color="#9ca3af" />
               </view>
            </view>
            
            <button class="login-btn" @click="handleResetPassword">重置密码</button>
        </view>
        
        <!-- Social Login & Footer Toggle -->
        <view class="mt-6">
            <view v-if="activeTab === 'login' || activeTab === 'login-code'" class="mb-4">
                <view class="flex flex-row items-center mb-3">
                    <view class="flex-1 h-px bg-gray-100"></view>
                    <text class="mx-3 text-xs text-gray-400">快捷登录</text>
                    <view class="flex-1 h-px bg-gray-100"></view>
                </view>
                <!-- Enhanced Social Buttons -->
                <view class="flex flex-row gap-4 justify-center">
                    <view class="flex-1 h-12 bg-white border border-gray-200 rounded-xl flex flex-row items-center justify-center gap-2 active:bg-gray-50 shadow-sm" @click="handleGoogleLogin">
                        <AppIcon name="google" :size="24" color="#DB4437" />
                        <text class="text-base font-bold text-gray-700">Google</text>
                    </view>
                    <view class="flex-1 h-12 bg-white border border-gray-200 rounded-xl flex flex-row items-center justify-center gap-2 active:bg-gray-50 shadow-sm" @click="handleFacebookLogin">
                         <AppIcon name="facebook" :size="24" color="#1877F2" />
                        <text class="text-base font-bold text-gray-700">Facebook</text>
                    </view>
                </view>
                <!-- Disclaimer Text -->
                <view class="mt-3 px-2">
                    <text class="text-[10px] text-gray-400 text-center leading-tight block">
                        使用快捷方式登录，即代表同意 <text class="text-emerald-600">用户协议</text> 和 <text class="text-emerald-600">隐私政策</text>
                    </text>
                </view>
            </view>

            <view class="text-center pt-2">
                <template v-if="activeTab === 'register'">
                    <text class="text-gray-400 text-sm">已有账号？</text>
                    <text class="text-emerald-600 text-sm font-medium ml-1" @click="activeTab = 'login'">立即登录</text>
                </template>
                <template v-else>
                    <text class="text-gray-400 text-sm">还没有账号？</text>
                    <text class="text-emerald-600 text-sm font-medium ml-1" @click="activeTab = 'register'">立即注册</text>
                </template>
            </view>
        </view>
        <!-- #endif -->

        <!-- ============================================ -->
        <!--  适配：微信小程序端显示 (一键登录)            -->
        <!-- ============================================ -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="flex flex-col items-center justify-center pt-8 px-4">
             <view class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                 <AppIcon name="message" :size="40" :style="{ color: '#059669' }" />
             </view>
             <text class="text-xl font-bold text-gray-800 mb-2">欢迎使用有福家</text>
             <text class="text-gray-500 text-sm mb-10 text-center">登录即可查看订单、管理地址、获取最新优惠</text>

             <!-- WeChat Native Login Button -->
             <button 
                class="w-full bg-[#07C160] text-white font-bold py-3 rounded-xl flex flex-row items-center justify-center mb-4 border-none"
                style="border: none;"
                open-type="getPhoneNumber" 
                @getphonenumber="handleWeChatPhoneNumber"
             >
                <AppIcon name="message" :size="20" color="#fff" style="margin-right: 8px;" />
                微信一键登录
             </button>
             
             <view class="terms-container mt-4 justify-center">
                <view class="checkbox" :class="{ 'checkbox-checked': agreed }" @click="agreed = !agreed">
                     <AppIcon v-if="agreed" name="check" :size="12" color="#fff" />
                </view>
                <text class="terms-text">登录即代表同意 <text class="link">用户协议</text> 和 <text class="link">隐私政策</text></text>
             </view>
        </view>
        <!-- #endif -->

      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else>
      <!-- Green Header Area -->
      <view class="header-gradient pt-custom px-4 pb-6">
        <!-- Top Icons -->
        <view class="flex flex-row justify-end gap-4 py-3">
          <view class="w-8 h-8 flex items-center justify-center">
            <AppIcon name="headphones" :size="22" :style="{ color: '#ffffff' }" />
          </view>
          <view class="w-8 h-8 flex items-center justify-center">
            <AppIcon name="settings" :size="22" :style="{ color: '#ffffff' }" />
          </view>
        </view>
        
        <!-- User Info -->
        <view class="flex flex-row items-center gap-4 mt-2">
          <view class="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center">
            <AppIcon name="user" :size="32" :style="{ color: '#059669' }" />
          </view>
          <view class="flex flex-col">
            <text class="text-white text-xl font-bold">{{ userInfo?.name || '用户' }}</text>
            <text class="text-white-70 text-sm mt-1">{{ userInfo?.email || '' }}</text>
          </view>
        </view>
        
        <!-- Points Card -->
        <view class="points-card mt-4 rounded-xl px-4 py-3 flex flex-row items-center gap-3">
          <view class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <AppIcon name="wallet" :size="18" :style="{ color: '#3b82f6' }" />
          </view>
          <text class="text-gray-700 font-bold">我的积分</text>
          <text class="text-emerald-600 text-xl font-bold ml-2">{{ userInfo?.credits || 0 }}</text>
        </view>
      </view>



      <!-- Standard Service Orders -->
      <view class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <view class="flex flex-row items-center justify-between mb-4">
          <text class="text-lg font-bold text-gray-900">标准服务订单</text>
          <view class="flex flex-row items-center" @click="emit('view-submissions', '')">
            <text class="text-gray-400 text-sm">全部</text>
            <text class="text-gray-400 ml-1">›</text>
          </view>
        </view>
        
        <view class="grid-cols-4 grid gap-3">
          <view v-for="(item, idx) in STANDARD_ORDERS" :key="idx" class="flex flex-col items-center gap-2">
            <view 
              class="w-15 h-15 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: item.bgColor }"
            >
              <AppIcon :name="item.iconName" :size="32" :style="{ color: item.iconColor }" />
            </view>
            <text class="text-base text-gray-700 text-center font-bold">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- Custom Service Orders -->
      <view class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <view class="flex flex-row items-center justify-between mb-4">
          <text class="text-lg font-bold text-gray-900">定制服务订单</text>
          <view class="flex flex-row items-center" @click="emit('view-submissions', '')">
            <text class="text-gray-400 text-sm">全部</text>
            <text class="text-gray-400 ml-1">›</text>
          </view>
        </view>
        
        <view class="grid-cols-4 grid gap-3">
          <view v-for="(item, idx) in CUSTOM_ORDERS" :key="idx" class="flex flex-col items-center gap-2" @click="handleOrderClick(item)">
            <view 
              class="w-15 h-15 rounded-full flex items-center justify-center relative"
              :style="{ backgroundColor: item.bgColor }"
            >
              <AppIcon :name="item.iconName" :size="32" :style="{ color: item.iconColor }" />
              
              <!-- Badge for Quote Count -->
              <view 
                v-if="item.name === '寻找中' && totalQuoteCount > 0" 
                class="absolute -top-2 -right-2 bg-red-600 text-white font-bold px-1 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
                style="min-width: 24px; height: 24px; line-height: 20px; font-size: 14px;"
              >
                {{ totalQuoteCount }}
              </view>
            </view>
            <text class="text-base text-gray-700 text-center font-bold">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- Menu List -->
      <view class="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <view 
          v-for="(item, idx) in MENU_ITEMS" 
          :key="idx" 
          class="flex flex-row items-center px-4 py-3 border-b border-gray-50 active-opacity-70"
          @click="handleMenuClick(item)"
        >
          <view class="w-8 h-8 flex items-center justify-center mr-3">
            <AppIcon :name="item.iconName" :size="22" :style="{ color: item.iconColor }" />
          </view>
          <text class="flex-1 text-base text-gray-800 font-medium">{{ item.name }}</text>
          
          <view v-if="item.name === '收件箱' && unreadCount > 0" style="background-color: #ef4444; color: white; border-radius: 999px; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px; padding: 0 6px;">
              {{ unreadCount }}
          </view>

          <text class="text-gray-300">›</text>
        </view>
      </view>

      <!-- Service Provider / Sales Button -->
      <view class="mx-4 mt-4" @click="handleSwitchRole">
        <view class="provider-btn rounded-xl px-4 py-4 flex flex-row items-center justify-between active-opacity-90">
          <view class="flex flex-row items-center gap-3">
            <view class="w-8 h-8 rounded-lg bg-white-20 flex items-center justify-center">
              <AppIcon :name="userInfo?.role === 'sales' ? 'users' : 'briefcase'" :size="20" :style="{ color: '#ffffff' }" />
            </view>
            <text class="text-white font-bold text-base">{{ switchRoleButtonText }}</text>
          </view>
          <view class="flex flex-row items-center">
             <text class="text-white-70 text-sm mr-2">{{ switchRoleSubText }}</text>
             <text class="text-white text-lg">›</text>
          </view>
        </view>
      </view>

      <!-- Admin Entry -->
      <view v-if="userInfo?.role === 'admin'" class="mx-4 mt-4" @click="handleGoAdminFinance">
        <view class="bg-gray-800 rounded-xl px-4 py-4 flex flex-row items-center justify-between active-opacity-90">
              <view class="flex flex-row items-center gap-3">
                <view class="w-8 h-8 rounded-lg bg-white-20 flex items-center justify-center">
                  <AppIcon name="settings" :size="20" :style="{ color: '#ffffff' }" />
                </view>
                <text class="text-white font-bold text-base">财务管理后台</text>
              </view>
              <text class="text-white text-lg">›</text>
        </view>
      </view>

      <!-- SMS Template Admin Entry -->
      <view v-if="userInfo?.role === 'admin'" class="mx-4 mt-4" @click="handleGoAdminSms">
        <view class="bg-blue-600 rounded-xl px-4 py-4 flex flex-row items-center justify-between active-opacity-90">
              <view class="flex flex-row items-center gap-3">
                <view class="w-8 h-8 rounded-lg bg-white-20 flex items-center justify-center">
                  <AppIcon name="message" :size="20" :style="{ color: '#ffffff' }" />
                </view>
                <text class="text-white font-bold text-base">短信模板配置</text>
              </view>
              <text class="text-white text-lg">›</text>
        </view>
      </view>

      <!-- Logout Button -->
      <view class="mx-4 mt-4 mb-8">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import AppIcon from './Icons.vue';
import { authApi, setToken, setUserInfo, getUserInfo, isLoggedIn as checkLoggedIn, logout, submissionsApi, notificationsApi } from '../services/api';

// Props for QR code registration
const props = defineProps<{
  qrRegisterType?: 'user' | 'provider' | null;
}>();

const emit = defineEmits(['switch-role', 'login-success', 'view-submissions']);

const isLoggedIn = ref(false);
const userInfo = ref<any>(null);
const activeTab = ref<'login' | 'login-code' | 'register' | 'forgot'>('login');
const showPassword = ref(false);
const totalQuoteCount = ref(0);
const unreadCount = ref(0);
const agreed = ref(false);
const registerType = ref<'user' | 'provider'>('user');

// Watch for QR code register type from parent
watch(() => props.qrRegisterType, (newVal) => {
    if (newVal && !isLoggedIn.value) {
        console.log('QR register type received:', newVal);
        activeTab.value = 'register';
        registerType.value = newVal;
    }
}, { immediate: true });

// Computed properties for dynamic button text based on user role
const switchRoleButtonText = computed(() => {
    const role = userInfo.value?.role;
    if (role === 'sales') return '登录销售合伙人';
    if (role === 'provider') return '切换至服务商模式';
    return '申请成为服务商';
});

const switchRoleSubText = computed(() => {
    const role = userInfo.value?.role;
    if (role === 'sales') return '佣金/推广';
    if (role === 'provider') return '抢单/报价';
    return '开始赚钱';
});

// Verification state
const countDown = ref(0);
const isSending = ref(false);
let timer: any = null;

// Form Data
const loginForm = reactive({
  email: '',
  password: '',
  code: ''
});

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  code: ''
});

const forgotForm = reactive({
    email: '',
    code: '',
    password: ''
});

// Check login status on mount
onMounted(() => {
  isLoggedIn.value = checkLoggedIn();
  if (isLoggedIn.value) {
    userInfo.value = getUserInfo();
    fetchPendingQuotes();
    fetchNotifications();
  }
  // QR code register type is now handled by props and watch
});

const startCountDown = () => {
    countDown.value = 60;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        countDown.value--;
        if (countDown.value <= 0) {
            clearInterval(timer);
            countDown.value = 0;
        }
    }, 1000);
};

const handleSendCode = async (formType: 'register' | 'forgot' | 'login') => {
    let email = '';
    if (formType === 'register') email = registerForm.email;
    else if (formType === 'forgot') email = forgotForm.email;
    else if (formType === 'login') email = loginForm.email;

    if (!email) {
        uni.showToast({ title: '请填写邮箱', icon: 'none' });
        return;
    }
    
    // Check if code is needed for login (if user is trying to use code login but hasn't entered email yet, prompt email)
    
    isSending.value = true;
    try {
        await authApi.sendCode(email, formType === 'register' ? 'register' : (formType === 'login' ? 'login' : 'reset_password'));
        uni.showToast({ title: '验证码已发送', icon: 'success' });
        startCountDown();
    } catch (e: any) {
        uni.showToast({ title: e.message || '发送失败', icon: 'none' });
    } finally {
        isSending.value = false;
    }
};

const fetchNotifications = async () => {
    // ... same as before
    try {
        const res = await notificationsApi.getCount();
        unreadCount.value = res.count;
    } catch (e) { console.error(e) }
};
const fetchPendingQuotes = async () => {
    // ... same as before
    try {
        const res = await submissionsApi.getMySubmissions({ status: 'pending', size: 50 });
        let count = 0;
        if (res.submissions) res.submissions.forEach((s: any) => count += (s.quotes_count || 0));
        totalQuoteCount.value = count;
    } catch (e) { console.error(e) }
};

// Login Handler
const handleLogin = async () => {
  if (!agreed.value) {
      uni.showToast({ title: '请先阅读并同意协议', icon: 'none' });
      return;
  }

  const payload = activeTab.value === 'login-code'
      ? { email: loginForm.email, code: loginForm.code }
      : { email: loginForm.email, password: loginForm.password };

  if (!payload.email || (!payload.password && !payload.code)) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  
  uni.showLoading({ title: '登录中...' });
  try {
    const response = await authApi.login(payload);
    setToken(response.token);
    setUserInfo(response.user);
    isLoggedIn.value = true;
    userInfo.value = response.user;
    fetchPendingQuotes();
    fetchNotifications();
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    emit('login-success');
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '登录失败', icon: 'none' });
  }
};

// Register Handler
const handleRegister = async () => {
  if (!registerForm.email || !registerForm.password || !registerForm.code) {
    uni.showToast({ title: '请填写完整信息（含验证码）', icon: 'none' });
    return;
  }
  
  // Provider requires name and phone
  if (registerType.value === 'provider' && (!registerForm.name || !registerForm.phone)) {
      uni.showToast({ title: '服务商注册需填写姓名和手机号', icon: 'none' });
      return;
  }
  
  if (registerForm.password.length < 6) {
    uni.showToast({ title: '密码至少需要6位', icon: 'none' });
    return;
  }
  
  uni.showLoading({ title: '注册中...' });
  try {
    const role = registerType.value === 'provider' ? 'provider' : 'user' as 'user' | 'provider' | 'sales';
    const response = await authApi.register({
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name || registerForm.email.split('@')[0],
      phone: registerForm.phone || undefined,
      code: registerForm.code,
      role: role as 'user' | 'provider' | 'sales'
    });
    
    setToken(response.token);
    setUserInfo(response.user);
    isLoggedIn.value = true;
    userInfo.value = response.user;
    uni.hideLoading();
    uni.showToast({ title: '注册成功', icon: 'success' });
    
    // Provider: Redirect to apply page
    if (registerType.value === 'provider') {
        setTimeout(() => {
            uni.reLaunch({ url: '/pages/provider/apply' });
        }, 1000);
    } else {
        emit('login-success');
    }
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '注册失败', icon: 'none' });
  }
};

// Reset Password Handler
const handleResetPassword = async () => {
    if (!forgotForm.email || !forgotForm.code || !forgotForm.password) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
    }
    uni.showLoading({ title: '处理中...' });
    try {
        await authApi.resetPassword(forgotForm.email, forgotForm.code, forgotForm.password);
        uni.hideLoading();
        uni.showToast({ title: '重置成功，请登录', icon: 'success' });
        // Switch to login
        activeTab.value = 'login';
        loginForm.email = forgotForm.email;
        loginForm.password = '';
    } catch(e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '重置失败', icon: 'none' });
    }
}

// Google Login Handler (Mock)
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
                        
                        // Update Profile Page State
                        isLoggedIn.value = true;
                        userInfo.value = res.user;
                        fetchPendingQuotes();
                        fetchNotifications();
                        
                        uni.hideLoading();
                        uni.showToast({ title: '登录成功', icon: 'success' });
                        emit('login-success');
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

// Facebook Login Handler (Mock)
const handleFacebookLogin = () => {
    uni.showLoading({ title: '连接 Facebook...' });
    
    setTimeout(() => {
        const mockUser = {
            id: 'fb-' + Math.floor(Math.random() * 10000),
            email: 'fb@example.com',
            name: 'Facebook User',
            phone: '',
            role: 'user',
            credits: 50,
            avatar: ''
        };
        handleMockLoginSuccess(mockUser, 'mock-fb-token-');
    }, 1500);
};

// Helper for mock success
const handleMockLoginSuccess = (mockUser: any, tokenPrefix: string) => {
    const mockToken = tokenPrefix + Date.now();
    setToken(mockToken);
    setUserInfo(mockUser);
    isLoggedIn.value = true;
    userInfo.value = mockUser;
    
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    emit('login-success');
};

// WeChat Mini Program Login Handler (Mock)
const handleWeChatPhoneNumber = (e: any) => {
    if (!agreed.value) {
        uni.showToast({ title: '请先阅读并同意协议', icon: 'none' });
        return;
    }
    
    // In real MP, e.detail.code or e.detail.encryptedData is used
    console.log('WeChat Phone Number data:', e);
    
    if (e.detail?.errMsg && e.detail.errMsg.includes('fail')) {
        uni.showToast({ title: '您取消了授权', icon: 'none' });
        return;
    }

    uni.showLoading({ title: '微信登录中...' });
    
    // Mock Async Login
    setTimeout(() => {
        // Mock user from WeChat
        const mockUser = {
            id: 'wechat-' + Math.floor(Math.random() * 10000),
            email: '', // MP users often don't have email
            name: '微信用户',
            phone: '138****8888',
            role: 'user',
            credits: 0,
            avatar: ''
        };
        const mockToken = 'mock-wechat-token-' + Date.now();
        
        setToken(mockToken);
        setUserInfo(mockUser);
        isLoggedIn.value = true;
        userInfo.value = mockUser;
        
        uni.hideLoading();
        uni.showToast({ title: '登录成功', icon: 'success' });
        emit('login-success');
    }, 1500);
};

// Logout Handler
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout();
        isLoggedIn.value = false;
        userInfo.value = null;
        uni.showToast({ title: '已退出登录', icon: 'success' });
      }
    }
  });
};

// Standard Service Order Items
const STANDARD_ORDERS = [
  { name: '待付款', iconName: 'wallet', iconColor: '#F59E0B', bgColor: '#FFFBEB' },
  { name: '待上门', iconName: 'calendar', iconColor: '#3B82F6', bgColor: '#EFF6FF' },
  { name: '服务中', iconName: 'clock', iconColor: '#10B981', bgColor: '#ECFDF5' },
  { name: '待接单', iconName: 'clipboard', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
];

// Custom Service Order Items  
const CUSTOM_ORDERS = [
  { name: '寻找中', iconName: 'search', iconColor: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { name: '服务中', iconName: 'clipboard', iconColor: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  { name: '已完成', iconName: 'check-circle', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { name: '已取消', iconName: 'rotate-ccw', iconColor: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
];

// Menu Items
const MENU_ITEMS = [
  { name: '我的购物车', iconName: 'shopping-cart', iconColor: '#3b82f6' },
  { name: '地址管理', iconName: 'map-pin', iconColor: '#10b981' },
  { name: '收件箱', iconName: 'message', iconColor: '#0891b2' },
  { name: '我的评价', iconName: 'star', iconColor: '#eab308' },
  { name: '开具发票', iconName: 'file-text', iconColor: '#6b7280' },
  { name: '付款方式', iconName: 'banknote', iconColor: '#10b981' },
  { name: '设置', iconName: 'settings', iconColor: '#6b7280' },
];

const handleOrderClick = (item: any) => {
    let status = '';
    if (item.name === '寻找中') status = 'pending';
    else if (item.name === '服务中') status = 'processing';
    else if (item.name === '已完成') status = 'completed';
    else if (item.name === '已取消') status = 'cancelled';
    
    emit('view-submissions', status);
};

const handleSwitchRole = () => {
  const role = userInfo.value?.role;
  
  if (role === 'sales') {
    // Sales partner goes to sales dashboard
    uni.navigateTo({ url: '/pages/sales/dashboard' });
  } else if (role === 'provider') {
    // Provider switches to provider mode
    emit('switch-role');
  } else {
    // Regular user goes to provider application
    uni.navigateTo({ url: '/pages/provider/apply' });
  }
};

const handleMenuClick = (item: any) => {
    if (item.name === '收件箱') {
        uni.navigateTo({ url: '/pages/index/notifications' });
    } else if (item.name === '付款方式') {
        uni.navigateTo({ url: '/pages/index/payment-methods' });
    } else if (item.name === '地址管理') {
        uni.navigateTo({ url: '/pages/address/list' });
    } else if (item.name === '开具发票') {
        uni.navigateTo({ url: '/pages/index/invoices' });
    } else if (item.name === '我的购物车') {
        uni.navigateTo({ url: '/pages/cart/cart' });
    } else if (item.name === '我的评价') {
        uni.navigateTo({ url: '/pages/user/reviews' });
    } else if (item.name === '设置') {
        uni.navigateTo({ url: '/pages/user/settings' });
    } else {
        uni.showToast({ title: '功能开发中', icon: 'none' });
    }
};

const handleGoAdminFinance = () => {
    uni.navigateTo({ url: '/pages/admin/finance' });
};

const handleGoAdminSms = () => {
    uni.navigateTo({ url: '/pages/admin/sms-templates' });
};

const refreshData = () => {
    if (isLoggedIn.value) {
         userInfo.value = getUserInfo(); // Also refresh user info
         fetchNotifications();
         fetchPendingQuotes();
    }
};

defineExpose({ refreshData });
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.h-screen { height: 100vh; }
.bg-profile-gray { background-color: #f5f6fa; }

.header-gradient {
  background: linear-gradient(180deg, #047857 0%, #059669 100%);
}

.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-6 { padding-bottom: 24px; }
.pb-10 { padding-bottom: 40px; }
.pb-24 { padding-bottom: 96px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mx-4 { margin-left: 16px; margin-right: 16px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.-mt-2 { margin-top: -8px; }
.-mt-6 { margin-top: -24px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.points-card {
  background-color: #fef3c7;
}

.provider-btn {
  background: linear-gradient(90deg, #047857 0%, #059669 100%);
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #047857 0%, #059669 100%);
  color: #ffffff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 12px;
  gap: 12px;
}

.input-field {
  flex: 1;
  font-size: 15px;
  color: #1f2937;
  background: transparent;
}

.placeholder-text {
  color: #9ca3af;
}

.tab-active {
  border-bottom: 2px solid #059669;
}

.tab-inactive {
  border-bottom: 2px solid transparent;
}

.shadow-md {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bg-white { background-color: #ffffff; }
.bg-blue-100 { background-color: rgba(59, 130, 246, 0.15); }
.bg-white-20 { background-color: rgba(255, 255, 255, 0.2); }
.bg-emerald-600 { background-color: #059669; }

.text-white { color: #ffffff; }
.text-white-70 { color: rgba(255, 255, 255, 0.7); }
.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.text-gray-400 { color: #9ca3af; }
.text-gray-300 { color: #d1d5db; }
.text-emerald-600 { color: #059669; }

.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-base { font-size: 15px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-center { text-align: center; }

.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 16px; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }

.w-8 { width: 32px; }
.w-15 { width: 60px; }
.w-[100px] { width: 100px; }
.w-16 { width: 64px; }
.w-20 { width: 80px; }
.w-full { width: 100%; }
.h-8 { height: 32px; }
.h-15 { height: 60px; }
.h-16 { height: 64px; }
.h-20 { height: 80px; }
.h-full { height: 100%; }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }

.grid { display: grid; }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Updated Login Styles */
.terms-container {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
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
    background-color: #10b981; /* emerald-500 */
    border-color: #10b981;
}
.terms-text {
    font-size: 12px;
    color: #4b5563;
}
.link {
    color: #10b981;
}

.border-b { border-bottom-width: 1px; border-style: solid; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-emerald-200 { border-color: #a7f3d0; }
.border { border-width: 1px; border-style: solid; }

.relative { position: relative; }
.absolute { position: absolute; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }

.h-0.5 { height: 2px; }
.h-12 { height: 48px; }
.h-px { height: 1px; }

.mx-3 { margin-left: 12px; margin-right: 12px; }
.mx-8 { margin-left: 32px; margin-right: 32px; }
.pb-2 { padding-bottom: 8px; }
.pb-3 { padding-bottom: 12px; }
.pt-2 { padding-top: 8px; }

.bg-gray-100 { background-color: #f3f4f6; }
.bg-emerald-50 { background-color: #ecfdf5; }

.cursor-pointer { cursor: pointer; }

.overflow-hidden { overflow: hidden; }
.border-2 { border-width: 2px; }
.border-white { border-color: #ffffff; }
.border-b { border-bottom-width: 1px; }
.border-gray-50 { border-color: #f9fafb; }

.shadow-sm { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
