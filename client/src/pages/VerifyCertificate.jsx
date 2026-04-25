// src/pages/VerifyCertificate.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './VerifyCertificate.css'

export default function VerifyCertificate() {
  const [certId,  setCertId]  = useState('')
  const [error,   setError]   = useState('')
  const navigate = useNavigate()

  const handleVerify = (e) => {
    e.preventDefault()
    const id = certId.trim()
    if (!id) {
      setError('Please enter a Certificate ID')
      return
    }
    setError('')
    navigate(`/result/${id}`)
  }

  return (
    <div className="verify-page">
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" style={{ opacity: 0.07 }} />
      <div className="bg-orb bg-orb-2" style={{ opacity: 0.07 }} />

      <div className="verify-container">
        {/* Header */}
        <div className="verify-header">
          <div className="verify-icon animate-float">🔍</div>
          <h1>Verify Certificate</h1>
          <p>
            Enter the Certificate ID to instantly verify its authenticity
            against the Ethereum blockchain.
          </p>
        </div>

        {/* Verify card */}
        <div className="verify-card">
          <form onSubmit={handleVerify} id="verify-cert-form">
            <div className="form-group">
              <label htmlFor="certId">Certificate ID</label>
              <input
                id="certId"
                type="text"
                className="input"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                value={certId}
                onChange={(e) => { setCertId(e.target.value); setError('') }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              id="verify-cert-btn"
              className="btn btn-primary btn-full"
              disabled={!certId.trim()}
            >
              🔍 Verify Certificate
            </button>
          </form>

          <div className="verify-or">or</div>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#8888aa' }}>
            📱 Scan the QR code on the certificate to auto-fill the ID
          </p>

          {/* How it works */}
          <div className="verify-steps">
            {[
              'Enter the Certificate ID printed on the certificate',
              'Our system retrieves the hash from the Ethereum blockchain',
              'The hash is compared against the certificate record',
              'Result: ✅ Valid or ❌ Tampered / Not Found',
            ].map((step, i) => (
              <div className="verify-step" key={i}>
                <div className="verify-step-num">{i + 1}</div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
