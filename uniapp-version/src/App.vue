<script setup lang="ts">
import './tailwind.css';
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
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
