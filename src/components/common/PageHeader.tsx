'use client'

import React from 'react'
import Link from 'next/link'
import { HomeOutlined } from '@ant-design/icons'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: Array<{ label: string; path?: string }>
  actions?: React.ReactNode
  extra?: React.ReactNode
}

export default function PageHeader({ title, subtitle, breadcrumb, actions, extra }: PageHeaderProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        paddingTop: 16,
        paddingBottom: 20,
        marginBottom: 24,
      }}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <HomeOutlined style={{ fontSize: 11 }} />
          </Link>

          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 12, userSelect: 'none' }}>›</span>
              {item.path ? (
                <Link
                  href={item.path}
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 500 }}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div
          style={{
            borderLeft: subtitle ? '3px solid #10b981' : 'none',
            paddingLeft: subtitle ? 12 : 0,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--display-family)',
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                margin: '4px 0 0',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {extra && (
        <div style={{ marginTop: 16 }}>
          {extra}
        </div>
      )}
    </div>
  )
}
