import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import InactivityTimer from './components/InactivityTimer'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-md)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger)',
                secondary: '#fff',
              },
            },
          }}
        />
        <InactivityTimer />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
