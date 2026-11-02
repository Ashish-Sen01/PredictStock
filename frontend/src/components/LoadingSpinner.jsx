import React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = 'Initializing Antigravity Engine...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 2rem',
      gap: '1.25rem',
      width: '100%',
    }}>
      <div style={{
        position: 'relative',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Outer glowing pulsing ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid var(--accent-primary)',
          opacity: 0.3,
          animation: 'ringPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
        {/* Inner spinner */}
        <Loader2
          size={42}
          color="var(--accent-primary)"
          style={{ animation: 'spin 1.2s linear infinite' }}
        />
        <Sparkles
          size={18}
          color="var(--accent-secondary)"
          style={{ position: 'absolute' }}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          letterSpacing: '-0.01em',
        }}>
          {message}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Direct multi-horizon LightGBM tensor calculations running
        </p>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.25); opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
