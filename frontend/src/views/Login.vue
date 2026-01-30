<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-2">📋 LogBot</h1>
      <p class="text-gray-600 text-center mb-6">Zentraler Log-Server</p>
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{{ error }}</div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Benutzername</label>
          <input v-model="username" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500" required autofocus>
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Passwort</label>
          <input v-model="password" type="password" class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500" required>
        </div>
        <button type="submit" :disabled="loading" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
          {{ loading ? 'Anmelden...' : 'Anmelden' }}
        </button>
      </form>
      <p class="text-center text-gray-500 text-sm mt-6">Standard: admin / admin</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
