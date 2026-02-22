<template>
  <view class="page-container">
    <GlobalNavbar 
      title="起草合同" 
      background-color="#0f172a" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="true"
      :fixed="true"
    />

    <scroll-view scroll-y class="content-scroll">
      <view v-if="loading" class="loading-state">
        <view class="spinner"></view>
        <text class="loading-text">正在加载合同数据...</text>
      </view>
      
      <view v-else class="form-container">
        <!-- Project Summary Card -->
        <view class="project-summary-card">
          <view class="summary-header">
            <view class="icon-circle">
              <AppIcon name="file" :size="20" color="#60a5fa" />
            </view>
            <view class="summary-info">
              <text class="project-name">{{ contractData?.project_name || '定制服务' }}</text>
              <text class="contract-no">{{ contractData?.contract_no || '待分配' }}</text>
            </view>
          </view>
          
          <view class="summary-grid">
            <view class="summary-item">
              <text class="s-label">甲方 (客户)</text>
              <text class="s-value">{{ contractData?.party_a_name }}</text>
            </view>
            <view class="summary-item">
              <text class="s-label">乙方 (服务商)</text>
              <text class="s-value">{{ contractData?.party_b_name }}</text>
            </view>
            <view class="summary-item">
              <text class="s-label">服务地点</text>
              <text class="s-value">{{ contractData?.service_address }}</text>
            </view>
            <view class="summary-item">
              <text class="s-label">总费用</text>
              <text class="s-value price-text">$ {{ contractData?.total_amount }}</text>
            </view>
          </view>
        </view>

        <!-- Editor Section -->
        <view class="editor-container">
          <view class="section-title-row">
            <text class="section-title">合同内容条款</text>
            <view class="tip-badge">
              <text class="tip-text">支持编辑</text>
            </view>
          </view>
          
          <view class="textarea-wrapper">
             <textarea 
               v-model="contractContent" 
               class="contract-editor" 
               maxlength="-1"
               :auto-height="true"
               placeholder="通过模板生成合同内容..."
             />
          </view>
        </view>

        <!-- Note Section -->
        <view class="note-section">
          <AppIcon name="info" :size="16" color="#9ca3af" />
          <text class="note-text">温馨提示：合同发送给客户后，客户签署即具有法律效力，请谨慎核对条款。</text>
        </view>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>

    <!-- Bottom Buttons -->
    <view class="bottom-bar" v-if="!loading">
      <view class="action-btn-group">
        <button class="btn btn-outline" @click="handleSaveDraft" :loading="savingDraft">保存草稿</button>
        <button class="btn btn-primary" @click="handleSendToUser" :loading="sending">确认发送</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';
import AppIcon from '@/components/Icons.vue';
import { ordersV2Api } from '@/services/api';

const orderId = ref('');
const loading = ref(true);
const savingDraft = ref(false);
const sending = ref(false);

const contractData = ref<any>(null);
const contractContent = ref('');
const template = ref<any>(null);

onMounted(() => {
  const pages = getCurrentPages();
  const options = (pages[pages.length - 1] as any).options;
  if (options && options.id) {
    orderId.value = options.id;
    loadContractInfo();
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
  }
});

const loadContractInfo = async () => {
    try {
        loading.value = true;
        
        // 1. Try to load existing draft first
        const draftRes = await ordersV2Api.getContractDraft(orderId.value);
        if (draftRes.success && draftRes.contract) {
            contractContent.value = draftRes.contract.content;
            // Still need contractData for the header, fetch it
            const dataRes = await ordersV2Api.getContractData(orderId.value);
            if (dataRes.success) {
                contractData.value = dataRes.contractData;
                template.value = dataRes.template;
            }
        } else {
            // 2. No draft, load initialization data and initial HTML
            const res = await ordersV2Api.getContractData(orderId.value);
            if (res.success) {
                contractData.value = res.contractData;
                template.value = res.template;
                contractContent.value = res.initialHtml;
            } else {
                uni.showToast({ title: '加载失败', icon: 'none' });
            }
        }
    } catch (error: any) {
        console.error('Load contract info error:', error);
        uni.showToast({ title: error.message || '系统错误', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const handleSaveDraft = async () => {
    if (!contractContent.value) return;
    try {
        savingDraft.value = true;
        const res = await ordersV2Api.saveContract(orderId.value, {
            content: contractContent.value,
            status: 'draft'
        });
        if (res.success) {
            uni.showToast({ title: '草稿已保存', icon: 'success' });
        }
    } catch (error: any) {
        uni.showToast({ title: error.message || '保存失败', icon: 'none' });
    } finally {
        savingDraft.value = false;
    }
};

const handleSendToUser = async () => {
    uni.showModal({
        title: '发送确认',
        content: '确认合同内容无误并发送给客户签署？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    sending.value = true;
                    // Status 'pending_user' triggers the provider signature timestamp on the backend
                    const saveRes = await ordersV2Api.saveContract(orderId.value, {
                        content: contractContent.value,
                        status: 'pending_user'
                    });
                    
                    if (saveRes.success) {
                        uni.showToast({ title: '已发送至客户', icon: 'success' });
                        setTimeout(() => {
                            uni.navigateBack();
                        }, 1500);
                    }
                } catch (error: any) {
                    uni.showToast({ title: error.message || '发送失败', icon: 'none' });
                } finally {
                    sending.value = false;
                }
            }
        }
    });
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #0f172a;
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
  border: 3px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #9ca3af;
  font-size: 14px;
}

.form-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Project Summary Card */
.project-summary-card {
  background: #1e293b;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #334155;
}

.summary-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #334155;
}

.icon-circle {
  width: 44px;
  height: 44px;
  background: rgba(96, 165, 250, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
}

.contract-no {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.s-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.s-value {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 500;
}

.price-text {
  color: #10b981;
  font-weight: 700;
}

/* Editor Section */
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
}

.tip-badge {
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.tip-text {
  font-size: 10px;
  color: #10b981;
}

.textarea-wrapper {
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
  padding: 12px;
  min-height: 400px;
}

.contract-editor {
  width: 100%;
  min-height: 400px;
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.6;
}

/* Note Section */
.note-section {
  display: flex;
  flex-direction: row;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
}

.note-text {
  flex: 1;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
}

.safe-area-bottom {
  height: 100px;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0f172a;
  border-top: 1px solid #1e293b;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  z-index: 100;
}

.action-btn-group {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
}

.btn-outline {
  background: transparent;
  border: 1px solid #334155;
  color: #e2e8f0;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
  border: none;
}

.btn-primary:active {
  background: #2563eb;
}
</style>
