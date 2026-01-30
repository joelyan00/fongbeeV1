import { defineConfig } from "vite";
import Uni from "@dcloudio/vite-plugin-uni"; // Import as Uni
import UnoCSS from 'unocss/vite'
import fs from 'fs';
import path from 'path';

// @ts-ignore
const uni = Uni.default || Uni;

// Custom plugin to rename app.css to app.wxss for WeChat Mini Program
function renameAppCssToWxss() {
  return {
    name: 'rename-app-css-to-wxss',
    closeBundle() {
      const isApplet = process.env.UNI_PLATFORM?.startsWith('mp-');
      if (isApplet) {
        // Handle both dev and build output dirs
        const dirs = [
          path.resolve(process.cwd(), 'dist/dev/mp-weixin'),
          path.resolve(process.cwd(), 'dist/build/mp-weixin')
        ];

        dirs.forEach(dir => {
          const cssPath = path.join(dir, 'app.css');
          const wxssPath = path.join(dir, 'app.wxss');
          if (fs.existsSync(cssPath)) {
            fs.renameSync(cssPath, wxssPath);
            console.log(`[rename-plugin] Renamed ${cssPath} to ${wxssPath}`);
          }
        });
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    UnoCSS(),
    renameAppCssToWxss(),
  ],

  server: {
    port: 5176,
    host: true
  }
});
