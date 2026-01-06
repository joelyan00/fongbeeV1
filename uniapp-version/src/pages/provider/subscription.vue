<template>
  <view class="subscription-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="arrow-left" :size="20" color="#fff" />
      </view>
      <text class="title">等级与订阅机制</text>
      <view class="placeholder"></view>
    </view>

    <!-- Tab Switch -->
    <view class="tab-switch">
      <view 
        :class="['tab', { active: activeTab === 'credits' }]"
        @click="activeTab = 'credits'"
      >
        购买积分
      </view>
      <view 
        :class="['tab', { active: activeTab === 'membership' }]"
        @click="activeTab = 'membership'"
      >
        成为会员
      </view>
    </view>

    <!-- Credits Tab -->
    <scroll-view scroll-y class="content" v-if="activeTab === 'credits'">
      <!-- Current Credits Card -->
      <view class="credits-card">
        <view class="credits-info">
          <text class="label">我的积分</text>
          <view class="credits-value">
            <text class="number">200</text>
            <text class="sub">可兑换抵扣次数：10次</text>
          </view>
        </view>
        <button class="buy-btn">购买积分</button>
      </view>

      <!-- Sub Tabs -->
      <view class="sub-tabs">
        <view :class="['sub-tab', { active: creditsSubTab === 'auto' }]" @click="creditsSubTab = 'auto'">
          自动充值
        </view>
        <view :class="['sub-tab', { active: creditsSubTab === 'history' }]" @click="creditsSubTab = 'history'">
          积分记录
        </view>
      </view>

      <!-- Auto Recharge Settings -->
      <view class="settings-section" v-if="creditsSubTab === 'auto'">
        <view class="setting-row">
          <text class="setting-label">自动购买积分</text>
          <view class="radio-group">
            <view class="radio-item" @click="autoBuy = true">
              <view :class="['radio', { checked: autoBuy }]"></view>
              <text>开启</text>
            </view>
            <view class="radio-item" @click="autoBuy = false">
              <view :class="['radio', { checked: !autoBuy }]"></view>
              <text>关闭</text>
            </view>
          </view>
        </view>

        <view class="input-row">
          <input type="number" placeholder="请输入积分" class="input-field" />
          <text class="hint">请输入100的整数倍，最低购买100</text>
        </view>

        <view class="divider"></view>

        <view class="setting-row">
          <text class="setting-label">积分赠送</text>
          <view class="radio-group">
            <view class="radio-item" @click="giftCredits = true">
              <view :class="['radio', { checked: giftCredits }]"></view>
              <text>开启</text>
            </view>
            <view class="radio-item" @click="giftCredits = false">
              <view :class="['radio', { checked: !giftCredits }]"></view>
              <text>关闭</text>
            </view>
          </view>
        </view>

        <view class="input-row">
          <input type="number" placeholder="请输入积分" class="input-field" />
          <text class="hint">用户分享并成功下单后，可赠送积分</text>
        </view>

        <button class="save-btn">保存</button>
      </view>

      <!-- Credits History -->
      <view class="empty-state" v-else>
        <AppIcon name="credit-card" :size="48" color="#ccc" />
        <text class="empty-text">暂无积分记录</text>
      </view>
    </scroll-view>

    <!-- Membership Tab -->
    <scroll-view scroll-y class="content" v-else>
      <!-- Membership Tiers -->
      <view class="section">
        <text class="section-title">选择会员等级</text>
        <view class="tiers">
          <view 
            v-for="(tier, idx) in tiers" 
            :key="idx"
            :class="['tier-card', tier.theme, { selected: selectedTier === idx }]"
            @click="selectedTier = idx"
          >
            <view class="tier-icon">👑</view>
            <text class="tier-name">{{ tier.name }}</text>
            <view class="tier-benefits">
              <text v-for="(b, i) in tier.benefits" :key="i">{{ b }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Duration Selection -->
      <view class="section">
        <text class="section-title">选择开通时长</text>
        <view class="duration-options">
          <view 
            v-for="(opt, idx) in durations" 
            :key="idx"
            :class="['duration-card', { selected: selectedDuration === idx }]"
            @click="selectedDuration = idx"
          >
            <text class="duration-text">{{ opt.duration }}</text>
            <text class="duration-price">¥{{ opt.price }}</text>
          </view>
        </view>
      </view>

      <!-- Continuous Subscription -->
      <view class="section">
        <text class="section-title">连续开通时长</text>
        <view class="duration-options">
          <view 
            v-for="(opt, idx) in continuousDurations" 
            :key="idx"
            class="duration-card"
          >
            <text class="duration-text small">{{ opt.duration }}</text>
            <text class="duration-price">¥{{ opt.price }}</text>
          </view>
        </view>
      </view>

      <!-- Payment Footer -->
      <view class="payment-footer">
        <view class="total">
          <text class="total-label">确认待支付</text>
          <text class="total-price">¥{{ durations[selectedDuration]?.price || 200 }}</text>
        </view>
        <button class="purchase-btn">立即购买</button>
      </view>

      <text class="agreement">开通服务即阅读《会员协议》《服务条款》</text>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref<'credits' | 'membership'>('credits');
const creditsSubTab = ref<'auto' | 'history'>('auto');
const autoBuy = ref(false);
const giftCredits = ref(false);
const selectedTier = ref(0);
const selectedDuration = ref(0);

const tiers = [
  { name: '初级会员', theme: 'purple', benefits: ['积分获赠：每月100', '报价次数：每月5次'] },
  { name: '中级会员', theme: 'blue', benefits: ['积分获赠：每月500', '报价次数：每月10次'] },
  { name: '高级会员', theme: 'gold', benefits: ['积分获赠：每月1000', '报价次数：不限'] },
];

const durations = [
  { duration: '1个月', price: 200 },
  { duration: '3个月', price: 560 },
  { duration: '12个月', price: 1600 },
];

const continuousDurations = [
  { duration: '连续开通1个月', price: 1600 },
  { duration: '连续开通3个月', price: 1600 },
  { duration: '连续开通12个月', price: 1600 },
];

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.subscription-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  padding: 60rpx 32rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn, .placeholder {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.tab-switch {
  display: flex;
  background: #fff;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab.active {
  color: #06b6d4;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background: #06b6d4;
  border-radius: 2rpx;
}

.content {
  flex: 1;
  padding: 24rpx;
}

/* Credits Card */
.credits-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.credits-info .label {
  font-size: 24rpx;
  color: #999;
}

.credits-value {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-top: 8rpx;
}

.credits-value .number {
  font-size: 56rpx;
  font-weight: bold;
  color: #06b6d4;
}

.credits-value .sub {
  font-size: 24rpx;
  color: #999;
}

.buy-btn {
  background: #06b6d4;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  border: none;
}

/* Sub Tabs */
.sub-tabs {
  display: flex;
  gap: 32rpx;
  padding-bottom: 24rpx;
  margin-bottom: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.sub-tab {
  font-size: 28rpx;
  color: #666;
  padding-bottom: 8rpx;
}

.sub-tab.active {
  color: #06b6d4;
  font-weight: bold;
  border-bottom: 4rpx solid #06b6d4;
}

/* Settings */
.settings-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.setting-label {
  font-size: 28rpx;
  color: #333;
}

.radio-group {
  display: flex;
  gap: 24rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.radio {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ccc;
  border-radius: 50%;
}

.radio.checked {
  border-color: #06b6d4;
  background: #06b6d4;
}

.input-row {
  margin-bottom: 24rpx;
}

.input-field {
  width: 100%;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

.hint {
  font-size: 24rpx;
  color: #999;
}

.divider {
  height: 1rpx;
  background: #eee;
  margin: 32rpx 0;
}

.save-btn {
  width: 100%;
  background: #06b6d4;
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  border: none;
  margin-top: 24rpx;
}

/* Membership Tiers */
.section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
  display: block;
}

.tiers {
  display: flex;
  gap: 16rpx;
}

.tier-card {
  flex: 1;
  border-radius: 16rpx;
  padding: 24rpx;
  color: #fff;
  position: relative;
}

.tier-card.purple {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
}

.tier-card.blue {
  background: linear-gradient(135deg, #06b6d4, #0284c7);
}

.tier-card.gold {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.tier-card.selected {
  box-shadow: 0 0 0 4rpx #06b6d4;
}

.tier-icon {
  font-size: 32rpx;
  position: absolute;
  top: 16rpx;
  right: 16rpx;
}

.tier-name {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.tier-benefits {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  font-size: 22rpx;
  opacity: 0.9;
}

/* Duration Options */
.duration-options {
  display: flex;
  gap: 16rpx;
}

.duration-card {
  flex: 1;
  background: #fff;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
}

.duration-card.selected {
  border-color: #06b6d4;
  background: #f0fdfa;
}

.duration-text {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.duration-text.small {
  font-size: 22rpx;
}

.duration-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ec4899;
  margin-top: 8rpx;
  display: block;
}

/* Payment Footer */
.payment-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 32rpx;
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #eee;
}

.total-label {
  font-size: 26rpx;
  color: #666;
}

.total-price {
  font-size: 48rpx;
  font-weight: bold;
  color: #ec4899;
  margin-left: 8rpx;
}

.purchase-btn {
  background: #06b6d4;
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 48rpx;
  border-radius: 12rpx;
  border: none;
}

.agreement {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  margin-top: 16rpx;
  display: block;
}

/* Empty State */
.empty-state {
  background: #fff;
  border-radius: 16rpx;
  padding: 80rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 24rpx;
}
</style>
