import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
// import { fetchMeals, insertMealLog } from "@/integrations/supabase/queries";

import oat from "@/assets/meal-oatmeal-berries.jpg";
import avo from "@/assets/meal-avocado-toast.jpg";
import yogurt from "@/assets/meal-greek-yogurt-berries.jpg";
import chicken from "@/assets/meal-chicken-sweetpotato-greenbeans.jpg";
import quinoaSalad from "@/assets/meal-quinoa-salad.jpg";
import smoothie from "@/assets/meal-smoothie-bowl.jpg";
import salmon from "@/assets/meal-salmon-quinoa.jpg";
import tofu from "@/assets/meal-tofu-stirfry.jpg";
import omelette from "@/assets/meal-omelette-spinach.jpg";

const recommendedMealsStatic = [
  { id: 1, time: "Breakfast", kcal: 350, img: oat, title: "Oatmeal with Almonds & Berries", macros: { c: 45, p: 12, f: 14 } },
  { id: 2, time: "Lunch", kcal: 450, img: avo, title: "Avocado Toast with Egg", macros: { c: 40, p: 18, f: 18 } },
  { id: 3, time: "Snack", kcal: 200, img: yogurt, title: "Greek Yogurt with Berries", macros: { c: 18, p: 14, f: 9 } },
  { id: 4, time: "Dinner", kcal: 600, img: chicken, title: "Grilled Chicken, Sweet Potato & Greens", macros: { c: 45, p: 42, f: 18 } },
  { id: 5, time: "Lunch", kcal: 380, img: quinoaSalad, title: "Quinoa Power Salad", macros: { c: 35, p: 16, f: 12 } },
  { id: 6, time: "Breakfast", kcal: 320, img: smoothie, title: "Acai Smoothie Bowl", macros: { c: 42, p: 10, f: 8 } },
  { id: 7, time: "Dinner", kcal: 520, img: salmon, title: "Grilled Salmon with Quinoa", macros: { c: 38, p: 35, f: 22 } },
  { id: 8, time: "Dinner", kcal: 410, img: tofu, title: "Tofu Vegetable Stir-fry", macros: { c: 32, p: 20, f: 16 } },
  { id: 9, time: "Breakfast", kcal: 290, img: omelette, title: "Spinach & Cheese Omelette", macros: { c: 8, p: 24, f: 18 } },
];

interface Meal {
  id: string | number;
  time: string;
  kcal: number;
  img: string;
  title: string;
  macros: { c: number; p: number; f: number };
}

interface AddMealsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMeal: (meal: Meal) => void;
  filterTime?: "Breakfast" | "Lunch" | "Snack" | "Dinner";
}

export function AddMealsDialog({ open, onOpenChange, onAddMeal, filterTime }: AddMealsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dbMeals, setDbMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Skip loading meals from database since we have a proper meal tracking system
    // Just use static meals for now
    setDbMeals([]);
  }, []);

  const allMeals = [...dbMeals, ...recommendedMealsStatic];
  const filteredMeals = allMeals
    .filter((meal) => (filterTime ? meal.time === filterTime : true))
    .filter((meal) =>
      meal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.time.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAddMeal = (meal: Meal) => {
    onAddMeal(meal);
    // In swap mode, just replace the card; do not show 'added' toast
    if (filterTime) return;
    
    toast.success("Meal Added", { 
      description: `${meal.title} has been added to your food log.` 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-background border">
        <DialogHeader>
          <DialogTitle>{filterTime ? `Choose a ${filterTime}` : "Add Meals to Food Log"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Recommended meals */}
          <div>
            <h3 className="text-sm font-medium mb-3">Recommended Meals</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 gap-3">
                {isLoading && (
                  <div className="text-center py-4 text-muted-foreground">Loading meals...</div>
                )}
                {filteredMeals.map((meal) => (
                  <div
                    key={`${meal.id}-${meal.title}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <img 
                      src={meal.img} 
                      alt={`${meal.title} photo`} 
                      loading="lazy" 
                      className="h-16 w-16 rounded-md object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {meal.time}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {meal.kcal} kcal
                        </span>
                      </div>
                      <p className="font-medium text-sm truncate mb-1">
                        {meal.title}
                      </p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>C {meal.macros.c}g</span>
                        <span>P {meal.macros.p}g</span>
                        <span>F {meal.macros.f}g</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddMeal(meal)}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      {filterTime ? "Swap" : "Add"}
                    </Button>
                  </div>
                ))}
              </div>
              
              {filteredMeals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No meals found matching "{searchQuery}"</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}