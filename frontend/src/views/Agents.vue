<!-- ==============================================================================
     Name:        Philipp Fischer
     Kontakt:     p.fischer@itconex.de
     Version:     2026.01.30.13.30.00
     Beschreibung: LogBot v2026.01.30.13.30.00 - Agents/Geräte Übersicht
     ============================================================================== -->

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Agents / Geräte</h1>
    
    <!-- Suche -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="Suche nach Hostname, IP oder MAC..."
          class="flex-1 border rounded px-3 py-2"
          @keyup.enter="loadAgents"
        >
        <select v-model="deviceType" class="border rounded px-3 py-2">
          <option value="">Alle Typen</option>
          <option value="unifi_ap">UniFi AP</option>
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
          <option value="unknown">Unbekannt</option>
        </select>
        <button
          @click="loadAgents"
          class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
        >
          Suchen
        </button>
      </div>
    </div>
    
    <!-- Agents Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="agent in agents"
        :key="agent.id"
        class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-semibold text-lg">{{ agent.hostname }}</h3>
            <p class="text-gray-500 text-sm">{{ agent.ip_address }}</p>
          </div>
          <span 
            class="px-2 py-1 text-xs rounded-full"
            :class="isOnline(agent.last_seen) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
          >
            {{ isOnline(agent.last_seen) ? 'Online' : 'Offline' }}
          </span>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Typ:</span>
            <span>{{ agent.device_type }}</span>
          </div>
          <div v-if="agent.mac_address" class="flex justify-between">
            <span class="text-gray-500">MAC:</span>
            <span class="font-mono">{{ agent.mac_address }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Zuletzt gesehen:</span>
            <span>{{ formatTime(agent.last_seen) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Erstmals gesehen:</span>
            <span>{{ formatTime(agent.first_seen) }}</span>
          </div>
        </div>
        
        <!-- Metadata wenn vorhanden -->
        <div v-if="agent.metadata && Object.keys(agent.metadata).length" class="mt-4 pt-4 border-t">
          <p class="text-gray-500 text-xs mb-2">Metadata:</p>
          <div class="text-xs space-y-1">
            <div v-for="(value, key) in agent.metadata" :key="key" class="flex justify-between">
              <span class="text-gray-500">{{ key }}:</span>
              <span>{{ value }}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="mt-4 pt-4 border-t flex justify-between">
          <router-link 
            :to="`/logs?hostname=${agent.hostname}`"
            class="text-blue-500 hover:underline text-sm"
          >
            Logs anzeigen →
          </router-link>
          <button
            @click="deleteAgent(agent)"
            class="text-red-500 hover:text-red-700 text-sm"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
    
    <!-- Leer-Zustand -->
    <div v-if="!loading && !agents.length" class="bg-white rounded-lg shadow p-12 text-center">
      <p class="text-gray-500">Keine Agents gefunden</p>
      <p class="text-gray-400 text-sm mt-2">Agents werden automatisch erstellt wenn Logs empfangen werden</p>
    </div>
    
    <!-- Pagination -->
    <div v-if="total > pageSize" class="mt-6 flex justify-center gap-2">
      <button
        @click="page--; loadAgents()"
        :disabled="page <= 1"
        class="px-4 py-2 border rounded disabled:opacity-50"
      >
        ← Zurück
      </button>
      <span class="px-4 py-2">Seite {{ page }} von {{ Math.ceil(total / pageSize) }}</span>
      <button
        @click="page++; loadAgents()"
        :disabled="page * pageSize >= total"
        class="px-4 py-2 border rounded disabled:opacity-50"
      >
        Weiter →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const agents = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 50
const loading = ref(false)
const search = ref('')
const deviceType = ref('')
const offlineTimeout = ref(300) // Default 5 Minuten

onMounted(async () => {
  await loadSettings()
  await loadAgents()
})

async function loadSettings() {
  try {
    const data = await authStore.api('/api/settings')
    if (data.settings?.agent_offline_timeout) {
      offlineTimeout.value = data.settings.agent_offline_timeout
    }
  } catch (e) {
    console.error('Settings laden fehlgeschlagen:', e)
  }
}

async function loadAgents() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value,
      page_size: pageSize
    })
    if (search.value) params.append('search', search.value)
    if (deviceType.value) params.append('device_type', deviceType.value)

    const data = await authStore.api(`/api/agents?${params}`)
    agents.value = data.items
    total.value = data.total
  } catch (e) {
    console.error('Fehler:', e)
  } finally {
    loading.value = false
  }
}

async function deleteAgent(agent) {
  if (!confirm(`Agent "${agent.hostname}" wirklich löschen?`)) return

  try {
    await authStore.api(`/api/agents/${agent.id}`, { method: 'DELETE' })
    loadAgents()
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

function isOnline(lastSeen) {
  if (!lastSeen) return false
  const timeoutMs = offlineTimeout.value * 1000
  const cutoff = Date.now() - timeoutMs
  // Z anhängen für UTC
  const timestamp = lastSeen.endsWith('Z') ? lastSeen : lastSeen + 'Z'
  return new Date(timestamp).getTime() > cutoff
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('de-DE')
}
</script>
