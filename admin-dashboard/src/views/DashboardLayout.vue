<template>
  <el-container class="h-screen">
    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarOpen && isMobile" 
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <el-aside 
      :width="sidebarWidth" 
      :class="['sidebar', { 'sidebar-open': sidebarOpen, 'sidebar-mobile': isMobile }]"
    >
      <div class="sidebar-header">
        <span class="sidebar-title">{{ isProvider ? '优服佳/服务商' : '优服佳/后台' }}</span>
        <el-icon v-if="isMobile" class="close-btn" @click="sidebarOpen = false"><Close /></el-icon>
      </div>
      <el-menu
        class="sidebar-menu"
        :router="true"
        :default-active="currentRoute"
        text-color="#94a3b8"
        active-text-color="#fff"
        background-color="#1e293b"
        :collapse="isCollapsed && !isMobile"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <!-- Standard Service Management -->
        <el-sub-menu index="standard">
           <template #title>
             <el-icon><Box /></el-icon>
             <span>标准服务管理</span>
           </template>
           <el-menu-item index="/dashboard/standard/lifecycle">服务生命周期</el-menu-item>
           <el-menu-item index="/dashboard/standard/orders">标准服务订单</el-menu-item> 
           <el-menu-item index="/dashboard/standard/listing-applications">服务申请上架</el-menu-item>
           <el-menu-item index="/dashboard/providers/applications">服务类型申请</el-menu-item>
        </el-sub-menu>

        <!-- Custom Service Management -->
        <el-sub-menu index="custom">
           <template #title>
             <el-icon><List /></el-icon>
             <span>定制服务管理</span>
           </template>
           <el-menu-item index="/dashboard/requests">定制服务需求</el-menu-item>
        </el-sub-menu>

        <!-- 入驻管理 -->
        <el-sub-menu index="onboarding">
          <template #title>
            <el-icon><Coordinate /></el-icon>
            <span>入驻管理</span>
          </template>
          <el-menu-item index="/dashboard/forms">入驻申请表单</el-menu-item>
        </el-sub-menu>

        <!-- 服务模版管理 -->
        <el-sub-menu index="blueprints">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>服务模版管理</span>
          </template>
          <el-menu-item index="/dashboard/blueprints?category=standard_service">标准服务模版</el-menu-item>
          <el-menu-item index="/dashboard/blueprints?category=simple_custom">简单定制模版</el-menu-item>
          <el-menu-item index="/dashboard/blueprints?category=complex_custom">复杂定制模版</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/dashboard/contracts">
            <el-icon><Document /></el-icon>
            <span>合同模板</span>
        </el-menu-item>

        <el-sub-menu index="users">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/dashboard/users/sales-partners">销售合伙人</el-menu-item>
          <el-menu-item index="/dashboard/users">用户列表</el-menu-item>
          <el-menu-item index="/dashboard/users/invite-sales">销售邀请</el-menu-item>
          <el-menu-item index="/dashboard/providers">服务商列表</el-menu-item>
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

        <el-menu-item index="/dashboard/email-templates">
          <el-icon><Message /></el-icon>
          <span>邮件配置</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/cms">
          <el-icon><Notebook /></el-icon>
          <span>内容管理</span>
        </el-menu-item>

        <el-sub-menu index="sys">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/dashboard/settings">系统配置</el-menu-item>
          <el-menu-item index="/dashboard/cities">城市管理</el-menu-item>
          <el-menu-item index="/dashboard/categories">服务分类</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <el-icon class="menu-toggle" @click="toggleSidebar"><Fold v-if="sidebarOpen && !isMobile" /><Expand v-else /></el-icon>
          <span class="welcome-text">欢迎回来, {{ adminName }}</span>
        </div>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
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
      
      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Odometer, Document, List, ArrowDown, UserFilled, Setting, SwitchButton, Money, Picture, Message, Notebook, Box, Fold, Expand, Close, Coordinate } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// Responsive state
const windowWidth = ref(window.innerWidth)
const sidebarOpen = ref(window.innerWidth >= 768)
const isCollapsed = ref(false)

const isMobile = computed(() => windowWidth.value < 768)
const sidebarWidth = computed(() => {
  if (isMobile.value) return '260px'
  if (isCollapsed.value) return '64px'
  return '220px'
})

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 768) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const toggleSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    isCollapsed.value = !isCollapsed.value
  }
}

const currentRoute = computed(() => route.path)

// Get user info and role
const userInfo = computed(() => {
  try {
    const userStr = localStorage.getItem('admin_user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
})

const isProvider = computed(() => userInfo.value?.role === 'provider')
const adminName = computed(() => userInfo.value?.name || (isProvider.value ? '服务商' : '管理员'))

// Handle dropdown commands
const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'settings') {
    router.push('/dashboard/settings')
  } else if (command === 'provider_mode') {
    router.push('/provider')
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
    
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.sidebar {
  background-color: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: 100;
}

.sidebar-mobile {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  transform: translateX(-100%);
}

.sidebar-mobile.sidebar-open {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid #334155;
}

.sidebar-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  cursor: pointer;
  font-size: 20px;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}

.main-container {
  flex: 1;
  min-width: 0;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.menu-toggle:hover {
  color: #1f2937;
}

.welcome-text {
  color: #6b7280;
  font-size: 14px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #374151;
  font-size: 14px;
}

.main-content {
  background-color: #f9fafb;
  overflow-y: auto;
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .welcome-text {
    display: none;
  }
  
  .header {
    padding: 0 12px;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-card) {
    margin-bottom: 12px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 13px;
  }
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu--collapse .el-sub-menu__title span),
:deep(.el-menu--collapse .el-menu-item span) {
  display: none;
}
</style>
