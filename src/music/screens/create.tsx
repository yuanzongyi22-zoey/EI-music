'use client'
// 创意空间：原稿 1/2/3/4/5（我的项目、我的采样、采样处理三阶段）复刻，
// 外加新增的 N4 项目线上编辑器、N5 项目播放 / 作品详情。
//
// N4 是整份架构图里信息密度最高的一屏，范围刻意收窄：4 条固定轨、16 小节
// 标尺、片段块由 content.ts 的 {track,bar,len} 绝对定位、三档缩放 chip 代替
// 双指缩放。v1 不做片段拖拽（已写进 docs 的未实现清单）。
import { useEffect, useRef, useState } from 'react'
import { asset } from '../assets'
import { editorClips, editorTracks, editorZooms, faders, projects, sampleFxTools, samples } from '../content'
import { ChipRow, FaderBank, PlayButton, SectionTitle, SeekBar, Waveform, useScreen } from '../chrome'
import type { Mood } from '../audio'

const BARS = 16

export function ProjectEditor() {
  const { params, open, toast, audio, still, go } = useScreen()
  const project = projects.find((p) => p.id === params.projectId)
  const name = project?.name ?? params.title ?? '新工程'
  const [zoom, setZoom] = useState<string>(editorZooms[0].id)
  const [picked, setPicked] = useState<string | null>(still ? 'cl-3' : null)
  const [playing, setPlaying] = useState(false)
  const [head, setHead] = useState(still ? 5.5 : 0)
  const raf = useRef<number | null>(null)

  // 播放头是唯一一个 rAF 循环，默认不跑；设计板上永远不跑。
  useEffect(() => {
    if (!playing || still) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setHead((h) => (h + dt * 2 > BARS ? 0 : h + dt * 2))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current)
    }
  }, [playing, still])

  const span = zoom === 'wide' ? 16 : zoom === 'mid' ? 8 : 4
  const pxPerBar = 100 / span

  return (
    <>
      <div className="ei-ed-head">
        <div>
          <b>{name}</b>
          <small>92 BPM · 4/4 · {editorTracks.length} 轨</small>
        </div>
        <PlayButton
          small
          playing={playing}
          label={playing ? '暂停' : '播放工程'}
          onClick={() => {
            if (still) return
            setPlaying((p) => !p)
            if (!playing) audio.playPad(name, project?.mood)
            else audio.stopAll()
          }}
        />
      </div>

      <ChipRow items={editorZooms.map((z) => ({ id: z.id, label: z.label }))} active={zoom} onPick={setZoom} label="时间轴缩放" />

      <div className="ei-ed">
        <div className="ei-ed-ruler" aria-hidden>
          {Array.from({ length: span }, (_, i) => (
            <span key={i} style={{ width: `${pxPerBar}%` }}>
              {i + 1}
            </span>
          ))}
        </div>
        {editorTracks.map((t, ti) => (
          <div className="ei-ed-track" key={t.id}>
            <span className="ei-ed-name" style={{ color: t.color }}>
              {t.name}
            </span>
            <div className="ei-ed-lane">
              {editorClips
                .filter((c) => c.track === ti && c.bar < span)
                .map((c) => (
                  <button
                    key={c.id}
                    className="ei-ed-clip"
                    data-on={picked === c.id || undefined}
                    style={{
                      left: `${c.bar * pxPerBar}%`,
                      width: `${Math.min(c.len, span - c.bar) * pxPerBar}%`,
                      background: t.color,
                    }}
                    onClick={() => setPicked(picked === c.id ? null : c.id)}
                  >
                    {c.label}
                  </button>
                ))}
            </div>
          </div>
        ))}
        <span
          className="ei-ed-playhead"
          style={{ left: `calc(58px + (100% - 58px) * ${Math.min(1, head / span)})` }}
          aria-hidden
        />
      </div>

      {picked ? (
        <div className="ei-ed-ops" role="group" aria-label="片段操作">
          <b>{editorClips.find((c) => c.id === picked)?.label}</b>
          {['静音', '独奏', '删除'].map((op) => (
            <button key={op} onClick={() => toast(`${op}：原型里只记一次操作`)}>
              {op}
            </button>
          ))}
        </div>
      ) : (
        <p className="ei-hint ei-mt">点一个片段出静音 / 独奏 / 删除。v1 不做拖拽移动片段。</p>
      )}

      <SectionTitle>给这个工程加东西</SectionTitle>
      <div className="ei-sheet-list">
        <button className="ei-row" onClick={() => open({ kind: 'samplePicker', mode: 'editor' })}>
          <span className="ei-row-main">
            <b>吸取我的采样</b>
            <small>从「我的采样」挑一条铺到空轨</small>
          </span>
        </button>
        <button className="ei-row" onClick={() => open({ kind: 'uploadDevice', module: '创作模块', itemId: params.projectId })}>
          <span className="ei-row-main">
            <b>上传到设备</b>
            <small>整段工程同步到创作模块</small>
          </span>
        </button>
      </div>
      <button className="ei-btn ei-btn-purple ei-mt" onClick={() => go('projectPlayer', { projectId: params.projectId ?? 'p-1' })}>
        导出并试听
      </button>
    </>
  )
}

export function ProjectPlayer() {
  const { params, open, audio, still, toast } = useScreen()
  const project = projects.find((p) => p.id === params.projectId) ?? projects[0]
  const [playing, setPlaying] = useState(false)
  const [pct, setPct] = useState(still ? 38 : 0)

  useEffect(() => {
    if (!playing || still) return
    const t = setInterval(() => setPct((p) => (p >= 100 ? 0 : p + 1)), 220)
    return () => clearInterval(t)
  }, [playing, still])

  const total = project.meta.split('· ')[1] ?? '02:18'

  return (
    <>
      <div className="ei-player">
        <img src={asset(project.cover)} alt="" width={240} height={240} loading="lazy" />
        <b>{project.name}</b>
        <small>
          {project.meta} · 更新于{project.updated}
        </small>
      </div>

      <Waveform seed={project.id} lit={pct / 100} bars={56} />
      <SeekBar at={fmt(total, pct)} total={total} pct={pct} />

      <div className="ei-player-ops">
        <PlayButton
          playing={playing}
          label={playing ? '暂停' : '播放作品'}
          onClick={() => {
            if (still) return
            setPlaying((p) => !p)
            if (!playing) audio.playPad(project.id, project.mood)
            else audio.stopAll()
          }}
        />
      </div>

      <div className="ei-sheet-list ei-mt">
        <button className="ei-row" onClick={() => open({ kind: 'share', target: project.name, scope: 'one' })}>
          <span className="ei-row-main">
            <b>分享</b>
            <small>一键分享，或发到团队·社区</small>
          </span>
        </button>
        <button
          className="ei-row"
          onClick={() => open({ kind: 'uploadDevice', module: '创作模块', itemId: project.id })}
        >
          <span className="ei-row-main">
            <b>上传到设备</b>
            <small>推到硬件三个模块之一</small>
          </span>
        </button>
        <button className="ei-row" onClick={() => toast('已存为新版本')}>
          <span className="ei-row-main">
            <b>另存为新版本</b>
            <small>原版本保留在我的项目里</small>
          </span>
        </button>
      </div>
    </>
  )
}

/** 把百分比折回 mm:ss，和总时长用同一个刻度。 */
function fmt(total: string, pct: number): string {
  const [m, s] = total.split(':').map((n) => Number(n) || 0)
  const at = Math.round(((m * 60 + s) * pct) / 100)
  return `${String(Math.floor(at / 60)).padStart(2, '0')}:${String(at % 60).padStart(2, '0')}`
}

/* ---------------------------------------------- 原稿 1 · 我的项目 */

const PROJECT_FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'recent', label: '最近编辑' },
  { id: 'draft', label: '本次新建' },
]

export function MyProjects() {
  const { go, open, audio, still, state, toast } = useScreen()
  const [filter, setFilter] = useState('all')
  const [playing, setPlaying] = useState<string | null>(still ? 'p-1' : null)

  const drafts = state.drafts.map((d) => ({
    id: d.id,
    name: d.name,
    meta: `${d.from} · 未导出`,
    cover: projects[0].cover,
    updated: '刚刚',
    mood: undefined,
  }))
  const all = [...drafts, ...projects]
  const list = filter === 'recent' ? all.slice(0, 3) : filter === 'draft' ? drafts : all

  // 气质跟着名字走：夜班电台是小调慢板，夏夜舞曲是 120 BPM 四踩。
  function hear(id: string, name: string, mood?: Mood) {
    if (still) return
    if (playing === id) {
      setPlaying(null)
      audio.stopAll()
      return
    }
    setPlaying(id)
    audio.playPad(name, mood)
  }

  return (
    <>
      <ChipRow items={PROJECT_FILTERS} active={filter} onPick={setFilter} label="项目筛选" />

      {list.length === 0 ? (
        <p className="ei-hint">这一档还没有项目。点右下角的加号新建一个。</p>
      ) : null}

      <div className="ei-sheet-list">
        {list.map((p) => (
          <div className="ei-row" key={p.id}>
            <button className="ei-row-hit" onClick={() => go('projectEditor', { projectId: p.id, title: p.name })}>
              <img className="ei-row-thumb" src={asset(p.cover)} alt="" width={84} height={82} loading="lazy" />
              <span className="ei-row-main">
                <b>{p.name}</b>
                <small>
                  {p.meta} · {p.updated}
                </small>
              </span>
            </button>
            <PlayButton
              small
              playing={playing === p.id}
              label={playing === p.id ? `暂停 ${p.name}` : `试听 ${p.name}`}
              onClick={() => hear(p.id, p.name, p.mood)}
            />
          </div>
        ))}
      </div>

      <SectionTitle aside="线下采集的工程也会同步进来">从硬件拿工程</SectionTitle>
      <button
        className="ei-btn ei-btn-ghost"
        onClick={() => (state.deviceConnected ? open({ kind: 'newProject' }) : toast('设备未连接，先去抽屉里连一下'))}
      >
        读取创作模块
      </button>

      {/* 实心白圆 + 紫色加号。原来是深紫圆钮，压在深色列表上几乎看不见。 */}
      <button className="ei-fab" onClick={() => open({ kind: 'newProject' })} aria-label="新建或导入项目">
        <i aria-hidden />
      </button>
    </>
  )
}

/* ---------------------------------------------- 原稿 2 · 我的采样 */

/**
 * 原稿里这一列是左滑出操作条。触屏上留着左滑，但不能只有手势：
 * 每行同时给一个「更多」按钮，键盘和读屏也要能走到那四个跨模块出口。
 */
export function MySamples() {
  const { open, audio, still, state, toast } = useScreen()
  const [playing, setPlaying] = useState<string | null>(null)
  const [swiped, setSwiped] = useState<string | null>(still ? 's-2' : null)
  const from = useRef<{ id: string; x: number } | null>(null)

  const recorded = state.recorded.map((r) => ({
    id: r.id,
    name: r.name,
    length: r.length,
    date: '刚刚',
    thumb: samples[0].thumb,
    from: '虚拟乐器',
    mood: undefined,
  }))
  const list = [...recorded, ...samples]

  function hear(s: { id: string; mood?: Mood }) {
    if (still) return
    setPlaying(playing === s.id ? null : s.id)
    if (playing === s.id) audio.stopAll()
    else audio.playPad(s.id, s.mood)
  }

  return (
    <>
      <p className="ei-hint">左滑一行出操作，或者点右边的「更多」。采样是四个模块之间流转的东西，出口都在这里。</p>

      <div className="ei-sheet-list ei-mt">
        {list.map((s) => (
          <div
            className="ei-row"
            key={s.id}
            data-swiped={swiped === s.id || undefined}
            onPointerDown={(e) => {
              from.current = { id: s.id, x: e.clientX }
            }}
            onPointerUp={(e) => {
              if (!from.current || from.current.id !== s.id) return
              const dx = e.clientX - from.current.x
              from.current = null
              if (dx < -36) setSwiped(s.id)
              else if (dx > 36) setSwiped(null)
            }}
          >
            <button className="ei-row-hit" onClick={() => hear(s)}>
              <img className="ei-row-thumb" src={asset(s.thumb)} alt="" width={84} height={82} loading="lazy" />
              <span className="ei-row-main">
                <b>{s.name}</b>
                <small>
                  {s.length} · {s.date} · {s.from}
                </small>
              </span>
            </button>
            <span className="ei-row-tail">
              <PlayButton small playing={playing === s.id} label={`试听 ${s.name}`} onClick={() => hear(s)} />
              <button className="ei-row-more" onClick={() => open({ kind: 'sampleActions', sampleId: s.id })} aria-label={`${s.name} 的更多操作`}>
                ⋯
              </button>
            </span>
            {swiped === s.id ? (
              <div className="ei-swipe" role="group" aria-label={`${s.name} 快捷操作`}>
                <button onClick={() => open({ kind: 'sampleActions', sampleId: s.id })}>去处理</button>
                <button onClick={() => open({ kind: 'share', target: s.name, scope: 'one' })}>分享</button>
                <button onClick={() => toast('原型不真删，列表保持原样')}>删除</button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <SectionTitle aside={`${list.length} 条`}>采样都从哪来</SectionTitle>
      <div className="ei-sheet-list">
        <button className="ei-row" onClick={() => open({ kind: 'uploadDevice', module: '采样模块' })}>
          <span className="ei-row-main">
            <b>从采样模块导入</b>
            <small>读硬件 8 个槽位里的现场录音</small>
          </span>
        </button>
        <button className="ei-row" onClick={() => toast('原型不开麦，录音只做个样子')}>
          <span className="ei-row-main">
            <b>手机直接录</b>
            <small>按住录，松手存成一条采样</small>
          </span>
        </button>
      </div>
    </>
  )
}

/* -------------------------------------- 原稿 3/4/5 · 采样处理 */

/** 三张原稿是一屏的三个阶段：选素材 → 选工具 → 手动推子 + 前后对比。 */

/** 处理工具各自的听感：去噪更干净、修补更稳、节奏整形更带劲。 */
const TOOL_MOODS: Record<string, Mood> = {
  denoise: 'dream',
  repair: 'night',
  aiGroove: 'dance',
  handGroove: 'street',
}

export function SampleFx() {
  const { open, audio, still, toast, root } = useScreen()
  const [sampleId, setSampleId] = useState<string>(samples[1].id)
  const [tool, setTool] = useState<string>(sampleFxTools[0].id)
  const [vals, setVals] = useState<number[]>(faders.map((f) => f.value))
  const [done, setDone] = useState(still)
  const [hearing, setHearing] = useState<'before' | 'after' | null>(null)

  const sample = samples.find((s) => s.id === sampleId) ?? samples[0]
  const picked = sampleFxTools.find((t) => t.id === tool) ?? sampleFxTools[0]

  function hear(which: 'before' | 'after') {
    if (still) return
    setHearing(which)
    // 处理前放素材本来的气质，处理后按工具换一个，这样 A/B 真的能听出差别。
    if (which === 'before') audio.playPad(sample.id, sample.mood)
    else audio.playPad(`${sample.id}:${tool}:${vals.join()}`, TOOL_MOODS[tool] ?? 'collage')
  }

  return (
    <>
      <SectionTitle aside="点一下换素材">处理哪一条</SectionTitle>
      <ChipRow items={samples.map((s) => ({ id: s.id, label: s.name }))} active={sampleId} onPick={setSampleId} label="选采样" />
      <div className="ei-row">
        <img className="ei-row-thumb" src={asset(sample.thumb)} alt="" width={84} height={82} loading="lazy" />
        <span className="ei-row-main">
          <b>{sample.name}</b>
          <small>
            {sample.length} · {sample.from}
          </small>
        </span>
        <PlayButton small label="试听原始采样" onClick={() => hear('before')} />
      </div>

      <SectionTitle aside={picked.auto ? '一键完成' : '自己调四个推子'}>处理工具</SectionTitle>
      <div className="ei-sheet-list">
        {sampleFxTools.map((t) => (
          <button
            key={t.id}
            className="ei-row"
            data-on={t.id === tool || undefined}
            onClick={() => {
              setTool(t.id)
              setDone(false)
            }}
          >
            <span className="ei-row-main">
              <b>{t.label}</b>
              <small>{t.desc}</small>
            </span>
            <span className="ei-row-tail">{t.auto ? '一键' : '手动'}</span>
          </button>
        ))}
      </div>

      {picked.auto ? (
        <button
          className="ei-btn ei-btn-purple ei-mt"
          onClick={() => {
            setDone(true)
            if (!still) audio.blip(720)
            toast(`${picked.label}：已处理一遍`)
          }}
        >
          {done ? '再处理一次' : picked.label}
        </button>
      ) : (
        <>
          <FaderBank
            items={faders.map((f, i) => ({ ...f, value: vals[i] }))}
            onNudge={(id, value) => {
              setVals((v) => v.map((old, i) => (faders[i].id === id ? value : old)))
              setDone(true)
              if (!still) audio.blip(380 + value * 4)
            }}
          />
          <p className="ei-hint ei-mt">点推子轨道会往上跳一档并响一声——原型不做拖拽，手势成本留给真机。</p>
        </>
      )}

      <SectionTitle aside="同一段素材">处理前 / 处理后</SectionTitle>
      <div className="ei-ab">
        <div data-on={hearing === 'before' || undefined}>
          <span>处理前</span>
          <Waveform seed={sample.id} lit={hearing === 'before' ? 0.6 : 0.25} bars={40} />
          <PlayButton small label="试听处理前" onClick={() => hear('before')} />
        </div>
        <div data-on={hearing === 'after' || undefined}>
          <span>
            处理后 · {picked.label}
            {done ? '' : '（还没处理）'}
          </span>
          <Waveform seed={`${sample.id}:${tool}:${vals.join()}`} lit={hearing === 'after' ? 0.75 : 0.45} bars={40} />
          <PlayButton small label="试听处理后" onClick={() => hear('after')} />
        </div>
      </div>

      <SectionTitle>处理完去哪</SectionTitle>
      <div className="ei-sheet-list">
        <button
          className="ei-row"
          onClick={() => {
            root('create', 'samples')
            toast(`「${sample.name}」已覆盖保存`)
          }}
        >
          <span className="ei-row-main">
            <b>存回我的采样</b>
            <small>覆盖原条目，处理链可回溯</small>
          </span>
        </button>
        <button className="ei-row" onClick={() => open({ kind: 'uploadDevice', module: '处理与演奏模块', itemId: sample.id })}>
          <span className="ei-row-main">
            <b>上传到设备</b>
            <small>载入处理与演奏模块，手上现场弹</small>
          </span>
        </button>
        <button className="ei-row" onClick={() => open({ kind: 'share', target: sample.name, scope: 'team' })}>
          <span className="ei-row-main">
            <b>分享到团队·社区</b>
            <small>带着处理参数一起发出去</small>
          </span>
        </button>
      </div>
    </>
  )
}
