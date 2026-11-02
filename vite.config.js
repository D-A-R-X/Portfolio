import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

// The résumé keeps one name in public/, so browsers and CDNs can hold on to
// an old copy. Its links carry a hash of the file, which changes whenever
// the PDF is rebuilt.
const resumeHash = createHash('sha1').update(readFileSync('public/Surya_J_Resume.pdf')).digest('hex').slice(0, 10)

export default defineConfig({
  plugins: [react()],
  define: { __RESUME_V__: JSON.stringify(resumeHash) },
})
