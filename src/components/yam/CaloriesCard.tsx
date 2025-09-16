import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";
import { useCalorieTarget } from "@/hooks/useCalorieTarget";

interface Meal {
  time: string;
  kcal: number;
  img: string;
  title: string;
  macros: { c: number; p: number; f: number };
}

interface CaloriesCardProps {
  meals: Meal[];
  checkedMeals: Record<number, boolean>;
}

export function CaloriesCard({ meals, checkedMeals }: CaloriesCardProps) {
  // Calculate totals from checked meals
  const loggedMeals = meals.filter((_, idx) => checkedMeals[idx]);
  const totalEaten = loggedMeals.reduce((sum, meal) => sum + meal.kcal, 0);
  const totalCarbs = loggedMeals.reduce((sum, meal) => sum + meal.macros.c, 0);
  const totalProteins = loggedMeals.reduce((sum, meal) => sum + meal.macros.p, 0);
  const totalFats = loggedMeals.reduce((sum, meal) => sum + meal.macros.f, 0);
  const { target } = useCalorieTarget();
  const dailyGoal = target ?? 2000;
  const burned = 510;
  const remaining = dailyGoal - totalEaten;
  
  // Calculate macro percentages based on calories (4 kcal per g for carbs/protein, 9 kcal per g for fat)
  const totalMacroKcal = (totalCarbs * 4) + (totalProteins * 4) + (totalFats * 9);
  const carbsPercent = totalMacroKcal > 0 ? Math.round((totalCarbs * 4 / totalMacroKcal) * 100) : 0;
  const proteinsPercent = totalMacroKcal > 0 ? Math.round((totalProteins * 4 / totalMacroKcal) * 100) : 0;
  const fatsPercent = totalMacroKcal > 0 ? Math.round((totalFats * 9 / totalMacroKcal) * 100) : 0;
  return (
    <Card className="soft-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4" />
          Calories Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold">{totalEaten} kcal</div>
            <p className="text-xs text-muted-foreground">Eaten</p>
          </div>
          <div>
            <div className="text-xl font-bold">{burned} kcal</div>
            <p className="text-xs text-muted-foreground">Burned</p>
          </div>
          <div>
            <div className="text-xl font-bold">{remaining} kcal</div>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs"><span>Carbs</span><span>{carbsPercent}%</span></div>
          <Progress value={carbsPercent} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs"><span>Proteins</span><span>{proteinsPercent}%</span></div>
          <Progress value={proteinsPercent} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs"><span>Fats</span><span>{fatsPercent}%</span></div>
          <Progress value={fatsPercent} />
        </div>
      </CardContent>
    </Card>
  );
}
