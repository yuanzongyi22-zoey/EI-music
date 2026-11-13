import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import MusicApp from './MusicApp'

// jsdom 没有 AudioContext 构造器，audio.ts 的每个方法首行就会空操作返回，
// 所以这里不需要任何 mock——这是 audio.ts 那个 ensure() 设计的回报。

const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const click = (name: string | RegExp) => fireEvent.click(btn(name))
const tab = (name: string) => screen.getByRole('tab', { name })

afterEach(cleanup)

it('opens with 我的项目 and switches sub-tabs inside 创意空间', () => {
  render(<MusicApp />)
  expect(tab('我的项目')).toHaveAttribute('aria-selected', 'true')
  expect(btn('新建或导入项目')).toBeInTheDocument()

  fireEvent.click(tab('我的采样'))
  expect(tab('我的采样')).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByText(/左滑一行出操作/)).toBeInTheDocument()
})

it('hides the sub-tab bar after pushing a detail screen and restores it on 返回', () => {
  render(<MusicApp />)
  // 行里有两个按钮（整行 + 试听），要的是整行那个。
  fireEvent.click(screen.getAllByRole('button', { name: /^夜班电台 Demo/ })[0])
  // detail 屏换成返回头，子 tab 整条消失。
  expect(screen.queryByRole('tab', { name: '我的采样' })).not.toBeInTheDocument()
  expect(btn('返回')).toBeInTheDocument()

  click('返回')
  expect(tab('我的采样')).toBeInTheDocument()
})

it('closes an overlay with Escape', () => {
  render(<MusicApp />)
  click('新建或导入项目')
  expect(screen.getByRole('dialog', { name: '新建 / 导入项目' })).toBeInTheDocument()

  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByRole('dialog', { name: '新建 / 导入项目' })).not.toBeInTheDocument()
})

it('carries a sample across modules: 更多 → AI实验室', () => {
  render(<MusicApp />)
  fireEvent.click(tab('我的采样'))
  click('清晨鸟鸣 的更多操作')
  expect(screen.getByRole('dialog', { name: '清晨鸟鸣' })).toBeInTheDocument()

  // 底 tab 也叫 AI实验室，所以连提示语一起匹配，点的是 sheet 里那一行。
  click('AI实验室 交给 AI 继续生成')
  // root('lab') 关掉 sheet、切到 AI实验室，并留一条 toast。
  expect(screen.queryByRole('dialog', { name: '清晨鸟鸣' })).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('已带到AI实验室')
  expect(screen.getByText(/四个功能都吃同一批素材/)).toBeInTheDocument()
})

it('deep-links from global search into a community post', () => {
  render(<MusicApp />)
  click('全局搜索')
  fireEvent.change(screen.getByLabelText('搜索关键词'), { target: { value: '夜' } })
  const hit = screen.getAllByRole('button').find((b) => b.textContent?.includes('夜'))!
  fireEvent.click(hit)
  expect(btn('返回')).toBeInTheDocument()
})

it('toggles the device connection from the drawer', () => {
  render(<MusicApp />)
  click('打开侧边菜单')
  expect(screen.getAllByText('已连接').length).toBe(3)

  click('断开连接')
  expect(screen.getAllByText('未连接').length).toBe(3)
  expect(screen.getByRole('status')).toHaveTextContent('已断开三个模块')
})
