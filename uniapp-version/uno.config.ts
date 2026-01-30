import { defineConfig } from 'unocss'
import { presetApplet, presetRemRpx, transformerAttributify, transformerApplet } from 'unocss-applet'
import { presetUno } from 'unocss'

const isApplet = process.env.UNI_PLATFORM?.startsWith('mp-') ?? false

export default defineConfig({
  presets: [
    // Use presetApplet for Mini Programs, presetUno for H5/Web
    isApplet ? presetApplet() : presetUno(),
    // Only convert rem to rpx on Mini Programs
    isApplet ? presetRemRpx() : undefined,
  ],
  transformers: [
    // Only transform class names on Mini Programs
    isApplet ? transformerApplet() : undefined,
    transformerAttributify(),
  ].filter(Boolean),
})
