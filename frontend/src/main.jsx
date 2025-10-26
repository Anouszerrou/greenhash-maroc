import React from 'react'
// Buffer polyfill to silence Buffer warnings from some deps (dev only)
import { Buffer } from 'buffer';
if (typeof window !== 'undefined' && !window.Buffer) window.Buffer = Buffer;
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Web3Provider } from './context/Web3Context'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <App />
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>,
)