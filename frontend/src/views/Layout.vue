<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="w-64 bg-gray-800 text-white flex flex-col">
      <div class="p-4 border-b border-gray-700">
        <h1 class="text-xl font-bold">📋 LogBot</h1>
        <p class="text-gray-400 text-sm">v2026.01.30.13.30.00</p>
      </div>
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li><router-link to="/" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'Dashboard' }">📈 Dashboard</router-link></li>
          <li><router-link to="/logs" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'Logs' }">📋 Logs</router-link></li>
          <li><router-link to="/agents" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'Agents' }">🖥️ Agents</router-link></li>
          <li><router-link to="/webhooks" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'Webhooks' }">🔗 Webhooks</router-link></li>
          <li v-if="auth.isAdmin"><router-link to="/users" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'Users' }">👥 Benutzer</router-link></li>
          <li><router-link to="/settings" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'Settings' }">⚙️ Einstellungen</router-link></li>
          <li><router-link to="/settings/branding" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'BrandingSettings' }">🎨 Branding</router-link></li>
          <li><router-link to="/health" class="flex items-center px-4 py-2 rounded hover:bg-gray-700" :class="{ 'bg-gray-700': $route.name === 'Health' }">💚 Health</router-link></li>
        </ul>
      </nav>
      <div class="p-4 border-t border-gray-700 flex items-center justify-between">
        <div>
          <p class="font-medium">{{ auth.user?.username }}</p>
          <p class="text-gray-400 text-sm">{{ auth.user?.role }}</p>
        </div>
        <button @click="handleLogout" class="text-gray-400 hover:text-white" title="Abmelden">🚪</button>
      </div>
    </aside>
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const router = useRouter()
const auth = useAuthStore()
function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>