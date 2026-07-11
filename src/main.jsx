import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}service-worker.js`, {
                scope: import.meta.env.BASE_URL,
                updateViaCache: 'none',
            })
            .catch(() => {});
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
