import { useState } from "react";
import { DashboardHeader } from "@/components/yam/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { generateAIRecipe, storeMealGenerationRequest } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

export default function PlanTest() {
  const [calories, setCalories] = useState<number | undefined>(500);
  const [protein, setProtein] = useState<number | undefined>(30);
  const [mealType, setMealType] = useState<string>("dinner");
  const [cookTime, setCookTime] = useState<number | undefined>(30);
  const [servings, setServings] = useState<number | undefined>(2);
  const [dietaryPreferences, setDietaryPreferences] = useState<string>("Vegetarian, High-protein");
  const [allergies, setAllergies] = useState<string>("Nuts");
  const [favoriteCuisines, setFavoriteCuisines] = useState<string>("Italian, Thai");
  const [ingredients, setIngredients] = useState<string>("chicken breast, broccoli, garlic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    try {
      setIsGenerating(true);
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;

      // Store request
      try {
        await storeMealGenerationRequest({
          userId,
          calories,
          protein,
          mealType,
          cookTime,
          servings,
          dietaryPreferences: dietaryPreferences ? dietaryPreferences.split(",").map(s => s.trim()).filter(Boolean) : [],
          allergies: allergies ? allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
          favoriteCuisines: favoriteCuisines ? favoriteCuisines.split(",").map(s => s.trim()).filter(Boolean) : [],
        });
      } catch (e) {
        console.warn("Failed to store request", e);
      }

      // Generate
      const recipes = await generateAIRecipe({
        ingredients: ingredients ? ingredients.split(",").map(s => s.trim()).filter(Boolean) : [],
        dietaryPreferences: dietaryPreferences ? dietaryPreferences.split(",").map(s => s.trim()).filter(Boolean) : [],
        allergies: allergies ? allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
        favoriteCuisines: favoriteCuisines ? favoriteCuisines.split(",").map(s => s.trim()).filter(Boolean) : [],
        calories,
        protein,
        mealType,
        cookTime,
        servings,
      });
      setResult(recipes);
      toast.success(`Generated ${recipes.length} recipe(s)`);
    } catch (e) {
      console.error(e);
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>PlanTest - Step-by-step Tester</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Calories</label>
                <Input type="number" value={calories ?? ""} onChange={e => setCalories(e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Protein (g)</label>
                <Input type="number" value={protein ?? ""} onChange={e => setProtein(e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Meal Type</label>
                <Input value={mealType} onChange={e => setMealType(e.target.value)} placeholder="breakfast | lunch | dinner | snack" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Cook Time (min)</label>
                <Input type="number" value={cookTime ?? ""} onChange={e => setCookTime(e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Servings</label>
                <Input type="number" value={servings ?? ""} onChange={e => setServings(e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div className="sm:col-span-3">
                <label className="text-sm text-muted-foreground">Dietary Preferences (comma-separated)</label>
                <Input value={dietaryPreferences} onChange={e => setDietaryPreferences(e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <label className="text-sm text-muted-foreground">Allergies (comma-separated)</label>
                <Input value={allergies} onChange={e => setAllergies(e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <label className="text-sm text-muted-foreground">Favorite Cuisines (comma-separated)</label>
                <Input value={favoriteCuisines} onChange={e => setFavoriteCuisines(e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <label className="text-sm text-muted-foreground">Ingredients (comma-separated, optional)</label>
                <Input value={ingredients} onChange={e => setIngredients(e.target.value)} />
              </div>
            </div>

            <Separator />

            <Button onClick={handleRun} disabled={isGenerating}>
              {isGenerating ? (
                <>Generating…</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Run Generation
                </>
              )}
            </Button>

            {result && (
              <pre className="mt-4 p-3 rounded-md bg-muted overflow-auto text-xs">
{JSON.stringify(result, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


