import { Howl } from 'howler'

// Cache of loaded Howl instances by pack directory
const howlPacks = new Map()
const packKeysCache = new Map()
let currentActiveHowl = null
let activeTypingSession = null

/**
 * Load or get cached Howl instance configured with Audio Sprites from Mechvibes config.json
 * @param {string} packDir e.g. '/sounds/red-switch'
 * @returns {Promise<{ howl: Howl, keys: string[] }>}
 */
export async function getMechvibesPack(packDir = '/sounds/red-switch') {
  const normalizedDir = packDir.replace(/\/$/, '')

  if (howlPacks.has(normalizedDir)) {
    return {
      howl: howlPacks.get(normalizedDir),
      keys: packKeysCache.get(normalizedDir) || []
    }
  }

  // Fetch config.json from public directory
  const response = await fetch(`${normalizedDir}/config.json`)
  if (!response.ok) {
    throw new Error(`Failed to load Mechvibes config at ${normalizedDir}/config.json`)
  }
  const config = await response.json()
  const soundFileName = config.sound || 'sound.ogg'
  const soundUrl = `${normalizedDir}/${soundFileName}`

  // Mechvibes defines: { "1": [offset_ms, duration_ms], "2": [offset_ms, duration_ms], ... }
  const spriteDefines = config.defines || {}
  const keys = Object.keys(spriteDefines)

  if (keys.length === 0) {
    throw new Error(`No defines found in ${normalizedDir}/config.json`)
  }

  // Create Howl instance with sprites (Howler takes: sprite: { [id]: [offset_ms, duration_ms] })
  const howl = new Howl({
    src: [soundUrl],
    format: ['ogg', 'mp3', 'wav', 'webm'],
    sprite: spriteDefines,
    preload: true,
    volume: 1.0
  })

  howlPacks.set(normalizedDir, howl)
  packKeysCache.set(normalizedDir, keys)

  return { howl, keys }
}

/**
 * Stop any currently playing audio sprite or active typing simulation immediately
 */
export function stopMechvibesAudio() {
  // Clear any active typing simulation timer and flag cancellation
  if (activeTypingSession) {
    if (activeTypingSession.timerId) {
      clearTimeout(activeTypingSession.timerId)
      activeTypingSession.timerId = null
    }
    activeTypingSession.cancelled = true
    activeTypingSession = null
  }

  // Stop currently playing Howl instance
  if (currentActiveHowl) {
    try {
      currentActiveHowl.stop()
    } catch (e) {
      // ignore
    }
    currentActiveHowl = null
  }
}

/**
 * Play a single random key sprite from Mechvibes pack with overlap prevention
 * @param {string} packDir e.g. '/sounds/red-switch'
 * @param {Object} options callbacks { onStart, onEnd, onError }
 */
export async function playRandomMechvibesSprite(packDir = '/sounds/red-switch', options = {}) {
  const { onStart, onEnd, onError } = options

  // Overlap Prevention: Stop previous sprite and any typing simulation
  stopMechvibesAudio()

  try {
    const { howl, keys } = await getMechvibesPack(packDir)
    if (!keys || keys.length === 0) {
      throw new Error('No sprite keys available in pack')
    }

    const randomIndex = Math.floor(Math.random() * keys.length)
    const randomKey = keys[randomIndex]

    currentActiveHowl = howl

    const soundId = howl.play(randomKey)

    if (typeof onStart === 'function') {
      onStart({ key: randomKey, soundId })
    }

    howl.once('end', () => {
      if (currentActiveHowl === howl) {
        currentActiveHowl = null
      }
      if (typeof onEnd === 'function') {
        onEnd({ key: randomKey, soundId })
      }
    }, soundId)

    howl.once('playerror', (id, err) => {
      console.warn('Howler play error:', err)
      if (currentActiveHowl === howl) {
        currentActiveHowl = null
      }
      if (typeof onError === 'function') {
        onError(err)
      }
    }, soundId)

    return { howl, randomKey, soundId }
  } catch (err) {
    console.error('Failed to play Mechvibes sprite:', err)
    stopMechvibesAudio()
    if (typeof onError === 'function') {
      onError(err)
    }
    throw err
  }
}

/**
 * Simulate continuous typing with 15 - 20 random sprite strokes spaced by 70ms - 150ms delay
 * @param {string} packDir e.g. '/sounds/red-switch'
 * @param {Object} options Configuration & callbacks:
 *   - minStrokes: number (default 15)
 *   - maxStrokes: number (default 20)
 *   - minDelay: number ms (default 70)
 *   - maxDelay: number ms (default 150)
 *   - onStart: callback when sequence begins
 *   - onEnd: callback when sequence completes
 *   - onError: callback on error
 */
export async function simulateMechvibesTyping(packDir = '/sounds/red-switch', options = {}) {
  const {
    minStrokes = 15,
    maxStrokes = 20,
    minDelay = 70,
    maxDelay = 150,
    onStart,
    onEnd,
    onError
  } = options

  // 3. ป้องกันเสียงซ้อน & เคลียร์ timer เดิมทั้งหมด
  stopMechvibesAudio()

  try {
    const { howl, keys } = await getMechvibesPack(packDir)
    if (!keys || keys.length === 0) {
      throw new Error('No sprite keys available in pack')
    }

    // 1. สุ่มเล่นเสียง Sprite ต่อเนื่องกันประมาณ 15 - 20 ครั้ง
    const totalStrokes = Math.floor(Math.random() * (maxStrokes - minStrokes + 1)) + minStrokes

    const session = {
      cancelled: false,
      timerId: null,
      currentStroke: 0,
      totalStrokes
    }
    activeTypingSession = session

    if (typeof onStart === 'function') {
      onStart({ totalStrokes })
    }

    const playNextStroke = () => {
      // ตรวจสอบว่าถูกยกเลิก (เช่น ผู้ใช้กดหยุดฟัง หรือเริ่มเล่นใหม่) หรือไม่
      if (session.cancelled) return

      // สุ่มเลือก key จาก config.json
      const randomKey = keys[Math.floor(Math.random() * keys.length)]

      // หยุดเสียงเดิมเพื่อให้เสียงแต่ละแป้นพิมพ์คมชัด ไม่บวมทับกัน
      if (currentActiveHowl) {
        try {
          currentActiveHowl.stop()
        } catch (e) {
          // ignore
        }
      }
      currentActiveHowl = howl

      const soundId = howl.play(randomKey)
      session.currentStroke++

      if (session.currentStroke < session.totalStrokes) {
        // 2. เว้นระยะห่าง (Delay) ระหว่างการเล่นแต่ละเสียงแบบสุ่ม ระหว่าง 70ms ถึง 150ms
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay
        session.timerId = setTimeout(() => {
          playNextStroke()
        }, delay)
      } else {
        // ครบจำนวน 15-20 ครั้งแล้ว รอให้เสียงสุดท้ายเล่นจบ
        howl.once('end', () => {
          if (!session.cancelled && activeTypingSession === session) {
            activeTypingSession = null
            currentActiveHowl = null
            if (typeof onEnd === 'function') {
              onEnd()
            }
          }
        }, soundId)

        // Safety fallback timeout ในกรณีที่ Howler event end ไม่ trigger
        session.timerId = setTimeout(() => {
          if (!session.cancelled && activeTypingSession === session) {
            activeTypingSession = null
            currentActiveHowl = null
            if (typeof onEnd === 'function') {
              onEnd()
            }
          }
        }, 500)
      }
    }

    // เริ่มต้นเคาะแป้นพิมพ์จังหวะแรกทันที
    playNextStroke()

    return session
  } catch (err) {
    console.error('Failed to simulate Mechvibes typing:', err)
    stopMechvibesAudio()
    if (typeof onError === 'function') {
      onError(err)
    }
    throw err
  }
}

