'use client'
// 乐器乐理：原稿 17/18（虚拟乐器分类、乐理学习）复刻，外加新增的
// N17 虚拟乐器·体验与创作 / N18 乐理课程详情 / N19 知识查询结果。
// 键盘、指板、五线谱、和弦图都是画的：它们必须跟按下状态和数据联动，
// 裁图做不到。音色全走振荡器合成，没有任何音频文件。
import { useEffect, useRef, useState } from 'react'
import { asset } from '../assets'
import { instrumentCategories, instruments, knowledgeTerms, theoryLessons } from '../content'
import { ChipRow, SectionTitle, useScreen } from '../chrome'
import { ChordArt, ColorTile, FretboardArt, KeyboardArt, MetronomeArt, MicHaloArt, StaffArt } from '../art'

const TIMBRE_NAMES = { piano: '钢琴音色', guitar: '吉他音色', pluck: '拨弦音色', bell: '钟琴音色' } as const

export function InstrumentPlay() {
  const { params, audio, still, toast, root, state } = useScreen()
  const categoryId = params.categoryId ?? 'guitar'
  const list = instruments[categoryId as keyof typeof instruments] ?? instruments.guitar
  const [pickedId, setPickedId] = useState<string>(list[0].id)
  const picked = list.find((i) => i.id === pickedId) ?? list[0]
  const category = instrumentCategories.find((c) => c.id === categoryId)
  const [held, setHeld] = useState<number[]>(still ? [60, 64, 67] : [])
  const [recording, setRecording] = useState(false)
  const [bars, setBars] = useState(still ? 2 : 0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!recording || still) return
    timer.current = setInterval(() => setBars((b) => b + 1), 1900)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [recording, still])

  // 离开这屏掐掉一切还在响的音，否则尾音会跟着你走。
  useEffect(() => () => audio.stopAll(), [audio])

  function hit(midi: number) {
    setHeld((h) => [...h.filter((m) => m !== midi), midi].slice(-4))
    // oct 让同一类里的两把乐器落在不同音域，贝斯不会和吉他一个声。
    if (!still) audio.note(midi + picked.oct, picked.timbre)
    if (still) return
    window.setTimeout(() => setHeld((h) => h.filter((m) => m !== midi)), 260)
  }

  return (
    <>
      <div className="ei-inst-head">
        <div>
          <b>{picked.name}</b>
          <small>
            {category?.name ?? '虚拟乐器'} · {TIMBRE_NAMES[picked.timbre]}
          </small>
        </div>
        {recording ? <MicHaloArt live={!still} /> : null}
      </div>

      <ChipRow items={list.map((i) => ({ id: i.id, label: i.name }))} active={pickedId} onPick={setPickedId} label="选乐器" />
      <button className="ei-btn ei-btn-purple ei-btn-sm" onClick={() => !still && audio.demo(picked.timbre, picked.layout, picked.oct)}>
        先听一句 {picked.name}
      </button>

      <div className="ei-inst-stage">
        {picked.layout === 'fret' ? (
          <FretboardArt held={held} onHit={hit} />
        ) : picked.layout === 'keys' ? (
          <KeyboardArt held={held} onHit={hit} />
        ) : (
          <div className="ei-pads" role="group" aria-label="打击垫">
            {[36, 38, 42, 46, 49, 51].map((m, i) => (
              <button key={m} data-held={held.includes(m) || undefined} aria-label={`打击垫 ${i + 1}`} onPointerDown={() => hit(m)}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="ei-hint">
        {picked.layout === 'fret' ? '6 弦 × 5 格，点哪格响哪个音。' : picked.layout === 'keys' ? '14 个白键，黑键按真实排布缺两处。' : '六个打击垫走一次性白噪 buffer。'}
        {state.soundOn ? '' : ' 当前界面声音已关。'}
      </p>

      <SectionTitle aside={recording ? `已录 ${bars} 小节` : '录下来可以存进我的采样'}>录制</SectionTitle>
      <div className="ei-sheet-list">
        <button
          className="ei-row"
          data-on={recording || undefined}
          onClick={() => {
            if (still) return
            setRecording((r) => !r)
            if (recording) toast(`录了 ${bars} 小节，记得保存`)
            else setBars(0)
          }}
        >
          <span className="ei-row-main">
            <b>{recording ? '停止录制' : '开始录制'}</b>
            <small>{recording ? '再点一次结束，然后保存' : '边弹边录，按小节计数'}</small>
          </span>
        </button>
        <button
          className="ei-row"
          onClick={() => {
            root('create', 'samples')
            toast(`「${picked.name} 即兴」已存到我的采样`)
          }}
        >
          <span className="ei-row-main">
            <b>存到我的采样</b>
            <small>回到创意空间，可以直接拿去做项目</small>
          </span>
        </button>
      </div>
    </>
  )
}

export function TheoryLesson() {
  const { params, audio, still, toast } = useScreen()
  const lesson = theoryLessons.find((l) => l.id === params.lessonId) ?? theoryLessons[0]
  const [at, setAt] = useState<number>(still ? 1 : -1)
  const [beat, setBeat] = useState(still ? 1 : 0)
  const [metro, setMetro] = useState(false)
  const [bpm, setBpm] = useState(80)

  useEffect(() => {
    if (!metro || still) return
    audio.startMetronome(bpm, (b) => setBeat(b))
    return () => audio.stopMetronome()
  }, [metro, bpm, still, audio])

  useEffect(() => () => audio.stopAll(), [audio])

  function playScale() {
    if (still) return
    audio.scale([...lesson.scale])
    lesson.scale.forEach((_, i) => window.setTimeout(() => setAt(i), i * 260))
    window.setTimeout(() => setAt(-1), lesson.scale.length * 260 + 300)
  }

  return (
    <>
      <div className="ei-lesson-head">
        <b>{lesson.name}</b>
        <small>
          {lesson.level} · {lesson.meta} · {lesson.scaleName}
        </small>
      </div>

      <div className="ei-card ei-staff-wrap">
        <StaffArt midis={lesson.scale} active={at >= 0 ? at : undefined} />
      </div>
      <button className="ei-btn ei-btn-purple ei-mt" onClick={playScale}>
        听一遍 {lesson.scaleName}
      </button>

      <SectionTitle aside={`${bpm} BPM`}>跟着节拍器</SectionTitle>
      <div className="ei-card ei-metro-wrap">
        <MetronomeArt beat={beat} />
        <div className="ei-metro-ops">
          <button className="ei-chip" onClick={() => setBpm((b) => Math.max(40, b - 10))} aria-label="减速">
            −10
          </button>
          <button className="ei-chip" aria-pressed={metro} onClick={() => !still && setMetro((m) => !m)}>
            {metro ? '停止' : '开始'}
          </button>
          <button className="ei-chip" onClick={() => setBpm((b) => Math.min(200, b + 10))} aria-label="加速">
            +10
          </button>
        </div>
      </div>
      <p className="ei-hint">节拍器用 25ms 前瞻调度，不是每拍一个 timeout，久了也不会漂。</p>

      <SectionTitle>课程讲解</SectionTitle>
      {lesson.body.map((p) => (
        <p className="ei-lesson-p" key={p}>
          {p}
        </p>
      ))}
      <button className="ei-btn ei-btn-ghost ei-mt" onClick={() => toast('已标记学完')}>
        标记学完
      </button>
    </>
  )
}

export function KnowledgeResult() {
  const { params, audio, still, root } = useScreen()
  const [termId, setTermId] = useState(params.termId ?? knowledgeTerms[0].id)
  const term = knowledgeTerms.find((t) => t.id === termId) ?? knowledgeTerms[0]

  useEffect(() => () => audio.stopAll(), [audio])

  return (
    <>
      <div className="ei-term-head">
        <span className="ei-chip" aria-hidden>
          {term.kind}
        </span>
        <b>{term.name}</b>
      </div>
      <p className="ei-lesson-p">{term.summary}</p>

      <SectionTitle aside={term.noteNames.join(' · ')}>构成音</SectionTitle>
      <div className="ei-card ei-term-card">
        {term.frets.length > 0 ? <ChordArt frets={term.frets} /> : <StaffArt midis={term.notes} />}
        <div className="ei-term-ops">
          <button className="ei-btn ei-btn-purple" onClick={() => !still && audio.chord([...term.notes])}>
            一起听
          </button>
          <button className="ei-btn ei-btn-ghost" onClick={() => !still && audio.scale([...term.notes])}>
            逐个听
          </button>
        </div>
      </div>
      {term.frets.length > 0 ? (
        <p className="ei-hint">和弦图按 frets 数组画，0 为空弦画空心圈。</p>
      ) : (
        <p className="ei-hint">这是个术语而不是具体和弦，所以用五线谱举例。</p>
      )}

      <SectionTitle>相关</SectionTitle>
      <div className="ei-chips ei-wrap">
        {term.related.map((r) => {
          const hit = knowledgeTerms.find((t) => (t.name as string) === (r as string))
          return (
            <button
              key={r}
              className="ei-chip"
              onClick={() => (hit ? setTermId(hit.id) : root('instrument', 'theory'))}
            >
              {r}
            </button>
          )
        })}
      </div>
      <p className="ei-hint">能查到的术语在同一屏换内容，查不到的回乐理学习列表。</p>
    </>
  )
}

/* ---------------------------------------------- 原稿 17 · 虚拟乐器 */

export function Instruments() {
  const { go, open, toast } = useScreen()
  return (
    <>
      <p className="ei-hint">五类乐器，点进去选具体一把，再在屏幕上弹。打击乐与电子乐器没有产品图，用色块代替。</p>

      <div className="ei-inst-grid ei-mt">
        {instrumentCategories.map((c) => (
          <button key={c.id} className="ei-inst-card" onClick={() => go('instrumentCategory', { categoryId: c.id })}>
            {c.art ? (
              <img src={asset(c.art)} alt="" width={160} height={134} loading="lazy" />
            ) : (
              <ColorTile color={c.id === 'percussion' ? '#FFA451' : '#7876FF'}>{c.en}</ColorTile>
            )}
            <b>{c.name}</b>
            <small>
              {c.en} · {c.count} 件
            </small>
          </button>
        ))}
      </div>

      <SectionTitle aside="线下模块也能当控制器">连上硬件弹</SectionTitle>
      <button className="ei-btn ei-btn-ghost" onClick={() => open({ kind: 'uploadDevice', module: '处理与演奏模块' })}>
        推一套音色到处理与演奏模块
      </button>
      <button className="ei-btn ei-btn-ghost ei-mt" onClick={() => toast('原型不接 MIDI 设备')}>
        用外接 MIDI 键盘
      </button>
    </>
  )
}

/* --------------------------------------- 原稿 17 · 某一类乐器列表 */

export function InstrumentCategory() {
  const { params, go, audio, still } = useScreen()
  const categoryId = params.categoryId ?? 'guitar'
  const category = instrumentCategories.find((c) => c.id === categoryId) ?? instrumentCategories[0]
  const list = instruments[categoryId as keyof typeof instruments] ?? instruments.guitar

  return (
    <>
      {category.art ? (
        <img className="ei-hero" src={asset(category.art)} alt="" width={361} height={200} loading="lazy" />
      ) : null}
      <div className="ei-inst-head">
        <div>
          <b>{category.name}</b>
          <small>
            {category.en} · 共 {category.count} 件，原型做了 {list.length} 件
          </small>
        </div>
      </div>

      <div className="ei-sheet-list">
        {list.map((i) => (
          <div className="ei-row" key={i.id}>
            <button className="ei-row-hit" onClick={() => go('instrumentPlay', { categoryId, title: i.name })}>
              <span className="ei-row-main">
                <b>{i.name}</b>
                <small>
                  {i.layout === 'fret' ? '指板布局' : i.layout === 'keys' ? '键盘布局' : '打击垫布局'} · {TIMBRE_NAMES[i.timbre]}
                </small>
              </span>
            </button>
            <button
              className="ei-btn ei-btn-purple ei-btn-sm"
              onClick={() => !still && audio.demo(i.timbre, i.layout, i.oct)}
              aria-label={`试听 ${i.name}`}
            >
              试听
            </button>
          </div>
        ))}
      </div>
      <p className="ei-hint ei-mt">架构图里每类乐器有更多件，原型只实现了能弹的这几件。</p>
    </>
  )
}

/* ---------------------------------------------- 原稿 18 · 乐理学习 */

export function Theory() {
  const { go, open, audio, still } = useScreen()
  const [level, setLevel] = useState('all')
  const list = level === 'all' ? theoryLessons : theoryLessons.filter((l) => l.level === level)

  return (
    <>
      <button className="ei-search-fake" onClick={() => open({ kind: 'search' })}>
        <span>查个术语，比如 Gmaj11</span>
      </button>

      <ChipRow
        items={[
          { id: 'all', label: '全部' },
          { id: '入门', label: '入门' },
          { id: '进阶', label: '进阶' },
        ]}
        active={level}
        onPick={setLevel}
        label="难度"
      />

      <SectionTitle aside={`${list.length} 节`}>课程</SectionTitle>
      <div className="ei-sheet-list">
        {list.map((l) => (
          <div className="ei-row" key={l.id}>
            <button className="ei-row-hit" onClick={() => go('theoryLesson', { lessonId: l.id })}>
              <span className="ei-row-main">
                <b>{l.name}</b>
                <small>
                  {l.level} · {l.meta} · {l.scaleName}
                </small>
              </span>
            </button>
            <button className="ei-chip" onClick={() => !still && audio.scale([...l.scale])} aria-label={`听 ${l.scaleName}`}>
              听音阶
            </button>
          </div>
        ))}
      </div>

      <SectionTitle aside="查到的术语可以试听">术语卡</SectionTitle>
      <div className="ei-chips ei-wrap">
        {knowledgeTerms.map((t) => (
          <button key={t.id} className="ei-chip" onClick={() => go('knowledgeResult', { termId: t.id })}>
            {t.name}
          </button>
        ))}
      </div>
      <p className="ei-hint ei-mt">课程里的音阶、和弦、节拍器都是振荡器合成的，没有音频文件。</p>
    </>
  )
}
