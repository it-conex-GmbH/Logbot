<!-- ==============================================================================
     Name:        Philipp Fischer
     Kontakt:     p.fischer@itconex.de
     Version:     2026.01.30.13.30.00
     Beschreibung: LogBot v2026.01.30.13.30.00 - System Health Übersicht
     ============================================================================== -->

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">System Health</h1>
      <button
        @click="loadHealth"
        class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center gap-2"
      >
        🔄 Aktualisieren
      </button>
    </div>
    
    <!-- Status Banner -->
    <div 
      class="rounded-lg p-6 mb-6"
      :class="health?.status === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'"
    >
      <div class="flex items-center gap-4">
        <span class="text-4xl">{{ health?.status === 'healthy' ? '💚' : '⚠️' }}</span>
        <div>
          <h2 class="text-2xl font-bold" :class="health?.status === 'healthy' ? 'text-green-800' : 'text-yellow-800'">
            {{ health?.status === 'healthy' ? 'System läuft normal' : 'System eingeschränkt' }}
          </h2>
          <p class="text-gray-600">Version {{ health?.version }} | Uptime: {{ formatUptime(health?.uptime_seconds) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Metriken Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- CPU -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-gray-500 text-sm">CPU Auslastung</p>
            <p class="text-3xl font-bold">{{ health?.cpu_percent?.toFixed(1) || 0 }}%</p>
          </div>
          <span class="text-2xl">🔲</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all"
            :class="getUsageColor(health?.cpu_percent)"
            :style="{ width: (health?.cpu_percent || 0) + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- RAM -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-gray-500 text-sm">RAM Auslastung</p>
            <p class="text-3xl font-bold">{{ health?.memory_percent?.toFixed(1) || 0 }}%</p>
          </div>
          <span class="text-2xl">🧠</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all"
            :class="getUsageColor(health?.memory_percent)"
            :style="{ width: (health?.memory_percent || 0) + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- Disk -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-gray-500 text-sm">Festplatte</p>
            <p class="text-3xl font-bold">{{ health?.disk_percent?.toFixed(1) || 0 }}%</p>
          </div>
          <span class="text-2xl">💾</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all"
            :class="getUsageColor(health?.disk_percent)"
            :style="{ width: (health?.disk_percent || 0) + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- Database -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-gray-500 text-sm">Datenbank</p>
            <p class="text-3xl font-bold" :class="health?.database_connected ? 'text-green-600' : 'text-red-600'">
              {{ health?.database_connected ? 'OK' : 'Fehler' }}
            </p>
          </div>
          <span class="text-2xl">🗄️</span>
        </div>
        <p class="text-gray-500 text-sm">
          {{ health?.database_connected ? 'Verbunden' : 'Nicht verbunden' }}
        </p>
      </div>
    </div>
    
    <!-- Log Statistiken -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Log Statistiken</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Gesamt Logs</span>
            <span class="text-xl font-bold">{{ health?.logs_total?.toLocaleString() || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Logs (24h)</span>
            <span class="text-xl font-bold">{{ health?.logs_last_24h?.toLocaleString() || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Logs/Minute (Ø)</span>
            <span class="text-xl font-bold">{{ logsPerMinute }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Agent Status</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Gesamt Agents</span>
            <span class="text-xl font-bold">{{ health?.agents_total || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Online</span>
            <span class="text-xl font-bold text-green-600">{{ health?.agents_online || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Offline</span>
            <span class="text-xl font-bold text-gray-500">{{ (health?.agents_total || 0) - (health?.agents_online || 0) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Auto-Refresh Info -->
    <p class="text-center text-gray-500 text-sm mt-6">
      Daten werden nicht automatisch aktualisiert. Klicke auf "Aktualisieren" für aktuelle Werte.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const health = ref(null)

onMounted(() => loadHealth())

async function loadHealth() {
  try {
    health.value = await authStore.api('/api/health/detailed')
  } catch (e) {
    console.error('Fehler:', e)
  }
}

const logsPerMinute = computed(() => {
  if (!health.value?.logs_last_24h) return 0
  return Math.round(health.value.logs_last_24h / (24 * 60))
})

function getUsageColor(percent) {
  if (!percent) return 'bg-gray-400'
  if (percent < 60) return 'bg-green-500'
  if (percent < 80) return 'bg-yellow-500'
  return 'bg-red-500'
}

function formatUptime(seconds) {
  if (!seconds) return '-'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
</script>
