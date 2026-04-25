// src/components/CertificateCard.jsx
// Reusable certificate display card used on the Result and Issue pages.
import React from 'react'

export default function CertificateCard({ cert, valid }) {
  if (!cert) return null

  const statusColor = valid ? '#22c55e' : '#ef4444'
  const statusBg    = valid ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'
  const statusBorder = valid ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'

  return (
    <div
      className="card"
      style={{
        background: statusBg,
        borderColor: statusBorder,
        boxShadow: valid
          ? '0 0 32px rgba(34,197,94,0.12)'
          : '0 0 32px rgba(239,68,68,0.12)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Certificate ID
          </div>
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: '0.82rem', color: '#a78bfa', wordBreak: 'break-all' }}>
            {cert.certId}
          </div>
        </div>
        <span
          className="badge"
          style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, whiteSpace: 'nowrap' }}
        >
          {valid ? '✅ Valid' : '❌ Invalid'}
        </span>
      </div>

      {/* Info grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}>
        <InfoItem label="Student Name" value={cert.studentName} />
        <InfoItem label="Course"       value={cert.course} />
        <InfoItem label="Issue Date"   value={cert.date || cert.issuedAt?.slice(0, 10)} />
        {cert.txHash && (
          <InfoItem
            label="Transaction Hash"
            value={`${cert.txHash.slice(0, 12)}…${cert.txHash.slice(-8)}`}
            mono
          />
        )}
      </div>

      {/* Hash */}
      {cert.hash && (
        <div>
          <div style={{ fontSize: '0.75rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            SHA-256 Hash
          </div>
          <div className="hash-display">{cert.hash}</div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.95rem',
        color: '#f0f0ff',
        fontWeight: 500,
        fontFamily: mono ? 'Courier New, monospace' : undefined,
      }}>
        {value || '—'}
      </div>
    </div>
  )
}
