import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TestApp from './TestApp.jsx'

const isTestMode = window.location.search.includes('test=true');
const RootComponent = isTestMode ? TestApp : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
