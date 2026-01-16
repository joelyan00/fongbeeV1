<template>
  <view class="min-h-screen bg-gray-50 pt-custom pb-10">
    <!-- Header -->
    <view class="bg-white p-4 border-b border-gray-100 flex flex-row items-center sticky top-0 z-10">
         <view @click="$emit('back')" class="mr-4 w-8 h-8 flex items-center justify-center">
            <AppIcon name="chevron-left" :size="24" class="text-gray-600"/>
         </view>
         <text class="font-bold text-lg flex-1 text-center pr-12">{{ pageTitle }}</text>
    </view>

    <!-- List -->
    <view class="p-4">
        <view v-if="loading" class="flex justify-center p-8">
            <text class="text-gray-400">加载中...</text>
        </view>
        <view v-else-if="submissions.length === 0" class="flex flex-col items-center justify-center mt-20">
            <view class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AppIcon name="clipboard" :size="40" class="text-gray-300"/>
            </view>
            <text class="text-gray-400 font-medium">暂无{{ statusText }}订单</text>
            <view class="mt-6 px-6 py-2 bg-emerald-50 rounded-full" @click="$emit('go-home')">
                <text class="text-emerald-600 text-sm font-bold">去发布需求</text>
            </view>
        </view>
        <view v-else class="flex flex-col gap-4">
            <view 
                v-for="item in submissions" 
                :key="item.id" 
                class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 active:scale-98 transition-transform"
                @click="viewDetail(item)"
            >
                <view class="flex flex-row justify-between items-start mb-3">
                    <view class="flex flex-row items-center gap-2">
                        <view class="w-2 h-8 rounded-full bg-emerald-500"></view>
                        <text class="font-bold text-lg text-gray-900">{{ item.form_template?.name || '定制服务需求' }}</text>
                    </view>
                    <view :class="['px-2 py-1 rounded-lg text-xs font-bold', getStatusClass(item.status)]">
                        {{ getStatusText(item.status) }}
                    </view>
                </view>
                
                <view class="pl-4 border-l-2 border-gray-100 ml-1 py-1">
                    <view v-for="(val, key) in getPreviewData(item.form_data)" :key="key" class="flex flex-row mb-1">
                        <text class="text-gray-500 text-sm w-20">{{ key }}:</text>
                        <text class="text-gray-800 text-sm flex-1 truncate">{{ val }}</text>
                    </view>
                </view>

                <view class="mt-3 pt-3 border-t border-gray-50 flex flex-row justify-between items-center">
                    <text class="text-gray-400 text-xs">{{ formatDate(item.created_at) }}</text>
                    <view class="flex flex-row items-center gap-1">
                        <text class="text-emerald-600 text-sm font-bold">查看详情</text>
                        <AppIcon name="chevron-right" :size="14" class="text-emerald-600"/>
                    </view>
                </view>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { submissionsApi } from '../services/api';
import AppIcon from './Icons.vue';

const props = defineProps<{
    initialStatus?: string;
    filterType?: string;
}>();

const emit = defineEmits(['back', 'go-home', 'view-detail']);
const submissions = ref<any[]>([]);
const loading = ref(true);

const pageTitle = computed(() => {
    if (props.filterType === 'standard') return '我的服务订单';
    if (props.filterType === 'custom') return '我的定制需求';
    return '我的订单';
});

const statusText = computed(() => {
    switch(props.initialStatus) {
        case 'pending': return '寻找中';
        case 'pending_confirm': return '待确认';
        case 'processing': return '进行中';
        case 'completed': return '已完成';
        case 'to_review': return '待评价';
        case 'cancelled': return '已取消';
        default: return '全部';
    }
});

const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
        'pending': 'bg-blue-50 text-blue-600',
        'accepted': 'bg-orange-50 text-orange-600',
        'processing': 'bg-green-50 text-green-600',
        'completed': 'bg-emerald-50 text-emerald-600',
        'cancelled': 'bg-gray-100 text-gray-400',
    };
    return map[status] || 'bg-gray-50 text-gray-500';
};

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        'pending': '寻找中',
        'accepted': '待确认',
        'processing': '进行中',
        'completed': '已完成',
        'cancelled': '已取消',
    };
    return map[status] || status;
};

const getPreviewData = (formData: any) => {
    if (!formData) return {};
    const preview: any = {};
    const keys = Object.keys(formData);
    // Take first 2 non-empty fields as preview
    let count = 0;
    for (const key of keys) {
        if (formData[key] && typeof formData[key] === 'string' && count < 2) {
            preview[key] = formData[key];
            count++;
        }
    }
    return preview;
};

const fetchOrders = async () => {
    loading.value = true;
    try {
        const params: any = {};
        let apiStatus = props.initialStatus;
        
        // Map frontend status to backend status
        if (props.initialStatus === 'pending_confirm') apiStatus = 'pending';
        if (props.initialStatus === 'to_review') apiStatus = 'completed';
        
        if (apiStatus) {
            params.status = apiStatus;
        }
        
        // If API supports type/template_type filter:
        if (props.filterType && props.filterType !== 'all') {
             params.type = props.filterType;
        }
        
        const res = await submissionsApi.getMySubmissions(params);
        let list = res.submissions || [];
        
        // Client-side filtering for custom statuses
        if (props.initialStatus === 'pending_confirm') {
            // Filter pending orders that have quotes
            list = list.filter((s: any) => (s.quotes_count || 0) > 0);
        } else if (props.initialStatus === 'pending') {
            // Optional: Filter pending orders that have NO quotes? 
            // For now, let 'Matching' show all pending or just those without quotes.
            // Let's filter to NO quotes to distinguish from 'To Confirm'
            // list = list.filter((s: any) => (s.quotes_count || 0) === 0);
        }
        
        submissions.value = list;
    } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const viewDetail = (item: any) => {
    emit('view-detail', item);
};

onMounted(() => {
    fetchOrders();
});

watch(() => props.initialStatus, () => {
    fetchOrders();
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-10 { padding-bottom: 40px; }
.p-4 { padding: 16px; }
.p-8 { padding: 32px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.pl-4 { padding-left: 16px; }
.pr-12 { padding-right: 48px; } /* Balance the back button */
.mr-4 { margin-right: 16px; }
.ml-1 { margin-left: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-6 { margin-top: 24px; }
.mt-20 { margin-top: 80px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.gap-1 { gap: 4px; }

.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-orange-50 { background-color: #fff7ed; }
.bg-green-50 { background-color: #f0fdf4; }
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-emerald-500 { background-color: #10b981; }

.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-gray-300 { color: #d1d5db; }
.text-emerald-600 { color: #059669; }
.text-blue-600 { color: #2563eb; }
.text-orange-600 { color: #ea580c; }
.text-green-600 { color: #16a34a; }

.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }
.rounded-full { border-radius: 9999px; }
.rounded-lg { border-radius: 8px; }

.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border-l-2 { border-left-width: 2px; }
.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-50 { border-color: #f9fafb; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.w-8 { width: 32px; }
.h-8 { height: 32px; }
.w-20 { width: 80px; }
.h-20 { height: 80px; }
.w-2 { width: 8px; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
