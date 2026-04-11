import { ref, computed } from 'vue'

const API = import.meta.env.VITE_API_BASE || '/api'

const token = ref<string | null>(localStorage.getItem('admin_token'))
const user = ref<Record<string, unknown> | null>(
  (() => {
    try {
      const stored = localStorage.getItem('admin_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })()
)

export const isAuthenticated = computed(() => !!token.value)
export const isAdmin = computed(() => (user.value as { role?: string } | null)?.role === 'admin')

export function login(newToken: string, newUser: Record<string, unknown>) {
  token.value = newToken
  user.value = newUser
  localStorage.setItem('admin_token', newToken)
  localStorage.setItem('admin_user', JSON.stringify(newUser))
}

export function logout() {
  token.value = null
  user.value = null
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {})
  }
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }

  const response = await fetch(`${API}${url}`, { ...options, headers })
  if (response.status === 401) {
    logout()
    throw new Error('SESSION_EXPIRED')
  }
  return response
}

export async function verifySession(): Promise<boolean> {
  if (!token.value) return false
  try {
    const res = await authFetch('/admin/me')
    if (!res.ok) {
      logout()
      return false
    }
    const data = await res.json()
    if (data.success && data.user) {
      user.value = data.user
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      return true
    }
    logout()
    return false
  } catch {
    logout()
    return false
  }
}

export function useAdminAuth() {
  return { token, user, isAuthenticated, isAdmin, login, logout, authFetch, verifySession }
}
