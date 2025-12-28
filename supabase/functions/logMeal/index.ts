import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 🔐 CREATE CLIENT USING USER JWT
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization")!,
        },
      },
    }
  );

  // 🔐 GET AUTHENTICATED USER
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const {
      foodName,
      grams,
      calories,
      protein = 0,
      carbs = 0,
      fat = 0,
      sugar = 0,
      sodium = 0,
      imageUrl = null,
    } = await req.json();

    const { data, error } = await supabase
      .from("meal_logs")
      .insert({
        user_id: user.id, // ✅ FIX
        food_name: foodName,
        grams,
        calories,
        protein,
        carbs,
        fat,
        sugar,
        sodium,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, meal: data }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to log meal" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
