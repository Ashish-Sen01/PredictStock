import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function StatusDonutChart({ data }) {
  const [activeItem, setActiveItem] = useState(null)

  // Aggregate status counts
  const summary = [
    { name: 'Critical', value: 0, color: 'var(--critical)', desc: 'Deficit < 50%' },
    { name: 'Low', value: 0, color: 'var(--low)', desc: 'Coverage 50-100%' },
    { name: 'Sufficient', value: 0, color: 'var(--sufficient)', desc: 'Fully covered ≥ 100%' },
  ]

  data.forEach((row) => {
    const s = row.stock_status
    if (s === 'Critical') summary[0].value += 1
    else if (s === 'Low') summary[1].value += 1
    else summary[2].value += 1
  })

  const total = summary.reduce((acc, curr) => acc + curr.value, 0)
  const currentDisplay = activeItem || (total > 0 ? {
    name: 'Total Tracked',
    value: total,
    color: 'var(--accent-primary)',
    desc: 'Product-Store Pairs',
    pct: '100%',
  } : null)

  const onPieEnter = (_, index) => {
    const item = summary[index]
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) + '%' : '0%'
    setActiveItem({ ...item, pct })
  }

  const onPieLeave = () => {
    setActiveItem(null)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
      return (
        <div style={{
          background: 'var(--chart-tooltip-bg)',
          padding: '0.65rem 0.9rem',
          borderRadius: '10px',
          border: '1px solid var(--chart-tooltip-border)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.8rem',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontWeight: 800, color: item.color }}>{item.name}</div>
          <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Pairs: <strong>{item.value.toLocaleString()}</strong>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Share: <strong>{pct}%</strong></div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: 320, position: 'relative' }}>
      {/* Center Dynamic Readout */}
      {currentDisplay && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
          }}>
            {currentDisplay.name}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            color: currentDisplay.color,
            lineHeight: 1.1,
            marginTop: '0.15rem',
          }}>
            {currentDisplay.value.toLocaleString()}
          </div>
          <div style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-dim)',
            marginTop: '0.15rem',
          }}>
            {currentDisplay.pct || currentDisplay.desc}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={summary}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={105}
            paddingAngle={4}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            cursor="pointer"
          >
            {summary.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                style={{
                  filter: activeItem?.name === entry.name ? 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend below donut */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.25rem',
        fontSize: '0.78rem',
      }}>
        {summary.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0
          return (
            <div
              key={entry.name}
              onMouseEnter={() => setActiveItem({ ...entry, pct: `${pct}%` })}
              onMouseLeave={() => setActiveItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                opacity: activeItem && activeItem.name !== entry.name ? 0.45 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: entry.color,
                boxShadow: `0 0 8px ${entry.color}`,
              }} />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{entry.name}:</span>
              <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
