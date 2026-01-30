<!-- ==============================================================================
     Name:        Philipp Fischer
     Kontakt:     p.fischer@itconex.de
     Version:     2026.01.30.13.30.00
     Beschreibung: LogBot v2026.01.30.13.30.00 - Benutzer-Verwaltung (nur für Admins)
     ============================================================================== -->

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Benutzer</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Neuer Benutzer
      </button>
    </div>
    
    <!-- Users Tabelle -->
    <div class="bg-white rounded-lg shadow">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Benutzername</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rolle</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Erstellt</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ user.username }}</td>
            <td class="px-6 py-4 text-gray-500">{{ user.email || '-' }}</td>
            <td class="px-6 py-4">
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ user.is_active ? 'Aktiv' : 'Deaktiviert' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500 text-sm">{{ formatDate(user.created_at) }}</td>
            <td class="px-6 py-4 text-right">
              <button
                @click="editUser(user)"
                class="text-blue-500 hover:underline mr-4"
              >
                Bearbeiten
              </button>
              <button
                v-if="user.id !== authStore.user?.id"
                @click="deleteUser(user)"
                class="text-red-500 hover:underline"
              >
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Create/Edit Modal -->
    <div 
      v-if="showCreateModal || editingUser" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold">
            {{ editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}
          </h2>
        </div>
        <form @submit.prevent="saveUser" class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
            <input
              v-model="form.username"
              type="text"
              required
              :disabled="!!editingUser"
              class="w-full border rounded px-3 py-2 disabled:bg-gray-100"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full border rounded px-3 py-2"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ editingUser ? 'Neues Passwort (leer lassen um nicht zu ändern)' : 'Passwort' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!editingUser"
              minlength="6"
              class="w-full border rounded px-3 py-2"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
            <select v-model="form.role" class="w-full border rounded px-3 py-2">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div v-if="editingUser" class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="mr-2"
            >
            <label for="is_active">Benutzer aktiv</label>
          </div>
          
          <div class="flex justify-end gap-2 pt-4">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const users = ref([])
const showCreateModal = ref(false)
const editingUser = ref(null)
const form = ref({
  username: '',
  email: '',
  password: '',
  role: 'user',
  is_active: true
})

onMounted(() => loadUsers())

async function loadUsers() {
  try {
    users.value = await authStore.api('/api/users')
  } catch (e) {
    console.error('Fehler:', e)
  }
}

function editUser(user) {
  editingUser.value = user
  form.value = {
    username: user.username,
    email: user.email || '',
    password: '',
    role: user.role,
    is_active: user.is_active
  }
}

function closeModal() {
  showCreateModal.value = false
  editingUser.value = null
  form.value = { username: '', email: '', password: '', role: 'user', is_active: true }
}

async function saveUser() {
  try {
    if (editingUser.value) {
      const data = {
        email: form.value.email,
        role: form.value.role,
        is_active: form.value.is_active
      }
      if (form.value.password) {
        data.password = form.value.password
      }
      await authStore.api(`/api/users/${editingUser.value.id}`, {
        method: 'PUT',
        body: data
      })
    } else {
      await authStore.api('/api/users', {
        method: 'POST',
        body: form.value
      })
    }
    closeModal()
    loadUsers()
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

async function deleteUser(user) {
  if (!confirm(`Benutzer "${user.username}" wirklich löschen?`)) return
  
  try {
    await authStore.api(`/api/users/${user.id}`, { method: 'DELETE' })
    loadUsers()
  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleDateString('de-DE')
}
</script>
