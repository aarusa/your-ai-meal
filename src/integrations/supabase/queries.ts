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
    console.warn("Backend API not available, returning empty meals array:", error);
  }

  // Return empty array since we don't have the meals table yet
  // The meal tracking system uses a different approach
  console.warn("Using empty meals array as fallback");
  return [];
}

export async function insertMealLog(mealId: string, quantity: number = 1) {
  // This function is deprecated - meal tracking has been removed
  console.warn("insertMealLog is deprecated - meal tracking has been removed");
  throw new Error("insertMealLog is deprecated - meal tracking has been removed");
}

// Product queries
export type DbProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  calories_per_100g: number | null;
  energy_kcal_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  carbohydrates_100g: number | null;
  fats_per_100g: number | null;
  fiber_per_100g: number | null;
  sugar_per_100g: number | null;
  sodium_per_100g: number | null;
  salt_100g: number | null;
  is_halal: boolean;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_kosher: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  is_nut_free: boolean;
  is_soy_free: boolean;
  is_shellfish_free: boolean;
  is_egg_free: boolean;
  is_fish_free: boolean;
  is_palm_oil_free: boolean;
  image_url: string | null;
  thumbnail_url: string | null;
  nutriscore_grade: string | null;
  barcode: string | null;
  search_keywords: string[] | null;
};

export async function searchProducts(query: string): Promise<DbProduct[]> {
  if (!query.trim()) return [];

  // Prefer backend API
  try {
    const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";
    const url = new URL(`${API_BASE}/api/products`);
    url.searchParams.set("search", query);
    url.searchParams.set("limit", "20");
    const response = await fetch(url.toString());
    if (response.ok) {
      const payload = await response.json();
      const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
      return items as DbProduct[];
    }
  } catch (err) {
    console.warn("Products API not available, falling back to Supabase:", err);
  }

  // Fallback to Supabase direct query
  const { data, error } = await (supabase as any)
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }

  return (data ?? []) as DbProduct[];
}

export async function getProductById(id: string): Promise<DbProduct | null> {
  // Prefer backend API to bypass client-side RLS issues
  try {
    const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";
    const response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`);
    if (response.ok) {
      const data = await response.json();
      return data as DbProduct;
    }
  } catch (err) {
    console.warn("Products API not available, falling back to Supabase:", err);
  }

  const { data, error } = await (supabase as any)
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as DbProduct;
}

// Test function to check if products exist in database
export async function testProductsExist(): Promise<boolean> {
  try {
    const { data, error } = await (supabase as any)
      .from("products")
      .select("id, name")
      .limit(1);

    if (error) {
      console.error("Error testing products:", error);
      return false;
    }

    console.log("Test products query result:", data);
    return data && data.length > 0;
  } catch (error) {
    console.error("Error testing products:", error);
    return false;
  }
}

// Function to get all products for debugging
export async function getAllProducts(): Promise<DbProduct[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("products")
      .select("*")
      .limit(10);

    if (error) {
      console.error("Error fetching all products:", error);
      return [];
    }

    console.log("All products in database:", data);
    return (data ?? []) as DbProduct[];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

// Utility function to convert DbProduct to frontend Product interface
export function convertDbProductToProduct(dbProduct: DbProduct): any {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category || 'Unknown',
    calories: dbProduct.calories_per_100g || dbProduct.energy_kcal_100g || 0,
    protein: dbProduct.protein_per_100g || 0,
    carbs: dbProduct.carbs_per_100g || dbProduct.carbohydrates_100g || 0,
    fat: dbProduct.fats_per_100g || 0,
    description: dbProduct.description || undefined,
    // Additional fields for enhanced display
    brand: dbProduct.brand,
    subcategory: dbProduct.subcategory,
    image_url: dbProduct.image_url,
    thumbnail_url: dbProduct.thumbnail_url,
    nutriscore_grade: dbProduct.nutriscore_grade,
    barcode: dbProduct.barcode,
    // Dietary restrictions
    is_halal: dbProduct.is_halal,
    is_vegan: dbProduct.is_vegan,
    is_vegetarian: dbProduct.is_vegetarian,
    is_kosher: dbProduct.is_kosher,
    is_gluten_free: dbProduct.is_gluten_free,
    is_dairy_free: dbProduct.is_dairy_free,
    is_nut_free: dbProduct.is_nut_free,
    is_soy_free: dbProduct.is_soy_free,
    is_shellfish_free: dbProduct.is_shellfish_free,
    is_egg_free: dbProduct.is_egg_free,
    is_fish_free: dbProduct.is_fish_free,
    is_palm_oil_free: dbProduct.is_palm_oil_free,
  };
}


