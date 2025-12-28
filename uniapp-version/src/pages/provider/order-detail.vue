<template>
  <view class="order-detail">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="28" class="text-white"/>
      </view>
      <text class="title">订单详情</text>
      <view class="placeholder"></view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <template v-else>
      <!-- Order Status Card -->
      <view class="status-card">
        <view class="status-icon">
          <AppIcon name="clipboard-list" :size="32" class="text-emerald-500"/>
        </view>
        <view class="status-info">
          <text class="status-label">{{ order.serviceName }}</text>
          <text class="order-no">订单号: {{ order.orderNo }}</text>
        </view>
        <view class="status-badge" :class="order.status">
          {{ getStatusText(order.status) }}
        </view>
      </view>

      <!-- Order Details -->
      <scroll-view scroll-y class="content">
        <!-- Key Info Card -->
        <view class="info-card">
          <text class="card-title">关键信息</text>
          
          <view v-if="order.airport" class="info-item">
            <view class="info-label">
              <AppIcon name="plane" :size="16" class="info-icon"/>
              <text>机场</text>
            </view>
            <text class="info-value">{{ order.airport }}</text>
          </view>

          <view v-if="order.date" class="info-item">
            <view class="info-label">
              <AppIcon name="calendar" :size="16" class="info-icon"/>
              <text>日期</text>
            </view>
            <text class="info-value">{{ order.date }}</text>
          </view>

          <view v-if="order.time" class="info-item">
            <view class="info-label">
              <AppIcon name="clock" :size="16" class="info-icon"/>
              <text>出发时间</text>
            </view>
            <text class="info-value">{{ formatTime(order.time) }}</text>
          </view>


        </view>

        <!-- All Form Fields -->
        <view class="info-card">
          <text class="card-title">详细信息</text>
          
          <view 
            v-for="(field, key) in displayFields" 
            :key="key"
            class="info-item"
          >
            <view class="info-label">
              <text>{{ field.label }}</text>
            </view>
            <text class="info-value">{{ formatFieldValue(field) }}</text>
          </view>
        </view>

        <!-- Locations / Route Card -->
        <view v-if="routeInfo.hasLocation" class="info-card">
          <text class="card-title">行程/地点信息</text>
          
          <!-- Departure / Start -->
          <view v-if="routeInfo.start" class="info-item">
            <view class="info-label">
               <text>起点</text>
            </view>
            <view class="info-value">
              <view>{{ displayAddressValue(routeInfo.start).street || '详细地址保护中' }}</view>
              <view v-if="displayAddressValue(routeInfo.start).city">{{ displayAddressValue(routeInfo.start).city }}</view>
            </view>
          </view>

          <!-- Destination / End -->
          <view v-if="routeInfo.end" class="info-item">
            <view class="info-label">
               <text>终点</text>
            </view>
            <view class="info-value">
              <view>{{ displayAddressValue(routeInfo.end).street || '详细地址保护中' }}</view>
              <view v-if="displayAddressValue(routeInfo.end).city">{{ displayAddressValue(routeInfo.end).city }}</view>
            </view>
          </view>

          <!-- Navigation / Route Check -->
          <view v-if="routeInfo.start && routeInfo.end" class="mt-2 pt-2 border-t border-gray-700 border-opacity-30">
              <button class="nav-btn" @click="openMapRoute">
                  <AppIcon name="map" :size="16" class="mr-1"/>
                  查看大致路线 (评估距离)
              </button>
          </view>

          <!-- Other Addresses (Single or extra) -->
          <view v-for="(addr, idx) in routeInfo.others" :key="idx" class="location-item mt-2">
             <view class="location-icon bg-gray-700">
                 <AppIcon name="home" :size="16" class="text-gray-300"/>
             </view>
             <view class="location-content">
               <text class="text-xs text-gray-400 mb-0.5">{{ addr.label }}</text>
               <text class="location-text">{{ displayAddressValue(addr).street || '详细地址保护中' }}</text>
               <text class="location-sub">{{ displayAddressValue(addr).city }}</text>
            </view>
             <view v-if="order.status === 'pending'" class="lock-icon">
                 <AppIcon name="lock" :size="16" class="text-gray-400"/>
            </view>
          </view>
        </view>
        <!-- Timestamp -->
        <view class="timestamp-card">
          <text class="timestamp">发布时间: {{ formatDate(order.createdAt) }}</text>
        </view>
      </scroll-view>

      <!-- Bottom Actions -->
      <view class="bottom-actions" v-if="order.status === 'pending'">
        <button class="btn-secondary" @click="goBack">返回列表</button>
        <button v-if="hasQuoted" class="btn-quoted" disabled>
          <text>✓ 已报价</text>
        </button>
        <button v-else class="btn-primary" @click="openQuoteModal">立即报价</button>
      </view>
    </template>
    
    <!-- Custom Quote Modal -->
    <view v-if="showQuoteModal" class="modal-overlay" @click.self="showQuoteModal = false">
      <view class="modal-content">
        <text class="modal-title">发起报价</text>
        
        <!-- Credit Info Box -->
        <view class="credit-info-box">
          <view class="credit-row">
            <text class="credit-label">本次报价消耗</text>
            <text class="credit-value cost">{{ quoteCostInfo.cost }} 积分</text>
          </view>
          <view class="credit-row">
            <text class="credit-label">当前积分余额</text>
            <text class="credit-value balance">{{ quoteCostInfo.currentCredits }} 积分</text>
          </view>
          <view class="credit-divider"></view>
          <view class="credit-row">
            <text class="credit-label">报价后余额</text>
            <text class="credit-value" :class="quoteCostInfo.canQuote ? 'remaining' : 'insufficient'">
              {{ quoteCostInfo.remainingAfterQuote }} 积分
            </text>
          </view>
        </view>
        
        <!-- Insufficient Credits Warning -->
        <view v-if="!quoteCostInfo.canQuote" class="warning-box">
          <AppIcon name="alert-circle" :size="16" class="text-yellow-500"/>
          <text class="warning-text">积分不足，请先充值</text>
        </view>
        
        <view class="input-group">
          <text class="input-label">报价金额 ($)</text>
          <input 
            type="number" 
            v-model="quotePrice" 
            class="quote-input" 
            placeholder="请输入金额"
            placeholder-class="placeholder-text"
          />
        </view>
        
        <view class="input-group">
          <text class="input-label">需收定金 ($) (可选)</text>
          <input 
            type="number" 
            v-model="quoteDeposit" 
            class="quote-input" 
            placeholder="请输入定金金额"
            placeholder-class="placeholder-text"
          />
        </view>
        
        <view class="input-group">
          <text class="input-label">留言 (可选)</text>
          <textarea 
            v-model="quoteMessage" 
            class="quote-textarea" 
            placeholder="简述您的服务优势..."
            placeholder-class="placeholder-text"
          />
        </view>
        
        <view class="modal-actions">
          <button class="modal-btn cancel" @click="showQuoteModal = false">取消</button>
          <button 
            class="modal-btn confirm" 
            :class="{ disabled: !quoteCostInfo.canQuote || submitting }"
            @click="submitQuote"
            :disabled="!quoteCostInfo.canQuote || submitting"
          >确认报价</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { submissionsApi, quotesApi } from '@/services/api';

// State
const loading = ref(true);
const order = ref<any>({});
const showQuoteModal = ref(false);
const quotePrice = ref('');
const quoteDeposit = ref('');
const quoteMessage = ref('专业服务，期待合作');
const hasQuoted = ref(false);
const quoteCostInfo = ref({
    cost: 0,
    currentCredits: 0,
    remainingAfterQuote: 0,
    canQuote: false
});
const submitting = ref(false);

// Open quote modal and load cost info
const openQuoteModal = async () => {
    showQuoteModal.value = true;
    try {
        const result = await quotesApi.getQuoteCost(order.value.id);
        quoteCostInfo.value = result;
        quotePrice.value = ''; // Reset
        quoteDeposit.value = ''; // Reset
    } catch (error: any) {
        console.error('Failed to load quote cost:', error);
        // Set default values if API fails
        quoteCostInfo.value = { cost: 10, currentCredits: 0, remainingAfterQuote: -10, canQuote: false };
    }
};

// Submit quote function
const submitQuote = async () => {
    const price = Number(quotePrice.value);
    if (isNaN(price) || price <= 0) {
        uni.showToast({ title: '请输入有效金额', icon: 'none' });
        return;
    }
    
    const deposit = Number(quoteDeposit.value) || 0;

    if (deposit > price) {
         uni.showToast({ title: '定金不能超过总金额', icon: 'none' });
         return;
    }

    try {
        if (submitting.value) return;
        submitting.value = true;
        uni.showLoading({ title: '提交中...' });
        
        await quotesApi.create({
            submissionId: order.value.id,
            price: price,
            deposit: deposit,
            message: quoteMessage.value || '专业服务，期待合作'
        });
        uni.hideLoading();
        showQuoteModal.value = false;
        uni.showToast({ title: '报价已发送', icon: 'success' });
        setTimeout(() => goBack(), 1500);
    } catch (error: any) {
        submitting.value = false;
        uni.hideLoading();
        uni.showToast({ title: error.message || '报价失败', icon: 'none' });
    }
};

// Computed
const displayFields = computed(() => {
  const formData = order.value.formData || {};
  const fields: any[] = [];
  
  // Fields already shown in Key Info section to filter out
  const keyInfoLabels = ['机场', '日期', '时间', '地址', '城市', 'City'];
  
  for (const key of Object.keys(formData)) {
    if (key.startsWith('_')) continue; // Skip internal fields
    const field = formData[key];
    if (field && typeof field === 'object' && field.label) {
      // Skip address fields (shown separately in Route Card)
      if (field.type === 'address') continue;
      
      // Skip fields already shown in Key Info
      if (keyInfoLabels.some(l => field.label.includes(l))) {
         continue;
      }
      
      fields.push(field);

      // Auto-inject Terminal info if this is a Flight Number field
      const labelLower = field.label.toLowerCase();
      if ((labelLower.includes('flight') || labelLower.includes('航班') || labelLower.includes('班次')) && field.value) {
          const flightNo = String(field.value).trim();
          const terminal = getTerminal(flightNo);
          fields.push({
              label: '航站楼 (自动查询)',
              value: terminal,
              displayValue: terminal,
              isAutoInjected: true
          });
      }
    }
  }
  
  return fields;
});

// Helper for Toronto Pearson Terminal Loopup
const getTerminal = (flightNo: string) => {
   // Extract airline code (e.g., "AC" from "AC123" or "AC 123")
   const match = flightNo.match(/^([a-zA-Z0-9]{2})/);
   if (!match) return '未知航站楼';
   
   const code = match[1].toUpperCase();

   // Terminal 1: Star Alliance + Emirates + others
   const T1_CODES = ['AC', 'UA', 'LH', 'LX', 'OS', 'SN', 'TP', 'NZ', 'NH', 'OZ', 'TG', 'SQ', 'TK', 'CA', 'AI', 'ET', 'MS', 'AV', 'CM', 'SK', 'EK'];
   
   // Terminal 3: SkyTeam + Oneworld + WestJet + Air Transat + others
   const T3_CODES = ['WS', 'TS', 'AA', 'DL', 'BA', 'AF', 'KL', 'CX', 'MU', 'CZ', 'HU', 'JD', 'CI', 'BR', 'FI', 'EI', 'QR', 'EY', 'PK', 'SV', 'ME', 'LY', 'AZ', 'JL', 'QF', 'IB', 'RJ', 'UL', 'AT', 'S4'];

   if (T1_CODES.includes(code)) return 'T1 (1号航站楼)';
   if (T3_CODES.includes(code)) return 'T3 (3号航站楼)';
   
   return '需确认 (未匹配)';
};

const maskAddress = (street: string) => {
    if (!street) return '';
    // Only mask the leading house number, keep street name visible
    // E.g. "123 Main Street" -> "*** Main Street"
    // E.g. "4567 Sheppard Ave East" -> "*** Sheppard Ave East"
    const match = street.match(/^(\d+[\s-]*)(.+)$/);
    if (match && match[2]) {
        return '*** ' + match[2];
    }
    // If no number at start or no match, mask partial if there's content
    if (street.length > 6) {
        return '******';
    }
    return street;
};

// Route Info Logic
const routeInfo = computed(() => {
    const formData = order.value.formData || {};
    let start = null;
    let end = null;
    let others = [];
    let hasLocation = false;

    for (const key of Object.keys(formData)) {
        const field = formData[key];
        if (field && typeof field === 'object' && field.type === 'address' && field.value) {
            hasLocation = true;
            const label = (field.label || '').toLowerCase();
            // Identification Logic
            if (label.includes('出发') || label.includes('start') || label.includes('from') || label.includes('起点')) {
                start = field;
            } else if (label.includes('目的') || label.includes('dest') || label.includes('to') || label.includes('终点') || label.includes('送往')) {
                end = field;
            } else {
                others.push(field);
            }
        }
    }

    // Special Logic for Airport Services (接机/送机)
    const serviceName = order.value.serviceName || '';
    const airport = order.value.airport;
    
    // If we have an airport and at least one address (or start/end is missing)
    if (airport && (serviceName.includes('接机') || serviceName.includes('送机'))) {
         const isDropOff = serviceName.includes('送机'); // Drop-off: Address -> Airport
         
         // If we haven't found explicit Start/End but have 'others' (the single address)
         // OR if we found one but missing the other
         
         // Case: We found an address in 'others' (common for simple forms)
         if (others.length > 0 && !start && !end) {
             const addr = others[0];
             const airportObj = { 
                 value: { street: airport, city: order.value.city || '' }, 
                 label: '机场',
                 isAirport: true 
             };
             
             if (isDropOff) {
                 start = addr;
                 end = airportObj;
             } else {
                 start = airportObj;
                 end = addr;
             }
             hasLocation = true;
             // Remove used address from others to avoid duplication?
             // actually route card shows others if listed in others.
             // We should clear others if we promoted it to start/end
             others = [];
         }
    }
    
    return { start, end, others, hasLocation };
});

const displayAddressValue = (field: any) => {
    if (!field) return {};
    return field.value || {};
};

const openMapRoute = () => {
    const startVal = routeInfo.value.start?.value;
    const endVal = routeInfo.value.end?.value;
    if (!startVal || !endVal) return;
    
    // Construct Query
    // Note: customized for our synthesized airport object or real address
    const formatQ = (val: any) => {
        if (typeof val === 'string') return val; // Should not happen given logic, but safe
        const street = val.street?.replace('***', '') || '';
        const city = val.city || '';
        if (street && city) return `${street}, ${city}`;
        return street || city;
    };

    const startQ = formatQ(startVal);
    const endQ = formatQ(endVal);
    
    // Universal URL Scheme
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startQ)}&destination=${encodeURIComponent(endQ)}`;
    
    // #ifdef H5
    window.open(url, '_blank');
    // #endif
    // #ifndef H5
    uni.setClipboardData({
        data: `起点: ${startQ}\n终点: ${endQ}`,
        success: () => uni.showToast({title: '路线已复制，请打开地图', icon: 'none'})
    });
    // #endif
};
const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // If no history, go to order hall
    uni.redirectTo({
      url: '/pages/provider/order-hall'
    });
  }
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status] || status;
};

const maskPhone = (phone: string) => {
    if (!phone || phone.length < 7) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
};

const formatFieldValue = (field: any) => {
  let value = field.value || '-';
  
  if (field.displayValue && typeof field.displayValue === 'string') {
    value = field.displayValue;
  } else if (typeof field.value === 'object') {
    value = JSON.stringify(field.value);
  }
  
  // Mask phone numbers if order is pending
  if (order.value.status === 'pending' && (field.type === 'phone' || field.label.includes('手机') || field.label.includes('电话'))) {
      return maskPhone(value);
  }
  
  return value;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (time: string) => {
  if (!time) return '-';
  // Remove AM/PM/上午/下午
  return time.replace(/(AM|PM|上午|下午)/gi, '').trim();
};

const grabOrder = () => {
    // Navigate to Provider Dashboard to use the Quote Dialog?
    // Or implement Quote Dialog here?
    // User experience: If I am in Detail, I want to quote directly.
    // However, for consistency and implementing complex credit check dialog again...
    // Let's implement a simpler "Confirm Quote" modal here or leverage dashboard.
    // Dashboard is a component on home. Detail is a page. Can't reuse easily without global component.
    // Let's implement simplified Quote Dialog here.
    
    uni.showModal({
        title: '发起报价',
        editable: true,
        placeholderText: '请输入报价金额 (数字)',
        content: '报价将扣除积分', // Note: simplistic, real flow should show cost. 
                                  // Can't show custom UI in showModal easily.
                                  // For MVP, prompts for price.
        success: async (res) => {
            if (res.confirm && res.content) {
                const price = Number(res.content);
                if (isNaN(price) || price <= 0) {
                     uni.showToast({ title: '请输入有效金额', icon: 'none' });
                     return;
                }
                
                // Confirm Cost
                // We need to know cost. Fetch template?
                // Assume 10 points for now or fetch?
                // Let's do a double confirm
                uni.showModal({
                    title: '确认消耗',
                    content: `报价金额: $${price}\n即将扣除积分，确定发送吗？`,
                    success: async (res2) => {
                        if (res2.confirm) {
                            try {
                                uni.showLoading({ title: '提交中...' });
                                // Add message support? modal limitations. 
                                // Hardcode message for now or second prompt.
                                await quotesApi.create({
                                    submissionId: order.value.id,
                                    price: price,
                                    message: '专业服务，期待合作' // Default message from quick quote
                                });
                                uni.hideLoading();
                                uni.showToast({ title: '报价已发送', icon: 'success' });
                                // Stay on page? or go back?
                                setTimeout(() => goBack(), 1500);
                            } catch (error: any) {
                                uni.hideLoading();
                                uni.showToast({ title: error.message || '报价失败', icon: 'none' });
                            }
                        }
                    }
                });
            }
        }
    });
};

/* Lifecycle */
onMounted(async () => {
  // Get order from storage
  const storedOrder = uni.getStorageSync('currentOrderDetail');
  if (storedOrder) {
    try {
      order.value = JSON.parse(storedOrder);
      console.log('DEBUG order.value:', order.value);
      console.log('DEBUG order.value.formData:', order.value.formData);
      
      // Check if already quoted from stored data
      if (order.value.hasQuoted) {
        hasQuoted.value = true;
      }
      
      // Also check via API to ensure accuracy
      if (order.value.id) {
        try {
          const costInfo = await quotesApi.getQuoteCost(order.value.id);
          // If cost API returns canQuote as false and remainingAfterQuote equals currentCredits,
          // it might be because already quoted. But let's verify by checking if we've quoted.
          quoteCostInfo.value = costInfo;
          
          // Additional check: if order was passed with hasQuoted true
          if (order.value.hasQuoted) {
            hasQuoted.value = true;
          }
        } catch (e) {
          console.log('Could not verify quote status');
        }
      }
      
      // Log all address fields for debugging
      const formData = order.value.formData || {};
      for (const key of Object.keys(formData)) {
        const field = formData[key];
        if (field?.type === 'address') {
          console.log('DEBUG ADDRESS FIELD:', key, field);
          console.log('DEBUG ADDRESS VALUE:', field.value);
        }
      }
    } catch (e) {
      console.error('Failed to parse order:', e);
    }
  }
  loading.value = false;
});
</script>

<style scoped>
.order-detail {
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
  padding: 16px 20px;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.placeholder {
  width: 40px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #94a3b8;
  font-size: 14px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  margin: 0 16px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(16, 185, 129, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  display: block;
}

.order-no {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
}

.status-badge.accepted {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.status-badge.completed {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
}

.content {
  flex: 1;
  padding: 0 16px;
  padding-bottom: 120px;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 12px;
  display: block;
}

.info-item {
  display: flex;
  flex-direction: row; /* Horizontal layout */
  align-items: flex-start; /* Top align */
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  gap: 12px; 
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  width: 90px; /* Fixed width strictly */
  flex-shrink: 0;
}

.info-icon {
  color: #64748b;
}

.info-value {
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  text-align: left; /* Left align value */
  flex: 1; 
  word-break: break-all;
}

.address-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-top: 8px;
}

.address-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.address-text {
  flex: 1;
}

.street {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  display: block;
  margin-bottom: 4px;
}

.city-prov {
  font-size: 13px;
  color: #94a3b8;
}

.timestamp-card {
  padding: 16px;
  text-align: center;
}

.timestamp {
  font-size: 12px;
  color: #64748b;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #1e293b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary, .btn-primary {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-primary {
  background: #10b981;
  color: #fff;
}

.btn-quoted {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  background: rgba(100, 116, 139, 0.3);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-white { color: #fff; }
.text-emerald-500 { color: #10b981; }

/* Custom Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  display: block;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  display: block;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.location-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.location-content {
  flex: 1;
}

.location-text {
  font-size: 15px;
  color: #fff;
  font-weight: 500;
  display: block;
}

.location-sub {
  font-size: 12px;
  color: #64748b;
  display: block;
}

.lock-icon {
  margin-left: auto;
  opacity: 0.5;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #3b82f6;
  font-size: 13px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 8px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
  display: block;
}

.quote-input {
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  color: #fff;
  box-sizing: border-box;
}

.quote-input:focus {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.quote-textarea {
  width: 100%;
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #fff;
  box-sizing: border-box;
}

.quote-textarea:focus {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.placeholder-text {
  color: #64748b;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.modal-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-btn.confirm {
  background: #10b981;
  color: #fff;
}

.modal-btn.confirm.disabled {
  background: #475569;
  opacity: 0.6;
}

/* Credit Info Styles */
.credit-info-box {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.credit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.credit-row:last-child {
  margin-bottom: 0;
}

.credit-label {
  font-size: 13px;
  color: #94a3b8;
}

.credit-value {
  font-size: 14px;
  font-weight: 700;
}

.credit-value.cost {
  color: #f97316;
}

.credit-value.balance {
  color: #10b981;
}

.credit-value.remaining {
  color: #22c55e;
}

.credit-value.insufficient {
  color: #ef4444;
}

.credit-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.warning-text {
  font-size: 13px;
  color: #eab308;
}

.text-yellow-500 {
  color: #eab308;
}
</style>
