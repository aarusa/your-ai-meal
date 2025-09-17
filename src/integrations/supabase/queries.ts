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

  if (error) {
    // If the table doesn't exist or there's an access issue, return fallback data
    console.warn("Failed to fetch meals from database:", error.message);
    return getFallbackMeals();
  }
  return (data ?? []) as DbMeal[];
}

// Fallback meals data when database table is not available
function getFallbackMeals(): DbMeal[] {
  return [
    {
      id: "oatmeal-berries",
      name: "Oatmeal with Almonds & Berries",
      calories: 350,
      protein: 12,
      carbs: 45,
      fats: 14
    },
    {
      id: "avocado-toast",
      name: "Avocado Toast with Egg",
      calories: 450,
      protein: 18,
      carbs: 40,
      fats: 18
    },
    {
      id: "greek-yogurt-berries",
      name: "Greek Yogurt with Berries",
      calories: 200,
      protein: 14,
      carbs: 18,
      fats: 9
    },
    {
      id: "chicken-sweetpotato",
      name: "Grilled Chicken, Sweet Potato & Greens",
      calories: 600,
      protein: 42,
      carbs: 45,
      fats: 18
    },
    {
      id: "quinoa-salad",
      name: "Quinoa Power Salad",
      calories: 380,
      protein: 16,
      carbs: 35,
      fats: 12
    },
    {
      id: "smoothie-bowl",
      name: "Acai Smoothie Bowl",
      calories: 320,
      protein: 10,
      carbs: 42,
      fats: 8
    },
    {
      id: "salmon-quinoa",
      name: "Grilled Salmon with Quinoa",
      calories: 520,
      protein: 35,
      carbs: 38,
      fats: 22
    },
    {
      id: "tofu-stirfry",
      name: "Tofu Vegetable Stir-fry",
      calories: 410,
      protein: 20,
      carbs: 32,
      fats: 16
    },
    {
      id: "omelette-spinach",
      name: "Spinach & Cheese Omelette",
      calories: 290,
      protein: 24,
      carbs: 8,
      fats: 18
    }
  ];
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

  if (error) {
    // If the meal_logs table doesn't exist, just log a warning and continue
    console.warn("Failed to log meal to database:", error.message);
    // Don't throw error to prevent breaking the UI
  }
}

// Utility function to populate the meals table with sample data
export async function populateMealsTable(): Promise<boolean> {
  try {
    const fallbackMeals = getFallbackMeals();
    
    // Try to insert all meals
    const { error } = await supabase
      .from("meals")
      .insert(fallbackMeals.map(meal => ({
        id: meal.id,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        created_at: new Date().toISOString()
      })));

    if (error) {
      console.warn("Failed to populate meals table:", error.message);
      return false;
    }
    
    console.log("Successfully populated meals table with sample data");
    return true;
  } catch (error) {
    console.warn("Error populating meals table:", error);
    return false;
  }
}


