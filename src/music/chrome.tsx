'use client'
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { SUB_LABELS, TAB_LABELS, TAB_SUBS, type SubTab, type TabId } from './nav'
import type { ScreenCtx } from './types'
import { asset } from './assets'

const Ctx = createContext<ScreenCtx | null>(null)

export const ScreenProvider = Ctx.Provider

export function useScreen(): ScreenCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useScreen 必须在 ScreenProvider 内使用')
  return v
}

/**
 * 浮层打开时把焦点挪进去，关闭时浏览器自己回到触发它的按钮。
 * 没有这一步，键盘用户按 Tab 会继续在身后的列表里走。
 */
export function useDialogFocus<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const first = el.querySelector<HTMLElement>('input,button,[tabindex]:not([tabindex="-1"])')
    ;(first ?? el).focus({ preventScroll: true })
  }, [])
  return ref
}

/* ------------------------------------------------------------------ chrome */

export function StatusBar() {
  return (
    <div className="ei-statusbar" aria-hidden>
      <span>9:41</span>
      <span>
        <span className="ei-sig">
          <i />
          <i />
          <i />
          <i />
        </span>
        <WifiGlyph />
        <span className="ei-batt" />
      </span>
    </div>
  )
}

function WifiGlyph() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 4.1a11 11 0 0 1 15 0" />
      <path d="M4 7a7 7 0 0 1 9 0" />
      <path d="M6.6 9.7a3.2 3.2 0 0 1 3.8 0" />
    </svg>
  )
}

/**
 * Figma 里这些图标是 200×200 的单色剪影位图，不是矢量，所以拿不到 path。
 * 用 CSS mask 把剪影的 alpha 当形状、background 取 currentColor —— 形状是原件，
 * 颜色仍跟着选中态走（底 tab 选中要变紫）。
 */
export function Icon({ name, size = 25, label }: { name: string; size?: number; label?: string }) {
  const src = `url(${asset(`icon/${name}.png`)})`
  return (
    <i
      className="ei-ico"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size, maskImage: src, WebkitMaskImage: src }}
    />
  )
}

export function Burger({ onClick }: { onClick: () => void }) {
  return (
    <button className="ei-icon-btn" onClick={onClick} aria-label="打开侧边菜单">
      <Icon name="menu" size={21} />
    </button>
  )
}

export function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="ei-icon-btn" onClick={onClick} aria-label="全局搜索">
      <Icon name="search" size={24} />
    </button>
  )
}

/** 顶栏：☰ + 分段子 tab + 🔍。单子 tab 的模块（AI实验室）只显示标题。 */
export function NavHeader({ tab, sub }: { tab: TabId; sub: SubTab }) {
  const { open, root } = useScreen()
  const subs = TAB_SUBS[tab]
  return (
    <div className="ei-nav">
      <Burger onClick={() => open({ kind: 'drawer' })} />
      {subs.length > 1 ? (
        <div className="ei-nav-subs" role="tablist" aria-label={`${TAB_LABELS[tab]}子模块`}>
          {subs.map((id) => (
            <button
              key={id}
              className="ei-sub"
              role="tab"
              aria-selected={id === sub}
              onClick={() => root(tab, id)}
            >
              {SUB_LABELS[id]}
            </button>
          ))}
        </div>
      ) : (
        <div className="ei-nav-solo">{TAB_LABELS[tab]}</div>
      )}
      <SearchButton onClick={() => open({ kind: 'search' })} />
    </div>
  )
}

export function BackHeader({ title, action }: { title: string; action?: ReactNode }) {
  const { back } = useScreen()
  return (
    <div className="ei-back">
      <button className="ei-icon-btn" onClick={back} aria-label="返回">
        <Icon name="back" size={24} />
      </button>
      <h1>{title}</h1>
      {action ?? <span className="ei-icon-btn" aria-hidden />}
    </div>
  )
}

const TAB_ICONS: Record<TabId, string> = {
  create: 'tab-create',
  lab: 'tab-lab',
  community: 'tab-community',
  instrument: 'tab-instrument',
}

export function TabBar({ tab }: { tab: TabId }) {
  const { nav, audio, state, root } = useScreen()
  return (
    <nav className="ei-tabbar" aria-label="主模块">
      {(Object.keys(TAB_LABELS) as TabId[]).map((id) => (
        <button
          key={id}
          aria-current={id === tab ? 'page' : undefined}
          onClick={() => {
            if (state.soundOn) audio.blip(id === tab ? 660 : 880)
            root(id, nav.sub[id])
          }}
        >
          <Icon name={TAB_ICONS[id]} size={25} />
          {TAB_LABELS[id]}
        </button>
      ))}
    </nav>
  )
}

/* -------------------------------------------------------------- 基础件 */

export function ChipRow({
  items,
  active,
  onPick,
  label,
}: {
  items: { id: string; label: string }[]
  active: string
  onPick: (id: string) => void
  label: string
}) {
  return (
    <div className="ei-chips" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} className="ei-chip" aria-pressed={it.id === active} onClick={() => onPick(it.id)}>
          {it.label}
        </button>
      ))}
    </div>
  )
}

export function Row({
  thumb,
  title,
  sub,
  tail,
  on,
  onClick,
}: {
  thumb?: string
  title: string
  sub?: string
  tail?: ReactNode
  on?: boolean
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`ei-row${on ? ' ei-on' : ''}`} onClick={onClick}>
      {thumb ? <img className="ei-row-thumb" src={asset(thumb)} alt="" width={94} height={88} loading="lazy" /> : null}
      <span className="ei-row-main">
        <b>{title}</b>
        {sub ? <small>{sub}</small> : null}
      </span>
      {tail ? <span className="ei-row-tail">{tail}</span> : null}
    </Tag>
  )
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <h2 className="ei-section">
      {children}
      {aside ? <span>{aside}</span> : null}
    </h2>
  )
}

export function PlayButton({
  playing,
  small,
  label,
  onClick,
}: {
  playing?: boolean
  small?: boolean
  label: string
  onClick?: () => void
}) {
  return (
    <button className={`ei-play${small ? ' ei-sm' : ''}`} onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 4.8 20 12 8 19.2z" />}
      </svg>
    </button>
  )
}

export function SeekBar({ at, total, pct }: { at: string; total: string; pct: number }) {
  return (
    <div className="ei-seek">
      <span>{at}</span>
      <span className="ei-seek-track">
        <span className="ei-seek-fill" style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} />
      </span>
      <span>{total}</span>
    </div>
  )
}

/** 底部 sheet。浮层由外壳渲染，屏里只调 open()，所以这里不管导航。 */
export function Sheet({
  title,
  hint,
  children,
  onClose,
  closeLabel = '取消',
}: {
  title: string
  hint?: string
  children: ReactNode
  onClose: () => void
  closeLabel?: string
}) {
  const ref = useDialogFocus<HTMLDivElement>()
  return (
    <>
      <button className="ei-scrim" onClick={onClose} aria-label="关闭浮层" />
      <div className="ei-sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        <div className="ei-sheet-grip" aria-hidden />
        <h2>{title}</h2>
        {hint ? <p className="ei-hint">{hint}</p> : null}
        {children}
        <button className="ei-sheet-close" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </>
  )
}

export function CenterModal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const ref = useDialogFocus<HTMLDivElement>()
  return (
    <>
      <button className="ei-scrim" onClick={onClose} aria-label="关闭浮层" />
      <div className="ei-center" role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        {children}
      </div>
    </>
  )
}

export function FaderBank({
  items,
  onNudge,
}: {
  items: readonly { id: string; label: string; value: number }[]
  onNudge?: (id: string, value: number) => void
}) {
  return (
    <div className="ei-faders" role="group" aria-label="参数推子">
      {items.map((f) => (
        <div className="ei-fader" key={f.id}>
          <button
            className="ei-fader-track"
            role="slider"
            aria-label={f.label}
            aria-valuenow={f.value}
            aria-valuemin={0}
            aria-valuemax={100}
            onClick={() => onNudge?.(f.id, (f.value + 12) % 100)}
          >
            <span className="ei-fader-fill" style={{ height: `${f.value}%` }} />
            <span className="ei-fader-knob" style={{ bottom: `calc(${f.value}% - 7px)` }} />
          </button>
          <b>{f.label}</b>
          <small>{f.value}</small>
        </div>
      ))}
    </div>
  )
}

/** 固定形状的假波形：同一个 seed 永远画出同一条，方便设计板比对。 */
export function Waveform({ seed, lit = 0.4, bars = 48 }: { seed: string; lit?: number; bars?: number }) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 9973
  return (
    <div className="ei-wave" aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        h = (h * 1103515245 + 12345) % 2147483648
        const v = 18 + ((h >>> 8) % 82)
        return <i key={i} className={i / bars < lit ? 'ei-lit' : undefined} style={{ height: `${v}%` }} />
      })}
    </div>
  )
}

