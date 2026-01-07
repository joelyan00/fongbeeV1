<template>
  <view class="min-h-screen bg-main-gray relative font-sans text-gray-900">
    
    <!-- 1. Detailed Category Page (Highest Priority Overlay) -->
    <CategoryPage 
      v-if="viewState === 'category_detail'"
      :category-name="selectedCategory" 
      @back="handleBackToHome" 
    />
    
    <!-- 2. Custom Services Full List Page -->
    <view v-else-if="viewState === 'custom_services'" class="pt-custom min-h-screen bg-white">
        <view class="p-4 border-b border-gray-100 flex flex-row items-center">
             <view @click="handleBackToHome" class="mr-4"><text class="font-bold text-xl">&lt;</text></view>
             <text class="font-bold text-lg">全部定制服务</text>
        </view>
        <view class="p-4 h-full flex items-center justify-center">
            <text class="text-gray-500">定制服务列表页面 (开发中)</text>
        </view>
    </view>

    <!-- 2.1 Dynamic Service Request Form -->
    <ServiceRequestPage 
       v-else-if="viewState === 'service_request_form' || viewState === 'edit_request_form'"
       :service-id="selectedCategory"
       :edit-order="viewState === 'edit_request_form' ? currentOrder : null"
       @back="handleBackFromForm"
       @publish="handleServicePublished"
    />

    <!-- 2.2 Provider Apply -->
    <ProviderApplyPage 
       v-else-if="viewState === 'provider_apply'"
       @back="handleBackToHome"
       @success="handleProviderApplySuccess"
       @request-login="isAuthModalVisible = true"
    />

    <!-- 2.3 Provider Dashboard -->
    <ProviderDashboard 
       v-else-if="viewState === 'provider_dashboard'"
       @switch-user="handleBackToHome"
       @open-apply="handleOpenProviderApply"
    />



    <!-- 2.4 My Submissions List -->
    <MySubmissionsPage 
       v-else-if="viewState === 'my_submissions'"
       :initial-status="submissionStatusFilter"
       @back="handleBackToHome"
       @go-home="handleBackToHome"
       @view-detail="handleViewOrderDetail"
    />

    <!-- 2.5 Custom Service Detail -->
    <CustomServiceDetailPage 
       v-else-if="viewState === 'custom_service_detail'"
       :order="currentOrder"
       @back="handleBackToSubmissions"
       @modify="handleModifyOrder"
       @updated="(newOrder) => currentOrder = newOrder"
    />

    <!-- 2.6 Article Detail Page -->
    <ArticleDetailPage
        v-else-if="viewState === 'article_detail'"
        :article-id="selectedArticleId"
        @back="handleBackToHome"
    />

    <!-- 3. Standard Services Tab -->
    <StandardServicesPage 
      v-else-if="activeTab === 'standard'"
      :current-city="currentLocation"
      @category-select="handleCategorySelect"
      @service-click="handleServiceOrder"
    />

    <!-- 4. Custom Services Tab -->
    <CustomServicesPage 
      v-else-if="activeTab === 'custom'"
      @service-select="handleDirectServiceOrder"
      @category-select="handleCategorySelect"
      @publish-click="handlePublishClick"
    />

    <!-- 5. Profile Tab -->
    <ProfilePage 
      v-else-if="activeTab === 'profile'" 
       ref="profilePageRef"
       :qr-register-type="qrRegisterType"
       @switch-role="handleSwitchToProvider"
       @view-submissions="handleViewSubmissions"
    />

    <!-- 6. Default: HOME Tab -->
    <view v-else class="pb-24 md-pb-10">
       <!-- Header -->
       <Header 
          @search-click="isChatOpen = true" 
          @location-click="isLocationModalOpen = true"
          :location-name="currentLocation"
        />
        
        <view class="max-w-7xl mx-auto overflow-visible">
          <Banners />
          
          <ServiceGrid 
            @category-select="handleCategorySelect" 
            :selected-category="selectedCategory" 
          />
          
          <view class="md-px-4">
              <ServiceListings 
                  :category="selectedCategory || '房产交易'" 
                  :current-location="currentLocation" 
                  @view-all="handleViewAllCustomServices"
              />
              <PopularArticles @article-click="handleArticleClick" />
          </view>

          <view class="hidden md-flex justify-center items-center py-10 mt-6 border-t border-gray-200">
              <text class="text-gray-500 font-bold text-lg tracking-wide">优质服务 · fongbee到家</text>
          </view>
        </view>
    </view>

    <!-- Global Bottom Nav -->
    <BottomNav 
      v-if="viewState === 'main'"
      :active-tab="activeTab" 
      @tab-change="handleTabChange" 
    />

    <!-- Modals -->
    <ChatInterface v-if="isChatOpen" @close="isChatOpen = false" />

    <LocationSearchModal 
      v-if="isLocationModalOpen" 
      @close="isLocationModalOpen = false"
      @select="handleLocationSelect"
    />

    <AuthModal 
      v-if="isAuthModalVisible" 
      @close="isAuthModalVisible = false"
      @login-success="handleLoginSuccess"
    />

    <!-- Provider Agreement Modal -->
    <view v-if="isProviderAgreementModalVisible" class="agreement-modal-mask" @click.stop="">
        <view class="agreement-modal-content" @click.stop>
             <view class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <AppIcon name="user" :size="32" class="text-emerald-600"/>
             </view>
             
             <text class="modal-title">申请成为服务商</text>
             
             <text class="modal-desc">
                 你想申请成为服务商，请保证申请材料真实有效，请认真阅读成为服务商的条款，并打勾，点击确认，祝合作愉快。
             </text>
             
             <view class="checkbox-area" @click="isProviderAgreementChecked = !isProviderAgreementChecked">
                 <view 
                    class="checkbox-box"
                    :class="isProviderAgreementChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'"
                 >
                     <AppIcon name="check" :size="14" class="text-white" v-if="isProviderAgreementChecked"/>
                 </view>
                 <text class="checkbox-label">我已阅读并同意相关条款</text>
             </view>

             <view class="btn-row">
                 <button 
                    class="btn-cancel"
                    @click="isProviderAgreementModalVisible = false"
                 >取消</button>
                 <button 
                    class="btn-confirm"
                    :class="{'btn-disabled': !isProviderAgreementChecked}"
                    :disabled="!isProviderAgreementChecked"
                    @click="confirmProviderAgreement"
                 >确认</button>
             </view>
        </view>
    </view>
    
    <!-- Provider Apply Local Modal -->
    <view v-if="showProviderApplyModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;">
        <ProviderApplyModal 
          @close="showProviderApplyModal = false"
          @success="handleProviderApplyModalSuccess"
        />
    </view>

    <!-- Sub-category Selection Modal (Centered) -->
    <view v-if="showSubcategoryModal" class="subcategory-modal-overlay" @click.stop="showSubcategoryModal = false">
        <view class="subcategory-modal-content" @click.stop>
            <text class="subcategory-modal-title">请选择服务类型</text>
            <view class="subcategory-modal-list">
                <view 
                    v-for="(item, idx) in subcategoryOptions" 
                    :key="idx"
                    class="subcategory-modal-item"
                    @click="handleSubcategorySelect(idx)"
                >
                    <text>{{ item.name }}</text>
                    <AppIcon name="chevron-right" :size="20" color="#9ca3af" />
                </view>
            </view>
            <view class="subcategory-modal-cancel" @click="showSubcategoryModal = false">
                <text class="subcategory-modal-cancel-text">取消</text>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Header from '@/components/Header.vue';
import Banners from '@/components/Banners.vue';
import ServiceGrid from '@/components/ServiceGrid.vue';
import ServiceListings from '@/components/ServiceListings.vue';
import PopularArticles from '@/components/PopularArticles.vue';
import BottomNav from '@/components/BottomNav.vue';
import StandardServicesPage from '@/components/StandardServicesPage.vue';
import CategoryPage from '@/components/CategoryPage.vue';
import ChatInterface from '@/components/ChatInterface.vue';
import LocationSearchModal from '@/components/LocationSearchModal.vue';
import CustomServicesPage from '@/components/CustomServicesPage.vue';
import ProfilePage from '@/components/ProfilePage.vue';
import ServiceRequestPage from '@/components/ServiceRequestPage.vue';
import AuthModal from '@/components/AuthModal.vue';
import ProviderApplyPage from '@/components/ProviderApplyPage.vue';
import ProviderDashboard from '@/components/ProviderDashboard.vue';
import ProviderApplyModal from '@/components/ProviderApplyModal.vue';
import MySubmissionsPage from '@/components/MySubmissionsPage.vue';
import CustomServiceDetailPage from '@/components/CustomServiceDetailPage.vue';
import ArticleDetailPage from '@/components/cms/ArticleDetailPage.vue';
import AppIcon from '@/components/Icons.vue'; // Added Import
import { getUserInfo, isLoggedIn as checkLoggedIn, providersApi, formTemplatesApi } from '@/services/api'; 
import { onLoad, onShow } from '@dcloudio/uni-app';
import { onMounted } from 'vue';

type TabView = 'home' | 'standard' | 'custom' | 'profile';
type ViewState = 'main' | 'category_detail' | 'custom_services' | 'service_request_form' | 'edit_request_form' | 'provider_apply' | 'provider_dashboard' | 'my_submissions' | 'custom_service_detail' | 'article_detail'; 

// Navigation State
const activeTab = ref<TabView>('home');
const viewState = ref<ViewState>('main');
const selectedCategory = ref<string>("");
const submissionStatusFilter = ref('pending');
const currentOrder = ref<any>(null);
const selectedArticleId = ref<number | string>('');
const profilePageRef = ref<any>(null);

// Common State
const isChatOpen = ref(false);
const isLocationModalOpen = ref(false);
const currentLocation = ref("多伦多");

const handleLocationSelect = (location: string) => {
    let simplifiedName = location;
    if (location.includes('(')) {
        simplifiedName = location.split(' ')[0];
    }
    currentLocation.value = simplifiedName;
    isLocationModalOpen.value = false;
};

const handleCategorySelect = (category: string) => {
    selectedCategory.value = category;
    viewState.value = 'category_detail';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 }); // Use uni API for scroll
};

const handleBackToHome = () => {
    viewState.value = 'main';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleTabChange = (tab: TabView) => {
    activeTab.value = tab;
    viewState.value = 'main';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleViewAllCustomServices = () => {
     viewState.value = 'custom_services';
     uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleViewOrderDetail = (order: any) => {
    currentOrder.value = order;
    viewState.value = 'custom_service_detail';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleArticleClick = (article: any) => {
    selectedArticleId.value = article.id;
    viewState.value = 'article_detail';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleBackToSubmissions = () => {
    viewState.value = 'my_submissions';
    currentOrder.value = null;
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleModifyOrder = (order: any) => {
    currentOrder.value = order;
    selectedCategory.value = order.template_id || order.form_data?._raw_template_id || '';
    viewState.value = 'edit_request_form';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleBackFromForm = () => {
    if (viewState.value === 'edit_request_form') {
        viewState.value = 'custom_service_detail';
    } else {
        viewState.value = 'main';
    }
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

// Auth Logic
const isAuthModalVisible = ref(false);
const isLoggedIn = ref(false);
const isProviderAgreementModalVisible = ref(false);
const isProviderAgreementChecked = ref(false);
const showProviderApplyModal = ref(false);

// Subcategory selection modal
const showSubcategoryModal = ref(false);
const subcategoryOptions = ref<any[]>([]);

const handleDirectServiceOrder = (template: any) => {
    if (!checkLoggedIn()) {
        isAuthModalVisible.value = true;
        return;
    }
    selectedCategory.value = template.id;
    viewState.value = 'service_request_form';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleServiceOrder = (item: any) => {
    if (!isLoggedIn.value) {
        isAuthModalVisible.value = true;
        return;
    }
    // Proceed to order logic
    uni.showToast({ title: '开始下单: ' + item.title });
};

const handlePublishClick = async (category: string) => {
    // Check login later at submission time for better UX
    
    uni.showLoading({ title: '加载中...' });
    try {
        // Fetch all templates for this category (custom or standard)
        // We query for 'custom' primarily, but could be 'standard' too if reused.
        // Assuming we want 'custom' forms for "Publish Requirement" flow.
        const res = await formTemplatesApi.getPublished(undefined, category); 
        const templates = res.templates || [];

        uni.hideLoading();

        if (templates.length === 0) {
            uni.showToast({ title: '该分类下暂无可用服务', icon: 'none' });
            return;
        }

        if (templates.length === 1) {
            // Only one form -> Go directly
            selectedCategory.value = templates[0].id;
            viewState.value = 'service_request_form'; 
            uni.pageScrollTo({ scrollTop: 0, duration: 0 });
        } else {
            // Multiple forms -> Show centered selector modal
            subcategoryOptions.value = templates;
            showSubcategoryModal.value = true;
        }
    } catch (e) {
        uni.hideLoading();
        console.error('Fetch category forms error:', e);
        uni.showToast({ title: '无法获取服务列表', icon: 'none' });
        
        // Fallback: If network fail, maybe pass category name if we have generic logic?
        // But better to stop here to avoid confusing current 'ServiceRequestPage'
    }
};

// Handle subcategory selection from centered modal
const handleSubcategorySelect = (idx: number) => {
    const choice = subcategoryOptions.value[idx];
    selectedCategory.value = choice.id;
    showSubcategoryModal.value = false;
    viewState.value = 'service_request_form'; 
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleLoginSuccess = () => {
    isLoggedIn.value = true;
    isAuthModalVisible.value = false;
    // Potentially resume the pending action here
};

const handleSwitchToProvider = async () => {
    // 实时检查登录状态（避免 ProfilePage 登录后 index 状态未同步的问题）
    if (!checkLoggedIn()) {
        isAuthModalVisible.value = true;
        return;
    }
    
    uni.showLoading({ title: '检查状态...' });
    try {
        // Fetch profile to see if they were already a provider
        const { profile } = await providersApi.getMyProfile();
        const user = getUserInfo();
        
        uni.hideLoading();
        console.log('Switching to provider mode, user role:', user?.role, 'profile exists:', !!profile);
        
        if (user?.role === 'provider') {
            viewState.value = 'provider_dashboard';
        } else if (profile) {
            // Profile exists but role is not provider. Check status.
            if (profile.status === 'rejected') {
                uni.showModal({
                    title: '申请未通过',
                    content: `您的服务商申请已被拒绝。\n拒绝理由：${profile.rejection_reason || '资料审核不通过'}\n\n您可以完善资料后重新提交申请。`,
                    confirmText: '去修改',
                    cancelText: '取消',
                    success: (res) => {
                        if (res.confirm) {
                            openProviderAgreement();
                        }
                    }
                });
            } else if (profile.status === 'pending') {
                 uni.showToast({ title: '您的申请正在审核中，请耐心等待', icon: 'none' });
            } else if (profile.status === 'approved') {
                 // Profile is approved but user role not yet synced locally. Allow entry.
                 viewState.value = 'provider_dashboard';
            } else {
                 // Demoted or other weird state
                 uni.showModal({
                    title: '账户提示',
                    content: '您的服务商权限已被管理员调整。如需恢复，请联系网站管理员进行申诉。',
                    showCancel: false,
                    confirmText: '我知道了'
                });
            }
        } else {
            // No profile and not a provider -> New applicant
            openProviderAgreement();
        }
    } catch (e) {
        uni.hideLoading();
        console.error('Check provider status error:', e);
        // Fallback to basic role check if API fails
        const user = getUserInfo();
        if (user?.role === 'provider') {
            viewState.value = 'provider_dashboard';
        } else {
            // If error 404/not found, likely new applicant
            openProviderAgreement();
        }
    }
};

const openProviderAgreement = () => {
    isProviderAgreementChecked.value = false; // Reset
    isProviderAgreementModalVisible.value = true;
};

const confirmProviderAgreement = () => {
    if (!isProviderAgreementChecked.value) return;
    isProviderAgreementModalVisible.value = false;
    viewState.value = 'provider_apply';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleProviderApplySuccess = () => {
    // Return to Profile Tab to wait for approval
    activeTab.value = 'profile';
    viewState.value = 'main';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleOpenProviderApply = () => {
    console.log('Index: Received open-apply event from dashboard');
    showProviderApplyModal.value = true;
};

const handleProviderApplyModalSuccess = () => {
    // Modal success implies application submitted. Close top-level modal.
    showProviderApplyModal.value = false;
};

const handleViewSubmissions = (status: string) => {
    if (!checkLoggedIn()) {
        isAuthModalVisible.value = true;
        return;
    }
    submissionStatusFilter.value = status;
    viewState.value = 'my_submissions';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

const handleServicePublished = () => {
    // Navigate to Profile tab after success
    activeTab.value = 'profile';
    viewState.value = 'main';
    uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

// Store register type from QR code scan
const qrRegisterType = ref<'user' | 'provider' | null>(null);

onLoad((options) => {
    console.log('Page Index onLoad', options);
    if (options && options.tab) {
        if (['home', 'standard', 'custom', 'profile'].includes(options.tab)) {
            activeTab.value = options.tab as TabView;
        }
    }
    
    // Handle register parameter from QR code scan
    if (options && options.register) {
        qrRegisterType.value = options.register as 'user' | 'provider';
        // Switch to profile tab to show registration form
        activeTab.value = 'profile';
        console.log('QR code register type:', qrRegisterType.value);
    }
    
    // Also check URL hash for H5 (fallback)
    if (typeof window !== 'undefined' && window.location) {
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
            const urlParams = new URLSearchParams(hashParts[1]);
            const registerType = urlParams.get('register');
            if (registerType === 'user' || registerType === 'provider') {
                qrRegisterType.value = registerType;
                activeTab.value = 'profile';
                console.log('QR code register type from hash:', registerType);
            }
        }
    }
});

onShow(() => {
    // If on profile tab, refresh data (e.g. notifications count)
    if (activeTab.value === 'profile' && profilePageRef.value) {
        console.log('Refreshing profile data onShow');
        profilePageRef.value.refreshData?.();
    }
});

onMounted(() => {
    console.log('Page Index onMounted');
    
    // Auto-detect location (H5/App)
    uni.getLocation({
        type: 'wgs84',
        success: (res) => {
            const { latitude, longitude } = res;
            uni.request({
                url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`,
                success: (apiRes: any) => {
                    const data = apiRes.data;
                    if (data.city || data.locality) {
                         currentLocation.value = data.city || data.locality;
                    }
                }
            });
        },
        fail: () => {
             console.log('Auto-location failed or denied');
        }
    });
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-main-gray { background-color: #f5f5f5; }
.z-[60] { z-index: 60; }
</style>

<style>
/* Global Resets/Utilities */
.bg-white { background-color: #ffffff; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-24 { padding-bottom: 80px; }
.pb-10 { padding-bottom: 40px; }
.p-4 { padding: 16px; }
.mr-4 { margin-right: 16px; }
.mt-2 { margin-top: 8px; }
.mt-6 { margin-top: 24px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.border-t { border-top-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.text-gray-500 { color: #6b7280; }
.font-bold { font-weight: 700; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.hidden { display: none; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

/* Provider Agreement Modal Styles */
.agreement-modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.agreement-modal-content {
    width: 600rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.modal-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #111827;
    margin-bottom: 24rpx;
    display: block;
}

.modal-desc {
    font-size: 30rpx;
    color: #4b5563;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 40rpx;
    display: block;
}

.checkbox-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 48rpx;
}

.checkbox-box {
    width: 40rpx;
    height: 40rpx;
    border-radius: 8rpx;
    border-width: 2rpx;
    border-style: solid;
    display: flex;
    align-items: center;
    justify-content: center;
}

.checkbox-label {
    font-size: 28rpx;
    color: #374151;
    font-weight: 500;
}

.btn-row {
    display: flex;
    flex-direction: row;
    gap: 24rpx;
    width: 100%;
}

.btn-cancel, .btn-confirm {
    flex: 1;
    height: 88rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;
}

.btn-cancel {
    background-color: #f3f4f6;
    color: #374151;
}

.btn-confirm {
    background-color: #059669;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-disabled {
    opacity: 0.5;
    background-color: #a7f3d0 !important;
    box-shadow: none !important;
}

/* Media Queries for H5 */
@media (min-width: 768px) {
    .md-hidden { display: none !important; }
    .md-flex { display: flex !important; }
    .md-grid { display: grid !important; }
    .md-grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
    .md-px-4 { padding-left: 16px; padding-right: 16px; }
    .md-pb-10 { padding-bottom: 40px; }
}

.max-w-7xl { max-width: 80rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.overflow-visible { overflow: visible; }

/* Subcategory Selection Modal (Centered) */
.subcategory-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.subcategory-modal-content {
    background-color: #ffffff;
    border-radius: 16px;
    width: 85%;
    max-width: 360px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.subcategory-modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    display: block;
    margin-bottom: 20px;
}

.subcategory-modal-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.subcategory-modal-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px 12px;
    background-color: #f9fafb;
    border-radius: 12px;
    margin-bottom: 8px;
}

.subcategory-modal-item:active {
    background-color: #ecfdf5;
}

.subcategory-modal-item text {
    font-size: 16px;
    color: #374151;
    font-weight: 500;
}

.subcategory-modal-cancel {
    margin-top: 16px;
    padding: 14px;
    background-color: #f3f4f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.subcategory-modal-cancel-text {
    font-size: 16px;
    color: #6b7280;
    font-weight: 500;
}
</style>
