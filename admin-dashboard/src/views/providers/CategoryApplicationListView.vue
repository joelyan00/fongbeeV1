<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">服务类型申请审核</h1>
      <el-button @click="fetchApplications" :loading="loading" icon="Refresh">刷新</el-button>
    </div>

    <!-- Application List -->
    <el-card shadow="never" class="border-gray-100">
      <el-table :data="applications" style="width: 100%" v-loading="loading">
        <el-table-column prop="created_at" label="申请时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="申请人" width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-bold">{{ row.user?.name || '未知' }}</span>
              <span class="text-xs text-gray-500">{{ row.user?.email || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="申请类型" width="150" />
        <el-table-column prop="reason" label="申请理由" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center space-x-2">
              <el-button 
                type="primary" 
                size="small" 
                link
                @click="handleView(row)"
              >查看详情</el-button>
              
              <template v-if="row.status === 'pending'">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleReview(row, 'approved')"
                >通过</el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleReview(row, 'rejected')"
                >拒绝</el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="申请详情"
      width="600px"
      destroy-on-close
    >
      <div v-if="selectedApp" class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="item">
            <div class="text-gray-400 text-xs mb-1">申请人</div>
            <div class="font-bold">{{ selectedApp.user?.name }}</div>
          </div>
          <div class="item">
            <div class="text-gray-400 text-xs mb-1">申请服务</div>
            <div class="font-bold text-emerald-600">{{ selectedApp.category }}</div>
          </div>
        </div>

        <div>
          <div class="text-gray-400 text-xs mb-1">申请理由/背景</div>
          <p class="text-gray-700 bg-gray-50 p-3 rounded-lg">{{ selectedApp.reason || '无' }}</p>
        </div>

        <!-- Dynamic Extra Data Display -->
        <div v-if="selectedApp.extra_data && Object.keys(selectedApp.extra_data).length > 0" class="space-y-4 pt-4 border-t border-gray-100">
           <h3 class="font-bold text-sm flex items-center gap-2">
              <el-icon><InfoFilled /></el-icon> 专项资质与信息
           </h3>
           
           <div class="grid grid-cols-2 gap-4">
                <!-- Dynamic Fields from Extra Data -->
                <template v-for="(val, key) in getFilteredExtraData(selectedApp.extra_data)" :key="key">
                    
                    <!-- Array Handling -->
                    <div v-if="Array.isArray(val)" class="col-span-2">
                        <div class="text-gray-400 text-xs mb-1">{{ getFieldLabel(String(key)) }}</div>
                        <!-- Check if array contains images (heuristic: first item is image string) -->
                        <div v-if="val.length > 0 && shouldRenderAsImage(key, val[0])" class="grid grid-cols-3 gap-2">
                            <img 
                                v-for="(img, idx) in val" :key="idx"
                                :src="String(img)" 
                                @click="showImagePreview(String(img))"
                                class="w-full h-32 object-cover rounded shadow-sm cursor-pointer bg-gray-50 border border-gray-100"
                            />
                        </div>
                        <div v-else class="p-2 bg-slate-50 rounded border border-slate-100 text-sm">
                            <div v-for="(item, idx) in val" :key="idx" class="mb-1 last:mb-0">{{ item }}</div>
                        </div>
                    </div>

                    <!-- Single Image Handling -->
                    <div v-else-if="shouldRenderAsImage(key, val)" class="col-span-2">
                        <div class="text-gray-400 text-xs mb-1">{{ getFieldLabel(String(key)) }}</div>
                        <img 
                            v-if="val"
                            :src="String(val)" 
                            @click="showImagePreview(String(val))"
                            class="w-full h-48 object-contain rounded shadow-sm cursor-pointer bg-gray-50 border border-gray-100"
                        />
                    </div>
                    
                    <!-- Text Handling -->
                    <div v-else class="item">
                        <div class="text-gray-400 text-xs mb-1">{{ getFieldLabel(String(key)) }}</div>
                        <div class="p-2 bg-slate-50 rounded border border-slate-100 text-sm break-items break-all max-h-40 overflow-y-auto">
                            {{ val }}
                        </div>
                    </div>
                 </template>
           </div>
        </div>
      </div>
      
      <!-- Dialog Footer -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <template v-if="selectedApp.status === 'pending'">
             <el-button type="danger" @click="handleReview(selectedApp, 'rejected')">拒绝</el-button>
             <el-button type="success" @click="handleReview(selectedApp, 'approved')">通过</el-button>
          </template>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.doc-card {
  @apply bg-white p-2 rounded-lg border border-gray-100;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { providersApi, formTemplatesApi } from '../../services/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const applications = ref<any[]>([])
const detailVisible = ref(false)
const selectedApp = ref<any>({})
const templateMap = ref<Record<string, Record<string, string>>>({}) // category -> { key: label }

const fetchApplications = async () => {
  loading.value = true
  try {
    const res = await providersApi.getServiceTypeApplications()
    applications.value = res.applications || []
  } catch (error) {
    ElMessage.error('Failed to fetch applications')
  } finally {
    loading.value = false
  }
}

const loadFormTemplates = async () => {
    try {
        // Fetch all provider registration templates to build label map
        const res = await formTemplatesApi.getAll({ type: 'provider_reg', includeSteps: true } as any);
        const templates = res.templates || [];
        
        const map: Record<string, Record<string, string>> = {};
        
        templates.forEach(tpl => {
            if (!tpl.category) return;
            if (!map[tpl.category]) map[tpl.category] = {};
            
            // Iterate steps and fields
            if (Array.isArray(tpl.steps)) {
                tpl.steps.forEach((step: any) => {
                    if (Array.isArray(step.fields)) {
                        step.fields.forEach((field: any) => {
                            map[tpl.category][field.key] = field.label;
                        });
                    }
                });
            }
        });
        templateMap.value = map;
    } catch (e) {
        console.error('Failed to load form templates for labels', e);
    }
}

onMounted(() => {
  fetchApplications()
  loadFormTemplates()
})

const handleView = (row: any) => {
  selectedApp.value = row
  detailVisible.value = true
}

const handleReview = async (row: any, status: 'approved' | 'rejected') => {
  const actionText = status === 'approved' ? '通过' : '拒绝'
  let rejectionReason = '';

  try {
    if (status === 'rejected') {
        const { value } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPattern: /\S+/,
            inputErrorMessage: '拒绝理由不能为空',
            type: 'warning',
            customClass: 'rejection-message-box'
        });
        rejectionReason = value;
    } else {
        await ElMessageBox.confirm(
            `确定要${actionText}该申请吗？`, 
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
    }

    loading.value = true
    if (status === 'rejected' && rejectionReason) {
         await providersApi.reviewApplication(row.id, status, rejectionReason)
    } else {
         await providersApi.reviewApplication(row.id, status)
    }

    ElMessage.success(`${actionText}成功`)
    detailVisible.value = false // Close dialog on success
    fetchApplications()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const map: any = {
    pending: 'info',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

// Helper functions for dynamic data display
const getFieldLabel = (key: string) => {
    // 1. Try dynamic map from templates
    const category = selectedApp.value?.category;
    if (category && templateMap.value[category] && templateMap.value[category][key]) {
        return templateMap.value[category][key];
    }

    // 2. Fallback to static map
    const labelMap: Record<string, string> = {
        'car_brand': '车辆品牌',
        'car_model': '车辆型号',
        'car_year': '车辆年份',
        'license_plate': '车牌号',
        'years_experience': '驾驶经验(年)',
        'car_type': '车辆类型',
        'team_size': '团队人数',
        'has_insurance': '是否有商业保险',
        'service_area': '服务范围描述',
        'license_image': '驾照扫描件',
        'insurance_image': '保险证明',
        'registration_image': '车辆登记证',
        'id_card_front': '身份证正面',
        'id_card_back': '身份证背面',
        'police_check': '无犯罪记录证明',
        'truck_count': '货车数量',
        'moving_exp': '搬家经验'
    }
    return labelMap[key] || key;
}

const getFilteredExtraData = (data: any) => {
    if (!data) return {};
    const category = selectedApp.value?.category;
    
    // If no template map loaded for this category, return all data (fallback)
    if (!category || !templateMap.value[category]) {
        return data; 
    }
    
    const validKeys = templateMap.value[category];
    const filtered: any = {};
    
    // Only include keys that are present in the template
    for (const k in data) {
        // Also include keys that look like image keys even if not in template? 
        // Best to rely on template.
        if (validKeys[k]) {
            filtered[k] = data[k];
        }
    }
    
    // If filtering resulted in empty object but data wasn't empty, 
    // it implies template mismatch or old data. 
    // To be safe, if we have a template but data doesn't match keys, 
    // we might want to show nothing (clean) or everything (debug).
    // Let's go with CLEAN: Show nothing if it's dirty data. 
    // Because the user specifically complained about "truck_count" appearing where it shouldn't.
    
    return filtered; 
}

const showImagePreview = (url: string) => {
    // Open in new window or use a modal
    const win = window.open();
    if (win) {
        win.document.write(`<img src="${url}" style="max-width: 100%; height: auto;">`);
    }
}

const shouldRenderAsImage = (key: string | number, val: any) => {
    if (typeof val !== 'string') return false;
    
    // Check Value content first (most reliable for Base64)
    if (val.startsWith('data:image')) return true;
    if (val.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) return true;

    // Check Key naming convention
    const k = String(key).toLowerCase();
    const imageKeywords = ['image', 'photo', 'license', 'cert', 'scan', 'front', 'back', 'pic'];
    // Only trust key if value looks like a URL or very long string (base64) 
    // But be careful not to hide text that happens to be in a field named "license_number"
    
    const isUrlOrBase64 = val.startsWith('http') || val.length > 500; // Heuristic
    
    if (imageKeywords.some(kw => k.includes(kw)) && isUrlOrBase64) {
        return true;
    }

    return false;
}

onMounted(() => {
  fetchApplications()
})
</script>

<style>
.rejection-message-box .el-textarea__inner {
    min-height: 120px !important;
}
</style>
