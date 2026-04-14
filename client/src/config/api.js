const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

import { supabase } from './supabase'

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request(path, options = {}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = new Error(body.message || `Request failed: ${res.status}`)
    error.status = res.status
    error.body = body
    throw error
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
