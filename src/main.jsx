import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Fuentes incluidas en la propia app (antes se descargaban de Google Fonts):
// funcionan sin conexión y no dependen de servidores externos.
import '@fontsource/work-sans/latin-400.css'
import '@fontsource/work-sans/latin-500.css'
import '@fontsource/work-sans/latin-600.css'
import '@fontsource/work-sans/latin-700.css'
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(e => console.warn('SW:', e))
  })
}
