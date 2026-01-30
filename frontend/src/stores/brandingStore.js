/**
 * ==============================================================================
 * Name:           Phil Fischer
 * E-Mail:         p.fischer@phytech.de
 * Version:        30.01.2026.17.12.33
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
  
  /**
   * Ladezustand - true während Config geladen wird
   */
  const loading = ref(true)
  
  /**
   * Fehlermeldung falls Laden fehlschlägt
   */
  const error = ref(null)
  
  /**
   * Vollständige Branding-Konfiguration vom Backend
   */
  const config = reactive({
    // Allgemein
    company_name: 'LogBot',
    tagline: 'Centralized Log Management',
    footer_text: '© 2026 LogBot. All rights reserved.',
    support_email: 'support@example.com',
    
    // Assets
    logo_path: null,
    favicon_path: null,
    
    // Theme
    default_theme: 'dark',
    allow_theme_toggle: true,
    
    // Markenfarben
    primary_color: '#0ea5e9',
    secondary_color: '#6366f1',
    accent_color: '#22c55e',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    danger_color: '#ef4444',
    
    // Dark Mode
    dark_scheme: {
      background: '#0a0a0f',
      surface: '#111118',
      surface_elevated: '#1a1a24',
      border: '#2a2a3a',
      text_primary: '#f8fafc',
      text_secondary: '#94a3b8',
      text_muted: '#64748b'
    },
    
    // Light Mode
    light_scheme: {
      background: '#f8fafc',
      surface: '#ffffff',
      surface_elevated: '#f1f5f9',
      border: '#e2e8f0',
      text_primary: '#0f172a',
      text_secondary: '#475569',
      text_muted: '#94a3b8'
    },
    
    // Custom CSS
    custom_css: ''
  })
  
  // ===========================================================================
  // Actions
  // ===========================================================================
  
  /**
   * Lädt die Branding-Konfiguration vom Backend
   * Sollte beim App-Start aufgerufen werden
   */
  async function loadConfig() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/config`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      // Config-Objekt aktualisieren
      Object.assign(config, data)
      
      // Theme initialisieren
      const themeStore = useThemeStore()
      themeStore.initTheme(config.default_theme)
      
      // CSS-Variablen anwenden
      applyCSS()
      
      // Favicon und Titel setzen
      updatePageMeta()
      
    } catch (err) {
      console.error('[Branding] Fehler beim Laden:', err)
      error.value = err.message
      
      // Trotzdem CSS anwenden mit Default-Werten
      applyCSS()
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Speichert die aktuelle Konfiguration im Backend
   */
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
      
      // CSS neu anwenden
      applyCSS()
      updatePageMeta()
      
      return true
    } catch (err) {
      console.error('[Branding] Fehler beim Speichern:', err)
      error.value = err.message
      return false
    }
  }
  
  /**
   * Setzt alle Einstellungen auf Standardwerte zurück
   */
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
  
  /**
   * Lädt ein Logo hoch
   * @param {File} file - Die Bilddatei
   */
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
  
  /**
   * Lädt ein Favicon hoch
   * @param {File} file - Die Bilddatei
   */
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
  
  /**
   * Aktualisiert eine einzelne Farbe
   * @param {string} key - z.B. 'primary_color' oder 'dark_scheme.background'
   * @param {string} value - Hex-Farbwert
   */
  function updateColor(key, value) {
    if (key.includes('.')) {
      // Nested key wie 'dark_scheme.background'
      const [scheme, prop] = key.split('.')
      if (config[scheme] && prop in config[scheme]) {
        config[scheme][prop] = value
      }
    } else if (key in config) {
      config[key] = value
    }
    
    // CSS sofort aktualisieren für Live-Preview
    applyCSS()
  }
  
  // ===========================================================================
  // CSS-Variablen Injection
  // ===========================================================================
  
  /**
   * Wendet alle CSS-Variablen auf :root an
   * Wird bei jedem Config-Update aufgerufen
   */
  function applyCSS() {
    const root = document.documentElement
    
    // Markenfarben (theme-unabhängig)
    root.style.setProperty('--color-primary', config.primary_color)
    root.style.setProperty('--color-secondary', config.secondary_color)
    root.style.setProperty('--color-accent', config.accent_color)
    root.style.setProperty('--color-success', config.success_color)
    root.style.setProperty('--color-warning', config.warning_color)
    root.style.setProperty('--color-danger', config.danger_color)
    
    // Dark Mode Farben
    root.style.setProperty('--dark-bg', config.dark_scheme.background)
    root.style.setProperty('--dark-surface', config.dark_scheme.surface)
    root.style.setProperty('--dark-surface-elevated', config.dark_scheme.surface_elevated)
    root.style.setProperty('--dark-border', config.dark_scheme.border)
    root.style.setProperty('--dark-text-primary', config.dark_scheme.text_primary)
    root.style.setProperty('--dark-text-secondary', config.dark_scheme.text_secondary)
    root.style.setProperty('--dark-text-muted', config.dark_scheme.text_muted)
    
    // Light Mode Farben
    root.style.setProperty('--light-bg', config.light_scheme.background)
    root.style.setProperty('--light-surface', config.light_scheme.surface)
    root.style.setProperty('--light-surface-elevated', config.light_scheme.surface_elevated)
    root.style.setProperty('--light-border', config.light_scheme.border)
    root.style.setProperty('--light-text-primary', config.light_scheme.text_primary)
    root.style.setProperty('--light-text-secondary', config.light_scheme.text_secondary)
    root.style.setProperty('--light-text-muted', config.light_scheme.text_muted)
    
    // Custom CSS injizieren
    injectCustomCSS()
  }
  
  /**
   * Injiziert Custom CSS in ein <style> Element
   */
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
  
  /**
   * Aktualisiert Seitentitel und Favicon
   */
  function updatePageMeta() {
    // Seitentitel
    document.title = config.company_name
    
    // Favicon
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
  
  /**
   * Gibt die Logo-URL zurück
   */
  function getLogoUrl() {
    return config.logo_path ? `${API_BASE}/assets/${config.logo_path}` : null
  }
  
  /**
   * Gibt die Favicon-URL zurück
   */
  function getFaviconUrl() {
    return config.favicon_path ? `${API_BASE}/assets/${config.favicon_path}` : null
  }
  
  // ===========================================================================
  // Public API
  // ===========================================================================
  return {
    // State
    loading,
    error,
    config,
    
    // Actions
    loadConfig,
    saveConfig,
    resetToDefaults,
    uploadLogo,
    uploadFavicon,
    updateColor,
    applyCSS,
    
    // Getters
    getLogoUrl,
    getFaviconUrl
  }
})