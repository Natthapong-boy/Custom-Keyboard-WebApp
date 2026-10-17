import { RoundedBox } from '@react-three/drei'
import { caseMaterialStyles } from '../../config/materials'
import type { CaseMaterial } from '../../store/keyboardConfig'

interface CaseProps {
  width: number
  depth: number
  material: CaseMaterial
  color: string
}

export default function KeyboardCase({ width, depth, material, color }: CaseProps) {
  const materialStyle = caseMaterialStyles[material]

  return (
    <group>
      <RoundedBox
        args={[width, 0.34, depth]}
        radius={0.12}
        smoothness={4}
        position={[0, -0.16, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={materialStyle.metalness}
          roughness={materialStyle.roughness}
        />
      </RoundedBox>

      <RoundedBox
        args={[width - 0.22, 0.07, depth - 0.22]}
        radius={0.06}
        smoothness={3}
        position={[0, 0.025, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#252535" roughness={0.72} />
      </RoundedBox>
    </group>
  )
}
