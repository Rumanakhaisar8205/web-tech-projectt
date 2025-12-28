import { useEffect, useState } from "react";
import {
  Camera,
  Utensils,
  Beef,
  Wheat,
  Droplets,
  Footprints,
  User,
  LogOut,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { RecentMeals } from "@/components/RecentMeals";
import { CalorieRing } from "@/components/CalorieRing";
import { supabase } from "@/integrations/supabase/client";

interface HomeScreenProps {
  onStartCamera: () => void;
  refreshTrigger: number;
  onOpenProfile: () => void;
}

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function HomeScreen({
  onStartCamera,
  refreshTrigger,
  onOpenProfile,
}: HomeScreenProps) {
  const [totals, setTotals] = useState<Totals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [healthCondition, setHealthCondition] = useState<string | null>(null);
  const [weeklyChart, setWeeklyChart] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState(false);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("daily_calorie_target, health_condition")
        .eq("id", user.id)
        .single();

      if (data) {
        setCalorieTarget(data.daily_calorie_target);
        setHealthCondition(data.health_condition);
      }
    }

    fetchProfile();
  }, []);

  /* ================= TODAY TOTALS ================= */
  useEffect(() => {
    async function fetchTodayTotals() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("meal_logs")
        .select("calories, protein, carbs, fat")
        .eq("user_id", user.id)
        .gte("logged_at", start.toISOString());

      if (!data) return;

      const sum = data.reduce(
        (a, m) => ({
          calories: a.calories + Number(m.calories),
          protein: a.protein + Number(m.protein),
          carbs: a.carbs + Number(m.carbs),
          fat: a.fat + Number(m.fat),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setTotals(sum);
    }

    fetchTodayTotals();
  }, [refreshTrigger]);

  /* ================= WEEKLY ================= */
  useEffect(() => {
    async function fetchWeekly() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = new Date();
      start.setDate(start.getDate() - 7);

      const { data } = await supabase
        .from("meal_logs")
        .select("calories, logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", start.toISOString());

      if (!data) return;

      const daily: Record<string, number> = {};
      data.forEach((m) => {
        const d = m.logged_at.slice(0, 10);
        daily[d] = (daily[d] || 0) + Number(m.calories);
      });

      setWeeklyChart(
        Object.entries(daily).map(([date, calories]) => ({
          date,
          calories,
        }))
      );
    }

    fetchWeekly();
  }, []);

  /* ================= SUGGESTION ================= */
  let exceeded = false;
  let suggestion = "Set profile to get recommendations";
  let mealRecommendation = "";

  const remaining = calorieTarget
    ? calorieTarget - totals.calories
    : 0;

  if (calorieTarget) {
    if (remaining < 0) {
      exceeded = true;
      suggestion = `Exceeded by ${Math.abs(remaining)} kcal`;
    } else {
      suggestion = "You are on track today";
    }

    if (remaining < 200) {
      mealRecommendation = "Light snack recommended (fruit / nuts)";
    } else if (healthCondition === "Diabetes") {
      mealRecommendation = "High-protein, low-carb meal recommended";
    } else if (healthCondition === "BP") {
      mealRecommendation = "Low-sodium meal recommended";
    } else {
      mealRecommendation = "Balanced meal recommended";
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="gradient-hero pt-12 pb-10 px-6">
        <div className="relative flex justify-center items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Utensils className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold">NutriSnap</h1>
              <p className="text-sm text-muted-foreground">
                Track your nutrition effortlessly
              </p>
            </div>
          </div>

          <div className="absolute right-0">
            <Button variant="ghost" size="icon" onClick={() => setOpenMenu(true)}>
              <User />
            </Button>
          </div>
        </div>
      </header>

      {/* PROFILE SLIDE MENU (UNCHANGED) */}
      {openMenu && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpenMenu(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-4">Account</h3>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onOpenProfile}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 mt-2"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* SNAP */}
      <div className="px-6 -mt-6">
        <Button size="xl" className="w-full" onClick={onStartCamera}>
          <Camera className="h-6 w-6 mr-2" />
          Snap Your Meal
        </Button>
      </div>

      {/* MAIN */}
      <section className="px-6 mt-10">
        <div className="bg-card rounded-3xl p-8 shadow-card max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* PIE */}
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">
                Today’s Calories
              </h2>
              <CalorieRing
                value={totals.calories}
                max={calorieTarget ?? 2000}
              />
            </div>

            {/* DETAILS */}
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {totals.calories} kcal
              </div>
              <div className="text-sm text-muted-foreground">
                Target: {calorieTarget ?? 2000} kcal
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                  ${
                    exceeded
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-700"
                  }`}
              >
                <Footprints className="h-4 w-4" />
                {suggestion}
              </div>

              {mealRecommendation && (
                <div className="bg-blue-50 rounded-xl px-4 py-3 text-blue-700 font-medium">
                  🍽 {mealRecommendation}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WEEKLY */}
      {weeklyChart.length > 0 && (
        <section className="px-6 mt-10">
          <div className="bg-card rounded-3xl p-6 shadow-card max-w-3xl mx-auto">
            <h3 className="font-semibold mb-4 text-center">
              Weekly Calories
            </h3>
            <div className="flex justify-center">
              <LineChart width={340} height={220} data={weeklyChart}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
              </LineChart>
            </div>
          </div>
        </section>
      )}

      {/* MACROS */}
      <section className="px-6 mt-10">
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <MacroItem label="Protein" value={totals.protein.toFixed(1)} unit="g" icon={<Beef />} />
          <MacroItem label="Carbs" value={totals.carbs.toFixed(1)} unit="g" icon={<Wheat />} />
          <MacroItem label="Fat" value={totals.fat.toFixed(1)} unit="g" icon={<Droplets />} />
        </div>
      </section>

      {/* RECENT */}
      <section className="px-6 py-10">
        <RecentMeals refreshTrigger={refreshTrigger} />
      </section>
    </div>
  );
}

/* ================= MACRO ITEM ================= */
function MacroItem({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="bg-muted rounded-xl p-4 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">
        {label} {unit}
      </div>
    </div>
  );
}
