import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App.tsx'
import { installPrintHandlers } from '@/lib/exportPdf'
import '@/styles/index.css'
import '@/styles/print.css'

// Ctrl+P debe imprimir el CV, no la interfaz de la app.
installPrintHandlers()

if (import.meta.env.DEV) {
  void import('@/lib/devDemo').then((module) => module.applyDemoFromUrl())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
