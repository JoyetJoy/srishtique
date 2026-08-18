import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlistItems: number[]; // Array of product IDs
  toggleWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const token = localStorage.getItem('dk_exporting_token');
  const navigate = useNavigate();

  const refreshWishlist = async () => {
    if (!token) {
      setWishlistItems([]);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        // data is array of wishlist objects, extract productIds
        setWishlistItems(data.map((item: any) => item.productId));
      }
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [token]);

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (!token) {
      toast.error('Please login to save items to your wishlist');
      navigate('/login');
      return false; // Return false to indicate action didn't complete
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      
      const data = await res.json();
      if (res.ok) {
        if (data.isWishlisted) {
          setWishlistItems(prev => [...prev, productId]);
          toast.success('Added to wishlist');
        } else {
          setWishlistItems(prev => prev.filter(id => id !== productId));
          toast.success('Removed from wishlist');
        }
        return true;
      } else {
        toast.error(data.error || 'Failed to update wishlist');
        return false;
      }
    } catch (err) {
      console.error('Error toggling wishlist', err);
      toast.error('Something went wrong');
      return false;
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
