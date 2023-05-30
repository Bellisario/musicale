import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

import postcss from './postcss.config.js'

import { resolve } from 'path'

const banner = `/**
Copyright (c) ${new Date().getFullYear()} Giorgio Bellisario, all rights reserved.
Code released under the MIT license.

Source code available at: https://github.com/Bellisario/musicale
*/`

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    // prevent Microsoft banner from being added to the bundle
    legalComments: 'none',
    // add custom banner
    banner,
  },
  build: {
    outDir: './dist/public',
  },
  plugins: [svelte({
    compilerOptions: {
      cssHash: ({ hash, css }) => `s-${hash(css)}`,
    },
  }), VitePWA({
    manifest: {
      name: 'Musicale',
      short_name: 'Musicale',
      theme_color: '#ff9900',
      background_color: '#2c2a2a',
      description: 'Musicale, a music streaming service with style.',
      icons: [
        {
          src: 'favicon_60x.png',
          sizes: '60x60',
          type: 'image/png'
        },
        {
          src: 'favicon_120x.png',
          sizes: '120x120',
          type: 'image/png'
        },
        {
          src: 'favicon_180x.png',
          sizes: '180x180',
          type: 'image/png'
        },
        {
          src: 'favicon.svg',
          sizes: '512x512',
          type: 'image/svg+xml'
        },
      ]
    },
    includeAssets: [
      "./fonts/*",
      "./logo.svg",
    ],
    workbox: {
      navigateFallbackDenylist: [
        // don't cache robots.txt and sitemap.xml
        /robots\.txt$/,
        /sitemap\.xml$/,
      ]
    },
    devOptions: {
      // enabled: true,
    },
  })],
  css: {
    postcss,
  },
  resolve: {
    alias: {
      $assets: resolve(__dirname, "./src/assets"),
      $lib: resolve(__dirname, "./src/lib"),
      $components: resolve(__dirname, "./src/components"),
      $types: resolve(__dirname, "./src/types"),
    },
  },
})
