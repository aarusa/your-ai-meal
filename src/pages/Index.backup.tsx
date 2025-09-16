import { useEffect, useState } from "react";
import { Activity, Droplets, Moon, Scale, Dumbbell } from "lucide-react";
import { DashboardHeader } from "@/components/yam/Header";
import { MetricCard } from "@/components/yam/MetricCard";
import { RightPanel } from "@/components/yam/RightPanel";
import { CaloriesCard } from "@/components/yam/CaloriesCard";
import { MenuGrid } from "@/components/yam/MenuGrid";

import oat from "@/assets/meal-oatmeal-berries.jpg";
import avo from "@/assets/meal-avocado-toast.jpg";
import yogurt from "@/assets/meal-greek-yogurt-berries.jpg";
import chicken from "@/assets/meal-chicken-sweetpotato-greenbeans.jpg";

const meals = [
  { time: "Breakfast", kcal: 350, img: oat, title: "Oatmeal with Almonds & Berries", macros: { c: 45, p: 12, f: 14 } },
  { time: "Lunch", kcal: 450, img: avo, title: "Avocado Toast with Egg", macros: { c: 40, p: 18, f: 18 } },
  { time: "Snack", kcal: 200, img: yogurt, title: "Greek Yogurt with Berries", macros: { c: 18, p: 14, f: 9 } },
  { time: "Dinner", kcal: 600, img: chicken, title: "Grilled Chicken, Sweet Potato & Greens", macros: { c: 45, p: 42, f: 18 } },
];


const IndexBackup = () => {
  const [checkedMeals, setCheckedMeals] = useState<Record<number, boolean>>({});
  const [foodLogMeals, setFoodLogMeals] = useState(meals);

  const handleAddMeal = (newMeal: any) => {
    const mealToAdd = {
      time: newMeal.time,
      kcal: newMeal.kcal,
      img: newMeal.img,
      title: newMeal.title,
      macros: newMeal.macros
    };
    setFoodLogMeals(prev => [...prev, mealToAdd]);
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
      <h1 className="sr-only">YAM — Your personalized nutrition dashboard (backup)</h1>

      <DashboardHeader />

      <main className="container max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-x-hidden">
        <section className="lg:col-span-8 space-y-6">
          {/* Recommended menu on top */}
          <MenuGrid />

          {/* Top metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Weight" value="78 kg" helper="13 kg to goal" icon={<Scale className="h-4 w-4" />} progress={75} />
            <MetricCard title="Steps" value="8050" helper="76% of goal" icon={<Activity className="h-4 w-4" />} progress={76} />
            <MetricCard title="Sleep" value="6.5 h" helper="Target 8 h" icon={<Moon className="h-4 w-4" />} progress={81} />
            <MetricCard title="Water" value="0.7 L" helper="1.3 L left" icon={<Droplets className="h-4 w-4" />} progress={35} />
          </div>

          {/* Calories & workouts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <CaloriesCard meals={foodLogMeals} checkedMeals={checkedMeals} />
            </div>
            <div className="space-y-4">
              <MetricCard title="Running" value="10 km" helper="Cardio • 75%" icon={<Activity className="h-4 w-4" />} progress={75} />
              <MetricCard title="Squats" value="50 kg" helper="Strength • 60%" icon={<Dumbbell className="h-4 w-4" />} progress={60} />
            </div>
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
    </div>
  );
};

export default IndexBackup;


