import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  Search,
  Filter,
  ChevronRight,
  Star,
  X,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AppHeader } from "../components/app-header";
import { supabase, checkSupabaseConnection } from "../lib/supabase";

// Types
interface Creator {
  id: string;
  name: string;
  avatar: string;
  category: string;
  country: string;
  platforms: string[];
  rating: number;
  avg_viewers: number;
  tags: string[];
  price: number;
  created_at: string;
}

// Constants
const categories = ["All", "Gaming", "Beauty", "Fitness", "Business", "Music", "Comedy"];
const platforms = ["Twitch", "TikTok", "Instagram", "YouTube"];
const countries = ["Any", "United Kingdom", "United States", "Canada", "France", "Germany"];

export function Browse() {
  const navigate = useNavigate();
  
  // State
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("Any");
  const [search, setSearch] = useState("");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Check connection on mount
  useEffect(() => {
    const initConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionError(!isConnected);
    };
    
    initConnection();
  }, []);

  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveCategory("All");
    setSelectedPlatforms([]);
    setSelectedCountry("Any");
    setSearch("");
    setShowFilters(false);
  };

  // Fetch creators from Supabase
  const fetchCreators = async () => {
    setLoading(true);
    setConnectionError(false);

    try {
      // Start building the query
      let query = supabase
        .from("creators")
        .select("*");

      // Apply filters
      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory);
      }

      if (selectedCountry !== "Any") {
        query = query.eq("country", selectedCountry);
      }

      if (selectedPlatforms.length > 0) {
        query = query.overlaps("platforms", selectedPlatforms);
      }

      if (search.trim() !== "") {
        query = query.ilike("name", `%${search}%`);
      }

      // Execute query with ordering
      const { data, error } = await query
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching creators:", error);
        setConnectionError(true);
        setCreators([]);
      } else if (data) {
        setCreators(data as Creator[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setConnectionError(true);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch creators when filters change
  useEffect(() => {
    fetchCreators();
  }, [activeCategory, selectedPlatforms, selectedCountry, search]);

  // Connection error UI
  if (connectionError) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-6 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-6 opacity-40 italic">
            <ChevronLeft className="w-4 h-4 text-[#1D1D1D]" /> Back
          </button>
          
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔌</div>
            <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
            <p className="text-gray-600 mb-8">
              Could not connect to the database. Please check your Supabase configuration.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white text-sm font-bold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-6 sticky top-[84px] bg-white z-20 border-b border-[#1D1D1D]">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-6 opacity-40 italic hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4 text-[#1D1D1D]" /> Back
        </button>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D1D1D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH CREATORS..."
              className="w-full bg-[#F8F8F8] border border-[#1D1D1D] py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-2"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="border border-[#1D1D1D] p-4 hover:bg-black hover:text-white transition-colors"
          >
            {showFilters ? <X size={16} /> : <Filter size={16} />}
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden pt-6"
            >
              <div className="flex flex-col gap-6">
                {/* Platforms Filter */}
                <div>
                  <h3 className="text-xs font-bold mb-3">Platform</h3>
                  <div className="flex gap-2 flex-wrap">
                    {platforms.map(p => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`px-4 py-2 text-xs border flex items-center gap-1 transition-colors ${
                          selectedPlatforms.includes(p)
                            ? "bg-black text-white border-black"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {selectedPlatforms.includes(p) && (
                          <CheckCircle2 size={12} className="text-white" />
                        )}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country Filter */}
                <div>
                  <h3 className="text-xs font-bold mb-3">Country</h3>
                  <div className="flex gap-2 flex-wrap">
                    {countries.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedCountry(c)}
                        className={`px-4 py-2 text-xs border transition-colors ${
                          selectedCountry === c
                            ? "bg-black text-white border-black"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(selectedPlatforms.length > 0 || selectedCountry !== "Any" || activeCategory !== "All" || search) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 underline mt-2 self-start"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div className="py-4 border-b flex gap-2 px-6 overflow-x-auto scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs border whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? "bg-black text-white border-black" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Creators List */}
      <div className="flex-1">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold">Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          // Empty State
          <div className="text-center py-20 px-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No creators found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-black text-white text-sm font-bold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          // Creators Grid
          <div>
            {creators.map((creator, idx) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <Link
                  to={`/profile/${creator.id}`}
                  className="flex items-center gap-4 p-6"
                >
                  {/* Avatar */}
                  <ImageWithFallback
                    src={creator.avatar || 'https://via.placeholder.com/80'}
                    alt={creator.name}
                    className="w-20 h-20 object-cover border rounded-sm"
                  />

                  {/* Creator Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg">
                        {creator.name}
                      </span>
                      {creator.platforms?.map((p: string) => (
                        <span
                          key={p}
                          className="text-[8px] px-2 py-1 bg-gray-100 border rounded-sm"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        {creator.rating?.toFixed(1) || '5.0'}
                      </span>
                      <span>{creator.avg_viewers?.toLocaleString() || '0'} viewers</span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-2">
                      {creator.tags?.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[8px] px-2 py-1 bg-gray-50 border rounded-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="text-right">
                    <span className="text-xs text-gray-500">From</span>
                    <div className="text-lg font-bold text-green-600">
                      ₦{creator.price?.toLocaleString() || '0'}
                    </div>
                    <div className="flex items-center justify-end text-xs mt-1">
                      <span className="mr-1">View</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* Results Count */}
            <div className="p-4 text-center text-xs text-gray-500 border-t">
              Showing {creators.length} creator{creators.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
