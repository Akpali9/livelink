import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { AppHeader } from "../components/app-header";
import { BottomNav } from "../components/bottom-nav";
import {
  ArrowUpRight,
  Inbox,
  Clock,
  CheckCircle2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Wallet,
  User,
  List,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DeclineOfferModal } from "../components/decline-offer-modal";

// ──────────────────────────
// Interfaces
// ──────────────────────────
interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  total_earned: number;
  pending: number;
  paid_out: number;
}
interface StatusCounts {
  requested: number;
  pending: number;
  completed: number;
}
interface IncomingRequest {
  id: number;
  business: string;
  name: string;
  type: string;
  streams: number;
  price: number;
  days_left: number;
  logo: string;
}
interface LiveCampaign {
  id: number;
  business: string;
  name: string;
  logo: string;
  session_earnings: string;
  stream_time: string;
  progress: number;
  remaining_mins: number;
}
interface Application {
  id: number;
  business: string;
  logo: string;
  type: string;
  amount?: number;
  status: string;
  applied_at: string;
}
interface UpcomingCampaign {
  id: number;
  business: string;
  logo: string;
  start_date: string;
  package: string;
}

// ──────────────────────────
// Reusable UI Components
// ──────────────────────────
function SectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 bg-[#1D1D1D]/5 border-2 border-[#1D1D1D]/5" />
      ))}
    </div>
  );
}
function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-2 border-red-200 bg-red-50 p-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest">
        <AlertCircle className="w-4 h-4" /> {message}
      </div>
      <button
        onClick={onRetry}
        className="text-[9px] font-black uppercase tracking-widest text-red-500 underline italic"
      >
        Retry
      </button>
    </div>
  );
}

// ──────────────────────────
// Dashboard Data Hook
// ──────────────────────────
function useDashboardData(creatorId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [liveCampaign, setLiveCampaign] = useState<LiveCampaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<UpcomingCampaign[]>([]);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAll = async () => {
    if (!creatorId) return;
    setLoading(true);
    setErrors({});
    const newErrors: Record<string, string> = {};

    // 1. Profile
    const { data: profileData, error: profileErr } = await supabase
      .from("creator_profiles")
      .select("id, name, avatar, total_earned, pending, paid_out")
      .eq("id", creatorId)
      .single();
    if (profileErr) newErrors.profile = "Could not load profile";
    else setProfile(profileData);

    // 2. Status counts
    const { data: countsData, error: countsErr } = await supabase
      .from("campaign_status_counts")
      .select("requested, pending, completed")
      .eq("creator_id", creatorId)
      .single();
    if (countsErr) newErrors.counts = "Could not load campaign counts";
    else setStatusCounts(countsData);

    // 3. Incoming requests
    const { data: reqData, error: reqErr } = await supabase
      .from("campaign_requests")
      .select("id, business, name, type, streams, price, days_left, logo")
      .eq("creator_id", creatorId)
      .eq("status", "pending")
      .order("days_left", { ascending: true });
    if (reqErr) newErrors.requests = "Could not load incoming requests";
    else setIncomingRequests(reqData ?? []);

    // 4. Live campaign
    const { data: liveData, error: liveErr } = await supabase
      .from("live_campaigns")
      .select("id, business, name, logo, session_earnings, stream_time, progress, remaining_mins")
      .eq("creator_id", creatorId)
      .eq("is_live", true)
      .order("created_at", { ascending: false })
      .maybeSingle();
    if (liveErr) newErrors.live = "Could not load live campaign";
    else setLiveCampaign(liveData);

    // 5. Applications
    const { data: appData, error: appErr } = await supabase
      .from("creator_applications")
      .select("id, business, logo, type, amount, status, applied_at")
      .eq("creator_id", creatorId)
      .order("applied_at", { ascending: false });
    if (appErr) newErrors.applications = "Could not load applications";
    else setApplications(appData ?? []);

    // 6. Upcoming campaigns
    const { data: upData, error: upErr } = await supabase
      .from("upcoming_campaigns")
      .select("id, business, logo, start_date, package")
      .eq("creator_id", creatorId)
      .gt("start_date", new Date().toISOString())
      .order("start_date", { ascending: true });
    if (upErr) newErrors.upcoming = "Could not load upcoming campaigns";
    else setUpcomingCampaigns(upData ?? []);

    setErrors(newErrors);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [creatorId]);

  return {
    profile,
    statusCounts,
    incomingRequests,
    setIncomingRequests,
    liveCampaign,
    applications,
    upcomingCampaigns,
    loading,
    errors,
    refetch: fetchAll,
  };
}

// ──────────────────────────
// Main Dashboard Component
// ──────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const earningsRef = useRef<HTMLDivElement>(null);

  // ── Auth state
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/", { replace: true });
      } else {
        setCreatorId(session.user.id);
      }
      setCheckingAuth(false);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) navigate("/", { replace: true });
      else setCreatorId(session.user.id);
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#389C9A]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1D]/40">
          Checking login status…
        </p>
      </div>
    );
  }

  if (!creatorId) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm font-bold">You need to log in to access the dashboard.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-[#389C9A] text-white font-bold uppercase tracking-widest"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ── Dashboard Data Hook
  const {
    profile,
    statusCounts,
    incomingRequests,
    setIncomingRequests,
    liveCampaign,
    applications,
    upcomingCampaigns,
    loading,
    errors,
    refetch,
  } = useDashboardData(creatorId);

  // ── UI State
  const [requestsExpanded, setRequestsExpanded] = useState(false);
  const [applicationsExpanded, setApplicationsExpanded] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IncomingRequest | null>(null);

  // ── Accept / Decline Actions
  const handleAccept = async (req: IncomingRequest) => {
    const { error } = await supabase.from("campaign_requests").update({ status: "accepted" }).eq("id", req.id);
    if (error) return toast.error("Could not accept offer. Please try again.");
    setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
    toast.success(`You accepted the offer from ${req.business}!`);
    navigate("/gig-accepted");
  };

  const handleDeclineClick = (req: IncomingRequest) => {
    setSelectedRequest(req);
    setIsDeclineModalOpen(true);
  };

  const handleConfirmDecline = async (reason: string) => {
    if (!selectedRequest) return;
    const { error } = await supabase
      .from("campaign_requests")
      .update({ status: "declined", decline_reason: reason })
      .eq("id", selectedRequest.id);
    setIsDeclineModalOpen(false);
    if (error) return toast.error("Could not decline offer. Please try again.");
    toast.success(`Offer declined. ${selectedRequest.business} has been notified.`);
    setIncomingRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
    setSelectedRequest(null);
  };

  // ── Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#389C9A]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1D]/40">Loading your dashboard…</p>
      </div>
    );
  }

  // ── Render Dashboard (existing sections remain the same)
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1D1D1D] pb-[60px]">
      <AppHeader showLogo subtitle="Creator Hub" />
      <Toaster position="top-center" richColors />
      <main className="max-w-[480px] mx-auto w-full">
        {/* Your existing sections (Earnings, Requests, Live, Applications, Upcoming) */}
        {/* Example: Earnings Section */}
        <div className="p-6" ref={earningsRef}>
          {errors.profile ? (
            <SectionError message={errors.profile} onRetry={refetch} />
          ) : (
            <div className="bg-[#1D1D1D] p-8 text-white relative overflow-hidden border-2 border-[#1D1D1D]">
              <h2 className="text-4xl font-black tracking-tighter leading-none mb-8 text-center italic">
                N{(profile?.total_earned ?? 0).toFixed(2)}
              </h2>
            </div>
          )}
        </div>
        {/* ...repeat for all your dashboard sections... */}
      </main>
      <BottomNav />
      {selectedRequest && (
        <DeclineOfferModal
          isOpen={isDeclineModalOpen}
          onClose={() => setIsDeclineModalOpen(false)}
          onConfirm={handleConfirmDecline}
          offerDetails={{
            partnerName: selectedRequest.business,
            offerName: selectedRequest.name,
            campaignType: selectedRequest.type,
            amount: `N${selectedRequest.price}`,
            logo: selectedRequest.logo,
            partnerType: "Business",
          }}
        />
      )}
    </div>
  );
}