import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dsv from '@rollup/plugin-dsv' // support .csv file loading

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dsv(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
