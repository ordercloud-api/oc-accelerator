import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({command}) => {
  if (command === 'serve') {
    //dev specific
  }
  
  if (command === 'build') {
    //build specific
  }

  return {
    server: {
      port: 3000,
    },
    build: {
      // rollupOptions: {
      //   output: {
      //     manualChunks: (id) => {
      //       if (id.includes('node_modules')) {
      //         return 'vendor';
      //       }
      //     }
      //   },
      // },
    },
    plugins: [react(), splitVendorChunkPlugin()],
  }
})