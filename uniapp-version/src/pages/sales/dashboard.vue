<template>
  <view class="dashboard-page">
    <!-- Header -->
    <view class="header-section">
      <!-- Decorative circles -->
      <view class="decorative-circle circle-1"></view>
      <view class="decorative-circle circle-2"></view>
      
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <AppIcon name="chevron-left" :size="32" color="white" :strokeWidth="2.5" />
        </view>
        <text class="page-title">销售合伙人</text>
      </view>
      
      <!-- User Info -->
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-text">{{ userInfo?.name?.[0] || 'S' }}</text>
        </view>
        <view class="user-details">
          <text class="user-name">{{ userInfo?.name }}</text>
          <text class="user-email">{{ userInfo?.email }}</text>
        </view>
      </view>
    </view>
    
    <!-- Stats Cards -->
    <view class="stats-container">
      <view class="stats-card">
        <view class="stat-item">
          <view class="stat-label">
            <text>💰</text>
            <text>总收益</text>
          </view>
          <text class="stat-value">${{ profile?.total_earnings || '0.00' }}</text>
        </view>
        
        <view class="stat-item border-h">
          <view class="stat-label">
            <text>💳</text>
            <text>可提现</text>
          </view>
          <text class="stat-value">${{ profile?.current_balance || '0.00' }}</text>
          <text class="withdraw-link" @click="showWithdrawModal = true">申请提现 →</text>
        </view>
        
        <view class="stat-item">
          <view class="stat-label">
            <text>👥</text>
            <text>服务商</text>
          </view>
          <text class="stat-value">{{ providers.length }}</text>
        </view>
      </view>
    </view>
    
    <!-- Tab Navigation -->
    <view class="tabs-nav">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </view>
    </view>
    
    <!-- Content Area -->
    <view class="content-area">
      
      <!-- Dashboard Tab -->
      <view v-if="activeTab === 'dashboard'" class="tab-content">
        <!-- Referral Link Card -->
        <view class="referral-card">
          <view class="card-header">
            <text class="icon">🔗</text>
            <text class="title">推广链接</text>
          </view>
          
          <view class="type-switch">
            <view 
              class="switch-item"
              :class="{ active: inviteType === 'provider' }"
              @click="inviteType = 'provider'"
            >
              服务商
            </view>
            <view 
              class="switch-item"
              :class="{ active: inviteType === 'user' }"
              @click="inviteType = 'user'"
            >
              用户
            </view>
          </view>
          
          <view class="link-box">
            {{ getReferralLink() }}
          </view>
          
          <view class="action-btn-row">
            <view class="copy-btn" @click="copyLink">
              {{ copied ? '✓ 已复制' : '📋 复制链接' }}
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <button class="share-btn" open-type="share">
              📤 分享卡片
            </button>
            <!-- #endif -->
          </view>
          
          <view class="invite-code-row">
            <text>邀请码:</text>
            <text class="code-text">{{ profile?.referral_code || '---' }}</text>
          </view>
        </view>
        
        <!-- Invite Form -->
        <view class="form-card">
          <view class="card-title-row">
            <text class="icon">📨</text>
            <text class="title">发送邀请</text>
          </view>
          
          <view class="invite-tabs">
            <view 
              class="invite-tab"
              :class="{ active: inviteType === 'provider' }"
              @click="inviteType = 'provider'"
            >
              邀请服务商
            </view>
            <view 
              class="invite-tab"
              :class="{ active: inviteType === 'user' }"
              @click="inviteType = 'user'"
            >
              邀请用户
            </view>
          </view>
          
          <view class="input-row">
            <input 
              type="text" 
              class="input-field"
              :placeholder="inviteType === 'provider' ? '服务商邮箱或手机号' : '用户邮箱或手机号'"
              v-model="inviteContact"
            />
            <view 
              class="send-btn"
              @click="handleInvite"
            >
              {{ inviteLoading ? '...' : '发送' }}
            </view>
          </view>
        </view>
        
        <!-- Promotion Settings -->
        <view class="form-card">
          <view class="card-title-row">
            <text class="icon">⚙️</text>
            <text class="title">推广策略配置</text>
          </view>
          <view class="setting-row">
            <view class="setting-info">
              <text class="setting-title">赠送新用户积分 (50分)</text>
              <text class="setting-desc">开启后，新用户通过您的链接注册将获得50积分。</text>
              <text class="setting-note">积分成本从余额扣除 ($0.50/人)</text>
            </view>
            <switch 
              :checked="profile?.bonus_enabled || false" 
              color="#10b981"
              @change="toggleBonus"
            />
          </view>
        </view>
      </view>
      
      <!-- Providers Tab -->
      <view v-if="activeTab === 'providers'" class="tab-content">
        <view class="list-card">
          <text class="list-title">我的服务商 ({{ providers.length }})</text>
          <view v-if="providers.length === 0" class="empty-state">
            暂无服务商
          </view>
          <view v-for="p in providers" :key="p.id" class="list-item">
            <view class="item-header">
              <view>
                <text class="item-name">{{ p.name }}</text>
                <text class="item-sub">{{ p.email || p.phone }}</text>
              </view>
              <view 
                class="status-badge"
                :class="p.status === 'active' ? 'status-active' : 'status-inactive'"
              >
                {{ p.status === 'active' ? '活跃' : p.status }}
              </view>
            </view>
            <text class="item-date">加入: {{ formatDate(p.created_at) }}</text>
          </view>
        </view>
      </view>
      
      <!-- Revenue Tab -->
      <view v-if="activeTab === 'revenue'" class="tab-content">
        <!-- Balance Card -->
        <view class="balance-card">
          <view>
            <text class="balance-label">可提现余额</text>
            <text class="balance-value">${{ profile?.current_balance || '0.00' }}</text>
          </view>
          <view class="withdraw-btn" @click="showWithdrawModal = true">
            申请提现
          </view>
        </view>

        <!-- Payment Methods Management -->
        <view class="list-card" style="margin-bottom: 16px;" @click="goToPaymentMethods">
          <view style="display: flex; justify-content: space-between; align-items: center;">
            <view style="display: flex; align-items: center; gap: 8px;">
               <text style="font-size: 18px;">💳</text>
               <text style="font-weight: bold; color: #1f2937;">收款账户管理</text>
            </view>
            <text style="color: #9ca3af; font-size: 18px;">›</text>
          </view>
        </view>
        
        <!-- Commission Logs -->
        <view class="list-card">
          <text class="list-title">佣金流水</text>
          <view v-if="logs.length === 0" class="empty-state">
            暂无佣金记录
          </view>
          <view v-for="log in logs" :key="log.id" class="log-item">
            <view>
              <text class="log-date">{{ formatDate(log.created_at) }}</text>
              <text class="log-detail">订单金额: ${{ log.order_amount }}</text>
            </view>
            <text class="log-amount">+${{ log.commission_amount }}</text>
          </view>
        </view>
      </view>
      
      <!-- Support Tab -->
      <view v-if="activeTab === 'support'" class="tab-content">
        <view class="list-card">
          <text class="list-title">工单列表</text>
          <view v-if="tickets.length === 0" class="empty-state">
            暂无工单
          </view>
          <view v-for="t in tickets" :key="t.id" class="list-item">
            <view class="item-header">
              <text class="item-name">{{ t.provider_name }}</text>
              <view 
                class="status-badge"
                :class="t.status === 'open' ? 'status-open' : 'status-resolved'"
              >
                {{ t.status }}
              </view>
            </view>
            <text class="item-desc">{{ t.subject }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Withdraw Modal -->
    <view v-if="showWithdrawModal" class="modal-overlay">
      <view class="modal-content">
        <text class="modal-title">申请提现</text>
        <view class="modal-body">
          <view class="modal-field">
            <text class="field-label">提现金额</text>
            <input 
              type="number" 
              class="field-input"
              v-model="withdrawAmount"
              placeholder="0.00"
            />
          </view>
          <view class="modal-note">
            提现通常需 1-3 个工作日审核。
          </view>
          <view class="modal-actions">
            <view class="action-btn cancel" @click="showWithdrawModal = false">
              取消
            </view>
            <view class="action-btn confirm" @click="handleWithdraw">
              确认提现
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Loading -->
    <view v-if="loading" class="loading-overlay">
      <view class="spinner"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { salesApi, getUserInfo, isLoggedIn } from '@/services/api';
import AppIcon from '@/components/Icons.vue';

const userInfo = ref<any>(null);
const profile = ref<any>(null);
const logs = ref<any[]>([]);
const providers = ref<any[]>([]);
const tickets = ref<any[]>([]);
const loading = ref(true);
const activeTab = ref('dashboard');
const copied = ref(false);
const inviteType = ref<'provider' | 'user'>('provider');
const inviteContact = ref('');
const inviteLoading = ref(false);
const showWithdrawModal = ref(false);
const withdrawAmount = ref('');

const tabs = [
  { key: 'dashboard', label: '总览' },
  { key: 'providers', label: '服务商' },
  { key: 'revenue', label: '收益' },
  { key: 'support', label: '工单' }
];

onMounted(async () => {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/index/index' });
    return;
  }
  
  userInfo.value = getUserInfo();
  await loadData();
});

// Share handler for WeChat Mini Program
onShareAppMessage(() => {
  const referralCode = profile.value?.referral_code;
  const path = `/pages/index/index?register=${inviteType.value}&ref=${referralCode || ''}`;
  console.log('Sharing path:', path);
  return {
    title: inviteType.value === 'provider' 
      ? '加入我们，成为优质服务商！' 
      : '优质家庭服务，一键预约！',
    path: path,
    imageUrl: 'https://via.placeholder.com/500x400?text=Join+Us'
  };
});

onShareTimeline(() => {
  const referralCode = profile.value?.referral_code;
  return {
    title: '加入我们，享受优质服务！',
    query: `register=${inviteType.value}&ref=${referralCode || ''}`
  };
});

const loadData = async () => {
  loading.value = true;
  try {
    const [pRes, cRes, prRes, tRes] = await Promise.all([
      salesApi.getProfile(),
      salesApi.getCommissions(),
      salesApi.getMyProviders(),
      salesApi.getTickets()
    ]);
    profile.value = pRes.profile;
    logs.value = cRes.logs || [];
    providers.value = prRes.providers || [];
    tickets.value = tRes.tickets || [];
  } catch (error: any) {
    console.error('Failed to load dashboard data:', error);
    // uni.showToast({ title: '加载失败', icon: 'none' }); 
    // Suppress error toast for now to check UI first, or check console for real error
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  uni.reLaunch({ url: '/pages/index/index?tab=profile' });
};

const getReferralLink = () => {
  if (!profile.value?.referral_code) return '';
  const baseUrl = 'https://fongbee-v1-h5.vercel.app/#';
  if (inviteType.value === 'user') {
    return `${baseUrl}/pages/index/index?register=user&ref=${profile.value.referral_code}`;
  }
  return `${baseUrl}/pages/index/index?register=provider&ref=${profile.value.referral_code}`;
};

const copyLink = () => {
  const link = getReferralLink();
  // #ifdef H5
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => {
      copied.value = true;
      uni.showToast({ title: '链接已复制', icon: 'success' });
      setTimeout(() => copied.value = false, 2000);
    });
  }
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: link,
    success: () => {
      copied.value = true;
      setTimeout(() => copied.value = false, 2000);
    }
  });
  // #endif
};

const handleInvite = async () => {
  if (!inviteContact.value) {
    uni.showToast({ title: '请输入联系方式', icon: 'none' });
    return;
  }
  inviteLoading.value = true;
  try {
    await salesApi.sendInvite(inviteContact.value, inviteType.value);
    uni.showToast({ title: '邀请发送成功', icon: 'success' });
    inviteContact.value = '';
  } catch (error: any) {
    uni.showToast({ title: error.message || '发送失败', icon: 'none' });
  } finally {
    inviteLoading.value = false;
  }
};

const toggleBonus = async (e: any) => {
  const enabled = e.detail.value;
  const prev = profile.value?.bonus_enabled;
  profile.value = { ...profile.value, bonus_enabled: enabled };
  try {
    await salesApi.updateSettings({ bonus_enabled: enabled });
  } catch (error) {
    uni.showToast({ title: '设置失败', icon: 'none' });
    profile.value = { ...profile.value, bonus_enabled: prev };
  }
};

const handleWithdraw = async () => {
  if (!withdrawAmount.value) {
    uni.showToast({ title: '请输入金额', icon: 'none' });
    return;
  }
  try {
    await salesApi.withdraw({ amount: Number(withdrawAmount.value), method: 'bank', account: 'Default' });
    uni.showToast({ title: '提现申请已提交', icon: 'success' });
    showWithdrawModal.value = false;
    withdrawAmount.value = '';
  } catch (error: any) {
    uni.showToast({ title: error.message || '提现失败', icon: 'none' });
  }
};

const goToPaymentMethods = () => {
  uni.navigateTo({ url: '/pages/index/payment-methods' });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #ecfdf5; /* emerald-50 */
  padding-bottom: 40px;
}

/* Header */
.header-section {
  background: linear-gradient(to right, #10b981, #059669); /* emerald-500 to emerald-600 */
  padding: calc(env(safe-area-inset-top) + 16px) 16px 32px;
  position: relative;
  overflow: hidden;
  color: white;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.decorative-circle {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}

.circle-2 {
  width: 90px;
  height: 90px;
  bottom: 0;
  left: 0;
  transform: translate(-50%, 50%);
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 4px; /* Reduced gap since button is now transparent */
  margin-bottom: 24px;
}

.back-btn {
  /* Removed circular background as requested */
  padding: 8px 8px 8px 0; /* Increase touch target */
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  color: white;
  font-size: 24px; /* Larger icon */
  font-weight: bold;
  font-family: sans-serif; /* Cleaner font */
}

.page-title {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.user-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Stats Cards */
.stats-container {
  padding: 0 16px;
  margin-top: -30px;
  position: relative;
  z-index: 10;
}

.stats-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.border-h {
  border-left: 1px solid #f3f4f6;
  border-right: 1px solid #f3f4f6;
}

.stat-label {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
}

.withdraw-link {
  font-size: 10px;
  color: #059669; /* emerald-600 */
  margin-top: 4px;
}

/* Tabs */
.tabs-nav {
  display: flex;
  padding: 0 16px;
  margin-top: 24px;
  gap: 8px;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #4b5563;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.tab-item.active {
  background-color: #059669; /* emerald-600 */
  color: white;
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);
}

/* Content Area */
.content-area {
  padding: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Referral Card */
.referral-card {
  background: linear-gradient(135deg, #059669, #047857); /* emerald-600 to emerald-700 */
  border-radius: 16px;
  padding: 16px;
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
}

.type-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.switch-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 12px;
  font-weight: bold;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.switch-item.active {
  background-color: white;
  color: #059669; /* emerald-600 */
}

.link-box {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  word-break: break-all;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.copy-btn {
  flex: 1;
  background-color: white;
  color: #059669; /* emerald-600 */
  text-align: center;
  padding: 12px 0;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  text-align: center;
  padding: 12px 0;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  line-height: normal;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

button.share-btn::after {
  border: none;
}

.invite-code-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
  font-size: 14px;
}

.code-text {
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 1px;
}

/* Form Cards */
.form-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.card-title-row .title {
  font-size: 16px;
  font-weight: bold;
  color: #111827;
}

.invite-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.invite-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  font-weight: bold;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.invite-tab.active {
  border-color: #10b981; /* emerald-500 */
  background-color: #d1fae5; /* emerald-100 */
  color: #065f46; /* emerald-800 */
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-field {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

.send-btn {
  background-color: #059669; /* emerald-600 */
  color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
}

/* Settings */
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 12px;
}

.setting-info {
  flex: 1;
  padding-right: 16px;
}

.setting-title {
  display: block;
  font-weight: bold;
  color: #111827;
  font-size: 14px;
}

.setting-desc {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.setting-note {
  display: block;
  color: #059669; /* emerald-600 */
  font-size: 12px;
  margin-top: 2px;
}

/* List Styles */
.list-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.list-title {
  display: block;
  font-weight: bold;
  color: #111827;
  margin-bottom: 16px;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: #9ca3af;
  font-size: 14px;
}

.list-item {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.list-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.item-name {
  font-weight: bold;
  color: #111827;
  font-size: 15px;
  display: block;
}

.item-sub {
  font-size: 12px;
  color: #6b7280;
  display: block;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.status-active, .status-resolved {
  background-color: #dcfce7;
  color: #15803d;
}

.status-inactive, .status-open {
  background-color: #fee2e2;
  color: #b91c1c;
}

.item-date, .item-desc {
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-top: 4px;
}

/* Balance & Logs */
.balance-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-label {
  display: block;
  font-size: 14px;
  color: #6b7280;
}

.balance-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #111827;
}

.withdraw-btn {
  background-color: #059669; /* emerald-600 */
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.log-date {
  font-size: 12px;
  color: #9ca3af;
  display: block;
}

.log-detail {
  font-size: 14px;
  color: #374151;
  display: block;
}

.log-amount {
  font-size: 16px;
  font-weight: bold;
  color: #059669; /* emerald-600 */
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  padding: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
  display: block;
  margin-bottom: 16px;
  text-align: center;
}

.modal-field {
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.field-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  box-sizing: border-box;
}

.modal-note {
  background-color: #fefce8;
  color: #854d0e;
  font-size: 12px;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  border-radius: 8px;
}

.action-btn.cancel {
  background-color: #f3f4f6;
  color: #4b5563;
}

.action-btn.confirm {
  background-color: #059669; /* emerald-600 */
  color: white;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f3f4f6;
  border-top-color: #059669; /* emerald-600 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
