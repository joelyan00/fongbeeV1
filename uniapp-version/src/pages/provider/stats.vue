<template>
  <view class="stats-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="title">营业额统计</text>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Stats Cards - Single Row -->
    <view class="stats-cards">
      <view class="stat-card stat-card-green">
        <text class="stat-label">本月成交额</text>
        <text class="stat-value">$200000</text>
        <text class="stat-sub">成交数: 28</text>
      </view>
      <view class="stat-card stat-card-white">
        <text class="stat-label stat-label-gray">本月报价数</text>
        <text class="stat-value stat-value-green">30</text>
      </view>
      <view class="stat-card stat-card-orange">
        <text class="stat-label">本月提金</text>
        <text class="stat-value">$180000</text>
      </view>
      <view class="stat-card stat-card-pink">
        <text class="stat-label">本月支出</text>
        <text class="stat-value">$2000</text>
      </view>
    </view>

    <!-- Sub Tabs -->
    <view class="px-4 mt-6 flex flex-row gap-4 border-b border-gray-700">
      <view 
        @click="activeSubTab = 'schedule'" 
        :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors', 
          activeSubTab === 'schedule' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500']"
      >
        <text :class="activeSubTab === 'schedule' ? 'text-emerald-400' : 'text-gray-500'">日程安排</text>
      </view>
      <view 
        @click="activeSubTab = 'revenue'" 
        :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-lg', 
          activeSubTab === 'revenue' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-gray-500']"
      >
        <text :class="activeSubTab === 'revenue' ? 'text-emerald-400' : 'text-gray-500'">营业额</text>
      </view>
    </view>

    <!-- Schedule Tab Content -->
    <view v-if="activeSubTab === 'schedule'" class="px-4 mt-4">
      <view class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <!-- Calendar Header -->
        <view class="flex flex-row justify-between items-center mb-4">
          <text class="text-white font-bold">{{ currentYear }} 年 {{ currentMonth }} 月</text>
          <view class="flex flex-row gap-2">
            <view @click="prevMonth" class="px-3 py-1 bg-gray-700 rounded-lg">
              <text class="text-xs text-gray-300">上个月</text>
            </view>
            <view @click="goToday" class="px-3 py-1 bg-gray-700 rounded-lg">
              <text class="text-xs text-gray-300">今天</text>
            </view>
            <view @click="nextMonth" class="px-3 py-1 bg-gray-700 rounded-lg">
              <text class="text-xs text-gray-300">下个月</text>
            </view>
          </view>
        </view>

        <!-- Week Days Header -->
        <view class="grid grid-cols-7 gap-1 mb-2">
          <view v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-center py-2">
            <text class="text-xs text-gray-500">{{ day }}</text>
          </view>
        </view>

        <!-- Calendar Days -->
        <view class="grid grid-cols-7 gap-1">
          <view 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="['aspect-square flex items-center justify-center rounded-lg',
              day.isCurrentMonth ? (day.isToday ? 'bg-emerald-500' : (day.hasEvent ? 'bg-emerald-500/20' : 'bg-gray-700')) : 'bg-transparent'
            ]"
          >
            <text :class="[
              'text-sm',
              !day.isCurrentMonth ? 'text-gray-600' :
              day.isToday ? 'text-white font-bold' :
              day.hasEvent ? 'text-emerald-400' : 'text-gray-300'
            ]">{{ day.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Revenue Tab Content -->
    <view v-if="activeSubTab === 'revenue'" class="px-4 mt-4 space-y-4">
      <!-- Order Statistics -->
      <view class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <view class="flex flex-row justify-between items-center mb-4">
          <text class="font-bold text-white">订单统计报表</text>
          <text class="text-xs text-gray-500">近一周订单统计</text>
        </view>
        
        <view class="flex flex-row gap-6 mb-4">
          <view>
            <text class="text-gray-500 text-xs block">本月订单总数</text>
            <view class="flex flex-row items-baseline gap-1">
              <text class="text-xl font-bold text-white">30</text>
              <text class="text-[10px] text-red-400">10% 相比上月</text>
            </view>
          </view>
          <view>
            <text class="text-gray-500 text-xs block">本周订单总数</text>
            <view class="flex flex-row items-baseline gap-1">
              <text class="text-xl font-bold text-white">10</text>
              <text class="text-[10px] text-red-400">10% 相比上周</text>
            </view>
          </view>
        </view>

        <!-- Simple Chart Placeholder -->
        <view class="h-32 bg-gray-700/50 rounded-lg flex items-end justify-between gap-2 px-4 pb-4">
          <view v-for="(h, i) in [40, 60, 80, 50, 70, 90, 45]" :key="i" 
            class="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm"
            :style="{ height: h + '%' }"
          ></view>
        </view>
      </view>

      <!-- Transaction Statistics -->
      <view class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <view class="flex flex-row justify-between items-center mb-4">
          <text class="font-bold text-white">成交额统计报表</text>
          <text class="text-xs text-gray-500">近一周订单统计</text>
        </view>
        
        <view class="flex flex-row gap-6 mb-4">
          <view>
            <text class="text-gray-500 text-xs block">本月成交额</text>
            <view class="flex flex-row items-baseline gap-1">
              <text class="text-xl font-bold text-white">$ 20000</text>
              <text class="text-[10px] text-red-400">10% 相比上月</text>
            </view>
          </view>
          <view>
            <text class="text-gray-500 text-xs block">本周成交额</text>
            <view class="flex flex-row items-baseline gap-1">
              <text class="text-xl font-bold text-white">$ 1500</text>
              <text class="text-[10px] text-teal-400">10% 相比上周</text>
            </view>
          </view>
        </view>

        <!-- Bar Chart Placeholder -->
        <view class="h-32 bg-gray-700/50 rounded-lg flex items-end justify-between gap-2 px-4 pb-4">
          <view v-for="(h, i) in [30, 70, 50, 80, 60, 40, 55]" :key="i" 
            class="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm"
            :style="{ height: h + '%' }"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';

const activeSubTab = ref('schedule');

// Calendar logic
const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const days = [];
  const today = new Date();
  const eventDays = [5, 6, 8, 9, 10];
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
    days.push({
      date: i,
      isCurrentMonth: true,
      isToday,
      hasEvent: eventDays.includes(i)
    });
  }
  
  // Next month days to fill grid
  const remaining = 35 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false
    });
  }
  
  return days;
});

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const goToday = () => {
  currentDate.value = new Date();
};

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};
</script>

<style scoped>
/* === Exact Copy from order-hall.vue === */
.stats-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
}

.back-btn, .placeholder-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.placeholder-btn {
  background: transparent;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* Stats Cards - 4 Column Layout */
.stats-cards {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 16px;
  margin-top: 8px;
}

.stat-card {
  flex: 1;
  padding: 12px 8px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-card-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card-white {
  background: #ffffff;
}

.stat-card-orange {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
}

.stat-card-pink {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.stat-label-gray {
  color: #6b7280;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-top: 4px;
}

.stat-value-green {
  color: #059669;
}

.stat-sub {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 2px;
}

/* === Original Tailwind Utilities === */
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-emerald-400 { color: #34d399; }
.text-emerald-600 { color: #059669; }
.text-emerald-100 { color: #d1fae5; }
.text-emerald-200 { color: #a7f3d0; }
.text-orange-100 { color: #ffedd5; }
.text-pink-100 { color: #fce7f3; }
.text-red-400 { color: #f87171; }
.text-teal-400 { color: #34d399; }
.border-gray-700 { border-color: #374151; }
.border-emerald-500 { border-color: #10b981; }
.bg-emerald-500 { background-color: #10b981; }
.from-emerald-500 { --tw-gradient-from: #10b981; }
.to-emerald-600 { --tw-gradient-to: #059669; }
.to-emerald-400 { --tw-gradient-to: #34d399; }
.from-orange-400 { --tw-gradient-from: #fb923c; }
.to-orange-500 { --tw-gradient-to: #f97316; }
.from-pink-500 { --tw-gradient-from: #ec4899; }
.to-pink-600 { --tw-gradient-to: #db2777; }
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to)); }
.bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-from), var(--tw-gradient-to)); }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-t-lg { border-top-left-radius: 8px; border-top-right-radius: 8px; }
.rounded-t-sm { border-top-left-radius: 2px; border-top-right-radius: 2px; }
.aspect-square { aspect-ratio: 1 / 1; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-7 { grid-template-columns: repeat(7, 1fr); }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 16px; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.p-4 { padding: 16px; }
.mt-1 { margin-top: 4px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.pb-4 { padding-bottom: 16px; }
.pb-20 { padding-bottom: 80px; }
.h-32 { height: 128px; }
.w-8 { width: 32px; }
.h-8 { height: 32px; }
.rounded-full { border-radius: 9999px; }
.font-bold { font-weight: 700; }
.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-b-2 { border-bottom-width: 2px; }
.border-transparent { border-color: transparent; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.z-10 { z-index: 10; }
.transition-colors { transition: color 0.15s, background-color 0.15s, border-color 0.15s; }
</style>
