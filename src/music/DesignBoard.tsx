'use client'
// 第一步的交付物：把 20 个新增界面按 393×852 真机尺寸铺在一页上，每屏配
// 中文标题 + 设计意图 + 交互说明。板上每一屏都是真 React 组件（和 /music/
// 共用同一个 ScreenHost），所以你看到的就是第二步会接进去的那一份。
import { useMemo, useState } from 'react'
import { BOARD_ITEMS, boardNav, type BoardItem } from './board-content'
import { silentAudio } from './audio'
import { initialAppState, type ScreenCtx } from './types'
import { ScreenProvider } from './chrome'
import { ScreenHost } from './MusicApp'
import { TAB_LABELS } from './nav'

const ZOOMS = [
  { id: 's', label: '45%', v: 0.45 },
  { id: 'm', label: '62%', v: 0.62 },
  { id: 'l', label: '100%', v: 1 },
] as const

const PALETTE = [
  { hex: '#1C1C1E', name: '底色' },
  { hex: '#000000', name: '卡片' },
  { hex: '#922AFF', name: '主紫' },
  { hex: '#D8B1FF', name: '选中紫' },
  { hex: '#F3E6FF', name: '浅按钮' },
  { hex: '#723CAB', name: '深紫' },
  { hex: '#FFD200', name: '高亮黄' },
  { hex: '#FCF1DB', name: '奶油' },
  { hex: '#FF7A67', name: '珊瑚' },
  { hex: '#72CCFF', name: '天蓝' },
  { hex: '#363636', name: '分割线' },
  { hex: '#6B6B6C', name: '次级字' },
]

const noop = () => {}

/** 冻结一屏：固定 NavState + 静音引擎 + still=true。 */
function Cell({ item, scale }: { item: BoardItem; scale: number }) {
  const ctx = useMemo<ScreenCtx>(
    () => ({
      go: noop,
      back: noop,
      root: noop,
      open: noop,
      close: noop,
      toast: noop,
      params: item.params ?? {},
      nav: boardNav(item),
      state: { ...initialAppState, soundOn: false },
      patch: noop,
      audio: silentAudio,
      still: true,
    }),
    [item],
  )

  return (
    <section className="ei-board-item">
      <header className="ei-board-head">
        <b>{item.code}</b>
        <h3>{item.title}</h3>
        <span>{TAB_LABELS[item.tab]}</span>
      </header>
      <div className="ei-board-cell" style={{ width: 393 * scale, height: 852 * scale }}>
        <div className="ei-music" style={{ transform: `scale(${scale})` }}>
          <div className="ei-frame">
            <ScreenProvider value={ctx}>
              <ScreenHost />
            </ScreenProvider>
          </div>
        </div>
      </div>
      <div className="ei-board-note">
        <p>{item.intent}</p>
        <ul>
          {item.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function DesignBoard() {
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]['id']>('m')
  const scale = ZOOMS.find((z) => z.id === zoom)?.v ?? 0.62

  return (
    <div className="ei-board">
      <div className="ei-board-bar">
        <div className="ei-board-title">
          <b>Ei Music · 新增 20 屏设计评审</b>
          <small>按原稿视觉语言设计 · 每屏都是可复用的真实组件 · 板上静音且不跑动画</small>
        </div>
        <div className="ei-board-zoom" role="group" aria-label="缩放">
          {ZOOMS.map((z) => (
            <button key={z.id} aria-pressed={z.id === zoom} onClick={() => setZoom(z.id)}>
              {z.label}
            </button>
          ))}
        </div>
      </div>
      <div className="ei-board-palette" aria-label="色板">
        {PALETTE.map((c) => (
          <span key={c.hex}>
            <i style={{ background: c.hex }} />
            <b>{c.name}</b>
            <small>{c.hex}</small>
          </span>
        ))}
      </div>
      <div className="ei-board-grid">
        {BOARD_ITEMS.map((item) => (
          <Cell key={item.code} item={item} scale={scale} />
        ))}
      </div>
      <footer className="ei-board-foot">
        已有 18 张高保真稿不在本板范围内，确认后在第二步一起复刻并接成完整可交互原型。
      </footer>
    </div>
  )
}
