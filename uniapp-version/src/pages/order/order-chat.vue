<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="header-row">
        <view @click="goBack" class="header-back">
          <AppIcon name="chevron-left" :size="24" color="#333" />
        </view>
        <view class="header-content">
          <text class="header-title">{{ headerTitle }}</text>
          <text class="header-subtitle">订单尾号{{ orderNoSuffix }} | {{ serviceName }} | ${{ totalAmount }}</text>
        </view>
      </view>
    </view>

    <!-- Messages -->
    <scroll-view 
      scroll-y 
      class="message-area" 
      :scroll-into-view="scrollTarget"
      :scroll-with-animation="true"
    >
      <view class="message-list">
        <!-- Date Separator -->
        <view v-if="messages.length > 0" class="date-separator">
          <text class="date-text">{{ formatMessageDate(messages[0]?.created_at) }}</text>
        </view>
        
        <view 
          v-for="msg in messages" 
          :key="msg.id" 
          :id="'msg-' + msg.id"
          class="message-item"
          :class="{ 'is-me': isMyMessage(msg), 'is-system': msg.is_system }"
        >
          <view class="message-bubble">
            <text class="message-content">{{ msg.content }}</text>
          </view>
          <text class="message-time">{{ formatTime(msg.created_at) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Input Area -->
    <view class="input-area">
      <view class="input-left" @click="showPlusMenu = !showPlusMenu">
        <AppIcon name="plus-circle" :size="28" color="#9ca3af" />
      </view>
      <view class="input-wrapper">
        <input 
          v-model="messageText" 
          placeholder="请输入消息..." 
          class="message-input" 
          confirm-type="send"
          @confirm="handleSend"
        />
      </view>
      <view 
        class="send-btn" 
        :class="{ active: messageText.trim() }" 
        @click="handleSend"
      >
        <AppIcon name="send" :size="22" color="#ffffff" />
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad, onShow, onBackPress } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { API_BASE_URL, getToken, isLoggedIn, getUserInfo } from '@/services/api';

const orderId = ref('');
const orderNo = ref('');
const token = ref('');
const customerName = ref('');
const orderNoSuffix = ref('');
const serviceName = ref('服务订单');
const totalAmount = ref('0');
const isAuthenticated = ref(false);
const isProvider = ref(false);
const contactName = ref('');
const myUserId = ref('');
const providerReturnUrl = ref(''); // Store the full return URL for providers
const customerReturnUrl = ref(''); // Store the return URL for customers (order detail page)

// Computed header title
const headerTitle = computed(() => {
  if (isProvider.value) {
    return `联系客户：${contactName.value || '客户'}`;
  } else {
    return `联系服务商：${contactName.value || '服务商'}`;
  }
});

const messages = ref<any[]>([]);
const messageText = ref('');
const scrollTarget = ref('');
const showPlusMenu = ref(false);
const loading = ref(false);

let refreshTimer: any = null;

onBackPress((options) => {
  // If the back event is from the page logic (like our UI button calling navigateBack), 
  // or from hardware/gesture, we intercept and redirect based on role.
  if (options.from === 'backbutton' || options.from === 'navigateBack') {
    goBack();
    return true; // Intercepted
  }
  return false;
});

onLoad(async (options) => {
  console.log('[order-chat] onLoad options:', options);
  
  if (options?.id) orderId.value = options.id;
  if (options?.orderNo) {
    orderNo.value = options.orderNo;
    orderNoSuffix.value = options.orderNo.slice(-4);
  }
  if (options?.token) token.value = options.token;
  if (options?.customer) customerName.value = decodeURIComponent(options.customer);
  if (options?.service) serviceName.value = decodeURIComponent(options.service);
  if (options?.amount) totalAmount.value = options.amount;
  
  // H5 fallback: parse token from URL hash if not in options
  if (!token.value && typeof window !== 'undefined' && window.location) {
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
      const urlParams = new URLSearchParams(hashParts[1]);
      const hashToken = urlParams.get('token');
      if (hashToken) {
        token.value = hashToken;
        console.log('[order-chat] Token parsed from hash:', hashToken);
      }
      // Also parse other params as fallback
      if (!orderId.value) orderId.value = urlParams.get('id') || '';
      if (!orderNo.value) {
        orderNo.value = urlParams.get('orderNo') || '';
        orderNoSuffix.value = orderNo.value.slice(-4);
      }
    }
  }
  
  console.log('[order-chat] Final token value:', token.value);
  
  // Build and store provider return URL immediately while we have all the params
  // ONLY set this if we have a token (which indicates provider from SMS link)
  if (token.value && orderId.value) {
    providerReturnUrl.value = `/pages/order/provider-response?id=${orderId.value}&token=${token.value}`;
    console.log('[order-chat] Provider return URL stored:', providerReturnUrl.value);
  }
  
  // For customers, return to profile/my submissions page (order detail is a component, not a standalone page)
  // Note: customerReturnUrl is set for ALL users, but only used if they're not a provider
  customerReturnUrl.value = '/pages/index/index?tab=profile';
  console.log('[order-chat] Customer return URL stored:', customerReturnUrl.value);
  
  // Check authentication
  await checkAuth();
});

onShow(async () => {
  // Re-check auth when page becomes visible (after potential login redirect)
  await checkAuth();
});

const checkAuth = async () => {
  const loggedIn = await isLoggedIn();
  
  // Everyone must login - both provider and user need to be authenticated
  if (!loggedIn) {
    let returnUrlPath = `/pages/order/order-chat?id=${orderId.value}&orderNo=${orderNo.value}`;
    if (token.value) {
      returnUrlPath += `&token=${token.value}`;
    }
    const returnUrl = encodeURIComponent(returnUrlPath);
    // Redirect to main index with profile tab and redirect parameter
    uni.reLaunch({
      url: `/pages/index/index?tab=profile&redirect=${returnUrl}`
    });
    return;
  }
  
  isAuthenticated.value = true;
  
  // If we have auth token, use it instead of provider token
  if (loggedIn) {
    token.value = await getToken() || '';
  }
  
  // Fetch order details if we don't have them
  if (!customerName.value && orderId.value) {
    await fetchOrderDetails();
  }
  
  fetchMessages();
  if (!refreshTimer) {
    refreshTimer = setInterval(fetchMessages, 5000);
  }
};

const fetchOrderDetails = async () => {
  try {
    const authToken = await getToken();
    
    // Get current user info to determine role
    const userInfo = await getUserInfo();
    if (userInfo) {
      myUserId.value = userInfo.id;
    }
    
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}`,
      method: 'GET',
      header: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    const data = res.data as any;
    if (data.success && data.order) {
      const order = data.order;
      serviceName.value = order.service_title || order.service_name || '服务订单';
      totalAmount.value = order.total_amount || '0';
      if (!orderNoSuffix.value) {
        orderNoSuffix.value = (order.order_no || '').slice(-4);
      }
      
      // Determine if current user is provider or customer
      if (myUserId.value && myUserId.value === order.provider_id) {
        // Current user is provider - show customer name
        isProvider.value = true;
        contactName.value = order.client?.name || order.user?.name || '客户';
      } else {
        // Current user is customer - show provider name
        isProvider.value = false;
        contactName.value = order.provider?.name || order.provider?.business_name || '服务商';
      }
    }
  } catch (e) {
    console.error('Failed to fetch order details:', e);
  }
};

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

const fetchMessages = async () => {
  if (!orderId.value) return;
  try {
    const authToken = await getToken();
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}/messages${token.value && !authToken ? `?token=${token.value}` : ''}`,
      method: 'GET',
      header: headers
    });
    const data = res.data as any;
    if (data.success) {
      messages.value = data.messages || [];
      scrollToBottom();
    }
  } catch (e) {
    console.error('Failed to fetch messages:', e);
  }
};

const handleSend = async () => {
  if (loading.value || !messageText.value.trim()) return;
  
  loading.value = true;
  const content = messageText.value;
  messageText.value = '';
  
  try {
    const authToken = await getToken();
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}/messages`,
      method: 'POST',
      header: headers,
      data: { 
        token: token.value || undefined, 
        content 
      }
    });
    
    const data = res.data as any;
    if (data.success) {
      await fetchMessages();
    } else {
      uni.showToast({ title: data.message || '发送失败', icon: 'none' });
      messageText.value = content;
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' });
    messageText.value = content;
  } finally {
    loading.value = false;
  }
};

const scrollToBottom = () => {
  if (messages.value.length > 0) {
    const lastMsg = messages.value[messages.value.length - 1];
    scrollTarget.value = 'msg-' + lastMsg.id;
  }
};

const isMyMessage = (msg: any) => {
  // Check if the message sender is the current user
  return msg.sender_id === myUserId.value;
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatMessageDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return formatTime(dateStr);
  }
  return `${d.getMonth() + 1}-${d.getDate()} ${formatTime(dateStr)}`;
};

const goBack = () => {
  // Check if user is a provider
  if (isProvider.value) {
    console.log('[order-chat] Provider return -> dashboard');
    uni.reLaunch({ url: '/pages/provider/dashboard' });
  } else {
    console.log('[order-chat] Customer return -> profile');
    uni.reLaunch({ url: '/pages/index/index?tab=profile' });
  }
};
</script>

<style scoped>
.page-container { 
  height: 100vh;
  background: #f5f5f5; 
  display: flex; 
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.header { 
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff; 
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.pt-safe { padding-top: env(safe-area-inset-top); }
.header-row { 
  display: flex; 
  align-items: center; 
  padding: 12px 16px; 
}
.header-back { 
  width: 40px; 
  height: 40px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.header-content { 
  flex: 1; 
  text-align: center; 
  padding-right: 40px; 
}
.header-title { 
  font-size: 17px; 
  font-weight: 600; 
  color: #111; 
  display: block; 
}
.header-subtitle { 
  font-size: 12px; 
  color: #999; 
  margin-top: 2px; 
  display: block; 
}

/* Messages */
.message-area { 
  flex: 1; 
  padding: 16px;
  padding-bottom: 80px;
  box-sizing: border-box;
  overflow-y: auto;
}
.message-list { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
  padding-bottom: 20px;
}

.date-separator { 
  text-align: center; 
  margin: 8px 0; 
}
.date-text { 
  font-size: 12px; 
  color: #999; 
  background: rgba(0,0,0,0.05); 
  padding: 4px 12px; 
  border-radius: 12px; 
}

.message-item { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start; 
  max-width: 80%; 
}
.message-item.is-me { 
  align-items: flex-end; 
  align-self: flex-end; 
}
.message-item.is-system { 
  align-items: center; 
  align-self: center; 
}

.message-bubble { 
  padding: 12px 16px; 
  border-radius: 18px; 
  word-break: break-word; 
}
.message-item:not(.is-me) .message-bubble { 
  background: #fff; 
  border-bottom-left-radius: 4px; 
}
.message-item.is-me .message-bubble { 
  background: #10b981; 
  color: #fff; 
  border-bottom-right-radius: 4px; 
}
.message-item.is-system .message-bubble { 
  background: #fef3c7; 
  color: #92400e; 
  font-size: 12px; 
  padding: 6px 12px; 
  border-radius: 8px; 
}

.message-content { 
  font-size: 15px; 
  line-height: 1.5; 
}
.message-time { 
  font-size: 11px; 
  color: #999; 
  margin-top: 4px; 
}

/* Input Area */
.input-area { 
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 12px 16px; 
  padding-bottom: calc(16px + env(safe-area-inset-bottom)); 
  background: #fff; 
  border-top: 1px solid #eee;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
.input-left { 
  width: 36px; 
  height: 36px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.input-wrapper { 
  flex: 1; 
  background: #f5f5f5; 
  border-radius: 20px; 
  padding: 0 16px; 
  height: 40px; 
  display: flex; 
  align-items: center; 
}
.message-input { 
  flex: 1; 
  border: none; 
  background: transparent; 
  font-size: 15px; 
  outline: none; 
}
.send-btn { 
  width: 44px; 
  height: 44px; 
  border-radius: 22px; 
  background: #d1d5db; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.2s; 
}
.send-btn.active { 
  background: #10b981; 
}
.send-btn:active { 
  transform: scale(0.95); 
}
</style>
