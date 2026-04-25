// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Auth context: provides login/logout state and JWT token management.
// Token is persisted in localStorage so admin stays logged in on refresh.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token,   setToken]   = useState(() => localStorage.getItem('certchain_token') || null)
  const [username, setUsername] = useState(() => localStorage.getItem('certchain_user') || null)

  const isAuthenticated = !!token

  // Keep Axios default header in sync with token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    setToken(data.token)
    setUsername(data.username)
    localStorage.setItem('certchain_token', data.token)
    localStorage.setItem('certchain_user',  data.username)
  }

  const logout = () => {
    setToken(null)
    setUsername(null)
    localStorage.removeItem('certchain_token')
    localStorage.removeItem('certchain_user')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
