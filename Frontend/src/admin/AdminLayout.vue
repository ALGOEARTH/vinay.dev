<template>
  <div class="admin-shell">
    <!-- CRT Scanlines -->
    <div class="scanlines" aria-hidden="true"></div>

    <!-- Top Header -->
    <header class="admin-header">
      <span class="header-logo">⚡ CONTROL ROOM 1996</span>
      <div class="header-right">
        <span class="header-user" v-if="user">[ {{ (user as any).username?.toUpperCase() }} ]</span>
        <button class="logout-btn" @click="handleLogout">[ LOGOUT ]</button>
      </div>
    </header>

    <div class="admin-body">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="sidebar-title">NAVIGATION</div>
        <ul class="nav-list">
          <li>
            <router-link to="/admin/dashboard" class="nav-item" active-class="nav-active">
              📊 DASHBOARD
            </router-link>
          </li>
          <li>
            <router-link to="/admin/users" class="nav-item" active-class="nav-active">
              👥 USERS
            </router-link>
          </li>
          <li>
            <router-link to="/admin/content" class="nav-item" active-class="nav-active">
              📝 CONTENT
            </router-link>
          </li>
          <li>
            <router-link to="/admin/guestbook" class="nav-item" active-class="nav-active">
              📖 GUESTBOOK MGMT
            </router-link>
          </li>
        </ul>
        <div class="sidebar-status">
          <span class="status-dot">●</span> SYSTEM ONLINE
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from './useAdminAuth'

const router = useRouter()
const { user, logout, verifySession } = useAdminAuth()

onMounted(async () => {
  const valid = await verifySession()
  if (!valid) {
    router.push('/admin/login')
  }
})

function handleLogout() {
  logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: #0a0a0a;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  position: relative;
}

.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.12) 2px,
    rgba(0, 0, 0, 0.12) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.2rem;
  border-bottom: 1px solid #1a1a1a;
  background: #0d0d0d;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.header-logo {
  color: #00ffff;
  font-size: 0.95rem;
  letter-spacing: 2px;
  text-shadow: 0 0 8px #00ffff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-user {
  color: #00ff41;
  font-size: 0.8rem;
}

.logout-btn {
  background: transparent;
  border: 1px solid #ff0040;
  color: #ff0040;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
  background: #ff0040;
  color: #0a0a0a;
}

.admin-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #1a1a1a;
  background: #0d0d0d;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.sidebar-title {
  color: #444;
  font-size: 0.7rem;
  letter-spacing: 2px;
  padding: 0 1rem 0.8rem;
  border-bottom: 1px solid #1a1a1a;
  margin-bottom: 0.5rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.nav-list li {
  width: 100%;
}

.nav-item {
  display: block;
  padding: 0.6rem 1rem;
  color: #00ff41;
  text-decoration: none;
  font-size: 0.8rem;
  letter-spacing: 1px;
  transition: background 0.15s, color 0.15s;
  border-left: 2px solid transparent;
}

.nav-item:hover {
  background: #111;
  color: #00ffff;
}

.nav-active {
  color: #00ffff !important;
  background: #111 !important;
  border-left-color: #00ffff !important;
  text-shadow: 0 0 6px #00ffff;
}

.sidebar-status {
  padding: 1rem;
  font-size: 0.75rem;
  color: #226622;
  border-top: 1px solid #1a1a1a;
  margin-top: auto;
}

.status-dot {
  color: #00ff41;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.admin-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}
</style>
