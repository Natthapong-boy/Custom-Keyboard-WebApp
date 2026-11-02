import React from 'react'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'

export default function HomeLanding({ isStaff }) {
  const handleDesignerClick = (event) => {
    if (isStaff) {
      event.preventDefault()
      alert('โปรดเข้าสู่ระบบด้วยบัญชีลูกค้า')
    }
  }

  return (
    <div className="keyboard-landing">
      <section className="landing-hero" id="home-hero">
        <div className="landing-hero__image" aria-hidden="true" />
        <div className="landing-hero__content">
          <p className="landing-eyebrow"><span /> KEYCRAFT CUSTOM STUDIO</p>
          <h1>คีย์บอร์ดที่เริ่มต้น<br />จาก<br /><span>แบบของคุณ</span></h1>
          <p className="landing-hero__description">
            เลือกชิ้นส่วน จัดวางความชอบ แล้วประกอบคีย์บอร์ดที่ใช่ในแบบของคุณ
          </p>
          <Link to="/designer" onClick={handleDesignerClick} className="landing-cta">
            เริ่มออกแบบคีย์บอร์ด <Icon name="arrowRight" size={17} />
          </Link>
          <a className="landing-hero__scroll" href="#products-section">
            <span className="landing-hero__scroll-line" /> เลือกดูสินค้า
          </a>
        </div>
        <p className="landing-hero__index">01 / KEYCRAFT STUDIO</p>
      </section>
    </div>
  )
}
