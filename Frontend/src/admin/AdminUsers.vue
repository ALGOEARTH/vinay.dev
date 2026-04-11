<template>
  <AdminLayout>
    <div class="users-page">
      <div class="page-title">╔══ USER MANAGEMENT ══╗</div>

      <!-- Flash Messages -->
      <div v-if="flashMsg" :class="['flash', flashType]">{{ flashMsg }}</div>

      <div v-if="loading" class="loading-state">
        <span class="blink">[ LOADING USERS... ]</span>
      </div>

      <template v-else>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USERNAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" :class="{ 'row-banned': u.is_banned }">
                <td class="col-id">{{ u.id }}</td>
                <td :class="['col-username', roleClass(u.role)]">{{ u.username }}</td>
                <td class="col-email">{{ u.email }}</td>
                <td :class="['col-role', roleClass(u.role)]">{{ u.role.toUpperCase() }}</td>
                <td class="col-status">
                  <span v-if="u.is_banned" class="banned-label">BANNED</span>
                  <span v-else class="active-label">ACTIVE</span>
                </td>
                <td class="col-actions">
                  <!-- Role Dropdown -->
                  <select
                    class="role-select"
                    :value="u.role"
                    @change="changeRole(u, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="user">user</option>
                    <option value="editor">editor</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>

                  <!-- Ban/Unban -->
                  <button
                    v-if="confirmTarget !== `ban-${u.id}`"
                    class="action-btn"
                    :class="u.is_banned ? 'btn-green' : 'btn-warn'"
                    @click="confirmTarget = `ban-${u.id}`"
                  >
                    {{ u.is_banned ? '[UNBAN]' : '[BAN]' }}
                  </button>
                  <span v-else class="confirm-inline">
                    CONFIRM? 
                    <button class="confirm-y" @click="toggleBan(u)">[ Y ]</button>
                    <button class="confirm-n" @click="confirmTarget = ''">[ N ]</button>
                  </span>

                  <!-- Reset Password -->
                  <button
                    v-if="resetTarget !== u.id"
                    class="action-btn btn-cyan"
                    @click="resetTarget = u.id; newPwd = ''"
                  >
                    [RESET PWD]
                  </button>
                  <span v-else class="reset-inline">
                    <input
                      v-model="newPwd"
                      type="password"
                      placeholder="new password"
                      class="pwd-input"
                    />
                    <button class="confirm-y" @click="resetPassword(u.id)">[SET]</button>
                    <button class="confirm-n" @click="resetTarget = null; newPwd = ''">[ X ]</button>
                  </span>

                  <!-- Delete -->
                  <button
                    v-if="confirmTarget !== `del-${u.id}`"
                    class="action-btn btn-danger"
                    @click="confirmTarget = `del-${u.id}`"
                  >
                    [DELETE]
                  </button>
                  <span v-else class="confirm-inline">
                    CONFIRM?
                    <button class="confirm-y" @click="deleteUser(u.id)">[ Y ]</button>
                    <button class="confirm-n" @click="confirmTarget = ''">[ N ]</button>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { authFetch } from './useAdminAuth'

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_banned: number
  created_at: string
}

const users = ref<AdminUser[]>([])
const loading = ref(true)
const flashMsg = ref('')
const flashType = ref('flash-ok')
const confirmTarget = ref('')
const resetTarget = ref<number | null>(null)
const newPwd = ref('')

function roleClass(role: string) {
  return {
    'role-admin': role === 'admin',
    'role-mod': role === 'moderator',
    'role-editor': role === 'editor',
    'role-user': role === 'user'
  }
}

function flash(msg: string, type: 'flash-ok' | 'flash-err' = 'flash-ok') {
  flashMsg.value = msg
  flashType.value = type
  setTimeout(() => { flashMsg.value = '' }, 3000)
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await authFetch('/admin/users')
    const data = await res.json()
    if (data.success) users.value = data.users
  } catch {
    flash('FAILED TO LOAD USERS', 'flash-err')
  } finally {
    loading.value = false
  }
}

async function changeRole(u: AdminUser, role: string) {
  try {
    const res = await authFetch(`/admin/users/${u.id}`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    })
    const data = await res.json()
    if (data.success) {
      u.role = role
      flash(`ROLE UPDATED: ${u.username} → ${role.toUpperCase()}`)
    } else {
      flash(data.message?.toUpperCase() || 'ERROR', 'flash-err')
    }
  } catch {
    flash('SERVER ERROR', 'flash-err')
  }
}

async function toggleBan(u: AdminUser) {
  confirmTarget.value = ''
  const newBan = u.is_banned ? 0 : 1
  try {
    const res = await authFetch(`/admin/users/${u.id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_banned: newBan })
    })
    const data = await res.json()
    if (data.success) {
      u.is_banned = newBan
      flash(`USER ${newBan ? 'BANNED' : 'UNBANNED'}: ${u.username}`)
    } else {
      flash(data.message?.toUpperCase() || 'ERROR', 'flash-err')
    }
  } catch {
    flash('SERVER ERROR', 'flash-err')
  }
}

async function resetPassword(id: number) {
  if (newPwd.value.length < 8) {
    flash('PASSWORD MUST BE AT LEAST 8 CHARACTERS', 'flash-err')
    return
  }
  try {
    const res = await authFetch(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword: newPwd.value })
    })
    const data = await res.json()
    if (data.success) {
      flash('PASSWORD RESET SUCCESSFULLY')
      resetTarget.value = null
      newPwd.value = ''
    } else {
      flash(data.message?.toUpperCase() || 'ERROR', 'flash-err')
    }
  } catch {
    flash('SERVER ERROR', 'flash-err')
  }
}

async function deleteUser(id: number) {
  confirmTarget.value = ''
  try {
    const res = await authFetch(`/admin/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      users.value = users.value.filter(u => u.id !== id)
      flash('USER DELETED')
    } else {
      flash(data.message?.toUpperCase() || 'ERROR', 'flash-err')
    }
  } catch {
    flash('SERVER ERROR', 'flash-err')
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.users-page {
  font-family: 'Courier New', monospace;
  color: #00ff41;
}

.page-title {
  font-size: 1.1rem;
  color: #00ffff;
  text-shadow: 0 0 8px #00ffff;
  margin-bottom: 1.2rem;
  letter-spacing: 2px;
}

.loading-state { text-align: center; padding: 3rem; }

.blink { animation: blink 1s step-end infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.flash {
  padding: 0.5rem 0.8rem;
  margin-bottom: 1rem;
  font-size: 0.82rem;
  border: 1px solid;
  animation: fadeIn 0.3s ease;
}
.flash-ok  { border-color: #00ff41; color: #00ff41; background: #001a00; }
.flash-err { border-color: #ff0040; color: #ff0040; background: #1a0008; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.table-wrap { overflow-x: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  white-space: nowrap;
}

.data-table th {
  text-align: left;
  color: #00ffff;
  border-bottom: 1px solid #1a1a1a;
  padding: 0.4rem 0.6rem;
  letter-spacing: 1px;
  background: #0d0d0d;
}

.data-table td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #111;
  vertical-align: middle;
}

.data-table tr:hover td { background: #0f0f0f; }

.row-banned td { text-decoration: line-through; opacity: 0.6; }

.col-id    { color: #444; width: 40px; }
.col-email { color: #226622; }

.role-admin   { color: #ffd700; text-shadow: 0 0 4px #ffd700; }
.role-mod     { color: #00ffff; }
.role-editor  { color: #00ff41; }
.role-user    { color: #aaa; }

.banned-label { color: #ff0040; }
.active-label { color: #00ff41; }

.role-select {
  background: #0d0d0d;
  border: 1px solid #226622;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  padding: 0.15rem 0.3rem;
  cursor: pointer;
  margin-right: 0.3rem;
}

.action-btn {
  background: transparent;
  border: 1px solid;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  padding: 0.15rem 0.35rem;
  cursor: pointer;
  margin-right: 0.3rem;
  transition: background 0.15s, color 0.15s;
}

.btn-warn   { border-color: #ff8800; color: #ff8800; }
.btn-warn:hover   { background: #ff8800; color: #0a0a0a; }
.btn-green  { border-color: #00ff41; color: #00ff41; }
.btn-green:hover  { background: #00ff41; color: #0a0a0a; }
.btn-cyan   { border-color: #00ffff; color: #00ffff; }
.btn-cyan:hover   { background: #00ffff; color: #0a0a0a; }
.btn-danger { border-color: #ff0040; color: #ff0040; }
.btn-danger:hover { background: #ff0040; color: #0a0a0a; }

.confirm-inline {
  font-size: 0.72rem;
  color: #ff8800;
  margin-right: 0.3rem;
}

.confirm-y, .confirm-n {
  background: transparent;
  border: 1px solid;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  padding: 0.1rem 0.25rem;
  cursor: pointer;
  margin-left: 0.25rem;
}

.confirm-y { border-color: #00ff41; color: #00ff41; }
.confirm-y:hover { background: #00ff41; color: #0a0a0a; }
.confirm-n { border-color: #ff0040; color: #ff0040; }
.confirm-n:hover { background: #ff0040; color: #0a0a0a; }

.reset-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
}

.pwd-input {
  background: #0d0d0d;
  border: 1px solid #00ffff;
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  padding: 0.15rem 0.3rem;
  width: 120px;
}
</style>
