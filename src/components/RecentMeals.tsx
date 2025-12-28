import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecentMeals, LoggedMeal } from "@/lib/api";

interface RecentMealsProps {
  refreshTrigger?: number;
}

export function RecentMeals({ refreshTrigger }: RecentMealsProps) {
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMeals() {
      setIsLoading(true);
      try {
        const data = await getRecentMeals(10);
        setMeals(data);
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMeals();
  }, [refreshTrigger]);

  // Calculate daily totals
  const todayMeals = meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    const today = new Date();
    return mealDate.toDateString() === today.toDateString();
  });

  const dailyTotals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-card rounded-3xl shadow-card animate-pulse" />
        <div className="h-24 bg-card rounded-2xl shadow-card animate-pulse" />
        <div className="h-24 bg-card rounded-2xl shadow-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily summary */}
      <div className="bg-card rounded-3xl shadow-card p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-nutrition-calories" />
          Today's Summary
        </h3>
        
        <div className="grid grid-cols-4 gap-2">
          <SummaryItem label="Calories" value={dailyTotals.calories} unit="kcal" />
          <SummaryItem label="Protein" value={Math.round(dailyTotals.protein * 10) / 10} unit="g" />
          <SummaryItem label="Carbs" value={Math.round(dailyTotals.carbs * 10) / 10} unit="g" />
          <SummaryItem label="Fat" value={Math.round(dailyTotals.fat * 10) / 10} unit="g" />
        </div>
      </div>

      {/* Meal list */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Recent Meals
        </h3>

        {meals.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-card p-8 text-center animate-fade-in">
            <p className="text-muted-foreground">No meals logged yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Snap your first meal to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal, index) => (
              <MealCard key={meal.id} meal={meal} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: number;
  unit: string;
}

function SummaryItem({ label, value, unit }: SummaryItemProps) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface MealCardProps {
  meal: LoggedMeal;
  index: number;
}

function MealCard({ meal, index }: MealCardProps) {
  const time = format(new Date(meal.timestamp), "h:mm a");
  const date = format(new Date(meal.timestamp), "MMM d");

  return (
    <div 
      className={cn(
        "bg-card rounded-2xl shadow-card p-4 animate-fade-in",
        `stagger-${Math.min(index + 1, 4)}`
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground capitalize">{meal.foodName}</h4>
          <p className="text-sm text-muted-foreground">
            {meal.grams}g • {date} at {time}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-nutrition-calories">{meal.calories}</p>
          <p className="text-xs text-muted-foreground">kcal</p>
        </div>
      </div>

      {/* Macro pills */}
      <div className="flex gap-2 mt-3">
        <MacroPill label="P" value={meal.protein} color="protein" />
        <MacroPill label="C" value={meal.carbs} color="carbs" />
        <MacroPill label="F" value={meal.fat} color="fat" />
      </div>
    </div>
  );
}

interface MacroPillProps {
  label: string;
  value: number;
  color: "protein" | "carbs" | "fat";
}

function MacroPill({ label, value, color }: MacroPillProps) {
  const colorClasses = {
    protein: "bg-nutrition-protein/10 text-nutrition-protein",
    carbs: "bg-nutrition-carbs/10 text-nutrition-carbs",
    fat: "bg-nutrition-fat/10 text-nutrition-fat",
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-xs font-medium",
      colorClasses[color]
    )}>
      {label}: {value}g
    </span>
  );
}
