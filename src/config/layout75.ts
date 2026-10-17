export interface KeyboardKey {
  id: string
  legend: string
  row: number
  x: number
  y: number
  width: number
  group: 'alphas' | 'mods' | 'accents'
}

export interface KeyboardLayout {
  label: string
  keys: KeyboardKey[]
  keyCount: number
  rowCount: number
  width: number
}

interface KeyDefinition {
  legend: string
  width?: number
  gapAfter?: number
}

const defaultGap = 0.08

const placeRow = (row: number, keys: KeyDefinition[]): KeyboardKey[] => {
  const rowWidth = keys.reduce(
    (width, key, index) => width + (key.width ?? 1) + (index < keys.length - 1 ? key.gapAfter ?? defaultGap : 0),
    0
  )
  let cursor = -rowWidth / 2

  return keys.map((key, index) => {
    const width = key.width ?? 1
    const placedKey: KeyboardKey = {
      id: `${row}-${index}`,
      legend: key.legend,
      row,
      x: cursor + width / 2,
      y: row,
      width,
      group: row === 0 ? 'accents' : width > 1 || row >= 4 ? 'mods' : 'alphas'
    }
    cursor += width + (index < keys.length - 1 ? key.gapAfter ?? defaultGap : 0)
    return placedKey
  })
}

const rows75: KeyDefinition[][] = [
  [
    { legend: 'Esc', gapAfter: 0.55 },
    ...['F1', 'F2', 'F3', 'F4'].map((legend, index) => ({ legend, gapAfter: index === 3 ? 0.55 : defaultGap })),
    ...['F5', 'F6', 'F7', 'F8'].map((legend, index) => ({ legend, gapAfter: index === 3 ? 0.55 : defaultGap })),
    ...['F9', 'F10', 'F11', 'F12'].map((legend, index) => ({ legend, gapAfter: index === 3 ? 0.55 : defaultGap })),
    { legend: 'Del' }
  ],
  [
    { legend: '`' }, { legend: '1' }, { legend: '2' }, { legend: '3' }, { legend: '4' },
    { legend: '5' }, { legend: '6' }, { legend: '7' }, { legend: '8' }, { legend: '9' },
    { legend: '0' }, { legend: '-' }, { legend: '=' }, { legend: 'Backspace', width: 2 },
    { legend: 'Home' }
  ],
  [
    { legend: 'Tab', width: 1.5 }, { legend: 'Q' }, { legend: 'W' }, { legend: 'E' },
    { legend: 'R' }, { legend: 'T' }, { legend: 'Y' }, { legend: 'U' }, { legend: 'I' },
    { legend: 'O' }, { legend: 'P' }, { legend: '[' }, { legend: ']' },
    { legend: '\\', width: 1.5 }, { legend: 'PgUp' }
  ],
  [
    { legend: 'Caps', width: 1.75 }, { legend: 'A' }, { legend: 'S' }, { legend: 'D' },
    { legend: 'F' }, { legend: 'G' }, { legend: 'H' }, { legend: 'J' }, { legend: 'K' },
    { legend: 'L' }, { legend: ';' }, { legend: "'" }, { legend: '\\' },
    { legend: 'Enter', width: 2.25 }, { legend: 'PgDn' }
  ],
  [
    { legend: 'Shift', width: 2.25 }, { legend: 'Z' }, { legend: 'X' }, { legend: 'C' },
    { legend: 'V' }, { legend: 'B' }, { legend: 'N' }, { legend: 'M' }, { legend: ',' },
    { legend: '.' }, { legend: '/' }, { legend: 'Shift', width: 1.75 },
    { legend: '↑' }, { legend: 'End' }, { legend: 'PgUp' }
  ],
  [
    { legend: 'Ctrl' }, { legend: 'Win' }, { legend: 'Alt' }, { legend: 'Space', width: 6 },
    { legend: 'Alt' }, { legend: 'Fn' }, { legend: 'Ctrl' }, { legend: '←' },
    { legend: '↓' }, { legend: '→' }
  ]
]

const rows60: KeyDefinition[][] = [
  [
    { legend: 'Esc' }, { legend: '1' }, { legend: '2' }, { legend: '3' }, { legend: '4' },
    { legend: '5' }, { legend: '6' }, { legend: '7' }, { legend: '8' }, { legend: '9' },
    { legend: '0' }, { legend: '-' }, { legend: '=' }, { legend: 'Backspace', width: 2 }
  ],
  [
    { legend: 'Tab', width: 1.5 }, { legend: 'Q' }, { legend: 'W' }, { legend: 'E' },
    { legend: 'R' }, { legend: 'T' }, { legend: 'Y' }, { legend: 'U' }, { legend: 'I' },
    { legend: 'O' }, { legend: 'P' }, { legend: '[' }, { legend: ']' }, { legend: '\\' }
  ],
  [
    { legend: 'Caps', width: 1.75 }, { legend: 'A' }, { legend: 'S' }, { legend: 'D' },
    { legend: 'F' }, { legend: 'G' }, { legend: 'H' }, { legend: 'J' }, { legend: 'K' },
    { legend: 'L' }, { legend: ';' }, { legend: "'" }, { legend: 'Enter', width: 2.25 }
  ],
  [
    { legend: 'Shift', width: 2.25 }, { legend: 'Z' }, { legend: 'X' }, { legend: 'C' },
    { legend: 'V' }, { legend: 'B' }, { legend: 'N' }, { legend: 'M' }, { legend: ',' },
    { legend: '.' }, { legend: '/' }, { legend: 'Shift', width: 2.25 }
  ],
  [
    { legend: 'Ctrl' }, { legend: 'Win' }, { legend: 'Alt' }, { legend: 'Space', width: 6.25 },
    { legend: 'Alt' }, { legend: 'Fn' }, { legend: 'Menu' }, { legend: 'Ctrl' }
  ]
]

const rows85: KeyDefinition[][] = rows75.map((row) => [...row])
rows85[0] = [
  ...rows85[0],
  { legend: 'Print' },
  { legend: 'ScrLk' },
  { legend: 'Pause' }
]

const makeLayout = (label: string, rows: KeyDefinition[][]): KeyboardLayout => {
  const keys = rows.flatMap((row, index) => placeRow(index, row))
  return makeLayoutFromKeys(label, keys, rows.length)
}

const makeLayoutFromKeys = (label: string, keys: KeyboardKey[], rowCount: number): KeyboardLayout => {
  const left = Math.min(...keys.map((key) => key.x - key.width / 2))
  const right = Math.max(...keys.map((key) => key.x + key.width / 2))
  const center = (left + right) / 2

  return {
    label,
    keys: keys.map((key) => ({ ...key, x: key.x - center })),
    keyCount: keys.length,
    rowCount,
    width: right - left
  }
}

const layout75Data = makeLayout('75%', rows75)
const layout60Base = makeLayout('60%', rows60)
const layout65Keys = [...layout60Base.keys]
const rightEdge65 = Math.max(...layout65Keys.map((key) => key.x + key.width / 2))
const add65Key = (row: number, legend: string, offset: number) => {
  layout65Keys.push({
    id: `65-${legend}-${row}`,
    legend,
    row,
    x: rightEdge65 + 0.7 + offset * 1.08,
    y: row,
    width: 1,
    group: 'mods'
  })
}
add65Key(0, 'Del', 0)
add65Key(1, 'PgUp', 0)
add65Key(2, 'PgDn', 0)
add65Key(3, '↑', 0)
add65Key(4, '←', 0)
add65Key(4, '↓', 1)
add65Key(4, '→', 2)

const layout65Data: KeyboardLayout = {
  ...makeLayoutFromKeys('65%', layout65Keys, rows60.length)
}

const layout85Data = makeLayout('85% / TKL', rows85)
const numericPadRows: KeyDefinition[][] = [
  [{ legend: 'Num' }, { legend: '/' }, { legend: '*' }, { legend: '-' }],
  [{ legend: '7' }, { legend: '8' }, { legend: '9' }, { legend: '+' }],
  [{ legend: '4' }, { legend: '5' }, { legend: '6' }, { legend: '+' }],
  [{ legend: '1' }, { legend: '2' }, { legend: '3' }, { legend: 'Enter' }],
  [{ legend: '0' }, { legend: '00' }, { legend: '.' }, { legend: 'Enter' }]
]
const mainRight100 = Math.max(...layout75Data.keys.map((key) => key.x + key.width / 2))
const numericPadWidth = 4.08
const mainOffset100 = -(numericPadWidth + 0.72) / 2
const numericStart100 = mainRight100 + mainOffset100 + 0.72 + 0.54
const layout100Keys = [
  ...layout75Data.keys.map((key) => ({ ...key, x: key.x + mainOffset100 })),
  ...numericPadRows.flatMap((row, rowIndex) =>
    row.map((key, keyIndex) => ({
      id: `100-numpad-${rowIndex}-${keyIndex}`,
      legend: key.legend,
      row: rowIndex + 1,
      x: numericStart100 + keyIndex * 1.08,
      y: rowIndex + 1,
      width: key.width ?? 1,
      group: 'mods' as const
    }))
  )
]
const layout100Data = makeLayoutFromKeys('100%', layout100Keys, rows75.length)

// แผนผังจัดตำแหน่งตามขนาดคีย์บอร์ด เพื่อให้ตัวแสดงผลวาดจำนวนปุ่มและเคสได้ตรงรุ่น
export const keyboardLayouts: Record<string, KeyboardLayout> = {
  '60': layout60Base,
  '60%': layout60Base,
  '65': layout65Data,
  '65%': layout65Data,
  '75': layout75Data,
  '75%': layout75Data,
  '80': layout75Data,
  '80%': layout75Data,
  '85': layout85Data,
  '85%': layout85Data,
  tkl: layout85Data,
  'tkl (80%)': layout85Data,
  '96': layout100Data,
  '96%': layout100Data,
  '100': layout100Data,
  '100%': layout100Data,
  'full size (100%)': layout100Data
}

export const getKeyboardLayout = (requestedLayout?: string): KeyboardLayout => {
  const normalized = String(requestedLayout || '75%').trim().toLowerCase()
  return keyboardLayouts[normalized] || layout75Data
}

export const layout75 = layout75Data.keys
export const layout75KeyCount = layout75Data.keyCount
export const layout75Width = layout75Data.width
