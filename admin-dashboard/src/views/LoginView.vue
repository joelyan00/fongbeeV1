<template>
  <div class="h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
    <el-card class="w-96 shadow-xl rounded-2xl border-0">
      <template #header>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-800 mb-1">管理后台</div>
          <div class="text-sm text-gray-500">优福家家政服务平台</div>
        </div>
      </template>
      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="请输入管理员邮箱"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password"
            type="password" 
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button 
          type="primary" 
          class="w-full mt-4" 
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form>
      <div class="mt-4 text-center text-xs text-gray-400">
        提示：使用 admin@youfujia.com 和任意密码登录
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { authApi } from '../services/api'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  email: 'admin@youfujia.com',
  password: 'admin123'
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      // Use generic login to support both Admin and Provider
      const response = await authApi.login(form.email, form.password)
      
      const user = response.user
      if (user.role !== 'admin' && user.role !== 'provider') {
        throw new Error('此账号无权访问管理后台')
      }
      
      // Save token and user info
      localStorage.setItem('admin_token', response.token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      
      ElMessage.success('登录成功')
      
      if (user.role === 'provider') {
        router.push('/provider')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请检查账号密码')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.el-card {
  --el-card-padding: 30px;
}
</style>
