<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">系统设置</h1>
      <p class="text-gray-500 mt-1">配置平台基本设置</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- General Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">基本设置</h3>
          <el-form :model="settings" label-width="120px">
            <el-form-item label="平台名称">
              <el-input v-model="settings.siteName" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="settings.phone" />
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="settings.email" />
            </el-form-item>
            <el-form-item label="服务区域">
              <el-input v-model="settings.serviceArea" type="textarea" rows="2" />
            </el-form-item>
          </el-form>
        </div>

        <!-- Commission Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">💰 佣金与支付设置</h3>
          <el-form :model="commissionSettings" label-width="180px">
            <el-form-item label="定金比例">
              <el-input-number v-model="commissionSettings.deposit_ratio" :min="20" :max="100" />
              <span class="text-gray-400 text-sm ml-2">% (最低20%)</span>
            </el-form-item>
            <el-form-item label="平台佣金(有合伙人)">
              <el-input-number v-model="commissionSettings.platform_commission_with_partner" :min="3" :max="50" />
              <span class="text-gray-400 text-sm ml-2">%</span>
            </el-form-item>
            <el-form-item label="平台佣金(无合伙人)">
              <el-input-number v-model="commissionSettings.platform_commission_no_partner" :min="3" :max="50" />
              <span class="text-gray-400 text-sm ml-2">%</span>
            </el-form-item>
            <el-form-item label="销售合伙人佣金">
              <el-input-number v-model="commissionSettings.sales_partner_commission" :min="0" :max="30" />
              <span class="text-gray-400 text-sm ml-2">%</span>
            </el-form-item>
            <el-form-item label="自动确认时间">
              <el-input-number v-model="commissionSettings.auto_complete_hours" :min="1" :max="168" />
              <span class="text-gray-400 text-sm ml-2">小时 (用户无响应后自动完成)</span>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="saveCommissionSettings" :loading="savingCommission">
            保存佣金设置
          </el-button>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">通知设置</h3>
          <el-form :model="settings" label-width="120px">
            <el-form-item label="新需求提醒">
              <el-switch v-model="settings.notifyNewRequest" />
              <span class="text-gray-400 text-sm ml-2">有新需求时发送邮件通知</span>
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch v-model="settings.smsNotify" />
              <span class="text-gray-400 text-sm ml-2">启用短信通知功能</span>
            </el-form-item>
            <el-form-item label="微信通知">
              <el-switch v-model="settings.wechatNotify" />
              <span class="text-gray-400 text-sm ml-2">通过微信公众号推送通知</span>
            </el-form-item>
          </el-form>
        </div>

        <!-- Account Security -->
        <ChangePasswordForm />
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Stats -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">系统信息</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">系统版本</span>
              <span class="text-gray-800">v1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">最后更新</span>
              <span class="text-gray-800">2024-12-17</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">数据库状态</span>
              <el-tag type="success" size="small">正常</el-tag>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">存储空间</span>
              <span class="text-gray-800">12.5 GB / 50 GB</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">操作</h3>
          <div class="space-y-3">
            <el-button type="primary" class="w-full" @click="saveSettings" :loading="savingSettings">保存设置</el-button>
            <el-button class="w-full" @click="clearCache">清除缓存</el-button>
            <el-button class="w-full" @click="backupData">备份数据</el-button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 rounded-xl border border-red-100 p-6">
          <h3 class="text-lg font-bold text-red-800 mb-4">⚠️ 危险操作</h3>
          <p class="text-sm text-red-600 mb-4">以下操作不可逆，请谨慎执行</p>
          <el-button type="danger" class="w-full" plain @click="resetData">重置所有数据</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ChangePasswordForm from '../../components/ChangePasswordForm.vue'
import { api } from '@/services/api'

const settings = reactive({
  siteName: '优服佳',
  phone: '1-888-888-8888',
  email: 'support@youfujia.com',
  serviceArea: 'Greater Toronto Area (GTA), including Toronto, Markham, Richmond Hill, Vaughan, Mississauga, etc.',
  notifyNewRequest: true,
  smsNotify: false,
  wechatNotify: true
})

const savingSettings = ref(false)

const commissionSettings = reactive({
  deposit_ratio: 20,
  platform_commission_with_partner: 5,
  platform_commission_no_partner: 10,
  sales_partner_commission: 5,
  auto_complete_hours: 48
})

const savingCommission = ref(false)

onMounted(async () => {
  try {
    const res = await api.get('/system-settings')
    if (res.data.success && res.data.settings) {
      const s = res.data.settings
      // General settings
      if (s.site_name) settings.siteName = s.site_name
      if (s.site_phone) settings.phone = s.site_phone
      if (s.site_email) settings.email = s.site_email
      if (s.service_area) settings.serviceArea = s.service_area
      if (s.notify_new_request) settings.notifyNewRequest = s.notify_new_request === 'true'
      if (s.sms_notify) settings.smsNotify = s.sms_notify === 'true'
      if (s.wechat_notify) settings.wechatNotify = s.wechat_notify === 'true'

      // Commission settings
      if (s.deposit_ratio) commissionSettings.deposit_ratio = parseInt(s.deposit_ratio)
      if (s.platform_commission_with_partner) commissionSettings.platform_commission_with_partner = parseInt(s.platform_commission_with_partner)
      if (s.platform_commission_no_partner) commissionSettings.platform_commission_no_partner = parseInt(s.platform_commission_no_partner)
      if (s.sales_partner_commission) commissionSettings.sales_partner_commission = parseInt(s.sales_partner_commission)
      if (s.auto_complete_hours) commissionSettings.auto_complete_hours = parseInt(s.auto_complete_hours)
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
})

const saveCommissionSettings = async () => {
  savingCommission.value = true
  try {
    await api.post('/system-settings', {
      settings: [
        { key: 'deposit_ratio', value: String(commissionSettings.deposit_ratio) },
        { key: 'platform_commission_with_partner', value: String(commissionSettings.platform_commission_with_partner) },
        { key: 'platform_commission_no_partner', value: String(commissionSettings.platform_commission_no_partner) },
        { key: 'sales_partner_commission', value: String(commissionSettings.sales_partner_commission) },
        { key: 'auto_complete_hours', value: String(commissionSettings.auto_complete_hours) }
      ]
    })
    ElMessage.success('佣金设置保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    savingCommission.value = false
  }
}

const saveSettings = async () => {
  savingSettings.value = true
  try {
    await api.post('/system-settings', {
      settings: [
        { key: 'site_name', value: settings.siteName },
        { key: 'site_phone', value: settings.phone },
        { key: 'site_email', value: settings.email },
        { key: 'service_area', value: settings.serviceArea },
        { key: 'notify_new_request', value: String(settings.notifyNewRequest) },
        { key: 'sms_notify', value: String(settings.smsNotify) },
        { key: 'wechat_notify', value: String(settings.wechatNotify) }
      ]
    })
    ElMessage.success('系统设置保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    savingSettings.value = false
  }
}

const clearCache = () => {
  ElMessage.success('缓存已清除')
}

const backupData = () => {
  ElMessage.info('正在备份数据...')
}

const resetData = () => {
  ElMessageBox.confirm('此操作将删除所有数据，是否继续？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.warning('功能已禁用')
  })
}
</script>

