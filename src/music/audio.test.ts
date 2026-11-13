import { describe, expect, it, vi } from 'vitest'
import { audio, mtof, seeded, silentAudio } from './audio'

// jsdom has no AudioContext constructor, so the engine's ensure() returns null
// and every method is a no-op. These tests prove it stays silent and safe
// rather than throwing — no mocking involved.

describe('mtof', () => {
  it('puts A4 at 440 Hz and octaves a factor of two apart', () => {
    expect(mtof(69)).toBeCloseTo(440, 6)
    expect(mtof(81)).toBeCloseTo(880, 6)
    expect(mtof(60)).toBeCloseTo(261.6256, 3)
  })
})

describe('seeded', () => {
  it('is deterministic for a seed, so a card always plays the same clip', () => {
    const a = seeded('post-3')
    const b = seeded('post-3')
    const left = [a(), a(), a(), a()]
    const right = [b(), b(), b(), b()]
    expect(left).toEqual(right)
  })

  it('differs across seeds and stays inside 0..1', () => {
    const a = seeded('post-3')
    const b = seeded('post-4')
    expect(a()).not.toBe(b())
    const c = seeded('s-1')
    for (let i = 0; i < 200; i += 1) {
      const v = c()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('audio engine under jsdom', () => {
  it('never constructs an AudioContext at import time', () => {
    expect('AudioContext' in window).toBe(false)
  })

  it('no-ops instead of throwing', () => {
    expect(() => {
      audio.resume()
      audio.note(60)
      audio.note(72, 'guitar', 0.4)
      audio.chord([60, 64, 67])
      audio.scale([60, 62, 64], 'bell')
      audio.drum('kick')
      audio.drum('snare')
      audio.drum('hat')
      audio.blip()
      audio.playPad('post-1')
      audio.stopAll()
    }).not.toThrow()
  })

  it('cannot leave a metronome interval running when there is no context', () => {
    audio.startMetronome(96)
    expect(audio.metronomeRunning()).toBe(false)
    audio.stopMetronome()
  })

  it('persists the sound toggle to localStorage', () => {
    audio.setEnabled(false)
    expect(localStorage.getItem('ei-music-sound')).toBe('off')
    expect(audio.enabled()).toBe(false)
    audio.setEnabled(true)
    expect(localStorage.getItem('ei-music-sound')).toBe('on')
    expect(audio.enabled()).toBe(true)
  })

  it('stays inert while muted', () => {
    audio.setEnabled(false)
    expect(() => audio.chord([60, 64, 67])).not.toThrow()
    audio.setEnabled(true)
  })
})

describe('silentAudio', () => {
  it('implements the same surface so the design board can swap it in', () => {
    for (const key of Object.keys(audio) as (keyof typeof audio)[]) {
      expect(typeof silentAudio[key]).toBe('function')
    }
  })

  it('reports itself as off and never runs a metronome', () => {
    silentAudio.startMetronome(120)
    expect(silentAudio.metronomeRunning()).toBe(false)
    expect(silentAudio.enabled()).toBe(false)
  })

  it('does not call back on beats', () => {
    const onBeat = vi.fn()
    silentAudio.startMetronome(120, onBeat)
    expect(onBeat).not.toHaveBeenCalled()
  })
})
