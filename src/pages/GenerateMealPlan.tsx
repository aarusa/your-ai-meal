import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/yam/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Target, Flame, Dumbbell, Utensils, Clock, Users, Leaf, AlertTriangle, Settings, Sparkles, ChefHat, Zap, Eye, Star } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePantry } from "@/contexts/PantryContext";
import { generateAIRecipe, GenerateAIRecipeRequest, storeMealGenerationRequest, AIRecipe } from "@/lib/api";

// Options will be loaded from database with safe fallbacks

export default function GenerateMealPlan() {
  const navigate = useNavigate();
  const { pantryItems, type2GeneratedMeals, replaceType2GeneratedMeals } = usePantry();
  
  const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";

  const [calories, setCalories] = useState<number>(500);
  const [protein, setProtein] = useState<number>(25);
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Lunch");
  const [cookTime, setCookTime] = useState<number>(30);
  const [servings, setServings] = useState<number>(1);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<string[]>(["Vegetarian","Vegan","Keto","Paleo","Halal","Gluten-free"]);
  const [allergyOptions, setAllergyOptions] = useState<string[]>(["Nuts","Dairy","Gluten","Eggs","Shellfish","Soy"]);
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [selectedPantry, setSelectedPantry] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleInList = (value: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(value)) setList(list.filter(v => v !== value));
    else setList([...list, value]);
  };

  const togglePantry = (id: string) => {
    setSelectedPantry(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleViewRecipeDetails = (recipe: any) => {
    // Store the recipe in localStorage and navigate to meal detail page
    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
    navigate(`/meal/${recipe.id}`);
  };

  const handleAddRecipeToMealPlan = (recipe: any) => {
    // Add recipe to meal plan logic
    toast.success(`${recipe.name} added to your meal plan!`);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Get selected pantry items (optional)
      const selectedIngredients = pantryItems
        .filter(item => selectedPantry.has(item.id))
        .map(item => item.name);

      // Get user preferences from Supabase
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) {
        toast.error("Please log in to generate meals");
        return;
      }

      // Prepare the request
      const request: GenerateAIRecipeRequest = {
        ingredients: selectedIngredients,
        dietaryPreferences: dietaryPrefs,
        allergies: allergies,
        favoriteCuisines: favoriteCuisines,
        calories: calories,
        protein: protein,
        mealType: mealType.toLowerCase(),
        cookTime: cookTime,
        servings: servings,
      };

      // Store user-entered parameters
      try {
        await storeMealGenerationRequest({
          userId,
          calories,
          protein,
          mealType: mealType.toLowerCase(),
          cookTime,
          servings,
          dietaryPreferences: dietaryPrefs,
          allergies,
          favoriteCuisines,
        });
      } catch (e) {
        // Non-blocking: log but continue generation
        console.warn('Failed to store generation request:', e);
      }

      // Generate AI recipes
      const recipes = await generateAIRecipe(request);
      
      if (recipes.length === 0) {
        toast.error("No recipes could be generated with the selected criteria");
        return;
      }

      replaceType2GeneratedMeals(recipes);
      
      // Store the generated meals in the database using the new Type 2 endpoint
      try {
        const generationCriteria = {
          calories,
          protein,
          mealType: mealType.toLowerCase(),
          cookTime,
          servings,
          dietaryPreferences: dietaryPrefs,
          allergies,
          favoriteCuisines,
          selectedIngredients: selectedIngredients
        };

        const storeResponse = await fetch(`${API_BASE}/api/ai/plan/store`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            recipes: recipes,
            generationCriteria
          }),
        });

        if (storeResponse.ok) {
          const storeResult = await storeResponse.json();
          if (storeResult.stored) {
            toast.success(`Generated and saved ${storeResult.storedCount} AI recipe(s) to your meals!`, {
              description: `Type: ${mealType} • ${calories} kcal • ${protein}g protein • ${servings} serving(s)`
            });
          } else {
            toast.success(`Generated ${recipes.length} AI recipe(s)!`, {
              description: `Type: ${mealType} • ${calories} kcal • ${protein}g protein • ${servings} serving(s)`
            });
          }
        } else {
          toast.success(`Generated ${recipes.length} AI recipe(s)!`, {
            description: `Type: ${mealType} • ${calories} kcal • ${protein}g protein • ${servings} serving(s)`
          });
        }
      } catch (storeError) {
        console.warn('Failed to store meals in database:', storeError);
        toast.success(`Generated ${recipes.length} AI recipe(s)!`, {
          description: `Type: ${mealType} • ${calories} kcal • ${protein}g protein • ${servings} serving(s)`
        });
      }

    } catch (error) {
      console.error('Error generating AI recipes:', error);
      toast.error("Failed to generate AI recipes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Load options from database (if available)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Example tables: dietary_preferences, allergy_options
        const { data: dp, error: dpe } = await supabase.from("dietary_preferences").select("name");
        if (!dpe && dp && dp.length > 0) setDietaryOptions(dp.map((r: any) => r.name));

        const { data: ao, error: aoe } = await supabase.from("allergies").select("name");
        if (!aoe && ao && ao.length > 0) setAllergyOptions(ao.map((r: any) => r.name));

        const { data: cu, error: cue } = await supabase.from("cuisines").select("name");
        if (!cue && cu && cu.length > 0) setCuisineOptions(cu.map((r: any) => r.name));
      } catch (e) {
        // keep defaults silently
      }
    };
    loadOptions();
  }, []);

  // Creative Loading Component
  const MealGenerationLoader = () => (
    <Dialog open={isGenerating} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <DialogTitle className="sr-only">Generating Meal Plan</DialogTitle>
        <DialogDescription className="sr-only">
          AI is creating a personalized meal plan based on your preferences and dietary requirements.
        </DialogDescription>
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          {/* Animated Chef Hat */}
          <div className="relative">
            <div className="animate-bounce">
              <ChefHat className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 animate-ping">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-pulse">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Creating Your Perfect Meal! 🍽️
            </h3>
            <p className="text-muted-foreground">
              Our AI chef is designing a meal plan tailored to your preferences...
            </p>
          </div>

          {/* Animated Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          {/* Rotating Tips */}
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 w-full max-w-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="animate-pulse">
                Calculating perfect macros and flavors...
              </span>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>🎯 Targeting {calories} calories and {protein}g protein</p>
            <p>⏱️ Optimizing for {cookTime} minute cook time</p>
            <p>🍴 Creating {servings} perfect serving{servings > 1 ? 's' : ''}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DashboardHeader />
      
      {/* Creative Meal Generation Loader */}
      <MealGenerationLoader />
      
      <main className="container max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">

        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              AI Meal Planner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Nutrition Goals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Flame className="h-3 w-3" /> Calories
                  </label>
                  <Input type="number" value={calories} min={0}
                    onChange={(e) => setCalories(parseInt(e.target.value || "0"))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" /> Protein (g)
                  </label>
                  <Input type="number" value={protein} min={0}
                    onChange={(e) => setProtein(parseInt(e.target.value || "0"))} />
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-primary" />
                Meal Type
              </h3>
              <div className="grid grid-cols-4 gap-2 sm:max-w-md">
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((mt) => (
                  <Button key={mt} variant={mealType === mt ? "default" : "outline"}
                    onClick={() => setMealType(mt as any)}>{mt}</Button>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Preferences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:max-w-2xl">
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Cooking Time (min)
                  </label>
                  <Input type="number" value={cookTime} min={0}
                    onChange={(e) => setCookTime(parseInt(e.target.value || "0"))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Servings
                  </label>
                  <Input type="number" value={servings} min={1}
                    onChange={(e) => setServings(parseInt(e.target.value || "1"))} />
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                Dietary Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(opt => (
                  <Button key={opt} variant={dietaryPrefs.includes(opt) ? "default" : "outline"}
                    onClick={() => toggleInList(opt, dietaryPrefs, setDietaryPrefs)}>
                    {opt}
                  </Button>
                ))}
              </div>
            </section>

            <Separator />

              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  Cuisine Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Loading cuisines…</p>
                  ) : (
                    cuisineOptions.map(opt => (
                      <Button key={opt} variant={favoriteCuisines.includes(opt) ? "default" : "outline"}
                        onClick={() => toggleInList(opt, favoriteCuisines, setFavoriteCuisines)}>
                        {opt}
                      </Button>
                    ))
                  )}
                </div>
              </section>

              <Separator />

            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Allergies
              </h3>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map(opt => (
                  <Button key={opt} variant={allergies.includes(opt) ? "default" : "outline"}
                    onClick={() => toggleInList(opt, allergies, setAllergies)}>
                    {opt}
                  </Button>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-primary" />
                Pantry Items ({selectedPantry.size}/{pantryItems.length} selected)
              </h3>
              {pantryItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your pantry is empty. Add items from product detail pages.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {pantryItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePantry(item.id)}
                      className={`text-left border rounded-md px-3 py-2 text-sm transition ${selectedPantry.has(item.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}
                    >
                      <div className="font-medium line-clamp-1">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <div className="pt-2">
              <Button 
                size="lg" 
                className="px-8" 
                onClick={handleGenerate} 
                disabled={isGenerating}
                aria-label="Generate meal plan with AI"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Pantry items are optional. AI will consider calories, protein, meal type, preferences, dietary preferences, and allergies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Generated Meals Section - Always visible */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Generated Meals
            </h2>
          </div>

          {type2GeneratedMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {type2GeneratedMeals.map((recipe, index) => (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {recipe.name}
                            </CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {recipe.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {recipe.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {recipe.prepTime + recipe.cookTime}min
                        </div>
                          
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4" />
                          {recipe.difficulty}
                        </div>
                      </div>

                      {/* Nutrition */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Calories:</span>
                            <span className="font-medium">{recipe.nutrition.calories}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protein:</span>
                            <span className="font-medium">{recipe.nutrition.protein}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 text-sm"
                          onClick={() => handleViewRecipeDetails(recipe)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          variant="default"
                          size="sm"
                          className="flex-1 h-9 text-sm"
                          onClick={() => handleAddRecipeToMealPlan(recipe)}
                        >
                          <ChefHat className="h-4 w-4 mr-1" />
                          Add to Meal Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Generated Meals Yet</h3>
              <p className="text-muted-foreground mb-4">
                Set your preferences above and click "Generate with AI" to create personalized meal suggestions.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}


