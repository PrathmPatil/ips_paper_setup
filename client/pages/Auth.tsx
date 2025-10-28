// client/pages/Portal.tsx
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginUser, RegisterUser } from "@/lib/apis";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { token } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <section className="container py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Innovative Public School & Jr. College
        </h1>
        <p className="mt-3 text-muted-foreground">
          Innovations Through Learning
        </p>
      </div>

      <AuthCard mode={mode} setMode={setMode} />
    </section>
  );
}

interface AuthCardProps {
  mode: "login" | "register";
  setMode?: React.Dispatch<React.SetStateAction<"login" | "register">>;
}

function AuthCard({ mode, setMode }: AuthCardProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = mode === "login" ? "Sign In" : "Create Account";
  const desc =
    mode === "login" ? "Access your dashboard" : "Set up a new account";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return; // ✅ Prevent double submission
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      email: (form.get("email") as string) || "",
      password: (form.get("password") as string) || "",
      fullName: (form.get("name") as string) || "",
      mobile: (form.get("mobile") as string) || "",
    };

    // remove empty fields
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, v]) => v !== "" && v != null && v !== undefined
      )
    );

    try {
      const response =
        mode === "login"
          ? await loginUser(cleanPayload)
          : await RegisterUser(cleanPayload);

      const { data, status } = response;
      console.log(response);
      if(status == 400){
        toast.error(response.message);
        setError(response.message || "Something went wrong");
        throw new Error(response.message);
      }
      if (status !== 200 && status !== 201) {
        throw new Error(data.error || "Authentication failed");
      }

      if (mode === "login") {
        const { token, user } = data;
        login(token, user);
        toast.success("Login successful!");
      } else {
        toast.success("Registration successful! Please log in.");
        setMode && setMode("login");
      }
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label>Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={loading}
            />
          </div>

          {mode === "register" && (
            <>
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label>Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="text"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : title}
          </Button>
        </form>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-4 text-sm text-center text-muted-foreground">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                className="text-primary underline"
                disabled={loading}
                onClick={() => setMode && setMode("register")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary underline"
                disabled={loading}
                onClick={() => setMode && setMode("login")}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
