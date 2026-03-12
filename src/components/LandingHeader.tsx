'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'

interface LandingHeaderProps {
  showAuthButtons?: boolean
}

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '/#features' },
  { label: 'Preços', href: '/#pricing' },
  { label: 'Contato', href: '/#contact' },
]

export default function LandingHeader({ showAuthButtons = true }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    padding: '6px 2px',
    transition: 'color 0.15s, opacity 0.15s',
    position: 'relative',
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: scrolled ? 'blur(28px)' : 'blur(20px)',
        WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'blur(20px)',
        background: scrolled ? 'rgba(4, 47, 30, 0.97)' : 'rgba(4, 47, 30, 0.92)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22 }}>🐾</span>
          <span
            style={{
              fontFamily: 'var(--display-family)',
              fontWeight: 700,
              fontSize: 20,
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}
          >
            PetFlow
          </span>
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
          className="landing-nav-desktop"
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={navLinkStyle}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                e.currentTarget.style.opacity = '1'
              }}
            >
              {link.label}
            </Link>
          ))}

          {showAuthButtons && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link
                href="/login"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                }}
              >
                Entrar
              </Link>
              <Link
                href="/complete-registration"
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '7px 18px',
                  borderRadius: 8,
                  transition: 'background 0.15s, transform 0.1s',
                  display: 'inline-block',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#059669'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#10b981'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Começar Agora
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(prev => !prev)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: 8,
            fontSize: 18,
            lineHeight: 1,
          }}
          className="landing-nav-hamburger"
        >
          {isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isMenuOpen ? 400 : 0,
          transition: 'max-height 0.28s ease',
          background: 'rgba(4, 47, 30, 0.98)',
          borderTop: isMenuOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        }}
        className="landing-nav-mobile"
      >
        <div style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '10px 4px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'block',
              }}
            >
              {link.label}
            </Link>
          ))}

          {showAuthButtons && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 15,
                  fontWeight: 500,
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Entrar
              </Link>
              <Link
                href="/complete-registration"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: 8,
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Começar Agora
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .landing-nav-desktop { display: none !important; }
          .landing-nav-hamburger { display: flex !important; align-items: center; justify-content: center; }
        }
        @media (min-width: 768px) {
          .landing-nav-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
