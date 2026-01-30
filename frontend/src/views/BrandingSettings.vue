<!--
================================================================================
Name:           Phil Fischer
E-Mail:         p.fischer@phytech.de
Version:        30.01.2026.18.38.22
================================================================================

LogBot Branding Settings - Admin-Seite mit Tailwind CSS
========================================================

================================================================================
-->

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">🎨 Branding Einstellungen</h1>
      <p class="text-gray-600">Passe das Erscheinungsbild von LogBot an deine Marke an.</p>
    </div>

    <!-- Loading -->
    <div v-if="brandingStore.loading" class="text-center py-12 text-gray-500">
      Lade Einstellungen...
    </div>

    <!-- Settings Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Allgemeine Einstellungen -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Allgemein</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Firmenname</label>
            <input v-model="brandingStore.config.company_name" type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input v-model="brandingStore.config.tagline" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <input v-model="brandingStore.config.footer_text" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Support E-Mail</label>
            <input v-model="brandingStore.config.support_email" type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <!-- Logo & Favicon -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Logo & Favicon</h2>
        
        <div class="space-y-4">
          <!-- Logo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                <img v-if="brandingStore.getLogoUrl()" :src="brandingStore.getLogoUrl()" alt="Logo" class="max-w-full max-h-full object-contain" />
                <span v-else class="text-gray-400 text-xs">Kein Logo</span>
              </div>
              <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp" @change="handleLogoUpload" ref="logoInput" class="hidden" />
              <button @click="$refs.logoInput.click()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Logo hochladen
              </button>
            </div>
          </div>

          <!-- Favicon -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                <img v-if="brandingStore.getFaviconUrl()" :src="brandingStore.getFaviconUrl()" alt="Favicon" class="max-w-full max-h-full object-contain" />
                <span v-else class="text-gray-400 text-xs">—</span>
              </div>
              <input type="file" accept=".ico,.png,.svg" @change="handleFaviconUpload" ref="faviconInput" class="hidden" />
              <button @click="$refs.faviconInput.click()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Favicon hochladen
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Einstellungen -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Theme</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Standard Theme</label>
            <select v-model="brandingStore.config.default_theme"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="allow_toggle" v-model="brandingStore.config.allow_theme_toggle" 
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <label for="allow_toggle" class="text-sm text-gray-700">Theme-Wechsel erlauben</label>
          </div>
        </div>
      </div>

      <!-- Markenfarben -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Markenfarben</h2>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Primär</label>
            <input type="color" v-model="brandingStore.config.primary_color" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.primary_color }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Sekundär</label>
            <input type="color" v-model="brandingStore.config.secondary_color" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.secondary_color }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Akzent</label>
            <input type="color" v-model="brandingStore.config.accent_color" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.accent_color }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Erfolg</label>
            <input type="color" v-model="brandingStore.config.success_color" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.success_color }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Warnung</label>
            <input type="color" v-model="brandingStore.config.warning_color" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.warning_color }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Fehler</label>
            <input type="color" v-model="brandingStore.config.danger_color" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.danger_color }}</span>
          </div>
        </div>
      </div>

      <!-- Dark Mode Farben -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Dark Mode Farben</h2>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Hintergrund</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.background" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.dark_scheme.background }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Oberfläche</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.surface" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.dark_scheme.surface }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Rahmen</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.border" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.dark_scheme.border }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Primär</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.text_primary" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.dark_scheme.text_primary }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Sekundär</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.text_secondary" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.dark_scheme.text_secondary }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Muted</label>
            <input type="color" v-model="brandingStore.config.dark_scheme.text_muted" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.dark_scheme.text_muted }}</span>
          </div>
        </div>
      </div>

      <!-- Light Mode Farben -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Light Mode Farben</h2>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Hintergrund</label>
            <input type="color" v-model="brandingStore.config.light_scheme.background" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.light_scheme.background }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Oberfläche</label>
            <input type="color" v-model="brandingStore.config.light_scheme.surface" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.light_scheme.surface }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Rahmen</label>
            <input type="color" v-model="brandingStore.config.light_scheme.border" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.light_scheme.border }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Primär</label>
            <input type="color" v-model="brandingStore.config.light_scheme.text_primary" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.light_scheme.text_primary }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Sekundär</label>
            <input type="color" v-model="brandingStore.config.light_scheme.text_secondary" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.light_scheme.text_secondary }}</span>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Muted</label>
            <input type="color" v-model="brandingStore.config.light_scheme.text_muted" @input="brandingStore.applyCSS()"
              class="w-full h-10 rounded cursor-pointer border border-gray-300" />
            <span class="text-xs text-gray-500 font-mono">{{ brandingStore.config.light_scheme.text_muted }}</span>
          </div>
        </div>
      </div>

      <!-- Custom CSS -->
      <div class="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Custom CSS</h2>
        <textarea v-model="brandingStore.config.custom_css" rows="5" @input="brandingStore.applyCSS()"
          placeholder="/* Eigene CSS-Regeln hier einfügen */"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4 mt-6 pt-6 border-t">
      <button @click="handleReset" :disabled="saving"
        class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">
        Zurücksetzen
      </button>
      <button @click="handleSave" :disabled="saving"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {{ saving ? 'Speichert...' : 'Speichern' }}
      </button>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" 
      :class="['fixed bottom-6 right-6 px-6 py-3 rounded-lg text-white font-medium shadow-lg z-50', toast.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useBrandingStore } from '../stores/brandingStore'

const brandingStore = useBrandingStore()
const saving = ref(false)
const logoInput = ref(null)
const faviconInput = ref(null)

const toast = reactive({ show: false, message: '', type: 'success' })

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

async function handleSave() {
  saving.value = true
  const success = await brandingStore.saveConfig()
  showToast(success ? 'Gespeichert!' : 'Fehler beim Speichern!', success ? 'success' : 'error')
  saving.value = false
}

async function handleReset() {
  if (!confirm('Wirklich alle Einstellungen zurücksetzen?')) return
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