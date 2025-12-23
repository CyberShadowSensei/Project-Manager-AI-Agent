import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Initialize theme from localStorage before React renders
const savedTheme = localStorage.getItem('theme') || 'dark'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)