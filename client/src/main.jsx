import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './virtual-tours.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'

// Read theme from localStorage before render to prevent flash
const savedTheme = localStorage.getItem('brajyatra-theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
