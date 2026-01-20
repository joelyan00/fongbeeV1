<template>
  <view class="min-h-screen bg-gray-900 text-white pt-custom">
    <!-- Header -->
    <view class="p-4 flex flex-row items-center justify-between">
        <text class="font-bold text-xl text-white">服务商工作台</text>
        <view class="flex flex-row items-center gap-2">
            <view @click="$emit('switch-user')" class="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                 <text class="text-xs text-gray-300">切换回普通用户</text>
            </view>
            <view @click="handleLogout" class="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                 <text class="text-xs text-red-400">退出登录</text>
            </view>
        </view>
    </view>

    <!-- Provider Profile Card -->
    <view class="px-4 mt-2 mb-4" @click="openAccountInfo">
        <view class="bg-gray-800 rounded-2xl p-4 flex flex-row items-center justify-between border border-gray-700 active:bg-gray-750 transition-colors">
            <view class="flex flex-row items-center gap-4">
                <view class="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <image v-if="profile?.avatar_url" :src="profile.avatar_url" class="w-full h-full rounded-full" mode="aspectFill" />
                    <AppIcon v-else name="user" :size="24" class="text-teal-400" />
                </view>
                <view class="flex flex-col">
                    <view class="flex flex-row items-center gap-2">
                        <text class="text-white font-bold text-lg">{{ profile?.name || '服务商' }}</text>
                        <view class="bg-blue-500/20 px-2 py-0.5 rounded text-[10px] text-blue-400 border border-blue-500/30">
                            {{ profile?.is_certified ? '已认证' : '初级会员' }}
                        </view>
                    </view>
                    <text class="text-gray-400 text-xs mt-1">{{ profile?.email || '点击设置资料' }}</text>
                </view>
            </view>
            <view class="flex flex-row items-center gap-3">
                <view class="flex flex-col items-end">
                    <text class="text-teal-400 font-bold text-xl">{{ profile?.credits || 0 }}</text>
                    <text class="text-gray-400 text-[10px]">我的积分</text>
                </view>
                <AppIcon name="chevron-right" :size="16" color="#4b5563" />
            </view>
        </view>
    </view>

    <!-- Financial Stats (PC Style) -->
    <view class="px-4 grid grid-cols-3 gap-3">
        <view class="bg-gray-800 p-4 rounded-xl flex flex-col justify-between border border-gray-700 h-28">
            <view class="flex justify-between items-start">
                <text class="text-gray-400 text-sm">总收入</text>
                <view class="bg-teal-500/10 px-2.5 py-1 rounded-md">
                    <text class="text-xs text-teal-500">累计</text>
                </view>
            </view>
            <text class="text-lg font-bold text-white mt-2">$12,450</text>
        </view>
        <view class="bg-gray-800 p-4 rounded-xl flex flex-col justify-between border border-gray-700 h-28">
            <view class="flex justify-between items-start">
                <text class="text-gray-400 text-sm">待结算</text>
                <view class="bg-orange-500/10 px-2.5 py-1 rounded-md">
                    <text class="text-xs text-orange-500">处理中</text>
                </view>
            </view>
            <text class="text-lg font-bold text-orange-400 mt-2">$850</text>
        </view>
        <view class="bg-gray-800 p-4 rounded-xl flex flex-col justify-between border border-gray-700 h-28 relative overflow-hidden group active:bg-gray-700" @click="handleWithdraw">
             <view class="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></view>
             <view class="flex justify-between items-start">
                <text class="text-gray-400 text-sm">可提现</text>
                <view class="bg-blue-500 px-2.5 py-1 rounded-md shadow-lg shadow-blue-500/20">
                    <text class="text-xs text-white font-bold">提现</text>
                </view>
            </view>
            <text class="text-lg font-bold text-blue-400 mt-2">$3,200</text>
        </view>
    </view>

    <!-- Quick Actions Grid -->
    <view class="px-4 mt-6">
        <text class="text-gray-400 text-xs font-bold mb-3 pl-1 block">常用功能</text>
        <view class="grid grid-cols-3 gap-3 bg-gray-800 p-4 rounded-xl border border-gray-700">
             <view class="flex flex-col items-center gap-2" @click="openOrderHall">
                 <view class="w-[60px] h-[60px] bg-gray-700 rounded-full flex items-center justify-center">
                     <AppIcon name="clipboard" :size="28" color="#10b981"/>
                 </view>
                 <text class="text-xs font-medium text-gray-300">任务大厅</text>
             </view>
             <view class="flex flex-col items-center gap-2" @click="openStats">
                 <view class="w-[60px] h-[60px] bg-gray-700 rounded-full flex items-center justify-center">
                     <AppIcon name="grid" :size="28" color="#10b981"/>
                 </view>
                 <text class="text-xs font-medium text-gray-300">营业统计</text>
             </view>
             <view class="flex flex-col items-center gap-2" @click="openInbox">
                 <view class="w-[60px] h-[60px] bg-gray-700 rounded-full flex items-center justify-center">
                     <AppIcon name="mail" :size="28" color="#10b981"/>
                 </view>
                 <text class="text-xs font-medium text-gray-300">收件箱</text>
             </view>
        </view>
    </view>

    <!-- Application Progress (Preserved) -->
    <view v-if="applications.length > 0" class="px-4 mt-6">
        <view class="flex flex-row items-center justify-between mb-3">
             <text class="text-gray-500 text-xs font-bold pl-1 block">服务开通进度</text>
             <view @click="goToApply" class="flex flex-row items-center gap-1">
                 <text class="text-xs text-teal-400">申请新服务</text>
                 <AppIcon name="chevron-right" :size="12" color="#34d399" />
             </view>
        </view>
        <view class="flex flex-row flex-wrap gap-3">
             <view v-for="app in applications" :key="app.id" class="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 flex flex-row items-center">
                 <text class="text-sm font-bold text-gray-200">{{ app.category }}</text>
                 <text :class="['text-xs ml-1 font-medium', getStatusColorClass(app.status)]">
                    ({{ getStatusText(app.status) }})
                 </text>
             </view>
        </view>
    </view>

    <!-- Detailed Lists Groups -->
    
    <!-- Standard Services -->
    <view class="px-4 mt-6">
        <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-gray-400 text-xs font-bold pl-1">标准服务</text>
            <view class="flex flex-row items-center gap-1" @click="openServiceManagement">
                <AppIcon name="layout" :size="14" color="#10b981" />
                <text class="text-xs text-emerald-400">模版管理</text>
            </view>
        </view>
        <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openServiceManagement">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="grid" :size="22" color="#9ca3af" />
                       <view class="flex flex-col">
                           <text class="text-base text-gray-200">我的服务</text>
                           <text class="text-xs text-gray-500">管理已发布的标准服务</text>
                       </view>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 active:bg-gray-700" @click="openOrders">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="clipboard" :size="22" color="#9ca3af" />
                       <view class="flex flex-col">
                           <text class="text-base text-gray-200">订单管理</text>
                           <text class="text-xs text-gray-500">查看和处理标准服务订单</text>
                       </view>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
        </view>
    </view>

    <!-- Custom Services -->
    <view class="px-4 mt-6">
        <text class="text-gray-500 text-xs font-bold mb-2 pl-1 block">定制服务</text>
        <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openQuotes">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="file-text" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">定制服务报价记录</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 active:bg-gray-700" @click="openCustomOrders">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="clipboard" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">定制服务订单管理</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
        </view>
    </view>

    <!-- Finance Management -->
    <view class="px-4 mt-6">
        <text class="text-gray-500 text-xs font-bold mb-2 pl-1 block">财务管理</text>
        <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openTransactions">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="credit-card" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">交易记录</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 active:bg-gray-700" @click="openSubscription">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="crown" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">等级与订阅机制</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
        </view>
    </view>

    <!-- Other Features -->
    <view class="px-4 mt-6">
        <text class="text-gray-500 text-xs font-bold mb-2 pl-1 block">其他功能</text>
        <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openReviews">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="star" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">收到的评论</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openInvoices">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="file-text" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">已开具发票</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 active:bg-gray-700" @click="openContracts">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="file" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">合同管理</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
        </view>
    </view>

    <!-- Account Settings -->
    <view class="px-4 mt-6">
        <text class="text-gray-500 text-xs font-bold mb-2 pl-1 block">账户与设置</text>
        <view class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openServiceArea">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="map-pin" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">服务区域管理</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openServiceHours">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="clock" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">服务时间管理</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openAccountInfo">
                    <view class="flex flex-row items-center gap-4">
                        <AppIcon name="user" :size="22" color="#9ca3af" />
                        <text class="text-base text-gray-200">编辑个人资料</text>
                    </view>
                    <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 border-b border-gray-700 active:bg-gray-700" @click="openPublicProfile">
                    <view class="flex flex-row items-center gap-4">
                        <AppIcon name="eye" :size="22" color="#9ca3af" />
                        <text class="text-base text-gray-200">预览我的展示主页</text>
                    </view>
                    <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
             <view class="flex flex-row items-center justify-between p-4 active:bg-gray-700" @click="openPaymentMethods">
                   <view class="flex flex-row items-center gap-4">
                       <AppIcon name="credit-card" :size="22" color="#9ca3af" />
                       <text class="text-base text-gray-200">收款方式</text>
                   </view>
                   <AppIcon name="chevron-right" :size="16" color="#4b5563" />
             </view>
        </view>
    </view>

    <!-- Help Center -->
    <view class="px-4" style="margin-top: 40rpx;">
        <view class="bg-blue-500/10 rounded-2xl p-6 flex flex-col items-center border border-blue-500/20">
             <view class="flex flex-row items-center gap-2 mb-2">
                 <AppIcon name="headphones" :size="20" color="#60a5fa" />
                 <text class="text-blue-400 font-bold">帮助中心</text>
             </view>
             <text class="text-gray-400 text-xs mb-4">如有相关问题咨询，请联系客服</text>
             
             <view class="flex flex-col items-center gap-3 w-full">
                 <view v-if="systemSettings.site_phone" class="bg-blue-600/20 px-6 py-2 rounded-full border border-blue-500/30 flex flex-row items-center gap-2 active:bg-blue-600/40 w-full justify-center" @click="handleCallSupport">
                     <AppIcon name="phone" :size="16" color="#60a5fa" />
                     <text class="text-blue-400 font-bold text-lg">{{ systemSettings.site_phone }}</text>
                 </view>
                 
                 <view v-if="systemSettings.site_email" class="flex flex-row items-center gap-2">
                     <AppIcon name="mail" :size="14" color="#9ca3af" />
                     <text class="text-gray-400 text-xs">{{ systemSettings.site_email }}</text>
                 </view>
             </view>
        </view>
    </view>

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
            <view class="w-12 h-1.5 bg-gray-700 rounded-full self-center mb-6 opacity-50"></view>

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
                                      <text class="text-[20rpx] text-gray-500 font-mono mt-0.5">{{ order.form_data?._order_no || 'ORD-' + order.id.substring(0,6).toUpperCase() }}</text>
                                  </view>
                              </view>
                              <view class="bg-teal-500/10 px-2 py-1 rounded-lg border border-teal-500/20">
                                  <text class="text-[20rpx] text-teal-400 font-bold">NEW</text>
                              </view>
                          </view>
                          
                          <view class="grid grid-cols-1 gap-2.5 mb-5 bg-black/20 p-4 rounded-2xl">
                               <view class="flex flex-row items-center gap-2">
                                   <AppIcon name="calendar" :size="14" color="#9ca3af" />
                                   <text class="text-sm text-gray-300">发布于: {{ formatRelativeTime(order.created_at) }}</text>
                               </view>
                               <view class="flex flex-row items-start gap-2">
                                   <AppIcon name="clipboard" :size="14" color="#9ca3af" class="mt-0.5" />
                                   <text class="text-sm text-gray-400 line-clamp-2 leading-relaxed">{{ order.notes || '用户暂无补充说明信息' }}</text>
                               </view>
                          </view>

                          <view class="flex flex-row items-center justify-between">
                               <view class="flex flex-col">
                                   <text class="text-[20rpx] text-gray-500 uppercase tracking-wider mb-0.5">预估收益</text>
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
                     <text class="text-gray-200">{{ profile?.credits || 0 }} 积分</text>
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
import { providersApi, submissionsApi, quotesApi, formTemplatesApi, systemSettingsApi, logout } from '../services/api';

const emit = defineEmits(['switch-user', 'open-apply']);

const profile = ref<any>(null);
const applications = ref<any[]>([]);
const systemSettings = ref<Record<string, string>>({});
const showApplyModal = ref(false);
const showOrderHall = ref(false);
const availableOrders = ref<any[]>([]);
const loadingOrders = ref(false);
const showLogoutModal = ref(false);

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
        const [profileRes, appsRes, settingsRes] = await Promise.all([
            providersApi.getMyProfile(),
            providersApi.getServiceTypeApplications(),
            systemSettingsApi.getAll()
        ]);
        profile.value = profileRes.profile;
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
    // Navigate to the full Order Hall page
    uni.navigateTo({
        url: '/pages/provider/order-hall'
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
</style>
