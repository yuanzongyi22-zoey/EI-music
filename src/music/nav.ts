// Navigation model for the Ei Music prototype. React-free on purpose so the
// reducer can be unit tested and so both the app shell and the design board
// can drive it.
//
// The architecture diagram has ~38 nodes. Rather than one flat union we keep
// `tab` + a remembered sub-tab per tab + one push stack + one overlay slot.
// That makes "which bottom tab is purple" and "which sub-tab is underlined"
// directly readable, gives detail screens a back history for free, and turns
// cross-module jumps like 上传到创意空间 into a single `root` action.

export type TabId = 'create' | 'lab' | 'community' | 'instrument'

export type SubTab =
  | 'projects'
  | 'samples'
  | 'sampleFx'
  | 'hub'
  | 'feed'
  | 'groups'
  | 'social'
  | 'instruments'
  | 'theory'

export type ScreenId =
  | 'account'
  | 'projectEditor'
  | 'projectPlayer'
  | 'labChance'
  | 'labChanceKeywords'
  | 'labChancePlayer'
  | 'labFx'
  | 'labFxRun'
  | 'labVoice'
  | 'labVoiceResult'
  | 'labPicture'
  | 'labPictureAlbum'
  | 'postDetail'
  | 'groupDetail'
  | 'friendDiscover'
  | 'chat'
  | 'instrumentCategory'
  | 'instrumentPlay'
  | 'theoryLesson'
  | 'knowledgeResult'

export type ScreenParams = {
  projectId?: string
  sampleId?: string
  postId?: string
  groupId?: string
  friendId?: string
  albumId?: string
  categoryId?: string
  lessonId?: string
  termId?: string
  title?: string
}

export type DeviceModule = '采样模块' | '处理与演奏模块' | '创作模块'

export type SamplePickerMode = 'chance' | 'voice' | 'fx' | 'editor'

export type Overlay =
  | { kind: 'drawer' }
  | { kind: 'newProject' }
  | { kind: 'uploadDevice'; module: DeviceModule; itemId?: string }
  | { kind: 'share'; target: string; scope: 'one' | 'team' }
  | { kind: 'samplePicker'; mode: SamplePickerMode }
  | { kind: 'sampleActions'; sampleId: string }
  | { kind: 'teamMode'; groupId: string }
  | { kind: 'search' }

export type Dir = 'fwd' | 'back' | 'lateral'

export type StackEntry = { id: ScreenId; params: ScreenParams }

export type NavState = {
  tab: TabId
  sub: Record<TabId, SubTab>
  stack: StackEntry[]
  overlay: Overlay | null
  dir: Dir
}

export type NavAction =
  | { type: 'tab'; tab: TabId }
  | { type: 'sub'; sub: SubTab }
  | { type: 'push'; id: ScreenId; params?: ScreenParams }
  | { type: 'back' }
  | { type: 'root'; tab: TabId; sub?: SubTab }
  | { type: 'overlay'; overlay: Overlay | null }

export const TAB_SUBS: Record<TabId, SubTab[]> = {
  create: ['projects', 'samples', 'sampleFx'],
  lab: ['hub'],
  community: ['feed', 'groups', 'social'],
  instrument: ['instruments', 'theory'],
}

export const TAB_LABELS: Record<TabId, string> = {
  create: '创意空间',
  lab: 'AI实验室',
  community: '互动与社区',
  instrument: '乐器乐理',
}

export const SUB_LABELS: Record<SubTab, string> = {
  projects: '我的项目',
  samples: '我的采样',
  sampleFx: '采样处理',
  hub: 'AI实验室',
  feed: '社区',
  groups: '小组创作',
  social: '分享互动',
  instruments: '虚拟乐器',
  theory: '乐理学习',
}

export const initialNav: NavState = {
  tab: 'create',
  sub: { create: 'projects', lab: 'hub', community: 'feed', instrument: 'instruments' },
  stack: [],
  overlay: null,
  dir: 'lateral',
}

/** Which tab a sub-tab belongs to. */
export function tabOfSub(sub: SubTab): TabId {
  for (const tab of Object.keys(TAB_SUBS) as TabId[]) {
    if (TAB_SUBS[tab].includes(sub)) return tab
  }
  return 'create'
}

export function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'tab': {
      // Tapping the tab you are already on pops back to its root.
      if (action.tab === state.tab) {
        if (state.stack.length === 0 && !state.overlay) return state
        return { ...state, stack: [], overlay: null, dir: 'back' }
      }
      return { ...state, tab: action.tab, stack: [], overlay: null, dir: 'lateral' }
    }
    case 'sub': {
      const tab = tabOfSub(action.sub)
      return {
        ...state,
        tab,
        sub: { ...state.sub, [tab]: action.sub },
        stack: [],
        overlay: null,
        dir: 'lateral',
      }
    }
    case 'push':
      return {
        ...state,
        stack: [...state.stack, { id: action.id, params: action.params ?? {} }],
        overlay: null,
        dir: 'fwd',
      }
    case 'back': {
      // An open overlay swallows the first back.
      if (state.overlay) return { ...state, overlay: null, dir: 'back' }
      if (state.stack.length === 0) return state
      return { ...state, stack: state.stack.slice(0, -1), dir: 'back' }
    }
    case 'root': {
      const sub = action.sub ?? state.sub[action.tab]
      return {
        tab: action.tab,
        sub: { ...state.sub, [action.tab]: sub },
        stack: [],
        overlay: null,
        dir: 'lateral',
      }
    }
    case 'overlay':
      return { ...state, overlay: action.overlay, dir: action.overlay ? 'fwd' : 'back' }
    default:
      return state
  }
}

/** Identity of the current route, used as a React key and to stop audio. */
export function routeKey(state: NavState): string {
  const top = state.stack[state.stack.length - 1]
  return top ? `${top.id}:${JSON.stringify(top.params)}` : `${state.tab}:${state.sub[state.tab]}`
}

export function currentScreen(state: NavState): StackEntry | null {
  return state.stack[state.stack.length - 1] ?? null
}
