import { useEffect, useState } from "react";
import { Droplets, Utensils, BookOpen, ChefHat, RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/yam/Header";
import { RightPanel } from "@/components/yam/RightPanel";
import { MenuGrid } from "@/components/yam/MenuGrid";
import { Card, CardContent } from "@/components/ui/card";
import { MealCard } from "@/components/yam/MealCard";
import { AddMealsDialog } from "@/components/yam/AddMealsDialog";
import { toast } from "sonner";
import { CaloriesCard } from "@/components/yam/CaloriesCard";
import { useNavigate } from "react-router-dom";
import { generateDailyMealPlan, getRandomImage, DailyMealPlan, AIRecipe } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useSimpleMealTracking } from "@/hooks/useSimpleMealTracking";

import oat from "@/assets/meal-oatmeal-berries.jpg";
import avo from "@/assets/meal-avocado-toast.jpg";
import yogurt from "@/assets/meal-greek-yogurt-berries.jpg";
import chicken from "@/assets/meal-chicken-sweetpotato-greenbeans.jpg";

// Generate local food image URL - same logic as backend
  const generateLocalFoodImage = (mealName: string, category: string) => {
  const categoryMap: { [key: string]: string } = {
    'breakfast': 'breakfast',
    'lunch': 'lunch', 
    'snack': 'snack',
    'dinner': 'dinner',
    'dessert': 'snack'
  };
  
  const imageFolder = categoryMap[category?.toLowerCase()] || 'general';
  
  // Create a seed based on meal name for consistency (same as backend)
  const seed = mealName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use a more random approach - cycle through images 1-9 (only 9 images available)
  const imageNumber = (seed % 9) + 1;
  
  const imagePath = `/food-images/${imageFolder}/food-${imageNumber}.jpg`;
  console.log('🍽️ Generated local food image:', {
    mealName,
    category,
    imageFolder,
    imageNumber,
    imagePath,
    fullUrl: `${window.location.origin}${imagePath}`
  });
  
  return imagePath;
};

// Generate random image from general folder as ultimate fallback
const generateRandomGeneralImage = (mealName: string) => {
  // Create a seed based on meal name for consistency
  const seed = mealName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Randomly select from general folder images 1-9 (only 9 images available)
  const imageNumber = (seed % 9) + 1;
  
  const imagePath = `/food-images/general/food-${imageNumber}.jpg`;
  console.log('🎲 Generated random general image:', {
    mealName,
    imageNumber,
    imagePath,
    fullUrl: `${window.location.origin}${imagePath}`
  });
  
  return imagePath;
};

// Fallback meals if AI generation fails - will be updated with random images from API
const fallbackMeals = [
  { id: "oatmeal-berries", time: "Breakfast", kcal: 350, img: "/placeholder.svg", title: "Oatmeal with Almonds & Berries", macros: { c: 45, p: 12, f: 14 }, recipeData: null },
  { id: "avocado-toast", time: "Lunch", kcal: 450, img: "/placeholder.svg", title: "Avocado Toast with Egg", macros: { c: 40, p: 18, f: 18 }, recipeData: null },
  { id: "greek-yogurt-berries", time: "Snack", kcal: 200, img: "/placeholder.svg", title: "Greek Yogurt with Berries", macros: { c: 18, p: 14, f: 9 }, recipeData: null },
  { id: "chicken-sweetpotato", time: "Dinner", kcal: 600, img: "/placeholder.svg", title: "Grilled Chicken, Sweet Potato & Greens", macros: { c: 45, p: 42, f: 18 }, recipeData: null },
];


const Index = () => {
  const navigate = useNavigate();
  const [checkedMeals, setCheckedMeals] = useState<Record<number, boolean>>({});
  const [foodLogMeals, setFoodLogMeals] = useState<typeof fallbackMeals>([]);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapFilter, setSwapFilter] = useState<"Breakfast" | "Lunch" | "Snack" | "Dinner" | undefined>(undefined);
  const [currentMeals, setCurrentMeals] = useState<ConvertedMeal[]>(fallbackMeals);
  const [dailyPlan, setDailyPlan] = useState<DailyMealPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Simple meal tracking
  const { logMeal } = useSimpleMealTracking();
  

  // Convert AI recipe to meal format for MealCard
  const convertAIRecipeToMeal = (recipe: AIRecipe) => {
    // Always ensure we have a valid image URL
    const imageUrl = recipe.image_url || generateLocalFoodImage(recipe.name, recipe.category);
    console.log('Converting AI recipe to meal:', {
      name: recipe.name,
      category: recipe.category,
      imageUrl: imageUrl,
      hasImageUrl: !!recipe.image_url
    });
    
    return {
      id: recipe.id,
      time: recipe.category,
      kcal: recipe.nutrition.calories,
      img: imageUrl,
      title: recipe.name,
      macros: { 
        c: recipe.nutrition.carbs, 
        p: recipe.nutrition.protein, 
        f: recipe.nutrition.fat 
      },
      // Store full recipe data for detail view
      recipeData: recipe
    };
  };

  // Type for converted meals
  type ConvertedMeal = ReturnType<typeof convertAIRecipeToMeal>;

  // Generate daily meal plan
  const generateDailyPlan = async (forceRefresh = false) => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `dailyPlan_${today}`;
    
    // Check if we already have today's plan cached
    if (!forceRefresh) {
      const cachedPlan = localStorage.getItem(cacheKey);
      if (cachedPlan) {
        try {
          const plan = JSON.parse(cachedPlan);
          setDailyPlan(plan);
          const convertedMeals = plan.meals.map(convertAIRecipeToMeal);
          const mealsWithImages = await ensureMealsHaveImages(convertedMeals);
          setCurrentMeals(mealsWithImages);
          setIsInitialLoading(false);
          return;
        } catch (error) {
          console.warn('Failed to parse cached plan:', error);
        }
      }
    }
    
    setIsGeneratingPlan(true);
    try {
      const plan = await generateDailyMealPlan();
      setDailyPlan(plan);
      
      // Cache the plan for today
      localStorage.setItem(cacheKey, JSON.stringify(plan));
      
      // Convert AI recipes to meal format and ensure all have images
      const convertedMeals = plan.meals.map(convertAIRecipeToMeal);
      const mealsWithImages = await ensureMealsHaveImages(convertedMeals);
      setCurrentMeals(mealsWithImages);
      
      toast.success("Daily meal plan generated!", {
        description: "Your personalized 4-course meal plan is ready"
      });
    } catch (error) {
      console.error('Error generating daily plan:', error);
      toast.error("Failed to generate meal plan", {
        description: "Using fallback meals instead"
      });
      // Use fallback meals with random images from API
      const fallbackMealsWithImages = await loadFallbackImagesFromAPI();
      setCurrentMeals(fallbackMealsWithImages);
    } finally {
      setIsGeneratingPlan(false);
      setIsInitialLoading(false);
    }
  };

  // Load random images for fallback meals using API
  const loadFallbackImagesFromAPI = async () => {
    console.log('Loading fallback images from API for meals:', fallbackMeals.map(m => ({ title: m.title, time: m.time })));
    
    try {
      const updatedMeals = await Promise.all(
        fallbackMeals.map(async (meal, index) => {
          console.log(`Loading image for meal ${index + 1}: ${meal.title} (${meal.time})`);
          try {
            const randomImage = await getRandomImage(meal.time.toLowerCase(), meal.title);
            console.log(`Successfully loaded image for ${meal.title}:`, randomImage);
            return { ...meal, img: randomImage };
          } catch (mealError) {
            console.error(`Failed to load image for ${meal.title}:`, mealError);
            const fallbackImage = generateLocalFoodImage(meal.title, meal.time);
            console.log(`Using fallback image for ${meal.title}:`, fallbackImage);
            return { ...meal, img: fallbackImage };
          }
        })
      );
      console.log('All fallback images loaded:', updatedMeals.map(m => ({ title: m.title, img: m.img })));
      return updatedMeals;
    } catch (error) {
      console.error('Failed to load fallback images from API:', error);
      // Fallback to local image generation
      const localFallback = fallbackMeals.map(meal => ({
        ...meal,
        img: generateLocalFoodImage(meal.title, meal.time)
      }));
      console.log('Using local fallback images:', localFallback.map(m => ({ title: m.title, img: m.img })));
      return localFallback;
    }
  };

  // Ensure all meals have images - try API first, fallback to local
  const ensureMealsHaveImages = async (meals: ConvertedMeal[]) => {
    const updatedMeals = await Promise.all(
      meals.map(async (meal) => {
        if (!meal.img || meal.img === '/placeholder.svg') {
          try {
            // Try to get random image from API first
            const randomImage = await getRandomImage(meal.time.toLowerCase(), meal.title);
            console.log('Ensuring meal has image from API:', {
              title: meal.title,
              time: meal.time,
              originalImg: meal.img,
              newImg: randomImage
            });
            return { ...meal, img: randomImage };
          } catch (error) {
            // Fallback to local image generation, then to general folder
            const categoryImage = generateLocalFoodImage(meal.title, meal.time);
            const generalImage = generateRandomGeneralImage(meal.title);
            const imageUrl = categoryImage || generalImage;
            
            console.log('Ensuring meal has image (fallback to local):', {
              title: meal.title,
              time: meal.time,
              originalImg: meal.img,
              categoryImg: categoryImage,
              generalImg: generalImage,
              finalImg: imageUrl
            });
            return { ...meal, img: imageUrl };
          }
        }
        return meal;
      })
    );
    return updatedMeals;
  };

  // Test API connectivity
  const testAPIConnectivity = async () => {
    try {
      console.log('Testing API connectivity...');
      const testImage = await getRandomImage('lunch', 'test');
      console.log('API test successful, got image:', testImage);
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  };

  // Load daily plan on component mount
  useEffect(() => {
    generateDailyPlan();
    // Test API connectivity
    testAPIConnectivity();
  }, []);

  // Load fallback images on component mount as backup
  useEffect(() => {
    const loadInitialFallbackImages = async () => {
      console.log('Loading initial fallback images...');
      console.log('Current meals state:', currentMeals.map(m => ({ title: m.title, img: m.img })));
      
      try {
        const fallbackMealsWithImages = await loadFallbackImagesFromAPI();
        console.log('Loaded fallback images:', fallbackMealsWithImages.map(m => ({ title: m.title, img: m.img })));
        
        // Only set if no AI meals are loaded yet
        if (currentMeals.length === 0 || currentMeals.every(meal => meal.img === '/placeholder.svg')) {
          console.log('Setting fallback meals as current meals');
          setCurrentMeals(fallbackMealsWithImages);
        } else {
          console.log('AI meals already loaded, not setting fallback meals');
        }
      } catch (error) {
        console.error('Failed to load initial fallback images:', error);
        // Emergency fallback - ensure all meals have at least local images
        const emergencyFallback = fallbackMeals.map(meal => {
          const categoryImage = generateLocalFoodImage(meal.title, meal.time);
          const generalImage = generateRandomGeneralImage(meal.title);
          return {
            ...meal,
            img: categoryImage || generalImage
          };
        });
        console.log('Using emergency fallback with local images:', emergencyFallback.map(m => ({ title: m.title, img: m.img })));
        setCurrentMeals(emergencyFallback);
      }
    };
    
    loadInitialFallbackImages();
  }, []);

  // Ensure all meals have images whenever currentMeals changes
  useEffect(() => {
    const updateMealsWithImages = async () => {
      if (currentMeals.length > 0) {
        console.log('Checking meals for missing images:', currentMeals.map(m => ({ title: m.title, img: m.img })));
        
        // Check if any meals are missing images
        const mealsNeedingImages = currentMeals.filter(meal => 
          !meal.img || meal.img === '/placeholder.svg'
        );
        
        if (mealsNeedingImages.length > 0) {
          console.log('Found meals needing images:', mealsNeedingImages.map(m => m.title));
          const mealsWithImages = await ensureMealsHaveImages(currentMeals);
          console.log('Updated meals with images:', mealsWithImages.map(m => ({ title: m.title, img: m.img })));
          setCurrentMeals(mealsWithImages);
        } else {
          console.log('All meals already have images');
        }
      }
    };
    
    updateMealsWithImages();
  }, [currentMeals.length]); // Only run when the number of meals changes

  // Additional check for placeholder images - run after a short delay
  useEffect(() => {
    const checkForPlaceholders = () => {
      const hasPlaceholders = currentMeals.some(meal => 
        meal.img === '/placeholder.svg' || !meal.img
      );
      
      if (hasPlaceholders) {
        console.log('Found placeholder images, updating...');
        const updatedMeals = currentMeals.map(meal => {
          if (!meal.img || meal.img === '/placeholder.svg') {
            // Try category-specific image first, then fallback to general
            const categoryImage = generateLocalFoodImage(meal.title, meal.time);
            const generalImage = generateRandomGeneralImage(meal.title);
            
            return {
              ...meal,
              img: categoryImage || generalImage
            };
          }
          return meal;
        });
        setCurrentMeals(updatedMeals);
      }
    };
    
    // Run after a short delay to allow for initial loading
    const timeoutId = setTimeout(checkForPlaceholders, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentMeals]);


  const handleTrackClick = async (meal: any) => {
    console.log('Track button clicked for:', meal.title);
    console.log('Meal data:', {
      title: meal.title,
      time: meal.time,
      kcal: meal.kcal,
      recipeData: meal.recipeData,
      mealId: meal.recipeData?.id
    });
    
    try {
      // Log to database - only include mealId if it's a valid UUID
      const mealId = meal.recipeData?.id;
      const isValidUUID = mealId && typeof mealId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(mealId);
      
      console.log('Meal ID validation:', { mealId, isValidUUID });
      
      const loggedMeal = await logMeal({
        mealId: isValidUUID ? mealId : undefined,
        mealName: meal.title,
        mealType: meal.time.toLowerCase(),
        calories: meal.kcal
      });
      
      if (loggedMeal) {
        // Add to local food log for UI
        const newIndex = foodLogMeals.length;
        setFoodLogMeals(prev => [...prev, meal]);
        setCheckedMeals(prev => ({ ...prev, [newIndex]: true }));
        
        console.log('✅ Meal tracked successfully:', loggedMeal);
      }
    } catch (error) {
      console.error('❌ Error tracking meal:', error);
      // Still add to local food log even if database fails
      const newIndex = foodLogMeals.length;
      setFoodLogMeals(prev => [...prev, meal]);
      setCheckedMeals(prev => ({ ...prev, [newIndex]: true }));
    }
  };

  const handleAddMeal = (newMeal: any) => {
    const mealToAdd = {
      id: newMeal.id || `meal-${Date.now()}`,
      time: newMeal.time,
      kcal: newMeal.kcal,
      img: newMeal.img,
      title: newMeal.title,
      macros: newMeal.macros,
      recipeData: newMeal.recipeData || null
    };
    
    if (swapFilter) {
      // Replace the current meal in the plan
      setCurrentMeals(prev => prev.map(meal => 
        meal.time === swapFilter ? mealToAdd : meal
      ));
      toast.success("Meal swapped", { description: `${swapFilter} updated to ${mealToAdd.title}` });
      setSwapOpen(false);
      setSwapFilter(undefined);
    } else {
      // Add to food log
      setFoodLogMeals(prev => [...prev, mealToAdd]);
    }
  };

  const handleRemoveMeal = (index: number) => {
    setFoodLogMeals(prev => prev.filter((_, i) => i !== index));
    // Also remove from checked meals and reindex
    setCheckedMeals(prev => {
      const newChecked: Record<number, boolean> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const keyNum = parseInt(key);
        if (keyNum < index) {
          newChecked[keyNum] = value;
        } else if (keyNum > index) {
          newChecked[keyNum - 1] = value;
        }
        // Skip the removed item (keyNum === index)
      });
      return newChecked;
    });
  };

  // Signature spotlight interaction
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100 + "%";
      const y = (e.clientY / (window.innerHeight * 1.2)) * 100 + "%";
      document.documentElement.style.setProperty("--spot-x", x);
      document.documentElement.style.setProperty("--spot-y", y);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* SEO H1 */}
      <h1 className="sr-only">YAM — Your personalized nutrition dashboard</h1>

      <DashboardHeader />

      <main className="container max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-x-hidden">
        <section className="lg:col-span-8 space-y-6">
          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="group cursor-pointer hover:shadow-md transition" onClick={() => navigate('/pantry')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">My Pantry</div>
                  <div className="text-xs text-muted-foreground">Manage your ingredients</div>
                </div>
              </CardContent>
            </Card>
            <Card className="group cursor-pointer hover:shadow-md transition" onClick={() => navigate('/meals')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <ChefHat className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">My Meals</div>
                  <div className="text-xs text-muted-foreground">View generated meals</div>
                </div>
              </CardContent>
            </Card>
            <Card className="group cursor-pointer hover:shadow-md transition">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">Log water</div>
                  <div className="text-xs text-muted-foreground">Track your hydration quickly</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended meal plan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Today's meal plan</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateDailyPlan(true)}
                disabled={isGeneratingPlan}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
                {isGeneratingPlan ? 'Generating...' : 'Refresh Plan'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isInitialLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-56 bg-muted"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                currentMeals.map((meal, index) => {
                  // Ensure each meal has a valid image - try multiple fallbacks
                  let finalImage = meal.img;
                  
                  // If no image or placeholder, generate one
                  if (!finalImage || finalImage === '/placeholder.svg') {
                    const categoryImage = generateLocalFoodImage(meal.title, meal.time);
                    console.log(`Generated category image for ${meal.title}:`, categoryImage);
                    finalImage = categoryImage;
                  }
                  
                  // Double-check we have a valid image
                  if (!finalImage || finalImage === '/placeholder.svg') {
                    // Ultimate fallback - use random image from general folder
                    finalImage = generateRandomGeneralImage(meal.title);
                    console.log(`🎲 Ultimate fallback - random general image for ${meal.title}:`, finalImage);
                  }
                  
                  console.log(`Rendering meal ${index + 1}:`, {
                    title: meal.title,
                    time: meal.time,
                    originalImage: meal.img,
                    finalImage: finalImage,
                    hasImage: !!finalImage && finalImage !== '/placeholder.svg'
                  });
                  
                  return (
                <MealCard 
                  key={`${meal.time}-${index}`}
                  mealId={meal.id}
                  label={meal.time} 
                  calories={meal.kcal} 
                  title={meal.title} 
                  image={finalImage} 
                  macros={meal.macros} 
                  showActions 
                  recipeData={meal.recipeData}
                  onTrack={() => handleTrackClick(meal)} 
                  onMissed={() => {}} 
                  onSwap={() => { setSwapFilter(meal.time as "Breakfast" | "Lunch" | "Snack" | "Dinner"); setSwapOpen(true); }}
                  disabled={false}
                />
                  );
                })
              )}
            </div>
          </div>

          {/* Calorie tracker */}
          <div>
            <CaloriesCard meals={foodLogMeals} checkedMeals={checkedMeals} />
          </div>
        </section>

        {/* Right Panel */}
        <div className="lg:col-span-4">
          <RightPanel 
            meals={foodLogMeals} 
            checkedMeals={checkedMeals} 
            onMealCheck={setCheckedMeals}
            onAddMeal={handleAddMeal}
            onRemoveMeal={handleRemoveMeal}
          />
        </div>
      </main>
      <AddMealsDialog open={swapOpen} onOpenChange={setSwapOpen} onAddMeal={handleAddMeal} filterTime={swapFilter} />
    </div>
  );
};

export default Index;
