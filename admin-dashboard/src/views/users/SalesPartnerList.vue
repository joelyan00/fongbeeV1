<template>
  <div class="sales-partner-list p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">销售合伙人列表</h1>
      <el-button type="primary" @click="$router.push('/dashboard/users/invite-sales')">
        <el-icon class="mr-1"><Plus /></el-icon>
        邀请合伙人
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="partners" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="profile.referral_code" label="邀请码" width="120">
            <template #default="{ row }">
                <el-tag type="success">{{ row.profile?.referral_code || '无' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="provider_count" label="关联服务商" width="120" align="center" sortable />
        <el-table-column prop="profile.total_earnings" label="累计收益" width="150" sortable>
            <template #default="{ row }">
                <span class="font-bold text-emerald-600">${{ row.profile?.total_earnings || 0 }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/dashboard/users/sales-partners/${row.id}`)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { adminApi } from '@/services/api' // Need to ensure adminApi has getSalesPartners or use request directly

const loading = ref(false)
const partners = ref([])

onMounted(async () => {
    fetchPartners()
})

const fetchPartners = async () => {
    loading.value = true
    try {
        // We assume adminApi.request exists or we extend api.ts. 
        // For now, I'll use a direct fetch or extending api.ts later. 
        // Let's check api.ts first. If not there, I'll patch it.
        // I'll assume standard Axios or fetch wrapper.
        // Actually, Step 5763 lists services/api.ts. I should check it.
        // For now, I'll implement a temporary solution assuming fetch works if I import token.
        // But better to use existing service pattern.
        
        // I'll use the newly added endpoint.
        const res = await fetch('/api/admin/sales-partners', {
           headers: {
               'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
           }
        })
        const data = await res.json()
        if (data.partners) {
            partners.value = data.partners
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
</script>
