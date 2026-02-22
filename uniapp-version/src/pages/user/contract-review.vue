<template>
  <view class="page-container">
    <GlobalNavbar 
      title="合同确认" 
      background-color="#ffffff" 
      title-color="#000000" 
      icon-color="#000000"
      :show-back="true"
      :fixed="true"
    />

    <scroll-view scroll-y class="content-scroll">
      <view v-if="loading" class="loading-state">
        <view class="spinner"></view>
        <text class="loading-text">正在加载合同...</text>
      </view>
      
      <view v-else class="form-container">
        <!-- Status Indicator -->
        <view class="status-banner" :class="statusClass">
          <AppIcon :name="statusIcon" :size="20" :color="statusColor" />
          <text class="status-title">{{ statusText }}</text>
        </view>

        <!-- Project Summary Card -->
        <view class="project-summary-card">
          <view class="summary-header">
            <view class="icon-circle">
              <AppIcon name="file-text" :size="20" color="#3b82f6" />
            </view>
            <view class="summary-info">
              <text class="project-name">{{ contractData?.project_name || '定制服务' }}</text>
              <text class="contract-no">单号: {{ contractData?.contract_no }}</text>
            </view>
          </view>
          
          <view class="summary-grid">
            <view class="summary-item">
              <text class="s-label">服务方</text>
              <text class="s-value">{{ contractData?.party_b_name }}</text>
            </view>
            <view class="summary-item">
              <text class="s-label">总费用</text>
              <text class="s-value price-text">$ {{ contractData?.total_amount }}</text>
            </view>
            <view class="summary-item wide">
              <text class="s-label">服务地点</text>
              <text class="s-value">{{ contractData?.service_address }}</text>
            </view>
          </view>
        </view>

        <!-- Contract Content Rendered -->
        <view class="contract-box">
          <view class="box-header">
            <text class="box-title">合同条款内容</text>
          </view>
          <view class="contract-html-container">
            <rich-text :nodes="contractContent" class="contract-text"></rich-text>
          </view>
        </view>

        <!-- Rejection Reason if applicable -->
        <view v-if="contract?.status === 'rejected'" class="rejection-box">
          <text class="rejection-title">拒绝理由：</text>
          <text class="rejection-content">{{ contract.rejection_reason || '未说明' }}</text>
        </view>

        <!-- Note Section -->
        <view class="note-section">
          <AppIcon name="info" :size="16" color="#64748b" />
          <text class="note-text">签署合同即代表您同意以上所有条款。如有疑议，您可以选择拒绝签署并填写修改意见，或联系服务商沟通。</text>
        </view>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>

    <!-- Bottom Buttons -->
    <view class="bottom-bar" v-if="!loading && contract?.status === 'pending_user'">
      <view class="action-btn-group">
        <button class="btn btn-outline" @click="handleReject">拒绝签署</button>
        <button class="btn btn-primary" @click="handleSign" :loading="submitting">同意并签署</button>
      </view>
      <view class="cancel-link-row">
        <text class="cancel-link" @click="handleCancelOrder">不满意？取消订单并退回定金</text>
      </view>
    </view>
    
    <!-- Reject Reason Modal -->
    <view v-if="showRejectModal" class="modal-overlay" @click="showRejectModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">拒绝签署理由</text>
        </view>
        <view class="modal-body">
          <textarea 
            v-model="rejectReason" 
            class="reject-textarea" 
            placeholder="请填写您的修改意见或拒绝理由..." 
            auto-focus
          />
        </view>
        <view class="modal-footer">
          <button class="m-btn m-btn-cancel" @click="showRejectModal = false">取消</button>
          <button class="m-btn m-btn-confirm" @click="confirmReject" :loading="submitting">提交反馈</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';
import AppIcon from '@/components/Icons.vue';
import { ordersV2Api } from '@/services/api';

const orderId = ref('');
const loading = ref(true);
const submitting = ref(false);
const showRejectModal = ref(false);
const rejectReason = ref('');

const contract = ref<any>(null);
const contractData = ref<any>(null);
const contractContent = ref('');

onMounted(() => {
  const pages = getCurrentPages();
  const options = (pages[pages.length - 1] as any).options;
  if (options && options.id) {
    orderId.value = options.id;
    loadContract();
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
  }
});

const loadContract = async () => {
    try {
        loading.value = true;
        // 1. Get current draft/status
        const res = await ordersV2Api.getContractDraft(orderId.value);
        if (res.success && res.contract) {
            contract.value = res.contract;
            contractContent.value = res.contract.content;
            
            // 2. Get readable display data
            const dataRes = await ordersV2Api.getContractData(orderId.value);
            if (dataRes.success) {
                contractData.value = dataRes.contractData;
            }
        } else {
            uni.showToast({ title: '暂无合同草稿', icon: 'none' });
            setTimeout(() => uni.navigateBack(), 1500);
        }
    } catch (error: any) {
        uni.showToast({ title: '加载失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const statusText = computed(() => {
    if (!contract.value) return '';
    switch (contract.value.status) {
        case 'pending_user': return '待您确认签署';
        case 'signed': return '合同也已签署';
        case 'rejected': return '您已拒绝该草稿';
        default: return '状态维护中';
    }
});

const statusClass = computed(() => {
    if (!contract.value) return '';
    return contract.value.status === 'pending_user' ? 'status-pending' : (contract.value.status === 'signed' ? 'status-signed' : 'status-rejected');
});

const statusIcon = computed(() => {
    if (!contract.value) return 'info';
    return contract.value.status === 'signed' ? 'check-circle' : (contract.value.status === 'rejected' ? 'x-circle' : 'clock');
});

const statusColor = computed(() => {
    if (!contract.value) return '#64748b';
    return contract.value.status === 'signed' ? '#10b981' : (contract.value.status === 'rejected' ? '#ef4444' : '#3b82f6');
});

const handleSign = async () => {
    uni.showModal({
        title: '签署确认',
        content: '确认合同内容并签署？签署后即具有法律效力。',
        success: async (res) => {
            if (res.confirm) {
                try {
                    submitting.value = true;
                    const signRes = await ordersV2Api.respondContract(orderId.value, { action: 'sign' });
                    if (signRes.success) {
                        uni.showToast({ title: '签署成功', icon: 'success' });
                        setTimeout(() => uni.navigateBack(), 1500);
                    }
                } catch (error: any) {
                    uni.showToast({ title: error.message || '操作失败', icon: 'none' });
                } finally {
                    submitting.value = false;
                }
            }
        }
    });
};

const handleReject = () => {
    showRejectModal.value = true;
};

const confirmReject = async () => {
    if (!rejectReason.value.trim()) {
        uni.showToast({ title: '请填写理由', icon: 'none' });
        return;
    }
    
    try {
        submitting.value = true;
        const res = await ordersV2Api.respondContract(orderId.value, { 
            action: 'reject', 
            reason: rejectReason.value 
        });
        if (res.success) {
            uni.showToast({ title: '已反馈至服务商', icon: 'success' });
            showRejectModal.value = false;
            setTimeout(() => uni.navigateBack(), 1500);
        }
    } catch (error: any) {
        uni.showToast({ title: error.message || '操作失败', icon: 'none' });
    } finally {
        submitting.value = false;
    }
};

const handleCancelOrder = async () => {
    uni.showModal({
        title: '取消订单',
        content: '确认取消订单？由于合同尚未签署，您的定金将全额退回。',
        confirmColor: '#ef4444',
        success: async (res) => {
            if (res.confirm) {
                try {
                    submitting.value = true;
                    // For complex custom during review, this triggers a full refund
                    const cancelRes = await ordersV2Api.cancelOrder(orderId.value, { 
                        reason: '用户在合同审核阶段取消'
                    });
                    if (cancelRes.success) {
                        uni.showToast({ title: '订单已取消，退款处理中', icon: 'none' });
                        setTimeout(() => uni.switchTab({ url: '/pages/user/orders' }), 1500);
                    }
                } catch (error: any) {
                    uni.showToast({ title: error.message || '操作失败', icon: 'none' });
                } finally {
                    submitting.value = false;
                }
            }
        }
    });
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #64748b;
  font-size: 14px;
}

.form-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Status Banner */
.status-banner {
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.status-pending { background: rgba(59, 130, 246, 0.08); }
.status-signed { background: rgba(16, 185, 129, 0.08); }
.status-rejected { background: rgba(239, 68, 68, 0.08); }

.status-title {
  font-size: 15px;
  font-weight: 600;
}

/* Project Summary Card */
.project-summary-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.summary-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.icon-circle {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.contract-no {
  font-size: 11px;
  color: #64748b;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wide {
  grid-column: span 2;
}

.s-label {
  font-size: 11px;
  color: #94a3b8;
}

.s-value {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.price-text {
  color: #10b981;
  font-weight: 700;
}

/* Contract Box */
.contract-box {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.box-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fdfdfd;
}

.box-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.contract-html-container {
  padding: 16px;
  min-height: 300px;
}

.contract-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.8;
}

/* Rejection Box */
.rejection-box {
  background: #fff1f2;
  border: 1px dashed #fecdd3;
  padding: 12px;
  border-radius: 12px;
}

.rejection-title {
  font-size: 13px;
  font-weight: 600;
  color: #e11d48;
  margin-bottom: 4px;
  display: block;
}

.rejection-content {
  font-size: 13px;
  color: #4b5563;
}

.note-section {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 8px;
}

.note-text {
  flex: 1;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.safe-area-bottom {
  height: 200px;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  z-index: 100;
}

.action-btn-group {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 12px;
}

.btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.btn-outline {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
  border: none;
}

.cancel-link-row {
  display: flex;
  justify-content: center;
}

.cancel-link {
  font-size: 12px;
  color: #94a3b8;
  text-decoration: underline;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  width: 85%;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
}

.modal-body {
  padding: 16px;
}

.reject-textarea {
  width: 100%;
  height: 120px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  flex-direction: row;
  border-top: 1px solid #f1f5f9;
}

.m-btn {
  flex: 1;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  border-radius: 0;
  background: transparent;
}

.m-btn-cancel {
  color: #64748b;
  border-right: 1px solid #f1f5f9;
}

.m-btn-confirm {
  color: #3b82f6;
}
</style>
