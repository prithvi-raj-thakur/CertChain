// src/pages/IssueCertificate.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api.js'
import './IssueCertificate.css'

export default function IssueCertificate() {
  const today = new Date().toISOString().slice(0, 10)

  const [form,    setForm]    = useState({ studentName: '', course: '', date: today })
  const [result,  setResult]  = useState(null)  // issued certificate data
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [recent,  setRecent]  = useState([])

  // Fetch recently issued certificates
  const fetchRecent = async () => {
    try {
      const { data } = await api.get('/api/certificates')
      setRecent(data.certificates.slice(0, 5))
    } catch (_) {
      // Silently fail — recent list is non-critical
    }
  }

  useEffect(() => { fetchRecent() }, [])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const { data } = await api.post('/api/certificates/issue', form)
      setResult(data)
      setForm({ studentName: '', course: '', date: today })
      fetchRecent()
    } catch (err) {
      setError(err.message || 'Failed to issue certificate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="issue-page">
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" style={{ opacity: 0.07 }} />

      <div className="issue-container">
        <div className="issue-header">
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            🏛 Admin Panel
          </div>
          <h1>Issue Certificate</h1>
          <p>Fill in the details below to issue a blockchain-secured digital certificate.</p>
        </div>

        <div className="issue-grid">
          {/* ── Issue form ─────────────────────────────────────────────────── */}
          <div className="issue-form-card">
            <h2>📋 Certificate Details</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} id="issue-cert-form">
              <div className="form-group">
                <label htmlFor="studentName">Student Name *</label>
                <input
                  id="studentName"
                  name="studentName"
                  type="text"
                  className="input"
                  placeholder="e.g. Jane Doe"
                  value={form.studentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="course">Course / Program *</label>
                <input
                  id="course"
                  name="course"
                  type="text"
                  className="input"
                  placeholder="e.g. Full Stack Web Development"
                  value={form.course}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="certDate">Issue Date *</label>
                <input
                  id="certDate"
                  name="date"
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="info-box" style={{ marginBottom: 20 }}>
                <strong>How it works:</strong> A SHA-256 hash of your certificate
                data will be generated and stored on the Ethereum blockchain.
                This ensures the certificate cannot be altered after issuance.
              </div>

              <button
                type="submit"
                id="issue-cert-btn"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Issuing on Blockchain…
                  </>
                ) : (
                  '⛓ Issue Certificate'
                )}
              </button>
            </form>
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <div className="issue-sidebar">
            {/* Success result */}
            {result && (
              <div className="issue-success">
                <div className="issue-success-icon">✅</div>
                <h3>Certificate Issued!</h3>

                {[
                  { label: 'Certificate ID', value: result.certId },
                  { label: 'Student',         value: result.studentName },
                  { label: 'Course',          value: result.course },
                  { label: 'Date',            value: result.date },
                  { label: 'SHA-256 Hash',    value: result.hash },
                  result.txHash && { label: 'TX Hash', value: result.txHash },
                ].filter(Boolean).map((row, i) => (
                  <div className="cert-detail-row" key={i}>
                    <div className="cert-detail-label">{row.label}</div>
                    <div className="cert-detail-value">{row.value}</div>
                  </div>
                ))}

                <div className="issue-actions">
                  {result.downloadUrl && (
                    <a
                      href={result.downloadUrl}
                      className="btn btn-primary btn-sm"
                      target="_blank"
                      rel="noreferrer"
                    >
                      📥 Download PDF
                    </a>
                  )}
                  <Link
                    to={`/result/${result.certId}`}
                    className="btn btn-outline btn-sm"
                  >
                    🔍 Verify
                  </Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(result.certId)
                    }}
                  >
                    📋 Copy ID
                  </button>
                </div>
              </div>
            )}

            {/* Recent certificates */}
            <div className="recent-card">
              <h3>🕐 Recently Issued</h3>
              {recent.length === 0 ? (
                <p style={{ color: '#8888aa', fontSize: '0.85rem' }}>
                  No certificates issued yet.
                </p>
              ) : (
                recent.map((c, i) => (
                  <div className="recent-item" key={i}>
                    <div className="recent-item-name">{c.studentName}</div>
                    <div className="recent-item-meta">
                      {c.course} · {c.date}
                    </div>
                    <div className="recent-item-meta" style={{ fontSize: '0.72rem', marginTop: 4 }}>
                      ID: {c.certId?.slice(0, 16)}…
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
