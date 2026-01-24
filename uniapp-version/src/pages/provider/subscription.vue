<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <view class="header-center-column">
        <text class="header-title">等级与订阅</text>
        <text class="header-subtitle">管理您的会员权益与积分</text>
      </view>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Tab Switch (Floating Card) -->
    <view class="tabs-container">
      <view class="tabs-row">
        <view 
          @click="activeTab = 'credits'"
          :class="['tab-item', activeTab === 'credits' ? 'tab-active' : '']"
        >
          <text :class="['tab-label', activeTab === 'credits' ? 'tab-label-active' : '']">购买积分</text>
        </view>
        <view 
          @click="activeTab = 'membership'"
          :class="['tab-item', activeTab === 'membership' ? 'tab-active' : '']"
        >
          <text :class="['tab-label', activeTab === 'membership' ? 'tab-label-active' : '']">会员服务</text>
        </view>
      </view>
    </view>

    <!-- Content Area -->
    <scroll-view scroll-y class="content-scroll" :style="{ height: contentHeight }">
      
      <!-- Credits Tab Content -->
      <view v-if="activeTab === 'credits'" class="content-padding">
        
        <!-- Credits Card -->
        <view class="credits-card">
          <view class="credits-bg"></view>
          <view class="credits-content">
            <view class="credits-text-col">
              <text class="credits-label">当前可用积分</text>
              <text class="credits-value">{{ creditBalance.total }}</text>
              <view v-if="creditBalance.listings > 0" class="credits-tag">
                <text class="credits-tag-text">剩余 {{ creditBalance.listings }} 次上架配额</text>
              </view>
            </view>

            <view class="buy-btn" @click="openRechargeModal">
              <text class="buy-btn-text">立即充值</text>
            </view>
          </view>
        </view>

        <!-- Function Tabs -->
        <view class="sub-tabs">
          <view 
            @click="creditsSubTab = 'auto'" 
            :class="['sub-tab-item', creditsSubTab === 'auto' ? 'sub-tab-active' : '']"
          >
            <text :class="['sub-tab-text', creditsSubTab === 'auto' ? 'sub-tab-text-active' : '']">自动充值</text>
          </view>
          <view 
            @click="creditsSubTab = 'history'" 
            :class="['sub-tab-item', creditsSubTab === 'history' ? 'sub-tab-active' : '']"
          >
            <text :class="['sub-tab-text', creditsSubTab === 'history' ? 'sub-tab-text-active' : '']">积分记录</text>
          </view>
        </view>

        <!-- Auto Recharge Settings -->
        <view v-if="creditsSubTab === 'auto'" class="settings-group">
          
          <!-- Auto Buy Setting -->
          <view class="setting-card">
            <view class="setting-header">
              <view class="setting-title-wrap">
                <text class="setting-title">自动购买积分</text>
                <text class="setting-desc">{{ isSubscriptionUser ? '订阅用户无法开启此功能' : `积分低于设定值时自动由卡扣费补充` }}</text>
              </view>
              <switch 
                :checked="autoBuy" 
                :disabled="isSubscriptionUser"
                @change="handleAutoBuyToggle" 
                color="#10b981" 
                style="transform:scale(0.8)"
              />

            </view>
            
            <view v-if="autoBuy && !isSubscriptionUser" class="setting-body">
              <view class="input-wrap">
                <text class="input-label">单次充值积分</text>
                <input 
                  v-model="autoBuyAmount"
                  type="number" 
                  placeholder="请输入积分数量" 
                  class="setting-input"
                  placeholder-class="input-placeholder"
                />
              </view>
              <text class="input-hint mb-4">建议设置为 {{ creditConfigs.credits_per_cad }} 的整数倍，最低 {{ creditConfigs.credits_per_cad }} 积分</text>

              <view class="input-wrap mt-4">
                <text class="input-label">触发充值阈值</text>
                <input 
                  v-model="autoBuyThreshold"
                  type="number" 
                  placeholder="当积分低于此值时充值" 
                  class="setting-input"
                  placeholder-class="input-placeholder"
                />
              </view>
              <text class="input-hint">当您的可用积分低于该设定值时，系统将自动发起充值</text>
            </view>
            
            <view v-if="isSubscriptionUser" class="setting-body">
                <text class="subscription-hint-text">自动充值功能仅对积分制用户开放。作为订阅会员，您每月已获得固定配额。如配额不足，请手动充值。</text>
            </view>
          </view>

          <!-- Gift Setting -->
          <view class="setting-card">
            <view class="setting-header">
              <view class="setting-title-wrap">
                <text class="setting-title">积分赠送设置</text>
                <text class="setting-desc">用户分享并成交后赠送</text>
              </view>
              <switch :checked="giftCredits" @change="(e: any) => giftCredits = e.detail.value" color="#10b981" style="transform:scale(0.8)"/>

            </view>
            
            <view v-if="giftCredits" class="setting-body">
              <view class="input-wrap">
                <text class="input-label">单次赠送积分</text>
                <input 
                  type="number" 
                  placeholder="请输入赠送数量" 
                  class="setting-input"
                  placeholder-class="input-placeholder"
                />
              </view>
              <text class="input-hint">每成功邀请一位用户下单后的奖励积分</text>
            </view>
          </view>

          <view class="save-action">
            <view class="save-btn" @click="handleSaveConfig">
              <text class="save-btn-text">保存配置</text>
            </view>
          </view>

        </view>

        <!-- History List -->
        <view v-else class="history-list">
          <view v-if="creditHistory.length === 0" class="empty-state">
            <view class="empty-icon-bg">
              <AppIcon name="clock" :size="40" color="#10b981" />
            </view>
            <text class="empty-text">暂无积分变动记录</text>
          </view>
          
          <view v-else v-for="(record, idx) in creditHistory" :key="idx" class="history-card">
            <view class="history-left">
              <view :class="['history-icon', record.amount > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10']">
                 <AppIcon 
                  :name="record.amount > 0 ? 'plus-circle' : 'minus-circle'" 
                  :size="20" 
                  :color="record.amount > 0 ? '#10b981' : '#ef4444'" 
                />
              </view>
              <view class="history-info">
                <text class="history-title">{{ record.description || getTransactionTypeText(record.transaction_type) }}</text>
                <text class="history-time">{{ formatDate(record.created_at) }}</text>
              </view>
            </view>
            <view class="history-right">
              <text :class="['history-amount', record.amount > 0 ? 'text-emerald-400' : 'text-red-400']">
                {{ record.amount > 0 ? '+' : '' }}{{ record.amount }}
              </text>
              <text class="history-type-tag">{{ getCreditTypeText(record.credits_type) }}</text>
            </view>
          </view>
        </view>

      </view>

      <!-- Membership Tab Content -->
      <view v-else class="content-padding">
        
        <!-- Scheduled Change Notice -->
        <view v-if="currentSubscription?.next_plan_id" class="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex flex-row items-center gap-3">
          <AppIcon name="clock" :size="20" color="#f97316" />
          <view class="flex-1">
            <text class="text-orange-500 text-sm font-medium">计划变更</text>
            <text class="text-gray-400 text-xs mt-1">
              您的订阅将在 {{ formatDate(currentSubscription.end_date) }} 变更为 {{ currentSubscription.next_plan_name || '新套餐' }}
            </text>
          </view>
        </view>

        <!-- Tiers Selection -->
        <view class="section-title">
          <text class="section-title-text">选择会员等级</text>
        </view>
        
        <view class="tiers-grid">
          <view 
            v-for="(tier, idx) in plans" 
            :key="idx"
            :class="['tier-card', selectedTier === idx ? 'tier-card-selected' : '']"
            @click="selectedTier = idx"
          >
            <view :class="['tier-bg']"></view>
            <view class="tier-content">
              <text class="tier-name">{{ tier.name }}</text>
              <view class="tier-benefits">
                <view class="benefit-item">
                  <view class="benefit-dot"></view>
                  <text class="benefit-text">每月 {{ tier.included_credits }} 积分</text>
                </view>
                <view class="benefit-item">
                  <view class="benefit-dot"></view>
                  <text class="benefit-text">包含 {{ tier.included_standard_listings }} 次上架</text>
                </view>
              </view>
            </view>
            <view v-if="selectedTier === idx" class="selected-badge">
              <AppIcon name="check" :size="12" color="#ffffff" />
            </view>
          </view>
          <view v-if="plans.length === 0" class="text-center py-4 w-full">
            <text class="text-gray-500 text-sm">暂无可订阅项目</text>
          </view>
        </view>


        <!-- Duration Selection -->
        <view class="section-title mt-6">
          <text class="section-title-text">选择开通时长</text>
        </view>

        <view class="durations-row">
          <view 
            v-for="opt in [{label: '月付', value: 'monthly'}, {label: '年付', value: 'yearly'}]" 
            :key="opt.value"
            :class="['duration-card', selectedDuration === opt.value ? 'duration-card-selected' : '']"
            @click="selectedDuration = opt.value"
          >
            <text :class="['duration-text', selectedDuration === opt.value ? 'duration-text-selected' : '']">{{ opt.label }}</text>
            <view class="price-row">
              <text class="currency">$</text>
              <text class="price">{{ opt.value === 'monthly' ? (selectedPlan?.price_monthly || 0) : (selectedPlan?.price_yearly || 0) }}</text>
            </view>
            <view v-if="opt.value === 'yearly' && selectedPlan?.price_yearly < selectedPlan?.price_monthly * 12" class="save-tag">
              <text class="save-tag-text">更优惠</text>
            </view>
          </view>
        </view>


        <!-- Agreement -->
        <view class="agreement-row">
          <view class="radio-circle selected"></view>
          <text class="agreement-text">开通即代表阅读并同意</text>
          <text class="agreement-link">《会员服务协议》</text>
        </view>

      </view>
    </scroll-view>

    <!-- Bottom Action Bar (Membership Only) -->
    <!-- Bottom Action Bar (Membership Only) -->
    <view v-if="activeTab === 'membership'" class="bottom-bar">
      <view class="price-info">
        <text class="total-label">{{ isSubscriptionUser && currentSubscription?.plan_id === selectedPlan?.id ? '当前套餐' : '总计:' }}</text>
        <view class="total-price-row">
          <text class="total-currency">$</text>
          <text class="total-amount">{{ currentPrice }}</text>
        </view>
      </view>
      <view class="action-group">
        <view class="prime-action-row">
            <view v-if="isSubscriptionUser" class="secondary-mg-btn" @click="handleCancelSubscription">
                <text class="secondary-btn-text">取消订阅</text>
            </view>
            <view 
                :class="['pay-btn-premium', isCurrentPlanActive ? 'btn-disabled-blur' : '']" 
                @click="!isCurrentPlanActive && handleSubscribe()"
            >
                <text class="pay-btn-text-premium">
                    {{ 
                        isSubscriptionUser 
                        ? (currentSubscription?.plan_id === selectedPlan?.id 
                            ? (currentSubscription?.status === 'active' ? '当前方案有效期内' : '重新开启自动续费') 
                            : '立即变更方案') 
                        : '开通会员服务' 
                    }}
                </text>
            </view>
        </view>
      </view>
    </view>

    <!-- Custom Cancellation Modal (Premium) -->
    <view v-if="showCancelModal" class="custom-modal-mask" @click.stop="showCancelModal = false">
      <view class="premium-modal-container danger-theme anim-scale-in" @click.stop>
        <view class="modal-header">
          <view class="modal-icon-ring warn">
            <AppIcon name="alert-triangle" :size="32" color="#ef4444" />
          </view>
          <text class="modal-title-text danger">确认取消订阅？</text>
        </view>
        <view class="modal-body-content">
          <view class="warning-info-box">
             <text class="warning-main-text">如果您取消当前订阅：</text>
             <view class="warning-bullet">
                <view class="bullet-dot"></view>
                <text class="bullet-text">您将在当前周期结束后失去会员权益</text>
             </view>
             <view class="warning-bullet">
                <view class="bullet-dot"></view>
                <text class="bullet-text">未使用的发布配额将无法继续使用</text>
             </view>
             <view class="warning-bullet">
                <view class="bullet-dot"></view>
                <text class="bullet-text">您随时可以重新开通以找回权益</text>
             </view>
          </view>
        </view>
        <view class="modal-footer-actions">
          <view class="action-btn-secondary" @click="showCancelModal = false">
            <text class="btn-text-muted">暂不取消</text>
          </view>
          <view class="action-btn-danger" @click="execCancelSubscription">
            <text class="btn-text-bold">确认取消</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Custom Modal for Manual Recharge -->
    <view v-if="showRechargeModal" class="custom-modal-mask" @click.stop="showRechargeModal = false">
        <!-- Existing Recharge Modal -->
        <view class="custom-modal-dialog anim-scale-in" @click.stop>
          <view class="modal-icon-header">
            <AppIcon name="zap" :size="32" color="#10b981" />
          </view>
          <view class="modal-text-content">
            <text class="modal-main-title">购买积分</text>
            <text class="modal-sub-desc">请选择或输入充值积分数量 (1加币 = {{ creditConfigs.credits_per_cad }}积分)</text>
          </view>
          <!-- Predefined Amounts -->
          <view class="amounts-grid">
            <view v-for="amt in [100, 300, 500, 1000]" :key="amt" :class="['amount-item', rechargeAmount === amt ? 'amount-item-active' : '']" @click="rechargeAmount = amt">
              <text :class="['amount-text', rechargeAmount === amt ? 'amount-text-active' : '']">{{ amt }}积分</text>
              <text class="amount-price">${{ (amt / creditConfigs.credits_per_cad).toFixed(2) }}</text>
            </view>
          </view>
          <!-- Custom Input -->
          <view class="custom-input">
            <input v-model="rechargeAmount" type="number" placeholder="自定义积分" class="setting-input" placeholder-class="input-placeholder" />
          </view>
          <view class="modal-actions">
            <view class="modal-btn cancel" @click.stop="showRechargeModal = false">取消</view>
            <view class="modal-btn confirm" @click.stop="handleConfirmRecharge">确认充值</view>
          </view>
        </view>
      </view>
      <!-- Premium Plan Change / New Subscription Confirmation Modal -->
      <view v-if="showPlanChangeModal" class="custom-modal-mask" @click.stop="showPlanChangeModal = false">
        <view class="premium-modal-container anim-scale-in" @click.stop>
          <!-- Decoration -->
          <view class="modal-glow"></view>
          
          <view class="modal-header">
            <view class="modal-icon-ring">
              <AppIcon :name="planChangeInfo?.change_type === 'downgrade' ? 'clock' : 'zap'" :size="32" :color="planChangeInfo?.change_type === 'downgrade' ? '#60a5fa' : '#10b981'" />
            </view>
            <text class="modal-title-text">{{ planChangeInfo?.change_type === 'upgrade' ? '升级方案确认' : planChangeInfo?.change_type === 'downgrade' ? '降级方案确认' : '订阅方案确认' }}</text>
            <view class="modal-status-badge">
              <text class="status-badge-text">{{ planChangeInfo?.change_type === 'downgrade' ? '预约变更' : '立即生效' }}</text>
            </view>
          </view>

          <view class="modal-body-content">
            <!-- Comparison Layout for Changes -->
            <view v-if="planChangeInfo?.current_plan" class="comparison-row">
              <view class="plan-card-mini old-plan">
                <text class="card-label">当前</text>
                <text class="card-plan-name">{{ planChangeInfo.current_plan.name }}</text>
                <view class="card-stats">
                  <text class="stat-item">{{ planChangeInfo.current_plan.included_credits }} 积分</text>
                </view>
              </view>
              
              <view class="comparison-arrow">
                <AppIcon name="chevron-right" :size="20" color="#4b5563" />
              </view>

              <view class="plan-card-mini new-plan">
                <text class="card-label highlight">新方案</text>
                <text class="card-plan-name">{{ planChangeInfo.new_plan.name }}</text>
                <view class="card-stats">
                  <text class="stat-item highlight">{{ planChangeInfo.new_plan.included_credits }} 积分</text>
                </view>
              </view>
            </view>

            <!-- Simple Layout for New Subscription -->
            <view v-else class="simple-plan-preview">
              <view class="premium-card">
                <text class="premium-plan-name">{{ planChangeInfo?.new_plan?.name }}</text>
                <view class="premium-features">
                  <view class="feature-tag">
                    <AppIcon name="check-circle" :size="12" color="#10b981" />
                    <text class="feature-text">{{ planChangeInfo?.new_plan?.included_credits }} 月度积分</text>
                  </view>
                  <view class="feature-tag">
                    <AppIcon name="check-circle" :size="12" color="#10b981" />
                    <text class="feature-text">{{ planChangeInfo?.new_plan?.included_standard_listings }} 优先导流</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- Price & Notice -->
            <view class="confirmation-summary">
              <view class="price-row-large">
                <text class="currency-symbol">$</text>
                <text class="price-main-val">{{ planChangeInfo?.new_plan?.price }}</text>
                <text class="price-period">/{{ selectedDuration === 'monthly' ? '月' : '年' }}</text>
              </view>
              <view class="notice-box">
                <text class="notice-text">{{ planChangeInfo?.message || '确认后将立即通过您的默认支付卡扣费并生效。' }}</text>
              </view>
            </view>
          </view>

          <view class="modal-footer-actions">
            <view class="action-btn-secondary" @click="cancelPlanChange">
              <text class="btn-text-muted">返回</text>
            </view>
            <view class="action-btn-primary" @click="confirmPlanChange">
              <text class="btn-text-bold">确认支付并开通</text>
              <AppIcon name="arrow-right" :size="16" color="#ffffff" />
            </view>
          </view>
        </view>
      </view>


  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { creditsApi, subscriptionPlansApi, userSubscriptionApi, providersApi, paymentApi } from '@/services/api';


const activeTab = ref<'credits' | 'membership'>('credits');
const creditsSubTab = ref<'auto' | 'history'>('auto');
const autoBuy = ref(false);
const autoBuyAmount = ref('');
const autoBuyThreshold = ref('');
const giftCredits = ref(false);
const showCardCheckModal = ref(false);
const showRechargeModal = ref(false);
const rechargeAmount = ref<number | string>(100);
const selectedTier = ref(0);
const selectedDuration = ref('monthly'); // 'monthly' or 'yearly'
const loading = ref(true);
const showCancelModal = ref(false);
const profile = ref<any>(null);
const creditHistory = ref<any[]>([]);

const creditBalance = ref<any>({
  total: 0,
  listings: 0,
  purchased: 0,
  subscription: 0,
  config: {
    credits_per_cad: 100,
    credits_per_service_listing: 10,
    credits_per_quote: 5
  }
});

const creditConfigs = computed(() => creditBalance.value.config || {
  credits_per_cad: 100,
  credits_per_service_listing: 10,
  credits_per_quote: 5
});

const plans = ref<any[]>([]);
const currentSubscription = ref<any>(null);
const paymentMethods = ref<any[]>([]);

// Plan change confirmation state
const showPlanChangeModal = ref(false);
const planChangeInfo = ref<{
  change_type: 'upgrade' | 'downgrade' | 'new';
  current_plan: any;
  new_plan: any;
  message: string;
} | null>(null);

const defaultCard = computed(() => paymentMethods.value.find(m => m.is_default) || paymentMethods.value[0]);

const contentHeight = computed(() => activeTab.value === 'membership' ? 'calc(100vh - 280px)' : 'calc(100vh - 180px)');

const isSubscriptionUser = computed(() => profile.value?.user_type === 'subscription');

const isCurrentPlanActive = computed(() => {
    return isSubscriptionUser.value && 
           currentSubscription.value?.plan_id === selectedPlan.value?.id && 
           currentSubscription.value?.status === 'active';
});

const fetchInitialData = async () => {
    loading.value = true;
    try {
        const [balanceRes, plansRes, currentRes, profileRes, methodsRes, historyRes] = await Promise.all([
            creditsApi.getBalance(),
            subscriptionPlansApi.getAll(),
            userSubscriptionApi.getCurrent(),
            providersApi.getMyProfile(),
            paymentApi.getMethods(),
            creditsApi.getHistory({ limit: 50 })
        ]);
        
        if (balanceRes.success) creditBalance.value = balanceRes.data;
        
        // @ts-ignore
        if (historyRes.success) creditHistory.value = historyRes.data.transactions;
        const plansData = plansRes.data || plansRes; // Handle different response formats
        if (Array.isArray(plansData)) {
            plans.value = plansData.filter((p: any) => p.is_active);
        }
        
        if (currentRes.success) currentSubscription.value = currentRes.data;

        if (profileRes.profile) {
            profile.value = profileRes.profile;
            autoBuy.value = !!profile.value.auto_recharge_enabled;
            autoBuyAmount.value = profile.value.auto_recharge_amount || '';
            autoBuyThreshold.value = profile.value.auto_recharge_threshold || '';
        }

        if (methodsRes && methodsRes.methods) {
            paymentMethods.value = methodsRes.methods;
        }
        
        // Match selectedTier to current plan if exists
        if (currentSubscription.value && plans.value.length > 0) {
            const idx = plans.value.findIndex(p => p.id === currentSubscription.value.plan_id);
            if (idx >= 0) selectedTier.value = idx;
        }
    } catch (e) {
        console.error('Failed to load subscription data:', e);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchInitialData);

const selectedPlan = computed(() => plans.value[selectedTier.value] || null);

const currentPrice = computed(() => {
    if (!selectedPlan.value) return 0;
    return selectedDuration.value === 'monthly' ? selectedPlan.value.price_monthly : selectedPlan.value.price_yearly;
});

const handleCancelSubscription = () => {
    showCancelModal.value = true;
};

const execCancelSubscription = async () => {
    showCancelModal.value = false;
    uni.showLoading({ title: '正在取消...' });
    try {
        const apiRes = await userSubscriptionApi.cancel();
        if (apiRes.success) {
            uni.showToast({ title: '订阅已取消', icon: 'success' });
            await fetchInitialData();
        } else {
            //@ts-ignore
            uni.showToast({ title: apiRes.message || '取消失败', icon: 'none' });
        }
    } catch (e: any) {
        uni.showToast({ title: e.message || '网络错误', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

const handleSubscribe = async (confirmChange = false) => {
    if (!selectedPlan.value) return;
    
    uni.showLoading({ title: '处理中...' });
    try {
        const res = await userSubscriptionApi.subscribe(
            selectedPlan.value.id, 
            selectedDuration.value as 'monthly' | 'yearly',
            confirmChange
        );

        // If it's a first-time call (!confirmChange), we ALWAYS show our custom confirmation modal
        // This covers both backend 'requires_confirmation' and our frontend safety prompt
        if (res.success && !confirmChange) {
            uni.hideLoading();
            
            // Build the comparison data
            planChangeInfo.value = {
                change_type: (res.change_type || (isSubscriptionUser.value ? 'upgrade' : 'new')) as any,
                current_plan: res.current_plan || (isSubscriptionUser.value ? currentSubscription.value : null),
                new_plan: res.new_plan || {
                    ...selectedPlan.value,
                    price: selectedDuration.value === 'yearly' ? selectedPlan.value.price_yearly : selectedPlan.value.price_monthly
                },
                message: res.message || (isSubscriptionUser.value ? '确认变更您的会员套餐？' : '确认开通会员服务？')
            };
            
            showPlanChangeModal.value = true;
            return;
        }
        
        if (res.success) {
            showPlanChangeModal.value = false;
            planChangeInfo.value = null;
            const successMsg = res.change_type === 'upgrade' ? '升级成功' 
                : res.change_type === 'downgrade_scheduled' ? '降级已安排'
                : '订阅成功';
            uni.showToast({ title: successMsg, icon: 'success' });
            await fetchInitialData();
        } else {
            //@ts-ignore
            uni.showToast({ title: res.message || '订阅失败', icon: 'none' });
        }
    } catch (e: any) {
        uni.showToast({ title: e.message || '网络错误', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

const confirmPlanChange = () => {
    handleSubscribe(true);
};

const cancelPlanChange = () => {
    showPlanChangeModal.value = false;
    planChangeInfo.value = null;
};

const handleAutoBuyToggle = (e: any) => {
    const newVal = e.detail.value;
    
    // If turning ON, check payment methods
    if (newVal && paymentMethods.value.length === 0) {
        // Reset switch to false
        nextTick(() => {
            autoBuy.value = false;
        });
        showCardCheckModal.value = true;
        return;
    }
    
    autoBuy.value = newVal;
};

const openRechargeModal = () => {
    if (paymentMethods.value.length === 0) {
        showCardCheckModal.value = true;
        return;
    }
    showRechargeModal.value = true;
};

const handleConfirmRecharge = async () => {
    const amount = parseInt(rechargeAmount.value as string);
    if (!amount || amount <= 0) {
        uni.showToast({ title: '请输入有效的充值金额', icon: 'none' });
        return;
    }

    showRechargeModal.value = false;
    uni.showLoading({ title: '正在支付...' });
    
    try {
        const defaultCardId = defaultCard.value?.id;
        const res = await creditsApi.recharge(amount, defaultCardId);
        if (res.success) {
            uni.showToast({ title: '充值成功', icon: 'success' });
            // Refresh balance
            fetchInitialData();
        } else {
            // @ts-ignore
            uni.showToast({ title: res.message || '支付失败', icon: 'none' });
        }
    } catch (e: any) {
        uni.showToast({ title: e.message || '系统错误', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

const goToBindCard = () => {
    showCardCheckModal.value = false;
    uni.navigateTo({ url: '/pages/provider/billing-methods' });
};

const handleSaveConfig = async () => {
    if (isSubscriptionUser.value) return;
    
    uni.showLoading({ title: '保存中...' });
    try {
        const res = await providersApi.updateProfile({
            auto_recharge_enabled: autoBuy.value,
            auto_recharge_amount: parseInt(autoBuyAmount.value as string) || 0,
            auto_recharge_threshold: parseInt(autoBuyThreshold.value as string) || 0
        });
        
        if (res.message) {
            uni.showToast({ title: '配置已保存', icon: 'success' });
        }
    } catch (e: any) {
        uni.showToast({ title: e.message || '保存失败', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

const getTransactionTypeText = (type: string) => {
  const map: any = {
    'purchase': '积分充值',
    'consume': '积分消费',
    'quote': '报价消耗',
    'listing': '上架消耗',
    'refund': '积分退款',
    'admin_adjust': '人工调整',
    'signup_bonus': '入驻奖励'
  };
  return map[type] || '积分变动';
};

const getCreditTypeText = (type: string) => {
  return type === 'subscription' ? '会员配额' : '购买积分';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

</script>

<style scoped>
/* History Styles */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.history-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.history-time {
  font-size: 11px;
  color: #6b7280;
}

.history-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.history-amount {
  font-size: 16px;
  font-weight: 700;
}

.text-emerald-400 { color: #34d399; }
.text-red-400 { color: #f87171; }
.bg-emerald-500\/10 { background: rgba(16, 185, 129, 0.1); }
.bg-red-500\/10 { background: rgba(239, 68, 68, 0.1); }

.history-type-tag {
  font-size: 10px;
  color: #9ca3af;
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.placeholder-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  flex-shrink: 0;
}

.header-center-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.header-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  display: block;
}

.header-subtitle {
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  margin-top: 4px;
  text-align: center;
  display: block;
}

/* Tabs */
.tabs-container {
  background: #1f2937;
  border: 1px solid #374151;
  margin: 0 16px;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  margin-top: -10px;
  position: relative;
  z-index: 5;
  flex-shrink: 0;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  background: rgba(255,255,255,0.05); /* Track bg */
  border-radius: 12px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s;
}

.tab-active {
  background: #374151;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.tab-label {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}

.tab-label-active {
  color: #ffffff;
  font-weight: 600;
}

/* Content Area */
.content-scroll {
  flex: 1;
}

.content-padding {
  padding: 24px 16px;
}

/* Credits Card */
.credits-card {
  position: relative;
  height: 140px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);
}

.credits-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.credits-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 0 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.credits-text-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.credits-label {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  display: block;
}

.credits-value {
  font-size: 40px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  margin: 6px 0;
  display: block;
}

.credits-tag {
  background: rgba(255,255,255,0.2);
  padding: 0 10px;
  height: 24px;
  border-radius: 6px;
  /* Use text-align and line-height for safer centering in small fixed-height boxes */
  display: block;
  text-align: center;
}

.credits-tag-text {
  font-size: 11px;
  color: #ffffff;
  font-weight: 500;
  line-height: 24px; /* Matches container height for vertical centering */
  display: block;
}

.buy-btn {
  background: #ffffff;
  padding: 0 20px;
  height: 38px;
  border-radius: 19px; /* Fully rounded ends */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.buy-btn-text {
  color: #059669;
  font-weight: 700;
  font-size: 14px;
  line-height: 1;
}

/* Sub Tabs */
.sub-tabs {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #374151;
  margin-bottom: 20px;
}

.sub-tab-item {
  padding: 0 16px 12px 16px;
  position: relative;
}

.sub-tab-active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  background: #10b981;
  border-radius: 3px 3px 0 0;
}

.sub-tab-text {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
}

.sub-tab-text-active {
  color: #10b981;
  font-weight: 600;
}

/* Settings Group */
.settings-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 16px;
  padding: 20px;
}

.setting-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.setting-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  display: block;
}

.setting-desc {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
  display: block;
}

.subscription-hint-text {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.6;
  display: block;
}

.setting-body {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #374151;
}

.input-wrap {
  margin-bottom: 8px;
}

.input-label {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 8px;
  display: block;
}

.setting-input {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 15px;
}

.input-placeholder {
  color: #4b5563;
}

.input-hint {
  font-size: 12px;
  color: #6b7280;
}

.save-action {
  margin-top: 16px;
}

.save-btn {
  background: #10b981;
  border-radius: 12px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-btn-text {
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon-bg {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: #1f2937;
  border: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.empty-text {
  color: #6b7280;
  font-size: 14px;
}

/* Membership Styles */
.section-title {
  margin-bottom: 16px;
  border-left: 4px solid #10b981;
  padding-left: 12px;
}

.section-title-text {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.tiers-grid {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.tier-card {
  flex: 1;
  position: relative;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.tier-card-selected {
  border-color: #10b981;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
}

.tier-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.15;
}

.bg-purple { background: #8b5cf6; }
.bg-emerald { background: #10b981; }
.bg-gold { background: #f59e0b; }

.tier-content {
  position: relative;
  z-index: 2;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(31, 41, 55, 0.8);
}

.tier-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.tier-name {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.tier-benefits {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.benefit-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

.benefit-dot {
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: #9ca3af;
}

.benefit-text {
  font-size: 11px;
  color: #d1d5db;
}

.selected-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #10b981;
  width: 20px;
  height: 20px;
  border-radius: 0 0 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.mt-6 { margin-top: 24px; }

.durations-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.duration-card {
  flex: 1;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.duration-card-selected {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.duration-text {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.duration-text-selected {
  color: #10b981;
  font-weight: 600;
}

.price-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.currency {
  font-size: 12px;
  color: #ffffff;
  margin-right: 2px;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.save-tag {
  position: absolute;
  top: -8px;
  right: -4px;
  background: #ef4444;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-tag-text {
  font-size: 10px;
  color: #ffffff;
  font-weight: 700;
}

.agreement-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  gap: 6px;
}

.radio-circle {
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 1px solid #6b7280;
}

.radio-circle.selected {
  background: #10b981;
  border-color: #10b981;
}

.agreement-text {
  font-size: 12px;
  color: #6b7280;
}

.agreement-link {
  font-size: 12px;
  color: #10b981;
}

/* Bottom Bar */
.bottom-bar {
  background: #1f2937;
  padding: 16px 24px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid #374151;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.price-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.total-label {
  font-size: 14px;
  color: #9ca3af;
}

.total-price-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.total-currency {
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
}

.total-amount {
  font-size: 24px;
  color: #10b981;
  font-weight: 800;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 24px;
  flex: 1;
}

.prime-action-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.secondary-mg-btn {
    flex: 1;
    height: 48px;
    background: rgba(148, 163, 184, 0.1);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.secondary-btn-text {
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
}

.pay-btn-premium {
    flex: 1;
    height: 48px;
    background: #10b981;
    border-radius: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.4);
}

.pay-btn-text-premium {
    color: #ffffff;
    font-size: 15px;
    font-weight: 800;
}

/* Danger Theme for Modals */
.premium-modal-container.danger-theme {
    border-top: 4px solid #ef4444;
}

.modal-icon-ring.warn {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.modal-title-text.danger {
    color: #ffffff;
}

.warning-info-box {
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.1);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.warning-main-text {
    font-size: 14px;
    color: #94a3b8;
    margin-bottom: 4px;
}

.warning-bullet {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
}

.bullet-dot {
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 2px;
    opacity: 0.6;
}

.bullet-text {
    font-size: 13px;
    color: #e2e8f0;
    font-weight: 500;
}

.action-btn-danger {
    flex: 1;
    height: 56px;
    background: #ef4444;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 24px -6px rgba(239, 68, 68, 0.4);
}

/* Custom Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1e293b;
  width: 85%;
  max-width: 320px;
  border-radius: 24px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.modal-header-icon {
  width: 64px;
  height: 64px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.modal-body {
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
}

.modal-buttons {
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
}

.modal-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.btn-cancel {
  background: #334155;
}

.btn-confirm {
  background: #10b981;
}

.btn-text-secondary {
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 600;
}

.btn-text-primary {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Redesigned Modal (Matching Premium Style) */
.custom-modal-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
}

.premium-modal-container {
    background-color: #111827;
    width: 90%;
    max-width: 380px;
    border-radius: 32px;
    padding: 40px 24px 32px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8);
}

.modal-glow {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
    pointer-events: none;
}

.modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
}

.modal-icon-ring {
    width: 72px;
    height: 72px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    transform: rotate(-5deg);
}

.modal-title-text {
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
}

.modal-status-badge {
    margin-top: 8px;
    padding: 4px 12px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 100px;
}

.status-badge-text {
    font-size: 11px;
    font-weight: 700;
    color: #10b981;
    text-transform: uppercase;
}

.modal-body-content {
    margin-bottom: 32px;
}

/* Comparison View */
.comparison-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    background: rgba(255, 255, 255, 0.03);
    padding: 16px;
    border-radius: 24px;
}

.plan-card-mini {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.card-label {
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
}

.card-label.highlight {
    color: #10b981;
}

.card-plan-name {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
}

.card-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.stat-item {
    font-size: 12px;
    color: #94a3b8;
}

.stat-item.highlight {
    color: #10b981;
    font-weight: 600;
}

.comparison-arrow {
    padding: 0 12px;
}

/* New Subscription View */
.simple-plan-preview {
    margin-bottom: 24px;
}

.premium-card {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 24px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.premium-plan-name {
    font-size: 24px;
    font-weight: 900;
    color: #ffffff;
    margin-bottom: 16px;
}

.premium-features {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.feature-tag {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.2);
    padding: 8px 12px;
    border-radius: 12px;
}

.feature-text {
    font-size: 13px;
    color: #e2e8f0;
    font-weight: 500;
}

/* Price & Notice */
.confirmation-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.price-row-large {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 2px;
}

.currency-symbol {
    font-size: 20px;
    font-weight: 700;
    color: #10b981;
}

.price-main-val {
    font-size: 44px;
    font-weight: 900;
    color: #ffffff;
    line-height: 1;
}

.price-period {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
}

.notice-box {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
    padding: 12px 16px;
    border-radius: 16px;
}

.notice-text {
    font-size: 12px;
    color: #fbd38d;
    text-align: center;
    line-height: 1.5;
}

/* Footer Actions */
.modal-footer-actions {
    display: flex;
    flex-direction: row;
    gap: 12px;
}

.action-btn-secondary {
    flex: 1;
    height: 56px;
    background: #1f2937;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #374151;
}

.action-btn-primary {
    flex: 2;
    height: 56px;
    background: #10b981;
    border-radius: 18px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 12px 24px -6px rgba(16, 185, 129, 0.4);
}

.btn-text-muted {
    font-size: 15px;
    font-weight: 700;
    color: #94a3b8;
}

.btn-text-bold {
    font-size: 15px;
    font-weight: 800;
    color: #ffffff;
}

.anim-scale-in {
    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
