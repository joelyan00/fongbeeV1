<template>
  <view class="chat-container" style="display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);">
    <!-- Header aligned with Capsule Button -->
    <view class="header" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #e2e8f0;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
      <view class="header-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" :style="{height: navBarHeight + 'px'}">
        <view class="back-btn" @click="goBack" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}">
          <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" />
        </view>
        <view style="display: flex; flex-direction: row; align-items: center; gap: 8px; position: absolute; left: 50%; transform: translateX(-50%);">
          <view style="width: 32px; height: 32px; border-radius: 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center;">
            <AppIcon name="bot" :size="18" color="#fff" />
          </view>
          <text style="font-size: 17px; font-weight: 600; color: #1e293b;">优服佳 AI</text>
        </view>
        <view class="header-placeholder" style="width: 40px;"></view>
      </view>
    </view>
    
    <!-- Spacer -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px', flexShrink: 0}"></view>

    <!-- Chat Messages Area -->
    <scroll-view 
      scroll-y 
      class="messages-area" 
      :scroll-into-view="scrollToId"
      style="flex: 1;"
    >
      <!-- Inner container with proper margins for border visibility -->
      <view style="padding: 16px 16px 140px 16px;">
      <!-- Welcome Screen (when no messages) -->
      <view v-if="messages.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 40px;">
        <view style="width: 80px; height: 80px; border-radius: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);">
          <AppIcon name="bot" :size="40" color="#fff" />
        </view>
        <text style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">你好！</text>
        <text style="font-size: 15px; color: #64748b; text-align: center; line-height: 1.6; max-width: 280px; padding: 0 16px;">我是优服佳智能助手，可以帮您推荐家庭服务、预估价格、解答问题。</text>
        
        <!-- Suggestion Chips -->
        <view style="display: flex; flex-direction: column; gap: 12px; margin-top: 32px; width: 100%;">
          <view 
            v-for="(suggestion, idx) in suggestions" 
            :key="idx"
            @click="sendSuggestion(suggestion)"
            style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; display: flex !important; flex-direction: row !important; align-items: center !important; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);"
          >
            <view :style="{width: '36px', height: '36px', borderRadius: '12px', background: suggestion.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}">
              <AppIcon :name="suggestion.icon" :size="18" :color="suggestion.iconColor" />
            </view>
            <text style="font-size: 15px; color: #334155; flex: 1;">{{ suggestion.text }}</text>
            <AppIcon name="chevron-right" :size="16" color="#94a3b8" style="flex-shrink: 0;" />
          </view>
        </view>
      </view>

      <!-- Messages List -->
      <view v-else style="display: flex; flex-direction: column; gap: 16px;">
        <view 
          v-for="(msg, idx) in messages" 
          :key="idx"
          :id="'msg-' + idx"
          :style="{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '10px'
          }"
        >
          <!-- AI Avatar -->
          <view v-if="msg.role === 'assistant'" style="width: 36px; height: 36px; border-radius: 18px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <AppIcon name="bot" :size="18" color="#fff" />
          </view>
          
          <!-- Message Bubble -->
          <view 
            :style="{
              maxWidth: '75%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : '#1e293b',
              boxShadow: msg.role === 'user' ? '0 2px 8px rgba(5, 150, 105, 0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
              border: msg.role === 'user' ? 'none' : '1px solid #f1f5f9'
            }"
          >
            <text :style="{fontSize: '15px', lineHeight: '1.6', color: msg.role === 'user' ? '#fff' : '#334155'}">{{ msg.content }}</text>
          </view>
          
          <!-- User Avatar -->
          <view v-if="msg.role === 'user'" style="width: 36px; height: 36px; border-radius: 18px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <AppIcon name="user" :size="18" color="#64748b" />
          </view>
        </view>
        
        <!-- Typing Indicator -->
        <view v-if="isTyping" style="display: flex; flex-direction: row; align-items: flex-start; gap: 10px;">
          <view style="width: 36px; height: 36px; border-radius: 18px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <AppIcon name="bot" :size="18" color="#fff" />
          </view>
          <view style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px 20px 20px 4px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
            <view style="display: flex; flex-direction: row; gap: 4px;">
              <view class="typing-dot" style="width: 8px; height: 8px; border-radius: 4px; background: #94a3b8;"></view>
              <view class="typing-dot" style="width: 8px; height: 8px; border-radius: 4px; background: #94a3b8;"></view>
              <view class="typing-dot" style="width: 8px; height: 8px; border-radius: 4px; background: #94a3b8;"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Scroll anchor -->
      <view :id="'msg-' + messages.length"></view>
      </view>
    </scroll-view>

    <!-- Voice Recording Overlay -->
    <view v-if="isRecording" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <view style="width: 120px; height: 120px; border-radius: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: pulse 1.5s infinite;">
        <AppIcon name="mic" :size="48" color="#fff" />
      </view>
      <text style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 8px;">正在聆听...</text>
      <text style="font-size: 14px; color: #94a3b8;">松开结束录音</text>
      <view style="margin-top: 40px; padding: 12px 24px; background: rgba(255,255,255,0.1); border-radius: 20px;">
        <text style="font-size: 14px; color: #fff;">{{ recordingText || '请开始说话' }}</text>
      </view>
    </view>

    <!-- Input Area -->
    <view class="input-area" style="position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; border-top: 1px solid #e2e8f0; padding: 12px 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom)); z-index: 100;">
      <view style="display: flex !important; flex-direction: row !important; align-items: flex-end !important; gap: 10px;">
        <!-- Voice Button -->
        <view 
          @touchstart="startRecording"
          @touchend="stopRecording"
          @touchcancel="cancelRecording"
          style="width: 44px; height: 44px; border-radius: 22px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #e2e8f0;"
        >
          <AppIcon name="mic" :size="20" color="#64748b" />
        </view>
        
        <!-- Text Input -->
        <view style="flex: 1; display: flex !important; flex-direction: row !important; align-items: flex-end !important; gap: 8px; background: #f8fafc; border-radius: 22px; padding: 8px 8px 8px 16px; border: 1px solid #e2e8f0;">
          <textarea 
            v-model="inputText" 
            placeholder="输入您的问题..." 
            :auto-height="true"
            :maxlength="500"
            style="flex: 1; min-height: 24px; max-height: 100px; font-size: 15px; color: #1e293b; line-height: 24px; background: transparent; border: none; outline: none; width: 100%; padding: 0; margin: 0;"
          />
          <view 
            @click="sendMessage" 
            :style="{
              width: '36px',
              height: '36px',
              borderRadius: '18px',
              background: inputText.trim() ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: inputText.trim() ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
            }"
          >
            <AppIcon name="send" :size="16" :color="inputText.trim() ? '#fff' : '#94a3b8'" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { API_BASE_URL, getToken } from '@/services/api';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const inputText = ref('');
const messages = ref<Array<{role: 'user' | 'assistant', content: string}>>([]);
const isTyping = ref(false);
const scrollToId = ref('');

// Voice recording state
const isRecording = ref(false);
const recordingText = ref('');
const recorderManager = ref<any>(null);

const suggestions = [
  { text: '家里需要深度保洁，大概多少钱？', icon: 'sparkles', bgColor: '#ecfdf5', iconColor: '#059669' },
  { text: '空调清洗服务怎么预约？', icon: 'wind', bgColor: '#eff6ff', iconColor: '#3b82f6' },
  { text: '水管漏水了，能帮我找维修师傅吗？', icon: 'droplet', bgColor: '#fef3c7', iconColor: '#d97706' },
  { text: '搬家服务有哪些选项？', icon: 'truck', bgColor: '#fce7f3', iconColor: '#db2777' },
];

onMounted(() => {
  // #ifdef MP-WEIXIN
  const menuBtn = uni.getMenuButtonBoundingClientRect();
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 44;
  navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
  capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
  
  // Initialize recorder manager for voice input
  recorderManager.value = uni.getRecorderManager();
  recorderManager.value.onStop((res: any) => {
    if (res.tempFilePath) {
      // TODO: Send audio to ChatGPT Whisper API for transcription
      // For now, show a placeholder message
      handleVoiceResult(res.tempFilePath);
    }
    isRecording.value = false;
  });
  recorderManager.value.onError((err: any) => {
    console.error('Recording error:', err);
    isRecording.value = false;
    uni.showToast({ title: '录音失败', icon: 'none' });
  });
  // #endif
  // #ifndef MP-WEIXIN
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
  navBarHeight.value = 44;
  capsuleWidth.value = 0;
  // #endif
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index' });
  }
};

// Voice recording functions
const startRecording = () => {
  // #ifdef MP-WEIXIN
  isRecording.value = true;
  recordingText.value = '';
  recorderManager.value?.start({
    duration: 60000, // Max 60 seconds
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    format: 'mp3'
  });
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '语音功能仅支持小程序', icon: 'none' });
  // #endif
};

const stopRecording = () => {
  // #ifdef MP-WEIXIN
  recorderManager.value?.stop();
  // #endif
};

const cancelRecording = () => {
  // #ifdef MP-WEIXIN
  recorderManager.value?.stop();
  isRecording.value = false;
  // #endif
};

const handleVoiceResult = async (filePath: string) => {
  // TODO: Integrate with ChatGPT Whisper API
  // For now, show a placeholder indicating voice feature is ready
  uni.showToast({ 
    title: '语音已录制，等待接入ChatGPT语音模型', 
    icon: 'none',
    duration: 2000
  });
  
  // Future implementation:
  // 1. Upload audio file to backend
  // 2. Backend calls OpenAI Whisper API for transcription
  // 3. Send transcribed text to chat API
  // 4. Display response
};

const sendSuggestion = (suggestion: typeof suggestions[0]) => {
  inputText.value = suggestion.text;
  sendMessage();
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text) return;
  
  // Add user message
  messages.value.push({ role: 'user', content: text });
  inputText.value = '';
  
  // Scroll to bottom
  await nextTick();
  scrollToId.value = 'msg-' + (messages.value.length - 1);
  
  // Show typing indicator
  isTyping.value = true;
  
  try {
    const token = await getToken();
    const res = await uni.request({
      url: `${API_BASE_URL}/ai/chat`,
      method: 'POST',
      header: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { message: text }
    });
    
    const data = res.data as any;
    isTyping.value = false;
    
    if (data.success && data.response) {
      messages.value.push({ role: 'assistant', content: data.response });
    } else {
      messages.value.push({ 
        role: 'assistant', 
        content: '抱歉，我暂时无法回答这个问题。请稍后再试，或者换一种方式提问。' 
      });
    }
  } catch (e) {
    isTyping.value = false;
    messages.value.push({ 
      role: 'assistant', 
      content: '网络连接失败，请检查网络后重试。' 
    });
  }
  
  // Scroll to bottom after response
  await nextTick();
  scrollToId.value = 'msg-' + messages.value.length;
};
</script>

<style scoped>
.typing-dot {
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
}

/* Ensure textarea has proper styling in mini program */
textarea {
  width: 100%;
  padding: 0;
  margin: 0;
}
</style>
