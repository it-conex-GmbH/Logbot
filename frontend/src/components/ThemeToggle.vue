<!--
================================================================================
Name:           Phil Fischer
E-Mail:         p.fischer@phytech.de
Version:        30.01.2026.17.15.22
================================================================================

LogBot Theme Toggle - Dark/Light Mode Umschalter
================================================
Animierter Button zum Wechseln zwischen Dark und Light Mode.
Zeigt Sonne (Light) oder Mond (Dark) Icon mit Übergangsanimation.

Props:
- showLabel: Boolean - Zeigt "Dark/Light" Text neben dem Icon

================================================================================
-->

<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="isDark ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'"
    :aria-label="isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'"
  >
    <!-- Container für Icon-Animation -->
    <div class="icon-container">
      <!-- Sonne (Light Mode) -->
      <svg
        v-if="!isDark"
        class="icon sun"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Sonnen-Kreis -->
        <circle cx="12" cy="12" r="5"></circle>
        <!-- Sonnen-Strahlen -->
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      
      <!-- Mond (Dark Mode) -->
      <svg
        v-else
        class="icon moon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </div>
    
    <!-- Optionales Label -->
    <span v-if="showLabel" class="label">
      {{ isDark ? 'Dark' : 'Light' }}
    </span>
  </button>
</template>

<script setup>
/**
 * Theme Toggle Component
 * Verwendet den themeStore für State-Management
 */
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

// ===========================================================================
// Props
// ===========================================================================
defineProps({
  /**
   * Zeigt "Dark" oder "Light" Text neben dem Icon
   */
  showLabel: {
    type: Boolean,
    default: false
  }
})

// ===========================================================================
// Store
// ===========================================================================
const themeStore = useThemeStore()

// ===========================================================================
// Computed
// ===========================================================================

/**
 * Prüft ob Dark Mode aktiv ist
 */
const isDark = computed(() => themeStore.currentTheme === 'dark')

// ===========================================================================
// Methods
// ===========================================================================

/**
 * Wechselt zwischen Dark und Light Mode
 */
function toggleTheme() {
  themeStore.toggleTheme()
}
</script>

<style scoped>
/* ==========================================================================
   Theme Toggle Button Styles
   ========================================================================== */

.theme-toggle {
  /* Layout */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  /* Größe und Padding */
  padding: 0.5rem;
  
  /* Aussehen */
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  
  /* Text */
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  
  /* Interaktion */
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover-Effekt */
.theme-toggle:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border-color: var(--color-primary);
}

/* Fokus-Effekt für Accessibility */
.theme-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* ==========================================================================
   Icon Container
   ========================================================================== */

.icon-container {
  /* Feste Größe für konsistente Animation */
  width: 1.25rem;
  height: 1.25rem;
  
  /* Flexbox für Zentrierung */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==========================================================================
   Icons
   ========================================================================== */

.icon {
  width: 1.25rem;
  height: 1.25rem;
  
  /* Animation beim Erscheinen */
  animation: iconAppear 0.3s ease;
}

/* Sonne: Leichte Rotation */
.icon.sun {
  animation: sunAppear 0.4s ease;
}

/* Mond: Sanftes Einblenden */
.icon.moon {
  animation: moonAppear 0.4s ease;
}

/* ==========================================================================
   Label
   ========================================================================== */

.label {
  font-weight: 500;
  min-width: 2.5rem;
}

/* ==========================================================================
   Animationen
   ========================================================================== */

@keyframes iconAppear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sunAppear {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes moonAppear {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
</style>