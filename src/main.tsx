import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import './rayku20-polish.css'

import App from './App.tsx'

createRoot(
  document.getElementById('root')!
).render(
  <StrictMode>
    <App />
  </StrictMode>
)

