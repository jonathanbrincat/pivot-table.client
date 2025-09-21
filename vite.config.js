import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'

// JB: BUG: plugin will not play nicely alongside react; guessing this is conflicting with the react parser and both are acting upon all .jsx extensions
// import vueJsx from '@vitejs/plugin-vue-jsx'

// JB: BUG: breaking changes introduce with v4 that are a ballache; migration deferred for now
// import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vue(),
    // vueJsx(),

    // @v4 tailwind
    // tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
