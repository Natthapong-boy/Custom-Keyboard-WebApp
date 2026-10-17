import { create } from 'zustand'

export type CaseMaterial = 'aluminum' | 'polycarbonate' | 'abs' | 'wood'

export interface KeyboardAppearance {
  caseMaterial: CaseMaterial
  caseColor: string
  switchType: string
  keycapColors: {
    alphas: string
    mods: string
    accents: string
  }
  rgbEnabled: boolean
  rgbMode: 'static' | 'wave' | 'breathing'
}

interface KeyboardConfigState extends KeyboardAppearance {
  setAppearance: (appearance: Partial<KeyboardAppearance>) => void
}

export const useKeyboardConfig = create<KeyboardConfigState>((set) => ({
  caseMaterial: 'aluminum',
  caseColor: '#7c3aed',
  switchType: 'linear',
  keycapColors: {
    alphas: '#f8fafc',
    mods: '#e9d5ff',
    accents: '#c4b5fd'
  },
  rgbEnabled: false,
  rgbMode: 'static',
  setAppearance: (appearance) => set((state) => ({
    ...state,
    ...appearance,
    keycapColors: {
      ...state.keycapColors,
      ...appearance.keycapColors
    }
  }))
}))
