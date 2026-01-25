<template>
  <view v-if="visible" class="modal-mask" @click.stop="handleClose" @touchmove.stop.prevent="">
    <view class="modal-wrapper" @click.stop>
      <view class="modal-content">
        <!-- Icon Section -->
        <view v-if="icon" class="icon-container" :style="{ backgroundColor: iconBgColor || '#F8FAFC' }">
          <AppIcon :name="icon" :size="32" :color="iconColor || '#3D8E63'" />
        </view>

        <!-- Text Section -->
        <view class="text-container">
          <text class="modal-title">{{ title }}</text>
          <text class="modal-message">{{ message }}</text>
        </view>

        <!-- Input Section (Optional) -->
        <view v-if="showInput" class="input-container mt-4">
          <textarea 
            v-model="inputValue" 
            class="modal-input" 
            :placeholder="placeholder" 
            auto-height 
          />
        </view>

        <!-- Actions Section -->
        <view class="actions-container">
          <button class="action-btn cancel-btn" @click="handleCancel">
            {{ cancelText || '取消' }}
          </button>
          <button 
            class="action-btn confirm-btn" 
            :style="{ background: confirmBg || 'linear-gradient(135deg, #3D8E63 0%, #2D6A4F 100%)' }"
            @click="handleConfirm"
          >
            {{ confirmText || '确认' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import AppIcon from './Icons.vue';

const props = defineProps<{
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmBg?: string;
  showInput?: boolean;
  placeholder?: string;
  defaultValue?: string;
}>();

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const inputValue = ref('');

watch(() => props.defaultValue, (val) => {
  inputValue.value = val || '';
}, { immediate: true });

const handleClose = () => {
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('cancel');
  handleClose();
};

const handleConfirm = () => {
  emit('confirm', props.showInput ? inputValue.value : null);
  handleClose();
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
}

.modal-wrapper {
  width: 100%;
  max-width: 320px;
  background-color: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-content {
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-container {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 28px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.modal-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.input-container {
  width: 100%;
  margin-bottom: 24px;
}

.modal-input {
  width: 100%;
  min-height: 60px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  color: #1e293b;
}

.actions-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: transform 0.2s;
}

.action-btn:active {
  transform: scale(0.96);
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.confirm-btn {
  color: #ffffff;
}

.mt-4 { margin-top: 16px; }
.mt-3 { margin-top: 12px; }
</style>
