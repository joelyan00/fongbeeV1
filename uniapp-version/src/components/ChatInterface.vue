<template>
  <view class="ai-chat-overlay flex flex-col pt-custom">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between shadow-sm border-b border-gray-100">
      <view class="flex flex-row items-center gap-2">
        <view class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
          <text style="font-size: 22px;">🤖</text>
        </view>
        <view>
          <text class="font-bold text-gray-900 text-lg block">智能服务助手</text>
          <text class="text-sm text-gray-500 block">AI 智能推荐 • 仅供参考</text>
        </view>
      </view>
      <view @click="emit('close')" class="p-2 bg-gray-100 rounded-full hover-bg-gray-200 transition-colors">
        <text class="text-gray-600" style="font-size: 20px;">✖️</text>
      </view>
    </view>

    <!-- Messages -->
    <scroll-view 
      scroll-y 
      class="flex-1 bg-msg-container p-4 box-border overflow-hidden" 
      :scroll-into-view="scrollTarget"
      style="height: 0; flex-grow: 1;"
    >
      <view class="space-y-4 pb-4">
        <view 
          v-for="msg in messages" 
          :key="msg.id" 
          :id="'msg-' + msg.id"
          class="flex flex-row w-full mb-4"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
           <view v-if="msg.role === 'model'" class="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white mr-2 shrink-0 mt-1">
              <text style="font-size: 16px;">🤖</text>
           </view>
          
          <view 
            class="max-w-80-pct px-4 py-3 rounded-2xl text-base leading-relaxed shadow-sm"
            :class="msg.role === 'user' ? 'bg-black text-white rounded-tr-sm' : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'"
          >
            <text>{{ msg.text }}</text>
          </view>
          
           <view v-if="msg.role === 'user'" class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 ml-2 shrink-0 mt-1">
              <text style="font-size: 16px;">👤</text>
           </view>
        </view>

        <view v-if="isLoading" id="msg-loading" class="flex flex-row justify-start mb-4">
          <view class="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white mr-2">
             <text style="font-size: 16px;">🤖</text>
          </view>
          <view class="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex flex-row items-center gap-1-5 h-10">
             <!-- Simple loading dots simulation -->
             <text class="text-gray-400">...</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Input Area -->
    <view class="bg-white px-4 py-3 border-t border-gray-100 chat-input-area">
      <view class="flex flex-row items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
        <input
          type="text"
          class="flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder-gray-400 h-6"
          placeholder="请描述您的需求..."
          v-model="input"
          confirm-type="send"
          @confirm="handleSend"
        />
        <view 
          @click="handleSend"
          class="p-2-5 rounded-full transition-colors flex items-center justify-center"
          :class="input.trim() ? 'bg-black text-white' : 'bg-gray-300 text-gray-500'"
        >
          <text style="font-size: 16px;">📤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { generateRepairAdvice } from '@/services/geminiService';
import type { ChatMessage } from '@/types';

const emit = defineEmits(['close']);

const messages = ref<ChatMessage[]>([
  { id: '1', role: 'model', text: '你好！我是优服佳智能助手。您可以告诉我您的需求，比如“家里水管漏了”或“想找人剪头发”，我会为您推荐合适的服务并预估价格。' }
]);
const input = ref('');
const isLoading = ref(false);
const scrollTarget = ref('');

const scrollToBottom = () => {
  nextTick(() => {
    if (isLoading.value) {
        scrollTarget.value = 'msg-loading';
    } else {
        const lastMsg = messages.value[messages.value.length - 1];
        if (lastMsg) {
            scrollTarget.value = 'msg-' + lastMsg.id;
        }
    }
  });
};

const handleSend = async () => {
  if (!input.value.trim()) return;

  const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input.value };
  messages.value.push(userMsg);
  input.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    const responseText = await generateRepairAdvice(userMsg.text);
    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    messages.value.push(modelMsg);
  } catch (error) {
    const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: '抱歉，网络连接异常，请稍后再试。', isError: true };
    messages.value.push(errorMsg);
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
.ai-chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  z-index: 9999;
  background-color: #f9fafb;
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.h-full { height: 100%; }
.w-full { width: 100%; }
.w-vw { width: 100vw; }

.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-emerald-600 { background-color: #059669; }
.bg-msg-container { background-color: #f9f9f9; }
.bg-black { background-color: #000000; }
.bg-gray-300 { background-color: #d1d5db; }

.text-white { color: #ffffff; }
.text-gray-900 { color: #111827; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }

.pt-custom { padding-top: env(safe-area-inset-top); }
.chat-input-area { 
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.p-2 { padding: 8px; }
.p-4 { padding: 16px; }
.p-2-5 { padding: 10px; }

.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }

.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 16px; }
.rounded-tr-sm { border-top-right-radius: 2px; }
.rounded-tl-sm { border-top-left-radius: 2px; }

.gap-2 { gap: 8px; }
.gap-1-5 { gap: 6px; }

.w-10 { width: 40px; }
.h-10 { height: 40px; }
.w-9 { width: 36px; }
.h-9 { height: 36px; }
.h-6 { height: 24px; }
.mr-2 { margin-right: 8px; }
.ml-2 { margin-left: 8px; }
.mt-1 { margin-top: 4px; }
.mb-4 { margin-bottom: 16px; }

.flex-1 { flex: 1; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.justify-start { justify-content: flex-start; }
.items-center { align-items: center; }
.shrink-0 { flex-shrink: 0; }

.font-bold { font-weight: 700; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.block { display: block; }
.max-w-80-pct { max-width: 80%; }
</style>
