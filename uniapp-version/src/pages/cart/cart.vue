<template>
  <view class="page-container">
    <!-- Header -->
    <view class="custom-header" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="header-icon"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="header-title">我的购物车</text>
       <view class="header-placeholder"></view>
    </view>

    <!-- Cart Items -->
    <view class="content-area">
        <view v-if="items.length === 0" class="empty-state">
            <AppIcon name="shopping-cart" :size="48" color="#d1d5db" />
            <text class="empty-text">购物车是空的</text>
        </view>

        <view v-else class="cart-list">
            <view v-for="item in items" :key="item.id" class="cart-item" :class="{'opacity-dim': !item.available}">
                <!-- Checkbox -->
                <view class="checkbox-area" @click="toggleSelect(item.id)">
                     <view class="checkbox" :class="{'checkbox-start': selectedItems.includes(item.id)}">
                         <AppIcon v-if="selectedItems.includes(item.id)" name="check" :size="14" color="#fff" />
                     </view>
                </view>

                <!-- Image -->
                <image :src="item.image" mode="aspectFill" class="item-image" />

                <!-- Info -->
                <view class="item-info">
                    <view>
                        <text class="item-title">{{ item.title }}</text>
                        <text class="item-specs">{{ item.specs }}</text>
                        <text v-if="!item.available" class="item-unavailable">该区域暂时不支持配送</text>
                    </view>
                    <view class="item-bottom">
                        <text class="item-price">¥{{ item.price }}</text>
                        
                        <!-- Qty Control -->
                        <view class="qty-control">
                            <view @click.stop="updateQty(item.id, -1)" class="qty-btn">-</view>
                            <text class="qty-text">{{ item.quantity }}</text>
                            <view @click.stop="updateQty(item.id, 1)" class="qty-btn">+</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="alert-box">
            <view class="alert-content">
                <AppIcon name="alert-circle" :size="16" color="#f97316" />
                <text class="alert-text">温馨提示：服务类商品请确认上门地址是否在服务范围内。如有疑问请联系客服。</text>
            </view>
        </view>
    </view>

    <!-- Bottom Action Bar -->
    <view class="bottom-bar">
        <view class="select-all-area" @click="toggleSelectAll">
             <view class="checkbox" :class="{'checkbox-start': isAllSelected && items.length > 0}">
                 <AppIcon v-if="isAllSelected && items.length > 0" name="check" :size="14" color="#fff" />
             </view>
             <text class="select-all-text">全选</text>
        </view>

        <view class="total-area">
            <view class="total-info">
                <text class="total-label">合计 (不含运费)</text>
                <text class="total-price">¥{{ totalPrice }}</text>
            </view>
            <button class="checkout-btn" @click="handleCheckout">
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
.page-container {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 100px;
}
.custom-header {
    background-color: #fff;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #f3f4f6;
}
.header-icon {
    padding: 4px;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
}
.header-placeholder {
    width: 24px;
}
.content-area {
    padding: 16px;
}
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 80px;
}
.empty-text {
    color: #9ca3af;
    margin-top: 16px;
}
.cart-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.cart-item {
    background-color: #fff;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
}
.opacity-dim {
    opacity: 0.6;
}
.checkbox-area {
    margin-top: 32px;
}
.checkbox {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
}
.checkbox-start {
    background-color: #10b981;
    border-color: #10b981;
}
.item-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background-color: #f3f4f6;
    flex-shrink: 0;
}
.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 80px;
}
.item-title {
    font-size: 16px;
    font-weight: bold;
    color: #1f2937;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
}
.item-specs {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
    display: block;
}
.item-unavailable {
    font-size: 12px;
    color: #ef4444;
    margin-top: 4px;
    display: block;
}
.item-bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
}
.item-price {
    color: #059669;
    font-weight: bold;
    font-size: 16px;
}
.qty-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #f3f4f6;
    border-radius: 8px;
}
.qty-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4b5563;
    font-weight: bold;
}
.qty-text {
    font-size: 14px;
    font-weight: 500;
    width: 24px;
    text-align: center;
}
.alert-box {
    margin-top: 24px;
    padding: 12px;
    background-color: #fff7ed;
    border-radius: 8px;
    border: 1px solid #ffedd5;
}
.alert-content {
    display: flex;
    flex-direction: row;
    gap: 8px;
}
.alert-text {
    flex: 1;
    font-size: 12px;
    color: #c2410c;
    line-height: 1.4;
}
.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    border-top: 1px solid #f3f4f6;
    padding: 16px;
    padding-bottom: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
    z-index: 20;
}
.select-all-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}
.select-all-text {
    font-size: 14px;
    color: #4b5563;
}
.total-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
}
.total-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
.total-label {
    font-size: 12px;
    color: #6b7280;
}
.total-price {
    font-size: 18px;
    font-weight: bold;
    color: #059669;
}
.checkout-btn {
    background-color: #059669;
    color: white;
    padding-left: 24px;
    padding-right: 24px;
    height: 40px;
    line-height: 40px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 14px;
    margin: 0;
}
</style>
