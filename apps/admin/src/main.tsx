import React from 'react'
import ReactDOM from 'react-dom/client'
import { Chakra } from './components/Shared/branding/Chakra.tsx'
import AppProvider from './providers/AppProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Chakra>
      <AppProvider />
    </Chakra>
  </React.StrictMode>
)
