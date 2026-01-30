<!--
================================================================================
Name:           Phil Fischer
E-Mail:         p.fischer@phytech.de & p.fischer@itconex.de
Version:        30.01.2026.17.22.15
================================================================================

LogBot Branding Settings - Admin-Seite für Whitelabel-Konfiguration
====================================================================
Ermöglicht das Anpassen aller Branding-Einstellungen über ein Web-Interface:
- Firmenname, Tagline, Footer
- Logo und Favicon Upload
- Farben für Dark/Light Mode
- Custom CSS

================================================================================
-->

<template>
  <div class="branding-settings">
    <!-- Header -->
    <div class="settings-header">
      <h1>Branding Einstellungen</h1>
      <p class="text-secondary">Passe das Erscheinungsbild von LogBot an deine Marke an.</p>
    </div>

    <!-- Loading State -->
    <div v-if="brandingStore.loading" class="loading">
      Lade Einstellungen...
    </div>

    <!-- Settings Form -->
    <div v-else class="settings-grid">
      
      <!-- ================================================================
           Allgemeine Einstellungen
           ================================================================ -->
      <section class="settings-section">
        <h2>Allgemein</h2>
        
        <div class="form-group">
          <label for="company_name">Firmenname</label>
          <input
            id="company_name"
            v-model="brandingStore.config.company_name"
            type="text"
            placeholder="LogBot"
          />
        </div>

        <div class="form-group">
          <label for="tagline">Tagline / Slogan</label>
          <input
            id="tagline"
            v-model="brandingStore.config.tagline"
            type="text"
            placeholder="Centralized Log Management"
          />
        </div>

        <div class="form-group">
          <label for="footer_text">Footer Text</label>
          <input
            id="footer_text"
            v-model="brandingStore.config.footer_text"
            type="text"
            placeholder="© 2026 LogBot"
          />
        </div>

        <div class="form-group">
          <label for="support_email">Support E-Mail</label>
          <input
            id="support_email"
            v-model="brandingStore.config.support_email"
            type="email"
            placeholder="support@example.com"
          />
        </div>
      </section>

      <!-- ================================================================
           Logo & Favicon
           ================================================================ -->
      <section class="settings-section">
        <h2>Logo & Favicon</h2>
        
        <!-- Logo Upload -->
        <div class="form-group">
          <label>Logo</label>
          <div class="upload-area">
            <div v-if="brandingStore.getLogoUrl()" class="preview">
              <img :src="brandingStore.getLogoUrl()" alt="Logo" />
            </div>
            <div v-else class="preview placeholder">
              Kein Logo
            </div>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              @change="handleLogoUpload"
              ref="logoInput"
            />
            <button class="btn-secondary" @click="$refs.logoInput.click()">
              Logo hochladen
            </button>
          </div>
        </div>

        <!-- Favicon Upload -->
        <div class="form-group">
          <label>Favicon</label>
          <div class="upload-area">
            <div v-if="brandingStore.getFaviconUrl()" class="preview favicon">
              <img :src="brandingStore.getFaviconUrl()" alt="Favicon" />
            </div>
            <div v-else class="preview placeholder favicon">
              Kein Favicon
            </div>
            <input
              type="file"
              accept=".ico,.png,.svg"
              @change="handleFaviconUpload"
              ref="faviconInput"
            />
            <button class="btn-secondary" @click="$refs.faviconInput.click()">
              Favicon hochladen
            </button>
          </div>
        </div>
      </section>

      <!-- ================================================================
           Theme Einstellungen
           ================================================================ -->
      <section class="settings-section">
        <h2>Theme</h2>
        
        <div class="form-group">
          <label for="default_theme">Standard Theme</label>
          <select id="default_theme" v-model="brandingStore.config.default_theme">
            <option value="dark">Dark Mode</option>
            <option value="light">Light Mode</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <input
            id="allow_toggle"
            type="checkbox"
            v-model="brandingStore.config.allow_theme_toggle"
          />
          <label for="allow_toggle">Benutzern erlauben, das Theme zu wechseln</label>
        </div>
      </section>

      <!-- ================================================================
           Markenfarben
           ================================================================ -->
      <section class="settings-section">
        <h2>Markenfarben</h2>
        <p class="text-muted text-sm">Diese Farben werden in beiden Themes verwendet.</p>
        
        <div class="color-grid">
          <div class="color-item">
            <label>Primär</label>
            <input
              type="color"
              v-model="brandingStore.config.primary_color"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.primary_color }}</span>
          </div>

          <div class="color-item">
            <label>Sekundär</label>
            <input
              type="color"
              v-model="brandingStore.config.secondary_color"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.secondary_color }}</span>
          </div>

          <div class="color-item">
            <label>Akzent</label>
            <input
              type="color"
              v-model="brandingStore.config.accent_color"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.accent_color }}</span>
          </div>

          <div class="color-item">
            <label>Erfolg</label>
            <input
              type="color"
              v-model="brandingStore.config.success_color"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.success_color }}</span>
          </div>

          <div class="color-item">
            <label>Warnung</label>
            <input
              type="color"
              v-model="brandingStore.config.warning_color"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.warning_color }}</span>
          </div>

          <div class="color-item">
            <label>Fehler</label>
            <input
              type="color"
              v-model="brandingStore.config.danger_color"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.danger_color }}</span>
          </div>
        </div>
      </section>

      <!-- ================================================================
           Dark Mode Farben
           ================================================================ -->
      <section class="settings-section">
        <h2>Dark Mode Farben</h2>
        
        <div class="color-grid">
          <div class="color-item">
            <label>Hintergrund</label>
            <input
              type="color"
              v-model="brandingStore.config.dark_scheme.background"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.dark_scheme.background }}</span>
          </div>

          <div class="color-item">
            <label>Oberfläche</label>
            <input
              type="color"
              v-model="brandingStore.config.dark_scheme.surface"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.dark_scheme.surface }}</span>
          </div>

          <div class="color-item">
            <label>Erhöht</label>
            <input
              type="color"
              v-model="brandingStore.config.dark_scheme.surface_elevated"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.dark_scheme.surface_elevated }}</span>
          </div>

          <div class="color-item">
            <label>Rahmen</label>
            <input
              type="color"
              v-model="brandingStore.config.dark_scheme.border"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.dark_scheme.border }}</span>
          </div>

          <div class="color-item">
            <label>Text Primär</label>
            <input
              type="color"
              v-model="brandingStore.config.dark_scheme.text_primary"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.dark_scheme.text_primary }}</span>
          </div>

          <div class="color-item">
            <label>Text Sekundär</label>
            <input
              type="color"
              v-model="brandingStore.config.dark_scheme.text_secondary"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.dark_scheme.text_secondary }}</span>
          </div>
        </div>
      </section>

      <!-- ================================================================
           Light Mode Farben
           ================================================================ -->
      <section class="settings-section">
        <h2>Light Mode Farben</h2>
        
        <div class="color-grid">
          <div class="color-item">
            <label>Hintergrund</label>
            <input
              type="color"
              v-model="brandingStore.config.light_scheme.background"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.light_scheme.background }}</span>
          </div>

          <div class="color-item">
            <label>Oberfläche</label>
            <input
              type="color"
              v-model="brandingStore.config.light_scheme.surface"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.light_scheme.surface }}</span>
          </div>

          <div class="color-item">
            <label>Erhöht</label>
            <input
              type="color"
              v-model="brandingStore.config.light_scheme.surface_elevated"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.light_scheme.surface_elevated }}</span>
          </div>

          <div class="color-item">
            <label>Rahmen</label>
            <input
              type="color"
              v-model="brandingStore.config.light_scheme.border"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.light_scheme.border }}</span>
          </div>

          <div class="color-item">
            <label>Text Primär</label>
            <input
              type="color"
              v-model="brandingStore.config.light_scheme.text_primary"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.light_scheme.text_primary }}</span>
          </div>

          <div class="color-item">
            <label>Text Sekundär</label>
            <input
              type="color"
              v-model="brandingStore.config.light_scheme.text_secondary"
              @input="brandingStore.applyCSS()"
            />
            <span class="color-value">{{ brandingStore.config.light_scheme.text_secondary }}</span>
          </div>
        </div>
      </section>

      <!-- ================================================================
           Custom CSS
           ================================================================ -->
      <section class="settings-section full-width">
        <h2>Custom CSS</h2>
        <p class="text-muted text-sm">Zusätzliches CSS für erweiterte Anpassungen.</p>
        
        <div class="form-group">
          <textarea
            v-model="brandingStore.config.custom_css"
            rows="8"
            placeholder="/* Eigene CSS-Regeln hier einfügen */"
            @input="brandingStore.applyCSS()"
          ></textarea>
        </div>
      </section>
    </div>

    <!-- Action Buttons -->
    <div class="settings-actions">
      <button class="btn-secondary" @click="handleReset" :disabled="saving">
        Auf Standard zurücksetzen
      </button>
      <button @click="handleSave" :disabled="saving">
        {{ saving ? 'Speichert...' : 'Einstellungen speichern' }}
      </button>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
/**
 * Branding Settings View
 * Admin-Seite für alle Whitelabel-Einstellungen
 */
import { ref, reactive, onMounted } from 'vue'
import { useBrandingStore } from '@/stores/brandingStore'

// ===========================================================================
// Store
// ===========================================================================
const brandingStore = useBrandingStore()

// ===========================================================================
// State
// ===========================================================================
const saving = ref(false)
const logoInput = ref(null)
const faviconInput = ref(null)

// Toast Notification State
const toast = reactive({
  show: false,
  message: '',
  type: 'success' // 'success' oder 'error'
})

// ===========================================================================
// Methods
// ===========================================================================

/**
 * Zeigt eine Toast-Nachricht an
 */
function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  
  // Nach 3 Sekunden ausblenden
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

/**
 * Speichert alle Einstellungen
 */
async function handleSave() {
  saving.value = true
  
  const success = await brandingStore.saveConfig()
  
  if (success) {
    showToast('Einstellungen gespeichert!', 'success')
  } else {
    showToast('Fehler beim Speichern!', 'error')
  }
  
  saving.value = false
}

/**
 * Setzt auf Standardwerte zurück
 */
async function handleReset() {
  if (!confirm('Wirklich alle Einstellungen zurücksetzen?')) {
    return
  }
  
  saving.value = true
  
  const success = await brandingStore.resetToDefaults()
  
  if (success) {
    showToast('Auf Standard zurückgesetzt!', 'success')
  } else {
    showToast('Fehler beim Zurücksetzen!', 'error')
  }
  
  saving.value = false
}

/**
 * Verarbeitet Logo-Upload
 */
async function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const success = await brandingStore.uploadLogo(file)
  
  if (success) {
    showToast('Logo hochgeladen!', 'success')
  } else {
    showToast('Fehler beim Upload!', 'error')
  }
  
  // Input zurücksetzen
  event.target.value = ''
}

/**
 * Verarbeitet Favicon-Upload
 */
async function handleFaviconUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const success = await brandingStore.uploadFavicon(file)
  
  if (success) {
    showToast('Favicon hochgeladen!', 'success')
  } else {
    showToast('Fehler beim Upload!', 'error')
  }
  
  // Input zurücksetzen
  event.target.value = ''
}

// ===========================================================================
// Lifecycle
// ===========================================================================
onMounted(() => {
  // Config laden falls noch nicht geschehen
  if (brandingStore.loading) {
    brandingStore.loadConfig()
  }
})
</script>

<style scoped>
/* ==========================================================================
   Layout
   ========================================================================== */

.branding-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.settings-header {
  margin-bottom: var(--spacing-xl);
}

.settings-header h1 {
  margin-bottom: var(--spacing-sm);
}

/* ==========================================================================
   Grid Layout für Sections
   ========================================================================== */

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.settings-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.settings-section.full-width {
  grid-column: 1 / -1;
}

.settings-section h2 {
  font-size: var(--text-lg);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

/* ==========================================================================
   Form Groups
   ========================================================================== */

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group select,
.form-group textarea {
  width: 100%;
}

.form-group textarea {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  resize: vertical;
}

/* Checkbox Group */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.checkbox-group label {
  margin-bottom: 0;
  font-weight: normal;
}

/* ==========================================================================
   Upload Area
   ========================================================================== */

.upload-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.upload-area input[type="file"] {
  display: none;
}

.preview {
  width: 80px;
  height: 80px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-surface-elevated);
}

.preview.favicon {
  width: 48px;
  height: 48px;
}

.preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview.placeholder {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: center;
}

/* ==========================================================================
   Color Grid
   ========================================================================== */

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.color-item label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.color-item input[type="color"] {
  width: 100%;
  height: 40px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.color-value {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
}

/* ==========================================================================
   Action Buttons
   ========================================================================== */

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

/* ==========================================================================
   Toast Notification
   ========================================================================== */

.toast {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  color: white;
  font-weight: 500;
  animation: slideUp 0.3s ease;
  z-index: 1000;
}

.toast.success {
  background: var(--color-success);
}

.toast.error {
  background: var(--color-danger);
}

/* ==========================================================================
   Loading State
   ========================================================================== */

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
}

/* ==========================================================================
   Responsive
   ========================================================================== */

@media (max-width: 768px) {
  .branding-settings {
    padding: var(--spacing-md);
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .settings-actions button {
    width: 100%;
  }
}
</style>