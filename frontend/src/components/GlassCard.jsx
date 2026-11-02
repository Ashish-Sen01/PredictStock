import React from 'react'

export default function GlassCard({ children, style = {}, className = '', interactive = false }) {
  return (
    <div
      className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''} ${className}`}
      style={{
        padding: '1.4rem',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
