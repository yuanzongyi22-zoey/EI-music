/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// jsdom 里没有 AudioContext 构造器，audio.ts 的每个公开方法都会自动变成空操作，
// 所以这套测试一个 mock 都不需要。
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
