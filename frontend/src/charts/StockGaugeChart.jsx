import React from 'react'

export default function StockGaugeChart({
  currentStock = 0,
  requiredStock = 0,
  ratio = 0,
  status = 'Sufficient',
}) {
  const clampedRatio = Math.max(0.0, Math.min(1.5, ratio || 0))
  const angleDeg = 180 + (clampedRatio / 1.5) * 180
  const angleRad = (angleDeg * Math.PI) / 180

  const cx = 130
  const cy = 125
  const r = 85
  const strokeWidth = 16

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const startRad = ((startAngle - 180) * Math.PI) / 180
    const endRad = ((endAngle - 180) * Math.PI) / 180

    const x1 = x + radius * Math.cos(startRad)
    const y1 = y + radius * Math.sin(startRad)
    const x2 = x + radius * Math.cos(endRad)
    const y2 = y + radius * Math.sin(endRad)

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    return ['M', x1, y1, 'A', radius, radius, 0, largeArcFlag, 1, x2, y2].join(' ')
  }

  const redPath = describeArc(cx, cy, r, 0, 60)
  const yellowPath = describeArc(cx, cy, r, 60, 120)
  const greenPath = describeArc(cx, cy, r, 120, 180)

  const needleLength = 72
  const needleX = cx + needleLength * Math.cos(angleRad)
  const needleY = cy + needleLength * Math.sin(angleRad)

  let statusColor = 'var(--sufficient)'
  if (ratio < 0.5) statusColor = 'var(--critical)'
  else if (ratio < 1.0) statusColor = 'var(--low)'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 280,
    }}>
      <div style={{
        fontSize: '0.82rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        marginBottom: '0.25rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        Stock Coverage Arc Dial
      </div>

      <svg width="260" height="150" viewBox="0 0 260 150">
        <defs>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Background Arc Track */}
        <path
          d={describeArc(cx, cy, r, 0, 180)}
          fill="none"
          stroke="var(--bg-surface-subtle)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 1. Red Zone: 0% to 50% */}
        <path
          d={redPath}
          fill="none"
          stroke="var(--critical)"
          strokeWidth={strokeWidth}
          strokeOpacity="0.85"
        />

        {/* 2. Yellow Zone: 50% to 100% */}
        <path
          d={yellowPath}
          fill="none"
          stroke="var(--low)"
          strokeWidth={strokeWidth}
          strokeOpacity="0.85"
        />

        {/* 3. Green Zone: 100% to 150%+ */}
        <path
          d={greenPath}
          fill="none"
          stroke="var(--sufficient)"
          strokeWidth={strokeWidth}
          strokeOpacity="0.85"
        />

        {/* Zone Labels */}
        <text x="35" y="142" fontSize="9" fill="var(--critical)" fontWeight="800">0%</text>
        <text x="122" y="32" fontSize="9" fill="var(--low)" fontWeight="800" textAnchor="middle">100%</text>
        <text x="225" y="142" fontSize="9" fill="var(--sufficient)" fontWeight="800" textAnchor="end">150%+</text>

        {/* Dynamic Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="var(--text-main)"
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Center Hub */}
        <circle cx={cx} cy={cy} r="10" fill="var(--text-main)" />
        <circle cx={cx} cy={cy} r="4" fill="var(--bg-surface-solid)" />
      </svg>

      {/* Numerical Stats below gauge */}
      <div style={{ textAlign: 'center', marginTop: '0.4rem' }}>
        <div style={{
          fontSize: '1.6rem',
          fontWeight: 900,
          color: statusColor,
          lineHeight: 1.1,
          fontFeatureSettings: '"tnum"',
        }}>
          {(ratio * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Available: <strong style={{ color: 'var(--text-main)' }}>{currentStock.toLocaleString()}</strong> / Required: <strong style={{ color: 'var(--text-main)' }}>{requiredStock.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  )
}
