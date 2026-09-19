import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Capacitor loads the bundle from the filesystem, so every asset URL has
  // to be relative to index.html.
  base: './',
})
