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
/* 全局字体设置 - 使用思源黑体/中文黑体 */
page, view, text, button, input, textarea {
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

/* 全局加粗文字使用 600 或 700 */
.font-bold {
  font-weight: 600;
}
</style>
