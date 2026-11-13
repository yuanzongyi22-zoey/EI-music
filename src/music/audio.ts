// Web Audio for the Ei Music prototype: everything is synthesised, there are
// no audio files.
//
// The AudioContext is never built at module scope. `ensure()` is the only
// construction point and every public method bails out when it returns null,
// which means jsdom (no AudioContext constructor) turns the whole engine into
// no-ops and the tests need zero mocking.

export type Timbre = 'piano' | 'guitar' | 'pluck' | 'bell'
export type DrumKind = 'kick' | 'snare' | 'hat'

/**
 * 每条内容自己带一个「气质」，playPad 按它换调式、速度、音色和鼓组。
 * 不这么分的话所有卡片都是同一个 bell+pluck 的垫子，听起来全一个样。
 */
export type Mood =
  | 'night'
  | 'rain'
  | 'street'
  | 'dance'
  | 'folk'
  | 'dream'
  | 'bird'
  | 'market'
  | 'cover'
  | 'collage'

type Recipe = {
  root: number
  scale: readonly number[]
  prog: readonly number[]
  bpm: number
  pad: Timbre
  lead: Timbre
  drums: 'none' | 'soft' | 'four'
}

/** root 是和弦的最低音，prog 是每小节落在音阶第几级。 */
const MOODS: Record<Mood, Recipe> = {
  night: { root: 45, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4], bpm: 72, pad: 'bell', lead: 'pluck', drums: 'soft' },
  rain: { root: 50, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 0, 4], bpm: 64, pad: 'bell', lead: 'bell', drums: 'none' },
  street: { root: 48, scale: [0, 3, 5, 6, 7, 10], prog: [0, 4, 2, 5], bpm: 90, pad: 'piano', lead: 'pluck', drums: 'four' },
  dance: { root: 53, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 4, 5, 3], bpm: 120, pad: 'pluck', lead: 'bell', drums: 'four' },
  folk: { root: 55, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 0], bpm: 84, pad: 'guitar', lead: 'guitar', drums: 'soft' },
  dream: { root: 52, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 2, 4, 2], bpm: 58, pad: 'bell', lead: 'bell', drums: 'none' },
  bird: { root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 4, 2, 4], bpm: 96, pad: 'bell', lead: 'bell', drums: 'none' },
  market: { root: 47, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 2, 5, 4], bpm: 104, pad: 'piano', lead: 'pluck', drums: 'four' },
  cover: { root: 49, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 4, 5, 4], bpm: 100, pad: 'piano', lead: 'piano', drums: 'four' },
  collage: { root: 46, scale: [0, 1, 4, 5, 7, 8, 11], prog: [0, 5, 1, 4], bpm: 78, pad: 'pluck', lead: 'bell', drums: 'soft' },
}

export const MOOD_NAMES = Object.keys(MOODS) as Mood[]

/** 第 i 级，超出一个八度就自动翻上去。 */
function degree(scale: readonly number[], i: number): number {
  const n = scale.length
  const k = ((i % n) + n) % n
  return Math.floor(i / n) * 12 + scale[k]
}

export type AudioEngine = {
  resume: () => void
  enabled: () => boolean
  setEnabled: (on: boolean) => void
  note: (midi: number, timbre?: Timbre, dur?: number) => void
  chord: (midis: number[], timbre?: Timbre, dur?: number) => void
  scale: (midis: number[], timbre?: Timbre, gap?: number) => void
  /** 一段能听出乐器性格的示范句，比一个固定三和弦有辨识度。 */
  demo: (timbre?: Timbre, layout?: 'fret' | 'keys' | 'pads', oct?: number) => void
  drum: (kind: DrumKind) => void
  blip: (pitch?: number) => void
  playPad: (seed: string, mood?: Mood) => void
  startMetronome: (bpm: number, onBeat?: (beat: number) => void) => void
  stopMetronome: () => void
  metronomeRunning: () => boolean
  stopAll: () => void
}

const STORE_KEY = 'ei-music-sound'

export const mtof = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

/** Deterministic 0..1 generator so the same card always plays the same clip. */
export function seeded(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 100000) / 100000
  }
}

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORE_KEY) !== 'off'
  } catch {
    return true
  }
}

function createEngine(): AudioEngine {
  let ctx: AudioContext | null = null
  let bus: GainNode | null = null
  let noise: AudioBuffer | null = null
  let on = true
  let loaded = false
  let voices: { stop: () => void }[] = []
  let metro: ReturnType<typeof setInterval> | null = null

  function ensure(): AudioContext | null {
    if (!loaded) {
      loaded = true
      on = readEnabled()
    }
    if (!on) return null
    if (ctx) return ctx
    const Ctor =
      typeof window === 'undefined'
        ? undefined
        : window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    bus = ctx.createGain()
    bus.gain.value = 0.5
    bus.connect(ctx.destination)
    return ctx
  }

  function voice(
    c: AudioContext,
    type: OscillatorType,
    freq: number,
    at: number,
    dur: number,
    peak: number,
    filter?: { type: BiquadFilterType; freq: number; q?: number },
  ) {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, at)
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(peak, at + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    let tail: AudioNode = gain
    if (filter) {
      const bq = c.createBiquadFilter()
      bq.type = filter.type
      bq.frequency.value = filter.freq
      if (filter.q != null) bq.Q.value = filter.q
      gain.connect(bq)
      tail = bq
    }
    tail.connect(bus as GainNode)
    osc.connect(gain)
    osc.start(at)
    osc.stop(at + dur + 0.05)
    const entry = {
      stop: () => {
        try {
          gain.gain.cancelScheduledValues(c.currentTime)
          gain.gain.setTargetAtTime(0, c.currentTime, 0.015)
          osc.stop(c.currentTime + 0.1)
        } catch {
          /* already stopped */
        }
      },
    }
    voices.push(entry)
    // 一段四小节的编曲轻松过百个声部，上限太低的话 stopAll 会漏掉最早那几个。
    if (voices.length > 220) voices = voices.slice(-220)
  }

  function strike(c: AudioContext, midi: number, timbre: Timbre, at: number, dur: number) {
    const f = mtof(midi)
    if (timbre === 'piano') {
      voice(c, 'sine', f, at, dur, 0.26)
      voice(c, 'sine', f * 2, at, dur * 0.6, 0.09)
      voice(c, 'sine', f * 3, at, dur * 0.35, 0.04)
    } else if (timbre === 'guitar') {
      voice(c, 'triangle', f, at, dur, 0.22, { type: 'lowpass', freq: 2400 })
      voice(c, 'triangle', f * 1.003, at, dur, 0.14, { type: 'lowpass', freq: 2400 })
    } else if (timbre === 'pluck') {
      voice(c, 'sawtooth', f, at, Math.min(dur, 0.5), 0.18, { type: 'bandpass', freq: f * 2, q: 3 })
    } else {
      voice(c, 'sine', f * 2, at, dur, 0.16)
      voice(c, 'sine', f * 3.01, at, dur * 0.5, 0.06)
    }
  }

  function noiseBuffer(c: AudioContext): AudioBuffer {
    if (noise) return noise
    const len = Math.floor(c.sampleRate * 0.5)
    const buf = c.createBuffer(1, len, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1
    noise = buf
    return buf
  }

  /** 和 drum() 同一套发声，但能排到未来的某个时刻，编曲里要用。 */
  function percuss(c: AudioContext, kind: DrumKind, at: number, level = 1) {
    if (kind === 'kick') {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.frequency.setValueAtTime(140, at)
      osc.frequency.exponentialRampToValueAtTime(46, at + 0.14)
      gain.gain.setValueAtTime(0.5 * level, at)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3)
      osc.connect(gain)
      gain.connect(bus as GainNode)
      osc.start(at)
      osc.stop(at + 0.34)
      voices.push({ stop: () => osc.stop(Math.max(c.currentTime, at)) })
      return
    }
    const src = c.createBufferSource()
    src.buffer = noiseBuffer(c)
    const bq = c.createBiquadFilter()
    bq.type = kind === 'hat' ? 'highpass' : 'bandpass'
    bq.frequency.value = kind === 'hat' ? 7200 : 1700
    const gain = c.createGain()
    const dur = kind === 'hat' ? 0.06 : 0.17
    gain.gain.setValueAtTime((kind === 'hat' ? 0.2 : 0.34) * level, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    src.connect(bq)
    bq.connect(gain)
    gain.connect(bus as GainNode)
    src.start(at)
    src.stop(at + dur + 0.02)
    voices.push({ stop: () => src.stop(Math.max(c.currentTime, at)) })
  }

  return {
    resume() {
      const c = ensure()
      if (!c) return
      if (c.state === 'suspended') void c.resume()
    },
    enabled() {
      if (!loaded) {
        loaded = true
        on = readEnabled()
      }
      return on
    },
    setEnabled(next) {
      loaded = true
      on = next
      try {
        localStorage.setItem(STORE_KEY, next ? 'on' : 'off')
      } catch {
        /* storage blocked */
      }
      if (!next) this.stopAll()
    },
    note(midi, timbre = 'piano', dur = 1.1) {
      const c = ensure()
      if (!c) return
      strike(c, midi, timbre, c.currentTime, dur)
    },
    chord(midis, timbre = 'piano', dur = 1.6) {
      const c = ensure()
      if (!c) return
      midis.forEach((m, i) => strike(c, m, timbre, c.currentTime + i * 0.012, dur))
    },
    scale(midis, timbre = 'piano', gap = 0.26) {
      const c = ensure()
      if (!c) return
      midis.forEach((m, i) => strike(c, m, timbre, c.currentTime + i * gap, gap * 2.4))
    },
    demo(timbre = 'piano', layout = 'keys', oct = 0) {
      const c = ensure()
      if (!c) return
      const at = c.currentTime + 0.04
      const hit = (m: number, t: Timbre, delay: number, dur: number) => strike(c, m + oct, t, at + delay, dur)
      if (layout === 'pads') {
        // 鼓组示范一小节节奏，弹音阶没有意义。
        const beat = 0.26
        ;[0, 1, 2, 3].forEach((b) => {
          percuss(c, b % 2 === 0 ? 'kick' : 'snare', at + b * beat)
          percuss(c, 'hat', at + (b + 0.5) * beat, 0.7)
        })
        return
      }
      if (timbre === 'guitar') {
        // 扫弦：六根弦自下往上很快带过，音头错开才像一次扫。
        ;[40, 45, 50, 55, 59, 64].forEach((m, i) => hit(m, 'guitar', i * 0.026, 1.5))
        ;[40, 45, 50, 55, 59, 64].forEach((m, i) => hit(m, 'guitar', 0.62 + i * 0.022, 1.2))
        return
      }
      if (timbre === 'pluck') {
        // 拨弦：一条上行的五声句子。
        ;[45, 50, 52, 57, 59, 64].forEach((m, i) => hit(m, 'pluck', i * 0.17, 0.6))
        return
      }
      if (timbre === 'bell') {
        // 钟琴 / 古筝：刮奏，所以音更密、尾巴更长。
        ;[60, 62, 64, 67, 69, 72, 74, 76].forEach((m, i) => hit(m, 'bell', i * 0.075, 1.8))
        return
      }
      // 钢琴：一个带低音的 C 和弦，再接一句右手。
      hit(36, 'piano', 0, 2.2)
      ;[60, 64, 67, 72].forEach((m, i) => hit(m, 'piano', i * 0.02, 2))
      ;[72, 71, 67, 64].forEach((m, i) => hit(m, 'piano', 0.7 + i * 0.19, 0.9))
    },
    drum(kind) {
      const c = ensure()
      if (!c) return
      percuss(c, kind, c.currentTime)
    },
    blip(pitch = 880) {
      const c = ensure()
      if (!c) return
      voice(c, 'sine', pitch, c.currentTime, 0.07, 0.07)
    },
    playPad(seed, mood) {
      const c = ensure()
      if (!c) return
      const rnd = seeded(seed)
      // 没标气质的内容（处理后的素材、临时工程）也要彼此不同，所以由种子挑一个。
      const r = MOODS[mood ?? MOOD_NAMES[Math.floor(rnd() * MOOD_NAMES.length)]]
      const beat = 60 / r.bpm
      const bass: Timbre = r.pad === 'guitar' ? 'guitar' : 'pluck'
      for (let bar = 0; bar < 4; bar += 1) {
        const at = c.currentTime + 0.06 + bar * beat * 4
        const d = r.prog[bar % r.prog.length]
        // 垫子：三度叠置的三个音，一小节一换。
        for (let k = 0; k < 3; k += 1) {
          strike(c, r.root + 12 + degree(r.scale, d + k * 2), r.pad, at + k * 0.02, beat * 3.6)
        }
        strike(c, r.root + degree(r.scale, d), bass, at, beat * 1.9)
        strike(c, r.root + degree(r.scale, d + 4), bass, at + beat * 2, beat * 1.6)
        // 旋律：每拍一个音，偶尔空拍，后半拍错开一点才不像打字机。
        for (let b = 0; b < 4; b += 1) {
          if (rnd() < 0.24) continue
          const step = d + 2 * Math.floor(rnd() * 4)
          strike(c, r.root + 24 + degree(r.scale, step), r.lead, at + (b + (b % 2 ? 0.25 : 0)) * beat, beat * 0.85)
        }
        if (r.drums === 'none') continue
        for (let b = 0; b < 4; b += 1) {
          if (r.drums === 'four' || b % 2 === 0) percuss(c, 'kick', at + b * beat, r.drums === 'four' ? 1 : 0.7)
          if (b % 2 === 1) percuss(c, 'snare', at + b * beat, r.drums === 'four' ? 0.9 : 0.55)
          percuss(c, 'hat', at + (b + 0.5) * beat, r.drums === 'four' ? 0.9 : 0.5)
        }
      }
    },
    startMetronome(bpm, onBeat) {
      const c = ensure()
      if (!c) return
      if (metro) clearInterval(metro)
      const spb = 60 / Math.max(30, Math.min(240, bpm))
      let next = c.currentTime + 0.08
      let beat = 0
      // 25ms look-ahead rather than one timeout per beat, which would drift.
      const pump = () => {
        while (next < c.currentTime + 0.12) {
          const accent = beat % 4 === 0
          const osc = c.createOscillator()
          const gain = c.createGain()
          osc.type = 'square'
          osc.frequency.value = accent ? 1760 : 1180
          gain.gain.setValueAtTime(accent ? 0.16 : 0.1, next)
          gain.gain.exponentialRampToValueAtTime(0.0001, next + 0.03)
          osc.connect(gain)
          gain.connect(bus as GainNode)
          osc.start(next)
          osc.stop(next + 0.04)
          if (onBeat) {
            const at = next
            const b = beat
            setTimeout(() => onBeat(b % 4), Math.max(0, (at - c.currentTime) * 1000))
          }
          next += spb
          beat += 1
        }
      }
      pump()
      metro = setInterval(pump, 25)
    },
    stopMetronome() {
      if (metro) clearInterval(metro)
      metro = null
    },
    metronomeRunning() {
      return metro != null
    },
    stopAll() {
      this.stopMetronome()
      voices.forEach((v) => v.stop())
      voices = []
    },
  }
}

export const audio: AudioEngine = createEngine()

/** The design board renders frozen screens; nothing it touches should sound. */
export const silentAudio: AudioEngine = {
  resume: () => {},
  enabled: () => false,
  setEnabled: () => {},
  note: () => {},
  chord: () => {},
  scale: () => {},
  demo: () => {},
  drum: () => {},
  blip: () => {},
  playPad: () => {},
  startMetronome: () => {},
  stopMetronome: () => {},
  metronomeRunning: () => false,
  stopAll: () => {},
}
