import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "../lib/icons";
import { authService } from "../services/auth";
import { Button } from "../components/ui/8bit/button";
import { Input } from "../components/ui/8bit/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/8bit/card";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await authService.login({ username, password });
      navigate("/home");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 retro">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 text-center retro">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-300 mb-2 retro"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 pr-4 text-white placeholder:text-zinc-500 bg-zinc-800"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2 retro"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-4 text-white placeholder:text-zinc-500 bg-zinc-800"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground retro"
            >
              Sign In
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center retro">
            <p className="text-sm text-zinc-400">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => navigate("/signup")}
                className="text-violet-400 hover:text-violet-300 font-medium retro p-0 h-auto"
              >
                Sign up
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
