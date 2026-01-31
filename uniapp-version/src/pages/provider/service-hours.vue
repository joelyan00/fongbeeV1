<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding-bottom: 40px;">
    <!-- Header -->
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="服务时间" 
      background-color="#ffffff" 
      title-color="#111827" 
      icon-color="#111827"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    />

    <!-- Content -->
    <scroll-view scroll-y style="height: 100vh; padding-top: 8px;">
      <view style="padding: 16px; padding-bottom: 80px;">
        <view style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px; margin-left: 4px;">每周营业时间</view>
        
        <view style="background: #1f2937; border-radius: 16px; overflow: hidden; border: 1px solid #374151;">
           <view v-for="(day, index) in schedule" :key="index" style="padding: 16px; border-bottom: 1px solid #374151;">
              <view style="display: flex; justify-content: space-between; align-items: center;" :style="{ marginBottom: day.enabled ? '16px' : '0' }">
                 <text :style="{ fontSize: '15px', fontWeight: '500', color: day.enabled ? '#ffffff' : '#9ca3af' }">{{ day.name }}</text>
                 <view style="display: flex; align-items: center; gap: 12px;">
                    <text v-if="!day.enabled" style="font-size: 13px; color: #6b7280;">休息</text>
                    <switch :checked="day.enabled" color="#10b981" @change="e => toggleDay(index, e)" style="transform:scale(0.7)" />
                 </view>
              </view>
              
              <view v-if="day.enabled" style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                 <view style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <text style="font-size: 11px; color: #9ca3af;">开始</text>
                    <view @click="openTimePicker('schedule', index, 'start')" style="display: flex; align-items: center; gap: 4px;">
                        <text style="font-size: 16px; color: #ffffff; font-weight: 600;">{{ day.start }}</text>
                        <AppIcon name="chevron-down" :size="12" color="#6b7280" />
                    </view>
                 </view>
                 <view style="width: 1px; height: 24px; background: #4b5563;"></view>
                 <view style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <text style="font-size: 11px; color: #9ca3af;">结束</text>
                    <view @click="openTimePicker('schedule', index, 'end')" style="display: flex; align-items: center; gap: 4px;">
                        <text style="font-size: 16px; color: #ffffff; font-weight: 600;">{{ day.end }}</text>
                        <AppIcon name="chevron-down" :size="12" color="#6b7280" />
                    </view>
                 </view>
              </view>
           </view>
        </view>

        <view style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 32px 0 12px 4px;">加拿大法定节假日 (Public Holidays)</view>
        
        <view style="background: #1f2937; border-radius: 16px; overflow: hidden; border: 1px solid #374151;">
           <view v-for="(holiday, index) in holidays" :key="'h-'+index" style="padding: 16px; border-bottom: 1px solid #374151;">
              <view style="display: flex; justify-content: space-between; align-items: center;" :style="{ marginBottom: holiday.enabled ? '16px' : '0' }">
                 <view style="flex: 1; padding-right: 12px;">
                     <text :style="{ fontSize: '15px', fontWeight: '500', color: holiday.enabled ? '#ffffff' : '#9ca3af' }">{{ holiday.name }}</text>
                 </view>
                 <view style="display: flex; align-items: center; gap: 12px;">
                    <text v-if="!holiday.enabled" style="font-size: 13px; color: #6b7280;">休息</text>
                    <switch :checked="holiday.enabled" color="#10b981" @change="e => toggleHoliday(index, e)" style="transform:scale(0.7)" />
                 </view>
              </view>
              
              <view v-if="holiday.enabled" style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                 <view style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <text style="font-size: 11px; color: #9ca3af;">开始</text>
                    <view @click="openTimePicker('holiday', index, 'start')" style="display: flex; align-items: center; gap: 4px;">
                        <text style="font-size: 16px; color: #ffffff; font-weight: 600;">{{ holiday.start }}</text>
                        <AppIcon name="chevron-down" :size="12" color="#6b7280" />
                    </view>
                 </view>
                 <view style="width: 1px; height: 24px; background: #4b5563;"></view>
                 <view style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <text style="font-size: 11px; color: #9ca3af;">结束</text>
                     <view @click="openTimePicker('holiday', index, 'end')" style="display: flex; align-items: center; gap: 4px;">
                        <text style="font-size: 16px; color: #ffffff; font-weight: 600;">{{ holiday.end }}</text>
                        <AppIcon name="chevron-down" :size="12" color="#6b7280" />
                    </view>
                 </view>
              </view>
           </view>
        </view>

        <view style="margin-top: 32px;">
            <view 
                @click="handleSave"
                style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 100px; padding: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);"
            >
                <text style="font-size: 16px; font-weight: 600; color: #ffffff;">保存设置</text>
            </view>
        </view>
      </view>
    </scroll-view>



    <!-- Custom Time Picker Modal -->
    <view v-if="showPicker" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 999; display: flex; align-items: flex-end;" @click="closePicker">
        <view style="width: 100%; height: 300px; background: #1f2937; border-top-left-radius: 20px; border-top-right-radius: 20px; display: flex; flex-direction: column;" @click.stop>
            <view style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #374151;">
                <text @click="closePicker" style="font-size: 14px; color: #9ca3af;">取消</text>
                <text style="font-size: 16px; font-weight: 600; color: #ffffff;">选择时间</text>
                <text @click="confirmTime" style="font-size: 14px; color: #10b981; font-weight: 600;">确定</text>
            </view>
            <picker-view :value="pickerValue" @change="onPickerChange" style="width: 100%; height: 200px; margin-top: 10px;" indicator-style="height: 50px; border-top: 1px solid #374151; border-bottom: 1px solid #374151;">
                <picker-view-column>
                    <view v-for="(hour, index) in hours" :key="'h' + index" style="line-height: 50px; text-align: center; color: #ffffff;">{{ hour }} 点</view>
                </picker-view-column>
                <picker-view-column>
                    <view v-for="(minute, index) in minutes" :key="'m' + index" style="line-height: 50px; text-align: center; color: #ffffff;">{{ minute }} 分</view>
                </picker-view-column>
            </picker-view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';
import { providersApi } from '@/services/api';

interface ScheduleItem {
    name: string;
    enabled: boolean;
    start: string;
    end: string;
}

const schedule = ref<ScheduleItem[]>([
    { name: '周一', enabled: true, start: '09:00', end: '18:00' },
    { name: '周二', enabled: true, start: '09:00', end: '18:00' },
    { name: '周三', enabled: true, start: '09:00', end: '18:00' },
    { name: '周四', enabled: true, start: '09:00', end: '18:00' },
    { name: '周五', enabled: true, start: '09:00', end: '18:00' },
    { name: '周六', enabled: false, start: '10:00', end: '17:00' },
    { name: '周日', enabled: false, start: '10:00', end: '17:00' }
]);

const holidays = ref<ScheduleItem[]>([]); // Initialize with type

// Default Holidays Template
const defaultHolidays: ScheduleItem[] = [
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

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

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


