import { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  NutritionData,
  getNutrition,
  calculateNutrition,
  logMeal,
} from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

/* =======================
   FOOD CATEGORY MAP
======================= */

const COUNT_FOODS = [
  "idli","dosa","masala dosa","rava dosa","set dosa","uttapam",
  "chapati","roti","naan","kulcha",
  "vada","medu vada","samosa","pani puri","gulab jamun","jalebi"
];

const BOWL_FOODS = [
  "biryani","rice","fried rice","pulao","khichdi",
  "dal","rajma","chole","paneer masala","palak paneer",
  "curd rice","pongal","poha","upma"
];

const CUP_FOODS = ["chaas","buttermilk","solkadhi","lassi"];

function getQuantityMode(food: string) {
  const f = food.toLowerCase();
  if (COUNT_FOODS.some(x => f.includes(x))) return "COUNT";
  if (BOWL_FOODS.some(x => f.includes(x))) return "BOWL";
  if (CUP_FOODS.some(x => f.includes(x))) return "CUP";
  return "GRAM";
}

/* =======================
   COMPONENT
======================= */

interface Props {
  imageUrl: string;
  recognizedFood: string;
  confidence: number;
  onBack: () => void;
  onMealLogged: () => void;
}

export function FoodResultScreen({
  imageUrl,
  recognizedFood,
  confidence,
  onBack,
  onMealLogged,
}: Props) {

  const quantityMode = getQuantityMode(recognizedFood);

  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [count, setCount] = useState(1);
  const [grams, setGrams] = useState(100);
  const [bowls, setBowls] = useState(1);
  const [cups, setCups] = useState(1);
  const [loading, setLoading] = useState(false);

  /* =======================
     FETCH NUTRITION
  ======================= */
  useEffect(() => {
    async function load() {
      try {
        const data = await getNutrition(recognizedFood);
        setNutrition(data);
      } catch {
        setNutrition({
          id: "demo",
          name: recognizedFood,
          serving_size_grams: 100,
          calories: 190,
          protein: 4,
          carbs: 30,
          fat: 6,
          sugar: 8,
          sodium: 120,
        });
      }
    }
    load();
  }, [recognizedFood]);

  /* =======================
     CALCULATE GRAMS
  ======================= */
  const effectiveGrams = useMemo(() => {
    if (!nutrition) return 0;
    if (quantityMode === "COUNT") return count * 40;
    if (quantityMode === "BOWL") return bowls * 180;
    if (quantityMode === "CUP") return cups * 240;
    return grams;
  }, [count, bowls, cups, grams, nutrition, quantityMode]);

  const adjusted = useMemo(() => {
    if (!nutrition) return null;
    return calculateNutrition(nutrition, effectiveGrams);
  }, [nutrition, effectiveGrams]);

  /* =======================
     LOG MEAL
  ======================= */
  async function handleLog() {
    if (!nutrition || !adjusted) return;
    setLoading(true);
    try {
      await logMeal({
        foodName: nutrition.name,
        grams: effectiveGrams,
        calories: adjusted.calories,
        protein: adjusted.protein,
        carbs: adjusted.carbs,
        fat: adjusted.fat,
        sugar: adjusted.sugar,
        sodium: adjusted.sodium,
      });
      onMealLogged();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">

      {/* IMAGE */}
      <div className="relative h-56">
        <img src={imageUrl} className="w-full h-full object-cover" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/80"
        >
          <ArrowLeft />
        </Button>
      </div>

      <div className="px-6 mt-4">

        {/* FOOD NAME (FIXED) */}
        <h2 className="text-2xl font-bold capitalize">
          {recognizedFood}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {Math.round(confidence * 100)}% match
        </p>

        {/* QUANTITY INPUT */}
        <div className="bg-card rounded-2xl p-4 mb-4">
          {quantityMode === "COUNT" && (
            <>
              <label>How many pieces?</label>
              <Input type="number" min={1} value={count} onChange={e => setCount(+e.target.value)} />
              <p className="text-xs text-muted-foreground">≈ {count * 40} g</p>
            </>
          )}

          {quantityMode === "BOWL" && (
            <>
              <label>How many bowls?</label>
              <Input type="number" min={1} value={bowls} onChange={e => setBowls(+e.target.value)} />
              <p className="text-xs text-muted-foreground">≈ {bowls * 180} g</p>
            </>
          )}

          {quantityMode === "CUP" && (
            <>
              <label>How many cups?</label>
              <Input type="number" min={1} value={cups} onChange={e => setCups(+e.target.value)} />
              <p className="text-xs text-muted-foreground">≈ {cups * 240} ml</p>
            </>
          )}

          {quantityMode === "GRAM" && (
            <>
              <label>Serving size (grams)</label>
              <Slider value={[grams]} onValueChange={v => setGrams(v[0])} min={50} max={500} step={10} />
              <p className="text-xs text-muted-foreground">{grams} g</p>
            </>
          )}
        </div>

        {/* NUTRITION */}
        {adjusted && (
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Calories" value={adjusted.calories} unit="kcal" />
            <Stat label="Protein" value={adjusted.protein} unit="g" />
            <Stat label="Carbs" value={adjusted.carbs} unit="g" />
            <Stat label="Fat" value={adjusted.fat} unit="g" />
            <Stat label="Sugar" value={adjusted.sugar} unit="g" />
            <Stat label="Sodium" value={adjusted.sodium} unit="mg" />
          </div>
        )}

        <Button className="w-full mt-6" onClick={handleLog} disabled={loading}>
          {loading ? "Logging…" : "Log Meal"}
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: any) {
  return (
    <div className="bg-muted rounded-xl p-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label} {unit}</p>
    </div>
  );
}
