import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import key1 from '../assets/key1.jpg'
import key2 from '../assets/key2.jpg'
import key3 from '../assets/key3.jpg'

const products = [
  { id: 1, name: 'Void 75', type: 'Gasket mount / 75%', price: '$189', image: key1 },
  { id: 2, name: 'Nebula 65', type: 'Aluminium / 65%', price: '$159', image: key2 },
  { id: 3, name: 'Eclipse TKL', type: 'Wireless / TKL', price: '$219', image: key3 },
]

export default function Home() {
  const stageRef = useRef(null)
  const [rotation, setRotation] = useState({ x: -8, y: 14 })

  const handlePointerMove = (event) => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    setRotation({ x: -8 + y * -10, y: 14 + x * 18 })
  }

  const resetRotation = () => setRotation({ x: -8, y: 14 })

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Series 01 / Form follows feel</p>
          <h1>Make your<br /><em>space</em> yours.</h1>
          <p className="hero-description">
            Mechanical keyboards for people who care about the details. Designed in Tokyo. Built for your everyday.
          </p>
          <div className="hero-actions">
            <Link to="/designer" className="button button-primary">Design your keyboard <span>↗</span></Link>
            <a href="#collection" className="text-link">Explore collection <span>↓</span></a>
          </div>
          <div className="hero-meta">
            <div><strong>01</strong><span>Custom<br />built</span></div>
            <div><strong>100%</strong><span>Made for<br />your desk</span></div>
          </div>
        </div>

        <div
          className="keyboard-stage"
          ref={stageRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetRotation}
          aria-label="Interactive 3D keyboard preview"
        >
          <div className="stage-orbit orbit-one" />
          <div className="stage-orbit orbit-two" />
          <div className="keyboard-shadow" />
          <div className="keyboard-3d" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
            <div className="keyboard-top">
              <div className="keyboard-label">CK / 75</div>
              <div className="keyboard-light" />
              <div className="key-grid">
                {Array.from({ length: 60 }).map((_, index) => (
                  <span key={index} className={`key key-${index % 11 === 0 ? 'accent' : index % 7 === 0 ? 'wide' : 'base'}`} />
                ))}
              </div>
            </div>
            <div className="keyboard-side" />
          </div>
          <div className="drag-hint"><span>↔</span> move to explore</div>
        </div>
        <div className="scroll-cue"><span className="scroll-line" /> scroll to discover</div>
      </section>

      <section className="marquee-strip" aria-label="Collection highlights">
        <div>BUILT FOR FLOW <span>✦</span> QUIETLY OBSESSED <span>✦</span> YOUR DAILY RITUAL <span>✦</span> BUILT FOR FLOW <span>✦</span></div>
      </section>

      <section id="collection" className="collection-section">
        <div className="section-heading">
          <div><p className="eyebrow">The collection / 2024</p><h2>Objects of <em>attention.</em></h2></div>
          <p className="section-note">The right keyboard changes how work feels.<br />Find the one that fits your rhythm.</p>
        </div>
        <div className="product-showcase">
          {products.map((product, index) => (
            <Link to={`/product/${product.id}`} className={`showcase-card card-${index + 1}`} key={product.id}>
              <div className="card-image"><img src={product.image} alt={product.name} /><span className="card-index">0{index + 1}</span><span className="card-arrow">↗</span></div>
              <div className="card-details"><div><h3>{product.name}</h3><p>{product.type}</p></div><strong>{product.price}</strong></div>
            </Link>
          ))}
        </div>
        <Link to="/designer" className="collection-link">View all configurations <span>→</span></Link>
      </section>

      <section className="manifesto-section">
        <div className="manifesto-number">02</div>
        <div className="manifesto-content"><p className="eyebrow">Our philosophy</p><h2>Less noise.<br /><em>More signal.</em></h2><p>We believe the tools you use every day should feel like they belong to you. Every CustomKey is an invitation to slow down, focus in, and make something yours.</p><Link to="/designer" className="text-link">Read our story <span>↗</span></Link></div>
        <div className="manifesto-orb" />
      </section>
    </div>
  )
}
