import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

export default function TopUrgentChart({ data }) {
  const sorted = [...data]
    .filter((d) => (d.reorder_quantity || 0) > 0)
    .sort((a, b) => (b.reorder_quantity || 0) - (a.reorder_quantity || 0))
    .slice(0, 12)
    .reverse()

  const chartData = sorted.map((d) => ({
    pair: `${d.item_id.slice(0, 8)}... (S${d.store_id})`,
    fullPair: `${d.item_id} (Store ${d.store_id})`,
    reorder: d.reorder_quantity,
    currentStock: d.current_stock,
    demand30d: d.predicted_demand_30d,
    requiredStock: d.required_stock,
    status: d.stock_status,
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
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
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>{item.fullPair}</div>
          <div style={{ color: item.status === 'Critical' ? 'var(--critical)' : 'var(--low)', fontWeight: 700 }}>
            Status: {item.status}
          </div>
          <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Recommended Order: <strong>{item.reorder?.toLocaleString()} units</strong>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Current Stock: {item.currentStock?.toLocaleString()}</div>
          <div style={{ color: 'var(--text-muted)' }}>Required Stock: {item.requiredStock?.toLocaleString()}</div>
          <div style={{ color: 'var(--text-muted)' }}>30D Demand: {item.demand30d?.toLocaleString()}</div>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350, color: 'var(--text-muted)' }}>
        No urgent replenishment orders required for current filters.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 30, left: 35, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
          <XAxis
            type="number"
            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
            stroke="var(--border-subtle)"
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <YAxis
            type="category"
            dataKey="pair"
            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
            stroke="var(--border-subtle)"
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="reorder" name="Order Quantity" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.status === 'Critical' ? 'var(--critical)' : 'var(--low)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
