import React, { useState, useEffect, useMemo, useRef } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import KPICard from './components/KPICard'
import LoadingSpinner from './components/LoadingSpinner'
import ExecutiveTab from './tabs/ExecutiveTab'
import DeepDiveTab from './tabs/DeepDiveTab'
import WorkbenchTab from './tabs/WorkbenchTab'
import MLBenchmarksTab from './tabs/MLBenchmarksTab'
import { computeInventory } from './api/client'
import {
  Boxes,
  Calendar,
  Layers,
  ShieldCheck,
  ShoppingCart,
  AlertTriangle,
  RotateCw,
  BarChart2,
  Search,
  Table,
  Brain,
  SlidersHorizontal,
  X,
} from 'lucide-react'

export default function App() {
  // Theme Engine
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('predictstock_theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('predictstock_theme', theme)
  }, [theme])

  // Navigation
  const [activeTab, setActiveTab] = useState('executive') // 'executive' | 'deepdive' | 'workbench' | 'benchmarks'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // Data & API states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rawRows, setRawRows] = useState([])
  const [backendKpis, setBackendKpis] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [isComputing, setIsComputing] = useState(false)

  // Policy state: Safety Buffer
  const [safetyBufferPct, setSafetyBufferPct] = useState(20)
  const debounceTimerRef = useRef(null)
  const isInitialMount = useRef(true)

  // Global Filter states
  const [availableStores, setAvailableStores] = useState([1, 2, 3, 4])
  const [selectedStores, setSelectedStores] = useState([1, 2, 3, 4])
  const availableStatuses = ['Critical', 'Low', 'Sufficient']
  const [selectedStatuses, setSelectedStatuses] = useState(['Critical', 'Low', 'Sufficient'])
  const [itemSearch, setItemSearch] = useState('')
  const [onlyNeedReorder, setOnlyNeedReorder] = useState(false)

  // Active filter count for badge in navbar
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (availableStores.length > 0 && selectedStores.length < availableStores.length) count += 1
    if (selectedStatuses.length < availableStatuses.length) count += 1
    if (onlyNeedReorder) count += 1
    if (safetyBufferPct !== 20) count += 1
    if (itemSearch.trim()) count += 1
    return count
  }, [availableStores, selectedStores, availableStatuses, selectedStatuses, onlyNeedReorder, safetyBufferPct, itemSearch])

  // Initial fetch on mount
  const fetchData = async (bufferPct = 20) => {
    try {
      setIsComputing(true)
      setError(null)
      const res = await computeInventory(bufferPct / 100.0)
      const { rows = [], kpis = {}, using_fallback = false } = res.data

      setRawRows(rows)
      setBackendKpis(kpis)
      setUsingFallback(using_fallback)

      if (kpis.stores && kpis.stores.length > 0) {
        setAvailableStores(kpis.stores)
        if (isInitialMount.current) {
          setSelectedStores(kpis.stores)
          isInitialMount.current = false
        }
      }
    } catch (err) {
      console.error('API Error:', err)
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to connect to PredictStock backend. Please check that FastAPI is running on port 8000.'
      )
    } finally {
      setLoading(false)
      setIsComputing(false)
    }
  }

  useEffect(() => {
    fetchData(20)
  }, [])

  // Debounced safety buffer change handler (800ms)
  const handleSafetyBufferChange = (newPct) => {
    setSafetyBufferPct(newPct)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData(newPct)
    }, 800)
  }

  // Handle uploaded stock or reset stock callback from Sidebar
  const handleStockUpdated = (apiResponse) => {
    if (apiResponse.rows) {
      setRawRows(apiResponse.rows)
    }
    if (apiResponse.kpis) {
      setBackendKpis(apiResponse.kpis)
    }
  }

  // Client-side filtering of the full dataset
  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      // Store filter
      if (!selectedStores.includes(row.store_id)) return false

      // Status filter
      if (!selectedStatuses.includes(row.stock_status)) return false

      // Order > 0 filter
      if (onlyNeedReorder && (row.reorder_quantity || 0) <= 0) return false

      // Item search filter
      if (itemSearch.trim()) {
        const query = itemSearch.trim().toLowerCase()
        const id = String(row.item_id || '').toLowerCase()
        const dept = String(row.dept_name || '').toLowerCase()
        if (!id.includes(query) && !dept.includes(query)) return false
      }

      return true
    })
  }, [rawRows, selectedStores, selectedStatuses, onlyNeedReorder, itemSearch])

  // Dynamically compute KPIs for filtered view
  const currentKpis = useMemo(() => {
    if (!filteredRows || filteredRows.length === 0) {
      return {
        totalPairs: 0,
        demand30d: 0,
        currentStock: 0,
        requiredStock: 0,
        reorderQty: 0,
        coveragePct: 0,
        criticalCount: 0,
        lowCount: 0,
        sufficientCount: 0,
      }
    }

    let demand30d = 0
    let currentStock = 0
    let requiredStock = 0
    let reorderQty = 0
    let criticalCount = 0
    let lowCount = 0
    let sufficientCount = 0

    filteredRows.forEach((r) => {
      demand30d += r.predicted_demand_30d || 0
      currentStock += r.current_stock || 0
      requiredStock += r.required_stock || 0
      reorderQty += r.reorder_quantity || 0
      if (r.stock_status === 'Critical') criticalCount += 1
      else if (r.stock_status === 'Low') lowCount += 1
      else sufficientCount += 1
    })

    const coveragePct = requiredStock > 0 ? (currentStock / requiredStock) * 100 : 100.0

    return {
      totalPairs: filteredRows.length,
      demand30d: Math.round(demand30d),
      currentStock: Math.round(currentStock),
      requiredStock: Math.round(requiredStock),
      reorderQty: Math.round(reorderQty),
      coveragePct: Number(coveragePct.toFixed(1)),
      criticalCount,
      lowCount,
      sufficientCount,
    }
  }, [filteredRows])

  return (
    <div className="antigravity-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Cybernetic Navbar */}
      <Navbar
        theme={theme}
        setTheme={setTheme}
        filterDrawerOpen={filterDrawerOpen}
        setFilterDrawerOpen={setFilterDrawerOpen}
        activeFilterCount={activeFilterCount}
        itemSearch={itemSearch}
        setItemSearch={setItemSearch}
        usingFallback={usingFallback}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Slide-over Filter & Scope Drawer */}
        <Sidebar
          filterDrawerOpen={filterDrawerOpen}
          setFilterDrawerOpen={setFilterDrawerOpen}
          safetyBufferPct={safetyBufferPct}
          onSafetyBufferChange={handleSafetyBufferChange}
          availableStores={availableStores}
          selectedStores={selectedStores}
          setSelectedStores={setSelectedStores}
          availableStatuses={availableStatuses}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          itemSearch={itemSearch}
          setItemSearch={setItemSearch}
          onlyNeedReorder={onlyNeedReorder}
          setOnlyNeedReorder={setOnlyNeedReorder}
          onStockUpdated={handleStockUpdated}
          isComputing={isComputing}
        />

        {/* Main Analytical Cockpit */}
        <main style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '1720px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Error Banner with Retry */}
          {error && (
            <div style={{
              background: 'var(--critical-bg)',
              border: '1px solid var(--critical-border)',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--critical)' }}>
                <AlertTriangle size={24} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Backend Connection Error</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
                    {error}
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchData(safetyBufferPct)}
                className="btn-cyber btn-cyber-primary"
                style={{ background: 'var(--critical)', borderColor: 'var(--critical)' }}
              >
                <RotateCw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Quick Active Filter Pills (Shown if filters are applied) */}
          {activeFilterCount > 0 && !loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '1.25rem',
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                <SlidersHorizontal size={14} />
                <span>Active Filters:</span>
              </div>

              {selectedStores.length < availableStores.length && (
                <span style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}>
                  Branches: {selectedStores.join(', ')}
                </span>
              )}

              {selectedStatuses.length < availableStatuses.length && (
                <span style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}>
                  Health: {selectedStatuses.join(', ')}
                </span>
              )}

              {onlyNeedReorder && (
                <span style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'var(--critical-bg)',
                  border: '1px solid var(--critical-border)',
                  color: 'var(--critical)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}>
                  Only Reorders &gt; 0
                </span>
              )}

              {safetyBufferPct !== 20 && (
                <span style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent-primary)',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}>
                  Buffer +{safetyBufferPct}%
                </span>
              )}

              {itemSearch.trim() && (
                <span style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  Search: "{itemSearch}"
                  <button
                    onClick={() => setItemSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setSelectedStores(availableStores)
                  setSelectedStatuses(['Critical', 'Low', 'Sufficient'])
                  setOnlyNeedReorder(false)
                  setItemSearch('')
                  setSafetyBufferPct(20)
                  fetchData(20)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.75rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Initial Loading State */}
          {loading ? (
            <LoadingSpinner message="Orchestrating 13,447 Direct Multi-Horizon Forecasts & Replenishment Policy..." />
          ) : (
            <>
              {/* Top Headline KPI Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.75rem',
              }}>
                <KPICard
                  title="Catalog Universe"
                  value={currentKpis.totalPairs.toLocaleString()}
                  sub={`Across ${selectedStores.length} active branch(es)`}
                  color="var(--accent-primary)"
                  icon={Boxes}
                  badge="Validated"
                />
                <KPICard
                  title="30-Day Forecast Demand"
                  value={currentKpis.demand30d.toLocaleString()}
                  sub="Primary operational horizon"
                  color="#6366f1"
                  icon={Calendar}
                  badge="Direct Model"
                />
                <KPICard
                  title="Current On-Hand Stock"
                  value={currentKpis.currentStock.toLocaleString()}
                  sub={
                    <span style={{
                      color: currentKpis.coveragePct >= 80 ? 'var(--sufficient)' : 'var(--low)',
                      fontWeight: 700,
                    }}>
                      Coverage: {currentKpis.coveragePct}%
                    </span>
                  }
                  color="var(--accent-secondary)"
                  icon={Layers}
                />
                <KPICard
                  title={`Required Inventory (+${safetyBufferPct}%)`}
                  value={currentKpis.requiredStock.toLocaleString()}
                  sub="30D Demand + Dynamic Safety Buffer"
                  color="var(--sufficient)"
                  icon={ShieldCheck}
                />
                <KPICard
                  title="Recommended Order"
                  value={currentKpis.reorderQty.toLocaleString()}
                  sub={
                    <span>
                      🚨 <strong style={{ color: 'var(--critical)' }}>{currentKpis.criticalCount}</strong> Crit | ⚠️{' '}
                      <strong style={{ color: 'var(--low)' }}>{currentKpis.lowCount}</strong> Low
                    </span>
                  }
                  color={currentKpis.reorderQty > 0 ? 'var(--critical)' : 'var(--sufficient)'}
                  icon={ShoppingCart}
                  badge={currentKpis.criticalCount > 0 ? 'Action Required' : 'Optimal'}
                />
              </div>

              {/* Antigravity Segmented Tab Controls */}
              <div className="nav-tab-container">
                <button
                  className={`nav-pill-tab ${activeTab === 'executive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('executive')}
                >
                  <BarChart2 size={16} />
                  <span>Executive Analytics</span>
                </button>

                <button
                  className={`nav-pill-tab ${activeTab === 'deepdive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('deepdive')}
                >
                  <Search size={16} />
                  <span>Product Deep Dive & Simulator</span>
                </button>

                <button
                  className={`nav-pill-tab ${activeTab === 'workbench' ? 'active' : ''}`}
                  onClick={() => setActiveTab('workbench')}
                >
                  <Table size={16} />
                  <span>Replenishment Workbench</span>
                </button>

                <button
                  className={`nav-pill-tab ${activeTab === 'benchmarks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('benchmarks')}
                >
                  <Brain size={16} />
                  <span>ML Benchmarks & Validation</span>
                </button>
              </div>

              {/* Tab View Container */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {activeTab === 'executive' && <ExecutiveTab data={filteredRows} />}
                {activeTab === 'deepdive' && (
                  <DeepDiveTab data={filteredRows} globalSafetyBufferPct={safetyBufferPct} />
                )}
                {activeTab === 'workbench' && <WorkbenchTab data={filteredRows} />}
                {activeTab === 'benchmarks' && <MLBenchmarksTab />}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
