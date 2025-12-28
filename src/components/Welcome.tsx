import { Button } from "@/components/ui/button";

interface Props {
  onLogin: () => void;
  onSignup: () => void;
}

export default function Welcome({ onLogin, onSignup }: Props) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 gradient-hero animate-fade-in">

      {/* Food image collage */}
      <div className="grid grid-cols-2 gap-4 mb-10 max-w-xs">
        <img
          src="/src/assets/foods/dosa.jpeg"
          className="rounded-xl shadow-card object-cover h-32 w-full"
        />
        <img
          src="/src/assets/foods/idli.jpg"
          className="rounded-xl shadow-card object-cover h-32 w-full"
        />
        <img
          src="/src/assets/foods/salad.jpg"
          className="rounded-xl shadow-card object-cover h-32 w-full"
        />
        <img
          src="/src/assets/foods/biryani.jpg"
          className="rounded-xl shadow-card object-cover h-32 w-full"
        />
      </div>

      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-3 text-gradient">
        NutriSnap
      </h1>

      <p className="text-muted-foreground text-center mb-8 max-w-sm">
        Snap your food. Instantly understand calories and nutrition using AI.
      </p>

      {/* Feature list */}
      <div className="mb-10 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">📸 Capture your meal</div>
        <div className="flex items-center gap-2">🤖 AI food recognition</div>
        <div className="flex items-center gap-2">📊 Track nutrition easily</div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-4 animate-slide-up">
        <Button
          size="lg"
          className="w-full shadow-glow hover:scale-[1.02] transition"
          onClick={onSignup}
        >
          Create Account
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full hover:scale-[1.02] transition"
          onClick={onLogin}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
