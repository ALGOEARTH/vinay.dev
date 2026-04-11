<template>
  <div class="crt-screen">
    <!-- CRT Scanline Overlay -->
    <div class="scanlines" aria-hidden="true"></div>

    <div class="terminal-container">
      <!-- ASCII Header -->
      <pre class="ascii-header">
╔═══════════════════════════════════╗
║   ██████╗ ██████╗ ███╗  ██╗      ║
║  ██╔════╝██╔═══██╗████╗ ██║      ║
║  ██║     ██║   ██║██╔██╗██║      ║
║  ██║     ██║   ██║██║╚████║      ║
║  ╚██████╗╚██████╔╝██║ ╚███║      ║
║   ╚═════╝ ╚═════╝ ╚═╝  ╚══╝      ║
║      CONTROL ROOM  1996           ║
╚═══════════════════════════════════╝</pre>

      <!-- Boot Sequence -->
      <div class="boot-log">
        <div v-for="(line, i) in bootLines" :key="i" class="boot-line">{{ line }}</div>
      </div>

      <!-- Login Form -->
      <div v-if="showForm" class="login-box">
        <div class="login-title">━━━ AUTHENTICATION REQUIRED ━━━</div>
        <form @submit.prevent="handleLogin" class="login-form" autocomplete="off">
          <div class="field">
            <label class="field-label">USERNAME:</label>
            <input
              v-model="username"
              type="text"
              class="field-input"
              placeholder="enter username"
              autocomplete="username"
              :disabled="loading"
            />
          </div>
          <div class="field">
            <label class="field-label">PASSWORD:</label>
            <input
              v-model="password"
              type="password"
              class="field-input"
              placeholder="enter password"
              autocomplete="current-password"
              :disabled="loading"
            />
          </div>
          <div v-if="error" class="error-msg">⚠ {{ error }}</div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading">[ AUTHENTICATING... ]</span>
            <span v-else>[ ► ENTER SYSTEM ]</span>
          </button>
        </form>
      </div>

      <!-- Blinking cursor -->
      <div class="cursor-line"><span class="blink-cursor">█</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth, isAuthenticated } from './useAdminAuth'

const router = useRouter()
const { login } = useAdminAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showForm = ref(false)
const bootLines = ref<string[]>([])

const BOOT_SEQUENCE = [
  'BIOS v1.996 initializing...',
  'RAM check: 640K OK',
  'LOADING KERNEL MODULES...',
  'NETWORK: 28.8K MODEM DETECTED',
  'LOADING CONTROL ROOM v1.996...',
  'SECURITY SUBSYSTEM ACTIVE',
  '> READY. AWAITING CREDENTIALS.'
]

onMounted(async () => {
  if (isAuthenticated.value) {
    router.push('/admin/dashboard')
    return
  }
  // Boot sequence animation
  for (let i = 0; i < BOOT_SEQUENCE.length; i++) {
    await delay(300 + Math.random() * 200)
    bootLines.value.push(BOOT_SEQUENCE[i])
  }
  await delay(400)
  showForm.value = true
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function handleLogin() {
  error.value = ''
  if (!username.value.trim() || !password.value) {
    error.value = 'USERNAME AND PASSWORD REQUIRED'
    return
  }
  loading.value = true
  try {
    const API = import.meta.env.VITE_API_BASE || '/api'
    const res = await fetch(`${API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value.trim(), password: password.value })
    })
    const data = await res.json()
    if (data.success && data.token) {
      login(data.token, data.user)
      router.push('/admin/dashboard')
    } else {
      error.value = data.message?.toUpperCase() || 'ACCESS DENIED'
    }
  } catch {
    error.value = 'CONNECTION FAILED. RETRY.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.crt-screen {
  min-height: 100vh;
  background: #0a0a0a;
  color: #00ff41;
  font-family: 'Courier New', 'Share Tech Mono', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

.terminal-container {
  width: 100%;
  max-width: 640px;
  padding: 2rem;
}

.ascii-header {
  color: #00ff41;
  font-size: 0.72rem;
  line-height: 1.3;
  margin: 0 0 1.5rem;
  text-shadow: 0 0 8px #00ff41;
  white-space: pre;
}

.boot-log {
  margin-bottom: 1.5rem;
  min-height: 7rem;
}

.boot-line {
  color: #00bb30;
  font-size: 0.85rem;
  line-height: 1.6;
  text-shadow: 0 0 4px #00bb30;
}

.login-box {
  border: 1px solid #00ff41;
  padding: 1.5rem;
  box-shadow: 0 0 16px rgba(0, 255, 65, 0.25), inset 0 0 16px rgba(0, 255, 65, 0.04);
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.login-title {
  color: #00ffff;
  font-size: 0.9rem;
  margin-bottom: 1.2rem;
  text-align: center;
  letter-spacing: 1px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.78rem;
  color: #00ff41;
  letter-spacing: 1px;
}

.field-input {
  background: #0d0d0d;
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  padding: 0.45rem 0.7rem;
  outline: none;
  transition: box-shadow 0.2s;
}

.field-input:focus {
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
  border-color: #00ffff;
}

.field-input::placeholder {
  color: #226622;
}

.error-msg {
  color: #ff0040;
  font-size: 0.82rem;
  text-shadow: 0 0 6px #ff0040;
  animation: flicker 0.15s 3;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.submit-btn {
  background: transparent;
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  letter-spacing: 2px;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: #00ff41;
  color: #0a0a0a;
  box-shadow: 0 0 14px rgba(0, 255, 65, 0.7);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cursor-line {
  margin-top: 1rem;
  height: 1.2rem;
}

.blink-cursor {
  color: #00ff41;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
</style>
