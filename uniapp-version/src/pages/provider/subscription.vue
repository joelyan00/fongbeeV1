<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view @click="goBack" class="back-btn">
          <AppIcon name="arrow-left" :size="22" color="#ffffff" />
        </view>
        <view class="header-info">
          <text class="header-title">等级与订阅</text>
          <text class="header-subtitle">管理您的会员权益与积分</text>
        </view>
      </view>
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
            <view>
              <text class="credits-label">当前可用积分</text>
              <text class="credits-value">200</text>
              <view class="credits-tag">
                <text class="credits-tag-text">可抵扣 10 次服务</text>
              </view>
            </view>
            <view class="buy-btn">
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
                <text class="setting-desc">余额不足时自动补充</text>
              </view>
              <switch :checked="autoBuy" @change="e => autoBuy = e.detail.value" color="#10b981" style="transform:scale(0.8)"/>
            </view>
            
            <view v-if="autoBuy" class="setting-body">
              <view class="input-wrap">
                <text class="input-label">单次充值积分</text>
                <input 
                  type="number" 
                  placeholder="请输入积分数量" 
                  class="setting-input"
                  placeholder-class="input-placeholder"
                />
              </view>
              <text class="input-hint">建议设置为 100 的整数倍，最低 100 积分</text>
            </view>
          </view>

          <!-- Gift Setting -->
          <view class="setting-card">
            <view class="setting-header">
              <view class="setting-title-wrap">
                <text class="setting-title">积分赠送设置</text>
                <text class="setting-desc">用户分享并成交后赠送</text>
              </view>
              <switch :checked="giftCredits" @change="e => giftCredits = e.detail.value" color="#10b981" style="transform:scale(0.8)"/>
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
            <view class="save-btn">
              <text class="save-btn-text">保存配置</text>
            </view>
          </view>

        </view>

        <!-- History Empty State -->
        <view v-else class="empty-state">
          <view class="empty-icon-bg">
            <AppIcon name="clock" :size="40" color="#10b981" />
          </view>
          <text class="empty-text">暂无积分变动记录</text>
        </view>

      </view>

      <!-- Membership Tab Content -->
      <view v-else class="content-padding">
        
        <!-- Tiers Selection -->
        <view class="section-title">
          <text class="section-title-text">选择会员等级</text>
        </view>
        
        <view class="tiers-grid">
          <view 
            v-for="(tier, idx) in tiers" 
            :key="idx"
            :class="['tier-card', selectedTier === idx ? 'tier-card-selected' : '']"
            @click="selectedTier = idx"
          >
            <view :class="['tier-bg', tier.bgClass]"></view>
            <view class="tier-content">
              <text class="tier-icon">👑</text>
              <text class="tier-name">{{ tier.name }}</text>
              <view class="tier-benefits">
                <view v-for="(b, i) in tier.benefits" :key="i" class="benefit-item">
                  <view class="benefit-dot"></view>
                  <text class="benefit-text">{{ b }}</text>
                </view>
              </view>
            </view>
            <view v-if="selectedTier === idx" class="selected-badge">
              <AppIcon name="check" :size="12" color="#ffffff" />
            </view>
          </view>
        </view>

        <!-- Duration Selection -->
        <view class="section-title mt-6">
          <text class="section-title-text">选择开通时长</text>
        </view>

        <view class="durations-row">
          <view 
            v-for="(opt, idx) in durations" 
            :key="idx"
            :class="['duration-card', selectedDuration === idx ? 'duration-card-selected' : '']"
            @click="selectedDuration = idx"
          >
            <text :class="['duration-text', selectedDuration === idx ? 'duration-text-selected' : '']">{{ opt.duration }}</text>
            <view class="price-row">
              <text class="currency">$</text>
              <text class="price">{{ opt.price }}</text>
            </view>
            <view v-if="opt.save" class="save-tag">
              <text class="save-tag-text">省 {{ opt.save }}</text>
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
    <view v-if="activeTab === 'membership'" class="bottom-bar">
      <view class="price-info">
        <text class="total-label">总计:</text>
        <view class="total-price-row">
          <text class="total-currency">$</text>
          <text class="total-amount">{{ durations[selectedDuration]?.price || 200 }}</text>
        </view>
      </view>
      <view class="pay-btn">
        <text class="pay-btn-text">立即支付</text>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';

const activeTab = ref<'credits' | 'membership'>('credits');
const creditsSubTab = ref<'auto' | 'history'>('auto');
const autoBuy = ref(false);
const giftCredits = ref(false);
const selectedTier = ref(0);
const selectedDuration = ref(0);
const contentHeight = computed(() => activeTab.value === 'membership' ? 'calc(100vh - 280px)' : 'calc(100vh - 180px)');

const tiers = [
  { name: '初级', bgClass: 'bg-purple', benefits: ['每月100积分', '每月5次报价'] },
  { name: '中级', bgClass: 'bg-emerald', benefits: ['每月500积分', '每月10次报价'] },
  { name: '高级', bgClass: 'bg-gold', benefits: ['每月1000积分', '无限次报价'] },
];

const durations = [
  { duration: '1个月', price: 200, save: 0 },
  { duration: '3个月', price: 560, save: '40' },
  { duration: '12个月', price: 1600, save: '800' },
];

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #111827;
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  position: relative;
  padding-bottom: 20px;
  flex-shrink: 0;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-bottom: 1px solid #374151;
  border-radius: 0 0 24px 24px;
}

.header-content {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.header-info {
  margin-left: 12px;
  flex: 1;
}

.header-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  display: block;
}

.header-subtitle {
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  margin-top: 4px;
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
  padding: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.credits-tag-text {
  font-size: 11px;
  color: #ffffff;
  font-weight: 500;
  line-height: 1.2;
}

.buy-btn {
  background: #ffffff;
  padding: 10px 20px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.buy-btn-text {
  color: #059669;
  font-weight: 700;
  font-size: 14px;
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

.pay-btn {
  background: #10b981;
  padding: 12px 32px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pay-btn-text {
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
}
</style>
