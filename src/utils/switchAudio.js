// Switch Audio Engine for KeyCraft Custom Keyboard Builder
// Supports procedural Web Audio API synthesis (authentic mechanical switch typing simulation)
// and fallback/direct audioUrl playback with HTML5 Audio.

let currentAudio = null
let currentAudioContext = null
let activeTypingTimeout = null
let currentPlayingId = null
let stateChangeCallback = null

// Helper to notify listener of playing state
const notifyStateChange = (isPlaying, switchId = null) => {
  currentPlayingId = isPlaying ? switchId : null
  if (typeof stateChangeCallback === 'function') {
    stateChangeCallback({ isPlaying, switchId: currentPlayingId })
  }
}

// Stop any currently playing audio immediately
export function stopSwitchSound() {
  if (activeTypingTimeout) {
    clearTimeout(activeTypingTimeout)
    activeTypingTimeout = null
  }

  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.currentTime = 0
    } catch (e) {
      // ignore
    }
    currentAudio = null
  }

  if (currentAudioContext) {
    try {
      currentAudioContext.close()
    } catch (e) {
      // ignore
    }
    currentAudioContext = null
  }

  notifyStateChange(false, null)
}

// Get the currently playing switch ID
export function getCurrentlyPlayingSwitchId() {
  return currentPlayingId
}

/**
 * Generate an authentic single mechanical keystroke sound using Web Audio API
 * @param {AudioContext} ctx
 * @param {string} switchSoundType 'click' | 'linear' | 'soft' | 'thock'
 * @param {number} time
 * @param {boolean} isSpacebar
 */
function scheduleKeystroke(ctx, switchSoundType, time, isSpacebar = false) {
  const now = time

  // 1. Noise Burst for impact / friction
  const bufferSize = ctx.sampleRate * 0.08
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const noiseFilter = ctx.createBiquadFilter()
  const noiseGain = ctx.createGain()

  // 2. Resonant Body / Bottom-out impact oscillator
  const bodyOsc = ctx.createOscillator()
  const bodyGain = ctx.createGain()
  const bodyFilter = ctx.createBiquadFilter()

  // Tuning based on switch character:
  // - Click: crisp high click + metallic clack
  // - Linear: smooth, mid-range clack
  // - Tactile (soft): distinct tactile pop + mid thud
  // - Thock (yellow/lubed/oilking): deep low-pitched muted resonance
  if (switchSoundType === 'click') {
    // Click leaf transient snap
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(isSpacebar ? 2200 : 3400, now)
    noiseFilter.Q.setValueAtTime(6.0, now)

    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.002)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

    // Body bottom-out
    bodyOsc.type = 'triangle'
    bodyOsc.frequency.setValueAtTime(isSpacebar ? 160 : 320, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(isSpacebar ? 90 : 180, now + 0.04)

    bodyFilter.type = 'lowpass'
    bodyFilter.frequency.setValueAtTime(1400, now)

    bodyGain.gain.setValueAtTime(0.4, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  } else if (switchSoundType === 'soft') {
    // Tactile Pop (Holy Panda / Banana style)
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(isSpacebar ? 1100 : 1650, now)
    noiseFilter.Q.setValueAtTime(3.5, now)

    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.003)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    // Tactile bump & body
    bodyOsc.type = 'sine'
    bodyOsc.frequency.setValueAtTime(isSpacebar ? 130 : 260, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(isSpacebar ? 80 : 140, now + 0.045)

    bodyFilter.type = 'lowpass'
    bodyFilter.frequency.setValueAtTime(900, now)

    bodyGain.gain.setValueAtTime(0.5, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055)
  } else if (switchSoundType === 'thock') {
    // Deep Thock (Milky Yellow Lubed / Oil King)
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.setValueAtTime(isSpacebar ? 450 : 750, now)
    noiseFilter.Q.setValueAtTime(1.8, now)

    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.linearRampToValueAtTime(0.32, now + 0.004)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    // Sub-bass woody thock impact
    bodyOsc.type = 'sine'
    bodyOsc.frequency.setValueAtTime(isSpacebar ? 110 : 210, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(isSpacebar ? 60 : 110, now + 0.065)

    bodyFilter.type = 'lowpass'
    bodyFilter.frequency.setValueAtTime(550, now)

    bodyGain.gain.setValueAtTime(0.55, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
  } else {
    // Smooth Linear (Cherry Red style)
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(isSpacebar ? 1200 : 1800, now)
    noiseFilter.Q.setValueAtTime(2.2, now)

    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.003)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038)

    // Clean bottom-out
    bodyOsc.type = 'triangle'
    bodyOsc.frequency.setValueAtTime(isSpacebar ? 140 : 270, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(isSpacebar ? 85 : 160, now + 0.045)

    bodyFilter.type = 'lowpass'
    bodyFilter.frequency.setValueAtTime(1100, now)

    bodyGain.gain.setValueAtTime(0.42, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048)
  }

  // Master compressor / safety limiter
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.85

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(masterGain)

  bodyOsc.connect(bodyFilter)
  bodyFilter.connect(bodyGain)
  bodyGain.connect(masterGain)

  masterGain.connect(ctx.destination)

  noise.start(now)
  bodyOsc.start(now)

  noise.stop(now + 0.09)
  bodyOsc.stop(now + 0.09)
}

/**
 * Play procedural typing test (burst of realistic typing like Keychron sound preview)
 */
function playProceduralSoundTest(switchData, callback) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) {
      callback && callback({ isPlaying: false, switchId: null })
      return
    }

    const ctx = new AudioCtx()
    currentAudioContext = ctx

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const soundType = switchData.sound || 'thock'
    const now = ctx.currentTime + 0.05

    // Realistic typing sequence: alternating letters and spacebar
    const keypressDelays = [
      { delay: 0.0, isSpace: false },
      { delay: 0.16, isSpace: false },
      { delay: 0.32, isSpace: false },
      { delay: 0.50, isSpace: false },
      { delay: 0.72, isSpace: true }, // spacebar thock
      { delay: 0.96, isSpace: false },
      { delay: 1.12, isSpace: false },
      { delay: 1.28, isSpace: false },
      { delay: 1.48, isSpace: false },
      { delay: 1.72, isSpace: true }, // spacebar thock
      { delay: 1.95, isSpace: false },
      { delay: 2.12, isSpace: false },
      { delay: 2.30, isSpace: false },
      { delay: 2.52, isSpace: false },
      { delay: 2.80, isSpace: true }  // final spacebar
    ]

    keypressDelays.forEach(kp => {
      // slight humanization (+- 8ms)
      const jitter = (Math.random() - 0.5) * 0.016
      scheduleKeystroke(ctx, soundType, now + kp.delay + jitter, kp.isSpace)
    })

    const totalDurationMs = 3200

    activeTypingTimeout = setTimeout(() => {
      stopSwitchSound()
    }, totalDurationMs)

  } catch (err) {
    console.error('Procedural switch sound error:', err)
    stopSwitchSound()
  }
}

/**
 * Play a single keypress sound (e.g. for user interactive key-testing sandbox)
 */
export function playSingleKeypress(switchData, isSpacebar = false) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    const soundType = switchData?.sound || 'thock'
    scheduleKeystroke(ctx, soundType, ctx.currentTime, isSpacebar)
    setTimeout(() => {
      ctx.close().catch(() => {})
    }, 200)
  } catch (err) {
    // ignore
  }
}

/**
 * Main function: Play switch sound preview
 * If already playing this switch -> Stop it
 * If playing another switch -> Stop previous, start new
 * Supports audioUrl if provided, otherwise uses Web Audio API procedural synthesizer
 */
export function playSwitchSound(switchData, onStateChange) {
  if (!switchData) return

  // If already playing this switch, clicking again toggles Pause
  if (currentPlayingId === switchData.id) {
    stopSwitchSound()
    return
  }

  // Stop any previous playing sound
  stopSwitchSound()

  stateChangeCallback = onStateChange
  notifyStateChange(true, switchData.id)

  // 1. If custom audioUrl provided and valid, try to play it
  if (switchData.audioUrl && switchData.audioUrl.trim().length > 0) {
    try {
      const audio = new Audio(switchData.audioUrl)
      currentAudio = audio

      audio.onended = () => {
        stopSwitchSound()
      }

      audio.onerror = () => {
        console.warn(`Failed to play ${switchData.audioUrl}, falling back to Web Audio API engine.`)
        currentAudio = null
        playProceduralSoundTest(switchData, onStateChange)
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Audio play restricted or failed, falling back to Web Audio API:', err)
          currentAudio = null
          playProceduralSoundTest(switchData, onStateChange)
        })
      }
      return
    } catch (e) {
      console.warn('Error loading audioUrl:', e)
    }
  }

  // 2. Default: Authentic Procedural Web Audio Engine
  playProceduralSoundTest(switchData, onStateChange)
}
