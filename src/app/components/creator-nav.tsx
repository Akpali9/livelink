

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MessageSquare, Bell, User, ArrowLeft, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase"; // Import the centralized supabase client

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  backPath?: string;
  showLogo?: boolean;
  userType?: "creator" | "business";
  subtitle?: string;
}

export function AppHeader({ 
  title, 
  showBack = false, 
  backPath, 
  showLogo = false,
  userType = "creator",
  subtitle
}: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const profilePath = userType === "business" ? "/business/profile" : "/profile/me";

  const isHome = location.pathname === "/";
  const isMessages = location.pathname.startsWith("/messages");
  const showActions = !isHome && !isMessages;

  // Fetch user name from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) {
        setUserName(userType === 'business' ? data.user?.email : "ALEX"); // Replace "ALEX" with any field from Supabase user data
      } else {
        console.error(error);
      }
    };

    fetchUser();
  }, [userType]);

  return (
    <header className="px-5 pt-10 pb-4 border-b border-[#1D1D1D]/10 sticky top-0 bg-white z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => backPath ? navigate(backPath) : navigate(-1)} 
              className="p-1 -ml-1 active:bg-[#1D1D1D]/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          {showLogo && (
            <div className="flex flex-col" onClick={() => navigate(userType === 'business' ? '/business/dashboard' : '/dashboard')}>
              <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-2 cursor-pointer">
                <div className="w-5 h-5 bg-[#1D1D1D] flex items-center justify-center text-white text-[8px] italic">LL</div>
                LiveLink
              </h1>
              {subtitle && <span className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-40 mt-0.5">{subtitle}</span>}
            </div>
          )}

          {title && !showLogo && (
            <h1 className="text-xl font-black uppercase tracking-tighter italic">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showActions && (
            <>
              <Link to={userType === 'business' ? "/messages?role=business" : "/messages?role=creator"} className="relative p-1.5 hover:bg-[#1D1D1D]/5 transition-colors border border-transparent active:border-[#1D1D1D]/10">
                <MessageSquare className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#389C9A] border-2 border-white rounded-full" />
              </Link>
              
              <Link to={userType === 'business' ? "/notifications?role=business" : "/notifications?role=creator"} className="relative p-1.5 hover:bg-[#1D1D1D]/5 transition-colors">
                <Bell className="w-5 h-5" />
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#FEDB71] text-[#1D1D1D] text-[7px] font-black flex items-center justify-center rounded-none border border-[#1D1D1D]">3</div>
              </Link>
            </>
          )}

          <div className="relative ml-1">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="w-9 h-9 border border-[#1D1D1D] flex items-center justify-center bg-white active:scale-95 transition-transform"
            >
              <User className="w-4.5 h-4.5" />
            </button>
            
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    className="absolute right-0 mt-3 w-48 bg-white border border-[#1D1D1D] shadow-none z-50"
                  >
                    <div className="p-4 border-b border-[#1D1D1D]/10">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#1D1D1D]/40 mb-1 italic">Logged in as</p>
                      <p className="text-[10px] font-black uppercase tracking-widest truncate italic">{userName}</p>
                    </div>
                    <div className="p-1">
                      <button 
                        onClick={() => {
                          navigate(userType === 'business' ? '/business/settings' : '/settings');
                          setShowProfileMenu(false);
                        }} 
                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1D1D1D] hover:text-white flex items-center gap-3 transition-colors italic"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#389C9A]" /> {userType === 'business' ? 'Business Settings' : 'Settings'}
                      </button>
                      <button 
                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1D1D1D] hover:text-white text-red-500 flex items-center gap-3 transition-colors italic"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}