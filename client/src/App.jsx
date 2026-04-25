// src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Application root with React Router and Auth context.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

import Navbar              from './components/Navbar.jsx'
import Footer              from './components/Footer.jsx'
import Home                from './pages/Home.jsx'
import Login               from './pages/Login.jsx'
import IssueCertificate    from './pages/IssueCertificate.jsx'
import VerifyCertificate   from './pages/VerifyCertificate.jsx'
import ResultPage          from './pages/ResultPage.jsx'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}

function AppRoutes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/admin/login"   element={<Login />} />
          <Route path="/admin/issue"   element={
            <ProtectedRoute>
              <IssueCertificate />
            </ProtectedRoute>
          } />
          <Route path="/verify"        element={<VerifyCertificate />} />
          <Route path="/result/:id"    element={<ResultPage />} />
          {/* Catch-all */}
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

