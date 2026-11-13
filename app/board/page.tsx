import type { Metadata, Viewport } from 'next'
import DesignBoard from '../../src/music/DesignBoard'
import '../music.css'
import './board.css'

export const metadata: Metadata = {
  title: 'Ei Music｜新增 20 屏设计评审',
  description: '按已有 18 张高保真稿的视觉语言，为架构图中缺稿的 20 个界面做的设计板，含设计意图与交互说明。',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0d0d10' }

export default function BoardPage() {
  return <DesignBoard />
}
