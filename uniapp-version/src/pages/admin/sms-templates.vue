<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <view class="bg-blue-600 px-4 pt-12 pb-6">
      <view class="flex flex-row items-center gap-2 mb-4">
        <view class="w-8 h-8 flex items-center justify-center bg-white-20 rounded-lg" @click="handleBack">
            <AppIcon name="arrow-left" :size="20" color="#fff"/>
        </view>
        <text class="text-white text-lg font-bold">短信模板配置</text>
      </view>
      <text class="text-blue-100 text-sm">管理和配置发送给用户的短信内容</text>
    </view>

    <!-- Templates List -->
    <view class="px-4 -mt-4">
        <view class="space-y-4">
            <view 
                v-for="tmpl in templates" 
                :key="tmpl.id"
                class="bg-white rounded-xl p-4 shadow-sm active-bg-gray-50"
                @click="openEditModal(tmpl)"
            >
                <view class="flex flex-row justify-between items-center mb-2">
                    <text class="text-base font-bold text-gray-900">{{ tmpl.name }}</text>
                    <text class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono">{{ tmpl.key }}</text>
                </view>
                <text class="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">{{ tmpl.content }}</text>
                
                <view class="pt-2 border-t border-gray-100 flex flex-row justify-between items-center">
                    <text class="text-xs text-gray-400">{{ tmpl.description }}</text>
                    <view class="flex flex-row items-center">
                        <AppIcon name="edit" :size="14" class="text-blue-500 mr-1"/>
                        <text class="text-xs text-blue-500 font-medium">编辑</text>
                    </view>
                </view>
            </view>
        </view>
    </view>

    <!-- Edit Modal -->
    <view v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black-40">
        <view class="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-scale-in">
            <view class="flex flex-row justify-between items-center mb-4">
                <text class="text-lg font-bold text-gray-900">编辑模板</text>
                <view @click="closeModal" class="p-2 -mr-2 text-gray-400">
                    <AppIcon name="close" :size="20"/>
                </view>
            </view>

            <view class="mb-4">
                <text class="text-sm font-bold text-gray-700 block mb-1">模板名称</text>
                <text class="text-gray-900 bg-gray-50 p-2 rounded block">{{ editingTemplate?.name }}</text>
            </view>

            <view class="mb-4">
                <text class="text-sm font-bold text-gray-700 block mb-2">短信内容</text>
                <textarea 
                    v-model="editForm.content"
                    class="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 leading-relaxed mb-2"
                    placeholder="请输入短信内容"
                ></textarea>
                
                <!-- Variables Hint -->
                <view class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <text class="text-xs text-blue-800 font-bold mb-1 block">可用变量 (点击复制):</text>
                    <view class="flex flex-row flex-wrap gap-2">
                        <text 
                            v-for="v in editingTemplate?.variables || []" 
                            :key="v"
                            class="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-200"
                            @click="insertVariable(v)"
                        >
                            {{ `{{${v}}}` }}
                        </text>
                    </view>
                </view>
            </view>

            <view class="flex flex-row gap-3 mt-6">
                <button 
                    class="flex-1 h-10 bg-gray-100 text-gray-600 font-medium rounded-lg flex items-center justify-center text-sm"
                    @click="closeModal"
                >取消</button>
                <button 
                    class="flex-1 h-10 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-200"
                    @click="saveTemplate"
                >
                    保存修改
                </button>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { smsTemplatesApi } from '@/services/api';

const templates = ref<any[]>([]);
const showModal = ref(false);
const editingTemplate = ref<any>(null);
const editForm = ref({ content: '' });

onMounted(() => {
    loadTemplates();
});

const loadTemplates = async () => {
    try {
        uni.showLoading({ title: '加载中...' });
        const res = await smsTemplatesApi.getAll();
        templates.value = res.templates;
        uni.hideLoading();
    } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '加载失败', icon: 'none' });
    }
};

const handleBack = () => {
    uni.navigateBack();
};

const openEditModal = (tmpl: any) => {
    editingTemplate.value = tmpl;
    editForm.value.content = tmpl.content;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingTemplate.value = null;
};

const insertVariable = (v: string) => {
    editForm.value.content += `{{${v}}}`;
};

const saveTemplate = async () => {
    if (!editingTemplate.value) return;
    
    uni.showLoading({ title: '保存中...' });
    try {
        await smsTemplatesApi.update(editingTemplate.value.id, {
            content: editForm.value.content
        });
        
        uni.hideLoading();
        uni.showToast({ title: '保存成功', icon: 'success' });
        closeModal();
        loadTemplates(); // Refresh list
    } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '保存失败', icon: 'none' });
    }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-blue-600 { background-color: #2563eb; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-blue-100 { background-color: #dbeafe; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-white { background-color: #ffffff; }
.bg-white-20 { background-color: rgba(255,255,255,0.2); }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-black-40 { background-color: rgba(0,0,0,0.4); }

.text-white { color: #ffffff; }
.text-blue-100 { color: #dbeafe; }
.text-blue-500 { color: #3b82f6; }
.text-blue-600 { color: #2563eb; }
.text-blue-800 { color: #1e40af; }
.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-mono { font-family: monospace; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.leading-relaxed { line-height: 1.6; }

.p-2 { padding: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.pt-2 { padding-top: 8px; }
.pt-12 { padding-top: 48px; }
.pb-6 { padding-bottom: 24px; }
.pb-10 { padding-bottom: 40px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.-mt-4 { margin-top: -16px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mr-1 { margin-right: 4px; }
.-mr-2 { margin-right: -8px; }

.w-8 { width: 32px; }
.h-8 { height: 32px; }
.h-10 { height: 40px; }
.h-32 { height: 128px; }
.w-full { width: 100%; }
.max-w-lg { max-width: 32rem; }

.rounded { border-radius: 4px; }
.rounded-lg { border-radius: 8px; }
.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }

.border { border-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-blue-100 { border-color: #dbeafe; }
.border-blue-200 { border-color: #bfdbfe; }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.space-y-4 > view + view { margin-top: 16px; }

.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-50 { z-index: 50; }
.block { display: block; }
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.active-bg-gray-50:active { background-color: #f9fafb; }
.animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
</style>
