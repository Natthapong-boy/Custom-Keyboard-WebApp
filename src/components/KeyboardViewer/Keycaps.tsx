import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { KeyboardKey } from '../../config/layout75'
import type { KeyboardAppearance } from '../../store/keyboardConfig'

const UNIT = 0.28
const KEY_GAP = 0.045
const ROW_GAP = 0.31
const KEY_HEIGHT = 0.18
const KEY_Y = 0.16

const makeLegendTexture = (legend: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) return null

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#343244'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `600 ${legend.length > 4 ? 34 : 48}px "Noto Sans Thai", Arial, sans-serif`
  context.fillText(legend, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

interface KeycapsProps {
  keys: KeyboardKey[]
  rowCount: number
  colors: KeyboardAppearance['keycapColors']
}

export default function Keycaps({ keys, rowCount, colors }: KeycapsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(
    () => new RoundedBoxGeometry(1, KEY_HEIGHT, 1, 3, 0.075),
    []
  )
  const textures = useMemo(
    () => keys.map((key) => makeLegendTexture(key.legend)),
    [keys]
  )

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const transform = new THREE.Object3D()
    keys.forEach((key, index) => {
      const width = (key.width - KEY_GAP) * UNIT
      transform.position.set(key.x * UNIT, KEY_Y, (key.y - (rowCount - 1) / 2) * ROW_GAP)
      transform.scale.set(width, 1, UNIT - KEY_GAP)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)

      const color = key.group === 'mods' ? colors.mods : key.group === 'accents' ? colors.accents : colors.alphas
      mesh.setColorAt(index, new THREE.Color(color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [colors, keys, rowCount])

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
        if (!texture) return null

        return (
          <mesh
            key={key.id}
            position={[key.x * UNIT, KEY_Y + KEY_HEIGHT / 2 + 0.001, (key.y - (rowCount - 1) / 2) * ROW_GAP]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[(key.width - KEY_GAP) * UNIT * 0.68, UNIT * 0.36]} />
            <meshBasicMaterial map={texture} transparent toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}
