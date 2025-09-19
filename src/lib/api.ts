// API utility functions for backend communication

const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";

// AI Recipe Generation
export interface GenerateAIRecipeRequest {
  ingredients: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
  favoriteCuisines?: string[];
  calories?: number;
  protein?: number;
  mealType?: string;
  cookTime?: number;
  servings?: number;
}

export interface AIRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: Array<{
    productId: string;
    amount: number;
    unit: string;
    note?: string;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  image_url?: string;
  thumbnail_url?: string;
  image_alt?: string;
  photographer?: string;
  photographer_url?: string;
}

export interface DailyMealPlan {
  date: string;
  meals: AIRecipe[];
}

export async function generateDailyMealPlan(userId?: string): Promise<DailyMealPlan> {
  try {
    const response = await fetch(`${API_BASE}/api/ai/daily-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate daily meal plan: ${response.status}`);
    }

    const data = await response.json();
    return data.dailyPlan || { date: new Date().toISOString().split('T')[0], meals: [] };
  } catch (error) {
    console.error('Error generating daily meal plan:', error);
    throw error;
  }
}

export async function generateAIRecipe(request: GenerateAIRecipeRequest): Promise<AIRecipe[]> {
  try {
    const response = await fetch(`${API_BASE}/api/ai/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate AI recipe: ${response.status}`);
    }

    const data = await response.json();
    return data.recipes || [];
  } catch (error) {
    console.error('Error generating AI recipe:', error);
    throw error;
  }
}

// Store a meal generation request (plan form parameters)
export interface StoreMealGenerationRequestPayload {
  userId?: string;
  calories?: number;
  protein?: number;
  mealType?: string;
  cookTime?: number;
  servings?: number;
  dietaryPreferences?: string[];
  allergies?: string[];
  favoriteCuisines?: string[];
}

export async function storeMealGenerationRequest(payload: StoreMealGenerationRequestPayload): Promise<{ request: any }> {
  try {
    const response = await fetch(`${API_BASE}/api/ai/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to store generation request: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error storing meal generation request:', error);
    throw error;
  }
}

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
  // Make output independent of DB: never rely on meal_ingredients_ai.
  // Sanitize any UUID-like tokens from AI text to human-friendly placeholder.
  const uuidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g;
  const isUuid = (v: any) => typeof v === 'string' && uuidRegex.test(v);
  const replaceUuidsInText = (text: string) => text.replace(uuidRegex, 'ingredient').replace(/\s+/g, ' ').trim();

  return {
    id: apiMeal.id,
    name: apiMeal.name,
    description: apiMeal.description,
    category: apiMeal.meal_type.charAt(0).toUpperCase() + apiMeal.meal_type.slice(1),
    prepTime: apiMeal.prep_time_minutes,
    cookTime: apiMeal.cook_time_minutes,
    servings: apiMeal.servings,
    difficulty: apiMeal.difficulty_level.charAt(0).toUpperCase() + apiMeal.difficulty_level.slice(1),
    // Show AI ingredients directly (no DB relationship at all). Remove any UUIDs.
    ingredients: ((apiMeal as any)?.generation_criteria?.ingredients || []).map((ing: any) => {
      // If already a string, return as-is (but strip UUIDs to a friendly label if found)
      if (typeof ing === 'string') return replaceUuidsInText(ing);
      // Otherwise, build a friendly line like "2 cup salt"
      const parts: string[] = [];
      if (ing.amount !== null && ing.amount !== undefined) parts.push(String(ing.amount));
      if (ing.unit) parts.push(String(ing.unit));
      const rawLabel = ing.name || ing.ingredient_name || ing.productId || 'ingredient';
      const label = isUuid(rawLabel) ? 'ingredient' : replaceUuidsInText(String(rawLabel));
      parts.push(label);
      return parts.join(' ').trim();
    }),
    instructions: (apiMeal.generation_criteria?.instructions || []).map((step: string) => {
      if (typeof step !== 'string') return step;
      // Replace any UUIDs in the text with a generic ingredient label
      return replaceUuidsInText(step);
    }),
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
