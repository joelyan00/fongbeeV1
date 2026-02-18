import { defineConfig } from "vite";
import Uni from "@dcloudio/vite-plugin-uni"; // Import as Uni
import UnoCSS from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'
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

// Only enable PWA for H5 builds (not WeChat Mini Program)
const isH5Build = !process.env.UNI_PLATFORM || process.env.UNI_PLATFORM === 'h5';

// Copy PWA icons from public/ to H5 build output
function copyPwaAssets() {
  return {
    name: 'copy-pwa-assets',
    closeBundle() {
      if (!isH5Build) return;
      const isDev = process.env.NODE_ENV === 'development';
      const outDir = isDev
        ? path.resolve(process.cwd(), 'dist/dev/h5')
        : path.resolve(process.cwd(), 'dist/build/h5');
      const publicDir = path.resolve(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) return;

      // Recursively copy public/ to outDir
      const copyDir = (src: string, dest: string) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const item of fs.readdirSync(src)) {
          const srcPath = path.join(src, item);
          const destPath = path.join(dest, item);
          if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      copyDir(publicDir, outDir);
      console.log('[copy-pwa-assets] Copied public/ assets to H5 output');
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    UnoCSS(),
    renameAppCssToWxss(),
    copyPwaAssets(),
    // PWA support - only for H5 builds
    ...(isH5Build ? [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'icons/*.png'],
        manifest: {
          name: '优服佳 - 优质居家服务',
          short_name: '优服佳',
          description: '专业居家服务预约平台，保洁、维修、搬家一站搞定',
          theme_color: '#3D8E63',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'zh-CN',
          icons: [
            {
              src: 'icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png'
            },
            {
              src: 'icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png'
            },
            {
              src: 'icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png'
            },
            {
              src: 'icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: 'icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png'
            },
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,jpg,svg,woff2}'],
          // Offline fallback for SPA routing
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          // Skip waiting and claim clients immediately on update
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              // Static assets: Cache First (30 days)
              urlPattern: /\/assets\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'assets-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60
                }
              }
            },
            {
              // API requests: Network First (5 min cache, 10s timeout)
              urlPattern: /\/api\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60
                },
                networkTimeoutSeconds: 10
              }
            }
          ]
        }
      })
    ] : [])
  ],

  server: {
    port: 5176,
    host: true
  }
});
