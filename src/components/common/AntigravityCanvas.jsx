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
    const mouse = { x: null, y: null, radius: 150 }
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

    // Particle nodes for Antigravity constellation & floating physics
    const particleCount = Math.min(Math.floor((width * height) / 14000), 100)
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        size: Math.random() * 2 + 0.8,
        baseAlpha: Math.random() * 0.45 + 0.2,
        alpha: 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#a855f7' : '#60a5fa'
      })
    }

    // Time counter for wave motion
    let time = 0

    const render = () => {
      time += 0.012
      ctx.clearRect(0, 0, width, height)

      // 1. Draw subtle fluid undulating grid waves in background
      ctx.lineWidth = 1
      const waveCount = 4
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath()
        const yOffset = (height / (waveCount + 1)) * (w + 1)
        ctx.strokeStyle = w % 2 === 0 ? 'rgba(168, 85, 247, 0.035)' : 'rgba(96, 165, 250, 0.025)'

        for (let x = 0; x <= width; x += 25) {
          const wave =
            Math.sin(x * 0.003 + time + w) * 28 +
            Math.cos(x * 0.006 - time * 0.7) * 14
          if (x === 0) {
            ctx.moveTo(x, yOffset + wave)
          } else {
            ctx.lineTo(x, yOffset + wave)
          }
        }
        ctx.stroke()
      }

      // 2. Update and draw particles with physics
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        // Wrap around screen edges smoothly
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Mouse Antigravity interaction (gentle deflection)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            const angle = Math.atan2(dy, dx)
            p.x -= Math.cos(angle) * force * 2.2
            p.y -= Math.sin(angle) * force * 2.2
          }
        }

        // Pulse alpha
        p.alpha = p.baseAlpha + Math.sin(time * 2 + p.pulseOffset) * 0.15

        // Draw particle dot
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0.1, p.alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // 3. Connect close nodes with subtle high-tech constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 120

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.15
            ctx.strokeStyle = p.color === p2.color ? p.color : '#a855f7'
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
        background: '#06050a',
        width: '100vw',
        height: '100vh'
      }}
    />
  )
}
