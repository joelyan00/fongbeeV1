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

        <!-- Payment Settings -->
        <!-- Payment Settings (Moved to Finance View) -->
        <!--
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">支付设置</h3>
          <el-form :model="settings" label-width="120px">
            <el-form-item label="平台佣金">
              <el-input-number v-model="settings.commission" :min="0" :max="100" />
              <span class="text-gray-400 text-sm ml-2">% (每笔订单抽成比例)</span>
            </el-form-item>
            <el-form-item label="最低提现">
              <el-input-number v-model="settings.minWithdraw" :min="0" />
              <span class="text-gray-400 text-sm ml-2">CAD</span>
            </el-form-item>
          </el-form>
        </div>
        -->
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
            <el-button type="primary" class="w-full" @click="saveSettings">保存设置</el-button>
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
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const settings = reactive({
  siteName: '优服佳',
  phone: '1-888-888-8888',
  email: 'support@youfujia.com',
  serviceArea: 'Greater Toronto Area (GTA), including Toronto, Markham, Richmond Hill, Vaughan, Mississauga, etc.',
  notifyNewRequest: true,
  smsNotify: false,
  wechatNotify: true,
  commission: 10,
  minWithdraw: 100
})

const saveSettings = () => {
  ElMessage.success('设置保存成功')
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
