import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  root: '.',
  base: '/', // Root path for custom domain brainchop.org
  plugins: [
    // Generate gzip compressed files
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false
    }),
    // Generate brotli compressed files (better compression than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    })
  ],
  server: {
    open: 'index.html'
  },
  preview: {
    port: 8088
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000, // Increase limit since medical imaging libs are naturally large
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split TensorFlow.js into its own chunk (largest dependency)
          if (id.includes('@tensorflow/tfjs')) {
            return 'vendor-tf';
          }
          // NiiVue visualization library
          if (id.includes('@niivue/niivue')) {
            return 'vendor-niivue';
          }
          // 3D math utilities
          if (id.includes('gl-matrix')) {
            return 'vendor-math';
          }
          // Compression libraries (loaded dynamically when needed)
          if (id.includes('blosc') || id.includes('lz4') || id.includes('zstd')) {
            return 'vendor-compression';
          }
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  esbuild: {
    treeShaking: true,
    drop: ['console', 'debugger']
  }
})
