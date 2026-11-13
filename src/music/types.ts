import type { ReactNode } from 'react'
import type { Dir, NavState, Overlay, ScreenId, ScreenParams, SubTab, TabId } from './nav'
import type { AudioEngine } from './audio'

/** Mutable app state that is not navigation: likes, toggles, scratch edits. */
export type AppState = {
  likedPosts: string[]
  savedPosts: string[]
  soundOn: boolean
  deviceConnected: boolean
  /** Samples recorded in 虚拟乐器 during the session, newest first. */
  recorded: { id: string; name: string; length: string }[]
  /** Projects created through 新建/导入项目 during the session. */
  drafts: { id: string; name: string; from: string }[]
}

export const initialAppState: AppState = {
  likedPosts: ['post-2'],
  savedPosts: [],
  soundOn: true,
  deviceConnected: true,
  recorded: [],
  drafts: [],
}

/**
 * Everything a screen can reach. Screens never import the shell, so the same
 * component renders inside /music/ and inside the /music-board/ design board.
 */
export type ScreenCtx = {
  go: (id: ScreenId, params?: ScreenParams) => void
  back: () => void
  root: (tab: TabId, sub?: SubTab) => void
  open: (overlay: Overlay) => void
  close: () => void
  toast: (text: string) => void
  params: ScreenParams
  nav: NavState
  state: AppState
  patch: (next: Partial<AppState>) => void
  audio: AudioEngine
  /**
   * True on the design board: no timers, no rAF, no autoplay. Screens render
   * the most informative frozen frame instead.
   */
  still: boolean
}

export type Chrome = 'tabRoot' | 'detail' | 'bare'

export type ScreenDef = {
  title: string
  chrome: Chrome
  tab: TabId
  Body: () => ReactNode
}

export type { Dir, NavState, Overlay, ScreenId, ScreenParams, SubTab, TabId }
