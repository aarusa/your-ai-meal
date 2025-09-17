import { supabase } from "./client";

export type DbMeal = {
  id: string;
  name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
};

export async function fetchMeals(): Promise<DbMeal[]> {
  // Try backend API first
  try {
    const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";
    const response = await fetch(`${API_BASE}/api/meals`);
    if (response.ok) {
      const data = await response.json();
      return data as DbMeal[];
    }
  } catch (error) {
    console.warn("Backend API not available, falling back to Supabase:", error);
  }

  // Fallback to Supabase
  const { data, error } = await supabase
    .from("meals")
    .select("id,name,calories,protein,carbs,fats")
    .limit(100);

  if (error) {
    console.error("Supabase error fetching meals:", error);
    // Return empty array as fallback instead of throwing
    console.warn("Using empty meals array as fallback");
    return [];
  }
  return (data ?? []) as DbMeal[];
}

export async function insertMealLog(mealId: string, quantity: number = 1) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id ?? null;

  const { error } = await supabase.from("meal_logs").insert({
    meal_id: mealId,
    quantity,
    user_id: userId,
    log_date: new Date().toISOString(),
  });

  if (error) throw error;
}


