<!--
================================================================================
Name:           Phil Fischer
E-Mail:         p.fischer@phytech.de
Version:        30.01.2026.17.45.08
================================================================================

LogBot Branding Settings - Admin-Seite für Whitelabel-Konfiguration
====================================================================

================================================================================
-->

<template>
  <div class="branding-settings">
    <div class="settings-header">
      <h1>Branding Einstellungen</h1>
      <p class="text-secondary">Passe das Erscheinungsbild von LogBot an deine Marke an.</p>
    </div>

    <div v-if="brandingStore.loading" class="loading">
      Lade Einstellungen...
    </div>

    <div v-else class="settings-grid">
      
      <!-- Allgemeine Einstellungen -->
      <section class="settings-section">
        <h2>Allgemein</h2>
        
        <div class="form-group">
          <label for="company_name">Firmenname</label>
          <input id="company_name" v-model="brandingStore.config.company_name" type="text" />
        </div>

        <div class="form-group">
          <label for="tagline">Tagline</label>
          <input id="tagline" v-model="brandingStore.config.tagline" type="text" />
        </div>

        <div class="form-group">
          <label for="footer_text">Footer Text</label>
          <input id="footer_text" v-model="brandingStore.config.footer_text" type="text" />
        </div>

        <div class="form-group">
          <label for="support_email">Support E-Mail</label>
          <input id="support_email" v-model="brandingStore.config.support_email" type="email" />
        </div>
      </section>

      <!-- Logo & Favicon -->
      <section class="settings-section">
        <h2>Logo & Favicon</h2>
        
        <div class="form-group">
          <label>Logo</label>
          <div class="upload-area">
            <div v-if="brandingStore.getLogoUrl()" class="preview">
              <img :src="brandingStore.getLogoUrl()" alt="Logo" />
            </div>
            <div v-else class="preview placeholder">Kein Logo</div>
            <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp" @change="handleLogoUpload" ref="logoInput" />
            <button class="btn-secondary" @click="$refs.logoInput.click()">Logo hochladen</button>
          </div>
        </div>

        <div class="form-group">
          <label>Favicon</label>
          <div class="upload-area">
            <div v-if="brandingStore.getFaviconUrl()" class="preview favicon">
              <img :src="brandingStore.getFaviconUrl()" alt="Favicon" />
            </div>
            <div v-else class="preview placeholder favicon">Kein Favicon</div>
            <input type="file" accept=".ico,.png,.svg" @change="handleFaviconUpload" ref="faviconInput" />
            <button class="btn-secondary" @click="$refs.faviconInput.click()">Favicon hochladen</button>
          </div>
        </div>
      </section>

      <!-- Theme -->
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
          <input id="allow_toggle" type="checkbox" v-model="brandingStore.config.allow_theme_toggle" />
          <label for="allow_toggle">Theme-Wechsel erlauben</label>
        </div>
      </section>

      <!-- Markenfarben -->
      <section class="settings-section">
        <h2>Markenfarben</h2>
        
        <div class="color-grid">
          <div class="color-item">
            <label>Primär</label>
            <input type="color" v-model="brandingStore.config.primary_color" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.primary_color }}</span>
          </div>
          <div class="color-item">
            <label>Sekundär</label>
            <input type="color" v-model="brandingStore.config.secondary_color" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.secondary_color }}</span>
          </div>
          <div class="color-item">
            <label>Akzent</label>
            <input type="color" v-model="brandingStore.config.accent_color" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.accent_color }}</span>
          </div>
          <div class="color-item">
            <label>Erfolg</label>
            <input type="color" v-model="brandingStore.config.success_color" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.success_color }}</span>
          </div>
          <div class="color-item">
            <label>Warnung</label>
            <input type="color" v-model="brandingStore.config.warning_color" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.warning_color }}</span>
          </div>
          <div class="color-item">
            <label>Fehler</label>
            <input type="color" v-model="brandingStore.config.danger_color" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.danger_color }}</span>
          </div>
        </div>
      </section>

      <!-- Dark Mode Farben -->
      <section class="settings-section">
        <h2>Dark Mode Farben</h2>
        
        <div class="color-grid">
          <div class="color-item">
            <label>Hintergrund</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.background" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.dark_scheme.background }}</span>
          </div>
          <div class="color-item">
            <label>Oberfläche</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.surface" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.dark_scheme.surface }}</span>
          </div>
          <div class="color-item">
            <label>Rahmen</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.border" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.dark_scheme.border }}</span>
          </div>
          <div class="color-item">
            <label>Text Primär</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.text_primary" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.dark_scheme.text_primary }}</span>
          </div>
        </div>
      </section>

      <!-- Light Mode Farben -->
      <section class="settings-section">
        <h2>Light Mode Farben</h2>
        
        <div class="color-grid">
          <div class="color-item">
            <label>Hintergrund</label>
            <input type="color" v-model="brandingStore.config.light_scheme.background" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.light_scheme.background }}</span>
          </div>
          <div class="color-item">
            <label>Oberfläche</label>
            <input type="color" v-model="brandingStore.config.light_scheme.surface" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.light_scheme.surface }}</span>
          </div>
          <div class="color-item">
            <label>Rahmen</label>
            <input type="color" v-model="brandingStore.config.light_scheme.border" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.light_scheme.border }}</span>
          </div>
          <div class="color-item">
            <label>Text Primär</label>
            <input type="color" v-model="brandingStore.config.light_scheme.text_primary" @input="brandingStore.applyCSS()" />
            <span class="color-value">{{ brandingStore.config.light_scheme.text_primary }}</span>
          </div>
        </div>
      </section>

      <!-- Custom CSS -->
      <section class="settings-section full-width">
        <h2>Custom CSS</h2>
        <div class="form-group">
          <textarea v-model="brandingStore.config.custom_css" rows="6" placeholder="/* Eigene CSS-Regeln */" @input="brandingStore.applyCSS()"></textarea>
        </div>
      </section>
    </div>

    <!-- Actions -->
    <div class="settings-actions">
      <button class="btn-secondary" @click="handleReset" :disabled="saving">Zurücksetzen</button>
      <button @click="handleSave" :disabled="saving">{{ saving ? 'Speichert...' : 'Speichern' }}</button>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" :class="['toast', toast.type]">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useBrandingStore } from '../stores/brandingStore'

const brandingStore = useBrandingStore()
const saving = ref(false)
const logoInput = ref(null)
const faviconInput = ref(null)

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

async function handleSave() {
  saving.value = true
  const success = await brandingStore.saveConfig()
  showToast(success ? 'Gespeichert!' : 'Fehler!', success ? 'success' : 'error')
  saving.value = false
}

async function handleReset() {
  if (!confirm('Wirklich zurücksetzen?')) return
  saving.value = true
  const success = await brandingStore.resetToDefaults()
  showToast(success ? 'Zurückgesetzt!' : 'Fehler!', success ? 'success' : 'error')
  saving.value = false
}

async function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  const success = await brandingStore.uploadLogo(file)
  showToast(success ? 'Logo hochgeladen!' : 'Fehler!', success ? 'success' : 'error')
  event.target.value = ''
}

async function handleFaviconUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  const success = await brandingStore.uploadFavicon(file)
  showToast(success ? 'Favicon hochgeladen!' : 'Fehler!', success ? 'success' : 'error')
  event.target.value = ''
}

onMounted(() => {
  if (brandingStore.loading) {
    brandingStore.loadConfig()
  }
})
</script>

<style scoped>
.branding-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h1 {
  margin-bottom: 0.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.settings-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.settings-section.full-width {
  grid-column: 1 / -1;
}

.settings-section h2 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text-primary);
}

.form-group textarea {
  font-family: monospace;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group input { width: auto; }
.checkbox-group label { margin-bottom: 0; font-weight: normal; }

.upload-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.upload-area input[type="file"] { display: none; }

.preview {
  width: 80px;
  height: 80px;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-surface-elevated);
}

.preview.favicon { width: 48px; height: 48px; }
.preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.preview.placeholder { color: var(--color-text-muted); font-size: 0.75rem; text-align: center; }

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-item label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.color-item input[type="color"] {
  width: 100%;
  height: 40px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  cursor: pointer;
}

.color-value {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  z-index: 1000;
}

.toast.success { background: var(--color-success); }
.toast.error { background: var(--color-danger); }

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

.btn-secondary {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
</style>