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

const STORE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

export default function HorizonBarChart({ data }) {
  const storeSet = new Set()
  const storeTotals = {}

  data.forEach((d) => {
    const s = d.store_id
    storeSet.add(s)
    if (!storeTotals[s]) {
      storeTotals[s] = { d7: 0, d30: 0, d90: 0 }
    }
    storeTotals[s].d7 += d.predicted_demand_7d || 0
    storeTotals[s].d30 += d.predicted_demand_30d || 0
    storeTotals[s].d90 += d.predicted_demand_90d || 0
  })

  const stores = Array.from(storeSet).sort((a, b) => Number(a) - Number(b))

  const chartData = [
    {
      horizon: '7-Day',
      ...Object.fromEntries(stores.map((s) => [`Store_${s}`, Math.round(storeTotals[s]?.d7 || 0)])),
    },
    {
      horizon: '30-Day (Primary)',
      ...Object.fromEntries(stores.map((s) => [`Store_${s}`, Math.round(storeTotals[s]?.d30 || 0)])),
    },
    {
      horizon: '90-Day',
      ...Object.fromEntries(stores.map((s) => [`Store_${s}`, Math.round(storeTotals[s]?.d90 || 0)])),
    },
  ]

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
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>{label}</div>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: 'var(--text-muted)' }}>
              <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
              <strong style={{ color: 'var(--text-main)' }}>{entry.value.toLocaleString()} units</strong>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="horizon" tick={{ fill: 'var(--chart-tick)', fontSize: 12 }} stroke="var(--border-subtle)" />
          <YAxis
            tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
            stroke="var(--border-subtle)"
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}
          />
          {stores.map((s, idx) => (
            <Bar
              key={s}
              dataKey={`Store_${s}`}
              name={`Store ${s}`}
              fill={STORE_COLORS[idx % STORE_COLORS.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
