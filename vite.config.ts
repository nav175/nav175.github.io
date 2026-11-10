import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative base keeps every emitted asset path relative, so the build works
  // at nav175.github.io and from any sub-path or local file preview.
  base: './',
  plugins: [react(), tailwindcss()],
})
