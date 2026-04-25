// src/utils/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Axios instance pre-configured with the base URL.
// Vite proxy routes /api calls to Express (port 5000) during development.
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios'

const api = axios.create({
  baseURL: '/',    // Vite proxy handles /api → http://localhost:5000
  timeout: 30000,  // 30 seconds (blockchain tx can be slow)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor: surface error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api
