'use client'
// AI实验室：原稿 6 的纵向 coverflow 入口、7–12 的四个功能流程，
// 外加新增的 N9 AI特效处理入口 / N10 处理与输出 / N11 图片转音乐·合集播放。
// N10 继承原稿 4、5（采样处理）的「工具行 + 推子组 + 前后对比」语言，
// 只把手动推子换成特效预设，保证两个模块看起来是一家人。
import { useEffect, useRef, useState } from 'react'
import { asset } from '../assets'
import { albums, chanceKeywords, chanceParams, feedPosts, fxPresets, labCards, samples } from '../content'
import { ChipRow, FaderBank, PlayButton, SectionTitle, Waveform, useScreen } from '../chrome'
import { MicHaloArt, VinylArt } from '../art'
import type { ScreenId } from '../nav'

/* ----------------------------------------- 原稿 6 · AI实验室入口 */

/**
 * 纵向 coverflow。吸附交给 CSS scroll-snap，居中那张由 scrollTop 算出来，
 * 不用 IntersectionObserver——卡片数固定是 4 张，一次除法就够了。
 */
export function LabHub() {
  const { go, still } = useScreen()
  const box = useRef<HTMLDivElement | null>(null)
  const [at, setAt] = useState(still ? 1 : 0)

  return (
    <>
      <p className="ei-hint">四个功能都吃同一批素材：关键词、你的采样、一段哼唱、一个照片合集。</p>
      <div
        className="ei-flow"
        ref={box}
        onScroll={() => {
          const el = box.current
          if (!el || still) return
          const stride = el.scrollHeight / labCards.length
          setAt(Math.min(labCards.length - 1, Math.round(el.scrollTop / stride)))
        }}
      >
        {labCards.map((c, i) => (
          <button
            key={c.id}
            className="ei-flow-card"
            data-at={i === at || undefined}
            onClick={() => go(c.screen as ScreenId)}
          >
            <img src={asset(c.art)} alt="" width={330} height={232} loading="lazy" />
            <span>
              <i>{c.en}</i>
              <b>{c.name}</b>
              <small>{c.desc}</small>
            </span>
          </button>
        ))}
      </div>
      <p className="ei-hint ei-mt">上下滚会吸附到中间那张；点卡片进流程。</p>
    </>
  )
}

export function LabFx() {
  const { open, go } = useScreen()
  const shared = feedPosts.slice(0, 3)
  return (
    <div className="ei-fill">
      <p className="ei-hint">特效处理要先有一段素材。架构图给了两个来源，选哪个都走同一条处理链。</p>

      <SectionTitle aside="社区热门">社区共享音乐</SectionTitle>
      <div className="ei-sheet-list">
        {shared.map((p) => (
          <button key={p.id} className="ei-row" onClick={() => go('labFxRun', { postId: p.id, title: p.title })}>
            <img className="ei-row-thumb ei-sm-thumb" src={asset(p.art)} alt="" width={64} height={60} loading="lazy" />
            <span className="ei-row-main">
              <b>{p.title}</b>
              <small>
                {p.author} · {p.kind}
              </small>
            </span>
          </button>
        ))}
      </div>
      <p className="ei-hint ei-mt">共享音乐只能听与处理，不能转存原始工程；自己的采样处理完可以存回创意空间。</p>

      <div className="ei-actions">
        <button className="ei-btn ei-btn-purple" onClick={() => open({ kind: 'samplePicker', mode: 'fx' })}>
          <b>从我的采样获取</b>
          <small>{samples.length} 条，处理完能存回创意空间</small>
        </button>
      </div>
    </div>
  )
}

export function LabFxRun() {
  const { params, audio, still, toast, root, open } = useScreen()
  const source = samples.find((s) => s.id === params.sampleId)
  const name = source?.name ?? params.title ?? '社区共享音乐'
  const [preset, setPreset] = useState<string>(fxPresets[0].id)
  const [playing, setPlaying] = useState<'before' | 'after' | null>(null)

  useEffect(() => {
    if (still) return
    return () => audio.stopAll()
  }, [preset, still, audio])

  function hear(which: 'before' | 'after') {
    if (still) return
    setPlaying(which)
    // 换预设真的换声音：每个预设在 content.ts 里带一个 mood。
    if (which === 'before') audio.playPad(name, source?.mood)
    else audio.playPad(`${name}:${preset}`, fxPresets.find((p) => p.id === preset)?.mood)
  }

  return (
    <div className="ei-fill">
      <div className="ei-fx-head">
        <b>{name}</b>
        <small>{source ? `${source.length} · ${source.from}` : '来自社区共享'}</small>
      </div>

      <SectionTitle aside="单选">特效预设</SectionTitle>
      <ChipRow items={fxPresets.map((p) => ({ id: p.id, label: p.label }))} active={preset} onPick={setPreset} label="特效预设" />
      <p className="ei-hint">{fxPresets.find((p) => p.id === preset)?.desc}</p>

      <SectionTitle aside="同一段素材">处理前 / 处理后</SectionTitle>
      <div className="ei-ab">
        <div data-on={playing === 'before' || undefined}>
          <span>处理前</span>
          <Waveform seed={name} lit={playing === 'before' ? 0.6 : 0.25} bars={40} />
          <PlayButton small label="试听处理前" onClick={() => hear('before')} />
        </div>
        <div data-on={playing === 'after' || undefined}>
          <span>处理后 · {fxPresets.find((p) => p.id === preset)?.label}</span>
          <Waveform seed={`${name}:${preset}`} lit={playing === 'after' ? 0.72 : 0.45} bars={40} />
          <PlayButton small label="试听处理后" onClick={() => hear('after')} />
        </div>
      </div>

      <SectionTitle>输出到哪里</SectionTitle>
      <div className="ei-actions">
        <button
          className="ei-btn ei-btn-purple"
          onClick={() => {
            root('create', 'samples')
            toast(`「${name}」已存到我的采样`)
          }}
        >
          <b>上传到创意空间</b>
          <small>存成一条新采样，可以继续做项目</small>
        </button>
        <button className="ei-btn ei-btn-ghost" onClick={() => open({ kind: 'share', target: name, scope: 'team' })}>
          <b>上传到互动与社区</b>
          <small>发到小组或社区，附带所用预设</small>
        </button>
      </div>
    </div>
  )
}

export function LabPictureAlbum() {
  const { params, audio, still, toast, open } = useScreen()
  const album = albums.find((a) => a.id === params.albumId) ?? albums[0]
  const [idx, setIdx] = useState(still ? 1 : 0)
  const [playing, setPlaying] = useState(false)
  const shots = albums.map((a) => a.cover)

  useEffect(() => {
    if (!playing || still) return
    const t = setInterval(() => setIdx((i) => (i + 1) % shots.length), 2600)
    return () => clearInterval(t)
  }, [playing, still, shots.length])

  return (
    <div className="ei-fill">
      <div className="ei-shots">
        <img src={asset(shots[idx])} alt={`${album.name} 第 ${idx + 1} 张`} width={330} height={300} loading="lazy" />
        <div className="ei-shots-dots" aria-hidden>
          {shots.map((s, i) => (
            <i key={s} data-on={i === idx || undefined} />
          ))}
        </div>
      </div>

      <div className="ei-shots-meta">
        <b>{album.name}</b>
        <small>
          {album.count} 张照片 · 按画面情绪生成 · 02:36
        </small>
      </div>

      <Waveform seed={album.id} lit={playing ? 0.55 : 0.3} bars={48} />

      <div className="ei-player-ops">
        <button className="ei-icon-btn" aria-label="上一张" onClick={() => setIdx((i) => (i - 1 + shots.length) % shots.length)}>
          <span className="ei-chev" aria-hidden />
        </button>
        <PlayButton
          playing={playing}
          label={playing ? '暂停' : '播放配乐'}
          onClick={() => {
            if (still) return
            setPlaying((p) => !p)
            if (!playing) audio.playPad(album.id, album.mood)
            else audio.stopAll()
          }}
        />
        <button className="ei-icon-btn" aria-label="下一张" onClick={() => setIdx((i) => (i + 1) % shots.length)}>
          <span className="ei-chev" aria-hidden style={{ transform: 'rotate(-135deg)' }} />
        </button>
      </div>

      <div className="ei-actions">
        <button className="ei-btn ei-btn-purple" onClick={() => open({ kind: 'share', target: album.name, scope: 'one' })}>
          <b>分享这一版</b>
          <small>照片与配乐一起带走</small>
        </button>
        <button className="ei-btn ei-btn-ghost" onClick={() => toast('原型不落盘，下载只做个样子')}>
          <b>下载配乐</b>
          <small>wav · 24bit / 48kHz</small>
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------- 原稿 7 · 偶然音乐 */

export function LabChance() {
  const { go, open } = useScreen()
  const card = labCards[0]
  return (
    <div className="ei-fill">
      <img className="ei-hero" src={asset(card.art)} alt="" width={361} height={220} loading="lazy" />
      <div className="ei-fx-head">
        <b>{card.name}</b>
        <small>{card.en} · 让算法替你掷骰子</small>
      </div>
      <p className="ei-lesson-p">{card.desc}</p>

      <SectionTitle aside="二选一">从哪开始</SectionTitle>
      <div className="ei-actions">
        <button className="ei-btn ei-btn-purple" onClick={() => go('labChanceKeywords')}>
          <b>选关键词</b>
          <small>{chanceKeywords.length} 个词里挑几个，越少越听得出来</small>
        </button>
        <button className="ei-btn ei-btn-ghost" onClick={() => open({ kind: 'samplePicker', mode: 'chance' })}>
          <b>从我的采样中获取</b>
          <small>丢一条采样进去，让它被打散重排</small>
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------- 原稿 8 · 选择关键词 */

export function LabChanceKeywords() {
  const { go, audio, still } = useScreen()
  const [picked, setPicked] = useState<string[]>(still ? ['潮湿', '霓虹', '慢速'] : [])
  const [vals, setVals] = useState<number[]>(chanceParams.map((p) => p.value))

  return (
    <>
      <p className="ei-hint">18 个词是固定的一圈，选中会上色。最多选 5 个——再多就听不出是哪个词在起作用。</p>

      <div className="ei-words" role="group" aria-label="关键词">
        {chanceKeywords.map((k) => {
          const on = picked.includes(k.text)
          return (
            <button
              key={k.text}
              className="ei-word"
              aria-pressed={on}
              style={on ? { background: k.color, color: '#1a1020', borderColor: k.color } : { color: k.color, borderColor: k.color }}
              onClick={() => {
                setPicked((p) => (on ? p.filter((t) => t !== k.text) : p.length >= 5 ? p : [...p, k.text]))
                if (!still) audio.blip(on ? 420 : 880)
              }}
            >
              {k.text}
            </button>
          )
        })}
      </div>

      <SectionTitle aside={`已选 ${picked.length} / 5`}>生成参数</SectionTitle>
      <FaderBank
        items={chanceParams.map((p, i) => ({ ...p, value: vals[i] }))}
        onNudge={(id, value) => {
          setVals((v) => v.map((old, i) => (chanceParams[i].id === id ? value : old)))
          if (!still) audio.blip(300 + value * 5)
        }}
      />

      <button
        className="ei-btn ei-btn-purple ei-mt"
        disabled={picked.length === 0}
        onClick={() => go('labChancePlayer', { title: picked.join(' · ') })}
      >
        掷一次骰子
      </button>
      <p className="ei-hint ei-mt">同一组词 + 同一组参数每次出同一段：种子就是这两样拼出来的。</p>
    </>
  )
}

/* ------------------------------------ 原稿 9 · 偶然音乐生成结果 */

export function LabChancePlayer() {
  const { params, audio, still, toast, root, open, back } = useScreen()
  const seed = params.title ?? '潮湿 · 霓虹 · 慢速'
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => audio.stopAll(), [audio])

  return (
    <div className="ei-fill">
      <div className="ei-mt">
        <VinylArt spinning={playing && !still} label="偶然音乐 · 第 1 版" />
        <p className="ei-hint ei-center-text">{seed}</p>
      </div>

      <Waveform seed={seed} lit={playing ? 0.6 : 0.3} bars={52} />
      <div className="ei-player-ops">
        <button className="ei-chip" onClick={() => !still && audio.blip(520)}>
          换个骰子
        </button>
        <PlayButton
          playing={playing}
          label={playing ? '暂停' : '播放生成结果'}
          onClick={() => {
            if (still) return
            setPlaying((p) => !p)
            if (!playing) audio.playPad(seed)
            else audio.stopAll()
          }}
        />
        <button className="ei-chip" onClick={back}>
          改关键词
        </button>
      </div>

      <SectionTitle>输出到哪里</SectionTitle>
      <div className="ei-actions">
        <button
          className="ei-btn ei-btn-purple"
          onClick={() => {
            root('create', 'samples')
            toast('已存到我的采样')
          }}
        >
          <b>上传到创意空间</b>
          <small>存成采样，可以继续做项目</small>
        </button>
        <button className="ei-btn ei-btn-ghost" onClick={() => open({ kind: 'share', target: '偶然音乐 · 第 1 版', scope: 'team' })}>
          <b>上传到互动与社区</b>
          <small>发到小组或社区，附带关键词</small>
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------- 原稿 10 · 声音转音乐 */

export function LabVoice() {
  const { go, open, audio, still, toast } = useScreen()
  const [recording, setRecording] = useState(false)
  const [secs, setSecs] = useState(still ? 7 : 0)

  useEffect(() => {
    if (!recording || still) return
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording, still])

  return (
    <div className="ei-fill">
      <div className="ei-fx-head">
        <b>声音转音乐</b>
        <small>哼一段，或者把一条采样喂进去，出一段完整编曲</small>
      </div>

      <div className="ei-card ei-rec">
        <MicHaloArt live={recording && !still} />
        <b>{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</b>
        <small className="ei-hint">{recording ? '正在采集……再点一次结束' : '点一下开始，录 5 秒以上效果更好'}</small>
        <button
          className={`ei-btn ${recording ? 'ei-btn-ghost' : 'ei-btn-purple'}`}
          onClick={() => {
            if (still) return
            setRecording((r) => !r)
            if (recording) toast(`录了 ${secs} 秒`)
            else setSecs(0)
            audio.blip(recording ? 420 : 760)
          }}
        >
          {recording ? '结束录制' : '开始哼唱'}
        </button>
      </div>

      <p className="ei-hint ei-mt">原型不开麦：计时是真的，音频不是——转换结果用种子合成。</p>

      <div className="ei-actions">
        <button className="ei-btn ei-btn-ghost" onClick={() => open({ kind: 'samplePicker', mode: 'voice' })}>
          <b>从我的采样中获取</b>
          <small>不想哼就直接挑一条，{samples.length} 条可选</small>
        </button>
        <button className="ei-btn ei-btn-purple" disabled={secs === 0 && !still} onClick={() => go('labVoiceResult', { title: '哼唱片段' })}>
          <b>转成音乐</b>
          <small>{secs === 0 && !still ? '先录一段或挑一条采样' : '出 4 轨 · 92 BPM 的编曲'}</small>
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------ 原稿 11 · 转换结果 */

export function LabVoiceResult() {
  const { params, audio, still, toast, root, open } = useScreen()
  const source = samples.find((s) => s.id === params.sampleId)
  const name = source?.name ?? params.title ?? '哼唱片段'
  const [style, setStyle] = useState<string>(fxPresets[0].id)
  const [hearing, setHearing] = useState<'before' | 'after' | null>(null)

  useEffect(() => () => audio.stopAll(), [audio])

  function hear(which: 'before' | 'after') {
    if (still) return
    setHearing(which)
    if (which === 'before') audio.playPad(name, source?.mood)
    else audio.playPad(`${name}:${style}`, fxPresets.find((p) => p.id === style)?.mood)
  }

  return (
    <div className="ei-fill">
      <div className="ei-fx-head">
        <b>{name} · 已转成编曲</b>
        <small>{source ? `${source.length} · ${source.from}` : '手机哼唱 · 00:07'} → 4 轨 · 92 BPM</small>
      </div>

      <SectionTitle aside="换一个风格会重算">编曲风格</SectionTitle>
      <ChipRow items={fxPresets.map((p) => ({ id: p.id, label: p.label }))} active={style} onPick={setStyle} label="编曲风格" />

      <SectionTitle aside="同一段哼唱">原声 / 编曲</SectionTitle>
      <div className="ei-ab">
        <div data-on={hearing === 'before' || undefined}>
          <span>原声</span>
          <Waveform seed={name} lit={hearing === 'before' ? 0.6 : 0.25} bars={40} />
          <PlayButton small label="试听原声" onClick={() => hear('before')} />
        </div>
        <div data-on={hearing === 'after' || undefined}>
          <span>编曲 · {fxPresets.find((p) => p.id === style)?.label}</span>
          <Waveform seed={`${name}:${style}`} lit={hearing === 'after' ? 0.75 : 0.45} bars={40} />
          <PlayButton small label="试听编曲" onClick={() => hear('after')} />
        </div>
      </div>

      <SectionTitle>输出到哪里</SectionTitle>
      <div className="ei-actions">
        <button
          className="ei-btn ei-btn-purple"
          onClick={() => {
            root('create', 'projects')
            toast(`「${name}」已存成项目`)
          }}
        >
          <b>上传到创意空间</b>
          <small>四条轨直接落成一个项目</small>
        </button>
        <button className="ei-btn ei-btn-ghost" onClick={() => open({ kind: 'share', target: name, scope: 'team' })}>
          <b>上传到互动与社区</b>
          <small>发到小组或社区</small>
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------- 原稿 12 · 图片转音乐 */

export function LabPicture() {
  const { go } = useScreen()
  return (
    <>
      <div className="ei-fx-head">
        <b>图片转音乐</b>
        <small>按画面的色调与密度生成配乐，一个合集出一首</small>
      </div>
      <div className="ei-albums">
        {albums.map((a) => (
          <button key={a.id} className="ei-album" onClick={() => go('labPictureAlbum', { albumId: a.id })}>
            <img src={asset(a.cover)} alt="" width={168} height={210} loading="lazy" />
            <b>{a.name}</b>
            <small>{a.count} 张</small>
          </button>
        ))}
      </div>
      <p className="ei-hint ei-mt">合集是相册里的分组，原型用四组固定照片代替相册权限。</p>
    </>
  )
}
