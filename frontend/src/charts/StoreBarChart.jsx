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

export default function StoreBarChart({ data }) {
  const storeMap = {}

  data.forEach((row) => {
    const s = row.store_id
    if (!storeMap[s]) {
      storeMap[s] = {
        store: `Store ${s}`,
        currentStock: 0,
        requiredStock: 0,
        reorderQty: 0,
      }
    }
    storeMap[s].currentStock += row.current_stock || 0
    storeMap[s].requiredStock += row.required_stock || 0
    storeMap[s].reorderQty += row.reorder_quantity || 0
  })

  const chartData = Object.keys(storeMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => storeMap[k])

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
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>{label}</div>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.25rem', color: 'var(--text-muted)' }}>
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
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="store" tick={{ fill: 'var(--chart-tick)', fontSize: 12 }} stroke="var(--border-subtle)" />
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
          <Bar dataKey="currentStock" name="Current Stock" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="requiredStock" name="Required Stock" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="reorderQty" name="Recommended Order" fill="var(--critical)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
