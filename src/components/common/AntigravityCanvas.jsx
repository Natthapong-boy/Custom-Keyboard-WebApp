import React, { useEffect, useRef } from 'react'

export default function AntigravityCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Mouse coordinates
    const mouse = { x: null, y: null, radius: 160 }
    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Soft floating particles in modern purple tones
    const particleCount = Math.min(Math.floor((width * height) / 18000), 55)
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1.2,
        baseAlpha: Math.random() * 0.25 + 0.1,
        alpha: 0.15,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? 'rgba(124, 58, 237, 0.35)' : 'rgba(168, 85, 247, 0.25)'
      })
    }

    let time = 0

    const render = () => {
      time += 0.008
      ctx.clearRect(0, 0, width, height)

      // Draw subtle undulating wave lines in soft lavender
      ctx.lineWidth = 1
      const waveCount = 3
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath()
        const yOffset = (height / (waveCount + 1)) * (w + 1)
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.04)'

        for (let x = 0; x <= width; x += 30) {
          const wave =
            Math.sin(x * 0.0025 + time + w) * 22 +
            Math.cos(x * 0.005 - time * 0.5) * 12
          if (x === 0) {
            ctx.moveTo(x, yOffset + wave)
          } else {
            ctx.lineTo(x, yOffset + wave)
          }
        }
        ctx.stroke()
      }

      // Update and draw particles with physics
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Gentle deflection
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            const angle = Math.atan2(dy, dx)
            p.x -= Math.cos(angle) * force * 1.5
            p.y -= Math.sin(angle) * force * 1.5
          }
        }

        p.alpha = p.baseAlpha + Math.sin(time * 2 + p.pulseOffset) * 0.08

        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0.05, p.alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 110

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.08
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.4)'
            ctx.globalAlpha = lineAlpha
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1.0
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'linear-gradient(180deg, #FAF8FF 0%, #F5F2FE 50%, #FAF8FF 100%)',
        width: '100vw',
        height: '100vh'
      }}
    />
  )
}
