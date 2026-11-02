import React from 'react'
import {
  Sun,
  Moon,
  SlidersHorizontal,
  Search,
  X,
} from 'lucide-react'

export default function Navbar({
  theme,
  setTheme,
  filterDrawerOpen,
  setFilterDrawerOpen,
  activeFilterCount = 0,
  itemSearch,
  setItemSearch,
  usingFallback,
}) {
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* 2px Gradient Accent Bar */}
      <div style={{
        height: '2.5px',
        width: '100%',
        background: 'var(--accent-gradient)',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        gap: '1.5rem',
      }}>
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Real Logo Image */}
            <img
              src="/logo.png"
              alt="PredictStock Logo"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                objectFit: 'contain',
                boxShadow: '0 4px 15px var(--accent-glow)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  fontSize: '1.28rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-main)',
                  lineHeight: 1.1,
                }}>
                  PredictStock
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                Enterprise Retail Demand & Multi-Horizon Replenishment
              </p>
            </div>
          </div>

          {/* Live Pipeline Operational Pulse */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}>
            <span className="beacon-dot" />
            <span>13,447 Models Operational</span>
          </div>
        </div>

        {/* Center: Quick Item Search Bar */}
        <div style={{
          flex: 1,
          maxWidth: '440px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search
            size={16}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '0.85rem' }}
          />
          <input
            type="text"
            placeholder="Search item ID, catalog dept, class..."
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 2.2rem 0.55rem 2.4rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.84rem',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-primary)'
              e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)'
              e.target.style.boxShadow = 'none'
            }}
          />
          {itemSearch && (
            <button
              onClick={() => setItemSearch('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Actions: Filter Drawer Toggle, ML Badge & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="btn-cyber btn-cyber-outline"
            style={{
              borderColor: activeFilterCount > 0 ? 'var(--accent-primary)' : 'var(--border-subtle)',
              position: 'relative',
            }}
          >
            <SlidersHorizontal size={15} color={activeFilterCount > 0 ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{
                background: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                marginLeft: '0.2rem',
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="theme-switch-btn"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun size={19} color="#f59e0b" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }} />
            ) : (
              <Moon size={19} color="#4f46e5" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
