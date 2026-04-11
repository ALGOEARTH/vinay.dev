#!/usr/bin/env node
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')

function box(lines) {
  const width = Math.max(...lines.map(l => l.length)) + 4
  const border = '╔' + '═'.repeat(width - 2) + '╗'
  const bottom = '╚' + '═'.repeat(width - 2) + '╝'
  console.log('\n' + border)
  lines.forEach(l => {
    const pad = width - 2 - l.length
    console.log('║ ' + l + ' '.repeat(pad - 1) + '║')
  })
  console.log(bottom + '\n')
}

box([
  '  DEPLOY-CHECK 1996  ',
  '  Analyzing your repo before deployment...',
  ''
])

// Git log
console.log('▶ RECENT COMMITS (last 10):')
try {
  const log = execSync('git log --oneline -10', { cwd: ROOT }).toString()
  console.log(log)
} catch {
  console.log('  (git log failed — not a git repo?)\n')
}

// Git diff stat
console.log('▶ CHANGES SINCE LAST COMMIT:')
try {
  const diff = execSync('git diff --stat HEAD~1', { cwd: ROOT }).toString()
  console.log(diff || '  (no diff available)\n')
} catch {
  console.log('  (diff unavailable)\n')
}

// Check critical files
const CRITICAL = [
  'package-lock.json',
  'Backend/server/index.js',
  'Backend/server/db.js',
  'Frontend/vite.config.ts'
]

let changedCritical = []
try {
  const changed = execSync('git diff --name-only HEAD~1', { cwd: ROOT }).toString().split('\n').filter(Boolean)
  changedCritical = CRITICAL.filter(f => changed.some(c => c.includes(f.split('/').pop())))
} catch {
  // Ignore
}

// Check test scripts
const pkgs = [
  { label: 'root', path: join(ROOT, 'package.json') },
  { label: 'Frontend', path: join(ROOT, 'Frontend/package.json') },
  { label: 'Backend', path: join(ROOT, 'Backend/server/package.json') }
]

const testResults = pkgs.map(({ label, path }) => {
  if (!existsSync(path)) return { label, hasTest: false }
  try {
    const pkg = JSON.parse(readFileSync(path, 'utf8'))
    const hasTest = !!(pkg.scripts?.test && !pkg.scripts.test.includes('echo "no test"') && !pkg.scripts.test.includes('exit 0'))
    return { label, hasTest }
  } catch {
    return { label, hasTest: false }
  }
})

// Risk assessment
const reasons = []
let riskLevel = 'LOW'

if (changedCritical.length > 0) {
  riskLevel = 'HIGH'
  reasons.push(`Critical files changed: ${changedCritical.join(', ')}`)
}

const missingTests = testResults.filter(r => !r.hasTest).map(r => r.label)
if (missingTests.length > 1) {
  if (riskLevel === 'LOW') riskLevel = 'MEDIUM'
  reasons.push(`Missing test scripts in: ${missingTests.join(', ')}`)
}

const riskColor = riskLevel === 'LOW' ? '✅' : riskLevel === 'MEDIUM' ? '⚠️ ' : '🚨'

box([
  `  RISK ASSESSMENT: ${riskColor}  ${riskLevel}  `,
  '',
  ...reasons.length ? reasons.map(r => `  ⚠  ${r}`) : ['  No critical issues detected.'],
  '',
  `  Test coverage: ${testResults.filter(r => r.hasTest).length}/${testResults.length} packages`,
  `  Critical file changes: ${changedCritical.length}`
])

console.log('Deploy check complete. Exiting 0 (informational only).\n')
process.exit(0)
