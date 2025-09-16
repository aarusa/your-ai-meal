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

  const handleGenerate = () => {
    toast.success("Meal plan generated", {
      description: `Type: ${mealType} • ${calories} kcal • ${protein}g protein • ${servings} serving(s)`
    });
    navigate("/");
  };

  // Load options from database (if available)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Example tables: dietary_preferences, allergy_options
        const { data: dp, error: dpe } = await supabase.from("dietary_preferences").select("name");
        if (!dpe && dp && dp.length > 0) setDietaryOptions(dp.map((r: any) => r.name));

        const { data: ao, error: aoe } = await supabase.from("allergy_options").select("name");
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
              <Button size="lg" className="px-8" onClick={handleGenerate} aria-label="Generate meal plan with AI">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


