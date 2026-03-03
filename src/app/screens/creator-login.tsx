import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast, Toaster } from "sonner";

export function CreatorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sign in using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      toast.error(authError?.message || "Login failed");
      return;
    }

    toast.success("Logged in successfully!");

    // Fetch user info from users table to check role & admin
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      toast.error("Failed to fetch user data");
      return;
    }

    // Optional: store user in localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect based on role
    if (user.role === "creator") {
      navigate("/dashboard"); // creator dashboard
    } else if (user.role === "business") {
      navigate("/business/dashboard"); // business dashboard
    } else {
      toast.error("Invalid role");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <Toaster position="top-center" expand={false} />
      <h1 className="text-3xl font-black mb-4">Creator Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full pl-10 p-3 border rounded"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-10 p-3 border rounded"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white p-3 font-bold flex items-center justify-center gap-2"
        >
          Sign In <ArrowRight />
        </button>
      </form>
    </div>
  );
}