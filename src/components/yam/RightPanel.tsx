import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Flame, Droplets, Plus, Clock, X, Upload } from "lucide-react";
import { AddMealsDialog } from "./AddMealsDialog";
import { AIChatbot } from "./AIChatbot";
import { useToast } from "@/components/ui/use-toast";
import { useCalorieTarget } from "@/hooks/useCalorieTarget";

interface Meal {
  time: string;
  kcal: number;
  img: string;
  title: string;
  macros: { c: number; p: number; f: number };
}

interface RightPanelProps {
  meals: Meal[];
  checkedMeals: Record<number, boolean>;
  onMealCheck: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  onAddMeal: (meal: any) => void;
  onRemoveMeal: (index: number) => void;
}

const days = [
  { d: "Mon", n: 3 },
  { d: "Tue", n: 4, active: true },
  { d: "Wed", n: 5 },
  { d: "Thu", n: 6 },
  { d: "Fri", n: 7 },
  { d: "Sat", n: 8 },
  { d: "Sun", n: 9 },
];

export function RightPanel({ meals, checkedMeals, onMealCheck, onAddMeal, onRemoveMeal }: RightPanelProps) {
  const [isAddMealsOpen, setIsAddMealsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { target } = useCalorieTarget();
  
  // Calculate remaining calories
  const totalEaten = meals.filter((_, idx) => checkedMeals[idx]).reduce((sum, meal) => sum + meal.kcal, 0);
  const dailyGoal = target ?? 2000;
  const remaining = dailyGoal - totalEaten;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just show a success message
      toast({
        title: "Photo uploaded!",
        description: "We're analyzing your meal photo...",
      });
      
      // Reset the input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  const goPrevDay = () => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(d.getDate() - 1);
      return nd;
    });
  };

  const goNextDay = () => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(d.getDate() + 1);
      return nd;
    });
  };

  return (
    <aside className="space-y-4">
      <Card className="soft-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Food Log</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" aria-label="Previous day" onClick={goPrevDay}><ChevronLeft className="h-3 w-3" /></Button>
              <Button variant="outline" size="icon" aria-label="Next day" onClick={goNextDay}><ChevronRight className="h-3 w-3" /></Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            aria-label="Upload meal photo"
          />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }, (_, i) => {
              const base = new Date(currentDate);
              const startOfWeek = new Date(base.setDate(base.getDate() - ((base.getDay() + 6) % 7))); // Monday as 0
              const dayDate = new Date(startOfWeek);
              dayDate.setDate(startOfWeek.getDate() + i);
              const isActive = dayDate.toDateString() === currentDate.toDateString();

              return (
                <div
                  key={i}
                  className={`text-center rounded-md py-2 border ${isActive ? "bg-secondary font-medium" : "bg-card"}`}
                  aria-current={isActive ? "date" : undefined}
                >
                  <div className="text-[10px] text-muted-foreground">
                    {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm">{dayDate.getDate()}</div>
                </div>
              );
            })}
          </div>

          {meals.length > 0 ? (
            <>
              <div className="space-y-3">
                {meals.map((m, idx) => (
                  <div key={`${m.time}-${idx}`} className="flex items-center gap-3 group relative">
                    <Checkbox
                      checked={!!checkedMeals[idx]}
                      onCheckedChange={(v) => onMealCheck((s) => ({ ...s, [idx]: v === true }))}
                      aria-label={`Mark ${m.time} as eaten`}
                    />
                    <img src={m.img} alt={`${m.title} photo`} loading="lazy" className="h-12 w-12 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{m.time}</Badge>
                        <span className="text-xs text-muted-foreground">{m.kcal} kcal</span>
                      </div>
                      <p className="truncate text-sm">{m.title}</p>
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        <span>C {m.macros.c}g</span>
                        <span>P {m.macros.p}g</span>
                        <span>F {m.macros.f}g</span>
                      </div>
                    </div>
                    {/* Remove button - shows on hover */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveMeal(idx)}
                      aria-label={`Remove ${m.title}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />
            </>
          ) : (
            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground mb-4">
              No meals logged yet. Use <span className="font-medium">Add Meals</span> or <span className="font-medium">Upload Photo</span> to get started.
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2"><Flame className="h-4 w-4" /> {remaining} kcal remaining</div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="hero"
                size="sm"
                onClick={() => setIsAddMealsOpen(true)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Meals
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={triggerFileUpload}
                className="text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AIChatbot />

      <Card className="soft-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5" /><span>Notification sent: Reached 75% of cardio goal.</span></div>
          <Separator />
          <div className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5" /><span>Logged dinner: Grilled Chicken (600 kcal).</span></div>
          <Separator />
          <div className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5" /><span>Water intake updated to 1.7 L.</span></div>
        </CardContent>
      </Card>

      <AddMealsDialog
        open={isAddMealsOpen}
        onOpenChange={setIsAddMealsOpen}
        onAddMeal={onAddMeal}
      />
    </aside>
  );
}
