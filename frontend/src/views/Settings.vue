<!-- ==============================================================================
     Name:        Philipp Fischer
     Kontakt:     p.fischer@itconex.de
     Version:     2026.01.30.13.30.00
     Beschreibung: LogBot v2026.01.30.13.30.00 - Einstellungen und Log-Retention
     ============================================================================== -->

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Einstellungen</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Allgemeine Einstellungen -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Allgemeine Einstellungen</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Anwendungsname</label>
            <input
              v-model="settings.app_name"
              type="text"
              class="w-full border rounded px-3 py-2"
              @change="saveSetting('app_name', settings.app_name)"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Zeitzone</label>
            <input
              v-model="settings.timezone"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Europe/Berlin"
              @change="saveSetting('timezone', settings.timezone)"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Agent Offline Timeout (Sekunden)</label>
            <input
              v-model.number="settings.agent_offline_timeout"
              type="number"
              min="60"
              class="w-full border rounded px-3 py-2"
              @change="saveSetting('agent_offline_timeout', settings.agent_offline_timeout)"
            >
            <p class="text-gray-500 text-xs mt-1">Nach dieser Zeit ohne Logs gilt ein Agent als offline</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Max. Logs pro API-Anfrage</label>
            <input
              v-model.number="settings.max_logs_per_request"
              type="number"
              min="100"
              max="10000"
              class="w-full border rounded px-3 py-2"
              @change="saveSetting('max_logs_per_request', settings.max_logs_per_request)"
            >
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <label class="block text-sm font-medium text-gray-700">Auto-Discovery</label>
              <p class="text-gray-500 text-xs">Neue Agents automatisch erstellen</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.enable_auto_discovery"
                class="sr-only peer"
                @change="saveSetting('enable_auto_discovery', settings.enable_auto_discovery)"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Log Retention -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Log Retention</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Aufbewahrung (Tage)</label>
            <input
              v-model.number="retentionDays"
              type="number"
              min="1"
              class="w-full border rounded px-3 py-2"
            >
            <p class="text-gray-500 text-xs mt-1">Logs älter als diese Anzahl Tage werden bei Cleanup gelöscht</p>
          </div>
          
          <button
            @click="previewRetention"
            class="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded"
          >
            Vorschau anzeigen
          </button>
          
          <div v-if="retentionPreview" class="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p class="font-medium text-yellow-800">
              {{ retentionPreview.logs_to_delete.toLocaleString() }} Logs würden gelöscht
            </p>
            <p v-if="retentionPreview.oldest_log_date" class="text-yellow-700 text-sm mt-1">
              Ältester Log: {{ formatDate(retentionPreview.oldest_log_date) }}
            </p>
          </div>
          
          <button
            @click="executeRetention"
            :disabled="!retentionPreview || retentionPreview.logs_to_delete === 0"
            class="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded disabled:opacity-50"
          >
            Alte Logs löschen
          </button>
        </div>
        
        <div class="mt-6 pt-6 border-t">
          <h3 class="font-medium text-red-600 mb-4">Gefahrenzone</h3>
          <button
            @click="deleteAllLogs"
            class="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded"
          >
            ⚠️ ALLE Logs löschen
          </button>
          <p class="text-red-500 text-xs mt-2">Diese Aktion kann nicht rückgängig gemacht werden!</p>
        </div>
      </div>
    </div>
    
    <!-- Passwort ändern -->
    <div class="bg-white rounded-lg shadow p-6 mt-6">
      <h2 class="text-lg font-semibold mb-4">Passwort ändern</h2>
      
      <form @submit.prevent="changePassword" class="max-w-md space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="6"
            class="w-full border rounded px-3 py-2"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            class="w-full border rounded px-3 py-2"
          >
        </div>
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Passwort ändern
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const settings = ref({
  app_name: 'LogBot',
  timezone: 'Europe/Berlin',
  agent_offline_timeout: 300,
  max_logs_per_request: 1000,
  enable_auto_discovery: true
})

const retentionDays = ref(90)
const retentionPreview = ref(null)
const newPassword = ref('')
const confirmPassword = ref('')

onMounted(async () => {
  try {
    const data = await authStore.api('/api/settings')
    settings.value = { ...settings.value, ...data.settings }
    if (data.settings.log_retention_days) {
      retentionDays.value = data.settings.log_retention_days
    }
  } catch (e) {
    console.error('Fehler:', e)
  }
})

async function saveSetting(key, value) {
  try {
    await authStore.api(`/api/settings/${key}`, {
      method: 'PUT',
      body: { value }
    })
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function previewRetention() {
  try {
    retentionPreview.value = await authStore.api(`/api/settings/retention/preview?days=${retentionDays.value}`, {
      method: 'POST'
    })
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function executeRetention() {
  if (!confirm(`Wirklich ${retentionPreview.value.logs_to_delete.toLocaleString()} Logs löschen?`)) return
  
  try {
    const result = await authStore.api(`/api/settings/retention/execute?days=${retentionDays.value}`, {
      method: 'POST'
    })
    alert(result.message)
    retentionPreview.value = null
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function deleteAllLogs() {
  const confirm1 = prompt('Diese Aktion löscht ALLE Logs! Geben Sie "DELETE_ALL_LOGS" ein um zu bestätigen:')
  if (confirm1 !== 'DELETE_ALL_LOGS') return
  
  try {
    const result = await authStore.api('/api/settings/logs/all?confirm=DELETE_ALL_LOGS', {
      method: 'DELETE'
    })
    alert(result.message)
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    alert('Passwörter stimmen nicht überein!')
    return
  }
  
  try {
    await authStore.api(`/api/users/${authStore.user.id}`, {
      method: 'PUT',
      body: { password: newPassword.value }
    })
    alert('Passwort geändert!')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('de-DE')
}
</script>
