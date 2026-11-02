import React, { useRef, useState } from 'react'
import {
  Upload,
  Download,
  RotateCcw,
  Sliders,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  X,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react'
import { downloadTemplate, uploadStock, resetStock } from '../api/client'

export default function Sidebar({
  filterDrawerOpen,
  setFilterDrawerOpen,
  safetyBufferPct,
  onSafetyBufferChange,
  availableStores,
  selectedStores,
  setSelectedStores,
  availableStatuses,
  selectedStatuses,
  setSelectedStatuses,
  itemSearch,
  setItemSearch,
  onlyNeedReorder,
  setOnlyNeedReorder,
  onStockUpdated,
  isComputing,
}) {
  const [stockSource, setStockSource] = useState('synthetic')
  const [uploadStatus, setUploadStatus] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadTemplate()
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'current_stock_template.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to download template: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const res = await uploadStock(file)
      setUploadStatus({
        type: 'success',
        text: `Validated ${res.data.count?.toLocaleString() || ''} inventory pairs.`,
      })
      if (onStockUpdated) onStockUpdated(res.data)
    } catch (err) {
      setUploadStatus({
        type: 'error',
        text: err.response?.data?.detail || 'CSV validation failed. Ensure headers: item_id, store_id, current_stock',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResetStock = async () => {
    try {
      const res = await resetStock()
      setStockSource('synthetic')
      setUploadStatus({ type: 'info', text: 'Reset to default synthetic demo stock.' })
      if (onStockUpdated) onStockUpdated(res.data)
    } catch (err) {
      alert('Failed to reset stock: ' + err.message)
    }
  }

  const toggleStore = (storeId) => {
    if (selectedStores.includes(storeId)) {
      if (selectedStores.length > 1) {
        setSelectedStores(selectedStores.filter((id) => id !== storeId))
      }
    } else {
      setSelectedStores([...selectedStores, storeId].sort())
    }
  }

  const selectAllStores = () => {
    setSelectedStores([...availableStores])
  }

  const toggleStatus = (status) => {
    if (selectedStatuses.includes(status)) {
      if (selectedStatuses.length > 1) {
        setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
      }
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  if (!filterDrawerOpen) return null

  return (
    <>
      {/* Backdrop for overlay */}
      <div
        onClick={() => setFilterDrawerOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 55,
        }}
      />

      {/* Slide-over Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '380px',
          maxWidth: '90vw',
          height: '100vh',
          background: 'var(--bg-surface-solid)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Optimization & Scope Controls
            </h2>
          </div>
          <button
            onClick={() => setFilterDrawerOpen(false)}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.35rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}>
          {/* Section 1: Optimization Policy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                1. Safety Buffer Policy
              </span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--accent-primary)',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px',
              }}>
                +{safetyBufferPct}%
              </span>
            </div>

            <div style={{
              background: 'var(--bg-surface-subtle)',
              padding: '1.15rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={safetyBufferPct}
                onChange={(e) => onSafetyBufferChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                <span>0% (Lean)</span>
                <span>20% (Default)</span>
                <span>100% (Double)</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.4 }}>
                Required Stock = 30-Day LightGBM Demand × (1 + {safetyBufferPct}%).
              </p>
              {isComputing && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.5rem' }}>
                  ⚡ Recomputing portfolio recommendation...
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Store Branches */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                2. Store Branches
              </span>
              <button
                onClick={selectAllStores}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Select All
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {availableStores.map((storeId) => {
                const active = selectedStores.includes(storeId)
                return (
                  <button
                    key={storeId}
                    onClick={() => toggleStore(storeId)}
                    style={{
                      padding: '0.6rem 0.8rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      background: active ? 'var(--accent-glow)' : 'var(--bg-surface-subtle)',
                      color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Store {storeId}</span>
                    {active && <CheckCircle2 size={15} color="var(--accent-primary)" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Stock Statuses */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
              3. Inventory Health Filter
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableStatuses.map((status) => {
                const active = selectedStatuses.includes(status)
                const color =
                  status === 'Critical'
                    ? 'var(--critical)'
                    : status === 'Low'
                    ? 'var(--low)'
                    : 'var(--sufficient)'

                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    style={{
                      padding: '0.6rem 0.9rem',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      borderRadius: '10px',
                      border: `1px solid ${active ? color : 'var(--border-subtle)'}`,
                      background: active ? `${color}18` : 'var(--bg-surface-subtle)',
                      color: active ? color : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }} />
                      <span>{status}</span>
                    </div>
                    {active && <CheckCircle2 size={15} color={color} />}
                  </button>
                )
              })}
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.82rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              marginTop: '0.75rem',
              cursor: 'pointer',
              background: 'var(--bg-surface-subtle)',
              padding: '0.75rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}>
              <input
                type="checkbox"
                checked={onlyNeedReorder}
                onChange={(e) => setOnlyNeedReorder(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              <span>Only pairs requiring reorder (&gt; 0 units)</span>
            </label>
          </div>

          {/* Section 4: Live Inventory Upload / Reset */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
              4. Inventory Data Source
            </span>

            <div style={{
              background: 'var(--bg-surface-subtle)',
              padding: '1.15rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setStockSource('synthetic')
                    handleResetStock()
                  }}
                  className="btn-cyber btn-cyber-outline"
                  style={{
                    flex: 1,
                    fontSize: '0.78rem',
                    background: stockSource === 'synthetic' ? 'var(--accent-glow)' : undefined,
                    borderColor: stockSource === 'synthetic' ? 'var(--accent-primary)' : undefined,
                  }}
                >
                  <RotateCcw size={14} /> Demo Stock
                </button>

                <button
                  onClick={() => setStockSource('upload')}
                  className="btn-cyber btn-cyber-outline"
                  style={{
                    flex: 1,
                    fontSize: '0.78rem',
                    background: stockSource === 'upload' ? 'var(--accent-glow)' : undefined,
                    borderColor: stockSource === 'upload' ? 'var(--accent-primary)' : undefined,
                  }}
                >
                  <Upload size={14} /> Upload CSV
                </button>
              </div>

              {stockSource === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={handleDownloadTemplate}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-solid)',
                      color: 'var(--text-main)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> Download Template CSV
                  </button>

                  <label
                    className="btn-cyber btn-cyber-primary"
                    style={{ fontSize: '0.78rem', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                  >
                    <FileSpreadsheet size={14} />
                    {isUploading ? 'Validating CSV...' : 'Select File (current_stock.csv)'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                  </label>

                  {uploadStatus && (
                    <div style={{
                      padding: '0.55rem',
                      borderRadius: '8px',
                      background: uploadStatus.type === 'error' ? 'var(--critical-bg)' : 'var(--sufficient-bg)',
                      border: `1px solid ${uploadStatus.type === 'error' ? 'var(--critical-border)' : 'var(--sufficient-border)'}`,
                      color: uploadStatus.type === 'error' ? 'var(--critical)' : 'var(--sufficient)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}>
                      {uploadStatus.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                      <span>{uploadStatus.text}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => setFilterDrawerOpen(false)}
            className="btn-cyber btn-cyber-primary"
            style={{ width: '100%' }}
          >
            Apply & Close
          </button>
        </div>
      </aside>
    </>
  )
}
