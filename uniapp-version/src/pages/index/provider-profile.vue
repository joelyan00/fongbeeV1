<template>
  <view style="min-height: 100vh; background-color: #F5F7FA; padding-bottom: 20px;">
    <!-- Navbar -->
    <view style="background-color: #FFFFFF; padding: 12px 16px; padding-top: 44px; display: flex; flex-direction: row; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <view @click="handleBack" style="padding: 8px; margin-left: -8px;">
            <AppIcon name="arrow-left" :size="20"/>
        </view>
        <text style="font-size: 18px; font-weight: 600; color: #333; margin-left: 8px;">服务商详情</text>
    </view>

    <!-- State: Loading -->
    <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 60px;">
        <view style="width: 30px; height: 30px; border: 3px solid #e0e0e0; border-top-color: #10b981; border-radius: 50%; opacity: 0.8;"></view>
        <text style="font-size: 14px; color: #999; margin-top: 12px;">加载信息中...</text>
    </view>

    <!-- State: Error/Empty -->
    <view v-else-if="!provider" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 60px;">
        <AppIcon name="alert-circle" :size="48" color="#ccc"/>
        <text style="font-size: 14px; color: #999; margin-top: 12px;">未能加载服务商信息</text>
    </view>

    <!-- Content -->
    <view v-else style="padding-bottom: 100px;">
        <!-- Header Profile Card -->
        <view style="background-color: #FFFFFF; margin: 12px; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
             <view style="display: flex; flex-direction: row; align-items: flex-start;">
                 <!-- Avatar -->
                 <view style="width: 64px; height: 64px; border-radius: 50%; background-color: #ecfdf5; margin-right: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <image v-if="provider.avatar_url" :src="provider.avatar_url" style="width: 100%; height: 100%;" mode="aspectFill"/>
                    <text v-else style="font-size: 24px; font-weight: bold; color: #059669; line-height: 1;">{{ providerInitial }}</text>
                 </view>
                 
                 <!-- Details -->
                 <view style="flex: 1; display: flex; flex-direction: column;">
                     <view style="display: flex; flex-direction: row; align-items: center; margin-bottom: 8px;">
                        <text style="font-size: 18px; font-weight: bold; color: #111; margin-right: 8px;">{{ provider.name }}</text>
                        <view style="font-size: 10px; color: #2563eb; background-color: #eff6ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #dbeafe;">已认证</view>
                     </view>
                     
                     <view style="display: flex; flex-direction: row; align-items: center; margin-bottom: 8px;">
                        <AppIcon name="star" :size="14" color="#facc15" style="margin-right: 4px;"/>
                        <text style="font-weight: bold; font-size: 14px; color: #333;">{{ provider.rating || 5.0 }}</text>
                        <view style="width: 1px; height: 12px; background-color: #eee; margin: 0 8px;"></view>
                        <text style="font-size: 12px; color: #666;">{{ provider.years_experience || 1 }}年经验</text>
                     </view>

                     <view style="display: flex; flex-direction: row; align-items: center;">
                        <AppIcon name="map-pin" :size="12" color="#999" style="margin-right: 4px;"/>
                        <text style="font-size: 12px; color: #666;">{{ provider.service_city || '全城服务' }}</text>
                     </view>
                 </view>
             </view>
        </view>

        <!-- Tabs -->
        <view style="background-color: #FFFFFF; margin: 12px; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <view style="display: flex; flex-direction: row; border-bottom: 1px solid #f0f0f0;">
                <view 
                    v-for="tab in tabs" 
                    :key="tab.key"
                    style="flex: 1; padding: 14px 0; text-align: center; position: relative;"
                    @click="activeTab = tab.key"
                >
                    <text :style="{ fontSize: '14px', color: activeTab === tab.key ? '#10b981' : '#666', fontWeight: activeTab === tab.key ? 'bold' : 'normal' }">{{ tab.label }}</text>
                    <view v-if="activeTab === tab.key" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 3px; background-color: #10b981; border-radius: 2px;"></view>
                </view>
            </view>

            <!-- Tab Content -->
            <view style="padding: 20px;">
                <!-- Services Tab -->
                <view v-if="activeTab === 'services'">
                    <view style="margin-bottom: 24px;">
                        <text style="font-size: 14px; font-weight: bold; color: #333; padding-left: 8px; border-left: 3px solid #10b981; margin-bottom: 12px; display: block;">服务类目</text>
                        <view style="display: flex; flex-direction: row; flex-wrap: wrap;">
                            <view v-for="cat in provider.service_categories" :key="cat" style="background-color: #f3f4f6; color: #374151; font-size: 12px; padding: 6px 12px; border-radius: 16px; margin-right: 8px; margin-bottom: 8px;">
                                {{ cat }}
                            </view>
                        </view>

                        <!-- Portfolio Gallery -->
                        <view style="margin-top: 24px;">
                            <view style="display:flex; align-items:center; margin-bottom:12px; border-left: 3px solid #10b981; padding-left: 10px;">
                                <text style="font-size: 14px; font-weight: bold; color: #333;">服务实拍</text>
                            </view>
                            <scroll-view scroll-x style="width: 100%; white-space: nowrap;">
                                <view v-for="(img, idx) in portfolioImages" :key="idx" style="display: inline-block; width: 120px; height: 90px; margin-right: 10px; border-radius: 8px; overflow: hidden; background-color: #eee;">
                                    <image :src="img" mode="aspectFill" style="width: 100%; height: 100%;" @click="handlePreviewImage(img)"/>
                                </view>
                            </scroll-view>
                        </view>
                    </view>
                    <view v-if="provider.description">
                         <text style="font-size: 14px; font-weight: bold; color: #333; padding-left: 8px; border-left: 3px solid #10b981; margin-bottom: 12px; display: block;">服务简介</text>
                         <text style="font-size: 14px; color: #4b5563; line-height: 1.6;">{{ provider.description }}</text>
                    </view>
                </view>

                <!-- Reviews Tab -->
                <view v-if="activeTab === 'reviews'">
                     <view v-if="!provider.reviews?.length" style="text-align: center; padding: 20px 0;">
                        <text style="color: #999; font-size: 13px;">暂无评价</text>
                    </view>
                    <view v-else v-for="review in provider.reviews" :key="review.id" style="padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #f9fafb;">
                        <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <view style="display: flex; flex-direction: row; align-items: center;">
                                <view style="width: 28px; height: 28px; background-color: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; margin-right: 8px;">{{ review.user[0] }}</view>
                                <view>
                                    <text style="font-size: 13px; font-weight: 500; color: #333; display: block;">{{ review.user }}</text>
                                    <view style="display: flex; flex-direction: row; margin-top: 2px;">
                                         <AppIcon v-for="i in 5" :key="i" name="star" :size="10" :color="i <= review.rating ? '#facc15' : '#e5e7eb'" :style="{marginRight: '2px'}" />
                                    </view>
                                </view>
                            </view>
                            <text style="font-size: 11px; color: #9ca3af;">{{ review.date }}</text>
                        </view>
                        <text style="font-size: 13px; color: #4b5563; padding-left: 36px; line-height: 1.4; display: block;">{{ review.content }}</text>
                    </view>
                </view>

                <!-- About Tab -->
                <view v-if="activeTab === 'about'">
                    <view style="background-color: #eff6ff; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                        <text style="font-size: 12px; color: #1e40af; line-height: 1.5;">该服务商已通过优服佳平台的实名认证和资质审核。为了保障您的权益，请通过平台进行交易。</text>
                    </view>
                    <view style="display: flex; flex-direction: row; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e5e7eb;">
                         <text style="font-size: 14px; color: #6b7280;">公司名称</text>
                         <text style="font-size: 14px; color: #111; font-weight: 500;">{{ provider.company_name }}</text>
                    </view>
                    <view style="display: flex; flex-direction: row; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e5e7eb;">
                         <text style="font-size: 14px; color: #6b7280;">服务语言</text>
                         <text style="font-size: 14px; color: #111; font-weight: 500;">{{ Array.isArray(provider.languages) ? provider.languages.join(', ') : (provider.languages || '中文, English') }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
    
    <!-- Bottom Action Bar (Fixed) -->
    <view v-if="showHireButton" style="position: fixed; bottom: 0; left: 0; right: 0; background-color: #FFFFFF; padding: 12px 20px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); display: flex; flex-direction: row; align-items: center; justify-content: space-between; z-index: 50;">
         <view style="display: flex; flex-direction: column;">
             <text style="font-size: 12px; color: #666;">服务报价</text>
             <text style="font-size: 20px; font-weight: bold; color: #10b981;">¥{{ quotePrice }}</text>
         </view>
         <button 
            @click="handleHire"
            :disabled="hiring"
            style="background-color: #10b981; color: #fff; font-size: 16px; font-weight: bold; padding: 0 32px; height: 44px; line-height: 44px; border-radius: 22px; border: none; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);"
         >
            {{ hiring ? '处理中...' : '立即雇佣' }}
         </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { quotesApi, ordersApi } from '@/services/api'; 

// Define locally
const API_BASE_URL = 'http://localhost:3001';

const providerId = ref('');
const orderId = ref('');
const quotePrice = ref('');
const quoteDeposit = ref('');
const quoteId = ref('');
const hasQuoted = ref(false);

const provider = ref<any>(null);
const loading = ref(true);
const hiring = ref(false);
const activeTab = ref('services');

const tabs = [
    { key: 'services', label: '服务内容' },
    { key: 'reviews', label: '用户评价' },
    { key: 'about', label: '关于我们' }
];

const showHireButton = computed(() => {
    return !loading.value && provider.value && hasQuoted.value;
});

const portfolioImages = computed(() => {
    if (provider.value?.extra_data?.portfolio) return provider.value.extra_data.portfolio;
    // Mock data for demo
    return [
        'https://picsum.photos/300/200?random=1',
        'https://picsum.photos/300/200?random=2',
        'https://picsum.photos/300/200?random=3',
        'https://picsum.photos/300/200?random=4'
    ];
});

const handlePreviewImage = (url: string) => {
    uni.previewImage({
        urls: portfolioImages.value,
        current: url
    });
};

const providerInitial = computed(() => {
    return (provider.value?.name || 'P').charAt(0);
});

onLoad((options) => {
    if (options && options.id) {
        providerId.value = options.id;
        if (options.orderId) orderId.value = options.orderId;
        if (options.hasQuoted === '1') hasQuoted.value = true;
        if (options.hasQuoted === '1') hasQuoted.value = true;
        if (options.quotePrice) quotePrice.value = options.quotePrice;
        if (options.quoteDeposit) quoteDeposit.value = options.quoteDeposit;
        if (options.quoteId) quoteId.value = options.quoteId;

        fetchProviderProfile(options.id);
    }
});

function handleBack() {
    uni.navigateBack();
}

async function fetchProviderProfile(id: string) {
    try {
        loading.value = true;
        const token = uni.getStorageSync('token');
        const res = await uni.request({
            url: `${API_BASE_URL}/api/providers/${id}/public`,
            method: 'GET',
            header: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.statusCode === 200) {
            provider.value = res.data;
        } else {
            console.error('Fetch profile failed', res.data);
            uni.showToast({ title: '无法加载信息', icon: 'none' });
        }
    } catch (e) {
        console.error(e);
        uni.showToast({ title: '网络错误', icon: 'none' });
    } finally {
        loading.value = false;
    }
}

async function handleHire() {
    if (!quoteId.value) {
        uni.showToast({ title: '无有效报价单', icon: 'none' });
        return;
    }

    const price = Number(quotePrice.value);
    const deposit = Number(quoteDeposit.value) || 0;
    const balance = price - deposit;

    const content = `请确认以下订单内容：\n\n` +
                    `订单金额：$${price}\n` +
                    `定金：$${deposit} (将扣款到平台)\n\n` +
                    `等服务开始时，您确认后，定金$${deposit}将支付给服务商，\n` +
                    `等服务商完成后，再支付余额$${balance}。`;

    uni.showModal({
        title: '确认雇佣',
        content: content,
        confirmText: '确认', // Changed from '确认并支付' to '确认' to match request style
        success: async (res) => {
            if (res.confirm) {
                 try {
                    hiring.value = true;
                    // 1. Accept Quote (Hire)
                    await quotesApi.accept(quoteId.value);
                    
                    // 2. Auto Pay Deposit (using default card)
                    // If deposit amount > 0, trigger payment
                    const depositAmt = Number(quoteDeposit.value) || 0;
                    if (depositAmt > 0 && orderId.value) {
                         uni.showLoading({ title: '正在支付定金...' });
                         await ordersApi.payDeposit(orderId.value);
                         uni.showToast({ title: '雇佣成功且已付定金', icon: 'success' });
                    } else {
                         uni.showToast({ title: '雇佣成功', icon: 'success' });
                    }
                    
                    // Delay to show toast then go back
                    setTimeout(() => {
                         uni.navigateBack();
                    }, 1500);
                } catch (error: any) {
                    console.error('Hire/Pay error:', error);
                    // If hire succeeded but pay failed?
                    // Error message likely from the failed step.
                    // If accept worked but pay failed, user is hired but unpaid.
                    // User can pay manually on next screen.
                    const msg = error.message || '操作失败';
                    if (msg.includes('绑定支付卡片') || msg.includes('payment')) {
                         uni.showToast({ title: '已雇佣，请手动支付定金', icon: 'none' });
                         setTimeout(() => uni.navigateBack(), 2000);
                    } else {
                         uni.showToast({ title: msg, icon: 'none' });
                         hiring.value = false;
                    }
                }
            }
        }
    });
}
</script>

<style>
/* Basic utility fix */
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
.shadow-top {
    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
}
</style>
