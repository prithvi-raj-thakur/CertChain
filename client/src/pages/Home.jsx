// src/pages/Home.jsx
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import ContactForm from '../components/ContactForm'
import './Home.css'

const features = [
  {
    icon: '🔐',
    color: 'rgba(108,99,255,0.15)',
    title: 'Blockchain Secured',
    desc: 'Every certificate hash is immutably recorded on the Ethereum blockchain, making tampering impossible.',
  },
  {
    icon: '⚡',
    color: 'rgba(56,189,248,0.15)',
    title: 'Instant Verification',
    desc: 'Verify any certificate in seconds by entering its ID. No waiting, no manual checks.',
  },
  {
    icon: '📄',
    color: 'rgba(167,139,250,0.15)',
    title: 'PDF Certificates',
    desc: 'Automatically generate professional PDF certificates with embedded hash details.',
  },
  {
    icon: '📱',
    color: 'rgba(34,197,94,0.15)',
    title: 'QR Code Ready',
    desc: 'Each certificate includes a QR code linking directly to its verification page.',
  },
  {
    icon: '🔑',
    color: 'rgba(245,158,11,0.15)',
    title: 'JWT Authentication',
    desc: 'Secure admin panel with JWT-based authentication to prevent unauthorized issuance.',
  },
  {
    icon: '🌐',
    color: 'rgba(239,68,68,0.15)',
    title: 'Decentralized Truth',
    desc: 'The blockchain serves as the single source of truth — independent of any central server.',
  },
]

const blocks = [
  { label: 'Genesis Block', hash: '0x000…0000', verified: true },
  { label: 'Certificate #1', hash: '0xa3f…8b12', verified: true },
  { label: 'Certificate #2', hash: '0x7c2…f4e9', verified: true },
  { label: 'Pending…',       hash: '0x???…????', verified: false },
]

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Create a timeline for the hero elements
      const tl = gsap.timeline();
      
      tl.from('.hero-badge', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' })
        .from('.hero-title', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
        .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .from('.hero-actions', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home" ref={heroRef}>
      {/* Background decorations */}
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge" style={{ opacity: 1, transform: 'none', animation: 'none' }}>
          ⛓ Powered by Ethereum Blockchain
        </div>
        <h1 className="hero-title" style={{ opacity: 1, transform: 'none', animation: 'none' }}>
          Digital Certificates<br />
          <span className="hero-title-gradient">You Can Trust</span>
        </h1>
        <p className="hero-subtitle" style={{ opacity: 1, transform: 'none', animation: 'none' }}>
          Issue tamper-proof digital certificates and verify their authenticity
          instantly using the Ethereum blockchain. Every certificate is secured
          with SHA-256 hashing and stored on-chain forever.
        </p>
        <div className="hero-actions" style={{ opacity: 1, transform: 'none', animation: 'none' }}>
          <Link to="/verify" className="btn btn-primary btn-lg">
            🔍 Verify Certificate
          </Link>
          <Link to="/admin/login" className="btn btn-outline btn-lg">
            🏛 Admin Panel
          </Link>
        </div>
      </section>

      {/* ─── Blockchain visualization ──────────────────────────────────────── */}
      <motion.div 
        className="chain-visual"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {blocks.map((block, i) => (
          <React.Fragment key={i}>
            <motion.div
              className="block"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
              style={{
                borderColor: block.verified
                  ? 'rgba(108,99,255,0.4)'
                  : 'rgba(245,158,11,0.3)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#f0f0ff', marginBottom: 4 }}>
                {block.label}
              </div>
              <div className="block-hash">{block.hash}</div>
            </motion.div>
            {i < blocks.length - 1 && <div className="chain-link" />}
          </React.Fragment>
        ))}
      </motion.div>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <motion.div 
        className="stats"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {[
          { number: '100%', label: 'Tamper-Proof' },
          { number: 'SHA-256', label: 'Hash Algorithm' },
          { number: 'ETH', label: 'Blockchain' },
          { number: '<1s', label: 'Verify Time' },
        ].map((s, i) => (
          <motion.div 
            className="stat-item" 
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + (i * 0.1), duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="features">
        <motion.div 
          className="features-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6 }}
        >
          <h2>Why CertChain?</h2>
          <p style={{ marginTop: 12, color: '#8888aa' }}>
            Built for the modern era of digital credentials
          </p>
        </motion.div>
        
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              className="feature-card"
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5, 
                delay: i * 0.1,
                type: "spring",
                stiffness: 70,
                damping: 15
              }}
              style={{ animation: 'none' }} // Override CSS animation
            >
              <div className="feature-icon" style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Contact Form ─────────────────────────────────────────────────── */}
      <ContactForm />

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <motion.section 
        className="home-cta"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2>Ready to issue a certificate?</h2>
        <p>
          Log in as admin to start issuing blockchain-secured digital certificates
          in minutes.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/admin/login" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/verify" className="btn btn-outline btn-lg">
            Verify Now
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
