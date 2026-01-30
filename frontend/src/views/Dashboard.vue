<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-500 text-sm">Gesamt Logs</div>
        <div class="text-3xl font-bold mt-2">{{ stats?.total_logs?.toLocaleString() || 0 }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-500 text-sm">Hosts</div>
        <div class="text-3xl font-bold mt-2">{{ stats?.unique_hosts || 0 }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-500 text-sm">Fehler</div>
        <div class="text-3xl font-bold mt-2 text-red-600">{{ (stats?.logs_by_level?.error || 0) + (stats?.logs_by_level?.critical || 0) }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-500 text-sm">Heute</div>
        <div class="text-3xl font-bold mt-2">{{ stats?.logs_today?.toLocaleString() || 0 }}</div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">Neueste Logs</h2>
        <router-link to="/logs" class="text-blue-500 hover:underline text-sm">Alle →</router-link>
      </div>
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
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm whitespace-nowrap">{{ formatTime(log.timestamp) }}</td>
            <td class="px-4 py-3 text-sm">{{ log.hostname }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full" :class="levelClass(log.level)">{{ log.level }}</span></td>
            <td class="px-4 py-3 text-sm">{{ log.source }}</td>
            <td class="px-4 py-3 text-sm truncate max-w-md">{{ log.message }}</td>
          </tr>
          <tr v-if="!logs.length"><td colspan="5" class="px-4 py-8 text-center text-gray-500">Keine Logs</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const stats = ref(null)
const logs = ref([])

onMounted(async () => {
  try {
    stats.value = await auth.api('/api/logs/stats')
    logs.value = await auth.api('/api/logs/recent?limit=10')
  } catch (e) { console.error(e) }
})

function formatTime(ts) { return ts ? new Date(ts).toLocaleString('de-DE') : '-' }
function levelClass(level) {
  const c = { error: 'bg-red-100 text-red-800', critical: 'bg-red-100 text-red-800', warning: 'bg-yellow-100 text-yellow-800', info: 'bg-blue-100 text-blue-800', debug: 'bg-gray-100 text-gray-800' }
  return c[level] || 'bg-gray-100 text-gray-800'
}
</script>
