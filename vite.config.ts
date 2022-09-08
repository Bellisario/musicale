import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

import postcss from './postcss.config.js'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist/public',
  },
  plugins: [svelte(), VitePWA({
    manifest: {
      name: 'Musicale',
      short_name: 'Musicale',
      theme_color: '#ff9900',
    },
    includeAssets: [
      "./fonts/*"
    ],
    devOptions: {
      enabled: true,
    },
  })],
  css: {
    postcss,
  }
})
