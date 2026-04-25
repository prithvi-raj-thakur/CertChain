// src/components/Navbar.jsx
import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth()
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="navbar-logo-icon">⛓</div>
          <span className="navbar-logo-text">CertChain</span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/verify">Verify</NavLink></li>
          {isAuthenticated && <li><NavLink to="/admin/issue">Issue</NavLink></li>}
        </ul>

        {/* Desktop actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="navbar-user">
                <div className="navbar-user-dot" />
                {username}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="btn btn-outline btn-sm">
              Admin Login
            </Link>
          )}
          {/* Hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/verify" onClick={() => setMenuOpen(false)}>Verify Certificate</Link>
        {isAuthenticated && (
          <Link to="/admin/issue" onClick={() => setMenuOpen(false)}>Issue Certificate</Link>
        )}
        {isAuthenticated ? (
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{alignSelf:'flex-start'}}>
            Logout
          </button>
        ) : (
          <Link to="/admin/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>
            Admin Login
          </Link>
        )}
      </div>
    </>
  )
}
