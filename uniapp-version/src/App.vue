<script setup lang="ts">
import { ref } from 'vue';
import './tailwind.css';
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { isLoggedIn as checkLoggedIn, notificationsApi } from "./services/api";

const heartbeatTimer = ref<any>(null);

const startHeartbeat = () => {
  if (heartbeatTimer.value) return;
  // Ping every 60 seconds to keep last_active_at fresh
  heartbeatTimer.value = setInterval(async () => {
    if (checkLoggedIn()) {
      try {
        await notificationsApi.getCount(); // Simple small API call to refresh timestamp
      } catch (e) {
        console.error("Heartbeat failed", e);
      }
    }
  }, 60000);
};

const stopHeartbeat = () => {
  if (heartbeatTimer.value) {
    clearInterval(heartbeatTimer.value);
    heartbeatTimer.value = null;
  }
};

onLaunch(() => {
  console.log("App Launch");
});

onShow(() => {
  console.log("App Show");
  startHeartbeat();
});

onHide(() => {
  console.log("App Hide");
  stopHeartbeat();
});

import { onError } from "@dcloudio/uni-app";
onError((err) => {
  console.error("App Error:", err);
});
</script>
<style>
/* 全局变量与字体系统 - 极简现代风格 */
:root {
  --primary-green: #3D8E63;
  --bg-minimal: #F5F7FA;
}

page, view, text, button, input, textarea {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  letter-spacing: -0.2px;
}

/* 优化粗体文字 */
.font-bold {
  font-weight: 700;
}
</style>
