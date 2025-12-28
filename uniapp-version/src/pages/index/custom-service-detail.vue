<template>
    <view class="h-screen bg-gray-50 flex flex-col">
        <!-- Loading State -->
        <view v-if="loading" class="flex-1 flex items-center justify-center">
            <view class="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></view>
            <text class="ml-3 text-gray-500 text-sm">加载订单中...</text>
        </view>

        <!-- Error State -->
        <view v-else-if="!order" class="flex-1 flex flex-col items-center justify-center p-8">
            <AppIcon name="alert-circle" :size="48" color="#d1d5db" />
            <text class="mt-4 text-gray-400 text-sm">找不到该订单信息</text>
            <button class="mt-6 bg-gray-100 text-gray-600 px-6 py-2 rounded-full text-sm font-bold" @click="handleBack">返回</button>
        </view>

        <!-- Content -->
        <!-- We pass key to force re-render if order changes -->
        <CustomServiceDetailPage 
            v-else 
            :key="order.id"
            :order="order" 
            @back="handleBack"
            @updated="handleUpdated"
        />
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import CustomServiceDetailPage from '@/components/CustomServiceDetailPage.vue';
import AppIcon from '@/components/Icons.vue';
import { submissionsApi } from '@/services/api';

const order = ref<any>(null);
const loading = ref(true);
const currentOrderId = ref('');

onLoad((options) => {
    if (options && options.id) {
        currentOrderId.value = options.id;
        fetchOrder(options.id);
    } else {
        loading.value = false;
    }
});

onShow(() => {
    if (currentOrderId.value) {
        fetchOrder(currentOrderId.value);
    }
});

const fetchOrder = async (id: string) => {
    try {
        loading.value = true;
        const res = await submissionsApi.getById(id);
        order.value = res.submission;
    } catch (e) {
        console.error(e);
        uni.showToast({ title: '加载订单失败', icon: 'none' });
        // After timeout go back?
    } finally {
        loading.value = false;
    }
};

const handleBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.reLaunch({ url: '/pages/index/index?tab=profile' });
    }
};

const handleUpdated = (newOrder: any) => {
    order.value = newOrder;
};
</script>

<style scoped>
.h-screen { height: 100vh; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
</style>
