import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Users, ChefHat, Star, Heart, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRecipeById, Recipe } from "@/data/recipes";
import { DashboardHeader } from "@/components/yam/Header";
import { fetchMeal, updateMealStatus, apiMealToRecipe } from "@/lib/api";
import { ApiMeal } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Generate food image URL using Faker-style approach
const generateUnsplashFoodImage = (mealName: string) => {
  const width = 800;
  const height = 600;
  
  // Create a seed based on meal name for consistent images
  const seed = mealName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use different food-related image services
  const imageServices = [
    `https://picsum.photos/seed/${seed}/${width}/${height}`,
    `https://picsum.photos/${width}/${height}?random=${seed}`,
    `https://source.unsplash.com/${width}x${height}/?food,meal,cooking`
  ];
  
  return imageServices[Math.floor(Math.random() * imageServices.length)];
};

import oat from "@/assets/meal-oatmeal-berries.jpg";
import avo from "@/assets/meal-avocado-toast.jpg";
import yogurt from "@/assets/meal-greek-yogurt-berries.jpg";
import chicken from "@/assets/meal-chicken-sweetpotato-greenbeans.jpg";
import quinoa from "@/assets/meal-quinoa-salad.jpg";
import smoothie from "@/assets/meal-smoothie-bowl.jpg";
import salmon from "@/assets/meal-salmon-quinoa.jpg";
import tofu from "@/assets/meal-tofu-stirfry.jpg";
import omelette from "@/assets/meal-omelette-spinach.jpg";

const mealsData = [
  { 
    id: "oatmeal-berries",
    label: "Breakfast", 
    calories: 350, 
    title: "Oatmeal with Almonds & Berries", 
    image: oat, 
    macros: { c: 45, p: 12, f: 14 },
    cookTime: "10 min",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1/2 cup rolled oats",
      "1 cup unsweetened almond milk",
      "1/4 cup mixed berries (blueberries, strawberries, raspberries)",
      "2 tbsp sliced almonds",
      "1 tsp honey or maple syrup",
      "1/4 tsp ground cinnamon",
      "Pinch of sea salt",
      "Optional: 1 tbsp chia seeds for extra fiber"
    ],
    instructions: [
      "Warm almond milk in a small pot over medium heat until lightly steaming.",
      "Stir in oats and a pinch of salt; cook 5–7 minutes, stirring occasionally, until creamy.",
      "Remove from heat and mix in cinnamon and honey (or maple syrup).",
      "Spoon into a bowl and top with mixed berries and sliced almonds.",
      "Optional: sprinkle chia seeds and an extra dash of cinnamon. Serve warm."
    ],
    nutrition: {
      calories: 350,
      carbs: 45,
      protein: 12,
      fat: 14,
      fiber: 8,
      sugar: 12,
      sodium: 95
    }
  },
  { 
    id: "avocado-toast",
    label: "Lunch", 
    calories: 450, 
    title: "Avocado Toast with Egg", 
    image: avo, 
    macros: { c: 40, p: 18, f: 18 },
    cookTime: "8 min",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "2 slices whole grain bread (sourdough or multigrain)",
      "1 ripe avocado, pitted and peeled",
      "1 large free-range egg",
      "1 tsp extra virgin olive oil",
      "1/2 lemon, juiced",
      "Sea salt and freshly ground black pepper",
      "Red pepper flakes (optional)",
      "Microgreens or arugula for garnish",
      "Everything bagel seasoning (optional)"
    ],
    instructions: [
      "Toast bread slices until golden brown and crispy on the outside.",
      "In a small bowl, mash the avocado with lemon juice, salt, and pepper until smooth but still chunky.",
      "Heat olive oil in a non-stick pan over medium heat.",
      "Crack the egg into the pan and cook for 2-3 minutes for a runny yolk, or 4-5 minutes for a firmer yolk.",
      "Spread the mashed avocado evenly on both toast slices.",
      "Place the fried egg on one slice and sprinkle with red pepper flakes and everything bagel seasoning.",
      "Garnish with microgreens and serve immediately."
    ],
    nutrition: {
      calories: 450,
      carbs: 40,
      protein: 18,
      fat: 18,
      fiber: 12,
      sugar: 4,
      sodium: 380
    }
  },
  { 
    id: "greek-yogurt-berries",
    label: "Snack", 
    calories: 200, 
    title: "Greek Yogurt with Berries", 
    image: yogurt, 
    macros: { c: 18, p: 14, f: 9 },
    cookTime: "2 min",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 cup plain Greek yogurt (2% or full-fat)",
      "1/2 cup mixed fresh berries (blueberries, strawberries, raspberries)",
      "1 tbsp raw honey or maple syrup",
      "1 tbsp chopped walnuts or almonds",
      "1 tsp chia seeds",
      "1/4 tsp vanilla extract",
      "Fresh mint leaves for garnish",
      "Pinch of ground cinnamon (optional)"
    ],
    instructions: [
      "Scoop Greek yogurt into a serving bowl or glass.",
      "Mix in vanilla extract and a pinch of cinnamon if desired.",
      "Wash and dry the mixed berries, then arrange them on top of the yogurt.",
      "Drizzle honey or maple syrup over the berries.",
      "Sprinkle with chopped walnuts and chia seeds.",
      "Garnish with fresh mint leaves and serve immediately."
    ],
    nutrition: {
      calories: 200,
      carbs: 18,
      protein: 14,
      fat: 9,
      fiber: 4,
      sugar: 15,
      sodium: 85
    }
  },
  { 
    id: "chicken-sweetpotato",
    label: "Dinner", 
    calories: 520, 
    title: "Grilled Chicken, Sweet Potato & Greens", 
    image: chicken, 
    macros: { c: 35, p: 42, f: 12 },
    cookTime: "25 min",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "4 oz boneless, skinless chicken breast",
      "1 medium sweet potato (about 6 oz)",
      "2 cups mixed greens (spinach, kale, arugula)",
      "2 tbsp extra virgin olive oil",
      "1 tsp dried thyme",
      "1 tsp garlic powder",
      "1/2 tsp smoked paprika",
      "Sea salt and freshly ground black pepper",
      "1 tbsp balsamic vinegar",
      "1 tsp Dijon mustard",
      "1 clove garlic, minced"
    ],
    instructions: [
      "Preheat oven to 400°F (200°C). Pierce sweet potato with a fork and bake for 20-25 minutes until tender.",
      "Season chicken breast with thyme, garlic powder, paprika, salt, and pepper.",
      "Heat 1 tbsp olive oil in a grill pan or skillet over medium-high heat.",
      "Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F.",
      "Let chicken rest for 5 minutes, then slice.",
      "Whisk together remaining olive oil, balsamic vinegar, Dijon mustard, and minced garlic for dressing.",
      "Toss mixed greens with the dressing.",
      "Serve sliced chicken with roasted sweet potato and dressed greens."
    ],
    nutrition: {
      calories: 520,
      carbs: 35,
      protein: 42,
      fat: 12,
      fiber: 8,
      sugar: 8,
      sodium: 180
    }
  },
  { 
    id: "quinoa-salad",
    label: "Lunch", 
    calories: 420, 
    title: "Quinoa Salad with Avocado & Chickpeas", 
    image: quinoa, 
    macros: { c: 50, p: 16, f: 14 },
    cookTime: "15 min",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1/2 cup quinoa (rinsed and drained)",
      "1/2 cup cooked chickpeas (or canned, drained and rinsed)",
      "1/2 ripe avocado, diced",
      "1/4 cup cherry tomatoes, halved",
      "1/4 cup cucumber, diced",
      "2 tbsp red onion, finely diced",
      "2 tbsp extra virgin olive oil",
      "1 tbsp fresh lemon juice",
      "1 tsp Dijon mustard",
      "1 clove garlic, minced",
      "2 tbsp fresh parsley, chopped",
      "Sea salt and freshly ground black pepper",
      "1 tbsp pumpkin seeds (optional)"
    ],
    instructions: [
      "Cook quinoa according to package instructions (1:2 ratio with water), then let cool completely.",
      "In a large bowl, combine cooled quinoa with chickpeas, tomatoes, cucumber, and red onion.",
      "Gently fold in diced avocado to avoid mashing.",
      "Whisk together olive oil, lemon juice, Dijon mustard, garlic, salt, and pepper for the dressing.",
      "Pour dressing over the salad and toss gently to combine.",
      "Sprinkle with fresh parsley and pumpkin seeds if using.",
      "Let sit for 10 minutes before serving to allow flavors to meld."
    ],
    nutrition: {
      calories: 420,
      carbs: 50,
      protein: 16,
      fat: 14,
      fiber: 12,
      sugar: 6,
      sodium: 220
    }
  },
  { 
    id: "smoothie-bowl",
    label: "Breakfast", 
    calories: 380, 
    title: "Berry Smoothie Bowl", 
    image: smoothie, 
    macros: { c: 55, p: 10, f: 8 },
    cookTime: "5 min",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 frozen banana (sliced before freezing)",
      "1/2 cup frozen mixed berries (blueberries, strawberries, raspberries)",
      "1/2 cup unsweetened almond milk",
      "1 tbsp chia seeds",
      "1 tsp honey or maple syrup",
      "1/4 tsp vanilla extract",
      "2 tbsp granola (homemade or store-bought)",
      "Fresh berries for topping",
      "1 tbsp coconut flakes",
      "1 tsp hemp hearts (optional)"
    ],
    instructions: [
      "Add frozen banana, mixed berries, almond milk, honey, and vanilla to a high-speed blender.",
      "Blend on high until smooth and creamy, adding more almond milk if needed for desired consistency.",
      "Pour the smoothie into a wide, shallow bowl.",
      "Arrange granola, fresh berries, coconut flakes, and hemp hearts on top in an attractive pattern.",
      "Serve immediately while cold and fresh."
    ],
    nutrition: {
      calories: 380,
      carbs: 55,
      protein: 10,
      fat: 8,
      fiber: 12,
      sugar: 35,
      sodium: 65
    }
  },
  { 
    id: "salmon-quinoa",
    label: "Dinner", 
    calories: 560, 
    title: "Grilled Salmon with Quinoa", 
    image: salmon, 
    macros: { c: 30, p: 40, f: 22 },
    cookTime: "20 min",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "4 oz fresh salmon fillet (skin-on or skinless)",
      "1/2 cup quinoa (rinsed and drained)",
      "6-8 asparagus spears, trimmed",
      "1 lemon (half juiced, half cut into wedges)",
      "2 tbsp extra virgin olive oil",
      "1 tsp dried dill",
      "1 tsp garlic powder",
      "1/2 tsp sea salt",
      "Freshly ground black pepper",
      "1 tbsp fresh dill, chopped",
      "1 tbsp capers (optional)",
      "1 cup vegetable broth (for quinoa)"
    ],
    instructions: [
      "Cook quinoa in vegetable broth according to package instructions, then fluff with a fork.",
      "Preheat grill or grill pan to medium-high heat.",
      "Season salmon with dill, garlic powder, salt, pepper, and lemon juice.",
      "Brush asparagus with 1 tbsp olive oil and season with salt and pepper.",
      "Grill salmon for 4-5 minutes per side until fish flakes easily with a fork.",
      "Grill asparagus for 3-4 minutes until tender and slightly charred.",
      "Serve salmon over quinoa with grilled asparagus on the side.",
      "Garnish with fresh dill, capers, and lemon wedges."
    ],
    nutrition: {
      calories: 560,
      carbs: 30,
      protein: 40,
      fat: 22,
      fiber: 6,
      sugar: 4,
      sodium: 150
    }
  },
  { 
    id: "tofu-stirfry",
    label: "Dinner", 
    calories: 480, 
    title: "Tofu Veggie Stir-fry", 
    image: tofu, 
    macros: { c: 52, p: 24, f: 12 },
    cookTime: "15 min",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "4 oz extra-firm tofu, pressed and cubed",
      "1/2 cup broccoli florets",
      "1/2 cup bell peppers (mixed colors), sliced",
      "1/2 cup snap peas",
      "1/4 cup carrots, julienned",
      "1/2 cup cooked brown rice",
      "2 tbsp low-sodium soy sauce",
      "1 tbsp sesame oil",
      "1 tbsp rice vinegar",
      "1 tsp honey or maple syrup",
      "2 cloves garlic, minced",
      "1 tbsp fresh ginger, grated",
      "2 green onions, sliced",
      "1 tbsp sesame seeds",
      "Red pepper flakes (optional)"
    ],
    instructions: [
      "Press tofu for 15 minutes, then cube into 1-inch pieces.",
      "Heat 1 tbsp sesame oil in a large wok or skillet over medium-high heat.",
      "Pan-fry tofu cubes until golden brown on all sides, about 5-6 minutes. Remove and set aside.",
      "Add remaining oil to the pan and stir-fry garlic and ginger for 30 seconds.",
      "Add broccoli and carrots, stir-fry for 2-3 minutes.",
      "Add bell peppers and snap peas, continue stir-frying for 2-3 minutes.",
      "Return tofu to the pan and add soy sauce, rice vinegar, and honey.",
      "Toss everything together and cook for 1-2 minutes until heated through.",
      "Serve over brown rice and garnish with green onions and sesame seeds."
    ],
    nutrition: {
      calories: 480,
      carbs: 52,
      protein: 24,
      fat: 12,
      fiber: 8,
      sugar: 8,
      sodium: 420
    }
  },
  { 
    id: "spinach-omelette",
    label: "Breakfast", 
    calories: 320, 
    title: "Spinach Omelette", 
    image: omelette, 
    macros: { c: 8, p: 24, f: 20 },
    cookTime: "8 min",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "3 large free-range eggs",
      "1 cup fresh baby spinach, roughly chopped",
      "2 tbsp feta cheese or goat cheese, crumbled",
      "1 tbsp extra virgin olive oil",
      "1 tbsp unsalted butter",
      "1 clove garlic, minced",
      "1/4 tsp sea salt",
      "Freshly ground black pepper",
      "1 tbsp fresh herbs (chives, parsley, or dill)",
      "1 tbsp milk or cream (optional)",
      "Pinch of red pepper flakes (optional)"
    ],
    instructions: [
      "In a bowl, whisk eggs with salt, pepper, and milk (if using) until well combined.",
      "Heat olive oil and butter in a non-stick skillet over medium-low heat.",
      "Add minced garlic and sauté for 30 seconds until fragrant.",
      "Add chopped spinach and cook for 1-2 minutes until wilted. Remove and set aside.",
      "Pour beaten eggs into the pan and let cook undisturbed for 1-2 minutes.",
      "Gently lift edges with a spatula and tilt pan to let uncooked egg flow underneath.",
      "When eggs are mostly set but still slightly runny on top, add spinach and cheese to one half.",
      "Fold the omelette in half and cook for 30 seconds more.",
      "Slide onto a plate, garnish with fresh herbs and red pepper flakes, and serve immediately."
    ],
    nutrition: {
      calories: 320,
      carbs: 8,
      protein: 24,
      fat: 20,
      fiber: 3,
      sugar: 3,
      sodium: 380
    }
  }
];

export default function MealDetail() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<any>(null);
  const [aiMeal, setAiMeal] = useState<ApiMeal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadMeal();
  }, [mealId]);

  const loadMeal = async () => {
    if (!mealId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch AI-generated meal from backend API
      const aiMealData = await fetchMeal(mealId);
      setAiMeal(aiMealData);
      setMeal(null);
      console.log('Successfully loaded meal from backend:', aiMealData);
    } catch (error) {
      console.error('Failed to fetch meal from backend:', error);
      setError('Failed to load meal from database');
      // If backend fails, try to find in static data as fallback
      const param = decodeURIComponent(mealId);
      const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      
      let staticMeal = mealsData.find(m => m.id === param)
        || mealsData.find(m => toSlug(m.title) === param)
        || mealsData.find(m => m.title === param);

      // If not found in mealsData, try to find in recipes
      if (!staticMeal) {
        const recipe = getRecipeById(param);
        if (recipe) {
          // Convert recipe to meal format
          staticMeal = {
            id: recipe.id,
            label: recipe.category,
            calories: recipe.nutrition.calories,
            title: recipe.name,
            image: "/placeholder.svg",
            macros: { c: recipe.nutrition.carbs, p: recipe.nutrition.protein, f: recipe.nutrition.fat },
            cookTime: `${recipe.cookTime} min`,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients.map(ing => `${ing.amount} ${ing.unit} ${ing.productId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`),
            instructions: recipe.instructions,
            nutrition: {
              calories: recipe.nutrition.calories,
              carbs: recipe.nutrition.carbs,
              protein: recipe.nutrition.protein,
              fat: recipe.nutrition.fat,
              fiber: 0,
              sugar: 0,
              sodium: 0,
            },
          } as any;
        }
      }

      if (staticMeal) {
        setMeal(staticMeal);
        setAiMeal(null);
      } else {
        // Build a dynamic default meal from the URL so every meal has a detail page
        const titleFromParam = param
          .replace(/-/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase()) || "Meal";
        const defaultMeal = {
          id: toSlug(titleFromParam),
          label: "Meal",
          calories: 0,
          title: titleFromParam,
          image: "/placeholder.svg",
          macros: { c: 0, p: 0, f: 0 },
          cookTime: "-",
          servings: 1,
          difficulty: "-",
          ingredients: [],
          instructions: [],
          nutrition: {
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
          },
        } as any;
        setMeal(defaultMeal);
        setAiMeal(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'generated' | 'accepted' | 'rejected' | 'cooked', rating?: number, feedback?: string) => {
    if (!aiMeal) return;
    
    try {
      setIsUpdating(true);
      await updateMealStatus(aiMeal.id, status, rating, feedback);
      
      // Update local state
      setAiMeal(prev => prev ? {
        ...prev,
        status,
        user_rating: rating || prev.user_rating,
        user_feedback: feedback || prev.user_feedback
      } : null);
      
      toast.success(`Meal ${status} successfully!`);
    } catch (error) {
      console.error('Failed to update meal status:', error);
      toast.error('Failed to update meal status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!aiMeal) return;
    
    try {
      setIsUpdating(true);
      const newFavoriteStatus = !aiMeal.is_favorited;
      await updateMealStatus(aiMeal.id, aiMeal.status as 'generated' | 'accepted' | 'rejected' | 'cooked', aiMeal.user_rating, aiMeal.user_feedback, newFavoriteStatus);
      
      setAiMeal(prev => prev ? { ...prev, is_favorited: newFavoriteStatus } : null);
      toast.success(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!');
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">Loading meal...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error && !meal && !aiMeal) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground mb-4">Error Loading Meal</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/meals")} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Meals
            </Button>
            <Button variant="outline" onClick={() => loadMeal()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentMeal = aiMeal ? apiMealToRecipe(aiMeal) : meal;
  if (!currentMeal) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">Meal not found</h1>
            <Button onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image and basic info */}
          <div className="space-y-4">
            <img 
              src={generateUnsplashFoodImage(currentMeal.name || currentMeal.title)} 
              alt={`${currentMeal.name || currentMeal.title} recipe`}
              className="w-full h-80 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
              }}
            />
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentMeal.cookTime}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {currentMeal.servings} serving
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                {currentMeal.difficulty}
              </div>
            </div>
          </div>

          {/* Title and nutrition */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{currentMeal.category || currentMeal.label}</Badge>
                {aiMeal && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Generated
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{currentMeal.name || currentMeal.title}</h1>
              <p className="text-lg text-muted-foreground">{currentMeal.nutrition?.calories || currentMeal.calories} calories per serving</p>
              {aiMeal && (
                <p className="text-sm text-muted-foreground mt-1">
                  Generated on {new Date(aiMeal.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Nutrition Facts */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">{currentMeal.nutrition?.carbs || 0}g</p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">{currentMeal.nutrition?.protein || 0}g</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">{currentMeal.nutrition?.fat || 0}g</p>
                    <p className="text-sm text-muted-foreground">Fat</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Fiber</span>
                    <span>{currentMeal.nutrition?.fiber || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sugar</span>
                    <span>{currentMeal.nutrition?.sugar || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sodium</span>
                    <span>{currentMeal.nutrition?.sodium || 0}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span>{currentMeal.nutrition?.calories || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Meal Actions - Only show for AI-generated meals */}
            {aiMeal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Generated Meal Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status and Rating */}
                  <div className="flex items-center gap-4">
                    <Badge variant={aiMeal.status === 'accepted' ? 'default' : aiMeal.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {aiMeal.status}
                    </Badge>
                    {aiMeal.user_rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < aiMeal.user_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggleFavorite}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`h-4 w-4 ${aiMeal.is_favorited ? 'fill-red-500 text-red-500' : ''}`} />
                      {aiMeal.is_favorited ? 'Favorited' : 'Add to Favorites'}
                    </Button>
                    
                    {aiMeal.status !== 'accepted' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleUpdateStatus('accepted')}
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Accept Meal
                      </Button>
                    )}
                    
                    {aiMeal.status !== 'rejected' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Reject Meal
                      </Button>
                    )}
                  </div>

                  {/* User Feedback */}
                  {aiMeal.user_feedback && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Your Feedback:</p>
                      <p className="text-sm">{aiMeal.user_feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Ingredients and Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentMeal.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {typeof ingredient === 'string' ? ingredient : `${ingredient.amount} ${ingredient.unit} ${ingredient.productId}`}
                  </li>
                )) || []}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {currentMeal.instructions?.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                )) || []}
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}