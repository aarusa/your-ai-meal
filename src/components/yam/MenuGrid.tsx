import { MealCard } from "./MealCard";
import oat from "@/assets/meal-oatmeal-berries.jpg";
import avo from "@/assets/meal-avocado-toast.jpg";
import yogurt from "@/assets/meal-greek-yogurt-berries.jpg";
import chicken from "@/assets/meal-chicken-sweetpotato-greenbeans.jpg";
import quinoa from "@/assets/meal-quinoa-salad.jpg";
import smoothie from "@/assets/meal-smoothie-bowl.jpg";
import salmon from "@/assets/meal-salmon-quinoa.jpg";
import tofu from "@/assets/meal-tofu-stirfry.jpg";
import omelette from "@/assets/meal-omelette-spinach.jpg";

const meals = [
  { id: "oatmeal-berries", label: "Breakfast", calories: 350, title: "Oatmeal with Almond & Berries", image: oat, macros: { c: 45, p: 12, f: 14 } },
  { id: "avocado-toast", label: "Lunch", calories: 450, title: "Avocado Toast with Egg", image: avo, macros: { c: 40, p: 18, f: 18 } },
  { id: "greek-yogurt-berries", label: "Snack", calories: 200, title: "Greek Yogurt with Berries", image: yogurt, macros: { c: 18, p: 14, f: 9 } },
  { id: "chicken-sweetpotato", label: "Dinner", calories: 520, title: "Grilled Chicken, Sweet Potato & Greens", image: chicken, macros: { c: 35, p: 42, f: 12 } },
  { id: "quinoa-salad", label: "Lunch", calories: 420, title: "Quinoa Salad with Avocado & Chickpeas", image: quinoa, macros: { c: 50, p: 16, f: 14 } },
  { id: "smoothie-bowl", label: "Breakfast", calories: 380, title: "Berry Smoothie Bowl", image: smoothie, macros: { c: 55, p: 10, f: 8 } },
  { id: "salmon-quinoa", label: "Dinner", calories: 560, title: "Grilled Salmon with Quinoa", image: salmon, macros: { c: 30, p: 40, f: 22 } },
  { id: "tofu-stirfry", label: "Dinner", calories: 480, title: "Tofu Veggie Stir-fry", image: tofu, macros: { c: 52, p: 24, f: 12 } },
  { id: "spinach-omelette", label: "Breakfast", calories: 320, title: "Spinach Omelette", image: omelette, macros: { c: 8, p: 24, f: 20 } },
];

export function MenuGrid() {
  return (
    <section aria-labelledby="recommended-menu" className="space-y-3">
      <h2 id="recommended-menu" className="text-lg font-semibold">Recommended Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {meals.map((m) => (
          <MealCard key={m.title} {...m} mealId={m.id} />
        ))}
      </div>
    </section>
  );
}
