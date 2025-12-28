import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

function calculateDailyCalories({
  age,
  weight,
  height,
  gender,
  health_condition,
}: {
  age: number;
  weight: number;
  height: number;
  gender: string;
  health_condition: string;
}) {
  const bmr =
    gender === "Male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  let target = bmr * 1.2;
  if (health_condition === "Diabetes") target -= 200;
  if (health_condition === "BP") target -= 150;

  return Math.round(target);
}

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const [age, setAge] = useState(22);
  const [weight, setWeight] = useState(65);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState("Male");
  const [condition, setCondition] = useState("Normal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setAge(data.age);
        setWeight(data.weight);
        setHeight(data.height);
        setGender(data.gender);
        setCondition(data.health_condition);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dailyTarget = calculateDailyCalories({
      age,
      weight,
      height,
      gender,
      health_condition: condition,
    });

    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      age,
      weight,
      height,
      gender,
      health_condition: condition,
      daily_calorie_target: dailyTarget,
    });

    if (!error) onBack();
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background flex justify-center px-4">
      <div className="w-full max-w-xl">
        {/* BACK */}
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* CARD */}
        <div className="bg-card rounded-3xl shadow-card p-8 mt-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Your Profile
          </h1>

          {/* BODY INFO */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(+e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(+e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Height (cm)</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(+e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* GENDER */}
          <div className="mt-6">
            <p className="font-medium mb-2">Gender</p>
            <div className="flex gap-3">
              {["Male", "Female"].map((g) => (
                <Button
                  key={g}
                  variant={gender === g ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setGender(g)}
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>

          {/* HEALTH */}
          <div className="mt-6">
            <p className="font-medium mb-2">Health Condition</p>
            <div className="flex gap-3">
              {["Normal", "Diabetes", "BP"].map((c) => (
                <Button
                  key={c}
                  variant={condition === c ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCondition(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {/* SAVE */}
          <Button
            className="w-full mt-8 text-lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
