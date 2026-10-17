"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid username or password");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        // Register
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed");
        } else {
          // Auto-login after registration
          const loginResult = await signIn("credentials", {
            username,
            password,
            redirect: false,
          });

          if (loginResult?.error) {
            setError("Registration successful but login failed");
          } else {
            router.push("/");
            router.refresh();
          }
        }
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center align-center z-0 dark:bg-background/80">
      <RetroGrid />
      <div className="w-full max-w-md p-8 bg-background border-4 border-foreground z-10">
        <h1 className="text-foreground font-heading text-3xl text-center mb-6 neon-glow">
          {isLogin ? "Login" : "Register"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-foreground text-sm mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 bg-background border-2 border-foreground text-foreground focus:outline-none focus:border-neon-cyan"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-foreground text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-background border-2 border-foreground text-foreground focus:outline-none focus:border-neon-cyan"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            variant="pixel"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Register"}
          </Button>
        </form>

        <p className="text-foreground text-center mt-4 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-neon-cyan hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
