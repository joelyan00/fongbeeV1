<template>
  <view class="min-h-screen bg-gray-900 text-white" style="padding-bottom: 100px">
    <!-- Global Navbar (Fixed header with capsule alignment) -->
    <GlobalNavbar 
      :title="currentTabTitle" 
      background-color="#111827" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="false"
      :fixed="true"
    />
    
    <!-- TAB 1: Worktable -->
    <view v-if="currentTab === 'worktable'">

        <!-- Unified Profile & Finance Card -->
        <view class="px-4 mt-2" style="margin-bottom: 15px;">
            <view class="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl shadow-black/20">
                <!-- Top: Profile Info -->
                <view style="padding: 16px 16px 11px 16px;" class="flex flex-row items-center justify-between active:bg-gray-750 transition-colors" @click="currentTab = 'mine'">
                    <view class="flex flex-row items-center gap-4">
                        <view class="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30 overflow-hidden shrink-0">
                            <text v-if="profile?.email" class="text-xl font-bold text-teal-400">{{ profile.email.charAt(0).toUpperCase() }}</text>
                            <AppIcon v-else name="user" :size="24" class="text-teal-400" />
                        </view>
                        <view class="flex flex-col">
                            <view class="flex flex-row items-center gap-4">
                                <text class="text-white font-bold text-lg">{{ profile?.name || profile?.company_name || '未设置昵称' }}</text>
                                <text class="text-blue-400 text-xs font-bold">{{ userTypeLabel }}</text>
                            </view>
                            <text class="text-gray-400 text-xs mt-1">{{ profile?.email || '点击设置资料' }}</text>
                        </view>
                    </view>
                    <view class="flex flex-col items-end">
                        <text class="text-teal-400 font-bold text-xl">{{ userCredits }}</text>
                        <view class="flex flex-row items-center gap-1">
                            <text class="text-gray-400 text-xs">我的积分</text>
                            <AppIcon name="chevron-right" :size="12" color="#4b5563" />
                        </view>
                    </view>
                </view>

                <!-- Divider -->
                <view class="mx-4 h-px bg-gray-700/50"></view>

                <!-- Bottom: Financial Stats -->
                <view style="padding: 11px 16px 16px 16px;" class="flex flex-row justify-between items-center">
                    <view class="flex flex-col gap-1 items-center flex-1">
                        <text class="text-gray-400 uppercase font-bold tracking-wider" style="font-size: 10px;">总收入</text>
                        <text class="text-lg font-bold text-white">${{ totalRevenue }}</text>
                    </view>
                    
                    <view class="w-px h-8 bg-gray-700/50 mx-2"></view>
                    
                    <view class="flex flex-col gap-1 items-center flex-1">
                        <text class="text-gray-400 uppercase font-bold tracking-wider" style="font-size: 10px;">待结算</text>
                        <text class="text-lg font-bold text-white">${{ pendingSettlement }}</text>
                    </view>
                    
                    <view class="w-px h-8 bg-gray-700/50 mx-2"></view>
                    
                    <view class="flex flex-col gap-1 items-center flex-1">
                        <text class="text-gray-400 uppercase font-bold tracking-wider" style="font-size: 10px;">可提现</text>
                        <text class="text-lg font-bold text-blue-400">$0</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="px-4" style="width: 100%; box-sizing: border-box; margin-bottom: 20px;">
            <text class="text-gray-400 text-base font-bold pl-1 block" style="margin-bottom: 12px;">常用功能</text>
            <view style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%;">
                <view class="bg-gray-800 p-4 rounded-xl flex flex-col items-center justify-center gap-3 h-28 active:bg-gray-700 transition-colors" @click="openOrderHall">
                    <AppIcon name="clipboard" :size="32" color="rgb(16, 185, 129)" />
                    <text class="text-xs font-medium text-gray-300">任务大厅</text>
                </view>
                <view class="bg-gray-800 p-4 rounded-xl flex flex-col items-center justify-center gap-3 h-28 active:bg-gray-700 transition-colors" @click="openStats">
                    <AppIcon name="grid" :size="32" color="rgb(16, 185, 129)" />
                    <text class="text-xs font-medium text-gray-300">营业统计</text>
                </view>
                <view class="bg-gray-800 p-4 rounded-xl flex flex-col items-center justify-center gap-3 h-28 active:bg-gray-700 transition-colors" @click="openInbox">
                    <AppIcon name="mail" :size="32" color="rgb(16, 185, 129)" />
                    <text class="text-xs font-medium text-gray-300">收件箱</text>
                </view>
            </view>
        </view>

        <!-- Todo Items -->
        <view class="px-4 pb-4">
            <text class="text-gray-400 text-base font-bold pl-1 block" style="margin-bottom: 12px;">待办事项</text>
            <view class="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                <view class="flex flex-col gap-3">
                    <view class="flex flex-row items-center gap-2 bg-red-500/20 self-start px-3 py-2 rounded-lg border border-red-500/30" @click="currentTab = 'orders'">
                        <text class="text-xs text-red-300 font-bold" v-if="pendingOrderCount > 0">{{ pendingOrderCount }} 个新订单待处理</text>
                        <text class="text-xs text-gray-400" v-else>目前没有待处理订单</text>
                    </view>
                    <view class="flex flex-row items-center gap-2 bg-orange-500/20 self-start px-3 py-2 rounded-lg border border-orange-500/30" @click="openQuotes">
                        <text class="text-xs text-orange-300 font-bold" v-if="upcomingQuoteCount > 0">{{ upcomingQuoteCount }} 个定制报价待确认</text>
                        <text class="text-xs text-gray-400" v-else>没有待确认的报价</text>
                    </view>
                </view>
            </view>
        </view>
    </view>

    <!-- TAB 2: Orders -->
    <view v-if="currentTab === 'orders'" class="orders-tab-container">
        
        <!-- Sub-Tab Switcher -->
        <view class="px-4 mb-4">
            <view style="display: flex; flex-direction: row; background-color: #1f2937; border-radius: 12px; padding: 4px;">
                <view 
                    style="flex: 1; padding: 12px 16px; border-radius: 10px; text-align: center; transition: all 0.2s;"
                    :style="{ backgroundColor: orderSubTab === 'standard' ? '#065f46' : 'transparent' }"
                    @click="orderSubTab = 'standard'"
                >
                    <text :style="{ color: orderSubTab === 'standard' ? '#34d399' : '#9ca3af', fontWeight: orderSubTab === 'standard' ? 'bold' : 'normal', fontSize: '14px' }">标准服务订单</text>
                </view>
                <view 
                    style="flex: 1; padding: 12px 16px; border-radius: 10px; text-align: center; transition: all 0.2s;"
                    :style="{ backgroundColor: orderSubTab === 'custom' ? '#065f46' : 'transparent' }"
                    @click="orderSubTab = 'custom'"
                >
                    <text :style="{ color: orderSubTab === 'custom' ? '#34d399' : '#9ca3af', fontWeight: orderSubTab === 'custom' ? 'bold' : 'normal', fontSize: '14px' }">定制服务报价/订单</text>
                </view>
            </view>
        </view>

        <!-- ============ STANDARD ORDERS CONTENT ============ -->
        <view v-if="orderSubTab === 'standard'">
            <!-- Tab Filters -->
            <view style="margin: 16px 0;">
                <scroll-view scroll-x :show-scrollbar="false" style="white-space: nowrap;">
                    <view style="display: flex; flex-direction: row; gap: 12px; padding: 0 16px;">
                        <view 
                            v-for="tab in standardOrderTabs" 
                            :key="tab.key"
                            @click="standardActiveTab = tab.key"
                            :style="{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '100px',
                                flexShrink: '0',
                                background: standardActiveTab === tab.key ? 'rgba(16, 185, 129, 0.1)' : '#1f2937',
                                border: standardActiveTab === tab.key ? '1px solid #10b981' : '1px solid #374151'
                            }"
                        >
                            <text :style="{ 
                                fontSize: '14px', 
                                color: standardActiveTab === tab.key ? '#10b981' : '#9ca3af', 
                                fontWeight: standardActiveTab === tab.key ? '600' : '500',
                                whiteSpace: 'nowrap'
                            }">{{ tab.label }}</text>
                            <view v-if="getStandardTabCount(tab.key) > 0" 
                                :style="{ 
                                    minWidth: '18px', 
                                    height: '18px', 
                                    padding: '0 5px', 
                                    background: standardActiveTab === tab.key ? '#10b981' : 'rgba(255,255,255,0.1)', 
                                    borderRadius: '9px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }">
                                <text :style="{ fontSize: '11px', color: standardActiveTab === tab.key ? '#ffffff' : '#9ca3af', fontWeight: '600' }">{{ getStandardTabCount(tab.key) }}</text>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- Order List -->
            <scroll-view scroll-y style="padding: 0 16px; box-sizing: border-box; width: 100%; height: calc(100vh - 280px);">
                <!-- Loading State -->
                <view v-if="loadingOrders" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0;">
                    <view style="width: 36px; height: 36px; border: 3px solid #374151; border-top-color: #10b981; border-radius: 50%;"></view>
                    <text style="margin-top: 12px; font-size: 14px; color: #9ca3af;">加载中...</text>
                </view>

                <!-- Empty State -->
                <view v-else-if="filteredStandardOrders.length === 0" style="display: flex; flex-direction: column; align-items: center; padding: 40px 20px;">
                    <view style="width: 100px; height: 100px; background: rgba(16, 185, 129, 0.1); border-radius: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <view style="width: 70px; height: 70px; background: #1f2937; border: 1px solid #374151; border-radius: 35px; display: flex; align-items: center; justify-content: center;">
                            <AppIcon name="clipboard" :size="48" color="#10b981" />
                        </view>
                    </view>
                    <text style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">暂无订单</text>
                    <text style="font-size: 14px; color: #9ca3af;">当前筛选条件下没有订单</text>
                </view>

                <!-- Order Cards -->
                <view v-else style="display: flex; flex-direction: column; gap: 16px; padding-bottom: 100px;">
                    <view 
                        v-for="order in filteredStandardOrders" 
                        :key="order.id"
                        style="background: #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border: 1px solid #374151;"
                        @click="viewStandardOrderDetail(order)"
                    >
                        <!-- Card Header with Status -->
                        <view style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid #374151;">
                            <view style="display: flex; flex-direction: row; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 100px; background: rgba(16, 185, 129, 0.1);">
                                <view style="width: 6px; height: 6px; border-radius: 3px; background: #10b981;"></view>
                                <text style="font-size: 12px; color: #10b981; font-weight: 600;">{{ getStandardStatusLabel(order.status) }}</text>
                            </view>
                            <text style="font-size: 12px; color: #6b7280;">{{ order.order_no }}</text>
                        </view>
                        
                        <!-- Card Body -->
                        <view style="display: flex; flex-direction: row; padding: 16px; gap: 12px;">
                            <view style="width: 80px; height: 80px; border-radius: 12px; overflow: hidden; flex-shrink: 0;">
                                <image v-if="order.service_image" :src="order.service_image" mode="aspectFill" style="width: 100%; height: 100%; object-fit: cover;" />
                                <view v-else style="width: 100%; height: 100%; background: #374151; display: flex; align-items: center; justify-content: center;">
                                    <text style="font-size: 32px;">🛠️</text>
                                </view>
                            </view>
                            <view style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                                <text style="font-size: 16px; font-weight: 600; color: #ffffff;">{{ order.service_title || order.service_type || '服务' }}</text>
                                <text style="font-size: 13px; color: #9ca3af;">{{ order.requirements || '暂无备注' }}</text>
                                <view style="display: flex; flex-direction: row; align-items: center; margin-top: 8px;">
                                    <text style="font-size: 12px; color: #9ca3af; margin-right: 8px;">订单金额</text>
                                    <view style="display: flex; flex-direction: row; align-items: baseline;">
                                        <text style="font-size: 14px; color: #10b981; font-weight: 600;">$</text>
                                        <text style="font-size: 18px; color: #10b981; font-weight: 700;">{{ order.total_amount }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                        
                        <!-- Card Footer -->
                        <view style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid #374151;">
                            <text style="font-size: 12px; color: #6b7280;">{{ formatOrderDate(order.created_at) }}</text>
                            <view style="display: flex; flex-direction: row; gap: 10px;">
                                <view 
                                    v-for="action in getStandardOrderActions(order)" 
                                    :key="action.key"
                                    @click.stop="handleStandardAction(action.key, order)"
                                    :style="{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: action.primary ? '#10b981' : 'transparent',
                                        border: action.primary ? '1px solid #10b981' : '1px solid #4b5563'
                                    }"
                                >
                                    <text :style="{ fontSize: '13px', fontWeight: '500', color: action.primary ? '#ffffff' : '#d1d5db' }">{{ action.label }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- ============ CUSTOM ORDERS CONTENT ============ -->
        <view v-if="orderSubTab === 'custom'">
            <!-- Tab Filters -->
            <view style="margin: 16px 0;">
                <scroll-view scroll-x :show-scrollbar="false" style="white-space: nowrap;">
                    <view style="display: flex; flex-direction: row; gap: 12px; padding: 0 16px;">
                        <view 
                            v-for="tab in customOrderTabs" 
                            :key="tab.key"
                            @click="customActiveTab = tab.key"
                            :style="{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '100px',
                                flexShrink: '0',
                                background: customActiveTab === tab.key ? 'rgba(16, 185, 129, 0.1)' : '#1f2937',
                                border: customActiveTab === tab.key ? '1px solid #10b981' : '1px solid #374151'
                            }"
                        >
                            <text :style="{ 
                                fontSize: '14px', 
                                color: customActiveTab === tab.key ? '#10b981' : '#9ca3af', 
                                fontWeight: customActiveTab === tab.key ? '600' : '500',
                                whiteSpace: 'nowrap'
                            }">{{ tab.label }}</text>
                            <view v-if="getCustomTabCount(tab.key) > 0" 
                                :style="{ 
                                    minWidth: '18px', 
                                    height: '18px', 
                                    padding: '0 5px', 
                                    background: customActiveTab === tab.key ? '#10b981' : 'rgba(255,255,255,0.1)', 
                                    borderRadius: '9px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }">
                                <text :style="{ fontSize: '11px', color: customActiveTab === tab.key ? '#ffffff' : '#9ca3af', fontWeight: '600' }">{{ getCustomTabCount(tab.key) }}</text>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- Date Filter -->
            <view style="padding: 0 16px 16px 16px;">
                <view style="background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 12px; display: flex; flex-direction: row; align-items: center; gap: 12px;">
                    <AppIcon name="calendar" :size="16" color="#9ca3af" />
                    <view style="flex: 1; display: flex; flex-direction: row; align-items: center; gap: 8px;">
                        <picker mode="date" :value="customStartDate" @change="customStartDate = $event.detail.value" style="flex: 1;">
                            <view style="background: #111827; border: 1px solid #374151; border-radius: 8px; height: 36px; display: flex; align-items: center; justify-content: center;">
                                <text :style="{ color: customStartDate ? '#ffffff' : '#9ca3af', fontSize: '13px', fontWeight: '500' }">{{ customStartDate || '开始日期' }}</text>
                            </view>
                        </picker>
                        <text style="color: #9ca3af; font-size: 12px;">至</text>
                        <picker mode="date" :value="customEndDate" @change="customEndDate = $event.detail.value" style="flex: 1;">
                            <view style="background: #111827; border: 1px solid #374151; border-radius: 8px; height: 36px; display: flex; align-items: center; justify-content: center;">
                                <text :style="{ color: customEndDate ? '#ffffff' : '#9ca3af', fontSize: '13px', fontWeight: '500' }">{{ customEndDate || '结束日期' }}</text>
                            </view>
                        </picker>
                    </view>
                </view>
            </view>

            <!-- Order List -->
            <scroll-view scroll-y style="padding: 0 16px; box-sizing: border-box; width: 100%; height: calc(100vh - 340px);">
                <!-- Loading State -->
                <view v-if="loadingCustomOrders" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0;">
                    <view style="width: 36px; height: 36px; border: 3px solid #374151; border-top-color: #10b981; border-radius: 50%;"></view>
                    <text style="margin-top: 12px; font-size: 14px; color: #9ca3af;">加载中...</text>
                </view>

                <!-- Empty State -->
                <view v-else-if="filteredCustomOrders.length === 0" style="display: flex; flex-direction: column; align-items: center; padding: 40px 20px;">
                    <view style="width: 100px; height: 100px; background: rgba(16, 185, 129, 0.1); border-radius: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <view style="width: 70px; height: 70px; background: #1f2937; border: 1px solid #374151; border-radius: 35px; display: flex; align-items: center; justify-content: center;">
                            <AppIcon name="file-text" :size="48" color="#10b981" />
                        </view>
                    </view>
                    <text style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">暂无订单</text>
                    <text style="font-size: 14px; color: #9ca3af;">当前筛选条件下没有订单记录</text>
                </view>

                <!-- Custom Order Cards -->
                <view v-else style="display: flex; flex-direction: column; gap: 16px; padding-bottom: 100px;">
                    <view 
                        v-for="order in filteredCustomOrders" 
                        :key="order.id" 
                        style="background: #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border: 1px solid #374151;"
                        @click="viewCustomOrderDetail(order)"
                    >
                        <!-- Card Header: Title + Status -->
                        <view style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid #374151;">
                            <view style="display: flex; flex-direction: row; align-items: center; gap: 10px; flex: 1;">
                                <view :style="{ 
                                    padding: '4px 10px', 
                                    borderRadius: '6px',
                                    background: order.paymentType === 'simple' ? 'rgba(59, 130, 246, 0.15)' : order.paymentType === 'deposit' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                                    border: order.paymentType === 'simple' ? '1px solid rgba(59, 130, 246, 0.3)' : order.paymentType === 'deposit' ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(249, 115, 22, 0.3)'
                                }">
                                    <text :style="{ 
                                        fontSize: '12px', 
                                        fontWeight: '600',
                                        color: order.paymentType === 'simple' ? '#60a5fa' : order.paymentType === 'deposit' ? '#c084fc' : '#fb923c'
                                    }">{{ order.projectName }}</text>
                                </view>
                                <text style="font-size: 12px; color: #d1d5db;">{{ order.time.split(' ')[0] }}</text>
                            </view>
                            <text style="font-size: 13px; color: #10b981; font-weight: 600;">{{ order.statusText }}</text>
                        </view>

                        <!-- Card Body: Info -->
                        <view style="display: flex; flex-direction: column; padding: 16px; gap: 12px;">
                            <view style="display: flex; flex-direction: row; align-items: center;">
                                <view style="width: 20px; display: flex; align-items: center;">
                                    <AppIcon name="map-pin" :size="14" color="#6b7280" />
                                </view>
                                <text style="font-size: 14px; color: #e5e7eb; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ order.location }}</text>
                            </view>
                            
                            <view style="display: flex; flex-direction: row; align-items: center; margin-top: 4px;">
                                <text style="font-size: 13px; color: #9ca3af; margin-right: 8px;">服务金额</text>
                                <text style="font-size: 18px; font-weight: 700; color: #10b981;">$ {{ order.amount.toLocaleString() }}</text>
                            </view>
                        </view>

                        <!-- Card Footer: Actions -->
                        <view style="display: flex; flex-direction: row; align-items: center; justify-content: flex-end; padding: 12px 16px; border-top: 1px solid #374151; gap: 10px;">
                            <view @click.stop="viewCustomReviews(order)" style="padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid #4b5563;">
                                <text style="font-size: 13px; font-weight: 500; color: #d1d5db;">查看评情</text>
                            </view>
                            <view @click.stop="viewCustomOrderDetail(order)" style="padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #10b981; border: 1px solid #10b981;">
                                <text style="font-size: 13px; font-weight: 500; color: #ffffff;">查看详情</text>
                            </view>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- Start Service Modal -->
        <view v-if="showStartServiceModal" class="modal-overlay" @click="showStartServiceModal = false">
            <view class="modal-container" @click.stop>
                <text class="modal-title">服务开工确认</text>
                <view class="modal-options">
                    <view class="modal-option" @click="handleStartChoice(0)">
                        <view class="option-icon bg-teal-900"><AppIcon name="camera" :size="24" color="#10b981" /></view>
                        <view class="option-info">
                            <text class="option-label text-teal-400">拍照并通知用户</text>
                            <text class="option-desc">上传现场照片，记录服务状态</text>
                        </view>
                        <AppIcon name="chevron-right" :size="20" color="#10b981" />
                    </view>
                    <view class="modal-option" @click="handleStartChoice(1)">
                        <view class="option-icon bg-gray-700"><AppIcon name="play" :size="24" color="#9ca3af" /></view>
                        <view class="option-info">
                            <text class="option-label text-gray-300">直接开始 (不拍照)</text>
                            <text class="option-desc">快速开工，无需上传任何资料</text>
                        </view>
                        <AppIcon name="chevron-right" :size="20" color="#6b7280" />
                    </view>
                </view>
                <view class="modal-tip">
                    <AppIcon name="info" :size="12" color="#9ca3af" />
                    <text class="tip-text">用户将收到开工通知</text>
                </view>
            </view>
        </view>

        <!-- Completion Modal -->
        <view v-if="showCompletionModal" class="modal-overlay" @click="showCompletionModal = false">
            <view class="modal-container" @click.stop>
                <text class="modal-title">服务完工确认</text>
                <view class="modal-options">
                    <view class="modal-option" @click="handleCompletionChoice(0)">
                        <view class="option-icon bg-teal-900"><AppIcon name="camera" :size="24" color="#10b981" /></view>
                        <view class="option-info">
                            <text class="option-label text-teal-400">拍照上传成果</text>
                            <text class="option-desc">上传完工照片，记录服务成果</text>
                        </view>
                        <AppIcon name="chevron-right" :size="20" color="#10b981" />
                    </view>
                    <view class="modal-option" @click="handleCompletionChoice(1)">
                        <view class="option-icon bg-gray-700"><AppIcon name="check-circle" :size="24" color="#9ca3af" /></view>
                        <view class="option-info">
                            <text class="option-label text-gray-300">直接完成 (不拍照)</text>
                            <text class="option-desc">快速提交验收，无需上传资料</text>
                        </view>
                        <AppIcon name="chevron-right" :size="20" color="#6b7280" />
                    </view>
                </view>
                <view class="modal-tip">
                    <AppIcon name="info" :size="12" color="#9ca3af" />
                    <text class="tip-text">用户将收到验收通知</text>
                </view>
            </view>
        </view>
    </view>

    <!-- TAB 3: Finance -->
    <view v-if="currentTab === 'finance'">

        <view class="px-4 mb-8">
            <view class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700 relative overflow-hidden">
                <view class="absolute right-0 top-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl -mr-10 -mt-10"></view>
                <view class="relative z-10 flex flex-row justify-between items-center">
                    <view class="flex flex-col gap-2">
                        <text class="text-gray-300 text-sm">可提现余额</text>
                        <text class="text-3xl font-bold text-white">$3,200</text>
                    </view>
                    <view class="bg-teal-500 px-6 py-2 rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform" @click="handleWithdraw">
                        <text class="text-white font-bold">提现</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Financial Statistics Cards -->
        <view class="px-4" style="margin-bottom: 16px;">
            <view class="grid grid-cols-3 gap-4">
                <view class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <view class="flex flex-col items-center gap-2">
                        <text class="text-xs text-gray-400">本月收入</text>
                        <text class="text-xl font-bold text-teal-400">$1,850</text>
                    </view>
                </view>
                <view class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <view class="flex flex-col items-center gap-2">
                        <text class="text-xs text-gray-400">待结算</text>
                        <text class="text-xl font-bold text-orange-400">$650</text>
                    </view>
                </view>
                <view class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <view class="flex flex-col items-center gap-2">
                        <text class="text-xs text-gray-400">累计收入</text>
                        <text class="text-xl font-bold text-gray-300">$12.5k</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="px-4">
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openTransactions">
                       <view class="flex flex-row items-center gap-4">
                           <AppIcon name="file-text" :size="22" color="#10b981" />
                           <text class="text-base text-gray-200">交易记录</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openInvoices">
                       <view class="flex flex-row items-center gap-4">
                            <AppIcon name="file" :size="22" color="#3b82f6" />
                           <text class="text-base text-gray-200">已开具发票</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openPaymentMethods">
                       <view class="flex flex-row items-center gap-4">
                            <AppIcon name="building-library" :size="22" color="#8b5cf6" />
                           <text class="text-base text-gray-200">收款账户 (提现)</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openBillingMethods">
                       <view class="flex flex-row items-center gap-4">
                            <AppIcon name="credit-card" :size="22" color="#06b6d4" />
                           <text class="text-base text-gray-200">支付方式 (充值)</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openContracts">
                       <view class="flex flex-row items-center gap-4">
                           <AppIcon name="file-text" :size="22" color="#f97316" />
                           <text class="text-base text-gray-200">合同管理</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openSubscription">
                       <view class="flex flex-row items-center gap-4">
                           <AppIcon name="crown" :size="22" color="#f59e0b" />
                           <text class="text-base text-gray-200">积分订阅</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
        </view>
    </view>

    <!-- TAB 4: Mine -->
    <view v-if="currentTab === 'mine'" class="pt-4">
    
        <!-- Full Profile Card -->
        <view class="px-4" style="margin-bottom: 16px;">
            <view class="bg-gray-800 rounded-2xl flex flex-row items-center justify-between border border-gray-700" style="padding: 18px 16px;">
                <view class="flex flex-row items-center gap-4">
                    <view class="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30 overflow-hidden shrink-0">
                        <text v-if="profile?.email" class="text-xl font-bold text-teal-400">{{ profile.email.charAt(0).toUpperCase() }}</text>
                        <AppIcon v-else name="user" :size="24" class="text-teal-400" />
                    </view>
                    <view class="flex flex-col">
                        <view class="flex flex-row items-center gap-4">
                            <text class="text-white font-bold text-lg">{{ profile?.name || profile?.company_name || '未设置昵称' }}</text>
                            <text class="text-blue-400 text-xs font-bold">{{ userTypeLabel }}</text>
                        </view>
                        <text class="text-gray-400 text-xs mt-1">{{ profile?.email || '点击设置资料' }}</text>
                    </view>
                </view>
                <view class="flex flex-col items-end">
                    <text class="text-teal-400 font-bold text-xl">{{ userCredits }}</text>
                    <text class="text-gray-400 text-xs">我的积分</text>
                </view>
            </view>
        </view>

        <!-- Menu List -->
        <view class="px-4">
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openMyServices">
                       <view class="flex flex-row items-center gap-4">
                           <AppIcon name="grid" :size="22" color="#10b981" />
                            <text style="font-size: 16px; color: #e5e7eb; font-weight: 500;">标准服务管理</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openServiceArea">
                       <view class="flex flex-row items-center gap-4">
                           <AppIcon name="map-pin" :size="22" color="#ef4444" />
                           <text class="text-base text-gray-200">服务区域管理</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openServiceHours">
                       <view class="flex flex-row items-center gap-4">
                           <AppIcon name="clock" :size="22" color="#3b82f6" />
                           <text class="text-base text-gray-200">服务时间管理</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openAccountInfo">
                    <view class="flex flex-row items-center gap-4">
                        <AppIcon name="user" :size="22" color="#8b5cf6" />
                        <text class="text-base text-gray-200">编辑个人资料</text>
                    </view>
                    <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openPublicProfile">
                    <view class="flex flex-row items-center gap-4">
                        <AppIcon name="eye" :size="22" color="#06b6d4" />
                        <text class="text-base text-gray-200">预览我的展示主页</text>
                    </view>
                    <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="openReviews">
                    <view class="flex flex-row items-center gap-4">
                        <AppIcon name="star" :size="22" color="#f59e0b" />
                        <text class="text-base text-gray-200">收到的评论</text>
                    </view>
                    <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                </view>
            </view>

        </view>

        <!-- Account Switch -->
        <view class="px-4" style="margin-bottom: 24px;">
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700" style="margin-bottom: 16px;">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="$emit('switch-user')">
                       <view class="flex flex-row items-center gap-4">
                            <AppIcon name="rotate-ccw" :size="22" color="#ec4899" />
                           <text class="text-base text-gray-200">切换回普通用户</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
            
            <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                 <view class="flex flex-row items-center justify-between active:bg-gray-700" style="padding: 18px 16px;" @click="handleLogout">
                       <view class="flex flex-row items-center gap-4">
                           <AppIcon name="log-out" :size="22" color="#ef4444" />
                           <text class="text-base text-red-400">退出登录</text>
                       </view>
                       <AppIcon name="chevron-right" :size="16" color="#4b5563" />
                 </view>
            </view>
        </view>
    </view>

    <!-- Bottom Navigation -->
    <view style="position: fixed; bottom: 0; left: 0; right: 0; height: 84px; background-color: #1f2937; border-top: 1px solid #374151; display: flex; flex-direction: row; justify-content: space-around; align-items: center; z-index: 999; padding-bottom: 20px; box-sizing: border-box;">
        <view style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" @click="switchTab('worktable')">
            <AppIcon name="grid" :size="24" :color="currentTab === 'worktable' ? '#34d399' : '#9ca3af'" />
            <text style="font-size: 10px;" :style="{ color: currentTab === 'worktable' ? '#34d399' : '#9ca3af' }">工作台</text>
        </view>
        <view style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" @click="switchTab('orders')">
            <AppIcon name="clipboard" :size="24" :color="currentTab === 'orders' ? '#34d399' : '#9ca3af'" />
            <text style="font-size: 10px;" :style="{ color: currentTab === 'orders' ? '#34d399' : '#9ca3af' }">订单</text>
        </view>
        <view style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" @click="switchTab('finance')">
            <AppIcon name="wallet" :size="24" :color="currentTab === 'finance' ? '#34d399' : '#9ca3af'" />
            <text style="font-size: 10px;" :style="{ color: currentTab === 'finance' ? '#34d399' : '#9ca3af' }">财务</text>
        </view>
        <view style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" @click="switchTab('mine')">
            <AppIcon name="user" :size="24" :color="currentTab === 'mine' ? '#34d399' : '#9ca3af'" />
            <text style="font-size: 10px;" :style="{ color: currentTab === 'mine' ? '#34d399' : '#9ca3af' }">我的</text>
        </view>
    </view>

    <!-- Modals (Out of Flow) -->
    
    <!-- Order Hall Modal (接单大厅) -->
    <view 
        v-if="showOrderHall" 
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4 backdrop-blur-sm transition-all duration-300"
        @touchmove.stop.prevent=""
        @click="showOrderHall = false"
    >
        <view 
            class="w-full max-w-lg bg-gray-900 rounded-t-[40rpx] sm:rounded-3xl border-t border-x border-gray-800 p-6 animate-slide-up flex flex-col shadow-2xl" 
            style="height: 85vh;"
            @click.stop=""
        >
            <!-- Drag Handle for Mobile Feel -->
            <view class="w-12 h-1 bg-gray-700 rounded-full self-center mb-6 opacity-50"></view>

            <view class="flex flex-row items-center justify-between mb-6">
                <view>
                    <text class="text-2xl font-bold text-white block">接单大厅</text>
                    <text class="text-xs text-teal-400 mt-1 flex flex-row items-center gap-1">
                        <view class="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></view>
                        实时同步最新订单
                    </text>
                </view>
                <view @click="showOrderHall = false" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <text class="text-gray-400 text-xl">×</text>
                </view>
            </view>
            
            <scroll-view scroll-y class="flex-1 overflow-y-auto pr-1">
                <view v-if="loadingOrders" class="flex flex-col items-center justify-center py-20">
                    <view class="w-10 h-10 border-4 border-teal-500/30 border-t-emerald-500 rounded-full animate-spin"></view>
                    <text class="text-gray-500 mt-4 text-sm">正在检索附近需求...</text>
                </view>
                <view v-else-if="availableOrders.length === 0" class="flex flex-col items-center justify-center mt-20">
                     <view class="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700/50">
                        <AppIcon name="clipboard" :size="40" class="text-gray-600"/>
                     </view>
                     <text class="text-gray-300 font-bold text-lg">暂无匹配申请</text>
                     <text class="text-gray-500 text-sm mt-2 text-center px-10">当前区域暂无可接订单，建议核查已开通的服务类型</text>
                     <view @click="showOrderHall = false" class="mt-8 px-8 py-2 bg-gray-800 rounded-full border border-gray-700 active:bg-gray-750">
                        <text class="text-gray-300 text-sm">返回工作台</text>
                     </view>
                </view>
                <view v-else class="flex flex-col gap-4 pb-10">
                     <view v-for="order in availableOrders" :key="order.id" class="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-3xl border border-gray-700/50 hover:border-teal-500/30 active:scale-[0.98] transition-all">
                          <view class="flex flex-row justify-between items-start mb-4">
                              <view class="flex flex-row items-center gap-4">
                                  <view class="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20">
                                      <AppIcon :name="getIconForCategory(order.form_templates?.name || '')" :size="24" color="#10b981" />
                                  </view>
                                  <view>
                                      <text class="text-white font-bold text-lg block">{{ order.form_templates?.name || '定制需求' }}</text>
                                      <text class="text-gray-500 font-mono mt-1" style="font-size: 20rpx;">{{ order.form_data?._order_no || 'ORD-' + order.id.substring(0,6).toUpperCase() }}</text>
                                  </view>
                              </view>
                              <view class="bg-teal-500/10 px-2 py-1 rounded-lg border border-teal-500/20">
                                  <text class="text-teal-400 font-bold" style="font-size: 20rpx;">NEW</text>
                              </view>
                          </view>
                          
                          <view class="grid grid-cols-1 gap-2 mb-5 bg-black/20 p-4 rounded-2xl">
                               <view class="flex flex-row items-center gap-2">
                                   <AppIcon name="calendar" :size="14" color="#9ca3af" />
                                   <text class="text-sm text-gray-300">发布于: {{ formatRelativeTime(order.created_at) }}</text>
                               </view>
                               <view class="flex flex-row items-start gap-2">
                                   <AppIcon name="clipboard" :size="14" color="#9ca3af" class="mt-1" />
                                   <text class="text-sm text-gray-400 line-clamp-2 leading-relaxed">{{ order.notes || '用户暂无补充说明信息' }}</text>
                               </view>
                          </view>

                          <view class="flex flex-row items-center justify-between">
                               <view class="flex flex-col">
                                   <text class="text-gray-500 uppercase tracking-wider mb-1" style="font-size: 20rpx;">预估收益</text>
                                   <text class="text-xl font-bold text-white">{{ order.form_data?.price ? '$' + order.form_data.price : '待议' }}</text>
                               </view>
                               <button 
                                   class="m-0 bg-teal-600 active:bg-teal-700 shadow-lg shadow-emerald-900/20 px-6 py-2 rounded-2xl flex items-center h-12" 
                                   @click="handleTakeOrder(order)"
                               >
                                   <text class="text-black text-sm font-black italic">立即抢单 →</text>
                               </button>
                          </view>
                     </view>
                </view>
            </scroll-view>
        </view>
    </view>

    <!-- Apply Modal -->




    <!-- Quote Dialog -->
    <view 
        v-if="showQuoteDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
        @touchmove.stop.prevent=""
        @click="closeQuoteDialog"
    >
        <view 
            class="w-full max-w-sm bg-gray-900 rounded-3xl border border-gray-700 p-6 flex flex-col shadow-2xl animate-scale-in"
            @click.stop=""
        >
             <view class="flex justify-between items-center mb-4">
                 <text class="text-xl font-bold text-white">发起报价</text>
                 <view @click="closeQuoteDialog" class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                     <text class="text-gray-400">×</text>
                 </view>
             </view>

             <view class="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                 <text class="text-xs text-gray-500 mb-1">本次报价将消耗</text>
                 <view class="flex items-baseline gap-1">
                     <text class="text-2xl font-bold text-teal-400">{{ currentOrderCost }}</text>
                     <text class="text-sm text-gray-400">积分</text>
                 </view>
                 <view class="h-px bg-gray-700 my-2 w-full"></view>
                 <view class="flex justify-between items-center text-xs">
                     <text class="text-gray-400">当前余额</text>
                     <text class="text-gray-200">{{ userCredits }} 积分</text>
                 </view>
             </view>

             <view class="space-y-4">
                 <view>
                     <text class="text-sm text-gray-300 mb-2 block">报价金额 ($)</text>
                     <input 
                         class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white w-full"
                         type="number"
                         placeholder="0.00"
                         v-model="quoteForm.price"
                     />
                 </view>
                 <view>
                     <text class="text-sm text-gray-300 mb-2 block">留言方案</text>
                     <textarea 
                         class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white w-full h-24 text-sm"
                         placeholder="简要描述您的服务优势或方案..."
                         v-model="quoteForm.message"
                     />
                 </view>
             </view>

             <view class="mt-6 flex gap-3">
                 <view @click="closeQuoteDialog" class="flex-1 py-3 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                     <text class="text-gray-300">取消</text>
                 </view>
                 <view @click="confirmQuote" class="flex-1 py-3 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 active:scale-95 transition-all">
                     <view v-if="submittingQuote" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></view>
                     <text v-else class="text-white font-bold">确认消耗</text>
                 </view>
             </view>
        </view>
    </view>

    <!-- Logout Confirmation Modal -->
    <view 
        v-if="showLogoutModal" 
        style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.6); padding: 24px;"
        @click="showLogoutModal = false"
    >
        <view 
            style="width: 100%; max-width: 320px; background-color: #111827; border-radius: 24px; border: 1px solid #374151; padding: 24px; display: flex; flex-direction: column;"
            @click.stop=""
        >
            <view style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;">
                <view style="width: 64px; height: 64px; background-color: rgba(239,68,68,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid rgba(239,68,68,0.3);">
                    <text style="font-size: 32px;">🚪</text>
                </view>
                <text style="font-size: 20px; font-weight: bold; color: #ffffff;">确认退出</text>
                <text style="font-size: 14px; color: #9ca3af; margin-top: 8px; text-align: center;">是否确认退出当前账号？</text>
            </view>
            
            <view style="display: flex; flex-direction: row; gap: 12px;">
                <view @click="showLogoutModal = false" style="flex: 1; padding: 14px 0; background-color: #374151; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #4b5563;">
                    <text style="color: #d1d5db; font-weight: bold; font-size: 14px;">取消</text>
                </view>
                <view @click="confirmLogout" style="flex: 1; padding: 14px 0; background-color: #dc2626; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <text style="color: #ffffff; font-weight: bold; font-size: 14px;">退出登录</text>
                </view>
            </view>
        </view>
    </view>

    <!-- Empty State -->
    <view v-if="!applications.length" class="mt-20 flex flex-col items-center justify-center opacity-50">
        <AppIcon name="clipboard" :size="48" class="text-gray-600 mb-4"/>
        <text class="text-gray-500">暂无新订单</text>
    </view>

    <!-- Bottom Spacer -->
    <view style="height: 40rpx; width: 100%;"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import AppIcon from './Icons.vue';
import GlobalNavbar from './GlobalNavbar.vue';
import { providersApi, submissionsApi, quotesApi, formTemplatesApi, systemSettingsApi, logout, ordersV2Api, creditsApi, userSubscriptionApi } from '../services/api';

const emit = defineEmits(['switch-user', 'open-apply']);

const profile = ref<any>(null);
const applications = ref<any[]>([]);
const systemSettings = ref<Record<string, string>>({});
const showApplyModal = ref(false);
const showOrderHall = ref(false);
const availableOrders = ref<any[]>([]);
const myOrders = ref<any[]>([]); // For Orders Tab
const loadingOrders = ref(false);
const userCredits = ref(0);
const showLogoutModal = ref(false);

const currentTab = ref('worktable');
const orderSubTab = ref('standard'); // 'standard' or 'custom'
const currentSubscription = ref<any>(null);

// Computed property for dynamic header title based on current tab
const currentTabTitle = computed(() => {
    const titles: Record<string, string> = {
        'worktable': '服务商工作台',
        'orders': '订单中心',
        'finance': '财务管理',
        'mine': '我的'
    };
    return titles[currentTab.value] || '服务商工作台';
});

// Computed property for user type label
const userTypeLabel = computed(() => {
    if (profile.value?.user_type === 'subscription') {
        const sub = profile.value.subscription || currentSubscription.value;
        if (sub) {
             // Support both view (flattened) and joined (object) structures
             const name = sub.plan_name || sub.subscription_plans?.name || sub.name;
             const tier = (sub.plan_tier || sub.subscription_plans?.tier || sub.tier || '').toLowerCase();
             
             const tierMap: Record<string, string> = {
                'basic': '初级会员',
                'professional': '高级会员',
                'premium': '高级会员',
                'vip': 'VIP会员',
                'senior': '高级会员'
             };
             
             return tierMap[tier] || name || '订阅会员';
        }
        return '会员用户';
    }
    return profile.value?.is_certified ? '积分会员' : '积分会员';
});

// ========== STANDARD ORDERS STATE ==========
interface StandardOrder {
    id: string;
    order_no: string;
    status: string;
    service_type: string;
    total_amount: number;
    created_at: string;
    service_title?: string;
    service_image?: string;
    requirements?: string;
}

const standardOrderTabs = [
    { key: 'all', label: '全部', statuses: [] as string[] },
    { key: 'pending_payment', label: '待付款', statuses: ['created'] },
    { key: 'pending_service', label: '待上门', statuses: ['auth_hold', 'captured'] },
    { key: 'pending_verify', label: '待验收', statuses: ['pending_verification'] },
    { key: 'in_progress', label: '服务中', statuses: ['in_progress', 'service_started'] },
    { key: 'completed', label: '已完成', statuses: ['verified', 'rated', 'completed'] },
];

const standardActiveTab = ref('all');
const standardOrders = ref<StandardOrder[]>([]);

const filteredStandardOrders = computed(() => {
    const tab = standardOrderTabs.find(t => t.key === standardActiveTab.value);
    if (!tab || tab.key === 'all') return standardOrders.value;
    return standardOrders.value.filter(o => tab.statuses.includes(o.status));
});

const getStandardTabCount = (key: string) => {
    const tab = standardOrderTabs.find(t => t.key === key);
    if (!tab || key === 'all') return standardOrders.value.length;
    return standardOrders.value.filter(o => tab.statuses.includes(o.status)).length;
};

const getStandardStatusLabel = (status: string) => {
    const map: Record<string, string> = {
        'created': '待付款',
        'auth_hold': '待上门',
        'captured': '待上门',
        'in_progress': '服务进行中',
        'service_started': '服务中',
        'pending_verification': '待验收',
        'verified': '已完成',
        'rated': '已评价',
        'completed': '已完成',
        'cancelled': '已取消',
    };
    return map[status] || status;
};

const formatOrderDate = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getStandardOrderActions = (order: StandardOrder) => {
    const actions = [];
    switch (order.status) {
        case 'auth_hold':
        case 'captured':
            actions.push({ key: 'start', label: '开始服务', primary: true });
            break;
        case 'in_progress':
        case 'service_started':
            actions.push({ key: 'complete', label: '提交验收', primary: true });
            break;
    }
    actions.push({ key: 'view', label: '详情', primary: false });
    return actions;
};

// Modal states for standard orders
const showStartServiceModal = ref(false);
const showCompletionModal = ref(false);
const currentOrderForAction = ref<StandardOrder | null>(null);

const handleStandardAction = (action: string, order: StandardOrder) => {
    switch (action) {
        case 'view':
            uni.navigateTo({ url: `/pages/provider/order-detail?id=${order.id}` });
            break;
        case 'start':
            currentOrderForAction.value = order;
            showStartServiceModal.value = true;
            break;
        case 'complete':
            currentOrderForAction.value = order;
            showCompletionModal.value = true;
            break;
        default:
            uni.showToast({ title: '功能开发中', icon: 'none' });
    }
};

const handleStartChoice = async (index: number) => {
    if (!currentOrderForAction.value) return;
    const order = currentOrderForAction.value;
    showStartServiceModal.value = false;

    if (index === 0) {
        // Navigate to take photo page
        uni.navigateTo({ url: `/pages/provider/service-start?id=${order.id}` });
    } else {
        // Direct start without photo
        uni.showLoading({ title: '处理中...' });
        try {
            await ordersV2Api.startServiceV2(order.id, { photos: [], description: '' });
            uni.showToast({ title: '服务已开始', icon: 'success' });
            fetchStandardOrders();
        } catch (e: any) {
            uni.showToast({ title: e.message || '启动失败', icon: 'none' });
        } finally {
            uni.hideLoading();
        }
    }
};

const handleCompletionChoice = async (index: number) => {
    if (!currentOrderForAction.value) return;
    const order = currentOrderForAction.value;
    showCompletionModal.value = false;

    if (index === 0) {
        // Navigate to take photo page
        uni.navigateTo({ url: `/pages/provider/service-completion?id=${order.id}` });
    } else {
        // Direct completion without photo
        uni.showLoading({ title: '处理中...' });
        try {
            await ordersV2Api.submitCompletion(order.id, { photos: [], description: '' });
            uni.showToast({ title: '已发起验收请求', icon: 'success' });
            fetchStandardOrders();
        } catch (e: any) {
            uni.showToast({ title: e.message || '操作失败', icon: 'none' });
        } finally {
            uni.hideLoading();
        }
    }
};

const viewStandardOrderDetail = (order: StandardOrder) => {
    uni.navigateTo({ url: `/pages/provider/order-detail?id=${order.id}` });
};

const fetchOrders = async () => {
    loadingOrders.value = true;
    try {
        const res = await ordersV2Api.getMyOrders({ role: 'provider' });
        if (res.success && res.orders) {
            // Split into standard and custom
            standardOrders.value = (res.orders || []).filter((o: any) => o.service_type === 'standard');
            
            customOrders.value = (res.orders || [])
                .filter((o: any) => o.service_type !== 'standard')
                .map((item: any) => ({
                    id: item.id,
                    projectName: item.service_title || (item.service_type === 'complex_custom' ? '复杂定制服务' : '定制服务'),
                    paymentType: item.service_type === 'complex_custom' ? 'deposit' : (item.service_type === 'simple_custom' ? 'simple' : 'escrow'),
                    time: item.created_at ? formatDateTime(item.created_at) : '',
                    location: item.location || '温哥华地区',
                    amount: item.total_amount || 0,
                    status: item.status,
                    statusText: getCustomOrderText(item.status)
                }));
        }
    } catch (e) {
        console.error('Fetch orders error:', e);
    } finally {
        loadingOrders.value = false;
    }
};

const fetchStandardOrders = fetchOrders;

const getCustomOrderText = (status: string) => {
    const map: Record<string, string> = {
        'created': '待响应',
        'pending_user': '待确认',
        'auth_hold': '待起草合同',
        'rejected': '用户已拒绝',
        'contracted': '待签署',
        'signed': '已签署',
        'captured': '待付款',
        'in_progress': '服务中',
        'service_started': '进行中',
        'pending_verification': '待验收',
        'verified': '已完成',
        'completed': '已完成',
        'cancelled': '已取消',
        'cancelled_forfeit': '已取消(扣款)'
    };
    return map[status] || status;
};

const formatDateTime = (str: string) => {
    if (!str) return '';
    const date = new Date(str);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${min}`;
};

// ========== CUSTOM ORDERS STATE ==========
interface CustomOrder {
    id: string;
    projectName: string;
    paymentType: 'simple' | 'deposit' | 'escrow';
    time: string;
    location: string;
    amount: number;
    status: string;
    statusText: string;
}

const customOrderTabs = [
    { key: 'all', label: '全部', statuses: [] as string[] },
    { key: 'pending_payment', label: '待处理', statuses: ['created', 'pending_user', 'auth_hold', 'contracted', 'captured'] },
    { key: 'pending_visit', label: '待上门', statuses: ['signed', 'in_progress'] },
    { key: 'in_service', label: '服务中', statuses: ['service_started'] },
    { key: 'pending_acceptance', label: '待验收', statuses: ['pending_verification'] },
    { key: 'completed', label: '已完成', statuses: ['verified', 'rated', 'completed'] },
];

const customActiveTab = ref('all');
const customStartDate = ref('');
const customEndDate = ref('');
const loadingCustomOrders = ref(false);
const customOrders = ref<CustomOrder[]>([]);

const filteredCustomOrders = computed(() => {
    const tab = customOrderTabs.find(t => t.key === customActiveTab.value);
    if (!tab || tab.key === 'all') return customOrders.value;
    return customOrders.value.filter(o => tab.statuses.includes(o.status));
});

const getCustomTabCount = (key: string) => {
    const tab = customOrderTabs.find(t => t.key === key);
    if (!tab || key === 'all') return customOrders.value.length;
    return customOrders.value.filter(o => tab.statuses.includes(o.status)).length;
};

const getPaymentTypeClass = (type: string) => {
    if (type === 'deposit') return 'tag-deposit';
    if (type === 'simple') return 'tag-simple';
    if (type === 'escrow') return 'tag-escrow';
    return 'tag-simple';
};

const getPaymentTypeTextClass = (type: string) => {
    if (type === 'deposit') return 'text-deposit';
    if (type === 'simple') return 'text-simple';
    return 'text-simple';
};

const totalRevenue = computed(() => {
    const sTotal = standardOrders.value
        .filter(o => ['verified', 'rated', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const cTotal = customOrders.value
        .filter(o => ['verified', 'rated', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    return sTotal + cTotal;
});

const pendingSettlement = computed(() => {
    const sPending = standardOrders.value
        .filter(o => ['pending_verification'].includes(o.status))
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const cPending = customOrders.value
        .filter(o => ['pending_verification'].includes(o.status))
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    return sPending + cPending;
});

const pendingOrderCount = computed(() => {
    return standardOrders.value.filter(o => o.status === 'created').length +
           customOrders.value.filter(o => o.status === 'created').length;
});

const upcomingQuoteCount = computed(() => {
    return customOrders.value.filter(o => o.status === 'pending_user').length;
});

const viewCustomOrderDetail = (order: CustomOrder) => {
    uni.navigateTo({ url: `/pages/provider/order-detail?id=${order.id}` });
};

const viewCustomReviews = (order: CustomOrder) => {
    uni.navigateTo({ url: `/pages/order/review?id=${order.id}` });
};

const switchTab = (tab: string) => {
    currentTab.value = tab;
    if (tab === 'orders') {
        fetchOrders();
    }
};

const handleLogout = () => {
    showLogoutModal.value = true;
};

const confirmLogout = () => {
    logout();
    uni.reLaunch({ url: '/pages/index/index' });
};

const goToApply = () => {
    emit('open-apply');
};

const handleApplySuccess = () => {
    fetchData();
};

const serviceCategories = computed(() => {
    let cats: string[] = [];
    
    // 1. From profile categories
    if (profile.value?.service_categories) {
        if (Array.isArray(profile.value.service_categories)) {
            cats = [...profile.value.service_categories];
        } else if (typeof profile.value.service_categories === 'string') {
            try {
                const parsed = JSON.parse(profile.value.service_categories);
                if (Array.isArray(parsed)) cats = parsed;
            } catch {
                if (profile.value.service_categories.startsWith('[')) {
                    // Try to handle simple string lists
                }
                cats = [profile.value.service_categories];
            }
        }
    }
    
    // 2. From business scope
    if (profile.value?.business_scope && !cats.includes(profile.value.business_scope)) {
        cats.push(profile.value.business_scope);
    }
    
    // 3. From approved applications directly
    applications.value.forEach(app => {
        if (app.status === 'approved' && !cats.includes(app.category)) {
            cats.push(app.category);
        }
    });

    return cats.filter(c => c && typeof c === 'string' && c.trim());
});



onMounted(() => {
    fetchData();
});

const fetchData = async () => {
    try {
        const results = await Promise.all([
            providersApi.getMyProfile(),
            providersApi.getServiceTypeApplications(),
            systemSettingsApi.getAll()
        ]);
        
        const profileRes = results[0] as any;
        const appsRes = results[1];
        const settingsRes = results[2];

        // Subscription info is now included in providersApi.getMyProfile() response for efficiency
        if (profileRes.profile?.subscription) {
            currentSubscription.value = profileRes.profile.subscription;
        } else {
            // Keep specialized fetch as fallback for extra resilience
            try {
                const subRes = await userSubscriptionApi.getCurrent();
                if (subRes.success && subRes.data) {
                    currentSubscription.value = subRes.data;
                }
            } catch (e) {
                console.log('No active subscription found');
            }
        }

        const p = profileRes.profile || {};
        p.avatar_url = profileRes.avatar_url || p.avatar_url;
        p.name = profileRes.name || p.name;
        profile.value = p;
        
        // Fetch real-time credits balance from credits API instead of users table
        try {
            const creditsRes = await creditsApi.getBalance();
            // Handle both response formats: creditsRes.data or creditsRes directly
            const balanceData = creditsRes.data || creditsRes;
            userCredits.value = balanceData.total || 0;
        } catch (creditsErr) {
            // Fallback to profile credits if API fails
            userCredits.value = profileRes.credits || 0;
        }
        
        applications.value = appsRes.applications;
        if (settingsRes.success) {
            systemSettings.value = settingsRes.settings || {};
        }
    } catch (e: any) {
        console.error('Fetch provider data failed:', e);
        if (e.message && (e.message.includes('Permission denied') || e.message.includes('不是服务商'))) {
             uni.showToast({ title: '当前账号已不是服务商', icon: 'none' });
             emit('switch-user');
        }
    }
};



const getIconForCategory = (name: string) => {
    const map: any = {
        '搬家': 'truck',
        '接机': 'car',
        '维修': 'wrench',
        '清洁': 'sparkles'
    };
    for(const key in map) {
        if(name.includes(key)) return map[key];
    }
    return 'clipboard';
};

const formatRelativeTime = (str: string) => {
    if (!str) return '';
    const now = new Date();
    const date = new Date(str);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
};

const formatDate = (str: string) => {
    if (!str) return '';
    return new Date(str).toLocaleDateString();
};

const getStatusClass = (status: string, mini: boolean = false) => {
    // If mini is true, we might want dot styles, but here we return bg classes.
    // The template uses it on a w-2 h-2 dot div.
    if (mini) {
        switch(status) {
            case 'pending': return 'bg-blue-400';
            case 'approved': return 'bg-teal-400';
            case 'rejected': return 'bg-red-400';
            default: return 'bg-gray-400';
        }
    }
    
    switch(status) {
        case 'pending': return 'bg-blue-500/20 text-blue-400';
        case 'approved': return 'bg-teal-500/20 text-teal-400';
        case 'rejected': return 'bg-red-500/20 text-red-400';
        default: return 'bg-gray-700 text-gray-400';
    }
};

const getStatusText = (status: string) => {
    const map: any = {
        'pending': '审核中',
        'approved': '已通过',
        'rejected': '未通过'
    };
    return map[status] || status;
};

const getStatusColorClass = (status: string) => {
    switch(status) {
        case 'pending': return 'text-orange-400';
        case 'approved': return 'text-emerald-400';
        case 'rejected': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

const handleWithdraw = () => {
    uni.showToast({ title: '功能开发中', icon: 'none' });
};

const handleCallSupport = () => {
    const phoneNumber = systemSettings.value.site_phone || '400-888-8888';
    uni.makePhoneCall({
        phoneNumber
    });
};

const openOrderHall = () => {
    // Navigate to the full Quote Hall page
    uni.navigateTo({
        url: '/pages/provider/quotes'
    });
};

const openStats = () => {
    uni.navigateTo({
        url: '/pages/provider/stats'
    });
};

const openInbox = () => {
    uni.navigateTo({
        url: '/pages/provider/inbox'
    });
};

const openAccountInfo = () => {
    uni.navigateTo({
        url: '/pages/provider/account'
    });
};

const openOrders = () => {
    uni.navigateTo({
        url: '/pages/provider/orders'
    });
};

const openServiceManagement = () => {
    uni.navigateTo({
        url: '/pages/provider/service-management'
    });
};

const openQuotes = () => {
    uni.navigateTo({
        url: '/pages/provider/quotes'
    });
};

const openCustomOrders = () => {
    uni.navigateTo({
        url: '/pages/provider/custom-orders'
    });
};

const openTransactions = () => {
    uni.navigateTo({
        url: '/pages/provider/transactions'
    });
};

const openSubscription = () => {
    uni.navigateTo({
        url: '/pages/provider/subscription'
    });
};

const openReviews = () => {
    uni.navigateTo({
        url: '/pages/provider/reviews'
    });
};

const openInvoices = () => {
    uni.navigateTo({
        url: '/pages/provider/invoices'
    });
};

const openContracts = () => {
    uni.navigateTo({
        url: '/pages/provider/contracts'
    });
};

const goToStandardOrders = () => {
    uni.navigateTo({
        url: '/pages/provider/orders'
    });
};

const goToCustomOrders = () => {
    uni.navigateTo({
        url: '/pages/provider/custom-orders'
    });
};

const openMyServices = () => {
    uni.navigateTo({
        url: '/pages/provider/service-management'
    });
};

const openServiceArea = () => {
    uni.navigateTo({
        url: '/pages/provider/service-area'
    });
};

const openServiceHours = () => {
    uni.navigateTo({
        url: '/pages/provider/service-hours'
    });
};

const openPaymentMethods = () => {
    uni.navigateTo({
        url: '/pages/provider/payment-methods'
    });
};

const openBillingMethods = () => {
    uni.navigateTo({
        url: '/pages/provider/billing-methods'
    });
};

const openPublicProfile = () => {
    if (!profile.value?.id) return;
    uni.navigateTo({
        url: `/pages/index/provider-profile?id=${profile.value.id}`
    });
};

const openChangePassword = () => {
    uni.navigateTo({
        url: '/pages/user/change-password'
    });
};

const fetchAvailableOrders = async () => {
    loadingOrders.value = true;
    try {
        const res = await submissionsApi.getMySubmissions({ scope: 'available' });
        availableOrders.value = res.submissions;
    } catch (e) {
        console.error('Fetch orders failed:', e);
        uni.showToast({ title: '获取订单失败', icon: 'none' });
    } finally {
        loadingOrders.value = false;
    }
};



const fetchMyOrders = async () => {
    try {
        const res = await submissionsApi.getMySubmissions({ scope: 'all' });
        myOrders.value = res.submissions;
    } catch (e) {
        console.error('Fetch my orders failed:', e);
    }
};

const showQuoteDialog = ref(false);
const submittingQuote = ref(false);
const currentOrder = ref<any>(null);
const currentOrderCost = ref(0);
const quoteForm = reactive({
    price: '',
    message: ''
});

const handleTakeOrder = async (order: any) => {
    // 1. Check if user already quoted (local check if list has data, otherwise API will block)
    // For now, let's just open dialog.
    
    currentOrder.value = order;
    currentOrderCost.value = 0; // Default
    
    // 2. Fetch template details to get quote cost
    if (order.template_id) {
        try {
            const res = await formTemplatesApi.getById(order.template_id);
            if (res.template) {
                currentOrderCost.value = res.template.quote_credit_cost || 0;
            }
        } catch (e) {
            console.error('Failed to fetch template cost', e);
        }
    }
    
    quoteForm.price = '';
    quoteForm.message = '';
    showQuoteDialog.value = true;
};

const closeQuoteDialog = () => {
    showQuoteDialog.value = false;
    currentOrder.value = null;
};

const confirmQuote = async () => {
    if (!quoteForm.price) {
        uni.showToast({ title: '请输入报价金额', icon: 'none' });
        return;
    }
    if ((profile.value?.credits || 0) < currentOrderCost.value) {
        uni.showToast({ title: '积分不足，请充值', icon: 'none' });
        return;
    }

    submittingQuote.value = true;
    try {
        await quotesApi.create({
            submissionId: currentOrder.value.id,
            price: Number(quoteForm.price),
            message: quoteForm.message
        });
        
        uni.showToast({ title: '报价已发送', icon: 'success' });
        closeQuoteDialog();
        
        // Refresh orders to remove it from list or mark as quoted
        // Ideally, 'available' scope should filter out quoted ones? 
        // Currently API doesn't filter quoted, so we might see it again. 
        // Improvement: remove locally.
        const idx = availableOrders.value.findIndex(o => o.id === currentOrder.value.id);
        if (idx > -1) availableOrders.value.splice(idx, 1);
        
        // Refresh profile to see new balance
        const res = await providersApi.getMyProfile();
        profile.value = res.profile;

    } catch (e: any) {
        console.error('Quote failed:', e);
        uni.showToast({ title: e.message || '报价失败', icon: 'none' });
    } finally {
        submittingQuote.value = false;
    }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-teal-400 { color: #34d399; }
.text-blue-400 { color: #60a5fa; }
.p-4 { padding: 16px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.mt-1 { margin-top: 4px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-20 { margin-top: 80px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.gap-4 { gap: 16px; }
.font-bold { font-weight: 700; }
.text-2xl { font-size: 24px; }
.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.rounded-xl { border-radius: 12px; }
.rounded-full { border-radius: 9999px; }
.border { border-width: 1px; }
.border-gray-700 { border-color: #374151; }
.opacity-50 { opacity: 0.5; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }

.bg-gray-850 { background-color: #1a2233; }
.bg-gray-750 { background-color: #2d3748; }
.bg-teal-600 { background-color: #059669; }
.bg-teal-500\/10 { background-color: rgba(16, 185, 129, 0.1); }
.border-teal-500\/20 { border-color: rgba(16, 185, 129, 0.2); }
.border-gray-700\/50 { border-color: rgba(55, 65, 81, 0.5); }
.text-teal-500 { color: #10b981; }
.text-teal-400 { color: #34d399; }
.rounded-2xl { border-radius: 16px; }
.rounded-3xl { border-radius: 24px; }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }

.animate-slide-up {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.upload-box {
    width: 100%;
    height: 100px;
    background-color: #1f2937;
    border: 1px dashed #374151;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.modal-scroll-area {
    max-height: 60vh;
}

/* ========== ORDERS TAB STYLES ========== */
.orders-tab-container {
    min-height: 100vh;
    background: #111827;
}

.tabs-section { margin: 16px 0; }
.tabs-scroll { white-space: nowrap; }
.tabs-row { display: flex; flex-direction: row; gap: 12px; padding: 0 16px; }

.tab-item {
    display: flex; flex-direction: row; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 100px; flex-shrink: 0; transition: all 0.2s ease;
    background: #1f2937; border: 1px solid #374151;
}
.tab-inactive { background: transparent; border-color: #374151; }
.tab-active { background: rgba(16, 185, 129, 0.1); border-color: #10b981; }
.tab-label { font-size: 14px; color: #9ca3af; font-weight: 500; white-space: nowrap; }
.tab-label-active { color: #10b981; font-weight: 600; }
.tab-badge { min-width: 18px; height: 18px; padding: 0 5px; background: rgba(255,255,255,0.1); border-radius: 9px; display: flex; align-items: center; justify-content: center; }
.badge-active { background: #10b981; }
.badge-text { font-size: 11px; color: #9ca3af; font-weight: 600; }
.badge-active .badge-text { color: #ffffff; }

.list-container { padding: 0 16px; box-sizing: border-box; width: 100%; }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; }
.loading-spinner { width: 36px; height: 36px; border: 3px solid #374151; border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; }
.loading-text { margin-top: 12px; font-size: 14px; color: #9ca3af; }

.empty-container { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
.empty-circle { width: 100px; height: 100px; background: rgba(16, 185, 129, 0.1); border-radius: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.empty-icon-wrap { width: 70px; height: 70px; background: #1f2937; border: 1px solid #374151; border-radius: 35px; display: flex; align-items: center; justify-content: center; }
.empty-title { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 8px; }
.empty-desc { font-size: 14px; color: #9ca3af; }

.order-list { display: flex; flex-direction: column; gap: 16px; padding-bottom: 100px; }
.order-card { background: #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border: 1px solid #374151; }

.card-header { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid #374151; }
.status-tag { display: flex; flex-direction: row; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 100px; background: rgba(16, 185, 129, 0.1); }
.status-dot { width: 6px; height: 6px; border-radius: 3px; background: #10b981; }
.status-text { font-size: 12px; color: #10b981; font-weight: 600; }
.order-no { font-size: 12px; color: #6b7280; }

.card-body { display: flex; flex-direction: row; padding: 16px; gap: 12px; }
.order-image-wrap { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
.order-image { width: 100%; height: 100%; object-fit: cover; }
.order-placeholder { width: 100%; height: 100%; background: #374151; display: flex; align-items: center; justify-content: center; }
.placeholder-emoji { font-size: 32px; }
.order-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.order-title { font-size: 16px; font-weight: 600; color: #ffffff; }
.order-desc { font-size: 13px; color: #9ca3af; }
.price-row { display: flex; flex-direction: row; align-items: center; margin-top: 8px; }
.price-label { font-size: 12px; color: #9ca3af; margin-right: 8px; }
.price-value-wrap { display: flex; flex-direction: row; align-items: baseline; }
.price-symbol { font-size: 14px; color: #10b981; font-weight: 600; }
.price-value { font-size: 18px; color: #10b981; font-weight: 700; }

.card-footer { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid #374151; }
.create-time { font-size: 12px; color: #6b7280; }
.action-buttons { display: flex; flex-direction: row; gap: 10px; }
.btn { padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.btn-secondary { background: transparent; border: 1px solid #4b5563; }
.btn-primary { background: #10b981; border: 1px solid #10b981; }
.btn-text { font-size: 13px; font-weight: 500; color: #ffffff; }
.btn-text-gray { color: #d1d5db; }

/* Custom Order Specific Styles */
.header-main { display: flex; flex-direction: row; align-items: center; gap: 10px; flex: 1; }
.project-tag { padding: 4px 10px; border-radius: 6px; }
.tag-simple { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); }
.tag-deposit { background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); }
.tag-escrow { background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); }
.project-text { font-size: 12px; font-weight: 600; }
.text-simple { color: #60a5fa; }
.text-deposit { color: #c084fc; }
.text-escrow { color: #fb923c; }
.date-text { font-size: 12px; color: #d1d5db; }
.status-badge-text { font-size: 13px; color: #10b981; font-weight: 600; }

.info-row { display: flex; flex-direction: row; align-items: center; }
.info-icon { width: 20px; display: flex; align-items: center; }
.info-value { font-size: 14px; color: #e5e7eb; flex: 1; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.price-label-custom { font-size: 13px; color: #9ca3af; margin-right: 8px; }
.price-value-custom { font-size: 18px; font-weight: 700; color: #10b981; }
.mt-3 { margin-top: 12px; }
.card-divider { height: 1px; background: #374151; margin: 0 16px; }
.flex-spacer { flex: 1; }

/* Filter Section for Custom Orders */
.filter-section { padding: 0 16px 16px 16px; }
.filter-card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 12px; display: flex; flex-direction: row; align-items: center; gap: 12px; }
.filter-icon { flex-shrink: 0; }
.date-picker-group { flex: 1; display: flex; flex-direction: row; align-items: center; gap: 8px; }
.date-picker { flex: 1; }
.date-input { background: #111827; border: 1px solid #374151; border-radius: 8px; height: 36px; display: flex; align-items: center; justify-content: center; }
.text-value { color: #ffffff; font-size: 13px; font-weight: 500; }
.text-placeholder { color: #9ca3af; font-size: 13px; }
.date-separator { color: #9ca3af; font-size: 12px; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-container { background: #1f2937; border-radius: 16px; width: 90%; max-width: 400px; padding: 24px; }
.modal-title { font-size: 18px; font-weight: 700; color: #ffffff; display: block; text-align: center; margin-bottom: 20px; }
.modal-options { display: flex; flex-direction: column; gap: 12px; }
.modal-option { display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 16px; background: #111827; border-radius: 12px; border: 1px solid #374151; }
.option-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.option-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.option-label { font-size: 15px; font-weight: 600; }
.option-desc { font-size: 12px; color: #9ca3af; }
.modal-tip { display: flex; flex-direction: row; align-items: center; gap: 6px; margin-top: 16px; justify-content: center; }
.tip-text { font-size: 12px; color: #9ca3af; }
</style>
