import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

import Welcome from "@/components/Welcome";
import Login from "@/components/Login";
import Signup from "@/components/Signup";

import { CameraScreen } from "@/components/CameraScreen";
import { FoodResultScreen } from "@/components/FoodResultScreen";
import { MealLoggedScreen } from "@/components/MealLoggedScreen";
import { HomeScreen } from "@/components/HomeScreen";

import { recognizeFood } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ProfileScreen } from "@/components/ProfileScreen";

type AuthScreen = "welcome" | "login" | "signup";
type AppScreen = "home" | "camera" | "result" | "logged" | "profile";

interface CapturedFood {
  imageUrl: string;
  food: string;
  confidence: number;
}

export default function Index() {
  /* ================= STATE ================= */
  const [session, setSession] = useState<any>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>("welcome");

  const [appScreen, setAppScreen] = useState<AppScreen>("home");
  const [capturedFood, setCapturedFood] = useState<CapturedFood | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* ================= AUTH ================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  /* ================= CAMERA HANDLER ================= */
  const handleCapture = useCallback(
    async (imageBlob: Blob, imageUrl: string) => {
      setIsProcessing(true);
      try {
        const result = await recognizeFood(imageBlob);
        setCapturedFood({
          imageUrl,
          food: result.food,
          confidence: result.confidence,
        });
        setAppScreen("result");
      } catch {
        toast({
          title: "Recognition failed",
          description: "Unable to identify the food",
          variant: "destructive",
        });
        setAppScreen("home");
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  /* ================= AUTH UI ================= */
  if (!session) {
    if (authScreen === "welcome") {
      return (
        <Welcome
          onLogin={() => setAuthScreen("login")}
          onSignup={() => setAuthScreen("signup")}
        />
      );
    }

    if (authScreen === "login") {
      return (
        <Login
          onSuccess={() => {}}
          onBack={() => setAuthScreen("welcome")}
        />
      );
    }

    if (authScreen === "signup") {
      return (
        <Signup
          onSuccess={() => {}}
          onBack={() => setAuthScreen("welcome")}
        />
      );
    }
  }

  /* ================= LOADING ================= */
  if (isProcessing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-foreground">
        <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  /* ================= MAIN APP ================= */
  switch (appScreen) {
    case "camera":
      return (
        <CameraScreen
          onCapture={handleCapture}
          onCancel={() => setAppScreen("home")}
        />
      );

    case "result":
      if (!capturedFood) return null;
      return (
        <FoodResultScreen
          imageUrl={capturedFood.imageUrl}
          recognizedFood={capturedFood.food}
          confidence={capturedFood.confidence}
          onBack={() => setAppScreen("camera")}
          onMealLogged={() => {
            setRefreshTrigger((p) => p + 1);
            setAppScreen("logged");
          }}
        />
      );

    case "logged":
      return (
        <MealLoggedScreen
          onHome={() => setAppScreen("home")}
          onSnapAnother={() => setAppScreen("camera")}
        />
      );
    case "profile":
       return <ProfileScreen onBack={() => setAppScreen("home")} />;
    default:
      return (
    <HomeScreen
      onStartCamera={() => setAppScreen("camera")}
      refreshTrigger={refreshTrigger}
      onOpenProfile={() => setAppScreen("profile")}
    />

      );
  }
}
