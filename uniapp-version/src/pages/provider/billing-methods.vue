<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <view class="header-center-column">
        <text class="header-title">支付方式管理</text>
        <text class="header-subtitle">管理您的信用卡与自动充值扣款设置</text>
      </view>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content-scroll">
      <view class="content">
        <view class="section-title">我的银行卡</view>
        
        <!-- Loading State -->
        <view v-if="loading" class="py-20 flex items-center justify-center">
            <view class="loading-spinner"></view>
        </view>

        <!-- Empty State -->
        <view v-else-if="cards.length === 0" class="empty-state">
             <view class="empty-icon-bg">
                 <AppIcon name="credit-card" :size="40" color="#374151" />
             </view>
             <text class="empty-text">暂无绑定的支付卡片</text>
        </view>

        <!-- Card List -->
        <view v-else class="card-list">
           <view 
             v-for="(card, idx) in cards" 
             :key="idx" 
             class="card-item"
             :class="{ 'card-item-selected': card.is_default }"
             @click="handleSetDefault(card.id)"
           >
             <view class="card-info">
               <view class="brand-badge">
                   <text class="brand-text" v-if="card.brand === 'visa'">VISA</text>
                   <text class="brand-text" v-else-if="card.brand === 'mastercard'">MC</text>
                   <text class="brand-text" v-else>{{ card.brand.toUpperCase() }}</text>
               </view>
               <view class="flex flex-col ml-3">
                   <view class="flex flex-row items-center">
                       <text class="card-number-text">•••• {{ card.last4 }}</text>
                       <view v-if="card.is_default" class="default-badge">
                           <text class="default-badge-text">默认</text>
                       </view>
                   </view>
                   <text class="expiry-text">有效期 {{ card.exp_month }}/{{ card.exp_year }}</text>
               </view>
             </view>
             
             <view class="card-actions">
               <view class="delete-btn-icon" @click.stop="handleDeleteCard(card.id)">
                   <AppIcon name="delete" :size="18" color="#ef4444" />
               </view>
               <view 
                 class="radio-circle"
                 :class="{ 'radio-selected': card.is_default }"
               >
                  <view v-if="card.is_default" class="radio-inner"></view>
               </view>
             </view>
           </view>
        </view>

        <view class="add-btn-card" @click="openAddModal">
            <view class="add-icon-bg">
                <AppIcon name="plus" :size="24" color="#10b981" />
            </view>
            <text class="add-text">添加新的支付方式</text>
        </view>

        <view class="tips">
            <AppIcon name="shield-check" :size="14" color="#6b7280" style="margin-top: 2px;" />
            <text class="tips-text">您的卡片信息将通过经加密的 Stripe 安全通道处理。本平台不会存储您的完整卡号或安全码。</text>
        </view>
      </view>
    </scroll-view>

    <!-- Add Card Modal (Bottom Sheet Style but themed) -->
    <view v-if="showModal" class="modal-overlay" @click="closeModal">
        <view class="modal-content animate-slide-up" @click.stop="">
            <view class="modal-header">
                <text class="modal-title">添加银行卡</text>
                <view @click="closeModal" class="close-btn">
                    <AppIcon name="x" :size="24" color="#9ca3af" />
                </view>
            </view>

            <view class="modal-body">
                <text class="input-label">卡片信息 (安全加密输入)</text>
                <div id="card-element" class="stripe-input-container"></div>
                <text v-if="stripeError" class="error-text">{{ stripeError }}</text>
            </view>

            <view class="modal-footer">
                <button 
                    class="save-btn" 
                    :disabled="processing" 
                    @click="handleSaveCard"
                >
                    <text class="save-btn-text">{{ processing ? '处理中...' : '确认保存' }}</text>
                </button>
            </view>
        </view>
    </view>

    <!-- Custom Modal for Deletion Confirmation -->
    <view v-if="cardToDelete" class="custom-modal-mask" @click="cardToDelete = null">
      <view class="custom-modal-dialog delete-confirm-modal anim-scale-in" @click.stop>
        <view class="modal-icon-header bg-red-500/10">
          <AppIcon name="delete" :size="32" color="#ef4444" />
        </view>
        <view class="modal-text-content">
            <text class="modal-main-title text-white">移除支付卡</text>
            <text class="modal-sub-desc text-gray-400">确定要从您的账户中移除这张银行卡吗？此操作无法撤销。</text>
        </view>
        <view class="modal-action-footer">
          <view class="modal-action-btn cancel-btn" @click="cardToDelete = null">
            <text class="btn-label-light">取消</text>
          </view>
          <view class="modal-action-btn delete-btn" @click="confirmDeleteCard">
            <text class="btn-label-light">确认移除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { paymentApi } from '@/services/api';

// Stripe config (Matching index/payment-methods.vue)
let stripe: any = null;
let elements: any = null;
let cardElement: any = null;
const STRIPE_PK = 'pk_test_51She9JRAsmOrZbpaBm1TyoYwoakMuLEH7cTlFVmfTUBc1aDDTn8s0wNt42VvfkorBq9zbI72r81jgkOXVACVnXmD00XeM6o5Ix';

const cards = ref<any[]>([]);
const cardToDelete = ref<string | null>(null);
const loading = ref(false);
const showModal = ref(false);
const processing = ref(false);
const stripeError = ref('');

const handleBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.reLaunch({ url: '/pages/index/index?view=provider' });
    }
};

const fetchCards = async () => {
    loading.value = true;
    try {
        const res = await paymentApi.getMethods();
        cards.value = res.methods || [];
    } catch (e) {
        console.error('Fetch cards error:', e);
        uni.showToast({ title: '获取卡片失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const handleSetDefault = async (id: string) => {
    cards.value = cards.value.map(c => ({ ...c, is_default: c.id === id }));
    try {
        await paymentApi.setDefaultMethod(id);
    } catch (e) {
        console.error('Set default failed', e);
        fetchCards();
    }
};

const handleDeleteCard = (id: string) => {
    cardToDelete.value = id;
};

const confirmDeleteCard = async () => {
    if (!cardToDelete.value) return;
    const id = cardToDelete.value;
    cardToDelete.value = null;
    
    uni.showLoading({ title: '正在移除...' });
    try {
        await paymentApi.deleteMethod(id);
        uni.showToast({ title: '已移除', icon: 'success' });
        fetchCards();
    } catch (e: any) {
        uni.showToast({ title: e.message || '移除失败', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

onMounted(async () => {
    fetchCards();
    
    // Initialize Stripe from global window
    if ((window as any).Stripe) {
        stripe = (window as any).Stripe(STRIPE_PK);
    } else {
        // Fallback for H5 if script load delay
        setTimeout(() => {
            if ((window as any).Stripe) stripe = (window as any).Stripe(STRIPE_PK);
        }, 1000);
    }
});

const openAddModal = async () => {
    // #ifdef MP-WEIXIN
    uni.showToast({ title: '小程序暂不支持添加卡片', icon: 'none' });
    return;
    // #endif

    showModal.value = true;
    stripeError.value = '';
    
    await nextTick();
    
    if (stripe && !cardElement) {
        elements = stripe.elements();
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': { color: '#4b5563' },
                },
            },
            hidePostalCode: true,
        });
        cardElement.mount('#card-element');
    }
};

const closeModal = () => {
    showModal.value = false;
};

const handleSaveCard = async () => {
    if (!stripe || !cardElement) return;
    
    processing.value = true;
    stripeError.value = '';

    try {
        const { clientSecret } = await paymentApi.createSetupIntent();
        const result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: { card: cardElement }
        });

        if (result.error) {
            stripeError.value = result.error.message;
        } else {
            uni.showToast({ title: '添加成功', icon: 'success' });
            closeModal();
            cardElement.clear();
            setTimeout(fetchCards, 1500);
        }
    } catch (e: any) {
        stripeError.value = e.message || '系统错误';
    } finally {
        processing.value = false;
    }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
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

.placeholder-btn { background: transparent; }

.header-center-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.header-subtitle {
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  margin-top: 4px;
}

.content-scroll { flex: 1; }
.content { padding: 24px 16px; }

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #9ca3af;
    margin-bottom: 16px;
    margin-left: 4px;
}

.card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.card-item {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s;
}

.card-item-selected {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.card-info {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.brand-badge {
    width: 48px;
    height: 32px;
    background: #ffffff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.brand-text {
    font-size: 10px;
    font-weight: 800;
    color: #1e293b;
}

.card-number-text {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
}

.expiry-text {
    color: #9ca3af;
    font-size: 12px;
    margin-top: 2px;
}

.default-badge {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    padding: 0 6px;
    height: 18px;
    border-radius: 4px;
    margin-left: 8px;
    display: flex;
    align-items: center;
}

.default-badge-text {
    color: #10b981;
    font-size: 10px;
    font-weight: 600;
}

.radio-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #374151;
    display: flex;
    align-items: center;
    justify-content: center;
}

.radio-selected {
    border-color: #10b981;
}

.radio-inner {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #10b981;
}

.card-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
}

.delete-btn-icon {
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.08);
    transition: all 0.2s;
}

.delete-btn-icon:active {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(0.9);
}

.custom-modal-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
}

.custom-modal-dialog {
    background-color: #1e293b;
    width: 100%;
    max-width: 320px;
    border-radius: 28px;
    padding: 40px 24px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-icon-header {
    width: 64px;
    height: 64px;
    background-color: rgba(239, 68, 68, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
}

.modal-text-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
    text-align: center;
}

.modal-main-title {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 8px;
}

.modal-sub-desc {
    font-size: 14px;
    color: #9ca3af;
    line-height: 1.6;
}

.modal-action-footer {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 12px;
}

.modal-action-btn {
    flex: 1;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.modal-action-btn:active {
    opacity: 0.8;
    transform: scale(0.96);
}

.cancel-btn {
    background-color: #334155;
}

.delete-btn {
    background-color: #ef4444;
}

.btn-label-light {
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
}

.anim-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.add-btn-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed #4b5563;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;
}

.add-btn-card:active { background: rgba(255,255,255,0.05); }

.add-icon-bg {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-text {
    color: #10b981;
    font-size: 14px;
    font-weight: 600;
}

.tips {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 0 4px;
}

.tips-text {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.6;
    flex: 1;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal-content {
    background: #1e293b;
    width: 100%;
    max-width: 360px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.1);
    overflow: hidden;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #334155;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.modal-title { color: #ffffff; font-size: 18px; font-weight: 700; }
.close-btn { padding: 4px; }

.modal-body { padding: 24px; }
.input-label { color: #9ca3af; font-size: 14px; margin-bottom: 12px; display: block; }

.stripe-input-container {
    background: #111827;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 14px;
}

.error-text { color: #ef4444; font-size: 12px; margin-top: 10px; display: block; }

.modal-footer { padding: 0 24px 32px; }

.save-btn {
    background: #10b981;
    height: 52px;
    border-radius: 12px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
}

.save-btn-text { color: #ffffff; font-size: 16px; font-weight: 700; }

.loading-spinner {
    width: 32px; height: 32px;
    border: 3px solid rgba(16, 185, 129, 0.2);
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
