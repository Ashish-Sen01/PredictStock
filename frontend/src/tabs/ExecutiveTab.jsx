import React from 'react'
import GlassCard from '../components/GlassCard'
import StatusDonutChart from '../charts/StatusDonutChart'
import StoreBarChart from '../charts/StoreBarChart'
import TopUrgentChart from '../charts/TopUrgentChart'
import HorizonBarChart from '../charts/HorizonBarChart'
import { Activity, Building2, Flame, CalendarClock } from 'lucide-react'

export default function ExecutiveTab({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <GlassCard>
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>
            No records match active filters
          </h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            Open the Filters drawer in the top navigation to select store branches or stock health statuses.
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Row 1: Status Donut (35%) + Store Comparison (65%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 36%) minmax(400px, 1fr)',
        gap: '1.5rem',
      }}>
        {/* Status Distribution */}
        <GlassCard interactive>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Stock Status Health Distribution
              </h3>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-muted)',
            }}>
              Interactive Slices
            </span>
          </div>
          <StatusDonutChart data={data} />
        </GlassCard>

        {/* Store Comparison */}
        <GlassCard interactive>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="var(--accent-secondary)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Branch Inventory vs. Requirement vs. Replenishment
              </h3>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-muted)',
            }}>
              All Branches
            </span>
          </div>
          <StoreBarChart data={data} />
        </GlassCard>
      </div>

      {/* Row 2: Top 10 Urgent Items (55%) + Multi-Horizon Forecast Volume (45%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(380px, 54%) minmax(320px, 1fr)',
        gap: '1.5rem',
      }}>
        {/* Top 10 Urgent Items */}
        <GlassCard interactive>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={18} color="var(--critical)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Top 10 Critical Replenishment Priorities
              </h3>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'var(--critical-bg)',
              color: 'var(--critical)',
              border: '1px solid var(--critical-border)',
            }}>
              Highest Deficits
            </span>
          </div>
          <TopUrgentChart data={data} />
        </GlassCard>

        {/* Multi-Horizon Volume */}
        <GlassCard interactive>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarClock size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Multi-Horizon Demand Volume (7D / 30D / 90D)
              </h3>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-muted)',
            }}>
              Direct Multi-Horizon
            </span>
          </div>
          <HorizonBarChart data={data} />
        </GlassCard>
      </div>
    </div>
  )
}
