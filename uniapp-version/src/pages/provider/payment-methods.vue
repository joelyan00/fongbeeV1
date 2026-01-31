<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);">
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="收款账户管理" 
      background-color="#0f172a" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    />

    <!-- Content -->
    <scroll-view scroll-y style="height: calc(100vh - 8px); padding-top: 8px;">
      <view style="padding: 16px;">
        <text style="font-size: 14px; color: #9ca3af; display: block; margin-bottom: 16px;">已绑定账户</text>
        
        <!-- Account Cards -->
        <view v-for="(acc, index) in accounts" :key="index" 
          style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 16px; padding: 20px; margin-bottom: 16px; position: relative; overflow: hidden;">
          
          <!-- Background Icon -->
          <view style="position: absolute; right: -20px; bottom: -20px; opacity: 0.1;">
            <AppIcon name="building-library" :size="120" color="#ffffff" />
          </view>
          
          <!-- Card Top -->
          <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <view style="display: flex; flex-direction: row; align-items: center; gap: 12px;">
              <view style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <text style="font-size: 11px; font-weight: 700; color: #ffffff;">Bank</text>
              </view>
              <text style="font-size: 16px; font-weight: 600; color: #ffffff;">{{ acc.bankName || 'Bank Account' }}</text>
            </view>
            <view v-if="acc.default" style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px;">
              <text style="font-size: 12px; color: #ffffff;">默认</text>
            </view>
          </view>
          
          <!-- Bank Details -->
          <view style="margin-bottom: 16px;">
            <view style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 8px;">
              <text style="font-size: 12px; color: rgba(255,255,255,0.7);">Institution</text>
              <text style="font-size: 14px; color: #ffffff; font-weight: 500;">{{ acc.institution }}</text>
            </view>
            <view style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 8px;">
              <text style="font-size: 12px; color: rgba(255,255,255,0.7);">Transit</text>
              <text style="font-size: 14px; color: #ffffff; font-weight: 500;">{{ acc.transit }}</text>
            </view>
            <view style="display: flex; flex-direction: row; justify-content: space-between;">
              <text style="font-size: 12px; color: rgba(255,255,255,0.7);">Account</text>
              <text style="font-size: 14px; color: #ffffff; font-weight: 500;">**** {{ acc.accountNumber.slice(-4) }}</text>
            </view>
          </view>
          
          <!-- Card Footer -->
          <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
            <text style="font-size: 14px; font-weight: 600; color: #ffffff;">{{ acc.holder }}</text>
            <view style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <AppIcon name="edit" :size="16" color="#ffffff" />
            </view>
          </view>
        </view>

        <!-- Add Button -->
        <view @click="handleAdd" style="background: #1f2937; border: 1px dashed #374151; border-radius: 16px; padding: 20px; display: flex; flex-direction: row; align-items: center; gap: 16px; margin-bottom: 16px;">
          <view style="width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <AppIcon name="plus" :size="24" color="#3b82f6" />
          </view>
          <text style="font-size: 16px; font-weight: 500; color: #e5e7eb;">添加新的收款账户</text>
        </view>

        <!-- Tips -->
        <view style="display: flex; flex-direction: row; gap: 8px; padding: 16px; background: rgba(107, 114, 128, 0.1); border-radius: 12px;">
          <AppIcon name="info" :size="16" color="#6b7280" style="flex-shrink: 0; margin-top: 2px;" />
          <text style="font-size: 13px; color: #9ca3af; line-height: 20px;">为了您的资金安全，收款账户户名必须与实名认证信息一致。目前仅支持加拿大本地银行账户。</text>
        </view>

      </view>
    </scroll-view>

    <!-- Add Account Modal -->
    <view v-if="showAddModal" @click="closeModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 1000;">
       <view @click.stop style="width: 100%; background: #1f2937; border-radius: 20px 20px 0 0; max-height: 85vh;">
          <!-- Modal Header -->
          <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #374151;">
             <text style="font-size: 18px; font-weight: 700; color: #ffffff;">添加银行账户</text>
             <view @click="closeModal" style="width: 32px; height: 32px; background: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <AppIcon name="x" :size="18" color="#9ca3af" />
             </view>
          </view>
          
          <scroll-view scroll-y style="max-height: 60vh; padding: 20px;">
            <!-- Account Holder -->
            <view style="margin-bottom: 20px;">
              <text style="font-size: 13px; color: #9ca3af; display: block; margin-bottom: 8px;">账户持有人姓名 (Account Holder Name)</text>
              <view style="display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 14px 16px; background: #374151; border-radius: 12px; border: 1px solid #4b5563;">
                <AppIcon name="user" :size="20" color="#9ca3af" />
                <input 
                  style="flex: 1; font-size: 15px; color: #ffffff; background: transparent; border: none;"
                  placeholder="如: JOHN DOE" 
                  placeholder-style="color: #6b7280;"
                  v-model="form.holder"
                />
              </view>
            </view>

            <!-- Institution Number -->
            <view style="margin-bottom: 20px;">
              <text style="font-size: 13px; color: #9ca3af; display: block; margin-bottom: 8px;">银行代码 (Institution No. - 3 digits)</text>
              <view style="display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 14px 16px; background: #374151; border-radius: 12px; border: 1px solid #4b5563;">
                <AppIcon name="building-library" :size="20" color="#9ca3af" />
                <input 
                  style="flex: 1; font-size: 15px; color: #ffffff; background: transparent; border: none;"
                  placeholder="003" 
                  placeholder-style="color: #6b7280;"
                  v-model="form.institution"
                  maxlength="3"
                  type="number"
                />
              </view>
            </view>

            <!-- Transit Number -->
            <view style="margin-bottom: 20px;">
              <text style="font-size: 13px; color: #9ca3af; display: block; margin-bottom: 8px;">分行代码 (Transit No. - 5 digits)</text>
              <view style="display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 14px 16px; background: #374151; border-radius: 12px; border: 1px solid #4b5563;">
                <AppIcon name="map-pin" :size="20" color="#9ca3af" />
                <input 
                  style="flex: 1; font-size: 15px; color: #ffffff; background: transparent; border: none;"
                  placeholder="12345" 
                  placeholder-style="color: #6b7280;"
                  v-model="form.transit"
                  maxlength="5"
                  type="number"
                />
              </view>
            </view>

            <!-- Account Number -->
            <view style="margin-bottom: 20px;">
              <text style="font-size: 13px; color: #9ca3af; display: block; margin-bottom: 8px;">账号 (Account No. - 7-12 digits)</text>
              <view style="display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 14px 16px; background: #374151; border-radius: 12px; border: 1px solid #4b5563;">
                <AppIcon name="credit-card" :size="20" color="#9ca3af" />
                <input 
                  style="flex: 1; font-size: 15px; color: #ffffff; background: transparent; border: none;"
                  placeholder="1234567" 
                  placeholder-style="color: #6b7280;"
                  v-model="form.accountNumber"
                  maxlength="12"
                  type="number"
                />
              </view>
            </view>
          </scroll-view>
          
          <!-- Modal Footer -->
          <view style="padding: 20px; border-top: 1px solid #374151; padding-bottom: 40px;">
             <view @click="handleSaveAccount" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 14px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                 <text style="font-size: 16px; font-weight: 600; color: #ffffff;">保存账户</text>
             </view>
          </view>
       </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';

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
