import React, { useState, useMemo } from 'react'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import {
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from 'lucide-react'
import { downloadCSV, downloadParquet } from '../api/client'

export default function WorkbenchTab({ data = [] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  const [sortField, setSortField] = useState('reorder_quantity')
  const [sortDirection, setSortDirection] = useState('desc') // 'asc' | 'desc'
  const [isExporting, setIsExporting] = useState(false)

  // Handle column header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  // Sorted data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (aVal === undefined || aVal === null) aVal = ''
      if (bVal === undefined || bVal === null) bVal = ''

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const strA = String(aVal).toLowerCase()
      const strB = String(bVal).toLowerCase()
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortField, sortDirection])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true)
      const res = await downloadCSV()
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'predictstock_recommendations.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to download CSV: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadParquet = async () => {
    try {
      setIsExporting(true)
      const res = await downloadParquet()
      const blob = new Blob([res.data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'predictstock_recommendations.parquet'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to download Parquet: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  // Mini stock coverage meter helper
  const renderStockRatio = (ratio = 0) => {
    const pct = Math.min(100, Math.max(0, ratio * 100))
    let barColor = 'var(--sufficient)'
    if (ratio < 0.5) barColor = 'var(--critical)'
    else if (ratio < 1.0) barColor = 'var(--low)'

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '110px' }}>
        <div style={{
          flex: 1,
          height: '6px',
          background: 'var(--border-subtle)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: '9999px',
            boxShadow: `0 0 6px ${barColor}`,
          }} />
        </div>
        <span style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          color: barColor,
          minWidth: '34px',
        }}>
          {ratio ? ratio.toFixed(2) : '0.00'}
        </span>
      </div>
    )
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} color="var(--text-dim)" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} color="var(--accent-primary)" />
    ) : (
      <ArrowDown size={12} color="var(--accent-primary)" />
    )
  }

  return (
    <GlassCard style={{ padding: '1.75rem' }}>
      {/* Header & Export Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Replenishment Recommendation Table
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-primary)',
              fontFamily: 'monospace',
            }}>
              {sortedData.length.toLocaleString()} Pairs
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Multi-horizon inventory evaluation sorted dynamically by reorder urgency & stock ratio
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDownloadCSV}
            disabled={isExporting}
            className="btn-cyber btn-cyber-outline"
            title="Export filtered recommendations to CSV"
          >
            <Download size={15} />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handleDownloadParquet}
            disabled={isExporting}
            className="btn-cyber btn-cyber-primary"
            title="Export full recommendation dataset as Parquet"
          >
            <FileSpreadsheet size={15} />
            <span>Download Parquet</span>
          </button>
        </div>
      </div>

      {/* Cyber Table Wrap */}
      <div className="cyber-table-wrap">
        <table className="cyber-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('item_id')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Item ID</span> {renderSortIcon('item_id')}
                </div>
              </th>
              <th onClick={() => handleSort('store_id')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Store</span> {renderSortIcon('store_id')}
                </div>
              </th>
              <th onClick={() => handleSort('dept_name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Department</span> {renderSortIcon('dept_name')}
                </div>
              </th>
              <th>Type</th>
              <th onClick={() => handleSort('stock_status')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Status</span> {renderSortIcon('stock_status')}
                </div>
              </th>
              <th onClick={() => handleSort('current_stock')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span>Current Stock</span> {renderSortIcon('current_stock')}
                </div>
              </th>
              <th onClick={() => handleSort('predicted_demand_7d')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span>7D Demand</span> {renderSortIcon('predicted_demand_7d')}
                </div>
              </th>
              <th onClick={() => handleSort('predicted_demand_30d')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span>30D Demand</span> {renderSortIcon('predicted_demand_30d')}
                </div>
              </th>
              <th onClick={() => handleSort('predicted_demand_90d')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span>90D Demand</span> {renderSortIcon('predicted_demand_90d')}
                </div>
              </th>
              <th onClick={() => handleSort('safety_stock')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span>Safety Buffer</span> {renderSortIcon('safety_stock')}
                </div>
              </th>
              <th onClick={() => handleSort('required_stock')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span>Required</span> {renderSortIcon('required_stock')}
                </div>
              </th>
              <th onClick={() => handleSort('stock_ratio')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Stock Ratio</span> {renderSortIcon('stock_ratio')}
                </div>
              </th>
              <th onClick={() => handleSort('reorder_quantity')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span>Order Qty</span> {renderSortIcon('reorder_quantity')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No pairs match the active filter criteria. Adjust branch, status, or search filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isCrit = row.stock_status === 'Critical'
                return (
                  <tr key={`${row.item_id}-${row.store_id}`} className={isCrit ? 'row-crit-highlight' : ''}>
                    <td style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      fontSize: '0.82rem',
                    }}>
                      {row.item_id}
                    </td>
                    <td>
                      <span style={{
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: 'var(--text-main)',
                      }}>
                        Store {row.store_id}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.dept_name || '—'}</td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{row.item_type || '—'}</td>
                    <td>
                      <StatusBadge status={row.stock_status} />
                    </td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--text-main)',
                    }}>
                      {row.current_stock?.toLocaleString()}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {row.predicted_demand_7d?.toLocaleString()}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {row.predicted_demand_30d?.toLocaleString()}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {row.predicted_demand_90d?.toLocaleString()}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {row.safety_stock?.toLocaleString()}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--text-main)',
                    }}>
                      {row.required_stock?.toLocaleString()}
                    </td>
                    <td>
                      {renderStockRatio(row.stock_ratio)}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.9rem',
                      color: (row.reorder_quantity || 0) > 0 ? 'var(--critical)' : 'var(--sufficient)',
                    }}>
                      {row.reorder_quantity?.toLocaleString()}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div>
          Showing <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span> to <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span> of <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {sortedData.length.toLocaleString()}
          </span> records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="btn-cyber btn-cyber-outline"
            style={{
              padding: '0.4rem 0.6rem',
              opacity: currentPage === 1 ? 0.4 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
            title="First Page"
          >
            <ChevronsLeft size={15} />
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-cyber btn-cyber-outline"
            style={{
              padding: '0.4rem 0.6rem',
              opacity: currentPage === 1 ? 0.4 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
            title="Previous Page"
          >
            <ChevronLeft size={15} />
          </button>

          <div style={{
            padding: '0.35rem 0.85rem',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'var(--text-main)',
            fontFamily: 'monospace',
          }}>
            Page {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="btn-cyber btn-cyber-outline"
            style={{
              padding: '0.4rem 0.6rem',
              opacity: currentPage >= totalPages ? 0.4 : 1,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            }}
            title="Next Page"
          >
            <ChevronRight size={15} />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="btn-cyber btn-cyber-outline"
            style={{
              padding: '0.4rem 0.6rem',
              opacity: currentPage >= totalPages ? 0.4 : 1,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            }}
            title="Last Page"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>
    </GlassCard>
  )
}
