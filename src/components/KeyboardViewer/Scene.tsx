import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboardConfig } from '../../store/keyboardConfig'
import { CASE_PADDING, GAP, getKeyboardLayout, UNIT } from '../../config/layout75'
import KeyboardCase from './Case'
import Keycaps from './Keycaps'

const VIEWER_SCALE = 1.65
const DISPLAY_SCALE = (0.28 / UNIT) * VIEWER_SCALE
const CASE_HEIGHT = 20
const KEYCAP_HEIGHT = 12

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
  fallbackAlt: string
  layout?: string
}

export interface KeyboardViewerHandle {
  captureImage: () => string
}

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

const createProceduralPreview = (
  layout: string,
  caseColor: string,
  keycapColors: { alphas: string; mods: string; accents: string }
) => {
  const keyboardLayout = getKeyboardLayout(layout)
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 700
  const context = canvas.getContext('2d')
  if (!context) throw new Error('ไม่สามารถสร้างภาพตัวอย่างคีย์บอร์ดได้')

  context.fillStyle = '#f1f0f8'
  context.fillRect(0, 0, canvas.width, canvas.height)

  const boardWidthMm = keyboardLayout.bounds.width + CASE_PADDING * 2
  const boardDepthMm = keyboardLayout.bounds.depth + CASE_PADDING * 2
  const pixelsPerMm = Math.min(1000 / boardWidthMm, 440 / boardDepthMm)
  const boardWidth = boardWidthMm * pixelsPerMm
  const boardHeight = boardDepthMm * pixelsPerMm
  const left = (canvas.width - boardWidth) / 2
  const top = (canvas.height - boardHeight) / 2

  context.shadowColor = 'rgba(30, 27, 50, 0.24)'
  context.shadowBlur = 26
  context.shadowOffsetY = 18
  drawRoundedRect(context, left, top, boardWidth, boardHeight, 30)
  context.fillStyle = caseColor
  context.fill()
  context.shadowColor = 'transparent'
  context.shadowBlur = 0
  context.shadowOffsetY = 0

  keyboardLayout.keys.forEach((key) => {
    const slotW = key.w * UNIT
    const width = (slotW - GAP) * pixelsPerMm
    const height = (UNIT - GAP) * pixelsPerMm
    const x = left + (CASE_PADDING + key.x * UNIT) * pixelsPerMm
    const y = top + (CASE_PADDING + key.y * UNIT) * pixelsPerMm
    const fill = key.group === 'mods' ? keycapColors.mods : key.group === 'accents' ? keycapColors.accents : keycapColors.alphas

    drawRoundedRect(context, x, y + 4, width, height, 8)
    context.fillStyle = '#252535'
    context.fill()
    drawRoundedRect(context, x, y, width, height - 4, 8)
    context.fillStyle = fill
    context.fill()

    if (UNIT * pixelsPerMm >= 34) {
      context.fillStyle = '#343244'
      context.font = `600 ${Math.max(10, Math.min(15, UNIT * pixelsPerMm * 0.27))}px Arial, sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(key.label, x + width / 2, y + height / 2 - 1, width - 6)
    }
  })

  return canvas.toDataURL('image/png')
}

function CameraFraming({ width, depth }: { width: number; depth: number }) {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !size.width || !size.height) return

    const verticalFov = THREE.MathUtils.degToRad(camera.fov)
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * (size.width / size.height))
    const azimuth = Math.atan2(0.45, 0.72)
    const elevation = Math.atan2(0.55, Math.hypot(0.45, 0.72))
    const horizontalSpan = (width * Math.cos(azimuth) + depth * Math.sin(azimuth)) * DISPLAY_SCALE
    const verticalSpan = (
      width * Math.sin(elevation) * Math.sin(azimuth) +
      depth * Math.sin(elevation) * Math.cos(azimuth) +
      (CASE_HEIGHT + KEYCAP_HEIGHT) * Math.cos(elevation)
    ) * DISPLAY_SCALE
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
  const caseWidth = keyboardLayout.bounds.width + CASE_PADDING * 2
  const caseDepth = keyboardLayout.bounds.depth + CASE_PADDING * 2
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'd' || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )) return
      setDebugMode((current) => !current)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <color attach="background" args={[background]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={2} />
      <directionalLight position={[-4, 3, -4]} intensity={0.7} color="#c4b5fd" />
      <CameraFraming width={caseWidth} depth={caseDepth} />
      <group scale={DISPLAY_SCALE} rotation={[-0.12, -0.18, 0]}>
        <KeyboardCase width={caseWidth} depth={caseDepth} material={caseMaterial} color={caseColor} />
        <Keycaps keys={keyboardLayout.keys} bounds={keyboardLayout.bounds} colors={keycapColors} debug={debugMode} />
      </group>
    </>
  )
}

const KeyboardViewer = forwardRef<KeyboardViewerHandle, SceneProps>(function KeyboardViewer(
  { fallbackAlt, layout = '75%' },
  ref
) {
  const [webglAvailable] = useState(hasWebGL)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const caseColor = useKeyboardConfig((state) => state.caseColor)
  const keycapColors = useKeyboardConfig((state) => state.keycapColors)
  const proceduralPreview = useMemo(
    () => createProceduralPreview(layout, caseColor, keycapColors),
    [layout, caseColor, keycapColors]
  )

  useImperativeHandle(ref, () => ({
    captureImage: () => {
      if (!webglAvailable) return proceduralPreview
      if (!canvasRef.current) throw new Error('โมเดล 3D ยังไม่พร้อม กรุณาลองอีกครั้ง')
      return canvasRef.current.toDataURL('image/png')
    }
  }), [proceduralPreview, webglAvailable])

  if (!webglAvailable) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" role="img" aria-label={fallbackAlt}>
        <img src={proceduralPreview} alt={fallbackAlt} className="h-full w-full object-contain" />
      </div>
    )
  }

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'default' }}
      onCreated={({ gl }) => {
        canvasRef.current = gl.domElement
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
})

export default KeyboardViewer
