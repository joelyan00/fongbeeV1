<template>
  <div class="p-6">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">控制台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/dashboard/contracts' }">合同管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ isNew ? '新建合同' : '编辑合同' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <el-form :model="form" label-width="100px" label-position="top">
        <el-form-item label="合同名称" required>
          <el-input v-model="form.name" placeholder="请输入合同名称" />
        </el-form-item>
        
        <el-form-item label="合同内容 (支持 HTML)" required>
          <el-input 
            v-model="form.content" 
            type="textarea" 
            rows="20" 
            placeholder="请输入合同内容 HTML" 
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button label="draft">草稿</el-radio-button>
            <el-radio-button label="published">已发布</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="flex gap-4 mt-6">
          <el-button type="primary" :loading="saving" @click="saveContract">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { contractsApi } from '../../services/api'

const route = useRoute()
const router = useRouter()
const saving = ref(false)

const id = computed(() => route.params.id as string)
const isNew = computed(() => id.value === 'new')

const form = reactive({
  name: '',
  content: '',
  status: 'draft'
})

onMounted(async () => {
  if (!isNew.value) {
    try {
      const res = await contractsApi.getById(id.value)
      const data = res.template
      form.name = data.name
      form.content = data.content
      form.status = data.status
    } catch (error: any) {
      ElMessage.error('加载详情失败')
      router.back()
    }
  }
})

const saveContract = async () => {
  if (!form.name || !form.content) {
    ElMessage.warning('请填写完整信息')
    return
  }

  saving.value = true
  try {
    if (isNew.value) {
      await contractsApi.create(form)
      ElMessage.success('创建成功')
    } else {
      await contractsApi.update(id.value, form)
      ElMessage.success('更新成功')
    }
    router.push('/dashboard/contracts')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
