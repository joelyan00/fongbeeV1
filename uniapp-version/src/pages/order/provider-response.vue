<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="header-row">
        <view @click="goHome" class="header-back">
          <AppIcon name="home" :size="24" color="#ffffff" />
        </view>
        <text class="header-title">订单响应</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载订单信息...</text>
    </view>

    <!-- Token Expired -->
    <view v-else-if="tokenExpired" class="error-container">
      <AppIcon name="clock" :size="48" color="#f59e0b" />
      <text class="error-title">链接已过期</text>
      <text class="error-desc">该链接有效期为48小时，请登录后查看订单详情。</text>
      <view class="action-btn primary" @click="goToLogin">去登录</view>
    </view>

    <!-- Error -->
    <view v-else-if="errorMsg" class="error-container">
      <AppIcon name="alert-circle" :size="48" color="#ef4444" />
      <text class="error-title">加载失败</text>
      <text class="error-desc">{{ errorMsg }}</text>
      <view class="action-btn primary" @click="goHome">返回首页</view>
    </view>

    <!-- Order Content -->
    <view v-else class="content">
      <!-- Order Info Card -->
      <view class="order-card">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.order_no }}</text>
          <view class="status-badge" :class="order.provider_response_status">
            {{ getStatusLabel(order.provider_response_status) }}
          </view>
        </view>
        
        <view class="service-info">
          <image v-if="order.service_image" :src="order.service_image" class="service-image" mode="aspectFill" />
          <view v-else class="service-image-placeholder">
            <AppIcon name="clipboard" :size="24" color="#9ca3af" />
          </view>
          <view class="service-detail">
            <text class="service-name">{{ order.service_name || '服务订单' }}</text>
            <text class="service-amount">${{ order.total_amount }}</text>
          </view>
        </view>

        <view class="user-info">
          <AppIcon name="user" :size="16" color="#6b7280" />
          <text class="user-text">客户: {{ order.user?.name }} · {{ order.user?.phone }}</text>
        </view>

        <!-- User Note Display -->
        <view v-if="order.user_note" class="note-section">
          <AppIcon name="message-square" :size="16" color="#6b7280" style="margin-top: 2px;" />
          <view class="note-content">
            <text class="note-label">备注:</text>
            <text class="note-text">{{ order.user_note }}</text>
          </view>
        </view>

        <view class="order-time">
          <AppIcon name="clock" :size="14" color="#9ca3af" />
          <text class="time-text">下单时间: {{ formatDate(order.created_at) }}</text>
        </view>
      </view>

      <!-- Action Buttons (only if pending) -->
      <view v-if="order.provider_response_status === 'pending'" class="action-section">
        <text class="action-title">请选择您的响应</text>
        
        <!-- Row 1: Message & Time -->
        <view class="action-row">
          <view class="action-card message" @click="goToChat">
            <AppIcon name="message" :size="28" color="#3b82f6" />
            <text class="action-label">留言沟通</text>
          </view>
          <view class="action-card time" @click="showTimeModal = true">
            <AppIcon name="calendar" :size="28" color="#8b5cf6" />
            <text class="action-label">建议时间</text>
          </view>
        </view>
        
        <!-- Row 2: Reject (smaller) -->
        <view class="reject-row">
          <view class="reject-btn" @click="showRejectModal = true">
            <AppIcon name="x" :size="18" color="#ef4444" />
            <text class="reject-label">暂不接单</text>
          </view>
        </view>
      </view>
      
      <!-- Fixed Bottom Accept Button (only if pending) -->
      <view v-if="order.provider_response_status === 'pending'" class="fixed-bottom-bar">
        <view class="accept-btn" @click="showAcceptModal = true">
          <AppIcon name="check" :size="22" color="#ffffff" />
          <text class="accept-btn-text">接受订单</text>
        </view>
      </view>

      <!-- Already Responded -->
      <view v-else class="response-result">
        <view v-if="order.provider_response_status === 'accepted'" class="result-card success">
          <AppIcon name="check-circle" :size="32" color="#10b981" />
          <text class="result-title">已接受订单</text>
          <text v-if="order.proposed_service_time" class="result-desc">
            服务时间: {{ formatDate(order.proposed_service_time) }}
          </text>
        </view>
        <view v-else-if="order.provider_response_status === 'rejected'" class="result-card error">
          <AppIcon name="x" :size="32" color="#ef4444" />
          <text class="result-title">已拒绝订单</text>
          <text v-if="order.provider_message" class="result-desc">{{ order.provider_message }}</text>
        </view>
        <view v-else class="result-card negotiating">
          <AppIcon name="message" :size="32" color="#3b82f6" />
          <text class="result-title">协商中</text>
          <text v-if="order.provider_message" class="result-desc">{{ order.provider_message }}</text>
        </view>
      </view>

      <!-- Chat Section (Persistent) -->
      <view class="chat-section">
        <view class="section-header">
          <AppIcon name="message-square" :size="18" color="#3b82f6" />
          <text class="section-title">沟通历史</text>
        </view>

        <view class="message-list">
          <view v-if="messages.length === 0" class="empty-chat">
            <text class="empty-text">暂无沟通记录，您可以发送留言与客户沟通。</text>
          </view>
          <view 
            v-for="msg in messages" 
            :key="msg.id" 
            class="message-item"
            :class="{ 'is-me': msg.users?.role === 'provider', 'is-system': msg.is_system }"
          >
            <view class="message-bubble">
              <text class="message-content">{{ msg.content }}</text>
              <text class="message-time">{{ formatDate(msg.created_at) }}</text>
            </view>
          </view>
        </view>

        <view class="chat-input-area">
          <textarea 
            v-model="messageText" 
            placeholder="输入消息..." 
            class="chat-textarea" 
            auto-height
            :fixed="true"
            cursor-spacing="20"
          />
          <view class="send-btn" :class="{ disabled: !messageText.trim() || submitting }" @click="handleSendChatMessage">
            <AppIcon name="send" :size="20" color="#ffffff" />
          </view>
        </view>
      </view>
    </view>

    <!-- Accept Modal -->
    <view v-if="showAcceptModal" class="modal-mask" @click="showAcceptModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">接受订单</text>
        <text class="modal-desc">选择服务时间（可选），确认后客户将收到通知。</text>
        
        <!-- Custom Date Selector Cards -->
        <view class="date-selector">
          <view 
            v-for="option in dateOptions" 
            :key="option.value"
            class="date-option-card"
            :class="{ 'selected': acceptDate === option.value }"
            @click="selectDate(option.value)"
          >
            <AppIcon :name="option.icon" :size="20" :color="acceptDate === option.value ? '#10b981' : '#6b7280'" />
            <view class="date-option-content">
              <text class="date-option-label">{{ option.label }}</text>
              <text class="date-option-date">{{ option.date }}</text>
            </view>
            <AppIcon 
              v-if="acceptDate === option.value" 
              name="check-circle" 
              :size="20" 
              color="#10b981" 
            />
          </view>
          
          <!-- Custom Date Option -->
          <picker mode="date" :value="customDate" @change="handleCustomDate">
            <view 
              class="date-option-card"
              :class="{ 'selected': isCustomDate }"
            >
              <AppIcon name="calendar" :size="20" :color="isCustomDate ? '#10b981' : '#6b7280'" />
              <view class="date-option-content">
                <text class="date-option-label">自定义日期</text>
                <text class="date-option-date">{{ customDate || '点击选择' }}</text>
              </view>
              <AppIcon 
                v-if="isCustomDate" 
                name="check-circle" 
                :size="20" 
                color="#10b981" 
              />
            </view>
          </picker>
        </view>
        
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showAcceptModal = false">取消</view>
          <view class="modal-btn confirm" :class="{ loading: submitting }" @click="handleAccept">
            {{ submitting ? '处理中...' : '确认接受' }}
          </view>
        </view>
      </view>
    </view>

    <!-- Message Modal -->
    <view v-if="showMessageModal" class="modal-mask" @click="showMessageModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">留言给客户</text>
        <textarea v-model="messageText" placeholder="请输入您想对客户说的话..." class="modal-textarea" />
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showMessageModal = false">取消</view>
          <view class="modal-btn confirm" :class="{ loading: submitting, disabled: !messageText.trim() }" @click="handleMessage">
            {{ submitting ? '发送中...' : '发送留言' }}
          </view>
        </view>
      </view>
    </view>

    <!-- Time Proposal Modal -->
    <view v-if="showTimeModal" class="modal-mask" @click="showTimeModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">建议服务时间</text>
        <picker mode="date" :value="proposeDate" @change="proposeDate = $event.detail.value">
          <view class="picker-btn">
            <text>{{ proposeDate || '选择日期' }}</text>
            <AppIcon name="chevron-right" :size="16" color="#9ca3af" />
          </view>
        </picker>
        <textarea v-model="timeNote" placeholder="补充说明（可选）" class="modal-textarea short" />
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showTimeModal = false">取消</view>
          <view class="modal-btn confirm" :class="{ loading: submitting, disabled: !proposeDate }" @click="handleProposeTime">
            {{ submitting ? '发送中...' : '发送建议' }}
          </view>
        </view>
      </view>
    </view>

    <!-- Reject Modal -->
    <view v-if="showRejectModal" class="modal-mask" @click="showRejectModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">拒绝订单</text>
        <text class="modal-desc warning">拒绝后订单将自动取消，客户的定金将全额退还。</text>
        <view class="reject-reasons">
          <view 
            v-for="reason in rejectReasons" 
            :key="reason" 
            class="reason-item"
            :class="{ selected: selectedReason === reason }"
            @click="selectedReason = reason"
          >
            <text>{{ reason }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showRejectModal = false">取消</view>
          <view class="modal-btn reject" :class="{ loading: submitting, disabled: !selectedReason }" @click="handleReject">
            {{ submitting ? '处理中...' : '确认拒绝' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { API_BASE_URL, getToken } from '@/services/api';

const orderId = ref('');
const token = ref('');
const loading = ref(true);
const tokenExpired = ref(false);
const errorMsg = ref('');
const order = ref<any>(null);
const submitting = ref(false);

// Modal states
const showAcceptModal = ref(false);
const showMessageModal = ref(false);
const showTimeModal = ref(false);
const showRejectModal = ref(false);

// Form values
const acceptDate = ref('');
const messageText = ref('');
const proposeDate = ref('');
const timeNote = ref('');
const selectedReason = ref('');

// Date selector
const customDate = ref('');
const isCustomDate = computed(() => {
  return customDate.value && acceptDate.value === customDate.value;
});

// Generate date options (today, tomorrow, day after tomorrow)
const dateOptions = computed(() => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const formatDisplay = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 ${weekday}`;
  };
  
  return [
    {
      label: '今天',
      value: formatDate(today),
      date: formatDisplay(today),
      icon: 'sun'
    },
    {
      label: '明天',
      value: formatDate(tomorrow),
      date: formatDisplay(tomorrow),
      icon: 'sunrise'
    },
    {
      label: '后天',
      value: formatDate(dayAfter),
      date: formatDisplay(dayAfter),
      icon: 'cloud'
    }
  ];
});

const selectDate = (date: string) => {
  acceptDate.value = date;
  customDate.value = ''; // Clear custom date when selecting quick option
};

const handleCustomDate = (e: any) => {
  customDate.value = e.detail.value;
  acceptDate.value = e.detail.value;
};

// Chat states
const messages = ref<any[]>([]);
const messagesLoading = ref(false);
let refreshTimer: any = null;

const rejectReasons = [
  '时间安排冲突',
  '服务区域太远',
  '人手不足',
  '其他原因'
];

onLoad((options) => {
  if (options?.id) orderId.value = options.id;
  if (options?.token) token.value = options.token;
  
  if (!orderId.value || !token.value) {
    errorMsg.value = '无效的访问链接';
    loading.value = false;
    return;
  }
  
  fetchOrder();
  fetchMessages();
  
  // Start polling for messages
  refreshTimer = setInterval(fetchMessages, 10000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

const fetchOrder = async () => {
  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}/provider-view?token=${token.value}`,
      method: 'GET'
    });

    const data = res.data as any;
    if (data.expired) {
      tokenExpired.value = true;
    } else if (data.success) {
      order.value = data.order;
    } else {
      errorMsg.value = data.message || '加载失败';
    }
  } catch (e: any) {
    errorMsg.value = '网络错误';
  } finally {
    loading.value = false;
  }
};

const fetchMessages = async () => {
  if (!orderId.value) return;
  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}/messages?token=${token.value}`,
      method: 'GET'
    });
    const data = res.data as any;
    if (data.success) {
      messages.value = data.messages;
    }
  } catch (e) {
    console.error('Failed to fetch messages:', e);
  }
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待响应',
    accepted: '已接受',
    rejected: '已拒绝',
    negotiating: '协商中'
  };
  return map[status] || status;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const submitResponse = async (action: string, payload: any) => {
  submitting.value = true;
  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}/provider-response`,
      method: 'POST',
      data: { token: token.value, action, ...payload }
    });

    const data = res.data as any;
    if (data.success) {
      uni.showToast({ title: data.message || '操作成功', icon: 'success' });
      // Refresh order
      await fetchOrder();
      // Close all modals
      showAcceptModal.value = false;
      showMessageModal.value = false;
      showTimeModal.value = false;
      showRejectModal.value = false;
    } else {
      uni.showToast({ title: data.message || '操作失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const handleAccept = () => {
  if (submitting.value) return;
  const proposedTime = acceptDate.value ? new Date(acceptDate.value).toISOString() : null;
  submitResponse('accept', { proposedTime });
};

const handleMessage = () => {
  if (submitting.value || !messageText.value.trim()) return;
  // Use the new chat messaging logic
  handleSendChatMessage();
  showMessageModal.value = false;
};

const handleSendChatMessage = async () => {
  if (submitting.value || !messageText.value.trim()) return;
  submitting.value = true;
  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}/messages`,
      method: 'POST',
      data: { 
        token: token.value, 
        content: messageText.value 
      }
    });

    const data = res.data as any;
    if (data.success) {
      messageText.value = '';
      await fetchMessages();
      // If the order status was pending, we should also update it to negotiating
      if (order.value.provider_response_status === 'pending') {
         await submitResponse('message', { message: '已开启应用内沟通' });
      }
    } else {
      uni.showToast({ title: data.message || '发送失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const handleProposeTime = () => {
  if (submitting.value || !proposeDate.value) return;
  submitResponse('propose_time', { 
    proposedTime: new Date(proposeDate.value).toISOString(),
    message: timeNote.value || null
  });
};

const handleReject = () => {
  if (submitting.value || !selectedReason.value) return;
  submitResponse('reject', { rejectReason: selectedReason.value });
};

const goToChat = () => {
  const customerName = encodeURIComponent(order.value?.user?.name || '客户');
  const serviceName = encodeURIComponent(order.value?.service_name || '服务订单');
  const amount = order.value?.total_amount || '0';
  const orderNo = order.value?.order_no || '';
  uni.navigateTo({
    url: `/pages/order/order-chat?id=${orderId.value}&token=${token.value}&customer=${customerName}&service=${serviceName}&amount=${amount}&orderNo=${orderNo}`
  });
};

const goHome = () => uni.reLaunch({ url: '/pages/index/index' });
const goToLogin = () => uni.reLaunch({ url: '/pages/index/index?tab=profile' });
</script>

<style scoped>
.page-container { min-height: 100vh; background: #111827; }
.header { background: #1f2937; padding: 0 16px; border-bottom: 1px solid #374151; }
.pt-safe { padding-top: env(safe-area-inset-top); }
.header-row { display: flex; align-items: center; justify-content: space-between; height: 56px; }
.header-back { width: 40px; height: 56px; display: flex; align-items: center; }
.header-title { font-size: 18px; font-weight: bold; color: #f3f4f6; }
.header-placeholder { width: 40px; }

.loading-container, .error-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 32px; text-align: center; }
.loading-spinner { width: 40px; height: 40px; border: 3px solid #374151; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { margin-top: 16px; color: #9ca3af; }
.error-title { font-size: 20px; font-weight: bold; color: #f3f4f6; margin-top: 16px; }
.error-desc { color: #9ca3af; margin-top: 8px; line-height: 1.5; }

.content { padding: 16px; }

.order-card { background: #1f2937; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid #374151; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.order-no { font-size: 12px; color: #9ca3af; }
.status-badge { font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 600; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.accepted { background: #d1fae5; color: #065f46; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }
.status-badge.negotiating { background: #dbeafe; color: #1e40af; }

.service-info { display: flex; gap: 12px; margin-bottom: 16px; }
.service-image { width: 64px; height: 64px; border-radius: 12px; }
.service-image-placeholder { width: 64px; height: 64px; border-radius: 12px; background: #374151; display: flex; align-items: center; justify-content: center; }
.service-detail { flex: 1; }
.service-name { font-size: 16px; font-weight: 600; color: #f3f4f6; display: block; }
.service-amount { font-size: 20px; font-weight: bold; color: #10b981; margin-top: 4px; display: block; }

.user-info, .order-time { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.user-text, .time-text { font-size: 13px; color: #d1d5db; }

.note-section { display: flex; gap: 8px; margin-top: 12px; background: #422006; padding: 10px; border-radius: 8px; border-left: 3px solid #f59e0b; }
.note-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.note-label { font-size: 12px; font-weight: 600; color: #fbbf24; }
.note-text { font-size: 13px; color: #fde68a; line-height: 1.4; }

.action-section { background: #1f2937; border-radius: 16px; padding: 20px; margin-bottom: 100px; border: 1px solid #374151; }
.action-title { font-size: 14px; font-weight: 600; color: #f3f4f6; margin-bottom: 16px; display: block; }
.action-row { display: flex; gap: 12px; margin-bottom: 12px; }
.action-card { flex: 1; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; border: 2px solid #374151; transition: all 0.2s; background: #111827; }
.action-card.message { border-color: #1e40af; }
.action-card.time { border-color: #6d28d9; }
.action-card:active { transform: scale(0.97); }
.action-label { font-size: 14px; font-weight: 600; color: #d1d5db; }

.reject-row { display: flex; justify-content: flex-start; }
.reject-btn { display: flex; align-items: center; gap: 6px; padding: 12px 20px; border-radius: 12px; border: 2px solid #7f1d1d; background: #450a0a; transition: all 0.2s; }
.reject-btn:active { transform: scale(0.97); opacity: 0.9; }
.reject-label { font-size: 14px; font-weight: 600; color: #fca5a5; }

/* Fixed Bottom Accept Button */
.fixed-bottom-bar { 
  position: fixed; 
  bottom: 0; 
  left: 0; 
  right: 0; 
  padding: 16px; 
  padding-left: calc(16px + env(safe-area-inset-left));
  padding-right: calc(16px + env(safe-area-inset-right));
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #1f2937; 
  box-shadow: 0 -4px 12px rgba(0,0,0,0.5); 
  z-index: 100; 
  border-top: 1px solid #374151;
  display: flex;
  box-sizing: border-box;
}
.accept-btn { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 8px; 
  flex: 1;
  padding: 16px; 
  border-radius: 14px; 
  background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
  transition: all 0.2s; 
}
.accept-btn:active { transform: scale(0.98); opacity: 0.9; }
.accept-btn-text { font-size: 17px; font-weight: 700; color: #ffffff; }

.response-result { background: #1f2937; border-radius: 16px; padding: 32px 20px; text-align: center; border: 1px solid #374151; }
.result-card { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.result-title { font-size: 18px; font-weight: bold; color: #f3f4f6; }
.result-desc { font-size: 14px; color: #9ca3af; }

.action-btn { padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; margin-top: 24px; text-align: center; }
.action-btn.primary { background: #10b981; color: #fff; }

/* Modals */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 900; }
.modal-content { width: 85%; background: #1f2937; border-radius: 16px; padding: 24px; border: 1px solid #374151; }
.modal-title { font-size: 18px; font-weight: bold; color: #f3f4f6; display: block; margin-bottom: 8px; }
.modal-desc { font-size: 14px; color: #9ca3af; display: block; margin-bottom: 16px; }
.modal-desc.warning { color: #fca5a5; }
.modal-textarea { width: 100%; height: 100px; border: 1px solid #374151; border-radius: 12px; padding: 12px; font-size: 15px; margin-bottom: 16px; box-sizing: border-box; background: #111827; color: #f3f4f6; }
.modal-textarea.short { height: 60px; }
.picker-btn { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #111827; border-radius: 12px; margin-bottom: 16px; border: 1px solid #374151; color: #d1d5db; }
.modal-footer { display: flex; gap: 12px; }
.modal-btn { flex: 1; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: 600; text-align: center; }
.modal-btn.cancel { background: #374151; color: #d1d5db; }
.modal-btn.confirm { background: #10b981; color: #fff; }
.modal-btn.reject { background: #ef4444; color: #fff; }
.modal-btn.disabled { opacity: 0.5; }
.modal-btn.loading { opacity: 0.7; }

.reject-reasons { margin-bottom: 16px; }
.reason-item { padding: 12px 16px; background: #111827; border-radius: 12px; margin-bottom: 8px; border: 2px solid #374151; transition: all 0.2s; color: #d1d5db; }
.reason-item.selected { border-color: #ef4444; background: #450a0a; color: #fca5a5; }

/* Chat Styles */
.chat-section { background: #1f2937; border-radius: 16px; padding: 20px; margin-bottom: 32px; border: 1px solid #374151; }
.section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #374151; }
.section-title { font-size: 15px; font-weight: 600; color: #f3f4f6; }

.message-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; max-height: 400px; overflow-y: auto; padding-right: 4px; }
.empty-chat { padding: 20px; text-align: center; }
.empty-text { font-size: 13px; color: #6b7280; }

.message-item { display: flex; flex-direction: column; align-items: flex-start; }
.message-item.is-me { align-items: flex-end; }
.message-item.is-system { align-items: center; }

.message-bubble { max-width: 85%; padding: 12px 16px; border-radius: 16px; position: relative; }
.message-item:not(.is-me) .message-bubble { background: #374151; border-bottom-left-radius: 4px; color: #f3f4f6; }
.message-item.is-me .message-bubble { background: #10b981; color: #fff; border-bottom-right-radius: 4px; }
.message-item.is-system .message-bubble { background: #422006; color: #fbbf24; border-radius: 8px; font-size: 12px; padding: 6px 12px; }

.message-content { font-size: 14px; line-height: 1.5; display: block; word-break: break-all; }
.message-time { font-size: 10px; color: #6b7280; margin-top: 4px; display: block; }
.message-item.is-me .message-time { color: rgba(255,255,255,0.7); text-align: right; }

.chat-input-area { display: flex; align-items: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #374151; }
.chat-textarea { flex: 1; background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 10px 14px; font-size: 14px; min-height: 40px; max-height: 100px; box-sizing: border-box; color: #f3f4f6; }
.send-btn { width: 44px; height: 44px; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.send-btn:active { transform: scale(0.95); opacity: 0.9; }
.send-btn.disabled { background: #374151; }

/* Date Selector Styles */
.date-selector { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.date-option-card { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 14px 16px; 
  background: #111827; 
  border: 2px solid #374151; 
  border-radius: 12px; 
  transition: all 0.2s; 
  cursor: pointer;
}
.date-option-card:active { transform: scale(0.98); }
.date-option-card.selected { 
  background: rgba(16, 185, 129, 0.1); 
  border-color: #10b981; 
}
.date-option-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.date-option-label { 
  font-size: 15px; 
  font-weight: 600; 
  color: #f3f4f6; 
}
.date-option-card.selected .date-option-label { color: #10b981; }
.date-option-date { 
  font-size: 13px; 
  color: #9ca3af; 
}
.date-option-card.selected .date-option-date { color: #6ee7b7; }
</style>
