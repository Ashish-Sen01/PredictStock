import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function BenchmarkBarChart({ data, metric = 'R2' }) {
  const horizons = ['7-Day', '30-Day', '90-Day']
  const chartData = horizons.map((h) => {
    const row = { Horizon: h }
    data.filter((d) => d.Horizon === h).forEach((d) => {
      row[d.Model] = d[metric]
    })
    return row
  })

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--chart-tooltip-bg)',
          padding: '0.8rem 1rem',
          borderRadius: '10px',
          border: '1px solid var(--chart-tooltip-border)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.8rem',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            {label} ({metric})
          </div>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.25rem', color: 'var(--text-muted)' }}>
              <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
              <strong style={{ color: 'var(--text-main)' }}>{entry.value !== undefined ? entry.value.toFixed(4) : '—'}</strong>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const yDomain = metric === 'R2' ? [0, 1.0] : ['auto', 'auto']

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="Horizon" tick={{ fill: 'var(--chart-tick)', fontSize: 12 }} stroke="var(--border-subtle)" />
          <YAxis
            domain={yDomain}
            tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
            stroke="var(--border-subtle)"
            tickFormatter={(val) => (typeof val === 'number' ? (metric === 'R2' ? val.toFixed(2) : val.toLocaleString()) : val)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}
          />
          <Bar dataKey="LightGBM" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="CatBoost" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          <Bar dataKey="XGBoost" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
