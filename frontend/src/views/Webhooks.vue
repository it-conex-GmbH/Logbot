<!-- ==============================================================================
     Name:        Philipp Fischer
     Kontakt:     p.fischer@itconex.de
     Version:     2026.01.30.13.30.00
     Beschreibung: LogBot v2026.01.30.13.30.00 - Webhook-Verwaltung für n8n/externe Integrationen
     ============================================================================== -->

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Webhooks</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Neuer Webhook
      </button>
    </div>
    
    <!-- Info Box -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-blue-800 mb-2">🔗 Webhook Integration</h3>
      <p class="text-blue-700 text-sm">
        Webhooks ermöglichen den Zugriff auf Logs ohne Login. Ideal für n8n, Make oder andere Automatisierungstools.
        Die URL kann direkt als HTTP-Request aufgerufen werden.
      </p>
    </div>
    
    <!-- Webhooks Liste -->
    <div class="space-y-4">
      <div 
        v-for="webhook in webhooks" 
        :key="webhook.id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-semibold text-lg flex items-center gap-2">
              {{ webhook.name }}
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ webhook.is_active ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </h3>
            <p class="text-gray-500 text-sm">{{ webhook.description || 'Keine Beschreibung' }}</p>
          </div>
          <div class="text-right text-sm text-gray-500">
            <p>{{ webhook.call_count }} Aufrufe</p>
            <p v-if="webhook.last_called_at">Zuletzt: {{ formatTime(webhook.last_called_at) }}</p>
          </div>
        </div>
        
        <!-- Webhook URL -->
        <div class="bg-gray-50 rounded p-3 mb-4">
          <label class="text-xs text-gray-500 mb-1 block">Webhook URL (kein Login erforderlich)</label>
          <div class="flex gap-2">
            <code class="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono overflow-x-auto">
              {{ getWebhookUrl(webhook) }}
            </code>
            <button
              @click="copyUrl(webhook)"
              class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Kopieren
            </button>
          </div>
        </div>
        
        <!-- Filter Anzeige -->
        <div class="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <label class="text-gray-500">Hostname Filter:</label>
            <p>{{ webhook.filters?.hostname || '-' }}</p>
          </div>
          <div>
            <label class="text-gray-500">Source Filter:</label>
            <p>{{ webhook.filters?.source || '-' }}</p>
          </div>
          <div>
            <label class="text-gray-500">Level Filter:</label>
            <p>{{ webhook.filters?.level?.join(', ') || 'Alle' }}</p>
          </div>
        </div>
        
        <div class="flex justify-between text-sm">
          <div class="text-gray-500">
            Max. {{ webhook.max_results }} Ergebnisse | 
            {{ webhook.include_raw ? 'Mit Raw-Message' : 'Ohne Raw-Message' }}
          </div>
          <div class="flex gap-4">
            <button
              @click="testWebhook(webhook)"
              class="text-green-600 hover:underline"
            >
              Testen
            </button>
            <button
              @click="regenerateToken(webhook)"
              class="text-yellow-600 hover:underline"
            >
              Token erneuern
            </button>
            <button
              @click="editWebhook(webhook)"
              class="text-blue-500 hover:underline"
            >
              Bearbeiten
            </button>
            <button
              @click="deleteWebhook(webhook)"
              class="text-red-500 hover:underline"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="!webhooks.length" class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-500">Keine Webhooks vorhanden</p>
        <button
          @click="showCreateModal = true"
          class="mt-4 text-blue-500 hover:underline"
        >
          Ersten Webhook erstellen
        </button>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div 
      v-if="showCreateModal || editingWebhook" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold">
            {{ editingWebhook ? 'Webhook bearbeiten' : 'Neuer Webhook' }}
          </h2>
        </div>
        <form @submit.prevent="saveWebhook" class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full border rounded px-3 py-2"
              placeholder="z.B. n8n Error-Alerts"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              v-model="form.description"
              class="w-full border rounded px-3 py-2"
              rows="2"
              placeholder="Wofür wird dieser Webhook verwendet?"
            ></textarea>
          </div>
          
          <div class="border-t pt-4">
            <h3 class="font-medium mb-3">Filter (optional)</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Hostname (enthält)</label>
                <input
                  v-model="form.filters.hostname"
                  type="text"
                  class="w-full border rounded px-3 py-2"
                  placeholder="z.B. unifi oder server01"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Source (enthält)</label>
                <input
                  v-model="form.filters.source"
                  type="text"
                  class="w-full border rounded px-3 py-2"
                  placeholder="z.B. sshd oder nginx"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Log Level</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="level in allLevels" :key="level" class="flex items-center">
                    <input
                      type="checkbox"
                      :value="level"
                      v-model="form.filters.level"
                      class="mr-1"
                    >
                    <span class="text-sm">{{ level }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <h3 class="font-medium mb-3">Optionen</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Max. Ergebnisse</label>
                <input
                  v-model.number="form.max_results"
                  type="number"
                  min="1"
                  max="1000"
                  class="w-full border rounded px-3 py-2"
                >
              </div>
              <label class="flex items-center">
                <input
                  v-model="form.include_raw"
                  type="checkbox"
                  class="mr-2"
                >
                <span class="text-sm">Raw-Message mitliefern</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="mr-2"
                >
                <span class="text-sm">Webhook aktiv</span>
              </label>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Test Result Modal -->
    <div 
      v-if="testResult" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      @click.self="testResult = null"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-lg font-semibold">Webhook Test Ergebnis</h2>
          <button @click="testResult = null" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div class="p-4">
          <p class="mb-2 text-gray-600">{{ testResult.length }} Logs zurückgegeben:</p>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const webhooks = ref([])
const showCreateModal = ref(false)
const editingWebhook = ref(null)
const testResult = ref(null)

const allLevels = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']

const defaultForm = () => ({
  name: '',
  description: '',
  filters: { hostname: '', source: '', level: [] },
  max_results: 100,
  include_raw: false,
  is_active: true
})

const form = ref(defaultForm())

onMounted(() => loadWebhooks())

async function loadWebhooks() {
  try {
    webhooks.value = await authStore.api('/api/webhooks')
  } catch (e) {
    console.error('Fehler:', e)
  }
}

function getWebhookUrl(webhook) {
  return `${window.location.origin}/api/webhook/${webhook.id}/call?token=${webhook.token}`
}

function copyUrl(webhook) {
  navigator.clipboard.writeText(getWebhookUrl(webhook))
  alert('URL kopiert!')
}

function editWebhook(webhook) {
  editingWebhook.value = webhook
  form.value = {
    name: webhook.name,
    description: webhook.description || '',
    filters: {
      hostname: webhook.filters?.hostname || '',
      source: webhook.filters?.source || '',
      level: webhook.filters?.level || []
    },
    max_results: webhook.max_results,
    include_raw: webhook.include_raw,
    is_active: webhook.is_active
  }
}

function closeModal() {
  showCreateModal.value = false
  editingWebhook.value = null
  form.value = defaultForm()
}

async function saveWebhook() {
  try {
    const data = {
      ...form.value,
      filters: {
        hostname: form.value.filters.hostname || null,
        source: form.value.filters.source || null,
        level: form.value.filters.level.length ? form.value.filters.level : null
      }
    }
    
    if (editingWebhook.value) {
      await authStore.api(`/api/webhooks/${editingWebhook.value.id}`, {
        method: 'PUT',
        body: data
      })
    } else {
      await authStore.api('/api/webhooks', {
        method: 'POST',
        body: data
      })
    }
    closeModal()
    loadWebhooks()
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function regenerateToken(webhook) {
  if (!confirm('Token wirklich erneuern? Der alte Token wird ungültig!')) return
  
  try {
    await authStore.api(`/api/webhooks/${webhook.id}/regenerate-token`, { method: 'POST' })
    loadWebhooks()
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function testWebhook(webhook) {
  try {
    const response = await fetch(getWebhookUrl(webhook))
    testResult.value = await response.json()
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function deleteWebhook(webhook) {
  if (!confirm(`Webhook "${webhook.name}" wirklich löschen?`)) return
  
  try {
    await authStore.api(`/api/webhooks/${webhook.id}`, { method: 'DELETE' })
    loadWebhooks()
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('de-DE')
}
</script>
