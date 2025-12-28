import { useState } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export default function Login({ onSuccess, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await signIn(email, password);
      onSuccess();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">

      {/* Decorative Food Images */}
      {/* Decorative Food Images */}
      <img
        src="/src/assets/foods/biryani.jpg"
        className="absolute top-5 left-20 w-52 opacity-50 rotate-12 pointer-events-none"
      />

      <img
        src="/src/assets/foods/dosa.jpeg"
        className="absolute bottom-28 right-20 w-56 opacity-45 -rotate-12 pointer-events-none"
      />
      
      <img
        src="/src/assets/foods/pani-puri.jpg"
        className="absolute top-28 right-20 w-56 opacity-40 -rotate-12 pointer-events-none"
      />
      <img
        src="/src/assets/foods/salad.jpg"
        className="absolute top-1/2 right-10 w-44 opacity-45 rotate-6 pointer-events-none"
      />

       <img
        src="/src/assets/foods/pizza.avif"
        className="absolute Bottom-1/2 left-50 w-44 opacity-50 rotate-6 pointer-events-none"
      />
      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 animate-slide-up relative z-10">
        <h2 className="text-2xl font-bold text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Login to continue tracking your nutrition
        </p>

        <div className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full bg-green-500 hover:bg-green-600 transition-all"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-gray-600"
            onClick={onBack}
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
}
