<template>
  <AdminLayout>
    <div class="gb-page">
      <div class="page-title">╔══ GUESTBOOK MANAGEMENT ══╗</div>

      <div v-if="flashMsg" :class="['flash', flashType]">{{ flashMsg }}</div>

      <div v-if="loading" class="loading-state">
        <span class="blink">[ LOADING ENTRIES... ]</span>
      </div>

      <template v-else>
        <div class="count-info">TOTAL ENTRIES: {{ entries.length }}</div>

        <div v-if="entries.length === 0" class="empty-state">NO GUESTBOOK ENTRIES YET.</div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>MESSAGE</th>
              <th>WEBSITE</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td class="col-id">{{ entry.id }}</td>
              <td class="col-name">{{ entry.name }}</td>
              <td class="col-msg">{{ entry.message.slice(0, 80) }}{{ entry.message.length > 80 ? '…' : '' }}</td>
              <td class="col-site">
                <a v-if="entry.website" :href="entry.website" target="_blank" rel="noopener" class="site-link">
                  {{ shortenUrl(entry.website) }}
                </a>
                <span v-else class="no-site">—</span>
              </td>
              <td class="col-date">{{ formatDate(entry.created_at) }}</td>
              <td class="col-actions">
                <button
                  v-if="confirmDelete !== entry.id"
                  class="action-btn btn-danger"
                  @click="confirmDelete = entry.id"
                >[DELETE]</button>
                <span v-else class="confirm-inline">
                  CONFIRM?
                  <button class="confirm-y" @click="deleteEntry(entry.id)">[ Y ]</button>
                  <button class="confirm-n" @click="confirmDelete = null">[ N ]</button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { authFetch } from './useAdminAuth'

interface GuestbookEntry {
  id: number
  name: string
  message: string
  website: string | null
  created_at: string
}

const entries = ref<GuestbookEntry[]>([])
const loading = ref(true)
const flashMsg = ref('')
const flashType = ref('flash-ok')
const confirmDelete = ref<number | null>(null)

function flash(msg: string, type: 'flash-ok' | 'flash-err' = 'flash-ok') {
  flashMsg.value = msg
  flashType.value = type
  setTimeout(() => { flashMsg.value = '' }, 3000)
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: '2-digit', day: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    })
  } catch { return iso }
}

function shortenUrl(url: string) {
  try { return new URL(url).hostname }
  catch { return url }
}

async function loadEntries() {
  loading.value = true
  try {
    const API = import.meta.env.VITE_API_BASE || '/api'
    const res = await fetch(`${API}/guestbook`)
    const data = await res.json()
    if (data.success) entries.value = data.entries
  } catch {
    flash('FAILED TO LOAD ENTRIES', 'flash-err')
  } finally {
    loading.value = false
  }
}

async function deleteEntry(id: number) {
  confirmDelete.value = null
  try {
    const res = await authFetch(`/guestbook/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      entries.value = entries.value.filter(e => e.id !== id)
      flash('ENTRY DELETED')
    } else {
      flash(data.message?.toUpperCase() || 'ERROR', 'flash-err')
    }
  } catch {
    flash('SERVER ERROR', 'flash-err')
  }
}

onMounted(loadEntries)
</script>

<style scoped>
.gb-page { font-family: 'Courier New', monospace; color: #00ff41; }

.page-title {
  font-size: 1.1rem;
  color: #00ffff;
  text-shadow: 0 0 8px #00ffff;
  margin-bottom: 1.2rem;
  letter-spacing: 2px;
}

.flash {
  padding: 0.5rem 0.8rem;
  margin-bottom: 1rem;
  font-size: 0.82rem;
  border: 1px solid;
}
.flash-ok  { border-color: #00ff41; color: #00ff41; background: #001a00; }
.flash-err { border-color: #ff0040; color: #ff0040; background: #1a0008; }

.count-info { font-size: 0.78rem; color: #444; margin-bottom: 0.8rem; }

.loading-state { text-align: center; padding: 3rem; }
.blink { animation: blink 1s step-end infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.empty-state { color: #444; text-align: center; padding: 2rem; border: 1px solid #1a1a1a; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
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

.col-id   { color: #444; width: 40px; }
.col-name { color: #00ffff; }
.col-msg  { color: #00bb30; max-width: 240px; }
.col-date { color: #444; white-space: nowrap; }

.site-link { color: #00ff41; font-size: 0.72rem; }
.no-site   { color: #333; }

.action-btn {
  background: transparent;
  border: 1px solid;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  padding: 0.15rem 0.35rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-danger { border-color: #ff0040; color: #ff0040; }
.btn-danger:hover { background: #ff0040; color: #0a0a0a; }

.confirm-inline { font-size: 0.72rem; color: #ff8800; }
.confirm-y, .confirm-n {
  background: transparent;
  border: 1px solid;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  padding: 0.1rem 0.25rem;
  cursor: pointer;
  margin-left: 0.2rem;
}
.confirm-y { border-color: #00ff41; color: #00ff41; }
.confirm-y:hover { background: #00ff41; color: #0a0a0a; }
.confirm-n { border-color: #ff0040; color: #ff0040; }
.confirm-n:hover { background: #ff0040; color: #0a0a0a; }
</style>
