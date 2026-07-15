import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CaseProvider } from './lib/store.tsx'
import { AuthProvider } from './lib/authStore.tsx'
import { applyFont, getSavedFont } from './lib/fonts.ts'

applyFont(getSavedFont())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CaseProvider>
          <App />
        </CaseProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
