import React, { useState, useEffect, useMemo } from 'react'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import StockGaugeChart from '../charts/StockGaugeChart'
import DemandLineChart from '../charts/DemandLineChart'
import { getRelatedProducts } from '../api/client'
import {
  Sliders,
  Cpu,
  Info,
  Search,
  Sparkles,
  ArrowRight,
  Boxes,
  TrendingUp,
  Tag,
} from 'lucide-react'

export default function DeepDiveTab({ data = [], globalSafetyBufferPct = 20 }) {
  const availableStores = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.store_id))).sort((a, b) => a - b)
  }, [data])

  const [selectedStore, setSelectedStore] = useState(availableStores[0] || 1)

  const storeItems = useMemo(() => {
    return data
      .filter((d) => d.store_id === Number(selectedStore))
      .sort((a, b) => (b.reorder_quantity || 0) - (a.reorder_quantity || 0))
  }, [data, selectedStore])

  const [selectedItemId, setSelectedItemId] = useState('')

  useEffect(() => {
    if (storeItems.length > 0) {
      if (!storeItems.some((d) => d.item_id === selectedItemId)) {
        setSelectedItemId(storeItems[0].item_id)
      }
    } else {
      setSelectedItemId('')
    }
  }, [storeItems])

  const activeRow = useMemo(() => {
    return storeItems.find((d) => d.item_id === selectedItemId) || storeItems[0]
  }, [storeItems, selectedItemId])

  // Simulation state
  const [simStock, setSimStock] = useState(0)
  const [simBufferPct, setSimBufferPct] = useState(globalSafetyBufferPct)
  const [relatedItems, setRelatedItems] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [relatedMessage, setRelatedMessage] = useState('')

  useEffect(() => {
    if (activeRow) {
      setSimStock(activeRow.current_stock || 0)
      setSimBufferPct(globalSafetyBufferPct)
    }
  }, [activeRow, globalSafetyBufferPct])

  useEffect(() => {
    if (!activeRow?.item_id || !selectedStore) return

    setLoadingRelated(true)
    setRelatedMessage('')

    getRelatedProducts(activeRow.item_id, selectedStore, 6)
      .then((res) => {
        setRelatedItems(res.data.items || [])
        setRelatedMessage(res.data.message || '')
      })
      .catch(() => {
        setRelatedItems([])
        setRelatedMessage('Related products service currently offline.')
      })
      .finally(() => {
        setLoadingRelated(false)
      })
  }, [activeRow?.item_id, selectedStore])

  if (!data || data.length === 0 || !activeRow) {
    return (
      <GlassCard>
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>
            No pairs available for Deep Dive simulation
          </h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            Adjust your store branch or stock status filters.
          </p>
        </div>
      </GlassCard>
    )
  }

  const d7 = Number(activeRow.predicted_demand_7d || 0)
  const d30 = Number(activeRow.predicted_demand_30d || 0)
  const d90 = Number(activeRow.predicted_demand_90d || 0)

  const simReqStock = Math.ceil(d30 * (1 + simBufferPct / 100))
  const simReorder = Math.max(0, simReqStock - simStock)
  const simRatio = simReqStock > 0 ? simStock / simReqStock : 1.0

  let simStatus = 'Sufficient'
  if (simReqStock > 0 && simRatio < 0.5) simStatus = 'Critical'
  else if (simReqStock > 0 && simRatio < 1.0) simStatus = 'Low'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Interactive Cockpit Controls */}
      <GlassCard interactive>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Product × Store What-If Simulation Studio
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Adjust virtual inventory levels and safety margins to observe real-time health transitions
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-primary)',
              fontWeight: 700,
            }}>
              Active: {activeRow.item_id}
            </span>
          </div>
        </div>

        {/* 4 Interactive Simulation Inputs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          background: 'var(--bg-surface-subtle)',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
        }}>
          {/* Store Branch Picker */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
              Target Branch
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-solid)',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                outline: 'none',
              }}
            >
              {availableStores.map((s) => (
                <option key={s} value={s}>Store {s}</option>
              ))}
            </select>
          </div>

          {/* Product ID Picker */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
              Product ID ({storeItems.length.toLocaleString()} available)
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-solid)',
                fontSize: '0.86rem',
                fontWeight: 500,
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'JetBrains Mono',
              }}
            >
              {storeItems.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_id}
                </option>
              ))}
            </select>
          </div>

          {/* Simulated Stock Input */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
              Simulate Stock (Units)
            </label>
            <input
              type="number"
              min="0"
              max="1000000"
              value={simStock}
              onChange={(e) => setSimStock(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-solid)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                outline: 'none',
              }}
            />
          </div>

          {/* Simulated Safety Margin Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Simulate Safety Buffer
              </label>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                +{simBufferPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={simBufferPct}
              onChange={(e) => setSimBufferPct(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
                marginTop: '0.35rem',
              }}
            />
          </div>
        </div>

        {/* Metadata Chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginTop: '1rem',
          fontSize: '0.78rem',
        }}>
          {activeRow.dept_name && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}>
              <Tag size={12} color="var(--accent-primary)" />
              Dept: <strong style={{ color: 'var(--text-main)' }}>{activeRow.dept_name}</strong>
            </span>
          )}
          {activeRow.class_name && (
            <span style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}>
              Class: <strong style={{ color: 'var(--text-main)' }}>{activeRow.class_name}</strong>
            </span>
          )}
          {activeRow.item_type && (
            <span style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}>
              Type: <strong style={{ color: 'var(--text-main)' }}>{activeRow.item_type}</strong>
            </span>
          )}
          {activeRow.city && (
            <span style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}>
              City: <strong style={{ color: 'var(--text-main)' }}>{activeRow.city}</strong>
            </span>
          )}
        </div>
      </GlassCard>

      {/* 5 Reactive Metric Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
      }}>
        <GlassCard interactive style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            7-Day Forecast Demand
          </span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {d7.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>units</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
            Daily avg: {(d7 / 7).toFixed(1)} u/day
          </span>
        </GlassCard>

        <GlassCard interactive style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            30-Day Forecast Demand
          </span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--accent-primary)', marginTop: '0.4rem' }}>
            {d30.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>units</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
            Primary optimization horizon
          </span>
        </GlassCard>

        <GlassCard interactive style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Required Target Stock
          </span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {simReqStock.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>units</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
            Includes +{simBufferPct}% buffer
          </span>
        </GlassCard>

        <GlassCard interactive style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Simulated Replenishment
          </span>
          <div style={{
            fontSize: '1.55rem',
            fontWeight: 900,
            color: simReorder > 0 ? 'var(--critical)' : 'var(--sufficient)',
            marginTop: '0.4rem',
          }}>
            {simReorder.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>units</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
            Deficit: {(simStock - simReqStock).toLocaleString()} units
          </span>
        </GlassCard>

        <GlassCard interactive style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Coverage Status
          </span>
          <div style={{ marginTop: '0.35rem' }}>
            <StatusBadge status={simStatus} />
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
            Ratio: {(simRatio * 100).toFixed(1)}%
          </span>
        </GlassCard>
      </div>

      {/* Row: Stock Gauge Dial + Demand Trajectory */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 38%) minmax(400px, 1fr)',
        gap: '1.5rem',
      }}>
        <GlassCard interactive>
          <StockGaugeChart
            currentStock={simStock}
            requiredStock={simReqStock}
            ratio={simRatio}
            status={simStatus}
          />
        </GlassCard>

        <GlassCard interactive>
          <DemandLineChart
            d7={d7}
            d30={d30}
            d90={d90}
            simStock={simStock}
            simReqStock={simReqStock}
            itemId={activeRow.item_id}
            storeId={selectedStore}
          />
        </GlassCard>
      </div>

      {/* Related Products Intelligence Cluster */}
      <GlassCard interactive>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Related Category Product Cluster
              </h3>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.2rem' }}>
              Products sharing catalog hierarchy with live forecasts in Store {selectedStore}
            </p>
          </div>
          <span style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}>
            {relatedItems.length} suggestions
          </span>
        </div>

        {loadingRelated ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Analyzing catalog hierarchy & nearest neighbors...
          </div>
        ) : relatedItems.length > 0 ? (
          <div className="cyber-table-wrap">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Related SKU</th>
                  <th>Department</th>
                  <th>Class</th>
                  <th>Type</th>
                  <th>Match Confidence</th>
                  <th style={{ textAlign: 'right' }}>7D Forecast</th>
                  <th style={{ textAlign: 'right' }}>30D Forecast</th>
                  <th style={{ textAlign: 'center' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {relatedItems.map((item) => (
                  <tr key={item.item_id}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {item.item_id}
                    </td>
                    <td>{item.dept_name}</td>
                    <td>{item.class_name}</td>
                    <td>{item.item_type}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'var(--accent-glow)',
                        color: 'var(--accent-primary)',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                      }}>
                        <Sparkles size={11} />
                        {item.similarity_score}/10
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {item.predicted_demand_7d?.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.predicted_demand_30d?.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedItemId(item.item_id)}
                        className="btn-cyber btn-cyber-outline"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Inspect <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '1rem',
            borderRadius: '10px',
            background: 'var(--bg-surface-subtle)',
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
          }}>
            <Info size={16} />
            <span>{relatedMessage || `No related items found for this product in Store ${selectedStore}.`}</span>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
