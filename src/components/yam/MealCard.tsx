import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface MealCardProps {
  label: string;
  calories: number;
  title: string;
  image: string;
  macros: { c: number; p: number; f: number };
  className?: string;
  mealId?: string;
  showActions?: boolean;
  onTrack?: () => void;
  onMissed?: () => void;
  onSwap?: () => void;
  recipeData?: any; // AI recipe data for detail view
}

export function MealCard({ label, calories, title, image, macros, className, mealId, showActions, onTrack, onMissed, onSwap, recipeData }: MealCardProps) {
  const navigate = useNavigate();
  const [missed, setMissed] = useState(false);
  
  const handleClick = () => {
    const targetId = mealId ?? encodeURIComponent(title);
    
    // If this is an AI-generated recipe, store the data for the detail page
    if (recipeData) {
      localStorage.setItem('selectedRecipe', JSON.stringify(recipeData));
    }
    
    navigate(`/meal/${targetId}`);
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden soft-shadow transition-transform hover:scale-105 cursor-pointer",
        missed && "opacity-60",
        className
      )}
      onClick={handleClick}
    >
      <img src={image} alt={`${title} healthy meal`} loading="lazy" className="w-full h-40 object-cover" />
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{label}</Badge>
          <span className="text-xs text-muted-foreground">{calories} kcal</span>
        </div>
        {missed && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive">Missed</Badge>
          </div>
        )}
        <h3 className="font-semibold leading-tight">{title}</h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>C {macros.c}g</span>
          <span>P {macros.p}g</span>
          <span>F {macros.f}g</span>
        </div>
        {(showActions || onTrack || onMissed || onSwap) && (
          <div className="flex items-center justify-between pt-2">
            <div>
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onSwap && onSwap(); }}>Swap</Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setMissed(true); onMissed && onMissed(); }}>Missed</Button>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); setMissed(false); onTrack && onTrack(); }}>Track</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
