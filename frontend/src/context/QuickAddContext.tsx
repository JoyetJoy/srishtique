import { createContext, useContext, useState, type ReactNode } from 'react';
import QuickAddDrawer from '../components/QuickAddDrawer';

interface QuickAddContextType {
  openQuickAdd: (productId: number) => void;
  closeQuickAdd: () => void;
}

const QuickAddContext = createContext<QuickAddContextType | undefined>(undefined);

export const QuickAddProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  const openQuickAdd = (productId: number) => {
    setActiveProductId(productId);
    setIsOpen(true);
  };

  const closeQuickAdd = () => {
    setIsOpen(false);
    // Don't clear activeProductId immediately so exit animation has data
    setTimeout(() => setActiveProductId(null), 300);
  };

  return (
    <QuickAddContext.Provider value={{ openQuickAdd, closeQuickAdd }}>
      {children}
      <QuickAddDrawer 
        isOpen={isOpen} 
        onClose={closeQuickAdd} 
        productId={activeProductId} 
      />
    </QuickAddContext.Provider>
  );
};

export const useQuickAdd = () => {
  const context = useContext(QuickAddContext);
  if (!context) {
    throw new Error('useQuickAdd must be used within a QuickAddProvider');
  }
  return context;
};
