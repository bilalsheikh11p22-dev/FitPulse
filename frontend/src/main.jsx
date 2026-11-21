import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out the static splash from index.html once React has painted
requestAnimationFrame(() => {
  const splash = document.getElementById('fp-splash');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('fp-hide');
    setTimeout(() => splash.remove(), 400);
  }, 350);
});
