import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/yam/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Target, Flame, Dumbbell, Utensils, Clock, Users, Leaf, AlertTriangle, Settings, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePantry } from "@/contexts/PantryContext";
import { generateAIRecipe, GenerateAIRecipeRequest, AIRecipe } from "@/lib/api";

// Options will be loaded from database with safe fallbacks

export default function GenerateMealPlan() {
  const navigate = useNavigate();
  const { pantryItems } = usePantry();

  const [calories, setCalories] = useState<number>(500);
  const [protein, setProtein] = useState<number>(25);
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Lunch");
  const [cookTime, setCookTime] = useState<number>(30);
  const [servings, setServings] = useState<number>(1);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<string[]>(["Vegetarian","Vegan","Keto","Paleo","Halal","Gluten-free"]);
  const [allergyOptions, setAllergyOptions] = useState<string[]>(["Nuts","Dairy","Gluten","Eggs","Shellfish","Soy"]);
  const [selectedPantry, setSelectedPantry] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<AIRecipe[]>([]);

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
        calories: calories,
        protein: protein,
        mealType: mealType.toLowerCase(),
        cookTime: cookTime,
        servings: servings,
      };

      // Generate AI recipes
      const recipes = await generateAIRecipe(request, userId);
      
      if (recipes.length === 0) {
        toast.error("No recipes could be generated with the selected criteria");
        return;
      }

      setGeneratedRecipes(recipes);
      toast.success(`Generated ${recipes.length} AI recipe(s)!`, {
        description: `Type: ${mealType} • ${calories} kcal • ${protein}g protein • ${servings} serving(s)`
      });

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
      } catch (e) {
        // keep defaults silently
      }
    };
    loadOptions();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DashboardHeader />
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
                Pantry Items (Optional) ({selectedPantry.size}/{pantryItems.length} selected)
              </h3>
              {pantryItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your pantry is empty. You can still generate meals based on your preferences, or add items from product detail pages.</p>
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
              {selectedPantry.size === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No pantry items selected - AI will generate meals based on your preferences
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Recipes Display */}
        {generatedRecipes.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generated AI Meals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedRecipes.map((recipe, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {recipe.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {recipe.cookTime}min
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {recipe.servings}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Target className="h-4 w-4" />
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
                          <div className="flex justify-between">
                            <span>Carbs:</span>
                            <span className="font-medium">{recipe.nutrition.carbs}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fat:</span>
                            <span className="font-medium">{recipe.nutrition.fat}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Ingredients Preview */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Ingredients:</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-primary rounded-full"></div>
                              <span>{ingredient.amount} {ingredient.unit} {ingredient.productId}</span>
                            </div>
                          ))}
                          {recipe.ingredients.length > 3 && (
                            <div className="text-muted-foreground">
                              +{recipe.ingredients.length - 3} more ingredients
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Store the recipe in localStorage or navigate to a detail page
                          localStorage.setItem('generatedRecipe', JSON.stringify(recipe));
                          toast.success("Recipe saved! You can view it in your meals.");
                        }}
                      >
                        Save Recipe
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}


