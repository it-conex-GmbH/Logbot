<!-- ==============================================================================
     Name:        Philipp Fischer
     Kontakt:     p.fischer@itconex.de
     Version:     2026.01.30.19.15.33
     Beschreibung: LogBot - Einstellungen mit Theme-Support
     ============================================================================== -->

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6" :style="{ color: 'var(--color-text-primary)' }">Einstellungen</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Allgemeine Einstellungen -->
      <div class="rounded-lg shadow p-6" :style="cardStyle">
        <h2 class="text-lg font-semibold mb-4" :style="{ color: 'var(--color-text-primary)' }">Allgemeine Einstellungen</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" :style="{ color: 'var(--color-text-secondary)' }">Anwendungsname</label>
            <input
              v-model="settings.app_name"
              type="text"
              class="w-full rounded px-3 py-2"
              :style="inputStyle"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1" :style="{ color: 'var(--color-text-secondary)' }">Zeitzone</label>
            <input
              v-model="settings.timezone"
              type="text"
              class="w-full rounded px-3 py-2"
              :style="inputStyle"
              placeholder="Europe/Berlin"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1" :style="{ color: 'var(--color-text-secondary)' }">Agent Offline Timeout (Sekunden)</label>
            <input
              v-model.number="settings.agent_offline_timeout"
              type="number"
              min="60"
              class="w-full rounded px-3 py-2"
              :style="inputStyle"
            >
            <p class="text-xs mt-1" :style="{ color: 'var(--color-text-muted)' }">Nach dieser Zeit ohne Logs gilt ein Agent als offline</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1" :style="{ color: 'var(--color-text-secondary)' }">Max. Logs pro API-Anfrage</label>
            <input
              v-model.number="settings.max_logs_per_request"
              type="number"
              min="100"
              max="10000"
              class="w-full rounded px-3 py-2"
              :style="inputStyle"
            >
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <label class="block text-sm font-medium" :style="{ color: 'var(--color-text-secondary)' }">Auto-Discovery</label>
              <p class="text-xs" :style="{ color: 'var(--color-text-muted)' }">Neue Agents automatisch erstellen</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.enable_auto_discovery"
                class="sr-only peer"
              >
              <div class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" :style="{ backgroundColor: settings.enable_auto_discovery ? 'var(--color-primary)' : 'var(--color-surface-elevated)' }"></div>
            </label>
          </div>
          
          <button
            @click="saveAllSettings"
            :disabled="saving"
            class="w-full text-white py-2 rounded disabled:opacity-50 mt-4 hover:opacity-90"
            :style="{ backgroundColor: 'var(--color-primary)' }"
          >
            {{ saving ? 'Speichere...' : '💾 Einstellungen speichern' }}
          </button>
          
          <p v-if="saveMessage" :class="saveError ? '' : ''" class="text-sm text-center" :style="{ color: saveError ? 'var(--color-danger)' : 'var(--color-success)' }">
            {{ saveMessage }}
          </p>
        </div>
      </div>
      
      <!-- Log Retention -->
      <div class="rounded-lg shadow p-6" :style="cardStyle">
        <h2 class="text-lg font-semibold mb-4" :style="{ color: 'var(--color-text-primary)' }">Log Retention</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" :style="{ color: 'var(--color-text-secondary)' }">Aufbewahrung (Tage)</label>
            <input
              v-model.number="retentionDays"
              type="number"
              min="1"
              class="w-full rounded px-3 py-2"
              :style="inputStyle"
            >
            <p class="text-xs mt-1" :style="{ color: 'var(--color-text-muted)' }">Logs älter als diese Anzahl Tage werden bei Cleanup gelöscht</p>
          </div>
          
          <button
            @click="previewRetention"
            class="w-full py-2 rounded hover:opacity-80"
            :style="buttonSecondaryStyle"
          >
            Vorschau anzeigen
          </button>
          
          <div v-if="retentionPreview" class="rounded p-4" :style="warningBoxStyle">
            <p class="font-medium" :style="{ color: 'var(--color-warning)' }">
              {{ retentionPreview.logs_to_delete.toLocaleString() }} Logs würden gelöscht
            </p>
            <p v-if="retentionPreview.oldest_log_date" class="text-sm mt-1" :style="{ color: 'var(--color-text-secondary)' }">
              Ältester Log: {{ formatDate(retentionPreview.oldest_log_date) }}
            </p>
          </div>
          
          <button
            @click="executeRetention"
            :disabled="!retentionPreview || retentionPreview.logs_to_delete === 0"
            class="w-full text-white py-2 rounded disabled:opacity-50 hover:opacity-90"
            :style="{ backgroundColor: 'var(--color-danger)' }"
          >
            Alte Logs löschen
          </button>
        </div>
        
        <div class="mt-6 pt-6 border-t" :style="{ borderColor: 'var(--color-border)' }">
          <h3 class="font-medium mb-4" :style="{ color: 'var(--color-danger)' }">Gefahrenzone</h3>
          <button
            @click="deleteAllLogs"
            class="w-full py-2 rounded hover:opacity-80"
            :style="dangerButtonStyle"
          >
            ⚠️ ALLE Logs löschen
          </button>
          <p class="text-xs mt-2" :style="{ color: 'var(--color-danger)' }">Diese Aktion kann nicht rückgängig gemacht werden!</p>
        </div>
      </div>
    </div>
    
    <!-- Passwort ändern -->
    <div class="rounded-lg shadow p-6 mt-6" :style="cardStyle">
      <h2 class="text-lg font-semibold mb-4" :style="{ color: 'var(--color-text-primary)' }">Passwort ändern</h2>
      
      <form @submit.prevent="changePassword" class="max-w-md space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1" :style="{ color: 'var(--color-text-secondary)' }">Neues Passwort</label>
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="6"
            class="w-full rounded px-3 py-2"
            :style="inputStyle"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" :style="{ color: 'var(--color-text-secondary)' }">Passwort bestätigen</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            class="w-full rounded px-3 py-2"
            :style="inputStyle"
          >
        </div>
        <button
          type="submit"
          class="text-white px-4 py-2 rounded hover:opacity-90"
          :style="{ backgroundColor: 'var(--color-primary)' }"
        >
          Passwort ändern
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref(false)

// Computed Styles
const cardStyle = computed(() => ({
  backgroundColor: 'var(--color-surface)',
  borderColor: 'var(--color-border)'
}))

const inputStyle = computed(() => ({
  backgroundColor: 'var(--color-surface-elevated)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)'
}))

const buttonSecondaryStyle = computed(() => ({
  backgroundColor: 'var(--color-surface-elevated)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)'
}))

const warningBoxStyle = computed(() => ({
  backgroundColor: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-warning)'
}))

const dangerButtonStyle = computed(() => ({
  backgroundColor: 'var(--color-surface-elevated)',
  color: 'var(--color-danger)',
  border: '1px solid var(--color-danger)'
}))

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

async function saveAllSettings() {
  saving.value = true
  saveMessage.value = ''
  saveError.value = false
  
  try {
    const settingsToSave = [
      ['app_name', settings.value.app_name],
      ['timezone', settings.value.timezone],
      ['agent_offline_timeout', settings.value.agent_offline_timeout],
      ['max_logs_per_request', settings.value.max_logs_per_request],
      ['enable_auto_discovery', settings.value.enable_auto_discovery],
      ['log_retention_days', retentionDays.value]
    ]
    
    for (const [key, value] of settingsToSave) {
      await authStore.api(`/api/settings/${key}`, {
        method: 'PUT',
        body: { value }
      })
    }
    
    saveMessage.value = '✓ Einstellungen gespeichert!'
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } catch (e) {
    saveError.value = true
    saveMessage.value = 'Fehler: ' + e.message
  } finally {
    saving.value = false
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