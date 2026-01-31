<template>
  <view class="page-container" style="background-color: #f9fafb; min-height: 100vh; padding-bottom: 100px;">
    <!-- Header aligned with Capsule Button -->
    <view class="header-light" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
       <view class="header-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" :style="{height: navBarHeight + 'px'}">
         <view @click="goBack" class="header-back" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title" style="font-size: 18px; font-weight: bold; color: #1f2937; position: absolute; left: 50%; transform: translateX(-50%);">我的购物车</text>
         <view class="header-placeholder" style="width: 40px;"></view>
       </view>
    </view>
    
    <!-- Spacer to push content below fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <!-- Cart Items -->
    <view class="content-area" style="padding: 16px;">
        <view v-if="items.length === 0" class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px;">
            <AppIcon name="shopping-cart" :size="48" color="#d1d5db" />
            <text class="empty-text" style="color: #9ca3af; margin-top: 16px;">购物车是空的</text>
        </view>

        <view v-else class="cart-list" style="display: flex; flex-direction: column; gap: 16px;">
            <view v-for="item in items" :key="item.id" class="cart-item" :class="{'opacity-dim': !item.available}" style="background-color: #fff; border-radius: 12px; padding: 16px; display: flex !important; flex-direction: row !important; gap: 12px; align-items: flex-start; position: relative; overflow: hidden;">
                <!-- Checkbox -->
                <view class="checkbox-area" @click="toggleSelect(item.id)" style="margin-top: 32px;">
                     <view class="checkbox" :class="{'checkbox-start': selectedItems.includes(item.id)}" :style="{width: '20px', height: '20px', borderRadius: '50%', border: selectedItems.includes(item.id) ? 'none' : '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: selectedItems.includes(item.id) ? '#10b981' : 'transparent'}">
                         <AppIcon v-if="selectedItems.includes(item.id)" name="check" :size="14" color="#fff" />
                     </view>
                </view>

                <!-- Image -->
                <image :src="item.image" mode="aspectFill" class="item-image" style="width: 80px; height: 80px; border-radius: 8px; background-color: #f3f4f6; flex-shrink: 0;" />

                <!-- Info -->
                <view class="item-info" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; height: 80px;">
                    <view>
                        <text class="item-title" style="font-size: 16px; font-weight: bold; color: #1f2937; overflow: hidden; display: block;">{{ item.title }}</text>
                        <text class="item-specs" style="font-size: 12px; color: #6b7280; margin-top: 4px; display: block;">{{ item.specs }}</text>
                        <text v-if="!item.available" class="item-unavailable" style="font-size: 12px; color: #ef4444; margin-top: 4px; display: block;">该区域暂时不支持配送</text>
                    </view>
                    <view class="item-bottom" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: flex-end !important;">
                        <text class="item-price" style="color: #059669; font-weight: bold; font-size: 16px;">${{ item.price }}</text>
                        
                        <!-- Qty Control -->
                        <view class="qty-control" style="display: flex !important; flex-direction: row !important; align-items: center !important; background-color: #f3f4f6; border-radius: 8px;">
                            <view @click.stop="updateQty(item.id, -1)" class="qty-btn" style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: #4b5563; font-weight: bold;">-</view>
                            <text class="qty-text" style="font-size: 14px; font-weight: 500; width: 24px; text-align: center;">{{ item.quantity }}</text>
                            <view @click.stop="updateQty(item.id, 1)" class="qty-btn" style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: #4b5563; font-weight: bold;">+</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="alert-box" style="margin-top: 24px; padding: 12px; background-color: #fff7ed; border-radius: 8px; border: 1px solid #ffedd5;">
            <view class="alert-content" style="display: flex !important; flex-direction: row !important; gap: 8px;">
                <AppIcon name="alert-circle" :size="16" color="#f97316" />
                <text class="alert-text" style="flex: 1; font-size: 12px; color: #c2410c; line-height: 1.4;">温馨提示：服务类商品请确认上门地址是否在服务范围内。如有疑问请联系客服。</text>
            </view>
        </view>
    </view>

    <!-- Bottom Action Bar -->
    <view class="bottom-bar" style="position: fixed; bottom: 0; left: 0; right: 0; background-color: #fff; border-top: 1px solid #f3f4f6; padding: 16px; padding-bottom: 32px; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05); z-index: 20;">
        <view class="select-all-area" @click="toggleSelectAll" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px;">
             <view class="checkbox" :class="{'checkbox-start': isAllSelected && items.length > 0}" :style="{width: '20px', height: '20px', borderRadius: '50%', border: (isAllSelected && items.length > 0) ? 'none' : '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: (isAllSelected && items.length > 0) ? '#10b981' : 'transparent'}">
                 <AppIcon v-if="isAllSelected && items.length > 0" name="check" :size="14" color="#fff" />
             </view>
             <text class="select-all-text" style="font-size: 14px; color: #4b5563;">全选</text>
        </view>

        <view class="total-area" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 16px;">
            <view class="total-info" style="display: flex; flex-direction: column; align-items: flex-end;">
                <text class="total-label" style="font-size: 12px; color: #6b7280;">合计 (不含运费)</text>
                <text class="total-price" style="font-size: 18px; font-weight: bold; color: #059669;">${{ totalPrice }}</text>
            </view>
            <button class="checkout-btn" @click="handleCheckout" style="background-color: #059669; color: white; padding-left: 24px; padding-right: 24px; height: 40px; line-height: 40px; border-radius: 12px; font-weight: bold; font-size: 14px; margin: 0;">
                去结算({{ selectedItems.length }})
            </button>
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

onMounted(() => {
    // #ifdef MP-WEIXIN
    const menuBtn = uni.getMenuButtonBoundingClientRect();
    const sysInfo = uni.getSystemInfoSync();
    statusBarHeight.value = sysInfo.statusBarHeight || 44;
    navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
    capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
    // #endif
    // #ifndef MP-WEIXIN
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
    navBarHeight.value = 44;
    capsuleWidth.value = 0;
    // #endif
});

const goBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.reLaunch({ url: '/pages/index/index' });
    }
};

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
.header-light {
    background: #ffffff;
    padding-left: 16px;
    padding-right: 16px;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #f3f4f6;
}
.header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}
.header-back {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 6px;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    line-height: 56px;
}
.header-placeholder {
    width: 40px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
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
