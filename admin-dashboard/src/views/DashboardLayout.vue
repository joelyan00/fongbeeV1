<template>
  <el-container class="h-screen">
    <el-aside width="220px" class="bg-slate-800 text-white flex flex-col">
      <div class="h-16 flex items-center justify-center font-bold text-xl border-b border-slate-700">
        Fongbee/优服佳后台
      </div>
      <el-menu
        class="border-r-0 bg-slate-800 text-white flex-1"
        :router="true"
        :default-active="currentRoute"
        text-color="#94a3b8"
        active-text-color="#fff"
        background-color="#1e293b"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <el-sub-menu index="requests">
          <template #title>
            <el-icon><List /></el-icon>
            <span>需求管理</span>
          </template>
          <el-menu-item index="/dashboard/requests">全部需求</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="providers">
          <template #title>
            <el-icon><User /></el-icon>
            <span>服务商管理</span>
          </template>
          <el-menu-item index="/dashboard/providers">服务商列表</el-menu-item>
          <el-menu-item index="/dashboard/providers/applications">服务类型申请</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="users">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/dashboard/users">用户列表</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/dashboard/finance">
          <el-icon><Money /></el-icon>
          <span>财务管理</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/banners">
          <el-icon><Picture /></el-icon>
          <span>广告设置</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/sms-templates">
          <el-icon><Message /></el-icon>
          <span>短信配置</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/cms">
          <el-icon><Notebook /></el-icon>
          <span>内容管理</span>
        </el-menu-item>

        <el-sub-menu index="forms">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>表单管理</span>
          </template>
          <el-menu-item index="/dashboard/forms">表单模板</el-menu-item>
          <el-menu-item index="/dashboard/categories">
            <el-icon><Grid /></el-icon>
            <span>服务分类</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="sys">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/dashboard/settings">系统配置</el-menu-item>
          <el-menu-item index="/dashboard/cities">城市管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div class="text-gray-500">欢迎回来, {{ adminName }}</div>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link flex items-center cursor-pointer">
            {{ adminName }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">个人设置</el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon class="mr-1"><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      
      <el-main class="bg-gray-50">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Odometer, Document, List, ArrowDown, User, UserFilled, Setting, SwitchButton, Grid, Money, Picture, Message, Notebook } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.path)

// Get admin name from localStorage
const adminName = computed(() => {
  try {
    const userStr = localStorage.getItem('admin_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.name || '管理员'
    }
  } catch {
    // ignore
  }
  return '管理员'
})

// Handle dropdown commands
const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'settings') {
    router.push('/dashboard/settings')
  }
}

// Logout function
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '确认退出', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // Clear stored data
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    
    ElMessage.success('已退出登录')
    
    // Redirect to login page
    router.push('/login')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
:deep(.el-menu) {
  border-right: none;
}
</style>

