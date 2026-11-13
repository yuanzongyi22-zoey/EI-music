'use client'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  currentScreen,
  initialNav,
  navReducer,
  routeKey,
  type Overlay,
  type ScreenId,
  type ScreenParams,
  type SubTab,
  type TabId,
} from './nav'
import { initialAppState, type AppState, type ScreenCtx } from './types'
import { audio as realAudio } from './audio'
import { BackHeader, NavHeader, ScreenProvider, StatusBar, TabBar, useScreen } from './chrome'
import { SCREENS, SUB_SCREENS } from './screens'
import { OverlayHost } from './screens/overlays'

/**
 * 机身内部的一切。设计板和 /music/ 共用这一个 Host，所以每屏都不需要知道
 * 自己被谁装着——它只通过 useScreen() 拿能力。
 */
export function ScreenHost() {
  const ctx = useScreen()
  const top = currentScreen(ctx.nav)
  const def = top ? SCREENS[top.id] : null
  const tab = def ? def.tab : ctx.nav.tab
  const sub = ctx.nav.sub[ctx.nav.tab]
  const Body = def ? def.Body : SUB_SCREENS[sub]
  const chrome = def ? def.chrome : 'tabRoot'

  return (
    <div className="ei-screen" data-dir={ctx.nav.dir}>
      <StatusBar />
      {chrome === 'tabRoot' ? <NavHeader tab={tab} sub={sub} /> : null}
      {chrome === 'detail' ? <BackHeader title={def?.title ?? ''} /> : null}
      <div className={`ei-body${chrome === 'bare' ? ' ei-flush' : ''}`} key={routeKey(ctx.nav)}>
        <Body />
      </div>
      {chrome === 'tabRoot' ? <TabBar tab={tab} /> : null}
      <OverlayHost />
      <span className="ei-island" aria-hidden />
      <span className="ei-home" aria-hidden />
    </div>
  )
}

export default function MusicApp() {
  const [nav, dispatch] = useReducer(navReducer, initialNav)
  const [state, setState] = useState<AppState>(initialAppState)
  const [toastText, setToastText] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((text: string) => {
    setToastText(text)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToastText(null), 1900)
  }, [])

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  // 离开一屏就掐掉还在响的音，否则虚拟乐器的尾音会跟着你走。
  const key = routeKey(nav)
  useEffect(() => () => realAudio.stopAll(), [key])

  useEffect(() => {
    setState((s) => (s.soundOn === realAudio.enabled() ? s : { ...s, soundOn: realAudio.enabled() }))
  }, [])

  // Esc 走的是同一个 back：浮层开着就先关浮层，否则退一层栈。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      dispatch({ type: 'back' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const ctx = useMemo<ScreenCtx>(
    () => ({
      go: (id: ScreenId, params?: ScreenParams) => dispatch({ type: 'push', id, params }),
      back: () => dispatch({ type: 'back' }),
      root: (tab: TabId, sub?: SubTab) => dispatch({ type: 'root', tab, sub }),
      open: (overlay: Overlay) => dispatch({ type: 'overlay', overlay }),
      close: () => dispatch({ type: 'overlay', overlay: null }),
      toast,
      params: currentScreen(nav)?.params ?? {},
      nav,
      state,
      patch: (next: Partial<AppState>) => setState((s) => ({ ...s, ...next })),
      audio: realAudio,
      still: false,
    }),
    [nav, state, toast],
  )

  return (
    <div className="ei-music ei-stage" onPointerDown={() => realAudio.resume()}>
      <div className="ei-frame">
        <ScreenProvider value={ctx}>
          <ScreenHost />
        </ScreenProvider>
        {toastText ? (
          <div className="ei-toast" role="status">
            {toastText}
          </div>
        ) : null}
      </div>
    </div>
  )
}
