// src/app/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null while checking

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
    };

    checkSession();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // While checking session, don't render anything
  if (isLoggedIn === null) return null;

  // If not logged in, redirect to home
  if (!isLoggedIn) return <Navigate to="/" replace />;

  // If logged in, render children
  return <>{children}</>;
}