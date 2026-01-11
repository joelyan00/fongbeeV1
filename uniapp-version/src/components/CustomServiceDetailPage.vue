<template>
  <view class="detail-page flex flex-col h-screen bg-gray-50 box-border">
    <!-- Header (Static) -->
    <view class="header bg-white shrink-0 px-4 py-3 flex flex-row items-center border-b border-gray-100 z-50">
         <view @click="$emit('back')" class="back-btn w-8 h-8 flex items-center justify-center mr-2 active-opacity">
            <AppIcon name="chevron-left" :size="24" class="text-gray-700"/>
         </view>
         <text class="title font-bold text-lg flex-1 text-center pr-10 text-gray-900">订单详情</text>
    </view>

    <!-- Scrollable Content -->
    <scroll-view scroll-y class="flex-1 min-h-0 bg-gray-50" :enable-back-to-top="true">
        <view class="content p-4">
            <!-- Status Card -->
            <view class="status-card bg-emerald-600 rounded-2xl p-6 mb-4 shadow-lg text-white relative overflow-hidden">
                <!-- Background Decoration -->
                <view class="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                     <AppIcon :name="getStatusIcon(order.status)" :size="100" />
                </view>
                
                <view class="flex flex-row items-center gap-3 mb-4 relative z-10">
                    <view class="status-icon-bg w-10 h-10 rounded-full bg-white-20 flex items-center justify-center">
                        <AppIcon :name="getStatusIcon(order.status)" :size="24" class="text-white"/>
                    </view>
                    <text class="text-2xl font-bold">{{ getStatusText(order.status) }}</text>
                </view>
                
                <view class="order-info relative z-10">
                    <view class="flex flex-row items-center justify-between mb-1 opacity-90">
                        <text class="text-xs">订单编号</text>
                        <text class="text-xs font-mono select-all">{{ displayOrderId }}</text>
                    </view>
                    <view class="flex flex-row items-center justify-between opacity-90">
                        <text class="text-xs">提交时间</text>
                        <text class="text-xs font-mono">{{ formatDate(order.created_at) }}</text>
                    </view>
                </view>
            </view>

            <!-- Form Details Card -->
            <view class="section-card bg-white rounded-2xl p-5 mb-4 shadow-sm">
                <view class="flex flex-row items-center justify-between mb-4 pb-3 border-b border-gray-50">
                    <view class="flex flex-row items-center gap-2">
                        <view class="w-1 h-4 bg-emerald-500 rounded-full"></view>
                        <text class="font-bold text-gray-900 text-base">需求信息</text>
                    </view>
                    <text v-if="isEditing" class="text-emerald-600 text-sm font-bold">编辑中</text>
                </view>
                
                <view class="flex flex-col gap-4">
                    <view v-for="(item, key) in displayItems" :key="key" class="detail-row">
                        <!-- Default Label (Hide for complex address editor in edit mode to avoid duplication) -->
                        <text v-if="!(isEditing && isAddressObject(editData[key]))" class="label text-sm text-gray-500 mb-1">{{ item.label }}</text>
                        
                        <!-- Edit Mode Inputs -->
                        <view v-if="isEditing" class="edit-box">
                            <!-- Date Picker -->
                            <picker v-if="item.type === 'date'" mode="date" @change="handleDateChange(key, $event)">
                                <view class="value-box bg-white p-3 rounded-xl border border-emerald-200 flex flex-row justify-between items-center">
                                    <text class="text-base text-gray-800">{{ editData[key] || '请选择日期' }}</text>
                                    <AppIcon name="calendar" :size="20" class="text-emerald-500" />
                                </view>
                            </picker>
                            
                            <!-- Address/Object Editor (Matches ServiceRequestPage Style) -->
                            <view v-else-if="isAddressObject(editData[key])" class="flex flex-col gap-2 mt-2">
                                 <!-- Styled Section Label -->
                                 <view class="flex flex-row items-center gap-2 mb-1">
                                     <view class="w-1 h-4 rounded-full" :class="String(key).includes('from') ? 'bg-emerald-500' : (String(key).includes('to') ? 'bg-blue-500' : 'bg-emerald-500')"></view>
                                     <text class="text-base font-bold text-gray-800">{{ item.label }}</text>
                                 </view>

                                <!-- Street (with Autocomplete) -->
                                <view class="relative z-20">
                                    <input 
                                        type="text"
                                        class="w-full h-12 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border" 
                                        placeholder="街道名及门牌号"
                                        :value="editData[key].street"
                                        @input="(e: any) => handleStreetInput(key, e.detail.value)"
                                        @focus="currentFocusField = key"
                                    />
                                    <!-- Suggestions Dropdown -->
                                    <view 
                                        v-if="currentFocusField === key && addressSuggestions.length > 0"
                                        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-60"
                                    >
                                        <scroll-view scroll-y class="max-h-60">
                                            <view 
                                                v-for="(addr, i) in addressSuggestions" 
                                                :key="i"
                                                class="px-4 py-3 border-b border-gray-50 last-border-0 active-bg-gray-50 flex flex-row items-center gap-3"
                                                @click.stop="selectAddressSuggestion(key, addr)"
                                            >
                                                <view class="p-1.5 bg-gray-100 rounded-full flex-shrink-0">
                                                    <AppIcon name="map-pin" :size="16" class="text-gray-500"/>
                                                </view>
                                                <view class="flex-1 min-w-0">
                                                    <text class="text-gray-900 text-sm font-bold block truncate">{{ addr.street }}</text>
                                                    <text class="text-gray-500 text-xs block truncate">{{ addr.city }}, {{ addr.description }}</text>
                                                </view>
                                            </view>
                                        </scroll-view>
                                    </view>
                                </view>
                                
                                <!-- City & Province -->
                                <view class="flex flex-row gap-4">
                                    <input 
                                        v-model="editData[key].city" 
                                        class="flex-1 h-12 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border" 
                                        placeholder="城市"
                                    />
                                    <input 
                                        v-model="editData[key].province" 
                                        class="flex-1 h-12 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border" 
                                        placeholder="省份"
                                    />
                                </view>

                                <!-- Postal Code -->
                                <input 
                                    v-model="editData[key].postal_code" 
                                    class="w-full h-12 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border" 
                                    placeholder="邮政编码"
                                />
                            </view>
                            
                            <!-- Default Text Input -->
                            <input v-else 
                                v-model="editData[key]" 
                                class="value-box bg-white p-3 rounded-xl border border-emerald-200 text-base text-gray-800 h-10" 
                                placeholder="请输入内容"
                            />
                        </view>

                        <!-- Display Mode Text -->
                        <view v-else class="value-box bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <text class="text-base text-gray-800 leading-relaxed">{{ formatValue(item.displayValue) }}</text>
                        </view>
                    </view>

                    <view v-if="Object.keys(displayItems).length === 0" class="py-4 text-center">
                        <text class="text-gray-400 text-sm">暂无详细信息</text>
                    </view>
                </view>
            </view>

            <!-- Provider Info Card (Hidden while editing for focus) -->
            <view v-if="!isEditing" class="section-card bg-white rounded-2xl p-5 mb-4 shadow-sm">
                 <view class="flex flex-row items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                    <view class="w-1 h-4 bg-blue-500 rounded-full"></view>
                    <text class="font-bold text-gray-900 text-base">服务商信息</text>
                </view>
                
                <view v-if="order.assigned_provider_id" class="flex flex-col gap-3">
                     <!-- Assigned provider UI -->
                     <view class="provider-info flex flex-row items-center gap-3">
                        <view class="avatar w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                            <image v-if="order.provider?.avatar_url" :src="order.provider.avatar_url" class="w-full h-full" mode="aspectFill"/>
                            <AppIcon v-else name="user" :size="24" class="text-gray-400 m-auto"/>
                        </view>
                        <view class="flex flex-col">
                            <text class="font-bold text-gray-900">{{ order.provider?.name || '接单师傅' }}</text>
                            <text class="text-xs text-gray-500">已为您安排服务</text>
                        </view>
                     </view>
                </view>

                 <!-- Unified List: Matching Providers + Quotes -->
                 <view v-else class="flex flex-col gap-4">
                     <view class="flex flex-row justify-between items-center mb-2">
                         <text class="text-gray-500 text-sm">符合条件的服务商 ({{ allProvidersList.length }})</text>
                         <text class="text-xs text-gray-400">等待报价中...</text>
                     </view>

                    <view v-for="(provider, index) in allProvidersList" :key="provider.id || index" class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-row items-center gap-3">
                        <!-- Avatar -->
                        <view class="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm">
                            <image v-if="provider.avatar_url" :src="provider.avatar_url" class="w-full h-full" mode="aspectFill"/>
                            <text v-else class="text-lg font-bold text-emerald-600">{{ (provider.name || 'P')[0].toUpperCase() }}</text>
                        </view>
                        
                        <!-- Info (Name only + Clickable) -->
                        <view class="flex-1 min-w-0 flex flex-col justify-center active:opacity-70" @click="viewProviderProfile(provider)">
                            <text class="font-bold text-gray-900 text-base truncate">{{ provider.name }}</text>
                            <text class="text-xs text-gray-400 mt-1">查看详情 ></text>
                        </view>

                        <!-- Action/Status -->
                        <view class="flex-shrink-0 flex flex-col items-end gap-1">
                            <template v-if="provider.has_quoted">
                                <text class="text-lg font-bold text-emerald-600">${{ provider.quote.price }}</text>
                                <text v-if="provider.quote.deposit > 0" class="text-xs text-amber-500 font-medium mt-0.5">需定金: ${{ provider.quote.deposit }}</text>
                                <button 
                                    class="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform"
                                    @click="handleHireProvider(provider)"
                                >
                                    雇佣
                                </button>
                            </template>
                            <template v-else>
                                <view class="bg-gray-200 px-3 py-1.5 rounded-lg">
                                    <text class="text-gray-500 text-xs font-medium">等待报价</text>
                                </view>
                            </template>
                        </view>
                    </view>
                </view>
            </view>
            
            <!-- Payment Info Card (NEW) -->
            <view v-if="order.assigned_provider_id" class="section-card bg-white rounded-2xl p-5 mb-4 shadow-sm">
                 <view class="flex flex-row items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                    <view class="w-1 h-4 bg-amber-500 rounded-full"></view>
                    <text class="font-bold text-gray-900 text-base">支付详情</text>
                </view>
                
                <view class="flex flex-col gap-3">
                    <view class="flex flex-row justify-between items-center">
                        <text class="text-gray-500">订单总价</text>
                        <text class="font-bold text-lg">${{ order.total_price || '0.00' }}</text>
                    </view>
                     <view class="flex flex-row justify-between items-center">
                        <text class="text-gray-500">定金 (托管)</text>
                        <view class="flex flex-row items-center gap-2">
                             <text class="font-bold">${{ order.deposit_price || '20.00' }}</text>
                             <text v-if="order.deposit_status === 'paid'" class="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">已托管</text>
                             <text v-else class="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded">待支付</text>
                        </view>
                    </view>
                    <view class="flex flex-row justify-between items-center">
                        <text class="text-gray-500">尾款 (完工付)</text>
                        <view class="flex flex-row items-center gap-2">
                             <text class="font-bold">${{ (order.total_price || 0) - (order.deposit_price || 20) }}</text>
                             <text v-if="['paid', 'paid_online', 'paid_offline'].includes(order.balance_status)" class="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">已支付</text>
                             <text v-else class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">待付款</text>
                        </view>
                    </view>
                </view>
            </view>
            
            <!-- Padding at bottom of scrolled content -->
            <view class="h-4"></view>
        </view>
    </scroll-view>

    <!-- Bottom Actions (Dynamic Footer) -->
    <view v-if="order.status !== 'completed' && order.status !== 'cancelled'" class="bottom-bar shrink-0 bg-white px-4 py-3 border-t border-gray-100 flex flex-row gap-3 pb-safe shadow-top z-50">
         <template v-if="isEditing">
             <button class="btn-secondary flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm" @click="handleCancelEdit">
                 取消编辑
             </button>
             <button class="btn-primary flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow-md" @click="handleSave">
                 保存修改
             </button>
         </template>

         <!-- Status: Pending (Searching) -->
         <template v-else-if="order.status === 'pending'">
             <button class="btn-secondary flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm" @click="handleCancel">
                 取消订单
             </button>
             <button class="btn-primary flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow-md" @click="handleStartEdit">
                 修改需求
             </button>
         </template>

         <!-- Status: Processing (Hired, Need Deposit) -> Map logic: If just hired (processing) and no deposit paid -->
         <template v-else-if="order.status === 'processing' || (order.status === 'in_progress' && order.deposit_status !== 'paid')">
             <button class="btn-secondary flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm" @click="handleCancel">
                 取消订单
             </button>
             <button class="btn-primary flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl text-sm shadow-md" @click="handlePayDeposit">
                 支付定金 (${{ order.deposit_price || 20 }})
             </button>
         </template>

         <!-- Status: In Progress (Deposit Paid, Waiting Start) -->
         <template v-else-if="order.status === 'in_progress'">
             <view class="flex-1 flex items-center justify-center">
                  <text class="text-sm text-gray-500 mb-1">等待服务商上门...</text>
             </view>
             <button class="btn-primary flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow-md" @click="handleConfirmStart">
                 确认已开工
             </button>
         </template>

          <!-- Status: Service Started (Waiting Balance) -->
         <template v-else-if="order.status === 'service_started'">
             <button class="btn-primary w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow-md" @click="handlePayBalance">
                 支付尾款 / 完成订单
             </button>
         </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import AppIcon from './Icons.vue';
import { submissionsApi, quotesApi, ordersApi } from '@/services/api';

const props = defineProps<{
  order: any
}>();

const emit = defineEmits(['back', 'modify', 'updated']);

// State
const isEditing = ref(false);
const editData = ref<Record<string, any>>({});
const saving = ref(false);
// Adding debug status here
const debugApiStatus = ref('Init');

// Google Maps Logic
const addressSuggestions = ref<any[]>([]);
const currentFocusField = ref<string | null>(null);
let autocompleteService: any = null;
let placesService: any = null;
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

onMounted(() => {
    // Initialize Google Maps if in browser
    if (isBrowser) {
        const checkGoogle = setInterval(() => {
            if ((window as any).google && (window as any).google.maps) {
                clearInterval(checkGoogle);
                initGoogleServices();
            }
        }, 500);
        setTimeout(() => clearInterval(checkGoogle), 10000);
    }
});

const initGoogleServices = () => {
    try {
        autocompleteService = new (window as any).google.maps.places.AutocompleteService();
        placesService = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
    } catch (e) {
        console.error('Google Maps Init Failed', e);
    }
}

const handleStreetInput = (key: string, value: string) => {
    // Update value in editData
    if (!editData.value[key]) editData.value[key] = {};
    editData.value[key].street = value;
    currentFocusField.value = key;

    if (!value || value.length < 3) {
        addressSuggestions.value = [];
        return;
    }

    if (autocompleteService) {
        autocompleteService.getPlacePredictions({
            input: value,
            componentRestrictions: { country: 'ca' }, // Restrict to Canada
        }, (predictions: any[], status: any) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
                addressSuggestions.value = predictions.map(p => ({
                    description: p.description,
                    place_id: p.place_id,
                    street: p.structured_formatting.main_text,
                    city: p.structured_formatting.secondary_text
                }));
            } else {
                addressSuggestions.value = [];
            }
        });
    }
};

const selectAddressSuggestion = (key: string, suggestion: any) => {
    // Hide suggestions
    addressSuggestions.value = [];
    currentFocusField.value = null;
    
    // Get Details
    if (placesService) {
        placesService.getDetails({
            placeId: suggestion.place_id,
            fields: ['address_components', 'formatted_address']
        }, (place: any, status: any) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
                // Parse components
                let streetNumber = '';
                let route = '';
                let city = '';
                let province = '';
                let postalCode = '';
                
                place.address_components.forEach((component: any) => {
                    const types = component.types;
                    if (types.includes('street_number')) streetNumber = component.long_name;
                    if (types.includes('route')) route = component.long_name;
                    if (types.includes('locality')) city = component.long_name;
                    if (types.includes('administrative_area_level_1')) province = component.short_name;
                    if (types.includes('postal_code')) postalCode = component.long_name;
                });
                
                // Update Fields
                if (!editData.value[key]) editData.value[key] = {};
                editData.value[key].street = `${streetNumber} ${route}`.trim();
                editData.value[key].city = city;
                editData.value[key].province = province;
                editData.value[key].postal_code = postalCode;
            }
        });
    }
};

const formatDate = (str: string) => {
    if (!str) return '';
    try {
        const date = new Date(str);
        return date.toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } catch (e) { return str; }
}

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        'pending': '正在寻找服务商',
        'processing': '服务进行中',
        'completed': '服务已完成',
        'cancelled': '订单已取消'
    };
    return map[status] || status;
};

const getStatusIcon = (status: string) => {
    const map: Record<string, string> = {
        'pending': 'search',
        'processing': 'clock',
        'completed': 'check-circle',
        'cancelled': 'x-circle'
    };
    return map[status] || 'help-circle';
};

const displayOrderId = computed(() => {
    if (props.order?.form_data?._order_no) {
        return props.order.form_data._order_no;
    }
    return props.order?.id || 'Unknown';
});

const displayItems = computed(() => {
    if (!props.order?.form_data) return {};
    const items: Record<string, any> = {};
    const formData = props.order.form_data;
    
    for (const key in formData) {
        if (key.startsWith('_') || key === 'template_id' || key === 'invitePhone' || key === 'publishType') continue;
        
        const val = formData[key];
        if (val && typeof val === 'object' && val._is_rich) {
            items[key] = {
                label: val.label,
                value: val.value,
                displayValue: val.displayValue || val.value,
                type: val.type
            };
        } else {
             items[key] = {
                label: key.includes('field_') ? '其他信息' : key,
                value: val,
                displayValue: val,
                type: 'text'
            };
        }
    }
    return items;
});

const formatValue = (val: any) => {
    if (Array.isArray(val)) return val.join(', ');
    if (val && typeof val === 'object') {
        if (val.street) {
            return val.city ? `${val.street}, ${val.city}` : val.street;
        } 
        return JSON.stringify(val);
    }
    return String(val);
}

const isAddressObject = (val: any) => {
    return val && typeof val === 'object' && (val.street !== undefined || val.city !== undefined || val.address !== undefined || val.postal_code !== undefined);
};

// Edit Actions
const handleStartEdit = () => {
    if (props.order.status !== 'pending') {
        uni.showToast({ title: '订单已在处理中，无法修改', icon: 'none' });
        return;
    }
    // Initialize editData with deep copy to support object editing
    const rawData: Record<string, any> = {};
    for (const key in props.order.form_data) {
        const item = props.order.form_data[key];
        let val = (item && typeof item === 'object' && item._is_rich) ? item.value : item;
        
        // Deep copy if object to allow editing nested fields without mutating prop directly
        if (val && typeof val === 'object') {
             try {
                 val = JSON.parse(JSON.stringify(val));
             } catch (e) {
                 console.error('Deep copy failed', e);
             }
        }
        
        rawData[key] = val;
    }
    editData.value = rawData;
    isEditing.value = true;
};

const handleCancelEdit = () => {
    isEditing.value = false;
};

const handleDateChange = (key: string, e: any) => {
    editData.value[key] = e.detail.value;
};

const handleSave = async () => {
    saving.value = true;
    uni.showLoading({ title: '保存中...' });
    
    try {
        // Re-construct rich form data with original labels/types but new values
        const newRichFormData: Record<string, any> = { ...props.order.form_data };
        for (const key in editData.value) {
            if (newRichFormData[key] && typeof newRichFormData[key] === 'object' && newRichFormData[key]._is_rich) {
                newRichFormData[key].value = editData.value[key];
                // For simple fields, displayValue is the same as value
                // In a perfect world, we'd handle select/option labels here too, but for now value suffices
                newRichFormData[key].displayValue = editData.value[key]; 
            } else {
                newRichFormData[key] = editData.value[key];
            }
        }

        const res = await submissionsApi.update(props.order.id, {
            formData: newRichFormData
        });

        uni.hideLoading();
        uni.showToast({ title: '修改成功', icon: 'success' });
        isEditing.value = false;
        
        // Emit updated event to parent so it can refresh the currentOrder
        emit('updated', res.submission);
    } catch (error: any) {
        uni.hideLoading();
        uni.showToast({ title: '保存失败: ' + (error.data?.error || error.message), icon: 'none' });
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    if (props.order.status === 'cancelled') return;
    
    uni.showModal({
        title: '提示',
        content: '确定要取消这个订单吗？取消后不可撤回。',
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '取消中...' });
                try {
                    const result = await submissionsApi.cancel(props.order.id);
                    uni.hideLoading();
                    uni.showToast({ title: '订单已取消', icon: 'success' });
                    // Refresh view
                    emit('updated', result.submission);
                } catch (error: any) {
                    uni.hideLoading();
                    uni.showToast({ title: '取消失败: ' + (error.data?.error || error.message), icon: 'none' });
                }
            }
        }
    });
}


const quotes = ref<any[]>([]);

// Watch for order changes to fetch matching providers
watch(() => props.order?.id, (newId) => {
    if (newId) fetchMatchingProviders(newId);
}, { immediate: true });

function viewProviderProfile(provider: any) {
    if (!provider || !provider.id) return;
    
    // Pass quote info if available
    const params = new URLSearchParams({
        id: provider.id,
        orderId: props.order?.id || '',
        hasQuoted: provider.has_quoted ? '1' : '0',
        quotePrice: provider.has_quoted ? provider.quote?.price : '',
        quoteDeposit: provider.has_quoted ? (provider.quote?.deposit || 0) : '',
        quoteId: provider.has_quoted ? provider.quote?.id : '', // Pass quoteId
    }).toString();

    uni.navigateTo({
        url: `/pages/index/provider-profile?${params}`
    });
}


// Watch for order changes to fetch quotes
watch(() => props.order?.id, (newId) => {
    if (newId) fetchQuotes(newId);
}, { immediate: true });

async function fetchQuotes(submissionId: string) {
    if (!submissionId) return;
    try {
        const res = await quotesApi.getBySubmission(submissionId);
        quotes.value = res.quotes || [];
    } catch (e) {
        console.error('Fetch quotes failed', e);
    }
}

const handleHire = (quote: any) => {
    uni.showModal({
        title: '确认雇佣',
        content: `是否确认雇佣 ${quote.provider?.name || '该服务商'}？\n报价金额: $${quote.quote_price}`,
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '处理中...' });
                try {
                    await quotesApi.accept(quote.id);
                    uni.hideLoading();
                    uni.showToast({ title: '雇佣成功！', icon: 'success' });
                    // Emit update to refresh order status
                    // Note: Ideally we should fetch the updated order, but parent component usually re-fetches or we can fake it.
                    // For now, let's just emit 'updated' with a partially updated order object or reload logic.
                    // We don't have the full new order object here unless we fetch it.
                    // The backend returns { message, provider_id }.
                    // Let's rely on parent refreshing or just setting status locally if bound.
                    // Actually, simpler: emit 'back' or 'updated'.
                    emit('updated', { 
                        ...props.order, 
                        status: 'processing', 
                        assigned_provider_id: quote.provider_id 
                    });
                } catch (error: any) {
                    uni.hideLoading();
                    uni.showToast({ title: '操作失败: ' + (error.message || 'Unknown'), icon: 'none' });
                }
            }
        }
    });
};

// Matching providers
const matchingProviders = ref<any[]>([]);

// Keep watch
watch(() => props.order?.id, (newId) => {
    if (newId) fetchMatchingProviders(newId);
}, { immediate: true });

// Removed duplicate debugApiStatus declaration here

async function fetchMatchingProviders(submissionId: string) {
    if (!submissionId) {
        debugApiStatus.value = 'No ID';
        return;
    }
    try {
        debugApiStatus.value = 'Fetching...';
        console.log('Fetching matching providers for:', submissionId);
        const res = await submissionsApi.getMatchingProviders(submissionId);
        console.log('Matching providers response:', res);
        matchingProviders.value = res.providers || [];
        debugApiStatus.value = `Success: ${matchingProviders.value.length}`;
        console.log('Set matchingProviders to:', matchingProviders.value);
    } catch (e: any) {
        debugApiStatus.value = `Error: ${e.message}`;
        console.error('Fetch matching providers error:', e);
        console.log('Fetch matching providers skipped or failed:', e.message);
        matchingProviders.value = [];
    }
}

// Computed property to merge matching providers and unknown quoted providers
const allProvidersList = computed(() => {
    // 1. Create a map of matching providers
    const providerMap = new Map();
    matchingProviders.value.forEach(p => providerMap.set(p.id, { ...p }));

    // 2. Merge checking quotes: if a provider quoted but wasn't in matching (e.g. edge case), add them
    quotes.value.forEach(q => {
        if (!q.provider_id) return;
        
        const existing = providerMap.get(q.provider_id);
        if (existing) {
            // Update quote info
            existing.has_quoted = true;
            existing.quote = {
                id: q.id,
                price: q.quote_price,
                deposit: q.deposit_price,
                message: q.message,
                created_at: q.created_at
            };
        } else {
            // New provider from quote (fallback)
            providerMap.set(q.provider_id, {
                id: q.provider_id,
                name: q.provider?.name || '未知服务商',
                avatar_url: q.provider?.avatar_url,
                rating: q.provider?.provider_profiles?.rating || 5.0,
                service_city: '未知城市',
                has_quoted: true,
                quote: {
                    id: q.id,
                    price: q.quote_price,
                    deposit: q.deposit_price,
                    message: q.message,
                    created_at: q.created_at
                }
            });
        }
    });

    // 3. Convert to array and sort
    const list = Array.from(providerMap.values());
    
    // Sort: quoted first, then by rating
    return list.sort((a, b) => {
        if (a.has_quoted && !b.has_quoted) return -1;
        if (!a.has_quoted && b.has_quoted) return 1;
        return (b.rating || 5) - (a.rating || 5);
    });
});

// Handle hire from matching provider card
const handleHireProvider = (provider: any) => {
    if (!provider.has_quoted || !provider.quote) {
        uni.showToast({ title: '该服务商尚未报价', icon: 'none' });
        return;
    }
    
    uni.showModal({
        title: '确认雇佣',
        content: `是否确认雇佣 ${provider.name || '该服务商'}？\n报价金额: $${provider.quote.price}`,
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '处理中...' });
                try {
                    // Find the quote ID from the quotes list
                    // If fetching matching providers failed, we might only have "quote" object constructed in allProvidersList
                    // We need the real quote ID.
                    
                    let quoteId = '';
                    
                    // 1. Try finding in loaded quotes list
                    const matchedQuote = quotes.value.find(q => q.provider_id === provider.id);
                    if (matchedQuote) {
                        quoteId = matchedQuote.id;
                    } else {
                        // 2. Refresh quotes to be sure
                        await fetchQuotes(props.order.id);
                        const refetchedQuote = quotes.value.find(q => q.provider_id === provider.id);
                        if (refetchedQuote) {
                            quoteId = refetchedQuote.id;
                        }
                    }

                    if (!quoteId) {
                         throw new Error('无法找到有效报价记录');
                    }

                    await quotesApi.accept(quoteId);
                    
                    uni.hideLoading();
                    uni.showToast({ title: '雇佣成功！', icon: 'success' });
                    emit('updated', { 
                        ...props.order, 
                        status: 'processing', 
                        assigned_provider_id: provider.id 
                    });
                } catch (error: any) {
                    uni.hideLoading();
                    uni.showToast({ title: '操作失败: ' + (error.message || 'Unknown'), icon: 'none' });
                }
            }
        }
    });
};

// ============ Payment Handlers ============

const handlePayDeposit = async () => {
    uni.showLoading({ title: '处理支付中...' });
    try {
        // Assume default card for now (MVP). Later add select card modal if needed.
        const res = await ordersApi.payDeposit(props.order.id);
        
        uni.hideLoading();
        uni.showToast({ title: '定金支付成功', icon: 'success' });
        
        // Update Order Local State
        emit('updated', { 
            ...props.order, 
            status: 'in_progress',
            deposit_status: 'paid',
            deposit_price: props.order.deposit_price || 20 // Ensure visual consistency
        });
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: '支付失败: ' + (e.message || 'Unknown'), icon: 'none' });
    }
};

const handleConfirmStart = () => {
    uni.showModal({
        title: '确认开工',
        content: '请确认服务商已经到达并准备开始服务。定金将划拨给服务商。',
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '确认中...' });
                try {
                    await ordersApi.confirmStart(props.order.id);
                    uni.hideLoading();
                    uni.showToast({ title: '已确认开工', icon: 'success' });
                    
                     emit('updated', { 
                        ...props.order, 
                        status: 'service_started'
                    });
                } catch (e: any) {
                    uni.hideLoading();
                    uni.showToast({ title: '操作失败: ' + (e.message || 'Unknown'), icon: 'none' });
                }
            }
        }
    });
};

const handlePayBalance = () => {
    uni.showActionSheet({
        itemList: ['线上支付 (银行卡)', '线下支付 (现金/转账)'],
        success: async (res) => {
            const isOnline = res.tapIndex === 0;
            const method = isOnline ? 'online' : 'offline';
            
            if (isOnline) {
                uni.showLoading({ title: '支付尾款中...' });
            } else {
                uni.showLoading({ title: '确认状态中...' });
            }
            
            try {
                await ordersApi.payBalance(props.order.id, method);
                uni.hideLoading();
                uni.showToast({ title: '订单已完成', icon: 'success' });
                
                emit('updated', { 
                    ...props.order, 
                    status: 'completed',
                    balance_status: isOnline ? 'paid_online' : 'paid_offline'
                });
            } catch (e: any) {
                uni.hideLoading();
                uni.showToast({ title: '支付失败: ' + (e.message || 'Error'), icon: 'none' });
            }
        }
    });
};
</script>

<style scoped>
/* Reset & Utilities */
.min-h-screen { min-height: 100vh; }
.pb-safe { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-emerald-600 { background-color: #059669; }
.bg-emerald-500 { background-color: #10b981; }
.bg-amber-500 { background-color: #f59e0b; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-white-20 { background-color: rgba(255,255,255,0.2); }

.text-white { color: #ffffff; }
.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-blue-500 { color: #3b82f6; }

.font-bold { font-weight: 800; }
.font-mono { font-family: monospace; }
.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.text-2xl { font-size: 24px; }
.text-center { text-align: center; }

/* Layout */
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.w-full { width: 100%; }
.relative { position: relative; }
.absolute { position: absolute; }
.sticky { position: sticky; }
.fixed { position: fixed; }
.top-0 { top: 0; }
.right-0 { right: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.z-10 { z-index: 10; }
.z-50 { z-index: 50; }
.overflow-hidden { overflow: hidden; }

/* Spacing */
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.p-5 { padding: 20px; }
.p-6 { padding: 24px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }
.pb-3 { padding-bottom: 12px; }
.pr-10 { padding-right: 40px; }
.mr-2 { margin-right: 8px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-20 { margin-bottom: 80px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

/* Components */
.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }
.rounded-full { border-radius: 9999px; }

.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-top { box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05); }

.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-50 { border-color: #f9fafb; }
.border-gray-100 { border-color: #f3f4f6; }
.border-emerald-200 { border-color: #a7f3d0; }

/* Animations & Shapes */
.w-8 { width: 32px; }
.h-8 { height: 32px; }
.h-10 { height: 40px; }
.w-10 { width: 40px; }
.h-10 { height: 40px; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }
.w-16 { width: 64px; }
.h-16 { height: 64px; }
.w-1 { width: 4px; }
.h-4 { height: 16px; }

.active-opacity:active { opacity: 0.7; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

button::after { border: none; }
</style>
