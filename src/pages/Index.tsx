import { useEffect, useState } from "react";
import { Droplets, Utensils, BookOpen, ChefHat } from "lucide-react";
import { DashboardHeader } from "@/components/yam/Header";
import { RightPanel } from "@/components/yam/RightPanel";
import { MenuGrid } from "@/components/yam/MenuGrid";
import { Card, CardContent } from "@/components/ui/card";
import { MealCard } from "@/components/yam/MealCard";
import { AddMealsDialog } from "@/components/yam/AddMealsDialog";
import { toast } from "sonner";
import { CaloriesCard } from "@/components/yam/CaloriesCard";
import { useNavigate } from "react-router-dom";

import oat from "@/assets/meal-oatmeal-berries.jpg";
import avo from "@/assets/meal-avocado-toast.jpg";
import yogurt from "@/assets/meal-greek-yogurt-berries.jpg";
import chicken from "@/assets/meal-chicken-sweetpotato-greenbeans.jpg";

const meals = [
  { id: "oatmeal-berries", time: "Breakfast", kcal: 350, img: oat, title: "Oatmeal with Almonds & Berries", macros: { c: 45, p: 12, f: 14 } },
  { id: "avocado-toast", time: "Lunch", kcal: 450, img: avo, title: "Avocado Toast with Egg", macros: { c: 40, p: 18, f: 18 } },
  { id: "greek-yogurt-berries", time: "Snack", kcal: 200, img: yogurt, title: "Greek Yogurt with Berries", macros: { c: 18, p: 14, f: 9 } },
  { id: "chicken-sweetpotato", time: "Dinner", kcal: 600, img: chicken, title: "Grilled Chicken, Sweet Potato & Greens", macros: { c: 45, p: 42, f: 18 } },
];


const Index = () => {
  const navigate = useNavigate();
  const [checkedMeals, setCheckedMeals] = useState<Record<number, boolean>>({});
  const [foodLogMeals, setFoodLogMeals] = useState<typeof meals>([]);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapFilter, setSwapFilter] = useState<"Breakfast" | "Lunch" | "Snack" | "Dinner" | undefined>(undefined);
  const [currentMeals, setCurrentMeals] = useState(meals);
  const handleTrack = (meal: any) => {
    const newIndex = foodLogMeals.length;
    setFoodLogMeals(prev => [...prev, meal]);
    // Automatically check the newly tracked meal
    setCheckedMeals(prev => ({ ...prev, [newIndex]: true }));
  };

  const handleAddMeal = (newMeal: any) => {
    const mealToAdd = {
      id: newMeal.id || `meal-${Date.now()}`,
      time: newMeal.time,
      kcal: newMeal.kcal,
      img: newMeal.img,
      title: newMeal.title,
      macros: newMeal.macros
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
            <div className="text-sm text-muted-foreground">Today’s meal plan</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMeals.map((meal, index) => (
                <MealCard 
                  key={`${meal.time}-${index}`}
                  mealId={meal.id}
                  label={meal.time} 
                  calories={meal.kcal} 
                  title={meal.title} 
                  image={meal.img} 
                  macros={meal.macros} 
                  showActions 
                  onTrack={() => handleTrack(meal)} 
                  onMissed={() => {}} 
                  onSwap={() => { setSwapFilter(meal.time as "Breakfast" | "Lunch" | "Snack" | "Dinner"); setSwapOpen(true); }} 
                />
              ))}
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
