<template>
  <view class="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
    <!-- Header -->
    <view class="bg-gradient-to-r from-orange-500 to-amber-500 text-white pt-12 pb-8 px-4 relative overflow-hidden">
      <!-- Decorative circles -->
      <view class="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -translate-y-1/2 translate-x-1/2"></view>
      <view class="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-10 translate-y-1/2 -translate-x-1/2"></view>
      
      <view class="flex items-center gap-3 mb-6">
        <view class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" @click="goBack">
          <text class="text-white text-lg">←</text>
        </view>
        <text class="text-lg font-bold">销售合伙人</text>
      </view>
      
      <!-- User Info -->
      <view class="flex items-center gap-4">
        <view class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <text class="text-2xl font-bold">{{ userInfo?.name?.[0] || 'S' }}</text>
        </view>
        <view>
          <text class="text-xl font-bold block">{{ userInfo?.name }}</text>
          <text class="text-white/80 text-sm">{{ userInfo?.email }}</text>
        </view>
      </view>
    </view>
    
    <!-- Stats Cards -->
    <view class="px-4 -mt-4">
      <view class="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-4">
        <view class="text-center">
          <view class="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <text>💰</text>
            <text>总收益</text>
          </view>
          <text class="text-xl font-bold text-gray-900">${{ profile?.total_earnings || '0.00' }}</text>
        </view>
        <view class="text-center border-l border-r border-gray-100">
          <view class="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <text>💳</text>
            <text>可提现</text>
          </view>
          <text class="text-xl font-bold text-gray-900">${{ profile?.current_balance || '0.00' }}</text>
          <text class="text-orange-500 text-xs block mt-1" @click="showWithdrawModal = true">申请提现 →</text>
        </view>
        <view class="text-center">
          <view class="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <text>👥</text>
            <text>服务商</text>
          </view>
          <text class="text-xl font-bold text-gray-900">{{ providers.length }}</text>
        </view>
      </view>
    </view>
    
    <!-- Tab Navigation -->
    <view class="flex px-4 mt-6 gap-2">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        class="flex-1 py-3 rounded-xl text-center text-sm font-bold transition-all"
        :class="activeTab === tab.key ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 shadow'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </view>
    </view>
    
    <!-- Content Area -->
    <view class="px-4 py-4">
      
      <!-- Dashboard Tab -->
      <view v-if="activeTab === 'dashboard'" class="space-y-4">
        <!-- Referral Link Card -->
        <view class="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white">
          <view class="flex items-center gap-2 mb-3">
            <text class="text-lg">🔗</text>
            <text class="font-bold">推广链接</text>
          </view>
          <view class="flex gap-2 mb-3">
            <view 
              class="flex-1 py-2 rounded-lg text-center text-xs font-bold"
              :class="inviteType === 'provider' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'"
              @click="inviteType = 'provider'"
            >
              服务商
            </view>
            <view 
              class="flex-1 py-2 rounded-lg text-center text-xs font-bold"
              :class="inviteType === 'user' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'"
              @click="inviteType = 'user'"
            >
              用户
            </view>
          </view>
          <view class="bg-white/10 rounded-lg p-3 text-xs break-all font-mono mb-3">
            {{ getReferralLink() }}
          </view>
          <view class="flex gap-2">
            <view class="flex-1 py-2 bg-white text-orange-600 rounded-lg text-center font-bold text-sm" @click="copyLink">
              {{ copied ? '✓ 已复制' : '📋 复制链接' }}
            </view>
          </view>
          <view class="flex justify-between items-center mt-3 pt-3 border-t border-white/20 text-sm">
            <text>邀请码:</text>
            <text class="font-bold text-lg tracking-wider">{{ profile?.referral_code || '---' }}</text>
          </view>
        </view>
        
        <!-- Invite Form -->
        <view class="bg-white rounded-2xl shadow p-4">
          <view class="flex items-center gap-2 mb-4">
            <text class="text-lg">📨</text>
            <text class="font-bold text-gray-900">发送邀请</text>
          </view>
          <view class="flex gap-2 mb-3">
            <view 
              class="flex-1 py-2 rounded-lg text-center text-sm font-bold border"
              :class="inviteType === 'provider' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-500'"
              @click="inviteType = 'provider'"
            >
              邀请服务商
            </view>
            <view 
              class="flex-1 py-2 rounded-lg text-center text-sm font-bold border"
              :class="inviteType === 'user' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-500'"
              @click="inviteType = 'user'"
            >
              邀请用户
            </view>
          </view>
          <view class="flex gap-2">
            <input 
              type="text" 
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm"
              :placeholder="inviteType === 'provider' ? '服务商邮箱或手机号' : '用户邮箱或手机号'"
              v-model="inviteContact"
            />
            <view 
              class="px-4 py-3 bg-orange-500 text-white font-bold rounded-xl text-sm"
              @click="handleInvite"
            >
              {{ inviteLoading ? '...' : '发送' }}
            </view>
          </view>
        </view>
        
        <!-- Promotion Settings -->
        <view class="bg-white rounded-2xl shadow p-4">
          <view class="flex items-center gap-2 mb-4">
            <text class="text-lg">⚙️</text>
            <text class="font-bold text-gray-900">推广策略配置</text>
          </view>
          <view class="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <view class="flex-1">
              <text class="font-bold text-gray-900 block">赠送新用户积分 (50分)</text>
              <text class="text-xs text-gray-500 block mt-1">开启后，新用户通过您的链接注册将获得50积分。</text>
              <text class="text-xs text-orange-600 block">积分成本从余额扣除 ($0.50/人)</text>
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
      <view v-if="activeTab === 'providers'" class="space-y-3">
        <view class="bg-white rounded-2xl shadow p-4">
          <text class="font-bold text-gray-900 block mb-4">我的服务商 ({{ providers.length }})</text>
          <view v-if="providers.length === 0" class="text-center py-8 text-gray-400">
            暂无服务商
          </view>
          <view v-for="p in providers" :key="p.id" class="py-4 border-b border-gray-100 last:border-0">
            <view class="flex items-center justify-between">
              <view>
                <text class="font-bold text-gray-900 block">{{ p.name }}</text>
                <text class="text-xs text-gray-500">{{ p.email || p.phone }}</text>
              </view>
              <view 
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ p.status === 'active' ? '活跃' : p.status }}
              </view>
            </view>
            <text class="text-xs text-gray-400 mt-1 block">加入: {{ formatDate(p.created_at) }}</text>
          </view>
        </view>
      </view>
      
      <!-- Revenue Tab -->
      <view v-if="activeTab === 'revenue'" class="space-y-4">
        <!-- Balance Card -->
        <view class="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
          <view>
            <text class="text-gray-500 text-sm block">可提现余额</text>
            <text class="text-2xl font-bold text-gray-900">${{ profile?.current_balance || '0.00' }}</text>
          </view>
          <view class="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm" @click="showWithdrawModal = true">
            申请提现
          </view>
        </view>
        
        <!-- Commission Logs -->
        <view class="bg-white rounded-2xl shadow p-4">
          <text class="font-bold text-gray-900 block mb-4">佣金流水</text>
          <view v-if="logs.length === 0" class="text-center py-8 text-gray-400">
            暂无佣金记录
          </view>
          <view v-for="log in logs" :key="log.id" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <view>
              <text class="text-gray-500 text-xs">{{ formatDate(log.created_at) }}</text>
              <text class="text-gray-700 block">订单金额: ${{ log.order_amount }}</text>
            </view>
            <text class="text-orange-600 font-bold">+${{ log.commission_amount }}</text>
          </view>
        </view>
      </view>
      
      <!-- Support Tab -->
      <view v-if="activeTab === 'support'" class="space-y-3">
        <view class="bg-white rounded-2xl shadow p-4">
          <text class="font-bold text-gray-900 block mb-4">工单列表</text>
          <view v-if="tickets.length === 0" class="text-center py-8 text-gray-400">
            暂无工单
          </view>
          <view v-for="t in tickets" :key="t.id" class="py-4 border-b border-gray-100 last:border-0">
            <view class="flex items-center justify-between mb-2">
              <text class="font-bold text-gray-900">{{ t.provider_name }}</text>
              <view 
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="t.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
              >
                {{ t.status }}
              </view>
            </view>
            <text class="text-gray-600 text-sm">{{ t.subject }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Withdraw Modal -->
    <view v-if="showWithdrawModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <view class="bg-white rounded-2xl w-full max-w-sm p-6">
        <text class="text-xl font-bold text-gray-900 block mb-4">申请提现</text>
        <view class="space-y-4">
          <view>
            <text class="text-sm font-medium text-gray-700 block mb-1">提现金额</text>
            <input 
              type="number" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl"
              v-model="withdrawAmount"
              placeholder="0.00"
            />
          </view>
          <view class="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-xl">
            提现通常需 1-3 个工作日审核。
          </view>
          <view class="flex gap-3">
            <view class="flex-1 py-3 rounded-xl text-center text-gray-600 font-bold bg-gray-100" @click="showWithdrawModal = false">
              取消
            </view>
            <view class="flex-1 py-3 rounded-xl text-center text-white font-bold bg-orange-500" @click="handleWithdraw">
              确认提现
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Loading -->
    <view v-if="loading" class="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
      <view class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></view>
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
  return `${baseUrl}/pages/provider/apply?ref=${profile.value.referral_code}`;
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
  return new Date(dateStr).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
