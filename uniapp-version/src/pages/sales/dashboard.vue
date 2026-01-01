<template>
  <view class="dashboard-page">
    <!-- Header -->
    <view class="header-section">
      <!-- Decorative circles -->
      <view class="decorative-circle circle-1"></view>
      <view class="decorative-circle circle-2"></view>
      
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
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
              color="#f97316"
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
import { salesApi, getUserInfo, isLoggedIn } from '@/services/api';

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
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  uni.navigateBack();
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #fff7ed; /* orange-50 */
  padding-bottom: 40px;
}

/* Header */
.header-section {
  background: linear-gradient(to right, #10b981, #059669); /* emerald-500 to emerald-600 */
  padding: 48px 16px 32px;
  position: relative;
  overflow: hidden;
  color: white;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

/* ... (keep circle styles same as they are white transparent) ... */

.dashboard-page {
  min-height: 100vh;
  background-color: #ecfdf5; /* emerald-50 */
  padding-bottom: 40px;
}

/* ... */

.withdraw-link {
  font-size: 10px;
  color: #059669; /* emerald-600 */
  margin-top: 4px;
}

/* Tabs */
/* ... */

.tab-item.active {
  background-color: #059669; /* emerald-600 */
  color: white;
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);
}

/* Referral Card */
.referral-card {
  background: linear-gradient(135deg, #059669, #047857); /* emerald-600 to emerald-700 */
  border-radius: 16px;
  padding: 16px;
  color: white;
}

/* ... */

.switch-item.active {
  background-color: white;
  color: #059669; /* emerald-600 */
}

/* ... */

.copy-btn {
  flex: 1;
  background-color: white;
  color: #059669; /* emerald-600 */
  text-align: center;
  padding: 10px 0;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
}

/* ... */

.invite-tab.active {
  border-color: #10b981; /* emerald-500 */
  background-color: #d1fae5; /* emerald-100 */
  color: #065f46; /* emerald-800 */
}

/* ... */

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
/* ... */

.setting-note {
  display: block;
  color: #059669; /* emerald-600 */
  font-size: 12px;
  margin-top: 2px;
}

/* ... */

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

/* ... */

.withdraw-btn {
  background-color: #059669; /* emerald-600 */
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
}

/* ... */

.log-amount {
  font-size: 16px;
  font-weight: bold;
  color: #059669; /* emerald-600 */
}

/* ... */

.action-btn.confirm {
  background-color: #059669; /* emerald-600 */
  color: white;
}

/* Loading */
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
