import { supabase } from "@/integrations/supabase/client";

/* =========================
   TYPES
========================= */

export interface RecognitionResult {
  food: string;
  confidence: number;
}

export interface NutritionData {
  id: string;
  name: string;
  serving_size_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
}

export interface MealLogPayload {
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
  imageUrl?: string;
}

export interface LoggedMeal {
  id: string;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

/* =========================
   FOOD RECOGNITION
========================= */
export async function recognizeFood(
  imageBlob: Blob
): Promise<RecognitionResult> {
  const formData = new FormData();
  formData.append("file", imageBlob);

  const res = await fetch("http://127.0.0.1:8000/recognize", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Recognition failed");
  return res.json();
}

/* =========================
   NUTRITION (EDGE FUNCTION)
========================= */
export async function getNutrition(foodName: string): Promise<NutritionData> {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nutrition?food=${encodeURIComponent(foodName)}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch nutrition");
  return res.json();
}

/* =========================
   LOG MEAL (EDGE FUNCTION)
========================= */
export async function logMeal(payload: MealLogPayload): Promise<LoggedMeal> {
  const { data, error } = await supabase.functions.invoke("logMeal", {
    body: payload,
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to log meal");
  }

  return data.meal;
}
/* =========================
   RECENT MEALS (USER-SAFE)
========================= */
export async function getRecentMeals(limit = 10): Promise<LoggedMeal[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("meal_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((meal) => ({
    id: meal.id,
    foodName: meal.food_name,
    grams: Number(meal.grams),
    calories: Number(meal.calories),
    protein: Number(meal.protein),
    carbs: Number(meal.carbs),
    fat: Number(meal.fat),
    timestamp: meal.logged_at,
  }));
}

/* =========================
   NUTRITION CALCULATION
========================= */
export function calculateNutrition(
  nutrition: NutritionData,
  grams: number
) {
  const factor = grams / nutrition.serving_size_grams;

  return {
    calories: Math.round(nutrition.calories * factor),
    protein: +(nutrition.protein * factor).toFixed(1),
    carbs: +(nutrition.carbs * factor).toFixed(1),
    fat: +(nutrition.fat * factor).toFixed(1),
    sugar: nutrition.sugar
      ? +(nutrition.sugar * factor).toFixed(1)
      : 0,
    sodium: nutrition.sodium
      ? +(nutrition.sodium * factor).toFixed(1)
      : 0,
  };
}
