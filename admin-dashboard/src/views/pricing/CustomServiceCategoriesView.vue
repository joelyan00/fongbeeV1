<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">定制服务类别配置</h2>
        <p class="text-gray-500 text-sm mt-1">配置不同定制服务类别的报价积分消耗</p>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon class="mr-1"><Plus /></el-icon>
        添加类别
      </el-button>
    </div>

    <!-- Categories Table -->
    <el-card shadow="never">
      <el-table :data="categories" v-loading="loading" stripe>
        <el-table-column prop="name" label="类别名称" width="200">
          <template #default="{ row }">
            <div class="font-medium">{{ row.name }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" min-width="300">
          <template #default="{ row }">
            <div class="text-gray-600 text-sm">{{ row.description || '-' }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="quote_credits_cost" label="报价所需积分" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="getCreditTagType(row.quote_credits_cost)" size="large">
              {{ row.quote_credits_cost }} 积分
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="is_active" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              link 
              :type="row.is_active ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogMode === 'add' ? '添加类别' : '编辑类别'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：小型维修" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="描述该类别的服务范围，例如：小额维修服务，如修水龙头、换灯泡等"
          />
        </el-form-item>
        
        <el-form-item label="报价所需积分" prop="quote_credits_cost">
          <el-input-number 
            v-model="form.quote_credits_cost" 
            :min="1" 
            :max="1000"
            :step="5"
          />
          <div class="text-gray-500 text-xs mt-1">
            服务商对此类别的定制服务报价时，将消耗此数量的积分
          </div>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch 
            v-model="form.is_active" 
            active-text="启用" 
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Category {
  id: string;
  name: string;
  description: string;
  quote_credits_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const categories = ref<Category[]>([]);
const formRef = ref<FormInstance>();

const form = reactive({
  id: '',
  name: '',
  description: '',
  quote_credits_cost: 20,
  is_active: true
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入类别名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  quote_credits_cost: [
    { required: true, message: '请设置报价所需积分', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '积分数量在 1 到 1000 之间', trigger: 'blur' }
  ]
};

const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/custom-service-categories`);
    categories.value = response.data.data || [];
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取类别列表失败');
  } finally {
    loading.value = false;
  }
};

const getCreditTagType = (credits: number) => {
  if (credits <= 10) return 'success';
  if (credits <= 30) return 'warning';
  return 'danger';
};

const handleAdd = () => {
  dialogMode.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: Category) => {
  dialogMode.value = 'edit';
  form.id = row.id;
  form.name = row.name;
  form.description = row.description;
  form.quote_credits_cost = row.quote_credits_cost;
  form.is_active = row.is_active;
  dialogVisible.value = true;
};

const handleToggleStatus = async (row: Category) => {
  try {
    const newStatus = !row.is_active;
    await axios.put(
      `${API_BASE_URL}/custom-service-categories/${row.id}`,
      { is_active: newStatus },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    ElMessage.success(`已${newStatus ? '启用' : '禁用'}类别`);
    fetchCategories();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除类别"${row.name}"吗？此操作不可恢复。`,
      '确认删除',
      { type: 'warning' }
    );
    
    await axios.delete(
      `${API_BASE_URL}/custom-service-categories/${row.id}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    
    ElMessage.success('删除成功');
    fetchCategories();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitting.value = true;
    try {
      const payload = {
        name: form.name,
        description: form.description,
        quote_credits_cost: form.quote_credits_cost,
        is_active: form.is_active
      };
      
      if (dialogMode.value === 'add') {
        await axios.post(
          `${API_BASE_URL}/custom-service-categories`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        ElMessage.success('添加成功');
      } else {
        await axios.put(
          `${API_BASE_URL}/custom-service-categories/${form.id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        ElMessage.success('更新成功');
      }
      
      dialogVisible.value = false;
      fetchCategories();
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败');
    } finally {
      submitting.value = false;
    }
  });
};

const resetForm = () => {
  form.id = '';
  form.name = '';
  form.description = '';
  form.quote_credits_cost = 20;
  form.is_active = true;
  formRef.value?.clearValidate();
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.el-table {
  font-size: 14px;
}
</style>
