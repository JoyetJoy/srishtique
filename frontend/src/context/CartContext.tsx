import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: string; // unique ID combination: productId-size-color
  productId: number;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  variantId: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, size: string, color: string, quantity: number, variantId: number, price?: number, originalPrice?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  syncCartFromServer: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('dk_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const syncCartFromServer = async () => {
    const token = localStorage.getItem('dk_exporting_token');
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        if (data.items.length > 0) {
          setCartItems(prev => {
            const merged = [...data.items];
            for (const item of prev) {
              if (!merged.some(m => m.id === item.id)) {
                merged.push(item);
              }
            }
            return merged;
          });
        } else if (cartItems.length > 0) {
          fetch(`${import.meta.env.VITE_API_URL}/api/public/cart/track`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ items: cartItems })
          }).catch(console.error);
        }
      }
    } catch (e) {
      console.error('Failed to sync cart from server', e);
    }
  };

  useEffect(() => {
    syncCartFromServer();
  }, []);

  useEffect(() => {
    localStorage.setItem('dk_cart', JSON.stringify(cartItems));
    const token = localStorage.getItem('dk_exporting_token');
    if (token) {
      const timer = setTimeout(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/public/cart/track`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ items: cartItems })
        }).catch(console.error);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  const addToCart = (product: any, size: string, color: string, quantity: number, variantId: number, price?: number, originalPrice?: number) => {
    const id = `${product.id}-${size}-${color}`;
    
    // Extract correct image for variant
    let variantImage = product.image || (product.images?.[0]) || '';
    const variant = product.variants?.find((v: any) => v.id === variantId);
    if (variant && variant.images) {
      let parsedImages = variant.images;
      if (typeof parsedImages === 'string') {
        try { parsedImages = JSON.parse(parsedImages); } catch(e){}
      }
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        variantImage = parsedImages[0];
      }
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => 
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, {
        id,
        productId: product.id,
        name: product.name,
        image: variantImage,
        size,
        color,
        price: price !== undefined ? price : product.price,
        originalPrice: originalPrice !== undefined ? originalPrice : product.originalPrice,
        quantity,
        variantId
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCartFromServer,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
