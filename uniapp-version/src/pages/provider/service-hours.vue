<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" class="text-white"/>
      </view>
      <view class="header-center-column">
        <text class="header-title">服务时间</text>
        <text class="header-subtitle">设置您的可预约时间段和休息日</text>
      </view>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content-scroll">
      <view class="content">
        <view class="section-title">每周营业时间</view>
        
        <view class="schedule-list">
           <view v-for="(day, index) in schedule" :key="index" class="schedule-card">
              <view class="card-header">
                 <view class="flex flex-row items-center gap-2">
                    <view :class="['day-badge', day.enabled ? 'day-active' : 'day-inactive']">
                        <text :class="['day-text', day.enabled ? 'text-white' : 'text-gray-500']">{{ day.name }}</text>
                    </view>
                    <text class="status-label" v-if="!day.enabled">休息</text>
                 </view>
                 <switch :checked="day.enabled" color="#10b981" @change="e => toggleDay(index, e)" style="transform:scale(0.8)" />
              </view>
              
              <view v-if="day.enabled" class="time-selector">
                 <view class="time-box">
                    <text class="time-label">开始</text>
                    <view class="time-value-box" @click="openTimePicker('schedule', index, 'start')">
                        <text class="time-value">{{ day.start }}</text>
                        <AppIcon name="chevron-down" :size="14" color="#6b7280" />
                    </view>
                 </view>
                 <view class="time-divider"></view>
                 <view class="time-box">
                    <text class="time-label">结束</text>
                    <view class="time-value-box" @click="openTimePicker('schedule', index, 'end')">
                        <text class="time-value">{{ day.end }}</text>
                         <AppIcon name="chevron-down" :size="14" color="#6b7280" />
                    </view>
                 </view>
              </view>
           </view>
        </view>

        <view class="section-title" style="margin-top: 24px;">加拿大法定节假日 (Public Holidays)</view>
        <view class="schedule-list">
           <view v-for="(holiday, index) in holidays" :key="'h-'+index" class="schedule-card">
              <view class="card-header">
                 <view class="flex flex-row items-center gap-2">
                    <view :class="['day-badge', holiday.enabled ? 'day-active' : 'day-inactive']">
                        <text :class="['day-text', holiday.enabled ? 'text-white' : 'text-gray-500']">{{ holiday.name }}</text>
                    </view>
                    <text class="status-label" v-if="!holiday.enabled">休息</text>
                 </view>
                 <switch :checked="holiday.enabled" color="#10b981" @change="e => toggleHoliday(index, e)" style="transform:scale(0.8)" />
              </view>
              
              <view v-if="holiday.enabled" class="time-selector">
                 <view class="time-box">
                    <text class="time-label">开始</text>
                    <view class="time-value-box" @click="openTimePicker('holiday', index, 'start')">
                        <text class="time-value">{{ holiday.start }}</text>
                        <AppIcon name="chevron-down" :size="14" color="#6b7280" />
                    </view>
                 </view>
                 <view class="time-divider"></view>
                 <view class="time-box">
                    <text class="time-label">结束</text>
                     <view class="time-value-box" @click="openTimePicker('holiday', index, 'end')">
                        <text class="time-value">{{ holiday.end }}</text>
                        <AppIcon name="chevron-down" :size="14" color="#6b7280" />
                    </view>
                 </view>
              </view>
           </view>
        </view>

        <view class="save-btn-container">
            <view class="save-btn" @click="handleSave">
                <text class="save-text">保存设置</text>
            </view>
        </view>

    <!-- Custom Time Picker Modal -->
    <view v-if="showPicker" class="picker-overlay" @click="closePicker">
        <view class="picker-content" @click.stop>
            <view class="picker-header">
                <text class="picker-cancel" @click="closePicker">取消</text>
                <text class="picker-title">选择时间</text>
                <text class="picker-confirm" @click="confirmTime">确定</text>
            </view>
            <picker-view :value="pickerValue" @change="onPickerChange" class="picker-view" indicator-style="height: 50px;">
                <picker-view-column>
                    <view class="picker-item" v-for="(hour, index) in hours" :key="'h' + index">{{ hour }} 点</view>
                </picker-view-column>
                <picker-view-column>
                    <view class="picker-item" v-for="(minute, index) in minutes" :key="'m' + index">{{ minute }} 分</view>
                </picker-view-column>
            </picker-view>
        </view>
    </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { providersApi } from '@/services/api';

const schedule = ref([
    { name: '周一', enabled: true, start: '09:00', end: '18:00' },
    { name: '周二', enabled: true, start: '09:00', end: '18:00' },
    { name: '周三', enabled: true, start: '09:00', end: '18:00' },
    { name: '周四', enabled: true, start: '09:00', end: '18:00' },
    { name: '周五', enabled: true, start: '09:00', end: '18:00' },
    { name: '周六', enabled: false, start: '10:00', end: '17:00' },
    { name: '周日', enabled: false, start: '10:00', end: '17:00' }
]);

const holidays = ref([]); // Initialize empty, will be populated on load

// Default Holidays Template
const defaultHolidays = [
    { name: 'New Year\'s Day (元旦)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Good Friday (耶稣受难日)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Victoria Day (维多利亚日)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Canada Day (国庆日)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Labour Day (劳动节)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Thanksgiving (感恩节)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Remembrance Day (老兵节)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Christmas Day (圣诞节)', enabled: false, start: '09:00', end: '18:00' },
    { name: 'Boxing Day (节礼日)', enabled: false, start: '09:00', end: '18:00' }
];

// Picker Data
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];

// Picker State
const showPicker = ref(false);
const pickerValue = ref([9, 0]); // Default 09:00
const currentContext = ref<{ type: 'schedule' | 'holiday', index: number, field: 'start' | 'end' } | null>(null);

const goBack = () => uni.navigateBack();

const toggleDay = (index: number, e: any) => {
    schedule.value[index].enabled = e.detail.value;
};

const toggleHoliday = (index: number, e: any) => {
    holidays.value[index].enabled = e.detail.value;
};

const openTimePicker = (type: 'schedule' | 'holiday', index: number, field: 'start' | 'end') => {
    currentContext.value = { type, index, field };
    
    // Parse current time to set initial picker value
    const currentTime = type === 'schedule' ? schedule.value[index][field] : holidays.value[index][field];
    const [h, m] = currentTime.split(':');
    
    // Find closest indices
    const hIndex = hours.findIndex(item => item === h);
    // Find closest minute match (since current data might have :00, but we use :00, :15...)
    // Just simple match or default to 0
    let mIndex = minutes.findIndex(item => item === m);
    if (mIndex === -1) mIndex = 0; // Default to 00 if not found (e.g. if original was 12:05)
    
    pickerValue.value = [hIndex !== -1 ? hIndex : 9, mIndex];
    showPicker.value = true;
};

const closePicker = () => {
    showPicker.value = false;
    currentContext.value = null;
};

const onPickerChange = (e: any) => {
    pickerValue.value = e.detail.value;
};

const confirmTime = () => {
    if (!currentContext.value) return;
    
    const [hIndex, mIndex] = pickerValue.value;
    const selectedTime = `${hours[hIndex]}:${minutes[mIndex]}`;
    
    const { type, index, field } = currentContext.value;
    
    if (type === 'schedule') {
        schedule.value[index][field] = selectedTime;
    } else {
        holidays.value[index][field] = selectedTime;
    }
    
    closePicker();
};

const loadData = async () => {
    try {
        uni.showLoading({ title: '加载中...' });
        const { profile } = await providersApi.getMyProfile();
        
        if (profile) {
            // Load Schedule if exists
            if (profile.schedule && Array.isArray(profile.schedule) && profile.schedule.length > 0) {
                // Merge with default structure to ensure all days exist
                schedule.value = schedule.value.map(defaultDay => {
                    const savedDay = profile.schedule.find((d: any) => d.name === defaultDay.name);
                    return savedDay ? { ...defaultDay, ...savedDay } : defaultDay;
                });
            }
            
            // Load Holidays if exists, otherwise use default template
            if (profile.holidays && Array.isArray(profile.holidays) && profile.holidays.length > 0) {
                holidays.value = profile.holidays;
            } else {
                holidays.value = JSON.parse(JSON.stringify(defaultHolidays));
            }
        } else {
             holidays.value = JSON.parse(JSON.stringify(defaultHolidays));
        }
    } catch (error) {
        console.error('Failed to load schedule:', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
        holidays.value = JSON.parse(JSON.stringify(defaultHolidays));
    } finally {
        uni.hideLoading();
    }
};

onMounted(() => {
    loadData();
});

const handleSave = async () => {
    try {
        uni.showLoading({ title: '保存中...' });
        
        await providersApi.updateProfile({
            schedule: schedule.value,
            holidays: holidays.value
        });
        
        uni.hideLoading();
        uni.showToast({ title: '设置已保存', icon: 'success' });
        setTimeout(goBack, 1000);
    } catch (error) {
        console.error('Save schedule error:', error);
        uni.hideLoading();
        uni.showToast({ title: '保存失败', icon: 'none' });
    }
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

/* Standard Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
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

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

.header-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
  text-align: center;
}

.header-center-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Content */
.content-scroll { flex: 1; }
.content { padding: 0 16px 40px; }

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #9ca3af;
    margin-bottom: 12px;
    margin-left: 4px;
}

.schedule-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 100px;
}

.schedule-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.day-badge {
    padding: 4px 10px;
    border-radius: 8px;
    transition: all 0.3s;
}

.day-active {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.day-inactive {
    background: #374151;
    border: 1px solid #4b5563;
}

.day-text {
    font-size: 14px;
    font-weight: 600;
}

.status-label {
    font-size: 13px;
    color: #6b7280;
}

.time-selector {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #374151;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.time-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.time-label {
    font-size: 12px;
    color: #6b7280;
}

.time-value-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
}

.time-value {
    font-size: 18px;
    color: #ffffff;
    font-weight: 500;
    font-family: monospace;
}

.time-divider {
    width: 20px;
    height: 1px;
    background: #4b5563;
    margin: 0 16px;
    align-self: center; /* Changed from flex-end */
    margin-top: 14px; /* Adjust for alignment */
}

/* Custom Picker Styles */
.picker-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.picker-content {
    background-color: #1f2937;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.picker-cancel {
    color: #9ca3af;
    font-size: 16px;
}

.picker-title {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
}

.picker-confirm {
    color: #10b981;
    font-size: 16px;
    font-weight: 600;
}

.picker-view {
    width: 100%;
    height: 250px;
}

.picker-item {
    line-height: 50px;
    text-align: center;
    color: #fff;
    font-size: 18px;
}

.save-btn-container {
    padding: 24px 0;
}

.save-btn {
    height: 50px;
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.save-btn:active {
    transform: scale(0.98);
}

.save-text {
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
}
</style>
