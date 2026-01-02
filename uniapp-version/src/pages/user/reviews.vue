<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-10 border-b border-gray-100" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="p-1"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="text-lg font-bold text-gray-800">我的评价</text>
       <view class="w-6"></view>
    </view>

    <!-- Tabs -->
    <view class="flex flex-row bg-white border-b border-gray-100 sticky z-10" :style="{ top: (safeAreaTop + 44) + 'px' }">
        <view class="flex-1 text-center py-3 border-b-2 transition-colors" :class="activeTab==='standard' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-gray-500'" @click="activeTab='standard'">
            标准服务
        </view>
        <view class="flex-1 text-center py-3 border-b-2 transition-colors" :class="activeTab==='custom' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-gray-500'" @click="activeTab='custom'">
            定制服务
        </view>
    </view>

    <!-- List -->
    <view class="p-4 flex flex-col gap-4">
        <view v-for="review in reviews" :key="review.id" class="bg-white p-4 rounded-xl shadow-sm">
             <view class="flex flex-row gap-3 mb-3">
                 <image :src="review.serviceImage" class="w-12 h-12 rounded-lg bg-gray-100" mode="aspectFill" />
                 <view>
                     <text class="text-sm font-bold text-gray-800 block">{{ review.serviceName }}</text>
                     <text class="text-xs text-gray-500 block mt-1">{{ review.date }}</text>
                 </view>
             </view>
             
             <view class="flex flex-row gap-1 mb-2">
                 <!-- Since AppIcon might not support fill prop effectively depending on implementation, conditionally using colored icons -->
                 <AppIcon v-for="i in 5" :key="i" name="star" :size="16" :color="i <= review.rating ? '#F59E0B' : '#E5E7EB'" />
             </view>

             <text class="text-gray-700 text-sm mb-3 block leading-relaxed">{{ review.content }}</text>
             
             <view v-if="review.images && review.images.length" class="flex flex-row gap-2 mt-2">
                 <image v-for="(img, idx) in review.images" :key="idx" :src="img" class="w-20 h-20 rounded-lg bg-gray-50" mode="aspectFill" />
             </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

const safeAreaTop = ref(0);
const activeTab = ref('standard');
onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
});
const goBack = () => uni.navigateBack();

// Mock Data
const reviews = ref([
    { id: 1, serviceName: '家庭保洁 - 4小时', serviceImage: 'https://images.unsplash.com/photo-1581578731117-104f2a417954?w=100&h=100', date: '2023-12-10', rating: 5, content: '阿姨打扫非常干净，准时到达，很有礼貌。还会再来！', images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=100&h=100'] },
    { id: 2, serviceName: '空调维修', serviceImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100', date: '2023-11-05', rating: 4, content: '师傅很专业，很快就修好了。价格也很公道。', images: [] },
]);
</script>
