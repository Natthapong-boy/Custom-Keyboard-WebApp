export const UNIT = 19.05
export const GAP = 1.0
export const CASE_PADDING = 6

export interface KeyboardKey {
  id: string
  label: string
  x: number
  y: number
  w: number
  row: number
  group: 'alphas' | 'mods' | 'accents'
}

export interface KeyboardLayoutBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  depth: number
  centerX: number
  centerY: number
}

export interface KeyboardLayout {
  label: string
  keys: KeyboardKey[]
  keyCount: number
  rowCount: number
  width: number
  depth: number
  bounds: KeyboardLayoutBounds
}

interface KeyDefinition {
  label: string
  w?: number
  gapAfter?: number
}

interface RowDefinition {
  name: string
  keys: KeyDefinition[]
}

const key = (label: string, w = 1, gapAfter = 0): KeyDefinition => ({ label, w, gapAfter })

const functionRow: RowDefinition = {
  name: 'แถวปุ่มฟังก์ชัน',
  keys: [
    key('Esc', 1, 0.25),
    ...['F1', 'F2', 'F3', 'F4'].map((label, index) => key(label, 1, index === 3 ? 0.25 : 0)),
    ...['F5', 'F6', 'F7', 'F8'].map((label, index) => key(label, 1, index === 3 ? 0.25 : 0)),
    ...['F9', 'F10', 'F11', 'F12'].map((label, index) => key(label, 1, index === 3 ? 0.25 : 0)),
    key('Del')
  ]
}

const numberRow: RowDefinition = {
  name: 'แถวตัวเลข',
  keys: [
    ...['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='].map((label) => key(label)),
    key('Backspace', 2),
    key('Home')
  ]
}

const topLetterRow: RowDefinition = {
  name: 'แถวตัวอักษรบน',
  keys: [
    key('Tab', 1.5),
    ...['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'].map((label) => key(label)),
    key('PgUp')
  ]
}

const homeRow: RowDefinition = {
  name: 'แถวตัวอักษรกลาง',
  keys: [
    key('Caps', 1.75),
    ...['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"].map((label) => key(label)),
    key('\\'),
    key('Enter', 2.25),
    key('PgDn')
  ]
}

const bottomLetterRow: RowDefinition = {
  name: 'แถวตัวอักษรล่าง',
  keys: [
    key('Shift', 2.25),
    ...['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'].map((label) => key(label)),
    key('Shift', 1.75),
    key('↑'),
    key('End'),
    key('PgUp')
  ]
}

const modifierRow: RowDefinition = {
  name: 'แถวปุ่มล่าง',
  keys: [
    key('Ctrl'), key('Win'), key('Alt'), key('Space', 6),
    key('Alt'), key('Fn'), key('Ctrl'), key('←'), key('↓'), key('→')
  ]
}

const rows75: RowDefinition[] = [
  functionRow,
  numberRow,
  topLetterRow,
  homeRow,
  bottomLetterRow,
  modifierRow
]

const rows60: RowDefinition[] = [
  {
    name: 'แถวตัวเลข 60%',
    keys: [
      ...['Esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='].map((label) => key(label)),
      key('Backspace', 2)
    ]
  },
  {
    name: 'แถวตัวอักษรบน 60%',
    keys: [key('Tab', 1.5), ...['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'].map((label) => key(label))]
  },
  {
    name: 'แถวตัวอักษรกลาง 60%',
    keys: [key('Caps', 1.75), ...['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"].map((label) => key(label)), key('Enter', 2.25)]
  },
  {
    name: 'แถวตัวอักษรล่าง 60%',
    keys: [key('Shift', 2.25), ...['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'].map((label) => key(label)), key('Shift', 2.25)]
  },
  {
    name: 'แถวปุ่มล่าง 60%',
    keys: [key('Ctrl'), key('Win'), key('Alt'), key('Space', 6.25), key('Alt'), key('Fn'), key('Menu'), key('Ctrl')]
  }
]

const sumRowWidth = (row: RowDefinition) =>
  row.keys.reduce((sum, definition) => sum + (definition.w ?? 1) + (definition.gapAfter ?? 0), 0)

const createRows = (rows: RowDefinition[], targetWidth?: number) =>
  rows.map((row, rowIndex) => {
    const measuredWidth = sumRowWidth(row)
    const widthScale = targetWidth ? targetWidth / measuredWidth : 1
    const finalWidth = measuredWidth * widthScale
    if (targetWidth && Math.abs(finalWidth - targetWidth) > 0.001) {
      console.warn(`[Keyboard layout] ${row.name}: ${finalWidth.toFixed(2)}u (ต้องการ ${targetWidth}u)`)
    }
    let cursor = 0

    const placedKeys = row.keys.map((definition, keyIndex) => {
      const w = (definition.w ?? 1) * widthScale
      const placedKey: KeyboardKey = {
        id: `${rowIndex}-${keyIndex}`,
        label: definition.label,
        x: cursor,
        y: rowIndex,
        w,
        row: rowIndex,
        group: rowIndex === 0 ? 'accents' : w > 1.25 || rowIndex >= 4 ? 'mods' : 'alphas'
      }
      cursor += w + (definition.gapAfter ?? 0) * widthScale
      return placedKey
    })
    return placedKeys
  })

const getBounds = (keys: KeyboardKey[]): KeyboardLayoutBounds => {
  const minX = Math.min(...keys.map((keyboardKey) => keyboardKey.x * UNIT))
  const maxX = Math.max(...keys.map((keyboardKey) => (keyboardKey.x + keyboardKey.w) * UNIT))
  const minY = 0
  const maxY = (Math.max(...keys.map((keyboardKey) => keyboardKey.y)) + 1) * UNIT

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    depth: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  }
}

const makeLayoutFromKeys = (label: string, keys: KeyboardKey[], rowCount: number): KeyboardLayout => {
  const bounds = getBounds(keys)
  return {
    label,
    keys,
    keyCount: keys.length,
    rowCount,
    width: bounds.width,
    depth: bounds.depth,
    bounds
  }
}

const makeLayout = (label: string, rows: RowDefinition[], targetWidth?: number) => {
  const keys = createRows(rows, targetWidth).flat()
  return makeLayoutFromKeys(label, keys, rows.length)
}

const layout75Data = makeLayout('75%', rows75, 15)
const layout60Data = makeLayout('60%', rows60)

const layout65Keys: KeyboardKey[] = [...layout60Data.keys]
const add65Key = (row: number, label: string, column: number) => {
  layout65Keys.push({
    id: `65-${label}-${row}`,
    label,
    row,
    x: 15.5 + column,
    y: row,
    w: 1,
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
const layout65Data = makeLayoutFromKeys('65%', layout65Keys, rows60.length)

const rows85 = rows75.map((row) => ({ name: row.name, keys: [...row.keys] }))
rows85[0] = {
  name: 'แถวปุ่มฟังก์ชัน 85%',
  keys: [
    ...functionRow.keys,
    key('Print'),
    key('ScrLk'),
    key('Pause')
  ]
}
const layout85Data = makeLayout('85% / TKL', rows85, 15)

const numericPadRows: RowDefinition[] = [
  { name: 'แถวเครื่องคิดเลขบน', keys: [key('Num'), key('/'), key('*'), key('-')] },
  { name: 'แถวเครื่องคิดเลข 7-9', keys: [key('7'), key('8'), key('9'), key('+')] },
  { name: 'แถวเครื่องคิดเลข 4-6', keys: [key('4'), key('5'), key('6'), key('+')] },
  { name: 'แถวเครื่องคิดเลข 1-3', keys: [key('1'), key('2'), key('3'), key('Enter')] },
  { name: 'แถวเครื่องคิดเลขล่าง', keys: [key('0', 2), key('.'), key('Enter')] }
]
const main100Keys = layout75Data.keys.map((keyboardKey) => ({ ...keyboardKey }))
const numberPadKeys = createRows(numericPadRows).flatMap((row, rowIndex) =>
  row.map((keyboardKey) => ({
    ...keyboardKey,
    id: `100-numpad-${rowIndex}-${keyboardKey.id}`,
    x: keyboardKey.x + 15.5,
    y: rowIndex + 1,
    row: rowIndex + 1,
    group: 'mods' as const
  }))
)
const layout100Data = makeLayoutFromKeys('100%', [...main100Keys, ...numberPadKeys], rows75.length)

export const keyboardLayouts: Record<string, KeyboardLayout> = {
  '60': layout60Data,
  '60%': layout60Data,
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

export const getKeyboardRowWidths = (requestedLayout = '75%') => {
  const normalized = requestedLayout.trim().toLowerCase()
  const uses15uTarget = ['75%', '75', '80%', '80', '85%', '85'].includes(normalized) || normalized.includes('tkl')
  const rows = normalized === '85%' || normalized === '85' || normalized.includes('tkl')
    ? rows85
    : normalized === '60%' || normalized === '60' || normalized === '65%' || normalized === '65'
      ? rows60
      : rows75
  return rows.map((row) => ({
    name: row.name,
    width: uses15uTarget ? sumRowWidth(row) * (15 / sumRowWidth(row)) : sumRowWidth(row)
  }))
}

export const layout75 = layout75Data.keys
export const layout75KeyCount = layout75Data.keyCount
export const layout75Width = layout75Data.width
