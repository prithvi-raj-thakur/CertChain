// src/pages/ResultPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import CertificateCard from '../components/CertificateCard.jsx'
import './ResultPage.css'

export default function ResultPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()

  const [result,  setResult]  = useState(null)
  const [qrCode,  setQrCode]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // ── Fetch verification result ───────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')

    api.get(`/api/certificates/verify/${id}`)
      .then(({ data }) => {
        setResult(data)
        // Fetch QR code in parallel
        return api.get(`/api/certificates/${id}/qr`)
      })
      .then(({ data }) => setQrCode(data.qrCode))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="result-page">
        <div className="bg-grid" />
        <div className="result-container">
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 20px' }} />
            <p style={{ color: '#8888aa' }}>Querying blockchain…</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error && !result) {
    return (
      <div className="result-page">
        <div className="bg-grid" />
        <div className="result-container">
          <div className="result-back">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>

          <div className="result-banner invalid">
            <div className="result-banner-icon">❌</div>
            <div>
              <div className="result-banner-title">Certificate Not Found</div>
              <div className="result-banner-msg">{error}</div>
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ marginBottom: 20 }}>
              The certificate ID <code style={{ color: '#a78bfa' }}>{id}</code> could not be found.
              <br />This may mean the certificate was never issued or the ID is incorrect.
            </p>
            <div className="result-actions" style={{ justifyContent: 'center' }}>
              <Link to="/verify" className="btn btn-primary">Try Another ID</Link>
              <Link to="/"       className="btn btn-ghost">Home</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const valid = result?.valid ?? false

  // ── Result display ──────────────────────────────────────────────────────────
  return (
    <div className="result-page">
      <div className="bg-grid" />
      <div className={`bg-orb bg-orb-1`} style={{
        opacity: 0.08,
        background: valid ? '#22c55e' : '#ef4444',
      }} />

      <div className="result-container">
        <div className="result-back">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* Status banner */}
        <div className={`result-banner ${valid ? 'valid' : 'invalid'}`}>
          <div className="result-banner-icon">{valid ? '✅' : '❌'}</div>
          <div>
            <div className="result-banner-title">
              {valid ? 'Certificate Verified' : 'Verification Failed'}
            </div>
            <div className="result-banner-msg">{result?.message}</div>
          </div>
        </div>

        {/* Certificate card */}
        {result?.certificate && (
          <>
            <div className="result-section-title">📄 Certificate Details</div>
            <CertificateCard cert={result.certificate} valid={valid} />
          </>
        )}

        {/* Blockchain status */}
        {result?.blockchainData && (
          <div style={{ marginTop: 20 }}>
            <div className="result-section-title">⛓ Blockchain Data</div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InfoItem label="On-Chain Exists" value={result.blockchainData.exists ? '✅ Yes' : '❌ No'} />
                <InfoItem label="Issued At"       value={result.blockchainData.issuedAt?.slice(0, 10) || '—'} />
                <InfoItem label="Student (Chain)" value={result.blockchainData.studentName || '—'} />
                <InfoItem label="Course (Chain)"  value={result.blockchainData.course      || '—'} />
              </div>
              {result.blockchainData.hash && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    On-Chain Hash
                  </div>
                  <div className="hash-display">{result.blockchainData.hash}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Code */}
        {qrCode && (
          <div style={{ marginTop: 20 }}>
            <div className="result-section-title">📱 QR Code</div>
            <div className="result-qr-container">
              <img src={qrCode} alt="QR Code for certificate verification" />
              <p style={{ fontSize: '0.8rem', color: '#8888aa' }}>
                Scan to verify this certificate
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="result-actions">
          {result?.certificate?.certId && (
            <a
              href={`/api/certificates/${result.certificate.certId}/download`}
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
              id="download-cert-btn"
            >
              📥 Download PDF
            </a>
          )}
          <button
            className="btn btn-outline"
            onClick={() => {
              navigator.clipboard.writeText(id)
            }}
          >
            📋 Copy ID
          </button>
          <Link to="/verify" className="btn btn-ghost">
            🔍 Verify Another
          </Link>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#f0f0ff', fontWeight: 500 }}>{value}</div>
    </div>
  )
}
