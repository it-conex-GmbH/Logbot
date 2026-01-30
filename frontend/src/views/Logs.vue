<!-- ==============================================================================
     Name:        Philipp Fischer
     Kontakt:     p.fischer@itconex.de
     Version:     2026.01.30.13.30.00
     Beschreibung: LogBot v2026.01.30.13.30.00 - Logs Ansicht mit Filter und Pagination
     ============================================================================== -->

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Logs</h1>
    
    <!-- Filter -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          v-model="filters.hostname"
          type="text"
          placeholder="Hostname..."
          class="border rounded px-3 py-2"
          @keyup.enter="loadLogs"
        >
        <input
          v-model="filters.source"
          type="text"
          placeholder="Source..."
          class="border rounded px-3 py-2"
          @keyup.enter="loadLogs"
        >
        <select v-model="filters.level" class="border rounded px-3 py-2">
          <option value="">Alle Level</option>
          <option value="emergency">Emergency</option>
          <option value="alert">Alert</option>
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="notice">Notice</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Suche in Nachricht..."
          class="border rounded px-3 py-2"
          @keyup.enter="loadLogs"
        >
        <button
          @click="loadLogs"
          class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
        >
          Filtern
        </button>
      </div>
    </div>
    
    <!-- Logs Tabelle -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b flex justify-between items-center">
        <span class="text-gray-600">{{ total.toLocaleString() }} Logs gefunden</span>
        <div class="flex gap-2">
          <button
            @click="exportLogs('csv')"
            class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
          >
            CSV Export
          </button>
          <button
            @click="exportLogs('json')"
            class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
          >
            JSON Export
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zeit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nachricht</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr 
              v-for="log in logs" 
              :key="log.id" 
              class="hover:bg-gray-50 cursor-pointer"
              @click="showDetail(log)"
            >
              <td class="px-4 py-3 text-sm whitespace-nowrap">{{ formatTime(log.timestamp) }}</td>
              <td class="px-4 py-3 text-sm">{{ log.hostname }}</td>
              <td class="px-4 py-3">
                <span 
                  class="px-2 py-1 text-xs rounded-full"
                  :class="levelBadge(log.level)"
                >
                  {{ log.level }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">{{ log.source }}</td>
              <td class="px-4 py-3 text-sm truncate max-w-lg">{{ log.message }}</td>
            </tr>
            <tr v-if="loading">
              <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                Laden...
              </td>
            </tr>
            <tr v-else-if="!logs.length">
              <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                Keine Logs gefunden
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="p-4 border-t flex justify-between items-center">
        <span class="text-sm text-gray-600">
          Seite {{ page }} von {{ Math.ceil(total / pageSize) || 1 }}
        </span>
        <div class="flex gap-2">
          <button
            @click="page--; loadLogs()"
            :disabled="page <= 1"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >
            ← Zurück
          </button>
          <button
            @click="page++; loadLogs()"
            :disabled="page * pageSize >= total"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
    
    <!-- Detail Modal -->
    <div 
      v-if="selectedLog" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      @click.self="selectedLog = null"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-lg font-semibold">Log Details</h2>
          <button @click="selectedLog = null" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-gray-500 text-sm">ID</label>
              <p class="font-mono">{{ selectedLog.id }}</p>
            </div>
            <div>
              <label class="text-gray-500 text-sm">Zeitstempel</label>
              <p>{{ formatTime(selectedLog.timestamp) }}</p>
            </div>
            <div>
              <label class="text-gray-500 text-sm">Hostname</label>
              <p>{{ selectedLog.hostname }}</p>
            </div>
            <div>
              <label class="text-gray-500 text-sm">IP-Adresse</label>
              <p>{{ selectedLog.ip_address }}</p>
            </div>
            <div>
              <label class="text-gray-500 text-sm">Level</label>
              <p>
                <span :class="levelBadge(selectedLog.level)" class="px-2 py-1 text-xs rounded-full">
                  {{ selectedLog.level }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-gray-500 text-sm">Source</label>
              <p>{{ selectedLog.source }}</p>
            </div>
          </div>
          <div>
            <label class="text-gray-500 text-sm">Nachricht</label>
            <p class="bg-gray-50 p-3 rounded font-mono text-sm whitespace-pre-wrap">{{ selectedLog.message }}</p>
          </div>
          <div v-if="selectedLog.raw_message">
            <label class="text-gray-500 text-sm">Raw Message</label>
            <p class="bg-gray-100 p-3 rounded font-mono text-xs whitespace-pre-wrap overflow-x-auto">{{ selectedLog.raw_message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const logs = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 100
const loading = ref(false)
const selectedLog = ref(null)

const filters = ref({
  hostname: '',
  source: '',
  level: '',
  search: ''
})

onMounted(() => loadLogs())

async function loadLogs() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value,
      page_size: pageSize
    })
    if (filters.value.hostname) params.append('hostname', filters.value.hostname)
    if (filters.value.source) params.append('source', filters.value.source)
    if (filters.value.level) params.append('level', filters.value.level)
    if (filters.value.search) params.append('search', filters.value.search)
    
    const data = await authStore.api(`/api/logs?${params}`)
    logs.value = data.items
    total.value = data.total
  } catch (e) {
    console.error('Fehler:', e)
  } finally {
    loading.value = false
  }
}

async function showDetail(log) {
  try {
    selectedLog.value = await authStore.api(`/api/logs/${log.id}`)
  } catch (e) {
    console.error('Fehler:', e)
  }
}

function exportLogs(format) {
  const params = new URLSearchParams({ format })
  if (filters.value.hostname) params.append('hostname', filters.value.hostname)
  if (filters.value.source) params.append('source', filters.value.source)
  if (filters.value.level) params.append('level', filters.value.level)
  
  window.open(`/api/logs/export?${params}`, '_blank')
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('de-DE')
}

function levelBadge(level) {
  const badges = {
    emergency: 'bg-red-100 text-red-800',
    alert: 'bg-red-100 text-red-800',
    critical: 'bg-red-100 text-red-800',
    error: 'bg-orange-100 text-orange-800',
    warning: 'bg-yellow-100 text-yellow-800',
    notice: 'bg-blue-100 text-blue-800',
    info: 'bg-blue-100 text-blue-800',
    debug: 'bg-gray-100 text-gray-800'
  }
  return badges[level] || 'bg-gray-100 text-gray-800'
}
</script>
