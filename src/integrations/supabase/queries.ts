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
  const { data, error } = await supabase
    .from("meals")
    .select("id,name,calories,protein,carbs,fats")
    .limit(100);

  if (error) throw error;
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


