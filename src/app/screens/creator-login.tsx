import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Apple } from "lucide-react";
import { supabase } from "../lib/supabase"; // adjust path as needed
import { toast } from "sonner"; // optional: for notifications

export function BusinessLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Login failed");
      return;
    }

    if (data.user) {
      toast.success("Login successful!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 pt-16 pb-12">
      {/* Top Section */}
      <div className="flex flex-col items-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="w-8 h-8 bg-[#1D1D1D] flex items-center justify-center">
            <div className="w-4 h-4 bg-[#FEDB71]" />
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter italic text-[#1D1D1D]">
            LiveLink
          </span>
        </motion.div>

        <div className="px-4 py-1.5 bg-[#FEDB71]/10 border border-[#FEDB71]/20 rounded-full mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D2691E] italic">
            Creator Portal
          </span>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-[#1D1D1D] mb-2">
          Welcome Back
        </h1>
        <p className="text-sm font-medium italic text-[#1D1D1D]/40 text-center max-w-[280px] leading-relaxed">
          Sign in to manage your campaigns and find your next creator partner.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        <div className="space-y-6">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1D]/40 italic ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D1D1D]/20 group-focus-within:text-[#D2691E] transition-colors" />
              <input 
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8F8F8] border-2 border-[#1D1D1D]/5 focus:border-[#1D1D1D] focus:bg-white p-5 pl-14 text-sm font-medium italic outline-none transition-all placeholder:text-[#1D1D1D]/20"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1D]/40 italic ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D1D1D]/20 group-focus-within:text-[#D2691E] transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8F8F8] border-2 border-[#1D1D1D]/5 focus:border-[#1D1D1D] focus:bg-white p-5 pl-14 pr-14 text-sm font-medium italic outline-none transition-all placeholder:text-[#1D1D1D]/20"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-[#1D1D1D]/40" /> : <Eye className="w-4 h-4 text-[#1D1D1D]/40" />}
              </button>
            </div>
            <Link to="#" className="text-[9px] font-black uppercase tracking-widest text-[#1D1D1D] text-right mt-1 hover:text-[#D2691E] transition-colors italic">
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Sign In Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#1D1D1D] text-white p-5 text-lg font-black uppercase italic tracking-tighter flex items-center justify-center gap-4 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"} <ArrowRight className="w-6 h-6 text-[#FEDB71]" />
        </button>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-3 border-2 border-[#1D1D1D]/5 p-4 hover:border-[#1D1D1D] transition-all active:scale-[0.98]">
            <Chrome className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Google</span>
          </button>
          <button type="button" className="flex items-center justify-center gap-3 border-2 border-[#1D1D1D]/5 p-4 hover:border-[#1D1D1D] transition-all active:scale-[0.98]">
            <Apple className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Apple</span>
          </button>
        </div>
      </form>

      {/* Bottom Section */}
      <div className="mt-12 text-center">
        <div className="h-[1px] bg-[#1D1D1D]/10 w-full mb-8" />
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest italic text-[#1D1D1D]/40">
            Don't have an account? <Link to="/become-creator" className="text-[#1D1D1D] hover:underline decoration-2 underline-offset-4">APPLY TO JOIN</Link>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest italic text-[#1D1D1D]/30">
            Are you a creator? <Link to="/login/business" className="text-[#D2691E] hover:underline decoration-1 underline-offset-4">BUSINESS LOGIN →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
