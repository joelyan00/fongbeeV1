<template>
  <view class="min-h-screen bg-gray-900 pt-custom">
    <!-- Header -->
    <view class="flex flex-row items-center px-4 py-3">
      <view @click="goBack" class="w-10 h-10 flex items-center justify-center">
        <AppIcon name="arrow-left" :size="20" color="#ffffff" />
      </view>
      <text class="text-white font-bold text-lg ml-2">等级与订阅机制</text>
    </view>

    <!-- Tab Switch -->
    <view class="flex flex-row px-4 py-2 gap-4">
      <view 
        @click="activeTab = 'credits'"
        :class="['pb-2 border-b-2', activeTab === 'credits' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400']"
      >
        <text class="font-medium">购买积分</text>
      </view>
      <view 
        @click="activeTab = 'membership'"
        :class="['pb-2 border-b-2', activeTab === 'membership' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400']"
      >
        <text class="font-medium">成为会员</text>
      </view>
    </view>

    <!-- Credits Tab -->
    <scroll-view scroll-y class="flex-1 px-4" style="height: calc(100vh - 200px);" v-if="activeTab === 'credits'">
      <!-- Current Credits Card -->
      <view class="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
        <view class="flex flex-row items-center justify-between">
          <view>
            <text class="text-gray-400 text-sm block">我的积分</text>
            <view class="flex flex-row items-baseline gap-2 mt-1">
              <text class="text-3xl font-bold text-teal-400">200</text>
              <text class="text-xs text-gray-500">可兑换抵扣次数：10次</text>
            </view>
          </view>
          <view class="bg-teal-600 rounded-lg px-4 py-2 active:bg-teal-700">
            <text class="text-white font-medium text-sm">购买积分</text>
          </view>
        </view>
      </view>

      <!-- Sub Tabs -->
      <view class="flex flex-row gap-6 mb-4">
        <view @click="creditsSubTab = 'auto'" :class="['pb-2 border-b-2', creditsSubTab === 'auto' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-500']">
          <text class="text-sm">自动充值</text>
        </view>
        <view @click="creditsSubTab = 'history'" :class="['pb-2 border-b-2', creditsSubTab === 'history' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-500']">
          <text class="text-sm">积分记录</text>
        </view>
      </view>

      <!-- Auto Recharge Settings -->
      <view class="bg-gray-800 rounded-xl p-4 border border-gray-700" v-if="creditsSubTab === 'auto'">
        <view class="mb-4">
          <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-gray-300">自动购买积分</text>
            <view class="flex flex-row gap-4">
              <view class="flex flex-row items-center gap-1" @click="autoBuy = true">
                <view :class="['w-4 h-4 rounded-full border-2', autoBuy ? 'border-teal-500 bg-teal-500' : 'border-gray-500']"></view>
                <text class="text-sm text-gray-400">开启</text>
              </view>
              <view class="flex flex-row items-center gap-1" @click="autoBuy = false">
                <view :class="['w-4 h-4 rounded-full border-2', !autoBuy ? 'border-teal-500 bg-teal-500' : 'border-gray-500']"></view>
                <text class="text-sm text-gray-400">关闭</text>
              </view>
            </view>
          </view>
          <input 
            type="number" 
            placeholder="请输入积分" 
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500"
          />
          <text class="text-xs text-gray-500 mt-1 block">请输入100的整数倍，最低购买100</text>
        </view>

        <view class="h-px bg-gray-700 my-4"></view>

        <view class="mb-4">
          <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-gray-300">积分赠送</text>
            <view class="flex flex-row gap-4">
              <view class="flex flex-row items-center gap-1" @click="giftCredits = true">
                <view :class="['w-4 h-4 rounded-full border-2', giftCredits ? 'border-teal-500 bg-teal-500' : 'border-gray-500']"></view>
                <text class="text-sm text-gray-400">开启</text>
              </view>
              <view class="flex flex-row items-center gap-1" @click="giftCredits = false">
                <view :class="['w-4 h-4 rounded-full border-2', !giftCredits ? 'border-teal-500 bg-teal-500' : 'border-gray-500']"></view>
                <text class="text-sm text-gray-400">关闭</text>
              </view>
            </view>
          </view>
          <input 
            type="number" 
            placeholder="请输入积分" 
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500"
          />
          <text class="text-xs text-gray-500 mt-1 block">用户分享并成功下单后，可赠送积分</text>
        </view>

        <view class="bg-teal-600 rounded-xl py-3 flex items-center justify-center active:bg-teal-700">
          <text class="text-white font-bold">保存</text>
        </view>
      </view>

      <!-- Credits History -->
      <view v-else class="flex flex-col items-center justify-center py-16">
        <AppIcon name="credit-card" :size="48" color="#4b5563" />
        <text class="text-gray-500 mt-4">暂无积分记录</text>
      </view>
    </scroll-view>

    <!-- Membership Tab -->
    <scroll-view scroll-y class="flex-1 px-4" style="height: calc(100vh - 200px);" v-else>
      <!-- Membership Tiers -->
      <view class="mb-4">
        <text class="text-gray-400 text-sm mb-3 block">选择会员等级</text>
        <view class="flex flex-row gap-2">
          <view 
            v-for="(tier, idx) in tiers" 
            :key="idx"
            :class="['flex-1 rounded-xl p-3 relative', tier.theme, selectedTier === idx ? 'ring-2 ring-emerald-400' : '']"
            @click="selectedTier = idx"
          >
            <text class="absolute top-2 right-2">👑</text>
            <text class="text-white font-bold text-sm block mb-2">{{ tier.name }}</text>
            <view class="space-y-1">
              <text v-for="(b, i) in tier.benefits" :key="i" class="text-white/80 text-[10px] block">{{ b }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Duration Selection -->
      <view class="mb-4">
        <text class="text-gray-400 text-sm mb-3 block">选择开通时长</text>
        <view class="flex flex-row gap-2">
          <view 
            v-for="(opt, idx) in durations" 
            :key="idx"
            :class="['flex-1 bg-gray-800 border rounded-xl p-3 text-center', selectedDuration === idx ? 'border-teal-500 bg-emerald-900/20' : 'border-gray-700']"
            @click="selectedDuration = idx"
          >
            <text class="text-gray-400 text-sm block">{{ opt.duration }}</text>
            <text class="text-pink-500 text-lg font-bold">¥{{ opt.price }}</text>
          </view>
        </view>
      </view>

      <!-- Payment Footer -->
      <view class="flex flex-row items-center justify-end gap-4 pt-4 border-t border-gray-700">
        <view class="text-right">
          <text class="text-gray-400 text-sm">确认待支付</text>
          <text class="text-pink-500 text-2xl font-bold ml-2">¥{{ durations[selectedDuration]?.price || 200 }}</text>
        </view>
        <view class="bg-teal-600 rounded-xl px-6 py-3 active:bg-teal-700">
          <text class="text-white font-bold">立即购买</text>
        </view>
      </view>
      <text class="text-xs text-gray-500 text-right mt-2 block">开通服务即阅读《会员协议》《服务条款》</text>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '@/components/Icons.vue';

const activeTab = ref<'credits' | 'membership'>('credits');
const creditsSubTab = ref<'auto' | 'history'>('auto');
const autoBuy = ref(false);
const giftCredits = ref(false);
const selectedTier = ref(0);
const selectedDuration = ref(0);

const tiers = [
  { name: '初级', theme: 'bg-gradient-to-br from-purple-600 to-purple-800', benefits: ['每月100积分', '每月5次报价'] },
  { name: '中级', theme: 'bg-gradient-to-br from-emerald-600 to-emerald-800', benefits: ['每月500积分', '每月10次报价'] },
  { name: '高级', theme: 'bg-gradient-to-br from-yellow-600 to-yellow-800', benefits: ['每月1000积分', '不限报价'] },
];

const durations = [
  { duration: '1个月', price: 200 },
  { duration: '3个月', price: 560 },
  { duration: '12个月', price: 1600 },
];

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.border-gray-600 { border-color: #4b5563; }
.border-gray-700 { border-color: #374151; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
</style>
