import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), tailwindcss()],
});
