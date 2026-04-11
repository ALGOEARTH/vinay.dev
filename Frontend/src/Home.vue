<template>
  <div class="app">
    <!-- Animated Header Section -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="name-container">
            <h1 class="name">{{ personalInfo.name }}</h1>
            <div class="blinking-cursor">_</div>
          </div>
          <p class="title">{{ personalInfo.title }}</p>
          <div class="ascii-art">
            <pre>{{ asciiArt }}</pre>
          </div>
          <div class="status-bar">
            <span class="status-item">● ONLINE</span>
            <span class="status-item">{{ currentTime }}</span>
            <span class="status-item">EST. 2023</span>
          </div>
        </div>
      </div>
      <div class="header-border"></div>
    </header>

    <!-- Navigation Menu -->
    <nav class="nav-menu">
      <div class="container">
        <div class="nav-items">
          <a href="#about" class="nav-link" @click="scrollToSection('about')">[ ABOUT ]</a>
          <a href="#skills" class="nav-link" @click="scrollToSection('skills')">[ SKILLS ]</a>
          <a href="#projects" class="nav-link" @click="scrollToSection('projects')">[ PROJECTS ]</a>
          <router-link to="/certifications" class="nav-link">[ CERTIFICATIONS ]</router-link>
          <router-link to="/business" class="nav-link">[ BUSINESS ]</router-link>
          <a href="#contact" class="nav-link" @click="scrollToSection('contact')">[ CONTACT ]</a>
          <router-link to="/guestbook" class="nav-link">[ GUESTBOOK ]</router-link>
          <a href="/admin/login" class="nav-link" target="_blank">[ ADMIN ]</a>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main">
      <div class="container">
        <!-- About Section -->
        <section id="about" class="section">
          <h2 class="section-title">
            <span class="title-brackets">[</span>
            <span class="title-text">ABOUT</span>
            <span class="title-brackets">]</span>
          </h2>
          <div class="content-box" :class="{ 'box-minimized': windowStates.about === 'minimized', 'box-maximized': windowStates.about === 'maximized', 'box-closed': windowStates.about === 'closed' }">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="terminal-btn close" title="Close" @click="closeWindow('about')"></span>
                <span class="terminal-btn minimize" title="Minimize" @click="minimizeWindow('about')"></span>
                <span class="terminal-btn maximize" title="Maximize" @click="maximizeWindow('about')"></span>
              </div>
              <span class="terminal-title">about.txt</span>
              <span v-if="windowStates.about === 'minimized'" class="restore-hint" @click="restoreWindow('about')">[click to restore]</span>
            </div>
            <div class="terminal-content" v-show="windowStates.about !== 'minimized'">
              <p class="intro">{{ personalInfo.intro }}</p>
              <div class="stats-grid">
                <div class="stat-item" v-for="(stat, index) in personalStats" :key="index">
                  <span class="stat-icon">{{ stat.icon }}</span>
                  <div class="stat-info">
                    <span class="stat-label">{{ stat.label }}</span>
                    <span class="stat-value">{{ stat.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Skills Section -->
        <section id="skills" class="section">
          <h2 class="section-title">
            <span class="title-brackets">[</span>
            <span class="title-text">SKILLS</span>
            <span class="title-brackets">]</span>
          </h2>
          <div class="content-box" :class="{ 'box-minimized': windowStates.skills === 'minimized', 'box-maximized': windowStates.skills === 'maximized', 'box-closed': windowStates.skills === 'closed' }">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="terminal-btn close" title="Close" @click="closeWindow('skills')"></span>
                <span class="terminal-btn minimize" title="Minimize" @click="minimizeWindow('skills')"></span>
                <span class="terminal-btn maximize" title="Maximize" @click="maximizeWindow('skills')"></span>
              </div>
              <span class="terminal-title">skills.exe</span>
              <span v-if="windowStates.skills === 'minimized'" class="restore-hint" @click="restoreWindow('skills')">[click to restore]</span>
            </div>
            <div class="terminal-content" v-show="windowStates.skills !== 'minimized'">
              <div class="skills-container">
                <div class="skill-category" v-for="category in skills" :key="category.name">
                  <h3 class="category-header">
                    <span class="folder-icon">📁</span>
                    {{ category.name }}
                  </h3>
                  <div class="skill-items">
                    <div class="skill-item" v-for="skill in category.items" :key="skill.name">
                      <div class="skill-name-wrapper">
                        <span class="skill-name" :title="skill.name">{{ skill.name.length > 10 ? skill.name.slice(0, 7) + '...' : skill.name }}</span>
                        <div class="skill-hover-card" v-if="skill.resources && skill.resources.length">
                          <strong>{{ skill.name }}</strong>
                          <a v-for="res in skill.resources" :key="res.url" :href="res.url" target="_blank" rel="noopener" class="skill-resource-link">{{ res.label }}</a>
                        </div>
                        <div class="skill-hover-card" v-else>
                          <strong>{{ skill.name }}</strong>
                          <span class="skill-level-text">Proficiency: {{ skill.level }}%</span>
                        </div>
                      </div>
                      <div class="skill-bar">
                        <div class="skill-progress" :style="{ width: skill.level + '%' }">
                          <span class="skill-percentage-inside">{{ skill.level }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Projects Section -->
        <section id="projects" class="section">
          <h2 class="section-title">
            <span class="title-brackets">[</span>
            <span class="title-text">PROJECTS</span>
            <span class="title-brackets">]</span>
          </h2>
          <div class="content-box" :class="{ 'box-minimized': windowStates.projects === 'minimized', 'box-maximized': windowStates.projects === 'maximized', 'box-closed': windowStates.projects === 'closed' }">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="terminal-btn close" title="Close" @click="closeWindow('projects')"></span>
                <span class="terminal-btn minimize" title="Minimize" @click="minimizeWindow('projects')"></span>
                <span class="terminal-btn maximize" title="Maximize" @click="maximizeWindow('projects')"></span>
              </div>
              <span class="terminal-title">projects.dir</span>
              <span v-if="windowStates.projects === 'minimized'" class="restore-hint" @click="restoreWindow('projects')">[click to restore]</span>
            </div>
            <div class="terminal-content" v-show="windowStates.projects !== 'minimized'">
              <div class="projects-grid">
                <div class="project-item" v-for="project in projects" :key="project.name">
                  <div class="project-header">
                    <span class="project-icon">💾</span>
                    <h4 class="project-name">{{ project.name }}</h4>
                  </div>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-tech">
                    <span class="tech-tag" v-for="tech in project.technologies" :key="tech">{{ tech }}</span>
                  </div>
                  <div class="project-links">
                    <a v-for="link in project.links" :href="link.url" class="project-link" target="_blank" rel="noopener">{{ link.label }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="section">
          <h2 class="section-title">
            <span class="title-brackets">[</span>
            <span class="title-text">CONTACT</span>
            <span class="title-brackets">]</span>
          </h2>
          <div class="content-box" :class="{ 'box-minimized': windowStates.contact === 'minimized', 'box-maximized': windowStates.contact === 'maximized', 'box-closed': windowStates.contact === 'closed' }">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="terminal-btn close" title="Close" @click="closeWindow('contact')"></span>
                <span class="terminal-btn minimize" title="Minimize" @click="minimizeWindow('contact')"></span>
                <span class="terminal-btn maximize" title="Maximize" @click="maximizeWindow('contact')"></span>
              </div>
              <span class="terminal-title">contact.exe</span>
              <span v-if="windowStates.contact === 'minimized'" class="restore-hint" @click="restoreWindow('contact')">[click to restore]</span>
            </div>
            <div class="terminal-content" v-show="windowStates.contact !== 'minimized'">
              <div class="contact-layout">
                <div class="contact-info">
                  <h3 class="contact-header">📞 GET IN TOUCH</h3>
                  <div class="contact-methods">
                    <div class="contact-method" v-for="contact in contactInfo" :key="contact.type">
                      <span class="contact-icon">{{ contact.icon }}</span>
                      <div class="contact-details">
                        <span class="contact-label">{{ contact.label }}</span>
                        <span class="contact-value">{{ contact.value }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="social-links">
                    <h4 class="social-header">🌐 FIND ME ONLINE</h4>
                    <div class="social-grid">
                      <a :href="social.url" class="social-link" v-for="social in socialLinks" :key="social.name" target="_blank" rel="noopener">
                        <span class="social-icon">{{ social.icon }}</span>
                        <span class="social-name">{{ social.name }}</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div class="contact-form-container">
                  <h3 class="form-header">📧 SEND MESSAGE</h3>
                  <form @submit.prevent="submitForm" class="contact-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">NAME:</label>
                        <input 
                          type="text" 
                          v-model="form.name" 
                          :class="['form-input', { error: errors.name }]"
                          placeholder="Enter your name..."
                          required 
                        />
                        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
                      </div>
                      
                      <div class="form-group">
                        <label class="form-label">EMAIL:</label>
                        <input 
                          type="email" 
                          v-model="form.email" 
                          :class="['form-input', { error: errors.email }]"
                          placeholder="your@email.com"
                          required 
                        />
                        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">MESSAGE:</label>
                      <textarea 
                        v-model="form.message" 
                        :class="['form-textarea', { error: errors.message }]"
                        rows="5" 
                        placeholder="Type your message here..."
                        required
                      ></textarea>
                      <span v-if="errors.message" class="error-text">{{ errors.message }}</span>
                    </div>
                    
                    <button type="submit" :disabled="isSubmitting" class="submit-btn">
                      <span v-if="isSubmitting" class="loading-spinner">⟳</span>
                      {{ isSubmitting ? 'SENDING...' : '► SEND MESSAGE' }}
                    </button>
                    
                    <div v-if="submitMessage" :class="['submit-message', submitStatus]">
                      <span class="message-icon">{{ submitStatus === 'success' ? '✓' : '✗' }}</span>
                      {{ submitMessage }}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Enhanced Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-left">
            <p class="copyright">&copy; {{ currentYear }} {{ personalInfo.name }}</p>
            <p class="tech-stack">Built with Vue.js & Express.js</p>
          </div>
          <div class="footer-center">
            <div class="visitor-counter">
              <span class="counter-label">VISITORS:</span>
              <span class="counter-value">{{ String(visitorCount).padStart(6, '0') }}</span>
            </div>
          </div>
          <div class="footer-right">
            <div class="last-updated">
              <span class="update-label">LAST UPDATED:</span>
              <span class="update-date">{{ lastUpdated }}</span>
            </div>
          </div>
        </div>
        <div class="footer-border"></div>
      </div>
    </footer>

    <!-- Konami Code Easter Egg Overlay -->
    <div v-if="konamiActivated" class="konami-overlay" @click.self="konamiActivated = false">
      <div class="konami-box">
        <pre class="konami-art">
 ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★
 ★                         ★
 ★  CHEAT CODE ACTIVATED!  ★
 ★                         ★
 ★  ↑ ↑ ↓ ↓ ← → ← → B A  ★
 ★                         ★
 ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★</pre>
        <p class="konami-msg">YOU FOUND THE SECRET!</p>
        <p class="konami-sub">+30 LIVES GRANTED. ENJOY THE PORTFOLIO, PLAYER 1.</p>
        <button class="konami-close" @click="konamiActivated = false">[ CLOSE ]</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// Personal Information
const personalInfo = {
  name: 'Vinay Yadav',
  title: 'Student & Digital Craftsman',
  intro: 'Welcome to my corner of the digital universe! I\'m a passionate Student, developer , Digital Marketer ,  who believes in World of Numbers, efficient code and creating meaningful digital experiences while having a passion for learning and growing. This website is a tribute to the golden age of the web - when simplicity met functionality and every pixel had purpose.'
}

// ASCII Art
const asciiArt = `
    ╔══════════════════════════════╗
    ║     WELCOME TO MY WORLD!     ║
    ║                              ║
    ║  ┌─┐┌─┐┌┬┐┌─┐  ┌─┐┌┐┌┌┬┐    ║
    ║  │  │ │ ││├┤   ├─┤│││ ││    ║
    ║  └─┘└─┘─┴┘└─┘  ┴ ┴┘└┘─┴┘    ║
    ║        ┌─┐┬─┐┌─┐┌─┐┌┬┐┌─┐    ║
    ║        │  ├┬┘├┤ ├─┤ │ ├┤     ║
    ║        └─┘┴└─└─┘┴ ┴ ┴ └─┘    ║
    ╚══════════════════════════════╝
`

// Personal Stats
const personalStats = [
  { icon: '💼', label: 'Experience', value: '2+ Years' },
  { icon: '📍', label: 'Location', value: 'Haryana, IN' },
  { icon: '🚀', label: 'Status', value: 'Available for Work' },
  { icon: '☕', label: 'Coffee Consumed', value: '∞ Cups' }
]

// Enhanced Skills Data with levels and resource links
const skills = [
  {
    name: 'Frontend Technologies',
    items: [
      { name: 'JavaScript/TypeScript', level: 95, resources: [{ label: 'MDN JS Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }, { label: 'TS Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' }] },
      { name: 'Vue.js', level: 90, resources: [{ label: 'Vue Docs', url: 'https://vuejs.org/guide/introduction.html' }] },
      { name: 'React', level: 85, resources: [{ label: 'React Docs', url: 'https://react.dev' }] },
      { name: 'HTML5/CSS3', level: 95, resources: [{ label: 'MDN HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }, { label: 'MDN CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }] },
      { name: 'Responsive Design', level: 90, resources: [{ label: 'CSS Tricks', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }] },
      { name: 'Web Design & Development', level: 90, resources: [{ label: 'freeCodeCamp', url: 'https://www.freecodecamp.org' }] },
      { name: 'Web Development Basics', level: 85, resources: [{ label: 'The Odin Project', url: 'https://www.theodinproject.com' }] },
    ]
  },
  {
    name: 'Backend Technologies',
    items: [
      { name: 'Node.js', level: 90, resources: [{ label: 'Node.js Docs', url: 'https://nodejs.org/en/docs' }] },
      { name: 'Express.js', level: 85, resources: [{ label: 'Express Docs', url: 'https://expressjs.com' }] },
      { name: 'Python', level: 80, resources: [{ label: 'Python Docs', url: 'https://docs.python.org/3/' }] },
      { name: 'REST APIs', level: 90, resources: [{ label: 'REST API Tutorial', url: 'https://restfulapi.net' }] },
      { name: 'Database Design', level: 85, resources: [{ label: 'DB Design Guide', url: 'https://www.lucidchart.com/pages/database-diagram/database-design' }] }
    ]
  },
  {
    name: 'Tools & DevOps',
    items: [
      { name: 'Git', level: 95, resources: [{ label: 'Git Docs', url: 'https://git-scm.com/doc' }] },
      { name: 'Docker', level: 80, resources: [{ label: 'Docker Docs', url: 'https://docs.docker.com' }] },
      { name: 'VS Code', level: 95, resources: [{ label: 'VS Code Tips', url: 'https://code.visualstudio.com/docs' }] },
      { name: 'Linux', level: 85, resources: [{ label: 'Linux Journey', url: 'https://linuxjourney.com' }] },
      { name: 'CI/CD', level: 75, resources: [{ label: 'GitHub Actions', url: 'https://docs.github.com/en/actions' }] },
      { name: 'Advanced Excel', level: 90, resources: [{ label: 'Excel Tips', url: 'https://support.microsoft.com/en-us/excel' }] },
    ]
  },
  {
    name: 'Digital Skills',
    items: [
      { name: 'Digital Advertisement', level: 85, resources: [{ label: 'Google Ads', url: 'https://skillshop.withgoogle.com' }] },
      { name: 'Introduction to Digital Business Skills', level: 80, resources: [{ label: 'HP LIFE', url: 'https://www.life-global.org' }] },
      { name: 'Professional & Life Skills', level: 85, resources: [] },
      { name: 'Sales Specialist', level: 80, resources: [{ label: 'HubSpot Academy', url: 'https://academy.hubspot.com' }] },
      { name: 'Data Analytics & Visualization', level: 80, resources: [{ label: 'Tableau Public', url: 'https://public.tableau.com' }] },
      { name: 'Learn JavaScript', level: 80, resources: [{ label: 'JavaScript.info', url: 'https://javascript.info' }] },
    ]
  },
  {
    name: 'Business & Management',
    items: [
      { name: 'Investment Banking', level: 80, resources: [{ label: 'Investopedia', url: 'https://www.investopedia.com/investment-banking-4689814' }] },
      { name: 'Strategic Human Resource Management', level: 80, resources: [] },
      { name: 'Leadership & Motivation', level: 80, resources: [{ label: 'MindTools', url: 'https://www.mindtools.com/leadership' }] },
      { name: 'Principles of Retailing', level: 80, resources: [] },
    ]
  },
  {
    name: 'Mathematics & Analytics',
    items: [
      { name: 'Basic Mathematics', level: 85, resources: [{ label: 'Khan Academy', url: 'https://www.khanacademy.org/math' }] },
      { name: 'Data Analytics', level: 80, resources: [{ label: 'Google Analytics', url: 'https://analytics.google.com' }] },
    ]
  },
  {
    name: 'Personal Finance',
    items: [
      { name: 'Money Management', level: 95, resources: [{ label: 'Investopedia', url: 'https://www.investopedia.com' }] },
      { name: 'Money Psychology', level: 75, resources: [] },
      { name: 'Options and Futures', level: 95, resources: [{ label: 'NSE India', url: 'https://www.nseindia.com' }] },
      { name: 'Stock Market', level: 90, resources: [{ label: 'Zerodha Varsity', url: 'https://zerodha.com/varsity/' }] },
      { name: 'Mutual Funds', level: 97, resources: [{ label: 'AMFI India', url: 'https://www.amfiindia.com' }] },
      { name: 'Retirement Planning', level: 75, resources: [] },
      { name: 'Tax Planning', level: 75, resources: [{ label: 'Income Tax India', url: 'https://www.incometax.gov.in' }] },
      { name: 'Insurance', level: 75, resources: [] },
      { name: 'Real Estate', level: 40, resources: [{ label: 'MagicBricks', url: 'https://www.magicbricks.com' }] },
      { name: 'Cryptocurrency', level: 89, resources: [{ label: 'CoinMarketCap', url: 'https://coinmarketcap.com' }] },
      { name: 'Investment Strategies', level: 99, resources: [{ label: 'Zerodha Varsity', url: 'https://zerodha.com/varsity/' }] },
      { name: 'Financial Planning', level: 99, resources: [] },
      { name: 'Risk Management', level: 90, resources: [] },
      { name: 'Financial Literacy', level: 96, resources: [] },
      { name: 'Financial Security', level: 99, resources: [] },
      { name: 'Financial Freedom', level: 90, resources: [] },
    ]
  }
]

// Projects Data
const projects = [
  {
    name: 'ResumeGen',
    description: 'Build resumes online effortlessly.',
    technologies: ['Vue.js', 'Web App'],
    links: [
      { label: 'VISIT', url: 'https://vinayoo4.github.io/resumegen/' }
    ]
  },
  {
    name: 'Virtual Whiteboard',
    description: 'A plain whiteboard for drawing and teaching.',
    technologies: ['JavaScript', 'Canvas'],
    links: [
      { label: 'VISIT', url: 'https://vinayoo4.github.io/Virtualwhiteboard/' }
    ]
  },
  {
    name: 'EmailDB',
    description: 'A house of email database for marketing purposes.',
    technologies: ['Vue.js', 'Web App'],
    links: [
      { label: 'VISIT', url: 'https://vinayoo4.github.io/Emaildb/' }
    ]
  },
  {
    name: 'Button Catalog',
    description: 'A button catalog web app.',
    technologies: ['Vercel', 'Web App'],
    links: [
      { label: 'VISIT', url: 'https://buttonpage-n6xbpcxv4-vinayoo4s-projects.vercel.app/' }
    ]
  },
  {
    name: 'Product Landing Page',
    description: 'Landing page for products.',
    technologies: ['Vue.js', 'HTML', 'CSS'],
    links: [
      { label: 'GITHUB', url: 'https://github.com/Vinayoo4/product_page' }
    ]
  },
  {
    name: 'Invoice Billing App',
    description: 'Simple front end UI for invoicing and billing application with role-wise system.',
    technologies: ['TypeScript', 'JavaScript'],
    links: [
      { label: 'GITHUB', url: 'https://github.com/Vinayoo4/inovice_billing' }
    ]
  },
  {
    name: 'Shree Nandi Marketing',
    description: 'Web app for marketing agency.',
    technologies: ['Web App', 'Netlify'],
    links: [
      { label: 'VISIT', url: 'https://shreenandimarketing.netlify.app' }
    ]
  },
  {
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration and admin dashboard.',
    technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Stripe'],
    links: []
  },
  {
    name: 'Task Management App',
    description: 'Collaborative task management tool with real-time updates and team features.',
    technologies: ['React', 'Express', 'Socket.io', 'PostgreSQL'],
    links: []
  },
  {
    name: 'Weather Dashboard',
    description: 'Interactive weather dashboard with data visualization and location services.',
    technologies: ['JavaScript', 'Chart.js', 'Weather API', 'CSS3'],
    links: []
  },
  {
    name: 'Portfolio Website',
    description: 'This very website! A 90s-inspired personal portfolio with modern functionality.',
    technologies: ['Vue.js', 'Express.js', 'CSS3', 'Node.js'],
    links: []
  }
]

// Enhanced Contact Information
const contactInfo = [
  { type: 'email', icon: '📧', label: 'Email', value: 'dev.webstylevinay9994@email.com' },
  { type: 'phone', icon: '📱', label: 'Phone', value: '+1 (555) 123-4567' },
  { type: 'location', icon: '📍', label: 'Location', value: 'Haryana, IN' }
]

// Social Links
const socialLinks = [
  { name: 'GitHub', icon: '🐙', url: 'https://github.com/Vinayoo4' },
  { name: 'LinkedIn', icon: '💼', url: 'https://www.linkedin.com/in/vinay-yadav-b517a4244?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app' },
  { name: 'Portfolio', icon: '🌐', url: 'https://me-sigma-red.vercel.app/' },
  { name: 'Drive', icon: '🐙', url: 'https://drive.google.com/drive/folders/15SOjZWy2sj2gBoB-nQ6dcKeY9Ewu_Zvo?usp=sharing' }
]

// Form handling
const form = reactive({
  name: '',
  email: '',
  message: ''
})

const errors = reactive({
  name: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const submitMessage = ref('')
const submitStatus = ref('')
const visitorCount = ref(0)
const currentYear = new Date().getFullYear()
const lastUpdated = new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
})

// Window states: 'normal' | 'minimized' | 'maximized' | 'closed'
const windowStates = reactive<Record<string, string>>({
  about: 'normal',
  skills: 'normal',
  projects: 'normal',
  contact: 'normal'
})

const closeWindow = (name: string) => { windowStates[name] = 'closed' }
const minimizeWindow = (name: string) => { windowStates[name] = windowStates[name] === 'minimized' ? 'normal' : 'minimized' }
const maximizeWindow = (name: string) => { windowStates[name] = windowStates[name] === 'maximized' ? 'normal' : 'maximized' }
const restoreWindow = (name: string) => { windowStates[name] = 'normal' }

// Time display
const currentTime = ref('')
let timeInterval: number

// API Base URL
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// Update time
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Smooth scroll to section
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Form validation
const validateForm = () => {
  errors.name = form.name.length < 2 ? 'Name must be at least 2 characters' : ''
  errors.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Invalid email format' : ''
  errors.message = form.message.length < 10 ? 'Message must be at least 10 characters' : ''
  
  return !errors.name && !errors.email && !errors.message
}

// Submit form
const submitForm = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  submitMessage.value = ''
  
  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      submitMessage.value = 'Message sent successfully! I\'ll get back to you soon.'
      submitStatus.value = 'success'
      // Reset form
      form.name = ''
      form.email = ''
      form.message = ''
    } else {
      submitMessage.value = result.message || 'Failed to send message. Please try again.'
      submitStatus.value = 'error'
    }
  } catch (error) {
    submitMessage.value = 'Network error. Please check your connection and try again.'
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
    setTimeout(() => {
      submitMessage.value = ''
    }, 5000)
  }
}

let visitorInterval: number | undefined

const fetchVisitorCount = async () => {
  try {
    const response = await fetch(`${API_BASE}/visitors`)
    const data = await response.json()
    if (data.count !== undefined && data.count !== null) {
      visitorCount.value = data.count
    }
  } catch {
    // Silent fail - counter shows 0
  }
}

const trackVisit = async () => {
  try {
    await fetch(`${API_BASE}/visitors`, { method: 'POST' })
  } catch {
    // Silent fail
  }
}

onMounted(() => {
  trackVisit()
  fetchVisitorCount()
  visitorInterval = setInterval(fetchVisitorCount, 30000)
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)

  // Konami code listener
  window.addEventListener('keydown', handleKonami)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (visitorInterval) clearInterval(visitorInterval)
  window.removeEventListener('keydown', handleKonami)
})

// Konami Code Easter Egg
const konamiActivated = ref(false)
const KONAMI_SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
const konamiProgress = ref(0)

function handleKonami(e: KeyboardEvent) {
  if (e.key === KONAMI_SEQUENCE[konamiProgress.value]) {
    konamiProgress.value++
    if (konamiProgress.value === KONAMI_SEQUENCE.length) {
      konamiActivated.value = true
      konamiProgress.value = 0
    }
  } else {
    konamiProgress.value = e.key === KONAMI_SEQUENCE[0] ? 1 : 0
  }
}
</script>

<style scoped>
/* Enhanced 90s Styling */
.app {
  min-height: 100vh;
  background: #ffffff;
  color: #000000;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Enhanced Header */
.header {
  background: #000000;
  color: #ffffff;
  padding: 30px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan 3s infinite;
}

@keyframes scan {
  0% { left: -100%; }
  100% { left: 100%; }
}

.name-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.name {
  font-size: 3.5rem;
  font-weight: bold;
  letter-spacing: 4px;
  margin: 0;
  text-shadow: 2px 2px 0px #333333;
}

.blinking-cursor {
  font-size: 3.5rem;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.title {
  font-size: 1.3rem;
  margin: 0 0 25px 0;
  opacity: 0.9;
  letter-spacing: 1px;
}

.ascii-art {
  font-size: 0.7rem;
  line-height: 1.1;
  opacity: 0.8;
  margin-bottom: 20px;
}

.status-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  font-size: 0.9rem;
  opacity: 0.8;
}

.status-item {
  padding: 5px 10px;
  border: 1px solid #ffffff;
  background: rgba(255,255,255,0.1);
}

.header-border {
  height: 6px;
  background: repeating-linear-gradient(
    90deg,
    #000000 0px,
    #000000 15px,
    #ffffff 15px,
    #ffffff 30px
  );
}

/* Navigation Menu */
.nav-menu {
  background: #f0f0f0;
  border-bottom: 2px solid #000000;
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-items {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.nav-link {
  color: #000000;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 8px 15px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-link:hover {
  border-color: #000000;
  background: #000000;
  color: #ffffff;
}

/* Main Content */
.main {
  padding: 60px 0;
  background: #ffffff;
}

.section {
  margin-bottom: 80px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 3px;
}

.title-brackets {
  color: #666666;
}

.title-text {
  color: #000000;
  margin: 0 10px;
}

/* Terminal-style Content Boxes */
.content-box {
  border: 3px solid #000000;
  background: #ffffff;
  box-shadow: 5px 5px 0px #cccccc;
  transition: all 0.3s ease;
}

.box-closed {
  display: none;
}

.box-minimized {
  box-shadow: none;
}

.box-maximized {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 999;
  overflow-y: auto;
  margin: 0;
  border: none;
  box-shadow: none;
}

.terminal-header {
  background: #cccccc;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 2px solid #000000;
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.terminal-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #000000;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.terminal-btn:hover {
  opacity: 0.75;
  transform: scale(1.2);
}

.terminal-btn.close { background: #ff5f57; }
.terminal-btn.minimize { background: #febc2e; }
.terminal-btn.maximize { background: #28c840; }

.restore-hint {
  font-size: 0.75rem;
  color: #555555;
  cursor: pointer;
  margin-left: auto;
}

.restore-hint:hover {
  color: #000000;
}

.terminal-title {
  font-weight: bold;
  font-size: 0.9rem;
}

.terminal-content {
  padding: 30px;
  background: #ffffff;
}

/* About Section */
.intro {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 30px;
  text-align: justify;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 2px solid #000000;
  background: #f9f9f9;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #666666;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
}

/* Skills Section */
.skills-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.skill-category {
  border: 2px solid #000000;
  background: #f9f9f9;
}

.category-header {
  background: #000000;
  color: #ffffff;
  padding: 15px;
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-icon {
  font-size: 1rem;
}

.skill-items {
  padding: 20px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.skill-name-wrapper {
  position: relative;
  width: 70px;
  flex-shrink: 0;
}

.skill-name {
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

.skill-hover-card {
  display: none;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 200;
  background: #000000;
  color: #ffffff;
  padding: 10px 14px;
  min-width: 180px;
  max-width: 240px;
  border: 2px solid #333333;
  box-shadow: 4px 4px 0px #555555;
  font-size: 0.8rem;
  line-height: 1.5;
}

.skill-name-wrapper:hover .skill-hover-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-hover-card strong {
  font-size: 0.85rem;
  border-bottom: 1px solid #555555;
  padding-bottom: 4px;
  word-break: break-word;
  white-space: normal;
}

.skill-resource-link {
  color: #00ff00;
  text-decoration: none;
  font-size: 0.78rem;
}

.skill-resource-link:hover {
  text-decoration: underline;
}

.skill-level-text {
  color: #cccccc;
  font-size: 0.78rem;
}

.skill-bar {
  flex: 1;
  height: 20px;
  background: #ffffff;
  border: 2px solid #000000;
  position: relative;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: #000000;
  transition: width 2s ease-in-out;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
}

.skill-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255,255,255,0.1) 2px,
    rgba(255,255,255,0.1) 4px
  );
}

.skill-percentage-inside {
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: bold;
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

/* Projects Section */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.project-item {
  border: 2px solid #000000;
  background: #f9f9f9;
  padding: 20px;
  transition: transform 0.3s ease;
}

.project-item:hover {
  transform: translateY(-5px);
  box-shadow: 5px 5px 0px #cccccc;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.project-icon {
  font-size: 1.2rem;
}

.project-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.project-description {
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 0.95rem;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tech-tag {
  background: #000000;
  color: #ffffff;
  padding: 4px 8px;
  font-size: 0.8rem;
  border: 1px solid #000000;
}

.project-links {
  display: flex;
  gap: 15px;
}

.project-link {
  color: #000000;
  text-decoration: none;
  font-weight: bold;
  padding: 8px 15px;
  border: 2px solid #000000;
  background: #ffffff;
  transition: all 0.3s ease;
}

.project-link:hover {
  background: #000000;
  color: #ffffff;
}

/* Contact Section */
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.contact-header,
.form-header {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-methods {
  margin-bottom: 30px;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #cccccc;
  background: #f9f9f9;
}

.contact-icon {
  font-size: 1.2rem;
  width: 25px;
  text-align: center;
}

.contact-details {
  display: flex;
  flex-direction: column;
}

.contact-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #666666;
}

.contact-value {
  font-size: 1rem;
}

.social-header {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 2px solid #000000;
  background: #ffffff;
  text-decoration: none;
  color: #000000;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #000000;
  color: #ffffff;
}

.social-icon {
  font-size: 1.1rem;
}

.social-name {
  font-weight: bold;
  font-size: 0.9rem;
}

/* Enhanced Form Styling */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #000000;
}

.form-input,
.form-textarea {
  padding: 12px;
  border: 2px solid #cccccc;
  background: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #000000;
}

.form-input.error,
.form-textarea.error {
  border-color: #ff0000;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #999999;
  font-style: italic;
}

.error-text {
  color: #ff0000;
  font-size: 0.8rem;
  font-weight: bold;
}

.submit-btn {
  padding: 15px 30px;
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  background: #333333;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.submit-message {
  padding: 15px;
  text-align: center;
  font-size: 0.9rem;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-message.success {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.submit-message.error {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.message-icon {
  font-weight: bold;
  font-size: 1.1rem;
}

/* Enhanced Footer */
.footer {
  background: #000000;
  color: #ffffff;
  padding: 40px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.footer-left {
  text-align: left;
}

.footer-center {
  text-align: center;
}

.footer-right {
  text-align: right;
}

.copyright {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.tech-stack {
  font-size: 0.9rem;
  opacity: 0.8;
}

.visitor-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 15px;
  border: 2px solid #ffffff;
  background: rgba(255,255,255,0.1);
}

.counter-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.counter-value {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.last-updated {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.update-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.update-date {
  font-size: 0.9rem;
  font-weight: bold;
}

.footer-border {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    #ffffff 0px,
    #ffffff 10px,
    transparent 10px,
    transparent 20px
  );
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .name {
    font-size: 2.5rem;
  }
  
  .blinking-cursor {
    font-size: 2.5rem;
  }
  
  .nav-items {
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .nav-link {
    font-size: 1rem;
  }
  
  .contact-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .skills-container {
    grid-template-columns: 1fr;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 20px;
  }
  
  .footer-left,
  .footer-right {
    text-align: center;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .name {
    font-size: 2rem;
    letter-spacing: 2px;
  }
  
  .blinking-cursor {
    font-size: 2rem;
  }
  
  .ascii-art {
    font-size: 0.6rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .social-grid {
    grid-template-columns: 1fr;
  }
}

/* Konami Code Easter Egg */
.konami-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.konami-box {
  background: #000;
  border: 3px solid #00ff41;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 0 40px rgba(0, 255, 65, 0.5);
  max-width: 420px;
  width: 90%;
}

.konami-art {
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  text-shadow: 0 0 6px #00ff41;
  margin: 0 0 1rem;
  white-space: pre;
  line-height: 1.5;
}

.konami-msg {
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 0 0 0.5rem;
  text-shadow: 0 0 8px #00ffff;
}

.konami-sub {
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  margin: 0 0 1.2rem;
}

.konami-close {
  background: transparent;
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
  cursor: pointer;
  letter-spacing: 1px;
  transition: background 0.15s, color 0.15s;
}

.konami-close:hover {
  background: #00ff41;
  color: #000;
}
</style>