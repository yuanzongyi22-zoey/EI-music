'use client'
import { seeded } from './audio'

/** 画出来的假二维码：形状由 seed 决定，稳定但不可扫（文档里如实写明）。 */
export function QrArt({ seed, size = 132 }: { seed: string; size?: number }) {
  const n = 21
  const rnd = seeded(`qr:${seed}`)
  const cells: boolean[] = []
  for (let i = 0; i < n * n; i += 1) cells.push(rnd() > 0.52)
  const isEye = (x: number, y: number) =>
    (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8)
  return (
    <svg className="ei-qr" viewBox={`0 0 ${n} ${n}`} width={size} height={size} role="img" aria-label="分享二维码（示意）">
      <rect width={n} height={n} fill="#fff" rx="1" />
      {cells.map((on, i) => {
        const x = i % n
        const y = Math.floor(i / n)
        if (isEye(x, y) || !on) return null
        return <rect key={i} x={x} y={y} width="1" height="1" fill="#1a1020" />
      })}
      {[
        [0, 0],
        [n - 7, 0],
        [0, n - 7],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="none" stroke="#1a1020">
          <rect x={x + 0.5} y={y + 0.5} width="6" height="6" strokeWidth="1" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1a1020" stroke="none" />
        </g>
      ))}
    </svg>
  )
}

/** 世界地图：裁原稿在 361px 宽会糊，所以用大陆轮廓的简化路径画。 */
export function WorldMapArt({ pins }: { pins: { x: number; y: number; on?: boolean }[] }) {
  return (
    <svg className="ei-map" viewBox="0 0 360 230" role="img" aria-label="乐友分布地图">
      <rect width="360" height="230" fill="#14141a" />
      <g fill="#2c2c35">
        <path d="M44 56c14-9 38-12 56-6s26 18 44 20 30-8 44-4-4 22-18 26-30 2-44 10-26 20-42 14-24-24-26-38 0-16-14-22Z" />
        <path d="M118 128c12-6 22 2 26 14s-2 30-8 44-14 28-24 24-10-22-8-38 2-38 14-44Z" />
        <path d="M172 48c20-8 44-6 62 2s22 22 40 26 36-4 46 6-10 26-28 30-34-6-48 2-22 20-38 16-20-18-24-32-26-42-10-50Z" />
        <path d="M236 122c14-4 26 6 28 18s-8 24-20 26-22-8-22-22 0-18 14-22Z" />
        <path d="M282 152c10-2 22 6 20 18s-16 18-26 14-10-16-6-24 4-6 12-8Z" />
      </g>
      <g stroke="#363644" strokeWidth=".5" opacity=".7">
        {[40, 80, 120, 160, 200].map((y) => (
          <line key={y} x1="0" y1={y} x2="360" y2={y} />
        ))}
        {[60, 120, 180, 240, 300].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="230" />
        ))}
      </g>
      {pins.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r={p.on ? 13 : 9} fill={p.on ? '#922aff33' : '#ffffff14'} />
          <path
            d="M0-11c4.4 0 8 3.6 8 8 0 6-8 14-8 14S-8 3-8-3c0-4.4 3.6-8 8-8Z"
            fill={p.on ? 'var(--ei-purple)' : 'var(--ei-ink-4)'}
          />
          <circle cy="-3" r="2.6" fill="#1C1C1E" />
        </g>
      ))}
    </svg>
  )
}

/** 五线谱：音符位置由课程的音阶数组推出来，和试听用同一份数据。 */
export function StaffArt({ midis, active }: { midis: readonly number[]; active?: number }) {
  const W = 330
  const step = Math.min(38, (W - 54) / Math.max(1, midis.length))
  // E4(64) 落在第一线，每个全音台阶 5px
  const DIATONIC = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
  const place = (m: number) => {
    const oct = Math.floor(m / 12) - 5
    const deg = DIATONIC[m % 12] + oct * 7
    return 62 - (deg - DIATONIC[64 % 12] - (Math.floor(64 / 12) - 5) * 7) * 5
  }
  return (
    <svg className="ei-staff" viewBox={`0 0 ${W} 96`} role="img" aria-label="五线谱示意">
      <g stroke="#6B6B6C" strokeWidth="1">
        {[42, 52, 62, 72, 82].map((y) => (
          <line key={y} x1="10" y1={y} x2={W - 10} y2={y} />
        ))}
      </g>
      <text x="16" y="78" fill="#D8B1FF" fontSize="42" fontFamily="serif">
        &#119070;
      </text>
      {midis.map((m, i) => {
        const cx = 54 + i * step
        const cy = place(m)
        const on = active === i
        return (
          <g key={i}>
            {cy < 40 || cy > 84 ? <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke="#6B6B6C" /> : null}
            <ellipse cx={cx} cy={cy} rx="5.6" ry="4.2" fill={on ? '#FFD200' : '#F3E6FF'} transform={`rotate(-18 ${cx} ${cy})`} />
            <line x1={cx + 5} y1={cy - 1} x2={cx + 5} y2={cy - 26} stroke={on ? '#FFD200' : '#F3E6FF'} strokeWidth="1.6" />
          </g>
        )
      })}
    </svg>
  )
}

/** 可弹的钢琴键：白键 14 个，黑键按真实排布缺两处。 */
export function KeyboardArt({
  from = 60,
  whites = 14,
  held,
  onHit,
}: {
  from?: number
  whites?: number
  held?: number[]
  onHit?: (midi: number) => void
}) {
  const WHITE = [0, 2, 4, 5, 7, 9, 11]
  const names = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const keys = Array.from({ length: whites }, (_, i) => {
    const oct = Math.floor(i / 7)
    const idx = i % 7
    return { midi: from + oct * 12 + WHITE[idx], label: `${names[idx]}${Math.floor((from + oct * 12) / 12) - 1}`, idx }
  })
  return (
    <div className="ei-keys" role="group" aria-label="钢琴键盘">
      {keys.map((k) => (
        <span className="ei-key-slot" key={k.midi}>
          <button
            className="ei-key"
            data-held={held?.includes(k.midi) || undefined}
            aria-label={`弹 ${k.label}`}
            onPointerDown={() => onHit?.(k.midi)}
          >
            <small>{k.label}</small>
          </button>
          {k.idx !== 2 && k.idx !== 6 ? (
            <button
              className="ei-key-b"
              data-held={held?.includes(k.midi + 1) || undefined}
              aria-label={`弹 ${k.label} 升`}
              onPointerDown={() => onHit?.(k.midi + 1)}
            />
          ) : null}
        </span>
      ))}
    </div>
  )
}

/** 可弹的指板：6 弦 × 5 格，点哪格发哪个音。 */
export function FretboardArt({
  tuning = [40, 45, 50, 55, 59, 64],
  frets = 5,
  held,
  onHit,
}: {
  tuning?: number[]
  frets?: number
  held?: number[]
  onHit?: (midi: number) => void
}) {
  return (
    <div className="ei-fret" role="group" aria-label="吉他指板">
      <div className="ei-fret-nums" aria-hidden>
        {Array.from({ length: frets }, (_, f) => (
          <span key={f}>{f + 1}</span>
        ))}
      </div>
      {[...tuning].reverse().map((open, s) => (
        <div className="ei-fret-str" key={s}>
          {Array.from({ length: frets }, (_, f) => {
            const midi = open + f + 1
            return (
              <button
                key={f}
                data-held={held?.includes(midi) || undefined}
                aria-label={`第 ${tuning.length - s} 弦第 ${f + 1} 格`}
                onPointerDown={() => onHit?.(midi)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** 黑胶：声音转音乐的结果屏用，still 时不转。 */
export function VinylArt({ spinning, label }: { spinning?: boolean; label?: string }) {
  return (
    <div className="ei-vinyl" data-spin={spinning || undefined}>
      <svg viewBox="0 0 160 160" role="img" aria-label="黑胶唱片">
        <circle cx="80" cy="80" r="79" fill="#0c0c0e" />
        {[66, 56, 46, 36].map((r) => (
          <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="#24242a" strokeWidth="1" />
        ))}
        <circle cx="80" cy="80" r="26" fill="var(--ei-purple)" />
        <circle cx="80" cy="80" r="4" fill="#0c0c0e" />
      </svg>
      {label ? <b>{label}</b> : null}
    </div>
  )
}

/** 麦克风光环：录制中的呼吸圈，still 时定在中间一帧。 */
export function MicHaloArt({ live }: { live?: boolean }) {
  return (
    <div className="ei-halo" data-live={live || undefined}>
      <i />
      <i />
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="18" y="8" width="12" height="20" rx="6" />
        <path d="M13 24a11 11 0 0 0 22 0M24 35v6M18 41h12" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/** 节拍器摆针：四拍一循环，beat 由外部给，设计板传固定值。 */
export function MetronomeArt({ beat }: { beat: number }) {
  return (
    <div className="ei-metro">
      <svg viewBox="0 0 90 74" role="img" aria-label="节拍器">
        <path d="M45 6 70 68H20z" fill="none" stroke="#4a4a52" strokeWidth="2" />
        <line
          x1="45"
          y1="64"
          x2={45 + (beat % 2 === 0 ? -16 : 16)}
          y2="14"
          stroke="var(--ei-purple)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx={45 + (beat % 2 === 0 ? -16 : 16)} cy="14" r="5" fill="#D8B1FF" />
      </svg>
      <div className="ei-metro-dots" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} data-on={i === beat % 4 || undefined} />
        ))}
      </div>
    </div>
  )
}

/** 和弦图：六线谱上的按法，frets[i] 是第 i 弦的品位，0 为空弦。 */
export function ChordArt({ frets }: { frets: readonly number[] }) {
  return (
    <svg className="ei-chord" viewBox="0 0 120 130" role="img" aria-label="和弦指位图">
      <g stroke="#4a4a52" strokeWidth="1">
        {frets.map((_, i) => (
          <line key={i} x1={14 + i * 18} y1="16" x2={14 + i * 18} y2="118" />
        ))}
        {[16, 42, 68, 94, 118].map((y) => (
          <line key={y} x1="14" y1={y} x2="104" y2={y} />
        ))}
      </g>
      <line x1="14" y1="16" x2="104" y2="16" stroke="#D8B1FF" strokeWidth="3" />
      {frets.map((f, i) =>
        f === 0 ? (
          <circle key={i} cx={14 + i * 18} cy="9" r="4" fill="none" stroke="#D8B1FF" strokeWidth="1.6" />
        ) : (
          <circle key={i} cx={14 + i * 18} cy={16 + f * 26 - 13} r="7" fill="var(--ei-purple)" />
        ),
      )}
    </svg>
  )
}

export function ColorTile({ color, children }: { color: string; children?: React.ReactNode }) {
  return (
    <div className="ei-tile" style={{ background: color }}>
      {children}
    </div>
  )
}
