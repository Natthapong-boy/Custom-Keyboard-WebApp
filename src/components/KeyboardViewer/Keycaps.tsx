import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { GAP, UNIT, type KeyboardKey, type KeyboardLayoutBounds } from '../../config/layout75'
import type { KeyboardAppearance } from '../../store/keyboardConfig'

const KEY_HEIGHT = 12
const PLATE_TOP = 3
const KEY_Y = PLATE_TOP + KEY_HEIGHT / 2

const makeLegendTexture = (label: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) return null

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#343244'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `600 ${label.length > 4 ? 34 : 48}px "Noto Sans Thai", Arial, sans-serif`
  context.fillText(label, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

interface KeycapsProps {
  keys: KeyboardKey[]
  bounds: KeyboardLayoutBounds
  colors: KeyboardAppearance['keycapColors']
  debug: boolean
}

export default function Keycaps({ keys, bounds, colors, debug }: KeycapsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(
    () => new RoundedBoxGeometry(1, KEY_HEIGHT, 1, 3, 0.075),
    []
  )
  const textures = useMemo(
    () => keys.map((key) => makeLegendTexture(key.label)),
    [keys]
  )

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const transform = new THREE.Object3D()
    keys.forEach((key, index) => {
      const slotW = key.w * UNIT
      const keyWidth = slotW - GAP
      const centerX = key.x * UNIT + slotW / 2
      const centerZ = key.y * UNIT + UNIT / 2
      transform.position.set(centerX - bounds.centerX, KEY_Y, centerZ - bounds.centerY)
      transform.scale.set(keyWidth, 1, UNIT - GAP)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)

      const color = key.group === 'mods' ? colors.mods : key.group === 'accents' ? colors.accents : colors.alphas
      mesh.setColorAt(index, new THREE.Color(color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [bounds.centerX, bounds.centerY, colors, keys])

  useEffect(() => () => {
    geometry.dispose()
    textures.forEach((texture) => texture?.dispose())
  }, [geometry, textures])

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, undefined, keys.length]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.42} metalness={0.02} />
      </instancedMesh>
      {keys.map((key, index) => {
        const texture = textures[index]
        const slotW = key.w * UNIT
        const centerX = key.x * UNIT + slotW / 2 - bounds.centerX
        const centerZ = key.y * UNIT + UNIT / 2 - bounds.centerY
        const keyWidth = slotW - GAP

        return (
          <group key={key.id}>
            {texture && (
              <mesh
                position={[centerX, KEY_Y + KEY_HEIGHT / 2 + 0.05, centerZ]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[keyWidth * 0.68, (UNIT - GAP) * 0.36]} />
                <meshBasicMaterial map={texture} transparent toneMapped={false} />
              </mesh>
            )}
            {debug && (
              <mesh
                position={[centerX, KEY_Y + KEY_HEIGHT / 2 + 0.1, centerZ]}
              >
                <boxGeometry args={[slotW, 0.1, UNIT]} />
                <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.9} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
