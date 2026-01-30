/**
 * ==============================================================================
 * Name:           Phil Fischer
 * E-Mail:         p.fischer@phytech.de
 * Version:        30.01.2026.17.43.22
 * ==============================================================================
 * 
 * LogBot Branding Store - Pinia Store für Whitelabel-Konfiguration
 * =================================================================
 * Lädt die Branding-Einstellungen vom Backend und wendet sie an:
 * - CSS-Variablen für Farben
 * - Firmenname, Logo, Favicon
 * - Custom CSS
 * 
 * ==============================================================================
 */

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useThemeStore } from './themeStore'

// =============================================================================
// API Base URL - anpassen falls nötig
// =============================================================================
const API_BASE = '/api/branding'

// =============================================================================
// Branding Store Definition
// =============================================================================
export const useBrandingStore = defineStore('branding', () => {
  
  // ===========================================================================
  // State
  // ===========================================================================
  
  const loading = ref(true)
  const error = ref(null)
  
  const config = reactive({
    company_name: 'LogBot',
    tagline: 'Centralized Log Management',
    footer_text: '© 2026 LogBot. All rights reserved.',
    support_email: 'support@example.com',
    logo_path: null,
    favicon_path: null,
    default_theme: 'dark',
    allow_theme_toggle: true,
    primary_color: '#0ea5e9',
    secondary_color: '#6366f1',
    accent_color: '#22c55e',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    danger_color: '#ef4444',
    dark_scheme: {
      background: '#0a0a0f',
      surface: '#111118',
      surface_elevated: '#1a1a24',
      border: '#2a2a3a',
      text_primary: '#f8fafc',
      text_secondary: '#94a3b8',
      text_muted: '#64748b'
    },
    light_scheme: {
      background: '#f8fafc',
      surface: '#ffffff',
      surface_elevated: '#f1f5f9',
      border: '#e2e8f0',
      text_primary: '#0f172a',
      text_secondary: '#475569',
      text_muted: '#94a3b8'
    },
    custom_css: ''
  })
  
  // ===========================================================================
  // Actions
  // ===========================================================================
  
  async function loadConfig() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/config`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      Object.assign(config, data)
      
      const themeStore = useThemeStore()
      themeStore.initTheme(config.default_theme)
      
      applyCSS()
      updatePageMeta()
      
    } catch (err) {
      console.error('[Branding] Fehler beim Laden:', err)
      error.value = err.message
      applyCSS()
    } finally {
      loading.value = false
    }
  }
  
  async function saveConfig() {
    try {
      const response = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      applyCSS()
      updatePageMeta()
      
      return true
    } catch (err) {
      console.error('[Branding] Fehler beim Speichern:', err)
      error.value = err.message
      return false
    }
  }
  
  async function resetToDefaults() {
    try {
      const response = await fetch(`${API_BASE}/reset`, { method: 'POST' })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      Object.assign(config, data)
      
      applyCSS()
      updatePageMeta()
      
      return true
    } catch (err) {
      console.error('[Branding] Fehler beim Reset:', err)
      error.value = err.message
      return false
    }
  }
  
  async function uploadLogo(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`${API_BASE}/upload/logo`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      config.logo_path = data.path
      
      return true
    } catch (err) {
      console.error('[Branding] Logo-Upload Fehler:', err)
      error.value = err.message
      return false
    }
  }
  
  async function uploadFavicon(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`${API_BASE}/upload/favicon`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      config.favicon_path = data.path
      updatePageMeta()
      
      return true
    } catch (err) {
      console.error('[Branding] Favicon-Upload Fehler:', err)
      error.value = err.message
      return false
    }
  }
  
  function updateColor(key, value) {
    if (key.includes('.')) {
      const [scheme, prop] = key.split('.')
      if (config[scheme] && prop in config[scheme]) {
        config[scheme][prop] = value
      }
    } else if (key in config) {
      config[key] = value
    }
    applyCSS()
  }
  
  // ===========================================================================
  // CSS-Variablen Injection
  // ===========================================================================
  
  function applyCSS() {
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', config.primary_color)
    root.style.setProperty('--color-secondary', config.secondary_color)
    root.style.setProperty('--color-accent', config.accent_color)
    root.style.setProperty('--color-success', config.success_color)
    root.style.setProperty('--color-warning', config.warning_color)
    root.style.setProperty('--color-danger', config.danger_color)
    
    root.style.setProperty('--dark-bg', config.dark_scheme.background)
    root.style.setProperty('--dark-surface', config.dark_scheme.surface)
    root.style.setProperty('--dark-surface-elevated', config.dark_scheme.surface_elevated)
    root.style.setProperty('--dark-border', config.dark_scheme.border)
    root.style.setProperty('--dark-text-primary', config.dark_scheme.text_primary)
    root.style.setProperty('--dark-text-secondary', config.dark_scheme.text_secondary)
    root.style.setProperty('--dark-text-muted', config.dark_scheme.text_muted)
    
    root.style.setProperty('--light-bg', config.light_scheme.background)
    root.style.setProperty('--light-surface', config.light_scheme.surface)
    root.style.setProperty('--light-surface-elevated', config.light_scheme.surface_elevated)
    root.style.setProperty('--light-border', config.light_scheme.border)
    root.style.setProperty('--light-text-primary', config.light_scheme.text_primary)
    root.style.setProperty('--light-text-secondary', config.light_scheme.text_secondary)
    root.style.setProperty('--light-text-muted', config.light_scheme.text_muted)
    
    injectCustomCSS()
  }
  
  function injectCustomCSS() {
    const styleId = 'logbot-custom-css'
    let styleElement = document.getElementById(styleId)
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    
    styleElement.textContent = config.custom_css
  }
  
  function updatePageMeta() {
    document.title = config.company_name
    
    if (config.favicon_path) {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = `${API_BASE}/assets/${config.favicon_path}`
    }
  }
  
  // ===========================================================================
  // Getters
  // ===========================================================================
  
  function getLogoUrl() {
    return config.logo_path ? `${API_BASE}/assets/${config.logo_path}` : null
  }
  
  function getFaviconUrl() {
    return config.favicon_path ? `${API_BASE}/assets/${config.favicon_path}` : null
  }
  
  // ===========================================================================
  // Public API
  // ===========================================================================
  return {
    loading,
    error,
    config,
    loadConfig,
    saveConfig,
    resetToDefaults,
    uploadLogo,
    uploadFavicon,
    updateColor,
    applyCSS,
    getLogoUrl,
    getFaviconUrl
  }
})