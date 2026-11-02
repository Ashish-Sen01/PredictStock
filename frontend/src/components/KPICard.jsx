import React from 'react'

export default function KPICard({
  title,
  value,
  sub,
  color = 'var(--accent-primary)',
  icon: Icon,
  badge,
}) {
  return (
    <div
      className="glass-panel glass-panel-interactive"
      style={{
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '130px',
      }}
    >
      {/* Top Accent Strip */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
      }} />

      {/* Header with Title and Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
          }}>
            {title}
          </span>
          {badge && (
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-dim)',
              width: 'fit-content',
            }}>
              {badge}
            </span>
          )}
        </div>

        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            boxShadow: `0 0 15px ${color}22`,
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* Numerals & Context */}
      <div>
        <div style={{
          fontSize: '1.85rem',
          fontWeight: 900,
          color: 'var(--text-main)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          fontFeatureSettings: '"tnum"',
        }}>
          {value}
        </div>

        {sub && (
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            marginTop: '0.45rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
