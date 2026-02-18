<template>
  <view class="dashboard-page" style="background-color: #ecfdf5; min-height: 100vh; padding-bottom: 40px;">
    <!-- Header (Fixed, capsule-aligned) -->
    <view class="header-section"
      style="position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: linear-gradient(to right, #10b981, #059669); padding-left: 16px; padding-bottom: 32px; overflow: hidden;"
      :style="{paddingTop: statusBarHeight + 'px', paddingRight: (capsuleWidth + 10) + 'px'}">
      <!-- Decorative circles -->
      <view class="decorative-circle circle-1"></view>
      <view class="decorative-circle circle-2"></view>

      <view class="nav-bar" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 24px;" :style="{height: navBarHeight + 'px'}">
        <view class="back-btn" @click="goBack" style="padding: 8px 8px 8px 0; display: flex; align-items: center; justify-content: flex-start;">
          <AppIcon name="chevron-left" :size="32" color="white" :strokeWidth="2.5" />
        </view>
        <text class="page-title" style="font-size: 18px; font-weight: bold; color: white; position: absolute; left: 50%; transform: translateX(-50%);">销售合伙人</text>
        <view class="logout-btn" @click="handleLogout" style="background-color: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.3);">
          <text class="logout-text" style="font-size: 12px; color: white; font-weight: 500;">退出</text>
        </view>
      </view>

      <!-- User Info -->
      <view class="user-info" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 16px;">
        <view class="avatar" style="width: 64px; height: 64px; border-radius: 50%; background-color: rgba(255,255,255,0.2); display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0;">
          <text class="avatar-text" style="font-size: 24px; font-weight: bold; color: white;">{{ userInfo?.name?.[0] || 'S' }}</text>
        </view>
        <view class="user-details" style="display: flex !important; flex-direction: column !important;">
          <text class="user-name" style="font-size: 20px; font-weight: bold; color: white;">{{ userInfo?.name }}</text>
          <text class="user-email" style="font-size: 14px; color: rgba(255,255,255,0.8);">{{ userInfo?.email }}</text>
        </view>
      </view>
    </view>

    <!-- Spacer below fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight + 32) + 'px'}"></view>

    <!-- Stats Cards -->
    <view class="stats-container" style="padding: 0 16px; margin-top: -20px; position: relative; z-index: 10;">
      <view class="stats-card" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 16px; display: flex !important; flex-direction: row !important; justify-content: space-between !important;">
        <view class="stat-item" style="flex: 1; display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center;">
          <view class="stat-label" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 4px; font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            <text>💰</text>
            <text>总收益</text>
          </view>
          <text class="stat-value" style="font-size: 18px; font-weight: bold; color: #111827;">${{ profile?.total_earnings || '0.00' }}</text>
        </view>

        <view class="stat-item border-h" style="flex: 1; display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center; border-left: 1px solid #f3f4f6; border-right: 1px solid #f3f4f6;">
          <view class="stat-label" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 4px; font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            <text>💳</text>
            <text>可提现</text>
          </view>
          <text class="stat-value" style="font-size: 18px; font-weight: bold; color: #111827;">${{ profile?.current_balance || '0.00' }}</text>
          <text class="withdraw-link" style="font-size: 10px; color: #059669; margin-top: 4px;" @click="showWithdrawModal = true">申请提现 →</text>
        </view>

        <view class="stat-item" style="flex: 1; display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center;">
          <view class="stat-label" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 4px; font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            <text>👥</text>
            <text>服务商</text>
          </view>
          <text class="stat-value" style="font-size: 18px; font-weight: bold; color: #111827;">{{ providers.length }}</text>
        </view>
      </view>
    </view>

    <!-- Tab Navigation -->
    <view class="tabs-nav" style="display: flex !important; flex-direction: row !important; padding: 0 16px; margin-top: 16px; gap: 8px;">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        @click="activeTab = tab.key"
        style="flex: 1; padding: 10px 0; text-align: center; font-size: 13px; font-weight: bold; border-radius: 10px; display: flex !important; align-items: center !important; justify-content: center !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"
        :style="activeTab === tab.key ? 'background-color: #059669; color: white; box-shadow: 0 4px 6px rgba(5,150,105,0.3);' : 'background-color: white; color: #4b5563;'"
      >
        {{ tab.label }}
      </view>
    </view>
    
    <!-- Content Area -->
    <view class="content-area">
      
      <!-- Dashboard Tab -->
      <view v-if="activeTab === 'dashboard'" class="tab-content" style="display: flex !important; flex-direction: column !important; gap: 16px;">
        <!-- Referral Link Card -->
        <view class="referral-card" style="background: linear-gradient(135deg, #059669, #047857); border-radius: 16px; padding: 16px; color: white;">
          <view class="card-header" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px; margin-bottom: 12px;">
            <text class="icon">🔗</text>
            <text class="title" style="font-size: 16px; font-weight: bold; color: white;">推广链接</text>
          </view>

          <view class="type-switch" style="display: flex !important; flex-direction: row !important; gap: 8px; margin-bottom: 12px;">
            <view
              class="switch-item"
              @click="inviteType = 'provider'"
              style="flex: 1; text-align: center; padding: 8px 0; font-size: 12px; font-weight: bold; border-radius: 8px;"
              :style="inviteType === 'provider' ? 'background-color: white; color: #059669;' : 'background-color: rgba(255,255,255,0.2); color: white;'"
            >
              服务商
            </view>
            <view
              class="switch-item"
              @click="inviteType = 'user'"
              style="flex: 1; text-align: center; padding: 8px 0; font-size: 12px; font-weight: bold; border-radius: 8px;"
              :style="inviteType === 'user' ? 'background-color: white; color: #059669;' : 'background-color: rgba(255,255,255,0.2); color: white;'"
            >
              用户
            </view>
          </view>

          <view class="link-box" style="background-color: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; font-size: 12px; word-break: break-all; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2); color: white;">
            {{ getReferralLink() }}
          </view>

          <view class="action-btn-row" style="display: flex !important; flex-direction: row !important; gap: 12px; margin-bottom: 12px;">
            <view class="copy-btn" @click="copyLink" style="flex: 1; background-color: white; color: #059669; text-align: center; padding: 12px 0; border-radius: 8px; font-weight: bold; font-size: 14px; display: flex !important; align-items: center !important; justify-content: center !important;">
              {{ copied ? '✓ 已复制' : '📋 复制链接' }}
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <button class="share-btn" open-type="share" style="flex: 1; background-color: rgba(255,255,255,0.2); color: white; text-align: center; padding: 12px 0; border-radius: 8px; font-weight: bold; font-size: 14px; border: 1px solid rgba(255,255,255,0.4); line-height: normal; margin: 0; display: flex; align-items: center; justify-content: center;">
              📤 分享卡片
            </button>
            <!-- #endif -->
          </view>

          <view class="invite-code-row" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px; font-size: 14px; color: white;">
            <text>邀请码:</text>
            <text class="code-text" style="font-weight: bold; font-size: 18px; letter-spacing: 1px; color: white;">{{ profile?.referral_code || '---' }}</text>
          </view>
        </view>

        <!-- Invite Form -->
        <view class="form-card" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <view class="card-title-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px; margin-bottom: 16px;">
            <text class="icon">📨</text>
            <text class="title" style="font-size: 16px; font-weight: bold; color: #111827;">发送邀请</text>
          </view>

          <view class="invite-tabs" style="display: flex !important; flex-direction: row !important; gap: 12px; margin-bottom: 12px;">
            <view
              class="invite-tab"
              @click="inviteType = 'provider'"
              style="flex: 1; text-align: center; padding: 8px 0; font-size: 13px; font-weight: bold; border-radius: 8px; border: 1px solid #e5e7eb;"
              :style="inviteType === 'provider' ? 'border-color: #10b981; background-color: #d1fae5; color: #065f46;' : 'color: #6b7280; background-color: white;'"
            >
              邀请服务商
            </view>
            <view
              class="invite-tab"
              @click="inviteType = 'user'"
              style="flex: 1; text-align: center; padding: 8px 0; font-size: 13px; font-weight: bold; border-radius: 8px; border: 1px solid #e5e7eb;"
              :style="inviteType === 'user' ? 'border-color: #10b981; background-color: #d1fae5; color: #065f46;' : 'color: #6b7280; background-color: white;'"
            >
              邀请用户
            </view>
          </view>

          <view class="input-row" style="display: flex !important; flex-direction: row !important; gap: 8px;">
            <input
              type="text"
              class="input-field"
              style="flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; font-size: 14px;"
              :placeholder="inviteType === 'provider' ? '服务商邮箱或手机号' : '用户邮箱或手机号'"
              v-model="inviteContact"
            />
            <view
              class="send-btn"
              @click="handleInvite"
              style="background-color: #059669; color: white; padding: 0 20px; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 8px; font-weight: bold; font-size: 14px; height: 44px;"
            >
              {{ inviteLoading ? '...' : '发送' }}
            </view>
          </view>
        </view>

        <!-- Promotion Settings -->
        <view class="form-card" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <view class="card-title-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px; margin-bottom: 16px;">
            <text class="icon">⚙️</text>
            <text class="title" style="font-size: 16px; font-weight: bold; color: #111827;">推广策略配置</text>
          </view>
          <view class="setting-row" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; background-color: #f9fafb; padding: 16px; border-radius: 12px;">
            <view class="setting-info" style="flex: 1; padding-right: 16px;">
              <text class="setting-title" style="display: block; font-weight: bold; color: #111827; font-size: 14px;">赠送新用户积分 (50分)</text>
              <text class="setting-desc" style="display: block; color: #6b7280; font-size: 12px; margin-top: 4px;">开启后，新用户通过您的链接注册将获得50积分。</text>
              <text class="setting-note" style="display: block; color: #059669; font-size: 12px; margin-top: 2px;">积分成本从余额扣除 ($0.50/人)</text>
            </view>
            <switch
              :checked="profile?.bonus_enabled || false"
              color="#10b981"
              @change="toggleBonus"
            />
          </view>
        </view>
      </view>
      
      <!-- Providers Tab -->
      <view v-if="activeTab === 'providers'" class="tab-content" style="display: flex !important; flex-direction: column !important; gap: 16px;">
        <view class="list-card" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <text class="list-title" style="display: block; font-weight: bold; color: #111827; margin-bottom: 16px; font-size: 16px;">我的服务商 ({{ providers.length }})</text>
          <view v-if="providers.length === 0" class="empty-state" style="text-align: center; padding: 32px 0; color: #9ca3af; font-size: 14px;">
            暂无服务商
          </view>
          <view v-for="p in providers" :key="p.id" class="list-item" style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
            <view class="item-header" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: flex-start !important; margin-bottom: 4px;">
              <view>
                <text class="item-name" style="font-weight: bold; color: #111827; font-size: 15px; display: block;">{{ p.name }}</text>
                <text class="item-sub" style="font-size: 12px; color: #6b7280; display: block;">{{ p.email || p.phone }}</text>
              </view>
              <view
                class="status-badge"
                style="padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;"
                :style="p.status === 'active' ? 'background-color: #dcfce7; color: #15803d;' : 'background-color: #fee2e2; color: #b91c1c;'"
              >
                {{ p.status === 'active' ? '活跃' : p.status }}
              </view>
            </view>
            <text class="item-date" style="font-size: 12px; color: #9ca3af; display: block; margin-top: 4px;">加入: {{ formatDate(p.created_at) }}</text>
          </view>
        </view>
      </view>
      
      <!-- Revenue Tab -->
      <view v-if="activeTab === 'revenue'" class="tab-content" style="display: flex !important; flex-direction: column !important; gap: 16px;">
        <!-- Balance Card -->
        <view class="balance-card" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important;">
          <view>
            <text class="balance-label" style="display: block; font-size: 14px; color: #6b7280;">可提现余额</text>
            <text class="balance-value" style="display: block; font-size: 24px; font-weight: bold; color: #111827;">${{ profile?.current_balance || '0.00' }}</text>
          </view>
          <view class="withdraw-btn" @click="showWithdrawModal = true" style="background-color: #059669; color: white; padding: 8px 16px; border-radius: 10px; font-size: 14px; font-weight: bold;">
            申请提现
          </view>
        </view>

        <!-- Payment Methods Management -->
        <view class="list-card" @click="goToPaymentMethods" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <view style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important;">
            <view style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px;">
               <text style="font-size: 18px;">💳</text>
               <text style="font-weight: bold; color: #1f2937;">收款账户管理</text>
            </view>
            <text style="color: #9ca3af; font-size: 18px;">›</text>
          </view>
        </view>

        <!-- Commission Logs -->
        <view class="list-card" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <text class="list-title" style="display: block; font-weight: bold; color: #111827; margin-bottom: 16px; font-size: 16px;">佣金流水</text>
          <view v-if="logs.length === 0" class="empty-state" style="text-align: center; padding: 32px 0; color: #9ca3af; font-size: 14px;">
            暂无佣金记录
          </view>
          <view v-for="log in logs" :key="log.id" class="log-item" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <view>
              <text class="log-date" style="font-size: 12px; color: #9ca3af; display: block;">{{ formatDate(log.created_at) }}</text>
              <text class="log-detail" style="font-size: 14px; color: #374151; display: block;">订单金额: ${{ log.order_amount }}</text>
            </view>
            <text class="log-amount" style="font-size: 16px; font-weight: bold; color: #059669;">+${{ log.commission_amount }}</text>
          </view>
        </view>
      </view>
      
      <!-- Support Tab -->
      <view v-if="activeTab === 'support'" class="tab-content" style="display: flex !important; flex-direction: column !important; gap: 16px;">
        <view class="list-card" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <text class="list-title" style="display: block; font-weight: bold; color: #111827; margin-bottom: 16px; font-size: 16px;">工单列表</text>
          <view v-if="tickets.length === 0" class="empty-state" style="text-align: center; padding: 32px 0; color: #9ca3af; font-size: 14px;">
            暂无工单
          </view>
          <view v-for="t in tickets" :key="t.id" class="list-item" style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
            <view class="item-header" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: flex-start !important; margin-bottom: 4px;">
              <text class="item-name" style="font-weight: bold; color: #111827; font-size: 15px;">{{ t.provider_name }}</text>
              <view
                class="status-badge"
                style="padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;"
                :style="t.status === 'open' ? 'background-color: #fee2e2; color: #b91c1c;' : 'background-color: #dcfce7; color: #15803d;'"
              >
                {{ t.status }}
              </view>
            </view>
            <text class="item-desc" style="font-size: 12px; color: #9ca3af; display: block; margin-top: 4px;">{{ t.subject }}</text>
          </view>
        </view>
      </view>

      <!-- Payout Tab -->
      <view v-if="activeTab === 'payout'" class="tab-content" style="display: flex !important; flex-direction: column !important; gap: 16px;">
        <view class="list-card" style="background-color: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <view style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 16px;">
            <text class="list-title" style="font-weight: bold; color: #111827; font-size: 16px;">收款账户</text>
            <view class="add-btn" @click="goToPaymentMethods" style="background-color: #10b981; color: white; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: bold;">
              + 添加账户
            </view>
          </view>

          <!-- Mock Bank Account Card -->
          <view class="bank-card" style="background: linear-gradient(135deg, #f0f9ff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex !important; flex-direction: row !important; gap: 12px; align-items: flex-start !important; position: relative; margin-bottom: 12px;">
            <view class="bank-icon" style="width: 48px; height: 48px; background-color: #dbeafe; border-radius: 12px; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 24px; flex-shrink: 0;">
              🏦
            </view>
            <view class="bank-info" style="flex: 1; display: flex !important; flex-direction: column !important; gap: 4px;">
              <text class="bank-name" style="font-size: 16px; font-weight: bold; color: #1f2937;">TD Canada Trust</text>
              <text class="bank-details" style="font-size: 12px; color: #6b7280; font-family: monospace;">INST: 004 | TRANSIT: 12345</text>
              <text class="bank-acct" style="font-size: 14px; color: #374151; font-family: monospace; font-weight: 500;">ACCT: **** 9876</text>
            </view>
            <view class="bank-default" style="position: absolute; top: 12px; right: 12px; background-color: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px;">默认</view>
          </view>

          <view class="payout-note" style="background-color: #eff6ff; color: #1e40af; font-size: 12px; padding: 12px; border-radius: 8px; line-height: 1.5;">
            为了您的资金安全，收款账户户名必须与实名认证信息一致。
          </view>
        </view>
      </view>
    </view>
    
    <!-- Withdraw Modal -->
    <view v-if="showWithdrawModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 100; display: flex !important; align-items: center !important; justify-content: center !important; padding: 20px;">
      <view class="modal-content" style="background-color: white; border-radius: 16px; width: 100%; max-width: 320px; padding: 24px;">
        <text class="modal-title" style="font-size: 18px; font-weight: bold; color: #111827; display: block; margin-bottom: 16px; text-align: center;">申请提现</text>
        <view class="modal-body">
          <view class="modal-field" style="margin-bottom: 16px;">
            <text class="field-label" style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px; display: block;">提现金额</text>
            <input
              type="number"
              class="field-input"
              style="width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; font-size: 16px; box-sizing: border-box;"
              v-model="withdrawAmount"
              placeholder="0.00"
            />
          </view>
          <view class="modal-note" style="background-color: #fefce8; color: #854d0e; font-size: 12px; padding: 10px; border-radius: 8px; margin-bottom: 20px;">
            提现通常需 1-3 个工作日审核。
          </view>
          <view class="modal-actions" style="display: flex !important; flex-direction: row !important; gap: 16px; width: 100%;">
            <view class="action-btn cancel" @click="showWithdrawModal = false" style="flex: 1; padding: 16px 0; text-align: center; font-weight: 800; font-size: 15px; border-radius: 14px; background-color: #f3f4f6; color: #6b7280;">
              取消
            </view>
            <view class="action-btn confirm" @click="handleWithdraw" style="flex: 1; padding: 16px 0; text-align: center; font-weight: 800; font-size: 15px; border-radius: 14px; background-color: #10b981; color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.2);">
              确认提现
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Bank Account Modal -->
    <view v-if="showBankModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 100; display: flex !important; align-items: center !important; justify-content: center !important; padding: 20px;">
      <view class="modal-content bank-modal" style="background-color: #1f2937; border-radius: 24px; padding: 24px; width: 90%; max-width: 400px; border: 1px solid #374151;">
        <view class="modal-header" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 24px;">
          <text class="modal-title" style="font-size: 18px; font-weight: bold; color: white;">添加银行账户</text>
          <view class="close-btn" @click="closeBankModal" style="width: 32px; height: 32px; display: flex !important; align-items: center !important; justify-content: center !important;">
            <text style="font-size: 24px; color: #9ca3af;">×</text>
          </view>
        </view>

        <view class="bank-form" style="display: flex !important; flex-direction: column !important; gap: 20px;">
          <view class="form-field" style="display: flex !important; flex-direction: column !important; gap: 8px;">
            <text style="font-size: 14px; font-weight: 500; color: #e5e7eb; margin-bottom: 8px; display: block;">账户持有人姓名 (Account Holder Name)</text>
            <view class="input-wrapper" style="display: flex !important; flex-direction: row !important; align-items: center !important; background-color: #374151; border-radius: 12px; padding: 14px 16px; border: 1px solid #4b5563;">
              <text style="font-size: 18px; color: #9ca3af; margin-right: 12px;">👤</text>
              <input
                type="text"
                class="field-input"
                style="flex: 1; background: transparent; border: none; color: #ffffff; font-size: 15px;"
                v-model="bankForm.holderName"
                placeholder="如: JOHN DOE"
                placeholder-style="color: #6b7280;"
              />
            </view>
          </view>

          <view class="form-field" style="display: flex !important; flex-direction: column !important; gap: 8px;">
            <text style="font-size: 14px; font-weight: 500; color: #e5e7eb; margin-bottom: 8px; display: block;">银行代码 (Institution No. – 3 digits)</text>
            <view class="input-wrapper" style="display: flex !important; flex-direction: row !important; align-items: center !important; background-color: #374151; border-radius: 12px; padding: 14px 16px; border: 1px solid #4b5563;">
              <text style="font-size: 18px; color: #9ca3af; margin-right: 12px;">🏦</text>
              <input
                type="number"
                class="field-input"
                style="flex: 1; background: transparent; border: none; color: #ffffff; font-size: 15px;"
                v-model="bankForm.institutionNo"
                placeholder="003"
                placeholder-style="color: #6b7280;"
                maxlength="3"
              />
            </view>
          </view>

          <view class="form-field" style="display: flex !important; flex-direction: column !important; gap: 8px;">
            <text style="font-size: 14px; font-weight: 500; color: #e5e7eb; margin-bottom: 8px; display: block;">分行代码 (Transit No. – 5 digits)</text>
            <view class="input-wrapper" style="display: flex !important; flex-direction: row !important; align-items: center !important; background-color: #374151; border-radius: 12px; padding: 14px 16px; border: 1px solid #4b5563;">
              <text style="font-size: 18px; color: #9ca3af; margin-right: 12px;">📍</text>
              <input
                type="number"
                class="field-input"
                style="flex: 1; background: transparent; border: none; color: #ffffff; font-size: 15px;"
                v-model="bankForm.transitNo"
                placeholder="12345"
                placeholder-style="color: #6b7280;"
                maxlength="5"
              />
            </view>
          </view>

          <view class="form-field" style="display: flex !important; flex-direction: column !important; gap: 8px;">
            <text style="font-size: 14px; font-weight: 500; color: #e5e7eb; margin-bottom: 8px; display: block;">账号 (Account No. – 7-12 digits)</text>
            <view class="input-wrapper" style="display: flex !important; flex-direction: row !important; align-items: center !important; background-color: #374151; border-radius: 12px; padding: 14px 16px; border: 1px solid #4b5563;">
              <text style="font-size: 18px; color: #9ca3af; margin-right: 12px;">💳</text>
              <input
                type="number"
                class="field-input"
                style="flex: 1; background: transparent; border: none; color: #ffffff; font-size: 15px;"
                v-model="bankForm.accountNo"
                placeholder="1234567"
                placeholder-style="color: #6b7280;"
                maxlength="12"
              />
            </view>
          </view>
        </view>

        <view class="save-bank-btn" @click="saveBankAccount" style="margin-top: 24px; background-color: #10b981; border-radius: 12px; padding: 16px; display: flex !important; align-items: center !important; justify-content: center !important;">
          <text style="color: white; font-weight: bold; font-size: 16px;">{{ savingBank ? '保存中...' : '保存账户' }}</text>
        </view>
      </view>
    </view>
    
    <!-- Loading -->
    <view v-if="loading" class="loading-overlay">
      <view class="spinner"></view>
    </view>

    <!-- Logout Modal -->
    <view v-if="showLogoutModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 100; display: flex !important; align-items: center !important; justify-content: center !important; padding: 20px;">
      <view class="modal-content logout-modal" style="background-color: white; border-radius: 16px; width: 90%; max-width: 340px; padding: 40px 24px 32px; display: flex !important; flex-direction: column !important; align-items: center !important;">
        <view class="logout-icon-wrapper" style="width: 72px; height: 72px; background-color: #ecfdf5; border-radius: 20px; display: flex !important; align-items: center !important; justify-content: center !important; margin-bottom: 24px; transform: rotate(-10deg);">
          <AppIcon name="log-out" :size="32" color="#10b981" />
        </view>
        <text class="modal-title" style="font-size: 18px; font-weight: bold; color: #111827; display: block; margin-bottom: 8px; text-align: center;">确认退出</text>
        <text class="modal-desc" style="font-size: 14px; color: #6b7280; margin-bottom: 24px; text-align: center; display: block;">是否确认退出当前账号？</text>
        <view class="modal-actions" style="display: flex !important; flex-direction: row !important; gap: 16px; width: 100%;">
          <view class="action-btn cancel" @click="showLogoutModal = false" style="flex: 1; padding: 16px 0; text-align: center; font-weight: 800; font-size: 15px; border-radius: 14px; background-color: #f3f4f6; color: #6b7280;">
            取消
          </view>
          <view class="action-btn confirm" @click="confirmLogout" style="flex: 1; padding: 16px 0; text-align: center; font-weight: 800; font-size: 15px; border-radius: 14px; background-color: #10b981; color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.2);">
            退出登录
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { salesApi, getUserInfo, isLoggedIn, logout } from '@/services/api';
import AppIcon from '@/components/Icons.vue';

const userInfo = ref<any>(null);
const profile = ref<any>(null);
const logs = ref<any[]>([]);
const providers = ref<any[]>([]);
const tickets = ref<any[]>([]);
const loading = ref(true);
const activeTab = ref('dashboard');
const copied = ref(false);
const inviteType = ref<'provider' | 'user'>('provider');
const inviteContact = ref('');
const inviteLoading = ref(false);
const showWithdrawModal = ref(false);
const withdrawAmount = ref('');
const showLogoutModal = ref(false);

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const tabs = [
  { key: 'dashboard', label: '总览' },
  { key: 'providers', label: '服务商' },
  { key: 'revenue', label: '收益' },
  { key: 'payout', label: '收款' },
  { key: 'support', label: '工单' }
];

onMounted(async () => {
  // #ifdef MP-WEIXIN
  const menuBtn = uni.getMenuButtonBoundingClientRect();
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 44;
  navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
  capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
  // #endif

  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/index/index' });
    return;
  }

  userInfo.value = getUserInfo();
  await loadData();
});

// Share handler for WeChat Mini Program
onShareAppMessage(() => {
  const referralCode = profile.value?.referral_code;
  const path = `/pages/index/index?register=${inviteType.value}&ref=${referralCode || ''}`;
  console.log('Sharing path:', path);
  return {
    title: inviteType.value === 'provider' 
      ? '加入我们，成为优质服务商！' 
      : '优质家庭服务，一键预约！',
    path: path,
    imageUrl: 'https://via.placeholder.com/500x400?text=Join+Us'
  };
});

onShareTimeline(() => {
  const referralCode = profile.value?.referral_code;
  return {
    title: '加入我们，享受优质服务！',
    query: `register=${inviteType.value}&ref=${referralCode || ''}`
  };
});

const loadData = async () => {
  loading.value = true;
  try {
    const [pRes, cRes, prRes, tRes] = await Promise.all([
      salesApi.getProfile(),
      salesApi.getCommissions(),
      salesApi.getMyProviders(),
      salesApi.getTickets()
    ]);
    profile.value = pRes.profile;
    logs.value = cRes.logs || [];
    providers.value = prRes.providers || [];
    tickets.value = tRes.tickets || [];
  } catch (error: any) {
    console.error('Failed to load dashboard data:', error);
    // uni.showToast({ title: '加载失败', icon: 'none' }); 
    // Suppress error toast for now to check UI first, or check console for real error
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  uni.reLaunch({ url: '/pages/index/index?tab=profile' });
};

const handleLogout = () => {
  showLogoutModal.value = true;
};

const confirmLogout = () => {
  logout();
  uni.reLaunch({ url: '/pages/index/index' });
  showLogoutModal.value = false;
};

const getReferralLink = () => {
  if (!profile.value?.referral_code) return '';
  const baseUrl = 'https://fongbee-v1-h5.vercel.app/#';
  if (inviteType.value === 'user') {
    return `${baseUrl}/pages/index/index?register=user&ref=${profile.value.referral_code}`;
  }
  return `${baseUrl}/pages/index/index?register=provider&ref=${profile.value.referral_code}`;
};

const copyLink = () => {
  const link = getReferralLink();
  // #ifdef H5
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => {
      copied.value = true;
      uni.showToast({ title: '链接已复制', icon: 'success' });
      setTimeout(() => copied.value = false, 2000);
    });
  }
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: link,
    success: () => {
      copied.value = true;
      setTimeout(() => copied.value = false, 2000);
    }
  });
  // #endif
};

const handleInvite = async () => {
  if (!inviteContact.value) {
    uni.showToast({ title: '请输入联系方式', icon: 'none' });
    return;
  }
  inviteLoading.value = true;
  try {
    await salesApi.sendInvite(inviteContact.value, inviteType.value);
    uni.showToast({ title: '邀请发送成功', icon: 'success' });
    inviteContact.value = '';
  } catch (error: any) {
    uni.showToast({ title: error.message || '发送失败', icon: 'none' });
  } finally {
    inviteLoading.value = false;
  }
};

const toggleBonus = async (e: any) => {
  const enabled = e.detail.value;
  const prev = profile.value?.bonus_enabled;
  profile.value = { ...profile.value, bonus_enabled: enabled };
  try {
    await salesApi.updateSettings({ bonus_enabled: enabled });
  } catch (error) {
    uni.showToast({ title: '设置失败', icon: 'none' });
    profile.value = { ...profile.value, bonus_enabled: prev };
  }
};

const handleWithdraw = async () => {
  if (!withdrawAmount.value) {
    uni.showToast({ title: '请输入金额', icon: 'none' });
    return;
  }
  try {
    await salesApi.withdraw({ amount: Number(withdrawAmount.value), method: 'bank', account: 'Default' });
    uni.showToast({ title: '提现申请已提交', icon: 'success' });
    showWithdrawModal.value = false;
    withdrawAmount.value = '';
  } catch (error: any) {
    uni.showToast({ title: error.message || '提现失败', icon: 'none' });
  }
};

// Bank Account Modal
const showBankModal = ref(false);
const savingBank = ref(false);
const bankForm = reactive({
  holderName: '',
  institutionNo: '',
  transitNo: '',
  accountNo: ''
});

const openBankModal = () => {
  bankForm.holderName = '';
  bankForm.institutionNo = '';
  bankForm.transitNo = '';
  bankForm.accountNo = '';
  showBankModal.value = true;
};

const closeBankModal = () => {
  showBankModal.value = false;
};

const saveBankAccount = async () => {
  if (!bankForm.holderName || !bankForm.institutionNo || !bankForm.transitNo || !bankForm.accountNo) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  if (bankForm.institutionNo.length !== 3) {
    uni.showToast({ title: '银行代码需为3位数字', icon: 'none' });
    return;
  }
  if (bankForm.transitNo.length !== 5) {
    uni.showToast({ title: '分行代码需为5位数字', icon: 'none' });
    return;
  }
  if (bankForm.accountNo.length < 7 || bankForm.accountNo.length > 12) {
    uni.showToast({ title: '账号需为7-12位数字', icon: 'none' });
    return;
  }
  
  savingBank.value = true;
  try {
    // TODO: Replace with actual API call when available
    await new Promise(resolve => setTimeout(resolve, 1000));
    uni.showToast({ title: '账户添加成功', icon: 'success' });
    closeBankModal();
  } catch (error: any) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' });
  } finally {
    savingBank.value = false;
  }
};

const goToPaymentMethods = () => {
  openBankModal();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #ecfdf5; /* emerald-50 */
  padding-bottom: 40px;
}

/* Logout Modal */
.logout-modal {
  width: 340px !important;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 32px !important;
}

.logout-icon-wrapper {
  width: 72px;
  height: 72px;
  background-color: #ecfdf5; /* emerald-50 */
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transform: rotate(-10deg);
}

.modal-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

/* Header */
.header-section {
  background: linear-gradient(to right, #10b981, #059669); /* emerald-500 to emerald-600 */
  padding: calc(env(safe-area-inset-top) + 16px) 16px 32px;
  position: relative;
  overflow: hidden;
  color: white;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.decorative-circle {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}

.circle-2 {
  width: 90px;
  height: 90px;
  bottom: 0;
  left: 0;
  transform: translate(-50%, 50%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logout-text {
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.back-btn {
  /* Removed circular background as requested */
  padding: 8px 8px 8px 0; /* Increase touch target */
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  color: white;
  font-size: 24px; /* Larger icon */
  font-weight: bold;
  font-family: sans-serif; /* Cleaner font */
}

.page-title {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.user-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Stats Cards */
.stats-container {
  padding: 0 16px;
  margin-top: -30px;
  position: relative;
  z-index: 10;
}

.stats-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.border-h {
  border-left: 1px solid #f3f4f6;
  border-right: 1px solid #f3f4f6;
}

.stat-label {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
}

.withdraw-link {
  font-size: 10px;
  color: #059669; /* emerald-600 */
  margin-top: 4px;
}

/* Tabs */
.tabs-nav {
  display: flex;
  padding: 0 16px;
  margin-top: 24px;
  gap: 8px;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #4b5563;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.tab-item.active {
  background-color: #059669; /* emerald-600 */
  color: white;
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);
}

/* Content Area */
.content-area {
  padding: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Referral Card */
.referral-card {
  background: linear-gradient(135deg, #059669, #047857); /* emerald-600 to emerald-700 */
  border-radius: 16px;
  padding: 16px;
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
}

.type-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.switch-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 12px;
  font-weight: bold;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.switch-item.active {
  background-color: white;
  color: #059669; /* emerald-600 */
}

.link-box {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  word-break: break-all;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.copy-btn {
  flex: 1;
  background-color: white;
  color: #059669; /* emerald-600 */
  text-align: center;
  padding: 12px 0;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  text-align: center;
  padding: 12px 0;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  line-height: normal;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

button.share-btn::after {
  border: none;
}

.invite-code-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
  font-size: 14px;
}

.code-text {
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 1px;
}

/* Form Cards */
.form-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.card-title-row .title {
  font-size: 16px;
  font-weight: bold;
  color: #111827;
}

.invite-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.invite-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  font-weight: bold;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.invite-tab.active {
  border-color: #10b981; /* emerald-500 */
  background-color: #d1fae5; /* emerald-100 */
  color: #065f46; /* emerald-800 */
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-field {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

.send-btn {
  background-color: #059669; /* emerald-600 */
  color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
}

/* Settings */
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 12px;
}

.setting-info {
  flex: 1;
  padding-right: 16px;
}

.setting-title {
  display: block;
  font-weight: bold;
  color: #111827;
  font-size: 14px;
}

.setting-desc {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.setting-note {
  display: block;
  color: #059669; /* emerald-600 */
  font-size: 12px;
  margin-top: 2px;
}

/* List Styles */
.list-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.list-title {
  display: block;
  font-weight: bold;
  color: #111827;
  margin-bottom: 16px;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: #9ca3af;
  font-size: 14px;
}

.list-item {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.list-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.item-name {
  font-weight: bold;
  color: #111827;
  font-size: 15px;
  display: block;
}

.item-sub {
  font-size: 12px;
  color: #6b7280;
  display: block;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.status-active, .status-resolved {
  background-color: #dcfce7;
  color: #15803d;
}

.status-inactive, .status-open {
  background-color: #fee2e2;
  color: #b91c1c;
}

.item-date, .item-desc {
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-top: 4px;
}

/* Balance & Logs */
.balance-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-label {
  display: block;
  font-size: 14px;
  color: #6b7280;
}

.balance-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #111827;
}

.withdraw-btn {
  background-color: #059669; /* emerald-600 */
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.log-date {
  font-size: 12px;
  color: #9ca3af;
  display: block;
}

.log-detail {
  font-size: 14px;
  color: #374151;
  display: block;
}

.log-amount {
  font-size: 16px;
  font-weight: bold;
  color: #059669; /* emerald-600 */
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  padding: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
  display: block;
  margin-bottom: 16px;
  text-align: center;
}

.modal-field {
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.field-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  box-sizing: border-box;
}

.modal-note {
  background-color: #fefce8;
  color: #854d0e;
  font-size: 12px;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 16px;
  width: 100%;
}

.action-btn {
  flex: 1;
  padding: 16px 0;
  text-align: center;
  font-weight: 800;
  font-size: 15px;
  border-radius: 14px;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.96);
  opacity: 0.8;
}

.action-btn.cancel {
  background-color: #f3f4f6;
  color: #6b7280;
}

.action-btn.confirm {
  background-color: #10b981; /* emerald-500 */
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f3f4f6;
  border-top-color: #059669; /* emerald-600 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Payout Tab Styles */
.add-btn {
  background-color: #10b981;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.bank-card {
  background: linear-gradient(135deg, #f0f9ff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  position: relative;
  margin-bottom: 12px;
}

.bank-icon {
  width: 48px;
  height: 48px;
  background-color: #dbeafe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.bank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bank-name {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
}

.bank-details {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.bank-acct {
  font-size: 14px;
  color: #374151;
  font-family: monospace;
  font-weight: 500;
}

.bank-default {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #dbeafe;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

.payout-note {
  background-color: #eff6ff;
  color: #1e40af;
  font-size: 12px;
  padding: 12px;
  border-radius: 8px;
  line-height: 1.5;
}

/* Bank Account Modal */
.bank-modal {
  background-color: #1f2937;
  border-radius: 24px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  border: 1px solid #374151;
}

.modal-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #374151;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid #4b5563;
}

.input-wrapper .field-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 15px;
}

.save-bank-btn {
  margin-top: 24px;
  background-color: #10b981;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
