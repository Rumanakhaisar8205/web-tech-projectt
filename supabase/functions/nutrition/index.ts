import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const foodQuery = url.searchParams.get("food");

    if (!foodQuery) {
      return new Response(
        JSON.stringify({ error: "Food query parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Nutrition lookup for:", foodQuery);

    // Normalize food name
    const normalizedQuery = foodQuery
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "");

    // Supabase admin client (server-side only)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ DEMO-STABLE: exact match only
      const { data, error } = await supabase
    .from("nutrition_items")
    .select("*")
    .ilike("name", `%${normalizedQuery}%`)
    .limit(1)
    .maybeSingle();


    if (error || !data) {
      console.log("Food not found:", normalizedQuery);
      return new Response(
        JSON.stringify({ error: "Food not found in database" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Nutrition found:", data.name);

    return new Response(
      JSON.stringify({
        id: data.id,
        name: data.name,
        serving_size_grams: Number(data.serving_size_grams),
        calories: Number(data.calories),
        protein: Number(data.protein),
        carbs: Number(data.carbs),
        fat: Number(data.fat),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Nutrition function error:", err);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch nutrition data",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
