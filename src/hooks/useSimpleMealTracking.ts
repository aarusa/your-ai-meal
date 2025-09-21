import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const API_BASE = "http://localhost:3000";

export interface SimpleMealLog {
  id: string;
  user_id: string;
  meal_id?: string;
  meal_name: string;
  meal_type: string;
  calories?: number;
  logged_at: string;
}

export const useSimpleMealTracking = () => {
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // CREATE - Log a new meal
  const createMeal = async (params: {
    mealId?: string;
    mealName: string;
    mealType: string;
    calories?: number;
  }): Promise<SimpleMealLog | null> => {
    if (!userId) {
      toast.error("Please log in to track meals");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/api/meal-tracking/?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log meal');
      }

      const result = await response.json();
      toast.success("Meal tracked successfully!");
      return result.data;
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to log meal');
      return null;
    }
  };

  // Legacy method for backward compatibility
  const logMeal = createMeal;

  // READ - Get meal logs with filters
  const getMealLogs = async (options: {
    limit?: number;
    offset?: number;
    mealType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}): Promise<{ data: SimpleMealLog[], pagination: any }> => {
    if (!userId) {
      return { data: [], pagination: {} };
    }

    try {
      const params = new URLSearchParams({ userId });
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/api/meal-tracking/?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch meal logs');
      }

      const result = await response.json();
      return { data: result.data || [], pagination: result.pagination || {} };
    } catch (error) {
      console.error('Error fetching meal logs:', error);
      return { data: [], pagination: {} };
    }
  };

  // READ - Get specific meal log
  const getMealLog = async (id: string): Promise<SimpleMealLog | null> => {
    if (!userId) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/api/meal-tracking/${id}?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch meal log');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching meal log:', error);
      return null;
    }
  };

  // UPDATE - Update meal log
  const updateMealLog = async (id: string, updates: {
    mealName?: string;
    mealType?: string;
    calories?: number;
    mealId?: string;
  }): Promise<SimpleMealLog | null> => {
    if (!userId) {
      toast.error("Please log in to update meals");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/api/meal-tracking/${id}?userId=${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Meal log not found");
          return null;
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to update meal log');
      }

      const result = await response.json();
      toast.success("Meal updated successfully!");
      return result.data;
    } catch (error) {
      console.error('Error updating meal log:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update meal');
      return null;
    }
  };

  // DELETE - Delete meal log
  const deleteMealLog = async (logId: string): Promise<boolean> => {
    if (!userId) {
      toast.error("Please log in to delete meals");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/api/meal-tracking/${logId}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Meal log not found");
          return false;
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete meal log');
      }

      toast.success("Meal deleted successfully!");
      return true;
    } catch (error) {
      console.error('Error deleting meal log:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete meal');
      return false;
    }
  };

  // GET - Get meal statistics
  const getMealStats = async (days = 30): Promise<any> => {
    if (!userId) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/api/meal-tracking/stats/overview?userId=${encodeURIComponent(userId)}&days=${days}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch meal statistics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching meal stats:', error);
      return null;
    }
  };

  return {
    userId,
    // CRUD operations
    createMeal,
    getMealLogs,
    getMealLog,
    updateMealLog,
    deleteMealLog,
    getMealStats,
    // Legacy methods for backward compatibility
    logMeal
  };
};
