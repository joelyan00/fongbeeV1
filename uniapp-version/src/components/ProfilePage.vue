<template>
  <view class="min-h-screen bg-profile-gray" style="padding-bottom: 150px;">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-page-container flex flex-col min-h-screen bg-white relative">
      
      <!-- #ifdef MP-WEIXIN -->
      <!-- ================= WECHAT MINI PROGRAM LAYOUT ================= -->
      <view class="flex-1 flex flex-col relative overflow-hidden bg-login-gradient">
        <!-- Background Elements (Optional soft glows) -->
        <view class="absolute -top-20 -left-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50"></view>
        <view class="absolute top-1/2 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-30"></view>

        <!-- Top Spacing & Navigation -->
        <view :style="{ height: statusBarHeight + 'px' }"></view>
        <view class="flex flex-row items-center px-4" :style="{ height: navBarHeight + 'px' }">
          <view v-if="mpMode === 'phone'" @click="mpMode = 'welcome'" class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm active-opacity-70">
             <AppIcon name="chevron-left" :size="24" color="#3D8E63" />
          </view>
        </view>

        <!-- Identity Area -->
        <view class="flex-1 flex flex-col items-center justify-center -mt-10 px-8">
          
          <!-- WELCOME MODE -->
          <template v-if="mpMode === 'welcome'">
            <!-- Logo -->
            <view class="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100" style="background-color: #3D8E63;">
               <view class="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center">
                  <text class="text-white text-3xl font-black">优</text>
               </view>
            </view>
            
            <text class="text-2xl font-bold text-slate-800 mb-2">登录优服佳</text>
            <text class="text-sm text-slate-400 font-medium mb-12">优质居家服务 就上优服佳</text>

            <!-- Buttons -->
            <button 
              class="w-full h-14 rounded-full bg-[#3D8E63] flex items-center justify-center text-white text-lg font-bold border-none mb-6 shadow-lg shadow-emerald-100 active-opacity-90"
              open-type="getPhoneNumber" 
              @getphonenumber="handleUnifiedWeChatLogin"
            >
              手机号一键快捷登录
            </button>
            
            <view class="text-center mb-8">
              <text class="text-sm text-slate-400">或者使用 </text>
              <text class="text-sm text-[#3D8E63] font-bold px-1" @click="mpMode = 'phone'">手机号注册/登录</text>
            </view>

            <!-- Agreement Area -->
            <view class="flex flex-row items-center justify-center gap-2">
              <view 
                class="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all"
                @click="agreed = !agreed"
                :style="{ 
                  backgroundColor: agreed ? '#3D8E63' : '#ffffff', 
                  borderColor: agreed ? '#3D8E63' : '#9ca3af',
                  borderWidth: '1.5px',
                  borderStyle: 'solid'
                }"
              >
                <AppIcon v-if="agreed" name="check" :size="8" color="#ffffff" />
              </view>
              <text class="text-xs text-slate-400">
                选中表示同意 <text class="text-slate-900 font-bold px-1" @click.stop="viewAgreement('service-agreement')">《服务协议》</text> 和 <text class="text-slate-900 font-bold px-1" @click.stop="viewAgreement('privacy-policy')">《隐私政策》</text>
              </text>
            </view>
          </template>

          <!-- MANUAL PHONE MODE -->
          <template v-else-if="mpMode === 'phone'">
            <view class="w-full">
               <text class="text-2xl font-bold text-slate-800 mb-2 block">手机号注册/登录</text>
               <text class="text-sm text-slate-400 block mb-8">验证码将发送至您的手机</text>
               
               <!-- Phone Input -->
               <view class="mb-4 bg-white rounded-2xl border border-slate-100 flex items-center px-4 h-14 shadow-sm">
                 <AppIcon name="user" :size="20" color="#94a3b8" />
                 <input 
                   class="flex-1 ml-3 text-slate-800 text-lg" 
                   type="number" 
                   placeholder="请输入手机号" 
                   placeholder-class="text-slate-300"
                   v-model="registerForm.phone"
                   maxlength="15"
                 />
               </view>

               <!-- Code Input -->
               <view class="mb-4 bg-white rounded-2xl border border-slate-100 flex items-center px-4 h-14 shadow-sm">
                 <AppIcon name="lock" :size="20" color="#94a3b8" />
                 <input 
                   class="flex-1 ml-3 text-slate-800 text-lg" 
                   type="number" 
                   placeholder="请输入验证码" 
                   placeholder-class="text-slate-300"
                   v-model="registerForm.code"
                   maxlength="6"
                 />
                 <button 
                   class="bg-transparent border-none text-[#3D8E63] text-sm font-bold min-w-[80px]"
                   :disabled="countDown > 0 || isSending"
                   @click="handleSendMPPhoneCode"
                 >
                   {{ countDown > 0 ? countDown + 's' : '获取验证码' }}
                 </button>
               </view>

               <!-- Invite Code Input (Optional) -->
               <view class="mb-8 bg-white rounded-2xl border border-slate-100 flex items-center px-4 h-14 shadow-sm">
                 <AppIcon name="ticket" :size="20" color="#94a3b8" />
                 <input 
                   class="flex-1 ml-3 text-slate-800 text-lg" 
                   type="text" 
                   placeholder="邀请码 (选填)" 
                   placeholder-class="text-slate-300"
                   v-model="registerForm.inviteCode"
                 />
               </view>

               <!-- Login Button -->
               <button 
                 class="w-full h-14 rounded-full bg-[#3D8E63] flex items-center justify-center text-white text-lg font-bold border-none mb-8 shadow-lg shadow-emerald-100 active-opacity-90"
                 @click="handleMPPhoneLogin"
               >
                 登录 / 注册
               </button>

               <!-- Agreement Area -->
               <view class="flex flex-row items-center justify-center gap-2 mb-6">
                 <view 
                   class="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all"
                   @click="agreed = !agreed"
                   :style="{ 
                     backgroundColor: agreed ? '#3D8E63' : '#ffffff', 
                     borderColor: agreed ? '#3D8E63' : '#9ca3af',
                     borderWidth: '1.5px',
                     borderStyle: 'solid'
                   }"
                 >
                   <AppIcon v-if="agreed" name="check" :size="8" color="#ffffff" />
                 </view>
                 <text class="text-xs text-slate-400">
                   选中表示同意 <text class="text-slate-900 font-bold px-1" @click.stop="viewAgreement('service-agreement')">《服务协议》</text> 和 <text class="text-slate-900 font-bold px-1" @click.stop="viewAgreement('privacy-policy')">《隐私政策》</text>
                 </text>
               </view>
            </view>
          </template>
        </view>

        <!-- Benefits Footer -->
        <view class="pb-12 px-6" style="margin-top: -90px;">
          <view class="flex flex-row items-center justify-center gap-2 mb-6">
            <view class="h-[1px] w-12 bg-slate-100"></view>
            <text class="text-xs text-slate-300 font-medium">登录后您将获得以下权益</text>
            <view class="h-[1px] w-12 bg-slate-100"></view>
          </view>
          
          <view class="flex flex-row justify-between items-start">
            <view class="flex flex-col items-center gap-2">
              <view class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <AppIcon name="file-text" :size="20" color="#3D8E63" />
              </view>
              <text class="text-[10px] text-slate-500 font-medium">免费发布</text>
            </view>
            <view class="flex flex-col items-center gap-2">
              <view class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <AppIcon name="shield" :size="20" color="#3D8E63" />
              </view>
              <text class="text-[10px] text-slate-500 font-medium">优质信息</text>
            </view>
            <view class="flex flex-col items-center gap-2">
              <view class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <AppIcon name="zap" :size="20" color="#3D8E63" />
              </view>
              <text class="text-[10px] text-slate-500 font-medium">快速联系</text>
            </view>
            <view class="flex flex-col items-center gap-2">
              <view class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <AppIcon name="headphones" :size="20" color="#3D8E63" />
              </view>
              <text class="text-[10px] text-slate-500 font-medium">专属客服</text>
            </view>
          </view>
        </view>
      </view>
      <!-- #endif -->

      <!-- #ifndef MP-WEIXIN -->
      <!-- ================= H5 ORIGINAL LAYOUT (RESTORED) ================= -->
      <view class="login-container w-full h-full bg-white relative overflow-y-auto">
        <!-- Green Header (Compact) -->
        <view class="header-gradient pt-custom px-4 pb-12">
          <view class="flex flex-row justify-end gap-4 py-2">
            <view class="w-8 h-8 flex items-center justify-center cursor-pointer" @click="emit('close')">
               <AppIcon name="home" :size="22" color="#ffffff" />
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
        <view class="mx-4 -mt-10 bg-white rounded-2xl p-6 shadow-md mb-8">
          
          <!-- Login Sub-Tabs (Password vs Code) -->
          <view v-if="activeTab === 'login' || activeTab === 'login-code'" class="flex flex-row mb-5 bg-slate-50 p-1 rounded-xl">
            <view 
              class="flex-1 text-center py-2 cursor-pointer transition-all rounded-lg"
              :class="activeTab === 'login' ? 'bg-white shadow-sm' : ''"
              @click="activeTab = 'login'"
            >
              <text class="text-sm" :class="activeTab === 'login' ? 'text-[#3D8E63] font-bold' : 'text-slate-400'">密码登录</text>
            </view>
            <view 
              class="flex-1 text-center py-2 cursor-pointer transition-all rounded-lg"
              :class="activeTab === 'login-code' ? 'bg-white shadow-sm' : ''"
              @click="activeTab = 'login-code'"
            >
              <text class="text-sm" :class="activeTab === 'login-code' ? 'text-[#3D8E63] font-bold' : 'text-slate-400'">验证码登录</text>
            </view>
          </view>

          <!-- Mode: LOGIN (Password) -->
          <view v-if="activeTab === 'login'" class="form-section">
            <view class="input-group mb-4">
              <AppIcon name="mail" :size="18" color="#94a3b8" />
              <input 
                v-model="loginForm.email" 
                class="input-field" 
                placeholder="请输入邮箱" 
                placeholder-class="placeholder-text"
              />
            </view>
            <view class="input-group mb-2" style="position: relative;">
              <AppIcon name="lock" :size="18" color="#94a3b8" />
              <input 
                v-model="loginForm.password" 
                class="input-field" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码" 
                placeholder-class="placeholder-text"
                style="padding-right: 40px;"
              />
              <view class="password-toggle" @click.stop="showPassword = !showPassword">
                   <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="18" color="#94a3b8" />
               </view>
            </view>

            <view class="flex flex-row justify-end mb-6">
                <text class="text-xs text-[#3D8E63] font-medium" @click="activeTab = 'forgot'">忘记密码？</text>
            </view>
            
            <view class="terms-container mb-4">
                 <view class="checkbox" :class="{ 'checkbox-checked': agreed }" @click="agreed = !agreed" :style="{ backgroundColor: agreed ? '#3D8E63' : '#fff', borderColor: agreed ? '#3D8E63' : '#cbd5e1' }">
                      <AppIcon v-if="agreed" name="check" :size="8" color="#fff" />
                 </view>
                 <text class="text-[11px] text-slate-400">
                   登录代表同意 <text class="text-slate-900 font-bold px-0.5" @click.stop="viewAgreement('service-agreement')">《服务协议》</text> 和 <text class="text-slate-900 font-bold px-0.5" @click.stop="viewAgreement('privacy-policy')">《隐私政策》</text>
                 </text>
            </view>

            <button class="login-btn h-12 rounded-xl text-white font-bold bg-[#3D8E63] w-full" @click="handleLogin">登录</button>
          </view>
          
          <!-- Mode: LOGIN (Code) -->
          <view v-else-if="activeTab === 'login-code'" class="form-section">
               <view class="input-group mb-4">
                  <AppIcon name="mail" :size="18" color="#94a3b8" />
                  <input 
                    v-model="loginForm.email" 
                    class="input-field" 
                    placeholder="请输入邮箱" 
                    placeholder-class="placeholder-text"
                  />
                </view>
                <view class="flex flex-row gap-2 mb-6">
                    <view class="input-group flex-1">
                      <AppIcon name="key" :size="18" color="#94a3b8" />
                      <input 
                        v-model="loginForm.code" 
                        class="input-field" 
                        placeholder="验证码" 
                        type="number"
                        placeholder-class="placeholder-text"
                      />
                    </view>
                    <button 
                      class="bg-emerald-50 text-[#3D8E63] text-xs font-bold rounded-xl px-2 w-[100px] h-12 flex items-center justify-center border border-emerald-100"
                      :disabled="countDown > 0 || isSending"
                      @click="handleSendCode('login')"
                    >
                      {{ countDown > 0 ? `${countDown}s` : '获取验证码' }}
                    </button>
                </view>

                <view class="terms-container mb-4">
                     <view class="checkbox" :class="{ 'checkbox-checked': agreed }" @click="agreed = !agreed" :style="{ backgroundColor: agreed ? '#3D8E63' : '#fff', borderColor: agreed ? '#3D8E63' : '#cbd5e1' }">
                          <AppIcon v-if="agreed" name="check" :size="8" color="#fff" />
                     </view>
                     <text class="text-[11px] text-slate-400">
                       登录代表同意 <text class="text-slate-900 font-bold px-0.5" @click.stop="viewAgreement('service-agreement')">《服务协议》</text> 和 <text class="text-slate-900 font-bold px-0.5" @click.stop="viewAgreement('privacy-policy')">《隐私政策》</text>
                     </text>
                </view>

                <button class="login-btn h-12 rounded-xl text-white font-bold bg-[#3D8E63] w-full" @click="handleLogin">登录</button>
          </view>

          <!-- Mode: REGISTER -->
          <view v-else-if="activeTab === 'register'" class="form-section pt-2">
            <!-- Register Type Tabs -->
            <view class="flex flex-row mb-5 bg-slate-50 p-1 rounded-xl">
              <view 
                class="flex-1 text-center py-2 cursor-pointer transition-all rounded-lg"
                :class="registerType === 'user' ? 'bg-white shadow-sm' : ''"
                @click="registerType = 'user'"
              >
                <text class="text-sm" :class="registerType === 'user' ? 'text-[#3D8E63] font-bold' : 'text-slate-400'">普通用户</text>
              </view>
              <view 
                class="flex-1 text-center py-2 cursor-pointer transition-all rounded-lg"
                :class="registerType === 'provider' ? 'bg-white shadow-sm' : ''"
                @click="registerType = 'provider'"
              >
                <text class="text-sm" :class="registerType === 'provider' ? 'text-[#3D8E63] font-bold' : 'text-slate-400'">服务商注册</text>
              </view>
            </view>

            <!-- Provider: Show Name and Phone -->
            <view v-if="registerType === 'provider'">
              <view class="input-group mb-4">
                <AppIcon name="user" :size="18" color="#94a3b8" />
                <input 
                  v-model="registerForm.name" 
                  class="input-field" 
                  placeholder="真实姓名" 
                  placeholder-class="placeholder-text"
                />
              </view>
              <view class="input-group mb-4">
                 <AppIcon name="phone" :size="18" color="#94a3b8" />
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
              <AppIcon name="mail" :size="18" color="#94a3b8" />
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
                  <AppIcon name="key" :size="18" color="#94a3b8" />
                  <input 
                    v-model="registerForm.code" 
                    class="input-field" 
                    placeholder="邮箱验证码" 
                    type="number"
                    placeholder-class="placeholder-text"
                  />
                </view>
                <button 
                  class="bg-emerald-50 text-[#3D8E63] text-xs font-bold rounded-xl px-2 w-[100px] h-12 flex items-center justify-center border border-emerald-100"
                  :disabled="countDown > 0 || isSending"
                  @click="handleSendCode('register')"
                >
                  {{ countDown > 0 ? `${countDown}s` : '获取验证码' }}
                </button>
            </view>

            <view class="input-group mb-4" style="position: relative;">
              <AppIcon name="lock" :size="18" color="#94a3b8" />
              <input 
                v-model="registerForm.password" 
                class="input-field" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="设置密码（至少6位）" 
                placeholder-class="placeholder-text"
                style="padding-right: 40px;"
              />
              <view class="password-toggle" @click.stop="showPassword = !showPassword">
                   <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="18" color="#94a3b8" />
               </view>
            </view>
            
            <view class="terms-container mb-6">
              <view class="checkbox" :class="{ 'checkbox-checked': agreed }" @click="agreed = !agreed" :style="{ backgroundColor: agreed ? '#3D8E63' : '#fff', borderColor: agreed ? '#3D8E63' : '#cbd5e1' }">
                   <AppIcon v-if="agreed" name="check" :size="8" color="#fff" />
              </view>
              <text class="text-[11px] text-slate-400">
                我阅读并接受 <text class="text-slate-900 font-bold px-0.5" @click.stop="viewAgreement('service-agreement')">《服务协议》</text> 和 <text class="text-slate-900 font-bold px-0.5" @click.stop="viewAgreement('privacy-policy')">《隐私政策》</text>
              </text>
            </view>

            <button class="login-btn h-12 rounded-xl text-white font-bold bg-[#3D8E63] w-full" @click="handleRegister">
              {{ registerType === 'provider' ? '下一步' : '立即注册' }}
            </button>
          </view>

          <!-- Mode: FORGOT PASSWORD -->
          <view v-else-if="activeTab === 'forgot'" class="form-section pt-2">
              <view class="input-group mb-4">
                <AppIcon name="mail" :size="18" color="#94a3b8" />
                <input 
                  v-model="forgotForm.email" 
                  class="input-field" 
                  placeholder="请输入注册邮箱" 
                  placeholder-class="placeholder-text"
                />
              </view>
    
              <view class="flex flex-row gap-2 mb-4">
                  <view class="input-group flex-1">
                    <AppIcon name="key" :size="18" color="#94a3b8" />
                    <input 
                      v-model="forgotForm.code" 
                      class="input-field" 
                      placeholder="验证码" 
                      type="number"
                      placeholder-class="placeholder-text"
                    />
                  </view>
                  <button 
                    class="bg-emerald-50 text-[#3D8E63] text-xs font-bold rounded-xl px-2 w-[100px] h-12 flex items-center justify-center border border-emerald-100"
                    :disabled="countDown > 0 || isSending"
                    @click="handleSendCode('forgot')"
                  >
                    {{ countDown > 0 ? `${countDown}s` : '获取验证码' }}
                  </button>
              </view>
    
              <view class="input-group mb-4" style="position: relative;">
                <AppIcon name="lock" :size="18" color="#94a3b8" />
                <input 
                  v-model="forgotForm.password" 
                  class="input-field" 
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="设置新密码" 
                  placeholder-class="placeholder-text"
                  style="padding-right: 40px;"
                />
                <view class="password-toggle" @click.stop="showPassword = !showPassword">
                     <AppIcon :name="showPassword ? 'eye' : 'eye-off'" :size="18" color="#94a3b8" />
                 </view>
              </view>
              
              <button class="login-btn h-12 rounded-xl text-white font-bold bg-[#3D8E63] w-full" @click="handleResetPassword">重设密码</button>
          </view>
          
          <!-- Social Login & Footer Toggle -->
          <view class="mt-6">
              <!-- Social Login (Only in Login Mode) -->
              <view v-if="activeTab === 'login' || activeTab === 'login-code'" class="mb-4">
                  <view class="flex flex-row items-center mb-4">
                      <view class="flex-1 h-px bg-slate-100"></view>
                      <text class="mx-3 text-[10px] text-slate-400">快捷登录</text>
                      <view class="flex-1 h-px bg-slate-100"></view>
                  </view>
                  <view class="flex flex-row gap-4 justify-center">
                      <view class="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center active:bg-slate-50 shadow-sm" @click="handleGoogleLogin">
                          <AppIcon name="google" :size="24" />
                      </view>
                      <view class="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center active:bg-slate-50 shadow-sm" @click="handleAppleLogin">
                           <AppIcon name="apple" :size="24" color="#000000" />
                      </view>
                  </view>
              </view>

              <!-- Bottom Toggle Link -->
              <view class="text-center pt-2">
                  <template v-if="activeTab === 'register'">
                      <text class="text-slate-400 text-sm">已有账号？</text>
                      <text class="text-[#3D8E63] text-sm font-bold ml-1 cursor-pointer" @click="activeTab = 'login'">立即登录</text>
                  </template>
                  <template v-else-if="activeTab === 'forgot'">
                      <text class="text-slate-400 text-sm">想起密码了？</text>
                      <text class="text-[#3D8E63] text-sm font-bold ml-1 cursor-pointer" @click="activeTab = 'login'">返回登录</text>
                  </template>
                  <template v-else>
                       <text class="text-slate-400 text-sm">还没有账号？</text>
                      <text class="text-[#3D8E63] text-sm font-bold ml-1 cursor-pointer" @click="activeTab = 'register'">立即注册</text>
                  </template>
              </view>
          </view>
        </view>
      </view>
      <!-- #endif -->

    </view>

    <!-- 已登录状态 -->
    <view v-else style="background-color: #f5f6fa; min-height: 100vh; width: 100%; display: flex; flex-direction: column;">
      <!-- Green Header (Rectangle Block) -->
      <view class="px-4" style="background-color: #3D8E63; padding-bottom: 50px;" :style="{paddingTop: statusBarHeight + 'px'}">
        <!-- Top Icons (Settings Only to keep clean) -->
        <view class="flex flex-row justify-end gap-4" style="display: flex !important; flex-direction: row !important; align-items: center; justify-content: flex-end;" :style="{height: navBarHeight + 'px', paddingRight: (capsuleWidth + 10) + 'px'}">
          <view class="w-8 h-8 flex items-center justify-center" @click="handleMenuClick({ name: '设置' })">
            <AppIcon name="settings" :size="22" color="#ffffff" />
          </view>
        </view>
      </view>
      
      <!-- User Info Card -->
      <view class="mx-4 -mt-10 bg-white rounded-2xl p-5 shadow-soft flex flex-row items-center gap-4 relative z-10 border border-slate-50" style="display: flex !important; flex-direction: row !important; align-items: center !important; background-color: #ffffff !important; margin-top: -40px !important;">
        <view class="avatar-wrapper shadow-sm" style="width: 64px; height: 64px; border-radius: 999px; overflow: hidden; border: 2px solid #ffffff; background-color: #f8fafc; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" style="width: 100%; height: 100%;" />
          <view v-else class="avatar-placeholder" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #ecfdf5;">
             <AppIcon name="user" :size="32" :style="{ color: '#3D8E63' }" />
          </view>
        </view>
        <view class="flex flex-col flex-1" style="display: flex !important; flex-direction: column !important; flex: 1;">
          <text class="text-slate-900 text-xl font-bold" style="color: #0f172a; font-size: 20px; font-weight: bold;">{{ userInfo?.name || '用户' }}</text>
          <text class="text-slate-400 text-sm mt-0.5" style="color: #94a3b8; font-size: 14px;">{{ userInfo?.email || '未绑定邮箱' }}</text>
        </view>
        
        <!-- Credits Badge (Synced with H5 style) -->
        <view class="credits-badge-h5" @click="handleMenuClick({ name: '我的积分' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; background-color: #F0FDF4 !important; border: 1px solid #DCFCE7; padding: 6px 14px; border-radius: 99px;">
          <AppIcon name="wallet" :size="14" :style="{ color: '#3D8E63' }" />
          <text class="credits-text-h5 ml-1" style="color: #3D8E63; font-weight: 800; font-size: 15px; margin-left: 4px;">{{ userInfo?.credits || 0 }}</text>
        </view>
      </view>



      <!-- Standard Service Orders -->
      <view class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm" style="margin: 16px 20px !important; background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f9fafb;">
        <view class="flex flex-row items-center justify-between mb-4" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 16px;">
          <text class="text-lg font-bold text-gray-900" style="font-size: 18px; font-weight: 700; color: #111827;">标准服务订单</text>
          <view class="flex flex-row items-center" @click="goToUserOrders" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
            <text class="text-gray-400 text-sm" style="color: #9ca3af; font-size: 14px;">全部</text>
            <text class="text-gray-400 ml-1" style="color: #9ca3af; margin-left: 4px;">›</text>
          </view>
        </view>
        
        <view class="grid-cols-4 grid gap-4" style="display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 16px !important;">
          <view v-for="(item, idx) in STANDARD_ORDERS" :key="idx" class="flex flex-col items-center gap-2" @click="handleStandardOrderClick(item)" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <view 
              class="w-14 h-14 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: item.bgColor, width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }"
            >
              <AppIcon :name="item.iconName" :size="28" :style="{ color: item.iconColor }" />
            </view>
            <text class="text-sm text-gray-700 text-center font-medium" style="font-size: 14px; color: #374151; text-align: center; font-weight: 500;">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- Custom Service Orders -->
      <view class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm" style="margin: 16px 20px !important; background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f9fafb;">
        <view class="flex flex-row items-center justify-between mb-4" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 16px;">
          <text class="text-lg font-bold text-gray-900" style="font-size: 18px; font-weight: 700; color: #111827;">定制服务订单</text>
          <view class="flex flex-row items-center" @click="emit('view-submissions', '', 'custom')" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
            <text class="text-gray-400 text-sm" style="color: #9ca3af; font-size: 14px;">全部</text>
            <text class="text-gray-400 ml-1" style="color: #9ca3af; margin-left: 4px;">›</text>
          </view>
        </view>
        
        <view class="grid-cols-4 grid gap-4" style="display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 16px !important;">
          <view v-for="(item, idx) in CUSTOM_ORDERS" :key="idx" class="flex flex-col items-center gap-2" @click="handleOrderClick(item)" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <view 
              class="w-14 h-14 rounded-full flex items-center justify-center relative"
              :style="{ backgroundColor: item.bgColor, width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }"
            >
              <AppIcon :name="item.iconName" :size="28" :style="{ color: item.iconColor }" />
              
              <!-- Badge for Quote Count -->
              <view 
                v-if="item.name === '寻找中' && totalQuoteCount > 0" 
                class="absolute -top-2 -right-2 bg-red-600 text-white font-bold px-1 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
                style="position: absolute; top: -8px; right: -8px; min-width: 24px; height: 24px; line-height: 20px; font-size: 14px; background: #dc2626; color: #fff; font-weight: 700; border-radius: 50%; border: 2px solid #fff;"
              >
                {{ totalQuoteCount }}
              </view>
            </view>
            <text class="text-sm text-gray-700 text-center font-medium" style="font-size: 14px; color: #374151; text-align: center; font-weight: 500;">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- Menu Groups -->
      <view class="mx-4 mt-4 space-y-4">
        <!-- Group 1: AI, Cart, Address -->
        <view class="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-50" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column;">
          <view class="menu-item" @click="handleMenuClick({ name: 'AI 智能助手' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px; border-bottom: 1px solid #F1F5F9;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="bot" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">AI 智能助手</text>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
          </view>
          <view class="menu-item" @click="handleMenuClick({ name: '我的购物车' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px; border-bottom: 1px solid #F1F5F9;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="shopping-cart" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">我的购物车</text>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
          </view>
          <view class="menu-item no-border" @click="handleMenuClick({ name: '地址管理' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="map-pin" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">地址管理</text>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
          </view>
        </view>

        <!-- Group 2: Inbox, Refund -->
        <view class="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-50" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column;">
          <view class="menu-item" @click="handleMenuClick({ name: '收件箱' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px; border-bottom: 1px solid #F1F5F9;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="message" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">收件箱</text>
            </view>
            <view class="flex items-center" style="display: flex; flex-direction: row; align-items: center;">
              <view v-if="unreadCount > 0" class="unread-badge" style="background-color: #EF4444; color: #ffffff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 99px; display: flex; align-items: center; justify-content: center; margin-right: 8px; padding: 0 4px;">{{ unreadCount }}</view>
              <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
            </view>
          </view>
          <view class="menu-item no-border" @click="handleMenuClick({ name: '退款/售后' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="headphones" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">退款/售后</text>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
          </view>
        </view>

        <!-- Group 3: Invoice, Payment, Settings (Added to match H5) -->
        <view class="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-50" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column;">
          <view class="menu-item" @click="handleMenuClick({ name: '开具发票' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px; border-bottom: 1px solid #F1F5F9;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="file-text" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">开具发票</text>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
          </view>
          <view class="menu-item" @click="handleMenuClick({ name: '付款方式' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px; border-bottom: 1px solid #F1F5F9;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="banknote" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">付款方式</text>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
          </view>
          <view class="menu-item no-border" @click="handleMenuClick({ name: '设置' })" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 18px 20px;">
            <view class="menu-item-left" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
              <AppIcon name="settings" :size="20" :style="{ color: '#3D8E63' }" />
              <text class="menu-item-text" style="font-size: 15px; color: #1E293B; font-weight: 600; margin-left: 14px;">设置</text>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#D1D5DB" />
          </view>
        </view>
      </view>

      <!-- CTA Section: Apply to be Provider (Fixed Gradient) -->
      <view class="mx-4 mt-6 cta-card-premium shadow-lg" style="background: linear-gradient(135deg, #3D8E63 0%, #2f6d4c 100%); border-radius: 20px; padding: 20px; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" @click="handleSwitchRole">
        <view class="cta-left-content" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
          <view class="cta-icon-box" style="background-color: rgba(255, 255, 255, 0.2); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 14px;">
            <AppIcon :name="userInfo?.role === 'provider' ? 'zap' : (userInfo?.role === 'sales' ? 'users' : 'briefcase')" :size="22" color="#ffffff" />
          </view>
          <view class="flex flex-col ml-1" style="display: flex; flex-direction: column;">
             <text class="cta-title-text" style="color: #ffffff; font-weight: bold; font-size: 17px;">{{ switchRoleButtonText }}</text>
             <text class="text-white-70 text-xs" style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">{{ switchRoleSubText }}</text>
          </view>
        </view>
        <view class="cta-action-btn" style="background-color: rgba(0, 0, 0, 0.15); padding: 8px 14px; border-radius: 12px; display: flex !important; flex-direction: row !important; align-items: center !important; gap: 4px;">
          <text class="cta-btn-label" style="color: #ffffff; font-size: 13px; font-weight: bold;">{{ switchRoleButtonText.includes('申请') ? '开始赚钱' : '立即进入' }}</text>
          <AppIcon name="chevron-right" :size="12" color="#ffffff" />
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

      <!-- Logout button removed - now in Settings page -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import AppIcon from './Icons.vue';
import { authApi, setToken, setUserInfo, getUserInfo, isLoggedIn as checkLoggedIn, logout, submissionsApi, notificationsApi } from '../services/api';

// Props for QR code registration and custom redirect
const props = defineProps<{
  qrRegisterType?: 'user' | 'provider' | null;
  customRedirectUrl?: string;
  inviteContact?: string;
  inviteRef?: string;
  isModal?: boolean;
  referralToken?: string;
}>();

const emit = defineEmits(['switch-role', 'login-success', 'view-submissions', 'view-article', 'close', 'open-ai']);

const isLoggedIn = ref(false);
const userInfo = ref<any>(null);
const activeTab = ref<'login' | 'login-code' | 'register' | 'forgot'>('login');
const showPassword = ref(false);
const totalQuoteCount = ref(0);
const unreadCount = ref(0);
const agreed = ref(false);
const registerType = ref<'user' | 'provider'>('user');
const tempUserInfo = ref<any>(null);

// #ifdef MP-WEIXIN
const mpMode = ref<'welcome' | 'phone'>('welcome');
// #endif

// Header Metrics (Mini Program Capsule Alignment)
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const initHeaderMetrics = () => {
    // #ifdef MP-WEIXIN
    const sysInfo = uni.getSystemInfoSync();
    statusBarHeight.value = sysInfo.statusBarHeight || 44;
    
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    capsuleWidth.value = sysInfo.windowWidth - menuButtonInfo.left + 10;

    // navBarHeight = (capsule.top - statusBarHeight) * 2 + capsule.height
    navBarHeight.value = (menuButtonInfo.top - statusBarHeight.value) * 2 + menuButtonInfo.height;
    // #endif

    // Fallbacks for H5
    // #ifdef H5
    statusBarHeight.value = 0;
    navBarHeight.value = 54;
    capsuleWidth.value = 87; // Mock for search/home placement
    // #endif
};

// Initial pre-fill logic
const handlePreFill = async () => {
    if (isLoggedIn.value) return;

    // 1. Prioritize resolving short link if token is provided
    if (props.referralToken) {
        try {
            const res = await authApi.resolveReferral(props.referralToken);
            if (res.phone) {
                if (res.phone.includes('@')) {
                    loginForm.email = res.phone;
                    registerForm.email = res.phone;
                } else {
                    registerForm.phone = res.phone;
                }
            }
            if (res.inviteRef) {
                registerForm.inviteCode = res.inviteRef;
            }
            // Consume the link after resolving
            await authApi.consumeReferral(props.referralToken);
        } catch (e) {
            console.error('Failed to resolve referral token:', e);
        }
    }

    // 2. Fallback to direct parameters if token not provided or missing data
    if (props.inviteRef && !registerForm.inviteCode) {
        registerForm.inviteCode = props.inviteRef;
    }

    if (props.inviteContact) {
        const contact = props.inviteContact;
        if (contact.includes('@')) {
            if (!loginForm.email) loginForm.email = contact;
            if (!registerForm.email) registerForm.email = contact;
        } else {
            if (!registerForm.phone) registerForm.phone = contact;
        }
    }

    if (props.qrRegisterType) {
        activeTab.value = 'register';
        registerType.value = props.qrRegisterType;
    }
};

// Watch for referral parameters from parent
watch([() => props.qrRegisterType, () => props.inviteContact, () => props.inviteRef, () => props.referralToken], () => {
    handlePreFill();
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
  code: '',
  inviteCode: ''
});

const forgotForm = reactive({
    email: '',
    code: '',
    password: ''
});

// Check login status on mount
onMounted(() => {
  initHeaderMetrics();
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

// #ifdef MP-WEIXIN
const handleSendMPPhoneCode = async () => {
    if (!registerForm.phone) {
        uni.showToast({ title: '请填写手机号', icon: 'none' });
        return;
    }
    // Strip any non-digit characters (spaces, dashes, etc.)
    const purePhone = registerForm.phone.replace(/\D/g, '');
    
    // Relaxed validation to support both China (11 digits) and North America (10 digits)
    if (!/^\d{10,11}$/.test(purePhone)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' });
        return;
    }

    isSending.value = true;
    try {
        await authApi.sendPhoneCode(purePhone, 'register');
        uni.showToast({ title: '验证码已发送', icon: 'success' });
        startCountDown();
    } catch (e: any) {
        uni.showToast({ title: e.message || '发送失败', icon: 'none' });
    } finally {
        isSending.value = false;
    }
};

const handleMPPhoneLogin = async () => {
  if (!registerForm.phone || !registerForm.code) {
    uni.showToast({ title: '请填写手机号和验证码', icon: 'none' });
    return;
  }
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意用户协议', icon: 'none' });
    return;
  }

  // Use the same cleaned phone number as when sending the code
  const purePhone = registerForm.phone.replace(/\D/g, '');

  uni.showLoading({ title: '登录中...' });
  try {
    // We assume the login endpoint handles phone + code as combined register/login
    const response = await authApi.login({
      phone: purePhone,
      code: registerForm.code,
      inviteCode: registerForm.inviteCode || undefined
    });
    setToken(response.token);
    setUserInfo(response.user);
    isLoggedIn.value = true;
    userInfo.value = response.user;
    fetchPendingQuotes();
    fetchNotifications();
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    redirectByRole(response.user.role);
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '登录失败', icon: 'none' });
  }
};
// #endif

const fetchNotifications = async () => {
    // ... same as before
    try {
        const res = await notificationsApi.getCount('user');
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

// Role-based redirection after login
const redirectByRole = (role: string) => {
  // If custom redirect URL is provided, use it
  if (props.customRedirectUrl) {
    uni.redirectTo({ url: props.customRedirectUrl });
    return;
  }
  
  switch(role) {
    case 'provider':
      // Redirect immediately to provider dashboard
      uni.reLaunch({ url: '/pages/index/index?view=provider' });
      break;
    case 'sales':
      // Redirect immediately to sales dashboard
      uni.reLaunch({ url: '/pages/sales/dashboard' });
      break;
    default: // 'user' - stay on profile page
      emit('login-success');
  }
};

// Login Handler
const handleLogin = async () => {
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
    
    // Redirect based on user role
    redirectByRole(response.user.role);
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
      inviteCode: registerForm.inviteCode || undefined,
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

// Google Login Handler
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
                        const googlePayload = { 
                            code: response.code,
                            // Prioritize URL parameters if available, otherwise use form values
                            phone: props.inviteContact && !props.inviteContact.includes('@') ? props.inviteContact : (registerForm.phone || undefined),
                            inviteCode: props.inviteRef || (registerForm.inviteCode || undefined)
                        };
                        const res = await authApi.googleLogin(googlePayload);
                        setToken(res.token);
                        setUserInfo(res.user);
                        
                        // Update Profile Page State
                        isLoggedIn.value = true;
                        userInfo.value = res.user;
                        fetchPendingQuotes();
                        fetchNotifications();
                        
                        uni.hideLoading();
                        uni.showToast({ title: '登录成功', icon: 'success' });
                        redirectByRole(res.user.role);
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
                
                isLoggedIn.value = true;
                userInfo.value = res.user;
                fetchPendingQuotes();
                fetchNotifications();
                
                uni.hideLoading();
                uni.showToast({ title: '登录成功', icon: 'success' });
                redirectByRole(res.user.role);
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

const handleWechatJump = () => {
    const miniProgramUrlScheme = "weixin://dl/business/?t=T6x2Z3E6W4v"; 
    // #ifdef H5
    window.location.href = miniProgramUrlScheme;
    // #endif
    // #ifndef H5
    uni.showToast({ title: '请在手机浏览器中使用', icon: 'none' });
    // #endif
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
    redirectByRole(mockUser.role);
};

// Unified WeChat Login & Phone Auth (One-Click Flow)
const handleUnifiedWeChatLogin = async (e: any) => {
    if (!agreed.value) {
        uni.showToast({ title: '请先阅读并同意协议', icon: 'none' });
        return;
    }

    if (e.detail?.errMsg && e.detail.errMsg.includes('fail')) {
        console.error('WeChat Phone Auth Error:', e.detail.errMsg);
        
        // Developer Bypass: If no permission (common on personal accounts), allow mock testing
        if (e.detail.errMsg.includes('no permission')) {
            uni.showModal({
                title: '开发测试提示',
                content: '检测到您当前的小程序账号没有“一键登录”权限（通常需企业认证）。是否切换到“手动模式”来输入您的手机号并接收短信？',
                success: (res) => {
                    if (res.confirm) {
                        // Switch to manual input mode so the user can enter real phone/code
                        mpMode.value = 'phone';
                    }
                }
            });
            return;
        }

        uni.showToast({ title: '您取消了手机号授权', icon: 'none' });
        return;
    }

    const phoneCode = e.detail.code;
    if (!phoneCode) return;

    uni.showLoading({ title: '正在登录...' });
    
    // Step 1: Get Identity Code
    uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
            try {
                // Step 2: Call Step 1 API (Get or Link OpenID)
                const authRes = await authApi.wechatMiniLogin(loginRes.code);
                
                if (!authRes.isNewUser && authRes.token && authRes.user) {
                    // Scenario A: User already exists, linked to this WeChat
                    setToken(authRes.token);
                    setUserInfo(authRes.user);
                    isLoggedIn.value = true;
                    userInfo.value = authRes.user;
                    refreshData();
                    uni.hideLoading();
                    uni.showToast({ title: '欢迎回来', icon: 'success' });
                    redirectByRole(authRes.user.role);
                } else {
                    // Scenario B: New user or identity confirmed, proceed to auto-register with phone
                    const openid = authRes.openid || '';
                    
                    const regRes = await authApi.wechatMiniRegister({
                        openid: openid,
                        phoneCode: phoneCode,
                        userInfo: tempUserInfo.value,
                        inviteCode: registerForm.inviteCode || undefined
                    });

                    setToken(regRes.token);
                    setUserInfo(regRes.user);
                    isLoggedIn.value = true;
                    userInfo.value = regRes.user;
                    refreshData();
                    
                    uni.hideLoading();
                    uni.showToast({ title: '登录成功', icon: 'success' });
                    redirectByRole(regRes.user.role);
                }
            } catch (err: any) {
                uni.hideLoading();
                uni.showToast({ title: err.message || '登录失败', icon: 'none' });
            }
        },
        fail: (err) => {
            uni.hideLoading();
            uni.showToast({ title: '获取微信身份失败', icon: 'none' });
            console.error(err);
        }
    });
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
  { name: '待付款', iconName: 'wallet', iconColor: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { name: '待上门', iconName: 'calendar', iconColor: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { name: '服务中', iconName: 'clock', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { name: '待评价', iconName: 'star', iconColor: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
];

// Custom Service Order Items  
const CUSTOM_ORDERS = reactive([
  { name: '寻找中', iconName: 'search', iconColor: '#3B82F6', bgColor: '#EFF6FF' },
  { name: '待确认', iconName: 'clipboard-check', iconColor: '#8B5CF6', bgColor: '#F5F3FF' }, // New
  { name: '服务中', iconName: 'clock', iconColor: '#F59E0B', bgColor: '#FFFBEB' },
  { name: '待评价', iconName: 'star', iconColor: '#10B981', bgColor: '#ECFDF5' }, // Was Completed
]);

const MENU_ITEMS = [
  // These items are now hardcoded in the template, but keeping the array for potential future use or if other parts of the app still reference it.
  // For this specific change, the array itself is not directly used in the template anymore.
  // { name: 'AI 智能助手', iconName: 'bot', iconColor: '#059669' },
  // { name: '我的购物车', iconName: 'shopping-cart', iconColor: '#3b82f6' },
  // { name: '地址管理', iconName: 'map-pin', iconColor: '#10b981' },
  // { name: '收件箱', iconName: 'message', iconColor: '#0891b2' },
  // { name: '退款/售后', iconName: 'headphones', iconColor: '#ef4444' },
  // { name: '我的评价', iconName: 'star', iconColor: '#eab308' },
  // { name: '开具发票', iconName: 'file-text', iconColor: '#6b7280' },
  // { name: '付款方式', iconName: 'banknote', iconColor: '#10b981' },
  // { name: '设置', iconName: 'settings', iconColor: '#6b7280' },
];

const handleOrderClick = (item: any) => {
    let status = '';
    if (item.name === '寻找中') status = 'pending';
    else if (item.name === '待确认') status = 'pending_confirm'; // Custom frontend status
    else if (item.name === '服务中') status = 'processing';
    else if (item.name === '待评价') status = 'to_review'; // Custom frontend status
    
    emit('view-submissions', status, 'custom');
};

const handleStandardOrderClick = (item: any) => {
    // Navigate to new user orders page
    let tab = 'all';
    if (item.name === '待付款') tab = 'pending_payment';
    else if (item.name === '待上门') tab = 'pending_service';
    else if (item.name === '服务中') tab = 'in_progress';
    else if (item.name === '待评价') tab = 'completed';
    
    uni.navigateTo({ url: `/pages/user/orders?tab=${tab}` });
};

const viewAgreement = (slug: string) => {
    emit('view-article', { slug });
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

const goToUserOrders = () => {
    uni.navigateTo({ url: '/pages/user/orders' });
};

const handleMenuClick = (item: any) => {
    if (item.name === 'AI 智能助手') {
        uni.navigateTo({ url: '/pages/user/ai-chat' });
    } else if (item.name === '收件箱') {
        uni.navigateTo({ url: '/pages/user/inbox' });
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
    } else if (item.name === '我的积分') {
        uni.showToast({ title: '功能开发中', icon: 'none' });
    } else if (item.name === '退款/售后') {
        uni.navigateTo({ url: '/pages/user/after-sales' });
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

<style>
/* Layout Utilities */
.flex { display: flex !important; }
.flex-1 { flex: 1 !important; }
.flex-row { flex-direction: row !important; }
.flex-col { flex-direction: column !important; }
.items-center { align-items: center !important; }
.justify-between { justify-content: space-between !important; }
.justify-center { justify-content: center !important; }
.justify-end { justify-content: flex-end !important; }

/* Spacing */
.mx-4 { margin-left: 16px !important; margin-right: 16px !important; }
.mt-4 { margin-top: 16px !important; }
.mt-6 { margin-top: 24px !important; }
.mb-4 { margin-bottom: 16px !important; }
.-mt-10 { margin-top: -40px !important; }
.p-4 { padding: 16px !important; }
.p-5 { padding: 20px !important; }
.gap-4 { gap: 16px !important; }

/* Header & Base */
page { background-color: #f5f6fa !important; }
.header-rectangle-mp { background-color: #3D8E63 !important; }
.header-gradient { background: linear-gradient(180deg, #3D8E63 0%, #2f6d4c 100%) !important; }

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

  /* Social Icons */
  .social-icons {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
  }
  .social-icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .icon-circle {
    width: 52px;
    height: 52px;
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
  .social-btn-label {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
  }


.logout-btn {
  width: 100%;
  height: 56px;
  background: #ffffff;
  color: #ef4444;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 56px;
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
.rounded-2xl { border-radius: 20px; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }

.w-8 { width: 32px; }
.w-14 { width: 56px; }
.w-15 { width: 60px; }
.w-16 { width: 64px; }
.w-20 { width: 80px; }
.w-full { width: 100%; }
.h-8 { height: 32px; }
.h-14 { height: 56px; }
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
.grid-cols-5 { grid-template-columns: repeat(5, 1fr); }

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

/* Cards & Surface */
.bg-white { background-color: #ffffff !important; }
.rounded-2xl { border-radius: 20px !important; }
.shadow-soft { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important; }
.overflow-hidden { overflow: hidden !important; }
.border-slate-50 { border: 1px solid #f8fafc !important; }

/* User Profile Specifics */
.avatar-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50% !important;
  border: 2px solid #ffffff !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  background-color: #F8FAFC !important;
}

.avatar-img {
  width: 100% !important;
  height: 100% !important;
}

.avatar-placeholder {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.credits-badge-h5 {
  background-color: #F0FDF4 !important;
  padding: 6px 14px !important;
  border-radius: 12px !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  border: 1px solid #DCFCE7 !important;
}

.credits-text-h5 {
  font-size: 15px !important;
  color: #3D8E63 !important;
  font-weight: 800 !important;
}

.space-y-4 > view + view {
  margin-top: 16px !important;
}

/* Menu Items */
.menu-item {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 18px 20px !important;
  border-bottom: 1px solid #F1F5F9 !important;
  background-color: #ffffff !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.menu-item:active {
  background-color: #F8FAFC !important;
}

.menu-item.no-border {
  border-bottom: none !important;
}

.menu-item-left {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  flex: 1 !important;
}

.menu-item-text {
  font-size: 15px !important;
  color: #1E293B !important;
  font-weight: 600 !important;
  margin-left: 14px !important;
}

.unread-badge {
  background-color: #EF4444 !important;
  color: #ffffff !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  min-width: 18px !important;
  height: 18px !important;
  border-radius: 99px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-right: 8px !important;
  padding: 0 4px !important;
}

/* CTA Card */
.cta-card-premium {
  background: linear-gradient(135deg, #3D8E63 0%, #2f6d4c 100%) !important;
  border-radius: 20px !important;
  padding: 20px !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  box-shadow: 0 10px 20px rgba(61, 142, 99, 0.2) !important;
}

.cta-left-content {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 14px !important;
}

.cta-icon-box {
  width: 40px !important;
  height: 40px !important;
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.cta-title-text {
  color: #ffffff !important;
  font-size: 17px !important;
  font-weight: 700 !important;
}

.cta-action-btn {
  background-color: rgba(0, 0, 0, 0.15) !important;
  border-radius: 12px !important;
  padding: 10px 16px !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 6px !important;
}

.cta-btn-label {
  color: #ffffff !important;
  font-size: 13px !important;
  font-weight: 700 !important;
}


.mascot-frame-premium {
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* Robust Flex and Layout Utilities for MP */
.flex { display: flex !important; }
.flex-row { flex-direction: row !important; }
.flex-col { flex-direction: column !important; }
.flex-1 { flex: 1 !important; }
.items-center { align-items: center !important; }
.justify-center { justify-content: center !important; }
.justify-between { justify-content: space-between !important; }
.justify-end { justify-content: flex-end !important; }

.menu-item {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 18px 20px !important;
  border-bottom: 1px solid #F1F5F9 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.menu-item-left {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 14px !important;
}

.cta-card-premium {
  border-radius: 20px;
  padding: 20px;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.text-white-90 { color: rgba(255, 255, 255, 0.9); }
</style>

<style>
/* Global background and base styles for WeChat Mini Program */
page {
  background-color: #f5f6fa !important;
}

/* Ensure common layout classes work globally in MP */
.flex { display: flex !important; }
.flex-row { flex-direction: row !important; }
.flex-col { flex-direction: column !important; }
.items-center { align-items: center !important; }
.justify-between { justify-content: space-between !important; }
</style>
