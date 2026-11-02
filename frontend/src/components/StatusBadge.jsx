import React from 'react'

export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase()
  let badgeClass = 'status-badge-sufficient'
  let label = status || 'Sufficient'
  let dotColor = 'var(--sufficient)'

  if (norm.includes('crit')) {
    badgeClass = 'status-badge-critical'
    label = 'Critical'
    dotColor = 'var(--critical)'
  } else if (norm.includes('low')) {
    badgeClass = 'status-badge-low'
    label = 'Low'
    dotColor = 'var(--low)'
  }

  return (
    <span className={`status-badge-modern ${badgeClass}`}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: dotColor,
        display: 'inline-block',
      }} />
      <span>{label}</span>
    </span>
  )
}
