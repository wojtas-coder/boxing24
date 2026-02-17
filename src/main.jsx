// REBUILD: v1.1-FINAL deployment trigger
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Global Error Trap for "White Screen of Death" debugging
window.onerror = function (message, source, lineno, colno, error) {
    const errorBox = document.createElement('div');
    errorBox.style.position = 'fixed';
    errorBox.style.top = '0';
    errorBox.style.left = '0';
    errorBox.style.width = '100%';
    errorBox.style.padding = '20px';
    errorBox.style.backgroundColor = 'red';
    errorBox.style.color = 'white';
    errorBox.style.zIndex = '999999';
    errorBox.style.fontFamily = 'monospace';
    errorBox.style.whiteSpace = 'pre-wrap';
    errorBox.innerHTML = `<strong>CRITICAL ERROR:</strong><br>${message}<br><small>${source}:${lineno}</small><br><pre>${error?.stack || ''}</pre>`;
    document.body.appendChild(errorBox);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>,
)
