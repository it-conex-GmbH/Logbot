<!--
================================================================================
Name:           Phil Fischer
E-Mail:         p.fischer@phytech.de
Version:        30.01.2026.17.42.08
================================================================================

LogBot App.vue - Hauptkomponente
================================
Initialisiert beim Start:
- Branding-Konfiguration vom Backend
- Theme (Dark/Light Mode)

================================================================================
-->

<template>
  <div id="app-root">
    <!-- Loading-Screen während Branding lädt -->
    <div v-if="loading" class="app-loading">
      <div class="loader"></div>
      <span>Lade...</span>
    </div>
    
    <!-- App-Inhalt wenn geladen -->
    <router-view v-else />
  </div>
</template>

<script setup>
/**
 * App Root Component
 * Lädt Branding-Config beim Start und initialisiert Theme
 */
import { ref, onMounted } from 'vue'
import { useBrandingStore } from './stores/brandingStore'
import { useThemeStore } from './stores/themeStore'

// ===========================================================================
// Stores
// ===========================================================================
const brandingStore = useBrandingStore()
const themeStore = useThemeStore()

// ===========================================================================
// State
// ===========================================================================
const loading = ref(true)

// ===========================================================================
// Lifecycle
// ===========================================================================
onMounted(async () => {
  try {
    // Branding-Config vom Backend laden
    // Dies initialisiert auch das Theme automatisch
    await brandingStore.loadConfig()
  } catch (error) {
    console.error('[App] Fehler beim Laden der Branding-Config:', error)
    // Fallback: Theme manuell initialisieren
    themeStore.initTheme('dark')
  } finally {
    loading.value = false
  }
})
</script>

<style>
/* ==========================================================================
   App Loading Screen
   ========================================================================== */

.app-loading {
  /* Vollbild zentriert */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* Flexbox zum Zentrieren */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  /* Hintergrund (Dark Mode Default) */
  background: #0a0a0f;
  color: #94a3b8;
}

/* Einfacher Spinner */
.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2a3a;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>