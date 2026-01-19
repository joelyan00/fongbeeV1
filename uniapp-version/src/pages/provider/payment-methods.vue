<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <view class="header-center-column">
        <text class="header-title">收款账户管理</text>
        <text class="header-subtitle">管理您的提现账户与收款设置</text>
      </view>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content-scroll">
      <view class="content">
        <view class="section-title">已绑定账户</view>
        
        <view class="account-list">
           <view v-for="(acc, index) in accounts" :key="index" :class="['account-card', 'bank-card']">
              <view class="card-bg-icon">
                  <AppIcon name="building-library" :size="100" color="rgba(255,255,255,0.1)" />
              </view>
              <view class="card-top">
                 <view class="flex flex-row items-center gap-2">
                     <view class="icon-circle bg-white/20">
                         <text class="icon-text">Bank</text>
                     </view>
                     <text class="card-name">{{ acc.bankName || 'Bank Account' }}</text>
                 </view>
                 <view v-if="acc.default" class="default-tag">默认</view>
              </view>
              
              <view class="bank-details">
                  <view class="detail-row">
                      <text class="label">Institution</text>
                      <text class="value">{{ acc.institution }}</text>
                  </view>
                  <view class="detail-row">
                      <text class="label">Transit</text>
                      <text class="value">{{ acc.transit }}</text>
                  </view>
                  <view class="detail-row">
                      <text class="label">Account</text>
                      <text class="value">**** {{ acc.accountNumber.slice(-4) }}</text>
                  </view>
              </view>

              <view class="card-footer">
                  <text class="card-holder">{{ acc.holder }}</text>
                  <view class="edit-btn">
                      <AppIcon name="edit" :size="16" color="#fff" />
                  </view>
              </view>
           </view>
        </view>

        <view class="add-btn-card" @click="handleAdd">
            <view class="add-icon-bg">
                <AppIcon name="plus" :size="24" color="#3b82f6" />
            </view>
            <text class="add-text">添加新的收款账户</text>
        </view>

        <view class="tips">
            <AppIcon name="info" :size="14" color="#6b7280" style="margin-top: 2px;" />
            <text class="tips-text">为了您的资金安全，收款账户户名必须与实名认证信息一致。目前仅支持加拿大本地银行账户。</text>
        </view>

      </view>
    </scroll-view>

    <!-- Add Account Modal -->
    <view v-if="showAddModal" class="modal-overlay" @click="closeModal">
       <view class="modal-container" @click.stop>
          <view class="modal-header">
             <text class="modal-title">添加银行账户</text>
             <view class="close-btn" @click="closeModal">
                <AppIcon name="x" :size="20" color="#9ca3af" />
             </view>
          </view>
          
          <scroll-view scroll-y class="modal-body-scroll">
            <view class="modal-body">
                
                <!-- Account Holder -->
                <view class="form-item">
                    <text class="input-label">账户持有人姓名 (Account Holder Name)</text>
                    <view class="input-group">
                        <AppIcon name="user" :size="20" color="#9ca3af" />
                        <input 
                            class="modal-input" 
                            placeholder="如: JOHN DOE" 
                            placeholder-class="placeholder" 
                            v-model="form.holder"
                        />
                    </view>
                </view>

                <!-- Institution Number -->
                <view class="form-item">
                    <text class="input-label">银行代码 (Institution No. - 3 digits)</text>
                    <view class="input-group">
                        <AppIcon name="building-library" :size="20" color="#9ca3af" />
                        <input 
                            class="modal-input" 
                            placeholder="003" 
                            placeholder-class="placeholder" 
                            v-model="form.institution"
                            maxlength="3"
                            type="number"
                        />
                    </view>
                </view>

                <!-- Transit Number -->
                <view class="form-item">
                    <text class="input-label">分行代码 (Transit No. - 5 digits)</text>
                    <view class="input-group">
                        <AppIcon name="map-pin" :size="20" color="#9ca3af" />
                        <input 
                            class="modal-input" 
                            placeholder="12345" 
                            placeholder-class="placeholder" 
                            v-model="form.transit"
                            maxlength="5"
                            type="number"
                        />
                    </view>
                </view>

                <!-- Account Number -->
                <view class="form-item">
                    <text class="input-label">账号 (Account No. - 7-12 digits)</text>
                    <view class="input-group">
                        <AppIcon name="credit-card" :size="20" color="#9ca3af" />
                        <input 
                            class="modal-input" 
                            placeholder="1234567" 
                            placeholder-class="placeholder" 
                            v-model="form.accountNumber"
                            maxlength="12"
                            type="number"
                        />
                    </view>
                </view>

            </view>
          </scroll-view>
          
          <view class="modal-footer">
             <view class="save-btn" @click="handleSaveAccount">
                 <text class="save-text">保存账户</text>
             </view>
          </view>
       </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

// Mock initial data
const accounts = ref([
    { 
        type: 'bank', 
        bankName: 'RBC Royal Bank', 
        holder: 'JOHN DOE', 
        institution: '003',
        transit: '00892',
        accountNumber: '123456789',
        default: true 
    }
]);

const showAddModal = ref(false);
const form = reactive({
    holder: '',
    institution: '',
    transit: '',
    accountNumber: ''
});

const handleAdd = () => {
    // Reset form
    form.holder = '';
    form.institution = '';
    form.transit = '';
    form.accountNumber = '';
    showAddModal.value = true;
};

const closeModal = () => {
    showAddModal.value = false;
};

const handleSaveAccount = () => {
    if (!form.holder) return uni.showToast({ title: '请输入持有人姓名', icon: 'none' });
    if (!form.institution || form.institution.length < 3) return uni.showToast({ title: '请输入3位银行代码', icon: 'none' });
    if (!form.transit || form.transit.length < 5) return uni.showToast({ title: '请输入5位分行代码', icon: 'none' });
    if (!form.accountNumber || form.accountNumber.length < 7) return uni.showToast({ title: '请输入有效账号', icon: 'none' });
    
    uni.showLoading({ title: '正在连接银行...' });
    
    setTimeout(() => {
        uni.hideLoading();
        accounts.value.push({
            type: 'bank',
            bankName: 'New Bank Account', // In real app, determine from Institution #
            holder: form.holder.toUpperCase(),
            institution: form.institution,
            transit: form.transit,
            accountNumber: form.accountNumber,
            default: false
        });
        showAddModal.value = false;
        uni.showToast({ title: '添加成功', icon: 'success' });
    }, 1500);
};

</script>

<style scoped>
/* Standard Header & Page */
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 30px;
  display: flex;
  flex-direction: column;
}

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

.account-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.account-card {
    min-height: 160px;
    border-radius: 20px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.bank-card {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.card-bg-icon {
    position: absolute;
    right: -20px;
    bottom: -20px;
    opacity: 0.15;
    transform: rotate(-15deg);
}

.card-top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    z-index: 5;
    margin-bottom: 20px;
}

.icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-text {
    color: #fff;
    font-weight: bold;
    font-size: 10px;
}

.card-name {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
}

.default-tag {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 6px;
    color: #fff;
    font-size: 10px;
}

.bank-details {
    display: flex;
    flex-direction: row;
    gap: 20px;
    margin-bottom: 20px;
    z-index: 5;
}

.detail-row {
    display: flex;
    flex-direction: column;
}

.detail-row .label {
    color: rgba(255,255,255,0.6);
    font-size: 10px;
    text-transform: uppercase;
    margin-bottom: 2px;
}

.detail-row .value {
    color: #fff;
    font-size: 14px;
    font-family: monospace;
    font-weight: 600;
}

.card-footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    position: relative;
    z-index: 5;
}

.card-holder {
    color: rgba(255,255,255,0.8);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
}

.edit-btn {
    width: 28px;
    height: 28px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-btn-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed #4b5563;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
}

.add-btn-card:active {
    background: rgba(255,255,255,0.05);
}

.add-icon-bg {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-text {
    color: #3b82f6;
    font-size: 14px;
    font-weight: 500;
}

.tips {
    display: flex;
    flex-direction: row;
    gap: 8px;
    padding: 0 8px;
    align-items: flex-start;
}

.tips-text {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
    flex: 1;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    padding: 20px;
}

.modal-container {
    width: 100%;
    max-width: 340px;
    background: #1f2937;
    border-radius: 20px;
    border: 1px solid #374151;
    overflow: hidden;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #374151;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.modal-title {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
}

.close-btn {
    padding: 4px;
}

.modal-body-scroll {
    max-height: 400px;
}

.modal-body {
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-label {
    color: #d1d5db;
    font-size: 13px;
    font-weight: 500;
}

.input-group {
    background: rgba(0,0,0,0.3);
    border: 1px solid #4b5563;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
}

.modal-input {
    flex: 1;
    color: #fff;
    font-size: 15px;
}

.placeholder {
    color: #6b7280;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #374151;
}

.save-btn {
    background: #10b981;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.save-btn:active {
    opacity: 0.9;
}

.save-text {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
}
</style>
