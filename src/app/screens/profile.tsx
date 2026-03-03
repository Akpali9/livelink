import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  MapPin,
  CheckCircle2,
  Instagram,
  Youtube,
  Facebook,
  Twitch,
  Video as VideoIcon,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Users,
  BarChart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { BottomNav } from "../components/bottom-nav";
import { AppHeader } from "../components/app-header";
import { supabase } from "../lib/supabase";

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [creator, setCreator] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [offerSent, setOfferSent] = useState(false);
  const [customOffer, setCustomOffer] = useState({
    streams: "",
    rate: "",
    type: "Banner Only",
    message: ""
  });

  // Fetch creator from Supabase
  useEffect(() => {
    const fetchCreator = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching creator:", error.message);
      } else {
        setCreator(data);
      }
      setLoading(false);
    };

    if (id) fetchCreator();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!creator) return <div className="p-8 text-center">Creator not found</div>;

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const selectedPackage = creator.packages?.find((p: any) => p.id === selectedPackageId);

  const getEstimates = (streams: number) => {
    return {
      uniqueViewers: Math.round(parseInt(creator.stats.avgViewers) * 0.4 * streams + 500),
      hours: streams * 1.5,
      impressions: Math.round(parseInt(creator.stats.avgViewers) * 1.4 * streams)
    };
  };

  const estimates = selectedPackage ? getEstimates(selectedPackage.streams) : null;

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("offers")
      .insert({
        creator_id: id,
        streams: parseInt(customOffer.streams),
        rate: parseFloat(customOffer.rate),
        type: customOffer.type,
        message: customOffer.message
      });

    if (error) {
      console.error("Error sending offer:", error.message);
    } else {
      setOfferSent(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1D1D1D] pb-[80px]">
      <AppHeader showBack title="Creator Profile" />
      <main className="max-w-[480px] mx-auto w-full">
      
        {/* Profile Header */}
        <div className="bg-white border-b border-[#1D1D1D]">
          <div className="px-6 py-12 flex flex-col items-center text-center">
            
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 border-4 border-[#1D1D1D] overflow-hidden bg-[#F8F8F8] flex items-center justify-center">
                {creator.avatar ? (
                  <ImageWithFallback
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full object-cover grayscale"
                  />
                ) : (
                  <div className="p-8 opacity-20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Name & Username */}
            <div className="flex flex-col items-center mb-4">
              <h1 className="text-3xl font-black uppercase italic">{creator.name}</h1>
              <span className="text-[10px] font-bold uppercase text-[#1D1D1D]/40">@{creator.username}</span>
            </div>

            {/* Platform Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {creator.platforms?.map((p: any) => (
                <div key={p.name} className="flex items-center gap-1 bg-[#389C9A]/10 px-2 py-1 border border-[#389C9A]/20">
                  <p.icon className="w-3 h-3 text-[#389C9A]" />
                  <span className="text-[8px] font-black uppercase text-[#389C9A] italic">{p.name}</span>
                </div>
              ))}
              {creator.verified && (
                <div className="flex items-center gap-1 bg-[#FEDB71]/10 px-2 py-1 border border-[#FEDB71]/20">
                  <CheckCircle2 className="w-3 h-3 text-[#1D1D1D]" />
                  <span className="text-[8px] font-black uppercase text-[#1D1D1D]">Verified</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold italic mb-4">
              <MapPin className="w-3 h-3 text-[#1D1D1D]/40" />
              <span>{creator.location}</span>
            </div>

            {/* Niches */}
            <div className="flex flex-wrap gap-2 mb-6">
              {creator.niches?.map((n: string) => (
                <span key={n} className="text-[9px] font-bold uppercase bg-[#F8F8F8] px-2 py-0.5 border border-[#1D1D1D]/10 italic">
                  {n}
                </span>
              ))}
            </div>

            {/* Bio */}
            <div className="w-full max-w-sm mb-6">
              <p className={`text-sm text-[#1D1D1D]/80 ${!isBioExpanded ? "line-clamp-3" : ""}`}>
                {creator.bio}
              </p>
              {creator.bio?.length > 120 && (
                <button
                  className="mt-2 text-[10px] uppercase text-[#389C9A] underline"
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                >
                  {isBioExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* Availability */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#1D1D1D] text-[9px] uppercase font-black italic">
              <span className={`w-2 h-2 ${
                creator.availability === "Available for campaigns" ? "bg-[#389C9A]" : "bg-[#FEDB71]"
              }`} />
              {creator.availability}
            </div>

          </div>
        </div>

        {/* Stats and Everything Else… continued exactly as before */}
        {/* … Packages, Estimates, Custom Offer UI … */}

        {/* (Paste the rest of your existing JSX here — unchanged) */}

      </main>
      <BottomNav />
    </div>
  );
}