import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import obfuscator from 'rollup-plugin-javascript-obfuscator'
import viteCompression from 'vite-plugin-compression'

// Detect if we're building for Electron
const isElectronMode = process.env.VITE_APP_MODE === 'electron';

// https://vite.dev/config/
export default defineConfig({
  base: isElectronMode ? './' : '/',
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  plugins: [
    react(),
    viteCompression(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Logo.png', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Aparca',
        short_name: 'Aparca',
        description: 'Gestión de Parqueadero Offline-First',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'Logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      devOptions: {
        enabled: true
      }
    }),
    // Only load Electron plugins when VITE_APP_MODE=electron
    ...(isElectronMode ? [
      electron([
        {
          // Main-Process entry point of the Electron App.
          entry: 'electron/main.ts',
          vite: {
            build: {
              rollupOptions: {
                output: {
                  manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['lucide-react', 'sonner', 'recharts'],
                    utils: ['date-fns', 'date-fns-tz', 'xlsx', 'axios']
                  }
                },
                plugins: [
                  process.env.NODE_ENV === 'production' && obfuscator({
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 1,
                    deadCodeInjection: true,
                    deadCodeInjectionThreshold: 0.2, // Lower to avoid overly massive files
                    debugProtection: false, // Avoid breaking devtools for now
                    disableConsoleOutput: true,
                    identifierNamesGenerator: 'hexadecimal',
                    log: false,
                    numbersToExpressions: true,
                    renameGlobals: false,
                    rotateStringArray: true,
                    selfDefending: true,
                    shuffleStringArray: true,
                    splitStrings: true,
                    stringArray: true,
                    stringArrayEncoding: ['rc4'],
                    stringArrayThreshold: 0.8,
                    unicodeEscapeSequence: false
                  })
                ]
              },
            },
          },
        },
        {
          entry: 'electron/preload.ts',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
            // instead of restarting the entire Electron App.
            options.reload()
          },
          vite: {
            build: {
              rollupOptions: {
                plugins: [
                  process.env.NODE_ENV === 'production' && obfuscator({
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 1,
                    deadCodeInjection: true,
                    deadCodeInjectionThreshold: 0.2,
                    debugProtection: false,
                    disableConsoleOutput: true,
                    identifierNamesGenerator: 'hexadecimal',
                    log: false,
                    numbersToExpressions: true,
                    renameGlobals: false,
                    rotateStringArray: true,
                    selfDefending: true,
                    shuffleStringArray: true,
                    splitStrings: true,
                    stringArray: true,
                    stringArrayEncoding: ['rc4'],
                    stringArrayThreshold: 0.8,
                    unicodeEscapeSequence: false
                  })
                ]
              }
            }
          }
        },
      ]),
      renderer(),
    ] : []),
  ],
})
