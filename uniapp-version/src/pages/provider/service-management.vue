<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); display: flex; flex-direction: column;">
    <!-- Header -->
    <!-- Global Navbar -->
    <!-- Updated at 2026-01-31 14:15 -->
    <GlobalNavbar 
      title="标准服务管理" 
      background-color="#ffffff" 
      title-color="#111827" 
      icon-color="#111827"
      :show-back="true"
      :fixed="true"
      @back="goBack"
    />
    
    <!-- Filter Tabs (Minimalist Chips) -->
    <view style="margin: 16px 0;">
      <scroll-view 
        scroll-x 
        :show-scrollbar="false" 
        style="white-space: nowrap;"
        @scroll="onTabScroll"
      >
        <view style="display: flex; flex-direction: row; gap: 12px; padding: 0 16px;">
          <view 
            v-for="tab in statusTabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            style="display: flex; flex-direction: row; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 100px; flex-shrink: 0; transition: all 0.2s ease;"
            :style="{
              background: activeTab === tab.key ? 'rgba(16, 185, 129, 0.1)' : '#1f2937',
              border: activeTab === tab.key ? '1px solid #10b981' : '1px solid #374151'
            }"
          >
            <text 
              style="font-size: 14px; font-weight: 500; white-space: nowrap;"
              :style="{ color: activeTab === tab.key ? '#10b981' : '#9ca3af', fontWeight: activeTab === tab.key ? '600' : '500' }"
            >{{ tab.label }}</text>
            <view 
              v-if="getTabCount(tab.key) > 0" 
              style="min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; display: flex; align-items: center; justify-content: center;"
              :style="{ background: activeTab === tab.key ? '#10b981' : 'rgba(255,255,255,0.1)' }"
            >
              <text 
                style="font-size: 11px; font-weight: 600;"
                :style="{ color: activeTab === tab.key ? '#ffffff' : '#9ca3af' }"
              >{{ getTabCount(tab.key) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Service List -->
    <scroll-view scroll-y style="flex: 1;" :style="{ height: listHeight }">
      <view style="padding: 0 16px; padding-bottom: 100px;">
        <!-- Loading State -->
        <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0;">
          <view style="width: 36px; height: 36px; border: 3px solid #374151; border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite;"></view>
          <text style="margin-top: 12px; font-size: 14px; color: #9ca3af;">加载中...</text>
        </view>

        <!-- Empty State -->
        <view v-else-if="filteredServices.length === 0" style="display: flex; flex-direction: column; align-items: center; padding: 40px 20px;">
          <view style="position: relative; width: 140px; height: 140px; margin-bottom: 24px;">
            <view style="width: 120px; height: 120px; background: rgba(16, 185, 129, 0.1); border-radius: 60px; display: flex; align-items: center; justify-content: center; position: absolute; top: 10px; left: 10px;">
              <view style="width: 80px; height: 80px; background: #1f2937; border: 1px solid #374151; border-radius: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);">
                <AppIcon name="package" :size="48" color="#10b981" />
              </view>
            </view>
            <!-- Decorations -->
            <view style="position: absolute; width: 12px; height: 12px; border-radius: 6px; background: #10b981; top: 0; right: 20px; opacity: 0.3;"></view>
            <view style="position: absolute; width: 8px; height: 8px; border-radius: 4px; background: #10b981; bottom: 20px; right: 0; opacity: 0.5;"></view>
            <view style="position: absolute; width: 6px; height: 6px; border-radius: 3px; background: #10b981; top: 40px; left: 0; opacity: 0.4;"></view>
          </view>
          <text style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">还没有服务哦~</text>
          <text style="font-size: 14px; color: #9ca3af; text-align: center;">点击下方按钮，创建您的第一个标准服务</text>
          <text style="margin-top: 20px; font-size: 13px; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 10px 16px; border-radius: 20px;">📌 完善服务信息可获得更多曝光</text>
        </view>

        <!-- Service Cards -->
        <view v-else style="display: flex; flex-direction: column; gap: 16px;">
          <view 
            v-for="service in filteredServices" 
            :key="service.id"
            style="background: #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border: 1px solid #374151;"
            @click="viewService(service)"
          >
            <!-- Card Header with Status -->
            <view style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid #374151;">
              <view 
                style="display: flex; flex-direction: row; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 12px;"
                :style="{
                  background: service.status === 'approved' ? '#d1fae5' : 
                              service.status === 'editing' ? '#dbeafe' : 
                              service.status === 'pending' ? '#fef3c7' : 
                              service.status === 'rejected' ? '#fee2e2' : '#f3f4f6'
                }"
              >
                <view 
                  style="width: 6px; height: 6px; border-radius: 3px;"
                  :style="{
                    background: service.status === 'approved' ? '#10b981' : 
                                service.status === 'editing' ? '#3b82f6' : 
                                service.status === 'pending' ? '#f59e0b' : 
                                service.status === 'rejected' ? '#ef4444' : '#6b7280'
                  }"
                ></view>
                <text 
                  style="font-size: 12px; font-weight: 500;"
                  :style="{
                    color: service.status === 'approved' ? '#059669' : 
                           service.status === 'editing' ? '#2563eb' : 
                           service.status === 'pending' ? '#b45309' : 
                           service.status === 'rejected' ? '#dc2626' : '#6b7280'
                  }"
                >{{ getStatusLabel(service.status) }}</text>
              </view>
              <text style="font-size: 11px; color: #9ca3af; font-family: monospace;">ID: {{ service.id.slice(0, 8) }}</text>
            </view>
            
            <!-- Card Body -->
            <view style="display: flex; flex-direction: row; gap: 14px; padding: 16px;">
              <view style="width: 72px; height: 72px; border-radius: 12px; overflow: hidden; flex-shrink: 0;">
                <image v-if="service.image" :src="service.image" mode="aspectFill" style="width: 100%; height: 100%;" />
                <view v-else style="width: 100%; height: 100%; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center;">
                  <text style="font-size: 32px;">🛠️</text>
                </view>
              </view>
              <view style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
                <text style="font-size: 16px; font-weight: 600; color: #ffffff; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ service.title }}</text>
                <view style="margin-top: 6px;">
                  <view style="display: flex; flex-direction: row; align-items: center; gap: 4px;">
                    <AppIcon name="tag" :size="12" color="#9ca3af" />
                    <text style="font-size: 12px; color: #9ca3af;">{{ service.category }}</text>
                  </view>
                </view>
                <view style="margin-top: auto; display: flex; flex-direction: row; align-items: baseline; justify-content: space-between;">
                  <text style="font-size: 12px; color: #9ca3af;">服务价格</text>
                  <view style="display: flex; flex-direction: row; align-items: baseline;">
                    <text style="font-size: 14px; color: #10b981; font-weight: 600;">$</text>
                    <text style="font-size: 18px; color: #ffffff; font-weight: 700; margin-left: 2px;">{{ service.price }}</text>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- Card Footer -->
            <view style="padding: 12px 16px; border-top: 1px solid #374151; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
              <text style="font-size: 12px; color: #6b7280;">{{ formatDate(service.created_at) }} 创建</text>
              <view style="display: flex; flex-direction: row; gap: 8px;">
                <view 
                  v-if="service.status === 'draft'" 
                  @click.stop="submitService(service)"
                  style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 4px; padding: 6px 12px; border-radius: 8px; background: #10b981;"
                >
                  <text style="font-size: 12px; font-weight: 500; color: #ffffff;">提交审核</text>
                </view>
                <view 
                  @click.stop="editService(service)" 
                  style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 4px; padding: 6px 12px; border-radius: 8px; background: #374151; border: 1px solid #4b5563;"
                >
                  <AppIcon name="edit" :size="14" color="#d1d5db" />
                  <text style="font-size: 12px; font-weight: 500; color: #d1d5db;">编辑</text>
                </view>
                <view 
                  @click.stop="deleteService(service)" 
                  style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 4px; padding: 6px 8px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);"
                >
                  <AppIcon name="trash" :size="14" color="#ef4444" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Floating Action Button -->
    <view style="position: fixed; bottom: 30px; left: 0; right: 0; display: flex; justify-content: center; z-index: 50; pointer-events: none;">
      <view @click="createService" style="pointer-events: auto; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 28px; padding: 12px 24px; display: flex; flex-direction: row; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);">
        <AppIcon name="plus" :size="24" color="#ffffff" />
        <text style="color: #ffffff; font-weight: 600; font-size: 16px;">创建标准服务</text>
      </view>
    </view>

    <!-- Professional PC Reminder Modal -->
    <view v-if="showPCModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 40px;" @click="showPCModal = false" @touchmove.stop.prevent>
      <view style="width: 100%; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px; display: flex; flex-direction: column; align-items: center; padding: 40px 24px 32px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);" @click.stop>
        <view style="width: 100px; height: 100px; background: rgba(16, 185, 129, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <AppIcon name="monitor" :size="48" color="#10b981" />
        </view>
        
        <view style="text-align: center; margin-bottom: 24px;">
          <text style="font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: block;">请使用电脑端操作</text>
          <text style="font-size: 15px; color: #9ca3af; line-height: 1.6;">为了提供更优质的编辑体验，标准服务的创建与深度管理需要在电脑端后台进行。</text>
        </view>

        <view style="background: rgba(255, 255, 255, 0.05); padding: 12px 16px; border-radius: 16px; display: flex; flex-direction: row; align-items: center; gap: 8px; margin-bottom: 32px;">
          <AppIcon name="info" :size="14" color="#9ca3af" />
          <text style="font-size: 13px; color: #9ca3af;">电脑端访问地址与小程序账号通用</text>
        </view>

        <view style="width: 100%; background: #10b981; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);" @click="showPCModal = false">
          <text style="color: #ffffff; font-size: 16px; font-weight: 700;">我知道了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  status: 'editing' | 'draft' | 'pending' | 'approved' | 'rejected';
  image?: string;
  created_at: string;
}

const loading = ref(false);
const activeTab = ref('all');
const listHeight = ref('calc(100vh - 280px)');
const showPCModal = ref(false);

// Scroll indicator
const scrollPosition = ref(0);
const scrollThumbWidth = ref(30);

const onTabScroll = (e: any) => {
  const scrollLeft = e.detail.scrollLeft;
  const scrollWidth = e.detail.scrollWidth;
  const clientWidth = 375; 
  const maxScroll = scrollWidth - clientWidth;
  if (maxScroll > 0) {
    scrollPosition.value = (scrollLeft / maxScroll) * (100 - scrollThumbWidth.value);
  }
};

const statusTabs = [
  { key: 'all', label: '全部', icon: 'grid', iconColor: '#6b7280' },
  { key: 'editing', label: '编辑中', icon: 'edit', iconColor: '#3b82f6' },
  { key: 'pending', label: '审核中', icon: 'clock', iconColor: '#f59e0b' },
  { key: 'approved', label: '已上架', icon: 'check-circle', iconColor: '#10b981' },
  { key: 'rejected', label: '未通过', icon: 'x-circle', iconColor: '#ef4444' },
  { key: 'draft', label: '仓库中', icon: 'inbox', iconColor: '#6b7280' },
];

const services = ref<Service[]>([]);

const filteredServices = computed(() => {
  if (activeTab.value === 'all') return services.value;
  return services.value.filter(s => s.status === activeTab.value);
});

const getTabCount = (key: string) => {
  if (key === 'all') return services.value.length;
  return services.value.filter(s => s.status === key).length;
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'editing': '编辑中',
    'draft': '草稿',
    'pending': '审核中',
    'approved': '已上架',
    'rejected': '未通过',
  };
  return map[status] || status;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // No history, navigate to provider workspace
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

const createService = () => {
  showPCModal.value = true;
};

const viewService = (service: Service) => {
  uni.showToast({ title: '查看服务详情', icon: 'none' });
};

const editService = (service: Service) => {
  uni.showToast({ title: '编辑服务', icon: 'none' });
};

const deleteService = (service: Service) => {
  uni.showModal({
    title: '删除服务',
    content: '确定要删除这个服务吗？此操作不可恢复。',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已删除', icon: 'success' });
      }
    }
  });
};

const submitService = (service: Service) => {
  uni.showModal({
    title: '提交审核',
    content: '确定要提交此服务进行审核吗？审核通过后将自动上架。',
    confirmColor: '#10b981',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已提交审核', icon: 'success' });
      }
    }
  });
};

onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>


