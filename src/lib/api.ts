// API utility functions for backend communication

const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";

export interface ApiMeal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  difficulty_level: string;
  servings: number;
  generation_type: string;
  generation_criteria: any;
  ai_model_version: string;
  generation_timestamp: string;
  is_favorited: boolean;
  is_rated: boolean;
  user_rating?: number;
  user_feedback?: string;
  status: string;
  created_at: string;
  updated_at: string;
  meal_ingredients_ai?: any[];
}

// Fetch user's stored meals with optional filtering and pagination
export async function fetchUserMeals(
  userId: string, 
  options?: {
    status?: string;
    mealType?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{ meals: ApiMeal[]; total: number; hasMore: boolean }> {
  try {
    const params = new URLSearchParams({ userId });
    if (options?.status) params.append('status', options.status);
    if (options?.mealType) params.append('mealType', options.mealType);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await fetch(`${API_BASE}/api/meals?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch meals: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user meals:', error);
    throw error;
  }
}

// Fetch user's stored meals (simple version for backward compatibility)
export async function fetchUserMealsSimple(userId: string): Promise<ApiMeal[]> {
  const result = await fetchUserMeals(userId);
  return result.meals;
}

// Fetch a specific meal by ID
export async function fetchMeal(mealId: string): Promise<ApiMeal> {
  try {
    const response = await fetch(`${API_BASE}/api/meals/${encodeURIComponent(mealId)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch meal: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching meal:', error);
    throw error;
  }
}

// Update meal status (accept/reject/rate)
export async function updateMealStatus(
  mealId: string, 
  status: 'generated' | 'accepted' | 'rejected' | 'cooked',
  rating?: number,
  feedback?: string,
  isFavorited?: boolean
): Promise<ApiMeal> {
  try {
    const response = await fetch(`${API_BASE}/api/meals/${encodeURIComponent(mealId)}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        rating,
        feedback,
        isFavorited
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update meal status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating meal status:', error);
    throw error;
  }
}

// Delete a meal
export async function deleteMeal(mealId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/meals/${encodeURIComponent(mealId)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete meal: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

// Fetch meal statistics
export async function fetchMealStats(userId: string): Promise<{
  totalMeals: number;
  acceptedMeals: number;
  favoriteMeals: number;
  recentMeals: number;
  acceptanceRate: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/meals/stats?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch meal stats: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching meal stats:', error);
    throw error;
  }
}

// Fetch meal categories
export async function fetchMealCategories(userId: string): Promise<{
  mealTypes: Record<string, number>;
  difficulties: Record<string, number>;
  totalCategories: number;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/meals/categories?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch meal categories: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching meal categories:', error);
    throw error;
  }
}

// Search meals
export async function searchMeals(userId: string, query: string, limit = 20): Promise<{
  meals: ApiMeal[];
  query: string;
  total: number;
}> {
  try {
    const response = await fetch(
      `${API_BASE}/api/meals/search?userId=${encodeURIComponent(userId)}&query=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to search meals: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching meals:', error);
    throw error;
  }
}

// Fetch recent meals
export async function fetchRecentMeals(userId: string, limit = 5): Promise<ApiMeal[]> {
  try {
    const response = await fetch(
      `${API_BASE}/api/meals/recent?userId=${encodeURIComponent(userId)}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch recent meals: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent meals:', error);
    throw error;
  }
}

// Convert API meal to frontend Recipe format
export function apiMealToRecipe(apiMeal: ApiMeal): any {
  return {
    id: apiMeal.id,
    name: apiMeal.name,
    description: apiMeal.description,
    category: apiMeal.meal_type.charAt(0).toUpperCase() + apiMeal.meal_type.slice(1),
    prepTime: apiMeal.prep_time_minutes,
    cookTime: apiMeal.cook_time_minutes,
    servings: apiMeal.servings,
    difficulty: apiMeal.difficulty_level.charAt(0).toUpperCase() + apiMeal.difficulty_level.slice(1),
    ingredients: apiMeal.meal_ingredients_ai?.map(ing => ({
      productId: ing.product_id,
      amount: ing.quantity,
      unit: ing.unit
    })) || [],
    instructions: apiMeal.generation_criteria?.instructions || [],
    nutrition: {
      calories: apiMeal.total_calories,
      protein: apiMeal.total_protein,
      carbs: apiMeal.total_carbs,
      fat: apiMeal.total_fats
    },
    tags: apiMeal.generation_criteria?.tags || [],
    storedAt: apiMeal.created_at,
    status: apiMeal.status,
    userRating: apiMeal.user_rating,
    userFeedback: apiMeal.user_feedback
  };
}
