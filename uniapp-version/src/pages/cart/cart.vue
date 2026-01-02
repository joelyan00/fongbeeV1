<template>
  <view class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-10 border-b border-gray-100" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="p-1"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="text-lg font-bold text-gray-800">我的购物车</text>
       <view class="w-6"></view>
    </view>

    <!-- Cart Items -->
    <view class="p-4">
        <view v-if="items.length === 0" class="flex flex-col items-center justify-center pt-20">
            <AppIcon name="shopping-cart" :size="48" color="#d1d5db" />
            <text class="text-gray-400 mt-4">购物车是空的</text>
        </view>

        <view v-else class="flex flex-col gap-4">
            <view v-for="item in items" :key="item.id" class="bg-white rounded-xl p-4 flex flex-row gap-3 items-start relative overflow-hidden" :class="{'opacity-60': !item.available}">
                <!-- Checkbox -->
                <view class="mt-8" @click="toggleSelect(item.id)">
                     <view class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center" :class="{'bg-emerald-500 border-emerald-500': selectedItems.includes(item.id)}">
                         <AppIcon v-if="selectedItems.includes(item.id)" name="check" :size="14" color="#fff" />
                     </view>
                </view>

                <!-- Image -->
                <image :src="item.image" mode="aspectFill" class="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0" />

                <!-- Info -->
                <view class="flex-1 flex flex-col justify-between h-20">
                    <view>
                        <text class="text-base font-bold text-gray-800 line-clamp-1">{{ item.title }}</text>
                        <text class="text-xs text-gray-500 mt-1 block">{{ item.specs }}</text>
                        <text v-if="!item.available" class="text-xs text-red-500 mt-1 block">该区域暂时不支持配送</text>
                    </view>
                    <view class="flex flex-row justify-between items-end">
                        <text class="text-emerald-600 font-bold">¥{{ item.price }}</text>
                        
                        <!-- Qty Control -->
                        <view class="flex flex-row items-center bg-gray-100 rounded-lg">
                            <view @click.stop="updateQty(item.id, -1)" class="w-7 h-7 flex items-center justify-center text-gray-600 font-bold">-</view>
                            <text class="text-sm font-medium w-6 text-center">{{ item.quantity }}</text>
                            <view @click.stop="updateQty(item.id, 1)" class="w-7 h-7 flex items-center justify-center text-gray-600 font-bold">+</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="mt-6 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <view class="flex flex-row gap-2">
                <AppIcon name="alert-circle" :size="16" color="#f97316" />
                <view class="flex-1">
                     <text class="text-xs text-orange-700 leading-tight">温馨提示：服务类商品请确认上门地址是否在服务范围内。如有疑问请联系客服。</text>
                </view>
            </view>
        </view>
    </view>

    <!-- Bottom Action Bar -->
    <view class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 flex flex-row items-center justify-between shadow-lg z-20">
        <view class="flex flex-row items-center gap-2" @click="toggleSelectAll">
             <view class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center" :class="{'bg-emerald-500 border-emerald-500': isAllSelected && items.length > 0}">
                 <AppIcon v-if="isAllSelected && items.length > 0" name="check" :size="14" color="#fff" />
             </view>
             <text class="text-gray-600 text-sm">全选</text>
        </view>

        <view class="flex flex-row items-center gap-4">
            <view class="flex flex-col items-end">
                <text class="text-xs text-gray-500">合计 (不含运费)</text>
                <text class="text-lg font-bold text-emerald-600">¥{{ totalPrice }}</text>
            </view>
            <button class="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm m-0" @click="handleCheckout">
                去结算({{ selectedItems.length }})
            </button>
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

const safeAreaTop = ref(0);

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
});

const goBack = () => uni.navigateBack();

// Mock Data
const items = ref([
    { id: 1, title: '深度保洁服务 - 3小时', specs: '3小时 | 标准清洁剂', price: 199, quantity: 1, image: 'https://images.unsplash.com/photo-1581578731117-104f2a417954?w=200&h=200&fit=crop', available: true },
    { id: 2, title: '空调清洗 - 挂机', specs: '单台 | 高温蒸汽', price: 128, quantity: 2, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop', available: true },
    { id: 3, title: '油烟机清洗', specs: '侧吸式 | 含外观清洁', price: 158, quantity: 1, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&h=200&fit=crop', available: false },
]);

const selectedItems = ref<number[]>([]);

const isAllSelected = computed(() => items.value.length > 0 && selectedItems.value.length === items.value.length);

const totalPrice = computed(() => {
    return items.value
        .filter(item => selectedItems.value.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const toggleSelect = (id: number) => {
    if (selectedItems.value.includes(id)) {
        selectedItems.value = selectedItems.value.filter(i => i !== id);
    } else {
        selectedItems.value.push(id);
    }
};

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedItems.value = [];
    } else {
        selectedItems.value = items.value.map(i => i.id);
    }
};

const updateQty = (id: number, delta: number) => {
    const item = items.value.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty > 0) item.quantity = newQty;
};

const handleCheckout = () => {
    if (selectedItems.value.length === 0) return uni.showToast({title: '请选择商品', icon: 'none'});
    uni.showToast({title: '正在前往结算...', icon: 'none'});
};
</script>

<style scoped>
/* Tailwind utilities are usually available via Windi/Uni-Tailwind, but defining basic fallback */
.line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
}
</style>
