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
        args={[width, 20, depth]}
        radius={5}
        smoothness={4}
        position={[0, -10, 0]}
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
        args={[width - 12, 2, depth - 12]}
        radius={2}
        smoothness={3}
        position={[0, 1, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#252535" roughness={0.72} />
      </RoundedBox>
    </group>
  )
}
