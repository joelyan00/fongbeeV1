<template>
  <view 
    v-if="modelValue" 
    class="modal-overlay" 
    :class="{ 'show': modelValue }"
    @click="handleBackdropClick"
  >
    <view class="modal-container" @click.stop>
      <!-- Close Button -->
      <view v-if="showClose" class="modal-close" @click="handleCancel">
        <AppIcon name="x" :size="20" color="#9ca3af" />
      </view>

      <!-- Icon/Header Section -->
      <view v-if="icon || title" class="modal-header">
        <view v-if="icon" class="icon-wrap" :style="{ backgroundColor: iconBgColor }">
          <AppIcon :name="icon" :size="28" :color="iconColor" />
        </view>
        <text v-if="title" class="modal-title">{{ title }}</text>
      </view>

      <!-- Content Section -->
      <view class="modal-body">
        <slot>
          <text class="modal-content-text">{{ content }}</text>
        </slot>
      </view>

      <!-- Footer Action Section -->
      <view class="modal-footer" :class="{ 'vertical': verticalButtons }">
        <view 
          v-if="showCancel" 
          class="modal-btn btn-cancel" 
          @click="handleCancel"
        >
          <text class="btn-text">{{ cancelText }}</text>
        </view>
        <view 
          class="modal-btn btn-confirm" 
          :class="{ 'btn-loading': loading, 'btn-disabled': disabled }"
          @click="handleConfirm"
        >
          <view v-if="loading" class="loading-spinner"></view>
          <text v-else class="btn-text">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from './Icons.vue';

interface Props {
  modelValue: boolean;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showClose?: boolean;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  loading?: boolean;
  disabled?: boolean;
  verticalButtons?: boolean;
  closeOnClickOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  showClose: true,
  iconColor: '#10b981',
  iconBgColor: 'rgba(16, 185, 129, 0.1)',
  closeOnClickOverlay: true
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const handleBackdropClick = () => {
  if (props.closeOnClickOverlay) {
    handleCancel();
  }
};

const handleCancel = () => {
  if (props.loading) return;
  emit('update:modelValue', false);
  emit('cancel');
};

const handleConfirm = () => {
  if (props.loading || props.disabled) return;
  emit('confirm');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.modal-container {
  width: 85%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transform: scale(0.9);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-overlay.show .modal-container {
  transform: scale(1);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px;
  z-index: 10;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.modal-body {
  margin-bottom: 28px;
}

.modal-content-text {
  font-size: 15px;
  color: #4b5563;
  text-align: center;
  line-height: 1.6;
  display: block;
}

.modal-footer {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.modal-footer.vertical {
  flex-direction: column;
}

.modal-btn {
  flex: 1;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  line-height: normal;
}

.modal-btn:active {
  transform: scale(0.96);
  opacity: 0.9;
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-confirm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.btn-loading {
  pointer-events: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
