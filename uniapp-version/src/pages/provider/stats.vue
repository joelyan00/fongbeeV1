<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);">
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="营业额统计" 
      background-color="#0f172a" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    />

    <!-- Stats Cards - 2x2 Grid -->
    <view style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px; padding: 16px;">
      <!-- Card 1: 本月成交额 -->
      <view style="width: 48%; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 16px; padding: 16px; box-sizing: border-box;">
        <text style="font-size: 12px; color: rgba(255,255,255,0.8); display: block; margin-bottom: 4px;">本月成交额</text>
        <text style="font-size: 22px; font-weight: 700; color: #ffffff; display: block;">$200000</text>
        <text style="font-size: 11px; color: rgba(255,255,255,0.7); display: block; margin-top: 4px;">成交数: 28</text>
      </view>
      <!-- Card 2: 本月报价数 -->
      <view style="width: 48%; background: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 16px; box-sizing: border-box;">
        <text style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">本月报价数</text>
        <text style="font-size: 22px; font-weight: 700; color: #10b981; display: block;">30</text>
      </view>
      <!-- Card 3: 本月提金 -->
      <view style="width: 48%; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); border-radius: 16px; padding: 16px; box-sizing: border-box;">
        <text style="font-size: 12px; color: rgba(255,255,255,0.8); display: block; margin-bottom: 4px;">本月提金</text>
        <text style="font-size: 22px; font-weight: 700; color: #ffffff; display: block;">$180000</text>
      </view>
      <!-- Card 4: 本月支出 -->
      <view style="width: 48%; background: linear-gradient(135deg, #be185d 0%, #ec4899 100%); border-radius: 16px; padding: 16px; box-sizing: border-box;">
        <text style="font-size: 12px; color: rgba(255,255,255,0.8); display: block; margin-bottom: 4px;">本月支出</text>
        <text style="font-size: 22px; font-weight: 700; color: #ffffff; display: block;">$2000</text>
      </view>
    </view>

    <!-- Sub Tabs -->
    <view style="display: flex; flex-direction: row; gap: 0; padding: 0 16px; border-bottom: 1px solid #374151; margin-top: 16px;">
      <view 
        @click="activeSubTab = 'schedule'" 
        :style="{
          padding: '12px 16px',
          borderBottom: activeSubTab === 'schedule' ? '2px solid #10b981' : '2px solid transparent',
          marginBottom: '-1px'
        }"
      >
        <text :style="{ fontSize: '14px', fontWeight: '500', color: activeSubTab === 'schedule' ? '#10b981' : '#6b7280' }">日程安排</text>
      </view>
      <view 
        @click="activeSubTab = 'revenue'" 
        :style="{
          padding: '12px 16px',
          borderBottom: activeSubTab === 'revenue' ? '2px solid #10b981' : '2px solid transparent',
          marginBottom: '-1px'
        }"
      >
        <text :style="{ fontSize: '14px', fontWeight: '500', color: activeSubTab === 'revenue' ? '#10b981' : '#6b7280' }">营业额</text>
      </view>
    </view>

    <!-- Schedule Tab Content -->
    <view v-if="activeSubTab === 'schedule'" style="padding: 16px;">
      <view style="background: #1f2937; border-radius: 16px; padding: 16px; border: 1px solid #374151;">
        <!-- Calendar Header -->
        <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <text style="font-size: 16px; font-weight: 700; color: #ffffff;">{{ currentYear }} 年 {{ currentMonth }} 月</text>
          <view style="display: flex; flex-direction: row; gap: 8px;">
            <view @click="prevMonth" style="padding: 6px 12px; background: #374151; border-radius: 8px;">
              <text style="font-size: 12px; color: #d1d5db;">上个月</text>
            </view>
            <view @click="goToday" style="padding: 6px 12px; background: #374151; border-radius: 8px;">
              <text style="font-size: 12px; color: #d1d5db;">今天</text>
            </view>
            <view @click="nextMonth" style="padding: 6px 12px; background: #374151; border-radius: 8px;">
              <text style="font-size: 12px; color: #d1d5db;">下个月</text>
            </view>
          </view>
        </view>

        <!-- Week Days Header -->
        <view style="display: flex; flex-direction: row; margin-bottom: 8px;">
          <view v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" style="flex: 1; text-align: center; padding: 8px 0;">
            <text style="font-size: 12px; color: #6b7280;">{{ day }}</text>
          </view>
        </view>

        <!-- Calendar Days -->
        <view style="display: flex; flex-wrap: wrap;">
          <view 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :style="{
              width: '14.28%',
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              background: !day.isCurrentMonth ? 'transparent' : day.isToday ? '#10b981' : day.hasEvent ? 'rgba(16, 185, 129, 0.2)' : '#374151',
              marginBottom: '4px'
            }"
          >
            <text :style="{
              fontSize: '14px',
              color: !day.isCurrentMonth ? '#6b7280' : day.isToday ? '#ffffff' : day.hasEvent ? '#34d399' : '#ffffff',
              fontWeight: day.isToday ? '700' : '500'
            }">{{ day.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Revenue Tab Content -->
    <view v-if="activeSubTab === 'revenue'" style="padding: 16px;">
      <!-- Order Statistics -->
      <view style="background: #1f2937; border-radius: 16px; padding: 16px; border: 1px solid #374151; margin-bottom: 16px;">
        <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <text style="font-weight: 700; color: #ffffff; font-size: 16px;">订单统计报表</text>
          <text style="font-size: 12px; color: #6b7280;">近一周订单统计</text>
        </view>
        
        <view style="display: flex; flex-direction: row; gap: 24px; margin-bottom: 16px;">
          <view>
            <text style="color: #6b7280; font-size: 12px; display: block;">本月订单总数</text>
            <view style="display: flex; flex-direction: row; align-items: baseline; gap: 4px;">
              <text style="font-size: 20px; font-weight: 700; color: #ffffff;">30</text>
              <text style="color: #f87171; font-size: 10px;">10% 相比上月</text>
            </view>
          </view>
          <view>
            <text style="color: #6b7280; font-size: 12px; display: block;">本周订单总数</text>
            <view style="display: flex; flex-direction: row; align-items: baseline; gap: 4px;">
              <text style="font-size: 20px; font-weight: 700; color: #ffffff;">10</text>
              <text style="color: #f87171; font-size: 10px;">10% 相比上周</text>
            </view>
          </view>
        </view>

        <!-- Simple Chart -->
        <view style="height: 128px; background: rgba(55, 65, 81, 0.5); border-radius: 8px; display: flex; flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 8px; padding: 16px;">
          <view v-for="(h, i) in [40, 60, 80, 50, 70, 90, 45]" :key="i" 
            :style="{ flex: '1', height: h + '%', background: 'linear-gradient(to top, #10b981, #34d399)', borderRadius: '2px 2px 0 0' }"
          ></view>
        </view>
      </view>

      <!-- Transaction Statistics -->
      <view style="background: #1f2937; border-radius: 16px; padding: 16px; border: 1px solid #374151;">
        <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <text style="font-weight: 700; color: #ffffff; font-size: 16px;">成交额统计报表</text>
          <text style="font-size: 12px; color: #6b7280;">近一周订单统计</text>
        </view>
        
        <view style="display: flex; flex-direction: row; gap: 24px; margin-bottom: 16px;">
          <view>
            <text style="color: #6b7280; font-size: 12px; display: block;">本月成交额</text>
            <view style="display: flex; flex-direction: row; align-items: baseline; gap: 4px;">
              <text style="font-size: 20px; font-weight: 700; color: #ffffff;">$ 20000</text>
              <text style="color: #f87171; font-size: 10px;">10% 相比上月</text>
            </view>
          </view>
          <view>
            <text style="color: #6b7280; font-size: 12px; display: block;">本周成交额</text>
            <view style="display: flex; flex-direction: row; align-items: baseline; gap: 4px;">
              <text style="font-size: 20px; font-weight: 700; color: #ffffff;">$ 1500</text>
              <text style="color: #2dd4bf; font-size: 10px;">10% 相比上周</text>
            </view>
          </view>
        </view>

        <!-- Bar Chart -->
        <view style="height: 128px; background: rgba(55, 65, 81, 0.5); border-radius: 8px; display: flex; flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 8px; padding: 16px;">
          <view v-for="(h, i) in [30, 70, 50, 80, 60, 40, 55]" :key="i" 
            :style="{ flex: '1', height: h + '%', background: 'linear-gradient(to top, #10b981, #34d399)', borderRadius: '2px 2px 0 0' }"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';

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
