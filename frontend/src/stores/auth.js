import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  async function login(username, password) {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const res = await fetch('/api/auth/login', { method: 'POST', body: formData })
    if (!res.ok) throw new Error((await res.json()).detail || 'Login fehlgeschlagen')
    const data = await res.json()
    token.value = data.access_token
    localStorage.setItem('token', data.access_token)
    await fetchUser()
  }
  
  async function fetchUser() {
    user.value = await api('/api/auth/me')
  }
  
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }
  
  async function api(url, options = {}) {
    const headers = { ...options.headers }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(options.body)
    }
    const res = await fetch(url, { ...options, headers })
    if (res.status === 401) { logout(); window.location.href = '/login'; throw new Error('Sitzung abgelaufen') }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`)
    if (res.status === 204) return null
    return res.json()
  }
  
  return { token, user, isAuthenticated, isAdmin, login, logout, fetchUser, api }
})
