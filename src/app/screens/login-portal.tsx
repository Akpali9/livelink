import React from "react";
import { Link, useNavigate } from "react-router";
// import { motion } from "motion/react";
import { motion } from "framer-motion";
import { Video as VideoIcon, Building, ArrowRight, ChevronRight } from "lucide-react";

export function LoginPortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 pt-20 pb-12">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-10 h-10 bg-[#1D1D1D] flex items-center justify-center">
            <div className="w-5 h-5 bg-[#389C9A]" />
          </div>
          <span className="text-3xl font-black uppercase tracking-tighter italic text-[#1D1D1D]">
            LiveLink
          </span>
        </motion.div>
      </div>

      {/* Heading Section */}
      <div className="mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black uppercase tracking-tighter leading-none mb-4 italic text-[#1D1D1D]"
        >
          Who are you<br />logging in as?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#1D1D1D]/40 text-sm font-bold uppercase tracking-widest italic"
        >
          Choose your account type to continue.
        </motion.p>
      </div>

      {/* Portal Cards */}
      <div className="flex flex-col gap-6 flex-1">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/login/creator")}
          className="group relative flex items-center justify-between p-8 bg-white border-2 border-[#1D1D1D] transition-all active:scale-[0.98] text-left hover:bg-[#1D1D1D] hover:text-white"
        >
          <div className="flex flex-col gap-4">
            <VideoIcon className="w-8 h-8 text-[#389C9A]" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight italic mb-1">I'm a Creator</h3>
              <p className="text-xs font-medium italic opacity-60 leading-tight pr-8">
                Access your campaigns, earnings and brand partnerships.
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/login/business")}
          className="group relative flex items-center justify-between p-8 bg-white border-2 border-[#1D1D1D] transition-all active:scale-[0.98] text-left hover:bg-[#1D1D1D] hover:text-white"
        >
          <div className="flex flex-col gap-4">
            <Building className="w-8 h-8 text-[#FEDB71]" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight italic mb-1">I'm a Business</h3>
              <p className="text-xs font-medium italic opacity-60 leading-tight pr-8">
                Manage your campaigns and find live creators for your brand.
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>

      {/* Footer Links */}
      <div className="mt-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1D]/40 mb-4 italic">
          New to LiveLink?
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest italic">
          <Link to="/become-creator" className="text-[#1D1D1D] hover:text-[#389C9A] transition-colors">Join as a Creator</Link>
          <div className="w-[1px] h-3 bg-[#1D1D1D]/10" />
          <Link to="/become-business" className="text-[#1D1D1D] hover:text-[#389C9A] transition-colors">Register a Business</Link>
        </div>
        
        <p className="mt-12 text-[8px] font-medium text-[#1D1D1D]/30 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed italic">
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
