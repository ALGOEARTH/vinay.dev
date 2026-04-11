<template>
  <div class="app">
    <!-- Navigation -->
    <nav class="nav-menu">
      <div class="container">
        <div class="nav-items">
          <router-link to="/" class="nav-link">[ ← HOME ]</router-link>
          <a href="https://github.com/vinayk94" class="nav-link" target="_blank" rel="noopener">[ GITHUB ]</a>
          <a href="https://linkedin.com/in/vinayk94" class="nav-link" target="_blank" rel="noopener">[ LINKEDIN ]</a>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header class="header">
      <div class="container">
        <h1 class="page-title">[ GUESTBOOK ]</h1>
        <p class="subtitle">Sign the virtual guestbook — est. 1996</p>
        <div class="header-border"></div>
      </div>
    </header>

    <main class="main">
      <div class="container">

        <!-- Sign Form -->
        <section class="section">
          <h2 class="section-title">
            <span class="title-brackets">[</span>
            <span class="title-text">SIGN THE GUESTBOOK</span>
            <span class="title-brackets">]</span>
          </h2>

          <div class="content-box">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="terminal-btn close"></span>
                <span class="terminal-btn minimize"></span>
                <span class="terminal-btn maximize"></span>
              </div>
              <span class="terminal-title">sign.exe</span>
            </div>
            <div class="terminal-content">
              <div v-if="submitSuccess" class="success-msg">
                ✓ ENTRY SAVED! WELCOME TO THE GUESTBOOK.
              </div>
              <div v-if="submitError" class="error-msg">⚠ {{ submitError }}</div>

              <form @submit.prevent="handleSubmit" v-if="!submitSuccess">
                <div class="field">
                  <label class="field-label">NAME: <span class="required">*</span></label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="field-input"
                    placeholder="Your name"
                    maxlength="50"
                  />
                </div>
                <div class="field">
                  <label class="field-label">MESSAGE: <span class="required">*</span></label>
                  <textarea
                    v-model="form.message"
                    class="field-textarea"
                    placeholder="Leave a message..."
                    maxlength="500"
                    rows="4"
                  ></textarea>
                  <div class="char-count">{{ form.message.length }}/500</div>
                </div>
                <div class="field">
                  <label class="field-label">WEBSITE: <span class="optional">(optional)</span></label>
                  <input
                    v-model="form.website"
                    type="url"
                    class="field-input"
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div class="rate-limit-note">⚠ Limited to 3 entries per hour per IP address.</div>
                <button type="submit" class="submit-btn" :disabled="submitting">
                  <span v-if="submitting">[ SUBMITTING... ]</span>
                  <span v-else>[ ► SIGN GUESTBOOK ]</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        <!-- Entries List -->
        <section class="section">
          <h2 class="section-title">
            <span class="title-brackets">[</span>
            <span class="title-text">ENTRIES</span>
            <span class="title-brackets">]</span>
            <span class="entry-count" v-if="entries.length">({{ entries.length }})</span>
          </h2>

          <div v-if="loadingEntries" class="loading-state">
            [ LOADING GUESTBOOK... ]
          </div>

          <div v-else-if="entries.length === 0" class="content-box">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="terminal-btn close"></span>
                <span class="terminal-btn minimize"></span>
                <span class="terminal-btn maximize"></span>
              </div>
              <span class="terminal-title">entries.txt</span>
            </div>
            <div class="terminal-content">
              <p class="empty-state">NO ENTRIES YET. BE THE FIRST TO SIGN!</p>
            </div>
          </div>

          <div v-else class="entries-list">
            <div v-for="entry in entries" :key="entry.id" class="content-box entry-card">
              <div class="terminal-header">
                <div class="terminal-buttons">
                  <span class="terminal-btn close"></span>
                  <span class="terminal-btn minimize"></span>
                  <span class="terminal-btn maximize"></span>
                </div>
                <span class="terminal-title">
                  ▶ {{ entry.name }}
                  <a
                    v-if="entry.website"
                    :href="entry.website"
                    class="entry-website"
                    target="_blank"
                    rel="noopener noreferrer"
                  >({{ shortenUrl(entry.website) }})</a>
                </span>
              </div>
              <div class="terminal-content">
                <p class="entry-message">{{ entry.message }}</p>
                <div class="entry-date">{{ formatDate(entry.created_at) }}</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>[ GUESTBOOK ] — Part of Vinay's 90s Portfolio</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface GuestbookEntry {
  id: number
  name: string
  message: string
  website: string | null
  created_at: string
}

const API = import.meta.env.VITE_API_BASE || '/api'

const entries = ref<GuestbookEntry[]>([])
const loadingEntries = ref(true)
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const form = reactive({ name: '', message: '', website: '' })

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch {
    return iso
  }
}

function shortenUrl(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

async function loadEntries() {
  loadingEntries.value = true
  try {
    const res = await fetch(`${API}/guestbook`)
    const data = await res.json()
    if (data.success) entries.value = data.entries
  } catch (err) {
    console.error('Failed to load guestbook entries:', err)
  } finally {
    loadingEntries.value = false
  }
}

async function handleSubmit() {
  submitError.value = ''
  if (!form.name.trim() || form.name.trim().length < 2) {
    submitError.value = 'NAME MUST BE AT LEAST 2 CHARACTERS'
    return
  }
  if (!form.message.trim() || form.message.trim().length < 5) {
    submitError.value = 'MESSAGE MUST BE AT LEAST 5 CHARACTERS'
    return
  }
  submitting.value = true
  try {
    const body: Record<string, string> = {
      name: form.name.trim(),
      message: form.message.trim()
    }
    if (form.website.trim()) body.website = form.website.trim()

    const res = await fetch(`${API}/guestbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (data.success && data.entry) {
      entries.value.unshift(data.entry)
      submitSuccess.value = true
      form.name = ''
      form.message = ''
      form.website = ''
    } else {
      submitError.value = data.message?.toUpperCase() || 'FAILED TO SUBMIT. PLEASE TRY AGAIN.'
    }
  } catch {
    submitError.value = 'CONNECTION ERROR. PLEASE TRY AGAIN.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadEntries)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  font-family: 'Courier New', Courier, monospace;
  background: #ffffff;
  color: #000000;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Navigation */
.nav-menu {
  border-bottom: 2px solid #000;
  padding: 0.6rem 0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-items {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-link {
  color: #000;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: bold;
  letter-spacing: 1px;
  transition: background 0.15s;
  padding: 0.1rem 0.3rem;
}

.nav-link:hover {
  background: #000;
  color: #fff;
}

/* Header */
.header {
  padding: 2rem 0 1rem;
  border-bottom: 2px solid #000;
}

.page-title {
  font-size: 2rem;
  letter-spacing: 4px;
  margin: 0 0 0.4rem;
}

.subtitle {
  font-size: 0.85rem;
  color: #555;
  margin: 0;
}

.header-border {
  border-bottom: 1px solid #000;
  margin-top: 1rem;
}

/* Main */
.main {
  padding: 1.5rem 0 2rem;
}

/* Sections */
.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.title-brackets { color: #000; }
.title-text { color: #000; }
.entry-count { color: #555; font-size: 0.8rem; margin-left: 0.4rem; }

/* Content Box */
.content-box {
  border: 2px solid #000;
  margin-bottom: 0.8rem;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  border-bottom: 1px solid #000;
  background: #f0f0f0;
}

.terminal-buttons {
  display: flex;
  gap: 0.3rem;
}

.terminal-btn {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid #000;
}

.terminal-btn.close    { background: #ff5f56; }
.terminal-btn.minimize { background: #ffbd2e; }
.terminal-btn.maximize { background: #27c93f; }

.terminal-title {
  font-size: 0.78rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.entry-website {
  color: #555;
  font-size: 0.72rem;
  text-decoration: none;
  margin-left: 0.4rem;
}
.entry-website:hover { text-decoration: underline; }

.terminal-content {
  padding: 0.8rem;
}

/* Form */
.field {
  margin-bottom: 0.8rem;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 0.25rem;
}

.required { color: #cc0000; }
.optional  { color: #888; font-weight: normal; }

.field-input, .field-textarea {
  width: 100%;
  border: 1px solid #000;
  background: #fff;
  font-family: 'Courier New', monospace;
  font-size: 0.88rem;
  padding: 0.4rem 0.6rem;
  outline: none;
  transition: box-shadow 0.15s;
  display: block;
}

.field-input:focus, .field-textarea:focus {
  box-shadow: 0 0 0 2px #000;
}

.field-textarea { resize: vertical; line-height: 1.5; }

.char-count {
  text-align: right;
  font-size: 0.7rem;
  color: #888;
  margin-top: 0.15rem;
}

.rate-limit-note {
  font-size: 0.72rem;
  color: #888;
  margin-bottom: 0.6rem;
}

.submit-btn {
  background: #000;
  color: #fff;
  border: 2px solid #000;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  letter-spacing: 1px;
  transition: background 0.15s, color 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background: #fff;
  color: #000;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-msg {
  border: 1px solid #000;
  background: #f0f0f0;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
}

.error-msg {
  border: 1px solid #cc0000;
  color: #cc0000;
  padding: 0.4rem 0.6rem;
  font-size: 0.82rem;
  margin-bottom: 0.6rem;
  background: #fff8f8;
}

/* Loading */
.loading-state {
  padding: 2rem;
  text-align: center;
  font-size: 0.85rem;
  color: #555;
  border: 1px dashed #ccc;
}

.empty-state {
  color: #555;
  font-size: 0.85rem;
  margin: 0;
}

/* Entries */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.entry-message {
  font-size: 0.88rem;
  line-height: 1.6;
  margin: 0 0 0.5rem;
  white-space: pre-wrap;
}

.entry-date {
  font-size: 0.7rem;
  color: #888;
  text-align: right;
}

/* Footer */
.footer {
  border-top: 2px solid #000;
  padding: 1rem 0;
  font-size: 0.75rem;
  color: #555;
  text-align: center;
}
</style>
