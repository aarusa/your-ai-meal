import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/data/products';

interface PantryItem extends Product {
  quantity: number;
  addedAt: Date;
}

interface PantryContextType {
  pantryItems: PantryItem[];
  addToPantry: (product: Product, quantity: number) => void;
  removeFromPantry: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearPantry: () => void;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export function PantryProvider({ children }: { children: ReactNode }) {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);

  const addToPantry = (product: Product, quantity: number) => {
    setPantryItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        // Update quantity if product already exists
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new product to pantry
        return [...prev, { ...product, quantity, addedAt: new Date() }];
      }
    });
  };

  const removeFromPantry = (productId: string) => {
    setPantryItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromPantry(productId);
      return;
    }
    
    setPantryItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearPantry = () => {
    setPantryItems([]);
  };

  return (
    <PantryContext.Provider
      value={{
        pantryItems,
        addToPantry,
        removeFromPantry,
        updateQuantity,
        clearPantry,
      }}
    >
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (context === undefined) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}
