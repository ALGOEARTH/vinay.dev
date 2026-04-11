<template>
  <AdminLayout>
    <div class="content-page">
      <div class="page-title">╔══ CONTENT MANAGEMENT ══╗</div>

      <!-- Flash Messages -->
      <div v-if="flashMsg" :class="['flash', flashType]">{{ flashMsg }}</div>

      <!-- Create/Edit Form -->
      <div v-if="showForm" class="editor-box">
        <div class="editor-title">{{ editingPost ? '━━ EDITING POST ━━' : '━━ NEW POST ━━' }}</div>
        <div class="form-group">
          <label class="field-label">TITLE:</label>
          <input v-model="form.title" type="text" class="field-input" placeholder="Post title..." />
        </div>
        <div class="form-group">
          <label class="field-label">STATUS:</label>
          <div class="toggle-group">
            <button
              class="toggle-btn"
              :class="{ 'toggle-active': form.status === 'draft' }"
              @click="form.status = 'draft'"
            >[ DRAFT ]</button>
            <button
              class="toggle-btn"
              :class="{ 'toggle-active': form.status === 'published' }"
              @click="form.status = 'published'"
            >[ PUBLISHED ]</button>
          </div>
        </div>
        <div class="form-group">
          <label class="field-label">CONTENT (markdown supported):</label>
          <textarea
            v-model="form.content"
            class="content-textarea"
            placeholder="Write your content here..."
            rows="12"
          ></textarea>
        </div>
        <div class="form-actions">
          <button class="action-btn btn-green" @click="savePost" :disabled="saving">
            {{ saving ? '[ SAVING... ]' : '[ ► SAVE POST ]' }}
          </button>
          <button class="action-btn btn-cancel" @click="cancelForm">[ ◄ CANCEL ]</button>
        </div>
      </div>

      <!-- List View -->
      <template v-else>
        <div class="list-header">
          <button class="create-btn" @click="openCreateForm">[ + NEW POST ]</button>
        </div>

        <div v-if="loading" class="loading-state">
          <span class="blink">[ LOADING POSTS... ]</span>
        </div>

        <div v-else-if="posts.length === 0" class="empty-state">
          NO POSTS FOUND. CREATE YOUR FIRST POST.
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>STATUS</th>
              <th>AUTHOR</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td class="col-title">{{ post.title }}</td>
              <td>
                <span :class="['status-badge', post.status === 'published' ? 'status-pub' : 'status-draft']">
                  {{ post.status.toUpperCase() }}
                </span>
              </td>
              <td class="col-author">{{ post.author ?? '—' }}</td>
              <td class="col-date">{{ formatDate(post.created_at) }}</td>
              <td class="col-actions">
                <button class="action-btn btn-cyan" @click="openEditForm(post)">[EDIT]</button>
                <button
                  v-if="confirmDelete !== post.id"
                  class="action-btn btn-danger"
                  @click="confirmDelete = post.id"
                >[DELETE]</button>
                <span v-else class="confirm-inline">
                  CONFIRM?
                  <button class="confirm-y" @click="deletePost(post.id)">[ Y ]</button>
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
import { ref, onMounted, reactive } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { authFetch } from './useAdminAuth'

interface Post {
  id: number
  title: string
  slug: string
  content: string
  status: string
  author: string | null
  created_at: string
  updated_at: string
}

const posts = ref<Post[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const editingPost = ref<Post | null>(null)
const confirmDelete = ref<number | null>(null)
const flashMsg = ref('')
const flashType = ref('flash-ok')

const form = reactive({ title: '', content: '', status: 'draft' })

function flash(msg: string, type: 'flash-ok' | 'flash-err' = 'flash-ok') {
  flashMsg.value = msg
  flashType.value = type
  setTimeout(() => { flashMsg.value = '' }, 3000)
}

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
  } catch {
    return iso
  }
}

async function loadPosts() {
  loading.value = true
  try {
    const res = await authFetch('/admin/posts')
    const data = await res.json()
    if (data.success) posts.value = data.posts
  } catch {
    flash('FAILED TO LOAD POSTS', 'flash-err')
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingPost.value = null
  form.title = ''
  form.content = ''
  form.status = 'draft'
  showForm.value = true
}

function openEditForm(post: Post) {
  editingPost.value = post
  form.title = post.title
  form.content = post.content
  form.status = post.status
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingPost.value = null
}

async function savePost() {
  if (!form.title.trim()) { flash('TITLE REQUIRED', 'flash-err'); return }
  if (!form.content.trim()) { flash('CONTENT REQUIRED', 'flash-err'); return }
  saving.value = true
  try {
    let res: Response
    if (editingPost.value) {
      res = await authFetch(`/admin/posts/${editingPost.value.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: form.title, content: form.content, status: form.status })
      })
    } else {
      res = await authFetch('/admin/posts', {
        method: 'POST',
        body: JSON.stringify({ title: form.title, content: form.content, status: form.status })
      })
    }
    const data = await res.json()
    if (data.success) {
      flash(editingPost.value ? 'POST UPDATED' : 'POST CREATED')
      showForm.value = false
      editingPost.value = null
      await loadPosts()
    } else {
      flash(data.message?.toUpperCase() || 'ERROR', 'flash-err')
    }
  } catch {
    flash('SERVER ERROR', 'flash-err')
  } finally {
    saving.value = false
  }
}

async function deletePost(id: number) {
  confirmDelete.value = null
  try {
    const res = await authFetch(`/admin/posts/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      posts.value = posts.value.filter(p => p.id !== id)
      flash('POST DELETED')
    } else {
      flash(data.message?.toUpperCase() || 'ERROR', 'flash-err')
    }
  } catch {
    flash('SERVER ERROR', 'flash-err')
  }
}

onMounted(loadPosts)
</script>

<style scoped>
.content-page {
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

.list-header { margin-bottom: 1rem; }

.create-btn {
  background: transparent;
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  letter-spacing: 1px;
  transition: background 0.15s, color 0.15s;
}
.create-btn:hover { background: #00ff41; color: #0a0a0a; }

.loading-state { text-align: center; padding: 3rem; }
.blink { animation: blink 1s step-end infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.empty-state {
  color: #444;
  text-align: center;
  padding: 2rem;
  border: 1px solid #1a1a1a;
  font-size: 0.85rem;
}

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

.col-title  { color: #00ff41; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.col-author { color: #00ffff; }
.col-date   { color: #444; }

.status-badge {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border: 1px solid;
}
.status-pub   { border-color: #00ff41; color: #00ff41; }
.status-draft { border-color: #444; color: #444; }

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
  margin-left: 0.2rem;
}
.confirm-y { border-color: #00ff41; color: #00ff41; }
.confirm-y:hover { background: #00ff41; color: #0a0a0a; }
.confirm-n { border-color: #ff0040; color: #ff0040; }
.confirm-n:hover { background: #ff0040; color: #0a0a0a; }

/* Editor Form */
.editor-box {
  border: 1px solid #1a1a1a;
  padding: 1.2rem;
  background: #0d0d0d;
}
.editor-title {
  color: #00ffff;
  font-size: 0.85rem;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}
.form-group { margin-bottom: 0.9rem; }
.field-label {
  display: block;
  font-size: 0.75rem;
  color: #00ff41;
  letter-spacing: 1px;
  margin-bottom: 0.3rem;
}
.field-input {
  width: 100%;
  background: #0a0a0a;
  border: 1px solid #226622;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  padding: 0.4rem 0.6rem;
  outline: none;
  box-sizing: border-box;
}
.field-input:focus { border-color: #00ff41; box-shadow: 0 0 6px rgba(0,255,65,0.3); }

.toggle-group { display: flex; gap: 0.5rem; }
.toggle-btn {
  background: transparent;
  border: 1px solid #226622;
  color: #226622;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  transition: all 0.15s;
}
.toggle-active {
  border-color: #00ff41 !important;
  color: #00ff41 !important;
  background: #001a00 !important;
}

.content-textarea {
  width: 100%;
  background: #0a0a0a;
  border: 1px solid #226622;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  padding: 0.6rem;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
}
.content-textarea:focus { border-color: #00ff41; box-shadow: 0 0 6px rgba(0,255,65,0.3); }

.form-actions { display: flex; gap: 0.8rem; margin-top: 1rem; }
.btn-green { border-color: #00ff41; color: #00ff41; }
.btn-green:hover:not(:disabled) { background: #00ff41; color: #0a0a0a; }
.btn-green:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { border-color: #444; color: #444; }
.btn-cancel:hover { background: #444; color: #0a0a0a; }
</style>
