import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { QuickAddProvider } from './context/QuickAddContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <WishlistProvider>
          <CartProvider>
            <QuickAddProvider>
              <App />
            </QuickAddProvider>
          </CartProvider>
        </WishlistProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
