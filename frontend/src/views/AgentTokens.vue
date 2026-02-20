<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--color-text-primary)' }">Agent Token (HTTPS)</h1>
      <div class="flex gap-2">
        <button
          v-if="activeToken"
          @click="regenerate(activeToken)"
          class="px-4 py-2 rounded text-white hover:opacity-90"
          :style="{ backgroundColor: 'var(--color-warning, #f59e0b)' }"
        >
          Token erneuern
        </button>
        <button
          v-if="!activeToken"
          @click="createDefault"
          class="px-4 py-2 rounded text-white hover:opacity-90"
          :style="{ backgroundColor: 'var(--color-primary, #3b82f6)' }"
        >
          Token anlegen
        </button>
      </div>
    </div>

    <div class="rounded-lg p-4 mb-6" :style="infoBoxStyle">
      <h3 class="font-semibold mb-1" :style="{ color: 'var(--color-primary)' }">Warum?</h3>
      <p class="text-sm" :style="{ color: 'var(--color-text-secondary)' }">
        Der Windows-Agent im HTTPS-Modus verlangt einen Bearer Token. Hier siehst du ihn jederzeit, ohne API-Docs zu öffnen.
        Aktuell wird nur ein „hartes“ Token genutzt; Rotation folgt später.
      </p>
    </div>

    <div v-if="activeToken" class="rounded-lg shadow p-6" :style="cardStyle">
      <div class="flex justify-between mb-4">
        <div>
          <p class="font-semibold" :style="{ color: 'var(--color-text-primary)' }">{{ activeToken.name }}</p>
          <p class="text-sm" :style="{ color: 'var(--color-text-muted)' }">
            ID {{ activeToken.id }} · Erstellt {{ formatTime(activeToken.created_at) }}
          </p>
        </div>
        <span class="px-2 py-1 text-xs rounded-full text-white" :class="activeToken.is_active ? 'bg-green-500' : 'bg-red-500'">
          {{ activeToken.is_active ? 'Aktiv' : 'Inaktiv' }}
        </span>
      </div>

      <div class="rounded p-3 mb-4" :style="codeBlockStyle">
        <label class="text-xs mb-1 block" :style="{ color: 'var(--color-text-muted)' }">Bearer Token</label>
        <div class="flex gap-2 items-center">
          <code class="flex-1 text-sm px-3 py-2 rounded font-mono overflow-x-auto" :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }">
            {{ activeToken.token }}
          </code>
          <button
            @click="copy(activeToken.token)"
            class="px-3 py-2 rounded hover:opacity-80 text-sm"
            :style="buttonSecondaryStyle"
          >
            Kopieren
          </button>
        </div>
      </div>

      <div class="text-sm" :style="{ color: 'var(--color-text-secondary)' }">
        Ingest-URL: <span class="font-mono">{{ ingestUrl }}</span>
      </div>
    </div>

    <div v-else class="rounded-lg shadow p-12 text-center" :style="cardStyle">
      <p :style="{ color: 'var(--color-text-muted)' }">{{ loading ? 'Lade...' : 'Kein Token vorhanden' }}</p>
    </div>

    <div class="mt-6 rounded-lg shadow p-4" :style="cardStyle">
      <h3 class="font-semibold mb-2" :style="{ color: 'var(--color-text-primary)' }">Schnellstart (Windows Agent)</h3>
      <ol class="list-decimal pl-6 space-y-1 text-sm" :style="{ color: 'var(--color-text-secondary)' }">
        <li>Installer ausführen: <code class="font-mono">.\install-windows.ps1</code></li>
        <li>Modus „2) Agent-basiert (HTTPS)“ wählen.</li>
        <li>Token aus diesem Screen einfügen.</li>
        <li>Server FQDN/IP + Port 443 eintragen; bei Selbstsignierung ggf. Zertifikat überspringen.</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const tokens = ref([])
const loading = ref(false)

const cardStyle = computed(() => ({ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }))
const buttonSecondaryStyle = computed(() => ({ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }))
const codeBlockStyle = computed(() => ({ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }))
const infoBoxStyle = computed(() => ({ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-primary)' }))
const ingestUrl = computed(() => `${window.location.origin}/api/agents/ingest`)
const activeToken = computed(() => tokens.value[0] || null)

onMounted(() => ensureToken())

async function ensureToken() {
  loading.value = true
  try {
    await loadTokens()
    if (!tokens.value.length) {
      await createDefault()
      await loadTokens()
    }
  } catch (e) {
    alert('Token laden fehlgeschlagen: ' + e.message)
  } finally {
    loading.value = false
  }
}

async function loadTokens() {
  tokens.value = await authStore.api('/api/agent-tokens')
}

async function createDefault() {
  await authStore.api('/api/agent-tokens', { method: 'POST', body: { name: 'default-windows-agent' } })
}

async function regenerate(token) {
  if (!confirm('Token wirklich erneuern? Der alte wird ungültig.')) return
  await authStore.api(`/api/agent-tokens/${token.id}/regenerate`, { method: 'POST' })
  await loadTokens()
}

function copy(val) {
  navigator.clipboard.writeText(val)
  alert('Token kopiert')
}

function formatTime(ts) {
  if (!ts) return '-'
  const iso = ts.endsWith('Z') ? ts : ts + 'Z'
  return new Date(iso).toLocaleString('de-DE')
}
</script>
