'use client'
import { useState } from 'react'
import { asset } from '../assets'
import {
  accountStats,
  deviceModules,
  me,
  newProjectSources,
  samples,
  searchHistory,
  searchResults,
  shareChannels,
  sampleActions,
} from '../content'
import { TAB_LABELS, type TabId } from '../nav'
import { CenterModal, Sheet, useDialogFocus, useScreen } from '../chrome'
import { QrArt } from '../art'

/* ------------------------------------------------------- N1 侧边抽屉 */

function Drawer() {
  const { close, go, root, state, patch, audio, toast, still } = useScreen()
  const ref = useDialogFocus<HTMLElement>()
  const shortcuts: TabId[] = ['create', 'lab', 'community', 'instrument']
  return (
    <>
      <button className="ei-scrim" onClick={close} aria-label="关闭侧边菜单" />
      <aside className="ei-drawer" role="dialog" aria-modal="true" aria-label="侧边菜单" ref={ref} tabIndex={-1}>
        <button
          className="ei-drawer-me"
          onClick={() => {
            close()
            go('account')
          }}
        >
          <img src={asset(me.avatar)} alt="" width={52} height={52} loading="lazy" />
          <span>
            <b>{me.name}</b>
            <small>{me.handle}</small>
          </span>
          <span className="ei-chev" aria-hidden style={{ transform: 'rotate(-135deg)' }} />
        </button>

        <div className="ei-drawer-stats">
          {accountStats.map((s) => (
            <div key={s.id}>
              <b>{s.value}</b>
              <small>{s.label}</small>
            </div>
          ))}
        </div>

        <nav className="ei-drawer-nav" aria-label="模块快捷入口">
          {shortcuts.map((id) => (
            <button
              key={id}
              onClick={() => {
                close()
                root(id)
              }}
            >
              {TAB_LABELS[id]}
            </button>
          ))}
        </nav>

        <div className="ei-drawer-dev">
          <b>设备连接</b>
          {deviceModules.map((m) => (
            <div key={m.id}>
              <i data-on={state.deviceConnected || undefined} />
              {m.name}
              <span>{state.deviceConnected ? '已连接' : '未连接'}</span>
            </div>
          ))}
          <button
            className="ei-btn ei-btn-ghost"
            onClick={() => {
              patch({ deviceConnected: !state.deviceConnected })
              toast(state.deviceConnected ? '已断开三个模块' : '三个模块已连接')
            }}
          >
            {state.deviceConnected ? '断开连接' : '扫描设备'}
          </button>
        </div>

        <label className="ei-switch">
          <span>界面声音</span>
          <input
            type="checkbox"
            checked={state.soundOn}
            onChange={(e) => {
              const on = e.target.checked
              patch({ soundOn: on })
              if (!still) audio.setEnabled(on)
              if (on && !still) audio.blip()
            }}
          />
          <i aria-hidden />
        </label>
        <p className="ei-hint">关掉之后虚拟乐器、节拍器和点击反馈都不再发声，设置会记在本机。</p>
      </aside>
    </>
  )
}

/* -------------------------------------------- N3 新建 / 导入项目 */

function NewProject() {
  const { close, go, open, toast } = useScreen()
  return (
    <CenterModal title="新建 / 导入项目" onClose={close}>
      <h2 className="ei-modal-title">新建 / 导入项目</h2>
      <p className="ei-hint">四种起点都会落到同一个线上编辑器，先选一条第一轨。</p>
      <div className="ei-sheet-list">
        {newProjectSources.map((s) => (
          <button
            key={s.id}
            className="ei-row"
            onClick={() => {
              if (s.id === 'sample') {
                open({ kind: 'samplePicker', mode: 'editor' })
                return
              }
              if (s.id === 'device') {
                open({ kind: 'uploadDevice', module: '创作模块' })
                return
              }
              close()
              go('projectEditor', { projectId: 'new', title: s.label })
              toast(`已按「${s.label}」建好空工程`)
            }}
          >
            <span className="ei-row-main">
              <b>{s.label}</b>
              <small>{s.desc}</small>
            </span>
            <span className="ei-row-tail">
              <span className="ei-chev" aria-hidden style={{ transform: 'rotate(-135deg)' }} />
            </span>
          </button>
        ))}
      </div>
      <button className="ei-sheet-close" onClick={close}>
        取消
      </button>
    </CenterModal>
  )
}

/* ------------------------------------------------ N6 上传到设备 */

function UploadDevice({ module }: { module: string }) {
  const { close, toast, still, state } = useScreen()
  const [picked, setPicked] = useState(module)
  const [progress, setProgress] = useState<number | null>(still ? 62 : null)

  function send() {
    if (still) return
    setProgress(0)
    const step = () =>
      setProgress((p) => {
        if (p == null) return p
        const next = p + 7 + Math.random() * 9
        if (next >= 100) {
          toast(`已传到${picked}`)
          setTimeout(close, 420)
          return 100
        }
        setTimeout(step, 110)
        return next
      })
    setTimeout(step, 110)
  }

  return (
    <Sheet title="上传到设备" hint="选一个硬件模块，工程与采样会一起同步过去。" onClose={close}>
      <div className="ei-sheet-list">
        {deviceModules.map((m) => (
          <button
            key={m.id}
            className="ei-row"
            aria-pressed={picked === m.name}
            data-on={picked === m.name || undefined}
            onClick={() => setPicked(m.name)}
          >
            <span className="ei-dev-dot" data-on={state.deviceConnected || undefined} aria-hidden />
            <span className="ei-row-main">
              <b>{m.name}</b>
              <small>{m.detail}</small>
            </span>
          </button>
        ))}
      </div>
      {progress == null ? (
        <button className="ei-btn ei-btn-purple ei-mt" onClick={send} disabled={!state.deviceConnected}>
          {state.deviceConnected ? `传到${picked}` : '设备未连接'}
        </button>
      ) : (
        <div className="ei-xfer" role="status">
          <div className="ei-xfer-bar">
            <i style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <span>
            正在传输 {Math.round(Math.min(100, progress))}% · {picked}
          </span>
        </div>
      )}
    </Sheet>
  )
}

/* ----------------------------------------------------- N7 分享面板 */

function ShareSheet({ target, scope }: { target: string; scope: 'one' | 'team' }) {
  const { close, toast } = useScreen()
  const [tab, setTab] = useState<'one' | 'team'>(scope)
  return (
    <Sheet title="分享" onClose={close}>
      <div className="ei-seg" role="tablist" aria-label="分享方式">
        <button role="tab" aria-selected={tab === 'one'} onClick={() => setTab('one')}>
          一键分享
        </button>
        <button role="tab" aria-selected={tab === 'team'} onClick={() => setTab('team')}>
          分享到团队·社区
        </button>
      </div>
      {tab === 'one' ? (
        <>
          <div className="ei-share-qr">
            <QrArt seed={target} />
            <p className="ei-hint">扫码或复制链接都能听到这一版，原始采样跟着一起过去。</p>
          </div>
          <div className="ei-share-grid">
            {shareChannels.map((c) => (
              <button key={c.id} onClick={() => toast(`已生成${c.label}`)}>
                <span aria-hidden />
                {c.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="ei-sheet-list">
          <button className="ei-row" onClick={() => toast('已发到 BEHAND乐队')}>
            <span className="ei-row-main">
              <b>发到我的小组</b>
              <small>BEHAND乐队 · 3 人可见</small>
            </span>
          </button>
          <button className="ei-row" onClick={() => toast('已发布到社区')}>
            <span className="ei-row-main">
              <b>发布到社区</b>
              <small>进入社区瀑布流，可被点赞与转存</small>
            </span>
          </button>
          <label className="ei-switch">
            <span>允许他人转存原始采样</span>
            <input type="checkbox" defaultChecked />
            <i aria-hidden />
          </label>
        </div>
      )}
    </Sheet>
  )
}

/* -------------------------------------------------- N8 采样选择器 */

const PICKER_COPY = {
  chance: { title: '从「我的采样」获取', hint: '选一条采样当种子，算法在它上面掷骰子。', next: 'labChancePlayer' },
  voice: { title: '从「我的采样」获取', hint: '选一条人声或环境音，AI 补齐成完整编曲。', next: 'labVoiceResult' },
  fx: { title: '从「我的采样」获取', hint: '选一条采样套特效链，处理前后可以对比。', next: 'labFxRun' },
  editor: { title: '选一条采样作为第一轨', hint: '采样会落在新工程的第 3 轨。', next: 'projectEditor' },
} as const

function SamplePicker({ mode }: { mode: keyof typeof PICKER_COPY }) {
  const { close, go, toast } = useScreen()
  const copy = PICKER_COPY[mode]
  return (
    <Sheet title={copy.title} hint={copy.hint} onClose={close}>
      <div className="ei-sheet-list">
        {samples.map((s) => (
          <button
            key={s.id}
            className="ei-row"
            onClick={() => {
              go(copy.next, { sampleId: s.id, title: s.name })
              toast(`已选用「${s.name}」`)
            }}
          >
            <img className="ei-row-thumb ei-sm-thumb" src={asset(s.thumb)} alt="" width={64} height={60} loading="lazy" />
            <span className="ei-row-main">
              <b>{s.name}</b>
              <small>
                {s.length} · {s.from}
              </small>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

/* ------------------------------ 我的采样右滑后的操作条（架构图的跨模块出口） */

function SampleActions({ sampleId }: { sampleId: string }) {
  const { close, go, root, open, toast } = useScreen()
  const sample = samples.find((s) => s.id === sampleId) ?? samples[0]
  return (
    <Sheet title={sample.name} hint={`${sample.length} · 来自${sample.from}`} onClose={close}>
      <div className="ei-sheet-list">
        {sampleActions.map((a) => (
          <button
            key={a.id}
            className="ei-row"
            onClick={() => {
              if (a.id === 'fx') root('create', 'sampleFx')
              else if (a.id === 'lab') root('lab')
              else if (a.id === 'team') open({ kind: 'share', target: sample.name, scope: 'team' })
              else open({ kind: 'share', target: sample.name, scope: 'one' })
              if (a.id === 'fx' || a.id === 'lab') toast(`「${sample.name}」已带到${a.label}`)
            }}
          >
            <span className="ei-row-main">
              <b>{a.label}</b>
              <small>{a.hint}</small>
            </span>
          </button>
        ))}
        <button
          className="ei-row"
          onClick={() => open({ kind: 'uploadDevice', module: '创作模块', itemId: sample.id })}
        >
          <span className="ei-row-main">
            <b>上传设备</b>
            <small>推到采样 / 处理与演奏 / 创作模块</small>
          </span>
        </button>
      </div>
      <button className="ei-btn ei-btn-ghost ei-mt" onClick={() => go('projectEditor', { sampleId: sample.id })}>
        用它新建项目
      </button>
    </Sheet>
  )
}

/* ------------------------------------ 新建小组项目：线上 / 线下组队 */

function TeamMode({ groupId }: { groupId: string }) {
  const { close, root, toast } = useScreen()
  return (
    <Sheet title="这次怎么一起做" onClose={close}>
      <div className="ei-sheet-list">
        <button
          className="ei-row"
          onClick={() => {
            root('create', 'projects')
            toast('线上协作工程已建好，已上传创意空间')
          }}
        >
          <span className="ei-row-main">
            <b>线上协作</b>
            <small>每人一条轨，成果直接上传创意空间</small>
          </span>
        </button>
        <button
          className="ei-row"
          onClick={() => {
            root('create', 'samples')
            toast('线下排练录音已上传创意空间')
          }}
        >
          <span className="ei-row-main">
            <b>线下排练</b>
            <small>用硬件现场录，回来再上传创意空间</small>
          </span>
        </button>
      </div>
      <p className="ei-hint ei-mt">小组 {groupId} · 两条路线最后都落回「我的项目」。</p>
    </Sheet>
  )
}

/* ------------------------------------------------------ N20 全局搜索 */

const SEARCH_GROUPS = [
  { key: 'projects', label: '项目', to: 'projectPlayer', param: 'projectId' },
  { key: 'samples', label: '采样', to: 'projectEditor', param: 'sampleId' },
  { key: 'posts', label: '社区', to: 'postDetail', param: 'postId' },
  { key: 'theory', label: '乐理', to: 'knowledgeResult', param: 'termId' },
] as const

function SearchPanel() {
  const { close, go, still } = useScreen()
  const [q, setQ] = useState(still ? '夜' : '')
  const hit = (name: string) => q.length === 0 || name.includes(q) || q.length < 1

  return (
    <div className="ei-search" role="dialog" aria-modal="true" aria-label="全局搜索">
      <div className="ei-search-bar">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="8.6" cy="8.6" r="6" />
          <path d="m13.2 13.2 4.3 4.3" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          placeholder="搜项目、采样、社区作品、乐理术语"
          aria-label="搜索关键词"
          autoFocus={!still}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={close}>取消</button>
      </div>

      {q.length === 0 ? (
        <>
          <h2 className="ei-section">最近搜过</h2>
          <div className="ei-chips ei-wrap">
            {searchHistory.map((h) => (
              <button key={h} className="ei-chip" onClick={() => setQ(h)}>
                {h}
              </button>
            ))}
          </div>
          <p className="ei-hint">四个模块的内容搜在一起，结果按模块分组。</p>
        </>
      ) : (
        SEARCH_GROUPS.map((g) => {
          const rows = searchResults[g.key].filter((r) => hit(r.name))
          if (rows.length === 0) return null
          return (
            <section key={g.key}>
              <h2 className="ei-section">
                {g.label}
                <span>{rows.length} 条</span>
              </h2>
              <div className="ei-sheet-list">
                {rows.map((r) => (
                  <button key={r.id} className="ei-row" onClick={() => go(g.to, { title: r.name, [g.param]: r.id })}>
                    <span className="ei-row-main">
                      <b>{r.name}</b>
                      <small>{r.meta}</small>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}

/* ------------------------------------------------------------ 分发 */

export function OverlayHost() {
  const { nav } = useScreen()
  const o = nav.overlay
  if (!o) return null
  switch (o.kind) {
    case 'drawer':
      return <Drawer />
    case 'newProject':
      return <NewProject />
    case 'uploadDevice':
      return <UploadDevice module={o.module} />
    case 'share':
      return <ShareSheet target={o.target} scope={o.scope} />
    case 'samplePicker':
      return <SamplePicker mode={o.mode} />
    case 'sampleActions':
      return <SampleActions sampleId={o.sampleId} />
    case 'teamMode':
      return <TeamMode groupId={o.groupId} />
    case 'search':
      return <SearchPanel />
    default:
      return null
  }
}

