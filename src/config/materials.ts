import type { CaseMaterial } from '../store/keyboardConfig'

export interface CaseMaterialStyle {
  metalness: number
  roughness: number
}

export const caseMaterialStyles: Record<CaseMaterial, CaseMaterialStyle> = {
  aluminum: { metalness: 0.68, roughness: 0.38 },
  polycarbonate: { metalness: 0.08, roughness: 0.5 },
  abs: { metalness: 0.02, roughness: 0.62 },
  wood: { metalness: 0, roughness: 0.7 }
}
