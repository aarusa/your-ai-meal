import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, ChefHat, Plus, Minus, X, Clock, Users, Star } from "lucide-react";
import { DashboardHeader } from "@/components/yam/Header";
import { usePantry } from "@/contexts/PantryContext";
import { Recipe } from "@/data/recipes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function MyPantry() {
  const navigate = useNavigate();
  const { pantryItems, removeFromPantry, updateQuantity, addToPantry } = usePantry();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";

  const toggleSelection = (productId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(pantryItems.map(item => item.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleGenerateMeal = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one ingredient to generate a meal");
      return;
    }

    try {
      setIsGenerating(true);
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id || null;

      const selected = pantryItems.filter(p => selectedItems.has(p.id));
      const body = {
        userId,
        ingredients: selected.map(p => ({ id: p.id, name: p.name })),
        servings: 2,
      };

      const resp = await fetch(`${API_BASE}/api/ai/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Failed to generate recipes (${resp.status})`);
      }

      const json = await resp.json();
      const recipes: Recipe[] = Array.isArray(json.recipes) ? json.recipes : [];

      if (!recipes.length) {
        toast.error("AI didn't return any recipes. Try different ingredients.");
        return;
      }

      setGeneratedRecipes(recipes);
      setShowRecipes(true);
      toast.success("Meal generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate recipes");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddRecipeToMealPlan = (recipe: Recipe) => {
    // Add recipe as a meal to dashboard (this would need to be implemented in the dashboard state management)
    // For now, we'll just show a success message and redirect
    toast.success(`Added ${recipe.name} to your dashboard!`);
    navigate("/"); // Redirect to dashboard
  };

  const handleViewRecipeDetails = (recipe: Recipe) => {
    // Navigate to meal detail page using recipe ID
    navigate(`/meal/${recipe.id}`);
  };

  const selectedCount = selectedItems.size;
  const totalCalories = pantryItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.calories * item.quantity), 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            My Pantry
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your ingredients and discover recipes
          </p>
        </div>

        {/* Action buttons */}
        {pantryItems.length > 0 && (
          <div className="flex items-center justify-end gap-2 mb-6">
            <Button
              variant="outline"
              onClick={selectAll}
              disabled={selectedCount === pantryItems.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              onClick={deselectAll}
              disabled={selectedCount === 0}
            >
              Deselect All
            </Button>
          </div>
        )}

        {/* Stats */}
        {pantryItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="soft-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{pantryItems.length}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </CardContent>
            </Card>
            <Card className="soft-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedCount}</div>
                <div className="text-sm text-muted-foreground">Selected Items</div>
              </CardContent>
            </Card>
            <Card className="soft-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalCalories}</div>
                <div className="text-sm text-muted-foreground">Total Calories</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pantry Items */}
        {pantryItems.length === 0 ? (
          <Card className="soft-shadow">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Your pantry is empty</h3>
              <p className="text-muted-foreground mb-4">
                Add ingredients to your pantry by searching for products and clicking "Add to My Pantry"
              </p>
              <Button onClick={() => navigate("/")} variant="hero">
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pantryItems.map((item) => (
              <Card key={item.id} className="soft-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleSelection(item.id)}
                      className="h-5 w-5"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{item.calories} kcal</span>
                        <span>P: {item.protein}g</span>
                        <span>C: {item.carbs}g</span>
                        <span>F: {item.fat}g</span>
                        <span className="text-xs">
                          Added {item.addedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <div className="text-center min-w-[3rem]">
                        <div className="font-semibold">{item.quantity}</div>
                        <div className="text-xs text-muted-foreground">servings</div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromPantry(item.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Show Recipes Button */}
        {pantryItems.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleGenerateMeal}
              size="lg"
              className="px-8 py-3 text-lg"
              disabled={selectedCount === 0 || isGenerating}
            >
              <ChefHat className="h-5 w-5 mr-2" />
              {isGenerating ? "Generating..." : "Show Recipes"}
              {selectedCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCount} ingredients
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Featured Generated Meal */}
        {showRecipes && generatedRecipes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-3">Today's Pick</h2>
            {(() => {
              const recipe = generatedRecipes[0];
              return (
                <Card className="soft-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{recipe.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {recipe.description}
                        </p>
                      </div>
                      <Badge variant="secondary">{recipe.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.prepTime + recipe.cookTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {recipe.difficulty}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
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

                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewRecipeDetails(recipe)}
                      >
                        View Details
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="hero"
                        onClick={() => handleAddRecipeToMealPlan(recipe)}
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Add to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        )}

        {/* More Ideas */}
        {showRecipes && generatedRecipes.length > 1 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">More ideas</h2>
              <Button
                variant="outline"
                onClick={() => setShowRecipes(false)}
              >
                Hide Recipes
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedRecipes.slice(1).map((recipe) => (
                <Card key={recipe.id} className="soft-shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewRecipeDetails(recipe)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {recipe.description}
                        </p>
                      </div>
                      <Badge variant="secondary">{recipe.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Recipe Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.prepTime + recipe.cookTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {recipe.difficulty}
                      </div>
                    </div>

                    {/* Nutrition */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
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

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Instructions Preview */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1">
                        {recipe.instructions.slice(0, 3).map((instruction, index) => (
                          <li key={index} className="flex">
                            <span className="font-medium mr-2">{index + 1}.</span>
                            {instruction}
                          </li>
                        ))}
                        {recipe.instructions.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            ... and {recipe.instructions.length - 3} more steps
                          </li>
                        )}
                      </ol>
                    </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRecipeDetails(recipe);
                            }}
                          >
                            View Details
                          </Button>
                          <Button 
                            className="flex-1" 
                            variant="hero"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRecipeToMealPlan(recipe);
                            }}
                          >
                            <ChefHat className="h-4 w-4 mr-2" />
                            Add to Dashboard
                          </Button>
                        </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
