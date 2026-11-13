import { describe, expect, it } from 'vitest'
import {
  TAB_SUBS,
  currentScreen,
  initialNav,
  navReducer,
  routeKey,
  tabOfSub,
  type NavState,
} from './nav'

const run = (state: NavState, ...actions: Parameters<typeof navReducer>[1][]) =>
  actions.reduce(navReducer, state)

describe('navReducer', () => {
  it('starts on 创意空间 / 我的项目', () => {
    expect(initialNav.tab).toBe('create')
    expect(initialNav.sub.create).toBe('projects')
    expect(initialNav.stack).toHaveLength(0)
  })

  it('switches tabs sideways and keeps each tab’s remembered sub-tab', () => {
    const s = run(
      initialNav,
      { type: 'sub', sub: 'samples' },
      { type: 'tab', tab: 'community' },
      { type: 'sub', sub: 'groups' },
      { type: 'tab', tab: 'create' },
    )
    expect(s.tab).toBe('create')
    expect(s.sub.create).toBe('samples')
    expect(s.sub.community).toBe('groups')
    expect(s.dir).toBe('lateral')
  })

  it('infers the tab from a sub-tab so cross-tab sub links work', () => {
    const s = navReducer(initialNav, { type: 'sub', sub: 'theory' })
    expect(s.tab).toBe('instrument')
    expect(s.sub.instrument).toBe('theory')
  })

  it('pushes and pops detail screens', () => {
    const pushed = navReducer(initialNav, { type: 'push', id: 'projectEditor', params: { projectId: 'p-1' } })
    expect(pushed.dir).toBe('fwd')
    expect(currentScreen(pushed)).toEqual({ id: 'projectEditor', params: { projectId: 'p-1' } })
    const popped = navReducer(pushed, { type: 'back' })
    expect(popped.stack).toHaveLength(0)
    expect(popped.dir).toBe('back')
  })

  it('lets an open overlay swallow the first back', () => {
    const s = run(
      initialNav,
      { type: 'push', id: 'projectPlayer', params: { projectId: 'p-1' } },
      { type: 'overlay', overlay: { kind: 'share', target: 'p-1', scope: 'one' } },
    )
    const once = navReducer(s, { type: 'back' })
    expect(once.overlay).toBeNull()
    expect(once.stack).toHaveLength(1)
    const twice = navReducer(once, { type: 'back' })
    expect(twice.stack).toHaveLength(0)
  })

  it('back at the root is a no-op, not a crash', () => {
    expect(navReducer(initialNav, { type: 'back' })).toBe(initialNav)
  })

  it('clears the stack when you tap the tab you are already on', () => {
    const deep = run(
      initialNav,
      { type: 'push', id: 'projectEditor' },
      { type: 'push', id: 'projectPlayer' },
    )
    const home = navReducer(deep, { type: 'tab', tab: 'create' })
    expect(home.stack).toHaveLength(0)
    expect(home.dir).toBe('back')
    expect(navReducer(home, { type: 'tab', tab: 'create' })).toBe(home)
  })

  it('switching tabs drops the previous tab’s stack', () => {
    const s = run(
      initialNav,
      { type: 'push', id: 'projectEditor' },
      { type: 'tab', tab: 'lab' },
    )
    expect(s.stack).toHaveLength(0)
    expect(s.tab).toBe('lab')
  })

  it('root() is the cross-module deep link: new tab, new sub, nothing left open', () => {
    const s = run(
      initialNav,
      { type: 'tab', tab: 'lab' },
      { type: 'push', id: 'labFxRun' },
      { type: 'overlay', overlay: { kind: 'share', target: 'x', scope: 'one' } },
      { type: 'root', tab: 'create', sub: 'projects' },
    )
    expect(s).toMatchObject({ tab: 'create', overlay: null, dir: 'lateral' })
    expect(s.sub.create).toBe('projects')
    expect(s.stack).toHaveLength(0)
  })

  it('root() without a sub keeps whatever that tab was last showing', () => {
    const s = run(
      initialNav,
      { type: 'sub', sub: 'social' },
      { type: 'tab', tab: 'create' },
      { type: 'root', tab: 'community' },
    )
    expect(s.sub.community).toBe('social')
  })

  it('pushing a screen closes the overlay that launched it', () => {
    const s = run(
      initialNav,
      { type: 'overlay', overlay: { kind: 'samplePicker', mode: 'chance' } },
      { type: 'push', id: 'labChancePlayer' },
    )
    expect(s.overlay).toBeNull()
  })
})

describe('routeKey', () => {
  it('identifies tab roots and detail screens separately', () => {
    expect(routeKey(initialNav)).toBe('create:projects')
    const s = navReducer(initialNav, { type: 'push', id: 'instrumentPlay', params: { categoryId: 'piano' } })
    expect(routeKey(s)).toBe('instrumentPlay:{"categoryId":"piano"}')
  })

  it('changes when the params change, so audio gets stopped', () => {
    const a = navReducer(initialNav, { type: 'push', id: 'theoryLesson', params: { lessonId: 'l-1' } })
    const b = navReducer(initialNav, { type: 'push', id: 'theoryLesson', params: { lessonId: 'l-2' } })
    expect(routeKey(a)).not.toBe(routeKey(b))
  })
})

describe('tabOfSub', () => {
  it('maps every declared sub-tab back to its tab', () => {
    for (const tab of Object.keys(TAB_SUBS) as (keyof typeof TAB_SUBS)[]) {
      for (const sub of TAB_SUBS[tab]) expect(tabOfSub(sub)).toBe(tab)
    }
  })
})
