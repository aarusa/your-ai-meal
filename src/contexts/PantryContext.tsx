import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';

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
  const [userId, setUserId] = useState<string | null>(null);

  const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";

  const normalizeItems = (items: any[]): PantryItem[] => {
    return (items || []).map((it: any) => ({
      ...it,
      addedAt: it.addedAt ? new Date(it.addedAt) : new Date(),
    }));
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id || null;
      if (!mounted) return;
      setUserId(uid);
      if (!uid) return;
      try {
        const resp = await fetch(`${API_BASE}/api/pantry?userId=${encodeURIComponent(uid)}`);
        if (resp.ok) {
          const items = await resp.json();
          if (mounted) setPantryItems(normalizeItems(items));
        }
      } catch (e) {
        // ignore, keep local state fallback
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (!uid) {
        setPantryItems([]);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const addToPantry = async (product: Product, quantity: number) => {
    if (!userId) {
      // fallback local update if not logged in
      setPantryItems(prev => {
        const existingItem = prev.find(item => item.id === product.id);
        if (existingItem) {
          return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
        } else {
          return [...prev, { ...product, quantity, addedAt: new Date() }];
        }
      });
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/pantry?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, quantity }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Pantry insert failed (${resp.status})`);
      }
      const items = await resp.json();
      setPantryItems(normalizeItems(items));
    } catch (e) {
      console.error('Pantry add failed:', e);
    }
  };

  const removeFromPantry = async (productId: string) => {
    if (!userId) {
      setPantryItems(prev => prev.filter(item => item.id !== productId));
      return;
    }
    try {
      const url = `${API_BASE}/api/pantry?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`;
      const resp = await fetch(url, { method: 'DELETE' });
      if (resp.ok) {
        const items = await resp.json();
        setPantryItems(normalizeItems(items));
      }
    } catch (e) {
      // no-op
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromPantry(productId);
      return;
    }
    if (!userId) {
      setPantryItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
      return;
    }
    try {
      const url = `${API_BASE}/api/pantry?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`;
      const resp = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (resp.ok) {
        const items = await resp.json();
        setPantryItems(normalizeItems(items));
      }
    } catch (e) {
      // no-op
    }
  };

  const clearPantry = async () => {
    setPantryItems([]);
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/api/pantry/clear?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
    } catch (e) {
      // no-op
    }
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
