import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Ei Music｜可交互原型',
  description: 'Ei Music APP 可交互原型：创意空间、AI实验室、互动与社区、乐器乐理四个模块，含 Web Audio 合成音。',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1C1C1E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
