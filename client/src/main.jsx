import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './virtual-tours.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { HelmetProvider } from 'react-helmet-async'
import SkipToContent from './components/SkipToContent'

// Read theme from localStorage before render to prevent flash
const savedTheme = localStorage.getItem('brajyatra-theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <ToastProvider>
                  <SkipToContent />
                  <App />
                </ToastProvider>
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
