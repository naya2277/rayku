import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Rayku',
        short_name: 'Rayku',
        description:
          'Planning de comidas, recetas, compra e inventario',

        theme_color: '#f4a7b9',
        background_color: '#fffaf8',

        display: 'standalone',
        orientation: 'portrait',

        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})