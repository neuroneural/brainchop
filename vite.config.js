import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { defineConfig } from 'vite'

const rawStars = Number.parseInt(process.env.BRAINCHOP_GH_STARS || '646', 10)
const GH_STARS = Number.isFinite(rawStars) && rawStars > 0 ? rawStars : 646

/**
 * Headers required for cross-origin isolation (SharedArrayBuffer -> threaded CPU WASM).
 * In production on brainchop.org these are set via Cloudflare Response Header Transform Rules.
 */
const ISOLATION_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

/**
 * Stamps the build-time GitHub star count into index.html (zero runtime external API calls)
 * and stamps a content-derived build version + app-shell precache manifest into dist/sw.js.
 */
function brainchopBuildPlugin() {
  let outDir = 'dist'
  return {
    name: 'brainchop-build-plugin',
    transformIndexHtml(html) {
      return html.replace(/__BRAINCHOP_GH_STARS__/g, String(GH_STARS))
    },
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir || 'dist')
    },
    closeBundle() {
      const swPath = path.join(outDir, 'sw.js')
      const indexPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(swPath) || !fs.existsSync(indexPath)) return

      const indexHtml = fs.readFileSync(indexPath, 'utf8')
      const precacheSet = new Set([
        './',
        './index.html',
        './favicon.ico',
        './manifest.webmanifest',
        './t1_crop.nii.gz',
        './icons/icon-192.png',
        './icons/icon-512.png',
        './icons/apple-touch-icon.png',
        './icons/brainchop-logo.png',
      ])

      // Include every entry JS/CSS chunk referenced by built index.html.
      const assetRefRe = /(?:href|src)=["'](\.\/assets\/[^"']+)["']/g
      for (const m of indexHtml.matchAll(assetRefRe)) {
        precacheSet.add(m[1])
      }

      // Include core runtime chunks (NiiVue + @brainchop/core worker) so offline
      // launch works immediately, while keeping lazy .bin/.wasm/dcm2niix/niimath
      // assets out of the initial precache (cached on first use in brainchop-models-v1).
      const assetsDir = path.join(outDir, 'assets')
      if (fs.existsSync(assetsDir)) {
        for (const file of fs.readdirSync(assetsDir)) {
          if (file.endsWith('.bin') || file.endsWith('.wasm') || file.endsWith('.map')) continue
          if (/^(index-|vendor-niivue-|worker-|brainchop-core-)/.test(file)) {
            precacheSet.add(`./assets/${file}`)
          }
        }
      }

      const precacheUrls = Array.from(precacheSet).sort()
      const hash = crypto
        .createHash('sha256')
        .update(indexHtml)
        .update(precacheUrls.join('\n'))
        .digest('hex')
        .slice(0, 12)

      let swSrc = fs.readFileSync(swPath, 'utf8')
      swSrc = swSrc.replace('__BRAINCHOP_BUILD_VERSION__', hash)
      swSrc = swSrc.replace(
        /\/\*__BRAINCHOP_PRECACHE_URLS__\*\/[\s\S]*?\];/,
        `${JSON.stringify(precacheUrls, null, 2)};`,
      )
      fs.writeFileSync(swPath, swSrc)
    },
  }
}

export default defineConfig({
  base: './',
  define: {
    __BRAINCHOP_GH_STARS__: JSON.stringify(GH_STARS),
  },
  plugins: [brainchopBuildPlugin()],
  server: {
    headers: ISOLATION_HEADERS,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    headers: ISOLATION_HEADERS,
  },
  worker: {
    format: 'es',
  },
  // Vite's dev prebundler breaks worker/WASM `new Worker(new URL(...))` and
  // Emscripten relative asset resolution in these stock packages.
  optimizeDeps: {
    exclude: [
      '@brainchop/core',
      '@niivue/niimath',
      '@niivue/nv-ext-dcm2niix',
      '@niivue/dcm2niix',
    ],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@niivue/niivue')) return 'vendor-niivue'
          if (id.includes('@brainchop/core')) return 'brainchop-core'
        },
      },
    },
  },
})
