import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, ChefHat, Plus, Minus, X, Clock, Users, Star, History, Sparkles, Heart, ThumbsUp, ThumbsDown } from "lucide-react";
import { DashboardHeader } from "@/components/yam/Header";
import { usePantry } from "@/contexts/PantryContext";
import { Recipe } from "@/data/recipes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserMealsSimple, apiMealToRecipe, ApiMeal } from "@/lib/api";

export default function MyPantry() {
  const navigate = useNavigate();
  const { pantryItems, removeFromPantry, updateQuantity, addToPantry } = usePantry();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storedMeals, setStoredMeals] = useState<ApiMeal[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [activeTab, setActiveTab] = useState("generated");

  const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";

  // Load stored meals from database
  const loadStoredMeals = async () => {
    try {
      setIsLoadingMeals(true);
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      
      if (userId) {
        const meals = await fetchUserMealsSimple(userId);
        setStoredMeals(meals);
      }
    } catch (error) {
      console.error('Error loading stored meals:', error);
      toast.error('Failed to load meal history');
    } finally {
      setIsLoadingMeals(false);
    }
  };

  useEffect(() => {
    loadStoredMeals();
  }, []);

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
       
       if (json.stored) {
         toast.success(`Generated and saved ${recipes.length} AI recipe(s) to your meals!`);
         // Refresh stored meals to show the new ones
         loadStoredMeals();
         // Switch to generated tab to show new recipes
         setActiveTab("generated");
       } else {
         toast.success(`Generated ${recipes.length} AI recipe(s)!`);
       }
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

  const handleRateMeal = async (mealId: string, rating: number) => {
    try {
      // Here you would call the API to update meal rating
      // For now, just show a toast
      toast.success(`Rated meal ${rating} stars!`);
      loadStoredMeals(); // Refresh to show updated rating
    } catch (error) {
      toast.error('Failed to rate meal');
    }
  };

  const handleFavoriteMeal = async (mealId: string) => {
    try {
      // Here you would call the API to toggle favorite status
      toast.success('Added to favorites!');
      loadStoredMeals(); // Refresh to show updated status
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

        {/* Meal Tabs Section */}
        {showRecipes && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Your Meals
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowRecipes(false)}
              >
                Hide Meals
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="generated" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generated Meals
                  {generatedRecipes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {generatedRecipes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Meal History
                  {storedMeals.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {storedMeals.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Generated Meals Tab */}
              <TabsContent value="generated" className="space-y-6">
                {generatedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedRecipes.map((recipe) => (
                      <Card key={recipe.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20">
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
                              <Users className="h-4 w-4" />
                              {recipe.servings}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Star className="h-4 w-4" />
                              {recipe.difficulty}
                            </div>
                          </div>

                          {/* Nutrition Highlight */}
                          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-primary text-lg">{recipe.nutrition.calories}</div>
                                <div className="text-xs text-muted-foreground">Calories</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-lg">{recipe.nutrition.protein}g</div>
                                <div className="text-xs text-muted-foreground">Protein</div>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {recipe.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {recipe.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{recipe.tags.length - 3} more
                              </Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline"
                              className="flex-1 h-9 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRecipeDetails(recipe);
                              }}
                            >
                              View Details
                            </Button>
                            <Button 
                              className="flex-1 h-9 text-sm" 
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddRecipeToMealPlan(recipe);
                              }}
                            >
                              <ChefHat className="h-4 w-4 mr-1" />
                              Cook
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Generated Meals</h3>
                    <p className="text-muted-foreground">
                      Select ingredients and click "Show Recipes" to generate AI-powered meal suggestions.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Meal History Tab */}
              <TabsContent value="history" className="space-y-6">
                {isLoadingMeals ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your meal history...</p>
                  </div>
                ) : storedMeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storedMeals.map((meal) => {
                      const recipe = apiMealToRecipe(meal);
                      return (
                        <Card key={meal.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <History className="h-4 w-4 text-muted-foreground" />
                                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                    {meal.name}
                                  </CardTitle>
                                  {meal.is_favorited && (
                                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {meal.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Created {formatDate(meal.created_at)}
                                </p>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {meal.meal_type}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Quick Stats */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {meal.total_time_minutes}min
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {meal.servings}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Star className="h-4 w-4" />
                                {meal.difficulty_level}
                              </div>
                            </div>

                            {/* Status & Rating */}
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={meal.status === 'accepted' ? 'default' : meal.status === 'rejected' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {meal.status}
                              </Badge>
                              {meal.user_rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < meal.user_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Nutrition */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span>Calories:</span>
                                  <span className="font-medium">{meal.total_calories}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Protein:</span>
                                  <span className="font-medium">{meal.total_protein}g</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleViewRecipeDetails(recipe)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleFavoriteMeal(meal.id)}
                              >
                                <Heart className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleRateMeal(meal.id, 5)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Meal History</h3>
                    <p className="text-muted-foreground">
                      Your generated and saved meals will appear here.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
