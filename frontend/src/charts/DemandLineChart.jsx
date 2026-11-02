import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

export default function DemandLineChart({
  d7,
  d30,
  d90,
  simStock,
  simReqStock,
  itemId,
  storeId,
}) {
  const chartData = [
    { horizon: '7 Days', demand: d7 },
    { horizon: '30 Days', demand: d30 },
    { horizon: '90 Days', demand: d90 },
  ]

  const maxVal = Math.max(d90, simStock, simReqStock, 10) * 1.15

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--chart-tooltip-bg)',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          border: '1px solid var(--chart-tooltip-border)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.8rem',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{label} Forecast Demand</div>
          <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginTop: '0.2rem' }}>
            {payload[0].value?.toLocaleString()} units
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <div style={{
        fontSize: '0.82rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        marginBottom: '0.5rem',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        Demand Horizon Trajectory Curve
      </div>

      <ResponsiveContainer width="100%" height="88%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 15, bottom: 5 }}>
          <defs>
            <linearGradient id="demandGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="horizon" tick={{ fill: 'var(--chart-tick)', fontSize: 12 }} stroke="var(--border-subtle)" />
          <YAxis
            domain={[0, Math.ceil(maxVal)]}
            tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
            stroke="var(--border-subtle)"
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine
            y={simStock}
            stroke="var(--sufficient)"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: `Stock (${simStock?.toLocaleString()})`,
              fill: 'var(--sufficient)',
              position: 'insideTopLeft',
              fontSize: 11,
              fontWeight: 700,
            }}
          />
          <ReferenceLine
            y={simReqStock}
            stroke="var(--critical)"
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{
              value: `Required (${simReqStock?.toLocaleString()})`,
              fill: 'var(--critical)',
              position: 'insideBottomRight',
              fontSize: 11,
              fontWeight: 700,
            }}
          />

          <Area
            type="monotone"
            dataKey="demand"
            name="Forecast Demand"
            stroke="var(--accent-primary)"
            strokeWidth={3.5}
            fillOpacity={1}
            fill="url(#demandGlow)"
            dot={{ r: 6, fill: 'var(--accent-primary)', stroke: 'var(--bg-surface-solid)', strokeWidth: 2 }}
            activeDot={{ r: 8, stroke: 'var(--accent-secondary)', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
