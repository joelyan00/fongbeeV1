// Rebuild trigger for H5 UI sync
// H5 Rebuild Trigger 2
import { createSSRApp } from "vue";
import App from "./App.vue";
import "./tailwind.css";
export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
