import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getKeyboardLayout } from '../../config/layout75'
import { useKeyboardConfig } from '../../store/keyboardConfig'
import KeyboardCase from './Case'
import Keycaps from './Keycaps'
import ProductImage from '../common/ProductImage'

const UNIT = 0.28
const ROW_GAP = 0.31
const VIEWER_SCALE = 1.65
const CASE_EDGE = 0.36

const hasWebGL = () => {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

interface SceneProps {
  fallbackImage?: string
  fallbackAlt: string
  layout?: string
}

function CameraFraming({ width, depth }: { width: number; depth: number }) {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !size.width || !size.height) return

    const verticalFov = THREE.MathUtils.degToRad(camera.fov)
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * (size.width / size.height))
    const azimuth = Math.atan2(0.45, 0.72)
    const elevation = Math.atan2(0.55, Math.hypot(0.45, 0.72))
    const horizontalSpan = (width * Math.cos(azimuth) + depth * Math.sin(azimuth)) * VIEWER_SCALE
    const verticalSpan = (
      width * Math.sin(elevation) * Math.sin(azimuth) +
      depth * Math.sin(elevation) * Math.cos(azimuth) +
      0.65 * Math.cos(elevation)
    ) * VIEWER_SCALE
    const fitDistance = Math.max(
      horizontalSpan / (2 * Math.tan(horizontalFov / 2)),
      verticalSpan / (2 * Math.tan(verticalFov / 2))
    ) * 1.08
    const direction = new THREE.Vector3(0.45, 0.55, 0.72).normalize()

    camera.position.copy(direction.multiplyScalar(fitDistance))
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, depth, size.height, size.width, width])

  return null
}

function KeyboardScene({ layout }: { layout: string }) {
  const caseMaterial = useKeyboardConfig((state) => state.caseMaterial)
  const caseColor = useKeyboardConfig((state) => state.caseColor)
  const keycapColors = useKeyboardConfig((state) => state.keycapColors)
  const background = useMemo(() => new THREE.Color('#f1f0f8'), [])
  const keyboardLayout = useMemo(() => getKeyboardLayout(layout), [layout])
  const caseWidth = keyboardLayout.width * UNIT + CASE_EDGE
  const caseDepth = (keyboardLayout.rowCount - 1) * ROW_GAP + UNIT + CASE_EDGE

  return (
    <>
      <color attach="background" args={[background]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={2} />
      <directionalLight position={[-4, 3, -4]} intensity={0.7} color="#c4b5fd" />
      <CameraFraming width={caseWidth} depth={caseDepth} />
      <group scale={VIEWER_SCALE} rotation={[-0.12, -0.18, 0]}>
        <KeyboardCase width={caseWidth} depth={caseDepth} material={caseMaterial} color={caseColor} />
        <Keycaps keys={keyboardLayout.keys} rowCount={keyboardLayout.rowCount} colors={keycapColors} />
      </group>
    </>
  )
}

export default function KeyboardViewer({ fallbackImage, fallbackAlt, layout = '75%' }: SceneProps) {
  const [webglAvailable] = useState(hasWebGL)

  if (!webglAvailable) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" role="img" aria-label={fallbackAlt}>
        <ProductImage
          src={fallbackImage}
          alt={fallbackAlt}
          className="flex h-full w-full items-center justify-center"
          imageClassName="max-h-[480px] w-full object-contain drop-shadow-md"
          loading="eager"
        />
      </div>
    )
  }

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#f1f0f8')
        gl.toneMapping = THREE.ACESFilmicToneMapping
      }}
      aria-label={`คีย์บอร์ดจำลองสามมิติ Layout ${getKeyboardLayout(layout).label} จำนวน ${getKeyboardLayout(layout).keyCount} ปุ่ม`}
    >
      <KeyboardScene layout={layout} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableZoom
        minDistance={3}
        maxDistance={40}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI - 0.08}
        rotateSpeed={0.8}
        zoomSpeed={0.8}
        autoRotate
        autoRotateSpeed={0.45}
      />
    </Canvas>
  )
}
