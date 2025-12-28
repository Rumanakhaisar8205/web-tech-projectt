import { Check, Home, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealLoggedScreenProps {
  onHome: () => void;
  onSnapAnother: () => void;
}

export function MealLoggedScreen({ onHome, onSnapAnother }: MealLoggedScreenProps) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-6">
      {/* Success animation */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20 animate-pulse-ring" />
        
        {/* Inner circle */}
        <div className="w-32 h-32 rounded-full gradient-primary shadow-glow flex items-center justify-center animate-success-check">
          <Check className="h-16 w-16 text-primary-foreground" strokeWidth={3} />
        </div>
      </div>

      {/* Success message */}
      <div className="text-center animate-fade-in stagger-1">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Meal Logged!
        </h1>
        <p className="text-muted-foreground text-lg">
          Your meal has been successfully recorded
        </p>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm mt-12 space-y-4 animate-slide-up stagger-2">
        <Button
          variant="success"
          size="xl"
          className="w-full"
          onClick={onHome}
        >
          <Home className="h-5 w-5 mr-2" />
          Go to Home
        </Button>

        <Button
          variant="outline"
          size="xl"
          className="w-full"
          onClick={onSnapAnother}
        >
          <Camera className="h-5 w-5 mr-2" />
          Snap Another
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}
