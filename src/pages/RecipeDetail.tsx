import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Users, Star, ChefHat, Flame, Zap, Droplets, Target, Plus } from "lucide-react";
import { getRecipeById, Recipe } from "@/data/recipes";
import { DashboardHeader } from "@/components/yam/Header";
import { usePantry } from "@/contexts/PantryContext";
import { toast } from "sonner";

export default function RecipeDetail() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { addToPantry } = usePantry();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (recipeId) {
      const foundRecipe = getRecipeById(recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        // Recipe not found, redirect to pantry
        navigate("/pantry");
      }
    }
  }, [recipeId, navigate]);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">Recipe not found</h1>
            <Button onClick={() => navigate("/pantry")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pantry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate macro percentages
  const totalMacroKcal = (recipe.nutrition.carbs * 4) + (recipe.nutrition.protein * 4) + (recipe.nutrition.fat * 9);
  const carbsPercent = totalMacroKcal > 0 ? Math.round((recipe.nutrition.carbs * 4 / totalMacroKcal) * 100) : 0;
  const proteinPercent = totalMacroKcal > 0 ? Math.round((recipe.nutrition.protein * 4 / totalMacroKcal) * 100) : 0;
  const fatPercent = totalMacroKcal > 0 ? Math.round((recipe.nutrition.fat * 9 / totalMacroKcal) * 100) : 0;

  const handleAddToMealPlan = () => {
    if (recipe) {
      // Add all recipe ingredients to pantry
      recipe.ingredients.forEach(ingredient => {
        // Create a product object from the ingredient
        const product = {
          id: ingredient.productId,
          name: ingredient.productId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: "Recipe Ingredient",
          calories: 0, // We don't have individual product calories here
          protein: 0,
          carbs: 0,
          fat: 0,
          description: `Ingredient for ${recipe.name}`
        };
        addToPantry(product, ingredient.amount);
      });
      
      toast.success(`Added ${recipe.name} ingredients to your pantry!`);
      navigate("/pantry");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/pantry")} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pantry
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recipe Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="soft-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{recipe.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{recipe.category}</Badge>
                      <Badge variant="outline">{recipe.difficulty}</Badge>
                    </div>
                    <p className="text-muted-foreground">{recipe.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recipe Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{recipe.nutrition.calories}</div>
                      <div className="text-sm text-muted-foreground">Calories</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-blue-600">{recipe.nutrition.protein}g</div>
                      <div className="text-sm text-muted-foreground">Protein</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-green-600">{recipe.nutrition.carbs}g</div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.fat}g</div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>

                  {/* Recipe Details */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{recipe.prepTime + recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{recipe.difficulty}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                      <span className="text-muted-foreground">{ingredient.productId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Add to Meal Plan Button */}
            <Card className="soft-shadow">
              <CardContent className="p-6 text-center">
                <Button 
                  onClick={handleAddToMealPlan}
                  size="lg"
                  className="w-full"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add This to Meal Plan
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will add all recipe ingredients to your pantry
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Macro Breakdown */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Macro Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      Carbohydrates
                    </span>
                    <span>{carbsPercent}%</span>
                  </div>
                  <Progress value={carbsPercent} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-blue-600" />
                      Protein
                    </span>
                    <span>{proteinPercent}%</span>
                  </div>
                  <Progress value={proteinPercent} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-orange-600" />
                      Fat
                    </span>
                    <span>{fatPercent}%</span>
                  </div>
                  <Progress value={fatPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Recipe Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{recipe.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prep Time:</span>
                  <span className="font-medium">{recipe.prepTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cook Time:</span>
                  <span className="font-medium">{recipe.cookTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="font-medium">{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servings:</span>
                  <span className="font-medium">{recipe.servings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium">{recipe.difficulty}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
