import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeKeyboard({
  caseConfig,
  switchConfig,
  plateConfig,
  keycapConfig,
  layout = '75%',
  isExploded = false,
  rotationPreset = null,
  zoom = 1.0
}) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)

  // 3D Groups for 5 layers
  const assemblyGroupRef = useRef(null)
  const keycapsGroupRef = useRef(null)
  const switchesGroupRef = useRef(null)
  const plateMeshRef = useRef(null)
  const pcbMeshRef = useRef(null)
  const caseGroupRef = useRef(null)

  // Materials refs for real-time updates
  const materialsRef = useRef({})

  // Target positions for exploded animation
  const targetExplodeY = useRef({
    keycaps: 0,
    switches: 0,
    plate: 0,
    pcb: 0,
    case: 0
  })

  // User Orbit Interaction
  const isDraggingRef = useRef(false)
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const orbitRotationRef = useRef({ x: 0.55, y: -0.25 })

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 3.8, 8.5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // 3. Renderer with high-end Antialiasing & Shadow settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.innerHTML = ''
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    mainKeyLight.position.set(5, 10, 7)
    mainKeyLight.castShadow = true
    mainKeyLight.shadow.mapSize.width = 1024
    mainKeyLight.shadow.mapSize.height = 1024
    scene.add(mainKeyLight)

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.8)
    rimLight.position.set(-6, -2, -5)
    scene.add(rimLight)

    const topFill = new THREE.PointLight(0x60a5fa, 1.2, 15)
    topFill.position.set(0, 4, 2)
    scene.add(topFill)

    // Master Assembly Group
    const assemblyGroup = new THREE.Group()
    scene.add(assemblyGroup)
    assemblyGroupRef.current = assemblyGroup

    // ==========================================
    // BUILD 5 REALISTIC STRUCTURAL LAYERS
    // ==========================================

    const cols = layout === '65%' ? 14 : layout === 'TKL' ? 16 : 15
    const rows = 5
    const keyWidth = 0.38
    const keyDepth = 0.38
    const gap = 0.04
    const totalW = cols * (keyWidth + gap)
    const totalD = rows * (keyDepth + gap)

    // LAYER 5: CNC Aluminum Case & Brass Weight Bar
    const caseGroup = new THREE.Group()
    assemblyGroup.add(caseGroup)
    caseGroupRef.current = caseGroup

    const caseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(caseConfig.color),
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1
    })
    materialsRef.current.case = caseMat

    // Main Case Bevel
    const caseGeo = new THREE.BoxGeometry(totalW + 0.6, 0.45, totalD + 0.55)
    const caseMesh = new THREE.Mesh(caseGeo, caseMat)
    caseMesh.position.y = -0.22
    caseMesh.castShadow = true
    caseMesh.receiveShadow = true
    caseGroup.add(caseMesh)

    // Brass Weight Bar on bottom
    const weightMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15
    })
    const weightGeo = new THREE.BoxGeometry(totalW * 0.7, 0.05, totalD * 0.4)
    const weightMesh = new THREE.Mesh(weightGeo, weightMat)
    weightMesh.position.y = -0.46
    caseGroup.add(weightMesh)

    // LAYER 4: Hot-Swap PCB Board
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x061a10,
      roughness: 0.4,
      metalness: 0.5
    })
    const pcbGeo = new THREE.BoxGeometry(totalW + 0.2, 0.04, totalD + 0.2)
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat)
    pcbMesh.position.y = -0.05
    assemblyGroup.add(pcbMesh)
    pcbMeshRef.current = pcbMesh

    // LAYER 3: Switch Mounting Plate
    const plateMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(plateConfig.color),
      metalness: plateConfig.id === 'brass' ? 0.95 : plateConfig.id === 'aluminum' ? 0.7 : 0.2,
      roughness: plateConfig.id === 'brass' ? 0.2 : 0.5
    })
    materialsRef.current.plate = plateMat

    const plateGeo = new THREE.BoxGeometry(totalW + 0.22, 0.04, totalD + 0.22)
    const plateMesh = new THREE.Mesh(plateGeo, plateMat)
    plateMesh.position.y = 0.05
    assemblyGroup.add(plateMesh)
    plateMeshRef.current = plateMesh

    // LAYER 2: Mechanical Switches & Cross Stems
    const switchesGroup = new THREE.Group()
    assemblyGroup.add(switchesGroup)
    switchesGroupRef.current = switchesGroup

    const switchMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(switchConfig.color),
      roughness: 0.3,
      metalness: 0.1
    })
    materialsRef.current.switch = switchMat

    const switchBaseMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.6
    })

    const switchBaseGeo = new THREE.BoxGeometry(0.32, 0.12, 0.32)
    const stemGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12)

    // LAYER 1: Keycaps Group
    const keycapsGroup = new THREE.Group()
    assemblyGroup.add(keycapsGroup)
    keycapsGroupRef.current = keycapsGroup

    const keycapMainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(keycapConfig.topColor),
      roughness: 0.45,
      metalness: 0.05
    })
    const keycapAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(switchConfig.color),
      roughness: 0.35,
      metalness: 0.1
    })
    materialsRef.current.keycapMain = keycapMainMat
    materialsRef.current.keycapAccent = keycapAccentMat

    const keycapGeo = new THREE.BoxGeometry(keyWidth, 0.22, keyDepth)

    // Position Switches & Keycaps in Grid
    const startX = -(totalW / 2) + keyWidth / 2
    const startZ = -(totalD / 2) + keyDepth / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const posX = startX + c * (keyWidth + gap)
        const posZ = startZ + r * (keyDepth + gap)

        // Switch Base & Stem
        const sBase = new THREE.Mesh(switchBaseGeo, switchBaseMat)
        sBase.position.set(posX, 0.14, posZ)
        switchesGroup.add(sBase)

        const sStem = new THREE.Mesh(stemGeo, switchMat)
        sStem.position.set(posX, 0.22, posZ)
        switchesGroup.add(sStem)

        // Keycap Mesh
        const isAccent = (r === 0 && (c === 0 || c === cols - 1)) || (r === rows - 1 && c === Math.floor(cols / 2)) || (r === 2 && c === cols - 1)
        const kMesh = new THREE.Mesh(keycapGeo, isAccent ? keycapAccentMat : keycapMainMat)
        kMesh.position.set(posX, 0.36, posZ)
        kMesh.castShadow = true
        kMesh.receiveShadow = true
        keycapsGroup.add(kMesh)
      }
    }

    // Animation Loop
    let animationFrameId
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Smooth Exploded Separation Animation (Lerp)
      const lerpFactor = 0.1
      if (keycapsGroupRef.current) keycapsGroupRef.current.position.y += (targetExplodeY.current.keycaps - keycapsGroupRef.current.position.y) * lerpFactor
      if (switchesGroupRef.current) switchesGroupRef.current.position.y += (targetExplodeY.current.switches - switchesGroupRef.current.position.y) * lerpFactor
      if (plateMeshRef.current) plateMeshRef.current.position.y += (targetExplodeY.current.plate - plateMeshRef.current.position.y) * lerpFactor
      if (pcbMeshRef.current) pcbMeshRef.current.position.y += (targetExplodeY.current.pcb - pcbMeshRef.current.position.y) * lerpFactor
      if (caseGroupRef.current) caseGroupRef.current.position.y += (targetExplodeY.current.case - caseGroupRef.current.position.y) * lerpFactor

      // Apply 360 Orbit rotation
      if (assemblyGroupRef.current) {
        assemblyGroupRef.current.rotation.x = orbitRotationRef.current.x
        assemblyGroupRef.current.rotation.y = orbitRotationRef.current.y
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }

    // Use ResizeObserver to detect Fullscreen Expand / Modal toggle instantly
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(container)

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [layout])

  // Update Materials & Exploded target offsets
  useEffect(() => {
    if (materialsRef.current.case) {
      materialsRef.current.case.color.set(caseConfig.color)
    }
    if (materialsRef.current.switch) {
      materialsRef.current.switch.color.set(switchConfig.color)
    }
    if (materialsRef.current.plate) {
      materialsRef.current.plate.color.set(plateConfig.color)
      materialsRef.current.plate.metalness = plateConfig.id === 'brass' ? 0.95 : plateConfig.id === 'aluminum' ? 0.7 : 0.2
    }
    if (materialsRef.current.keycapMain) {
      materialsRef.current.keycapMain.color.set(keycapConfig.topColor)
    }
    if (materialsRef.current.keycapAccent) {
      materialsRef.current.keycapAccent.color.set(switchConfig.color)
    }

    // Update Exploded Separation Y Targets
    if (isExploded) {
      targetExplodeY.current = {
        keycaps: 1.6,
        switches: 0.95,
        plate: 0.35,
        pcb: -0.35,
        case: -1.1
      }
    } else {
      targetExplodeY.current = {
        keycaps: 0,
        switches: 0,
        plate: 0,
        pcb: 0,
        case: 0
      }
    }
  }, [caseConfig, switchConfig, plateConfig, keycapConfig, isExploded])

  // Apply Camera Presets
  useEffect(() => {
    if (rotationPreset === 'isometric') {
      orbitRotationRef.current = { x: 0.55, y: -0.35 }
    } else if (rotationPreset === 'top') {
      orbitRotationRef.current = { x: 1.45, y: 0 }
    } else if (rotationPreset === 'side') {
      orbitRotationRef.current = { x: 0.15, y: -1.45 }
    }
  }, [rotationPreset])

  // Apply Zoom
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = 8.5 / zoom
      cameraRef.current.updateProjectionMatrix()
    }
  }, [zoom])

  // Mouse / Touch 360 Orbit Interaction
  const handlePointerDown = (e) => {
    isDraggingRef.current = true
    prevMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return
    const deltaX = e.clientX - prevMouseRef.current.x
    const deltaY = e.clientY - prevMouseRef.current.y

    orbitRotationRef.current.y += deltaX * 0.008
    orbitRotationRef.current.x = Math.max(-0.2, Math.min(1.5, orbitRotationRef.current.x + deltaY * 0.008))

    prevMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing relative"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  )
}
