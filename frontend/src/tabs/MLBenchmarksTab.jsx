import React, { useState } from 'react'
import GlassCard from '../components/GlassCard'
import BenchmarkBarChart from '../charts/BenchmarkBarChart'
import {
  Award,
  TrendingUp,
  CheckCircle,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react'

const BENCHMARK_MODELS = [
  { Horizon: '7-Day', Model: 'LightGBM', MAE: 5.973, RMSE: 35.9214, R2: 0.9088 },
  { Horizon: '7-Day', Model: 'CatBoost', MAE: 6.7199, RMSE: 83.4915, R2: 0.5074 },
  { Horizon: '7-Day', Model: 'XGBoost', MAE: 6.818, RMSE: 87.657, R2: 0.457 },
  { Horizon: '30-Day', Model: 'LightGBM', MAE: 21.5318, RMSE: 207.0304, R2: 0.8144 },
  { Horizon: '30-Day', Model: 'CatBoost', MAE: 23.1553, RMSE: 249.43, R2: 0.7305 },
  { Horizon: '30-Day', Model: 'XGBoost', MAE: 24.4171, RMSE: 354.28, R2: 0.4564 },
  { Horizon: '90-Day', Model: 'LightGBM', MAE: 64.3348, RMSE: 858.3357, R2: 0.605 },
  { Horizon: '90-Day', Model: 'CatBoost', MAE: 64.6648, RMSE: 775.4362, R2: 0.6776 },
  { Horizon: '90-Day', Model: 'XGBoost', MAE: 66.2583, RMSE: 1018.0266, R2: 0.4443 },
]

const FINAL_MODEL_METRICS = [
  {
    horizon: '7-Day Short Horizon',
    r2: '0.9346',
    mae: '8.7609',
    rmse: '46.1236',
    bias: '-6.17%',
    role: 'Weekly Restock',
    isPrimary: false,
  },
  {
    horizon: '30-Day Primary Horizon',
    r2: '0.9292',
    mae: '32.9550',
    rmse: '205.8319',
    bias: '-2.26%',
    role: 'Primary (S&OP)',
    isPrimary: true,
  },
  {
    horizon: '90-Day Extended Horizon',
    r2: '0.6050',
    mae: '64.3348',
    rmse: '858.3357',
    bias: '-11.67%',
    role: 'Quarterly Procurement',
    isPrimary: false,
  },
]

export default function MLBenchmarksTab() {
  const [selectedMetric, setSelectedMetric] = useState('R2') // 'MAE' | 'R2' | 'RMSE'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top 3 KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* 7D Test */}
        <GlassCard interactive style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--accent-primary)',
            boxShadow: '0 0 10px var(--accent-primary)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}>
              7-Day Untouched Test Performance
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Award size={18} color="var(--accent-primary)" />
            </div>
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            marginTop: '0.4rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '-0.02em',
          }}>
            R² = 0.9346
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '0.4rem',
            display: 'flex',
            gap: '0.75rem',
          }}>
            <span>MAE: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>8.7609</strong></span>
            <span>•</span>
            <span>Bias: <strong style={{ color: 'var(--sufficient)', fontFamily: 'monospace' }}>-6.17%</strong></span>
          </div>
        </GlassCard>

        {/* 30D Test */}
        <GlassCard interactive style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--accent-secondary)',
            boxShadow: '0 0 10px var(--accent-secondary)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}>
              30-Day Untouched Test Performance
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={18} color="var(--accent-secondary)" />
            </div>
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            marginTop: '0.4rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '-0.02em',
          }}>
            R² = 0.9292
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '0.4rem',
            display: 'flex',
            gap: '0.75rem',
          }}>
            <span>MAE: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>32.9550</strong></span>
            <span>•</span>
            <span>Bias: <strong style={{ color: 'var(--sufficient)', fontFamily: 'monospace' }}>-2.26%</strong></span>
          </div>
        </GlassCard>

        {/* Universe & Consistency */}
        <GlassCard interactive style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--sufficient)',
            boxShadow: '0 0 10px var(--sufficient)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}>
              Horizon Integrity Universe
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--sufficient-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle size={18} color="var(--sufficient)" />
            </div>
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            marginTop: '0.4rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '-0.02em',
          }}>
            13,447 Pairs
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '0.4rem',
          }}>
            <strong style={{ color: 'var(--sufficient)' }}>99.54%</strong> monotonic consistency (30D &ge; 7D across pairs)
          </div>
        </GlassCard>
      </div>

      {/* 2 Symmetrical, Balanced Columns: Benchmark Chart + Final Production Model Performance */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Multi-Model Benchmark Chart */}
        <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    3-Model Direct Forecasting Benchmark
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Cross-horizon validation comparison establishing LightGBM superiority
                </p>
              </div>

              {/* Metric Toggle */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-surface-subtle)',
                padding: '0.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
              }}>
                {['R2', 'MAE', 'RMSE'].map((m) => {
                  const active = selectedMetric === m
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMetric(m)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        background: active ? 'var(--accent-gradient)' : 'transparent',
                        color: active ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        boxShadow: active ? '0 2px 8px var(--accent-glow)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {m === 'R2' ? 'R² Score' : m}
                    </button>
                  )
                })}
              </div>
            </div>

            <BenchmarkBarChart data={BENCHMARK_MODELS} metric={selectedMetric} />
          </div>

          <div style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}>
            <span>Benchmark Scope: <strong style={{ color: 'var(--text-main)' }}>Direct multi-horizon models (7D, 30D, 90D)</strong></span>
            <span style={{ color: 'var(--sufficient)', fontWeight: 700 }}>● LightGBM Selected</span>
          </div>
        </GlassCard>

        {/* Final Production Model Performance & Specs (Clean Replacement) */}
        <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--sufficient)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Final Model (LightGBM) Production Performance
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Validated multi-horizon evaluation on the untouched hold-out test dataset
              </p>
            </div>

            {/* Final Model Horizon Table */}
            <div className="cyber-table-wrap">
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Planning Horizon</th>
                    <th style={{ textAlign: 'right' }}>R² Score</th>
                    <th style={{ textAlign: 'right' }}>MAE</th>
                    <th style={{ textAlign: 'right' }}>RMSE</th>
                    <th style={{ textAlign: 'right' }}>Volume Bias</th>
                    <th style={{ textAlign: 'center' }}>Pipeline Role</th>
                  </tr>
                </thead>
                <tbody>
                  {FINAL_MODEL_METRICS.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: row.isPrimary ? 'var(--bg-surface-subtle)' : 'transparent',
                      }}
                    >
                      <td style={{
                        fontWeight: row.isPrimary ? 800 : 600,
                        color: 'var(--text-main)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: row.isPrimary ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                          }} />
                          <span>{row.horizon}</span>
                        </div>
                      </td>
                      <td style={{
                        textAlign: 'right',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: row.isPrimary ? 'var(--accent-primary)' : 'var(--text-main)',
                        fontSize: '0.9rem',
                      }}>
                        {row.r2}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{row.mae}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{row.rmse}</td>
                      <td style={{
                        textAlign: 'right',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: 'var(--sufficient)',
                      }}>
                        {row.bias}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: row.isPrimary ? 'var(--accent-gradient)' : 'var(--bg-surface-hover)',
                          color: row.isPrimary ? '#ffffff' : 'var(--text-muted)',
                          border: row.isPrimary ? 'none' : '1px solid var(--border-subtle)',
                          display: 'inline-block',
                          boxShadow: row.isPrimary ? '0 2px 6px var(--accent-glow)' : 'none',
                        }}>
                          {row.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Model Key Specifications Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <Cpu size={13} />
                  <span>Architecture</span>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  Direct LightGBM
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Leaf-wise histogram GBDT
                </div>
              </div>

              <div style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-secondary)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <Layers size={13} />
                  <span>Feature Space</span>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  31 Attributes
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Lags, moving stats, harmonics
                </div>
              </div>

              <div style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--sufficient)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <Clock size={13} />
                  <span>Inference Speed</span>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  &lt; 0.35s Latency
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  13,447 product-store pairs
                </div>
              </div>
            </div>
          </div>

          {/* Validation Guarantee Banner */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-glow)',
            fontSize: '0.78rem',
            color: 'var(--text-main)',
            lineHeight: 1.5,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sufficient)', fontWeight: 800, marginBottom: '0.2rem' }}>
              <ShieldCheck size={16} />
              <span>Validated Production Pipeline</span>
            </div>
            The final LightGBM model was evaluated on 89 days of unseen hold-out data (June 30 – September 26, 2024), achieving an exceptional <strong style={{ color: 'var(--accent-primary)' }}>0.9292 R²</strong> and a near-zero <strong style={{ color: 'var(--sufficient)' }}>-2.26%</strong> volume bias across 13,447 pairs for 30-day inventory replenishment.
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
