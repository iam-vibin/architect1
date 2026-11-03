import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfessionalCard from "../components/ProfessionalCard";
import { Search, MapPin, Filter, Star, Bell, LogOut, User, Heart, FileText, ChevronDown } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

interface Professional {
  id: string;
  name: string;
  profession?: string;
  specialization?: string;
  location?: string;
  experience?: number;
  bio?: string;
  avatar?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  projectsCompleted?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const PROFESSIONS = ["All", "Architect", "Interior Designer", "Builder"];
const LOCATIONS = ["All Locations", "Chennai", "Coimbatore", "Madurai", "Trichy", "Bangalore", "Mumbai", "Delhi"];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [myQuotes, setMyQuotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"discover" | "quotes" | "favourites">("discover");

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedProfession !== "All") params.set("profession", selectedProfession);
      if (selectedLocation !== "All Locations") params.set("location", selectedLocation);
      if (minRating > 0) params.set("minRating", String(minRating));
      if (verifiedOnly) params.set("verified", "true");

      const res = await fetch(`${API_BASE}/api/professionals?${params}`);
      if (res.ok) setProfessionals(await res.json());
    } catch (err) { /* network error */ }
    finally { setLoading(false); }
  }, [search, selectedProfession, selectedLocation, minRating, verifiedOnly]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  useEffect(() => {
    if (!user) return;
    // Fetch notifications
    fetch(`${API_BASE}/api/notifications/${user.id}`)
      .then(r => r.json()).then(setNotifications).catch(() => {});
    // Fetch favourites
    fetch(`${API_BASE}/api/favourites/${user.id}`)
      .then(r => r.json()).then((favs: any[]) => setFavourites(favs.map(f => f.professionalId))).catch(() => {});
    // Fetch quotes
    fetch(`${API_BASE}/api/quotes?userId=${user.id}`)
      .then(r => r.json()).then(setMyQuotes).catch(() => {});
  }, [user]);

  const toggleFavourite = async (professionalId: string) => {
    if (!user) return;
    if (favourites.includes(professionalId)) {
      await fetch(`${API_BASE}/api/favourites/${user.id}/${professionalId}`, { method: "DELETE" });
      setFavourites(prev => prev.filter(id => id !== professionalId));
    } else {
      await fetch(`${API_BASE}/api/favourites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, professionalId }),
      });
      setFavourites(prev => [...prev, professionalId]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const favouritePros = professionals.filter(p => favourites.includes(p.id));

  const handleLogout = () => { logout(); navigate("/select-role"); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AF</span>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">ArchiFind</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search architects, designers..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 text-xs hover:text-gray-600">✕</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-6">No notifications</p>
                    ) : notifications.slice(0, 10).map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600"
            >
              <User className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-blue-600">{user?.name || user?.username}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Find and connect with top architecture professionals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Professionals", value: professionals.length, color: "bg-blue-50 text-blue-700", border: "border-blue-100" },
            { label: "Verified", value: professionals.filter(p => p.isVerified).length, color: "bg-emerald-50 text-emerald-700", border: "border-emerald-100" },
            { label: "Favourites", value: favourites.length, color: "bg-rose-50 text-rose-700", border: "border-rose-100" },
            { label: "My Quotes", value: myQuotes.length, color: "bg-amber-50 text-amber-700", border: "border-amber-100" },
          ].map(stat => (
            <div key={stat.label} className={`bg-white border ${stat.border} rounded-2xl p-4`}>
              <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          {(["discover", "quotes", "favourites"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab === "quotes" ? "My Quotes" : tab}
            </button>
          ))}
        </div>

        {activeTab === "discover" && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-2 flex-wrap">
                  {PROFESSIONS.map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedProfession(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedProfession === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                    <select
                      value={selectedLocation}
                      onChange={e => setSelectedLocation(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5 flex items-center gap-1"><Star className="w-3 h-3" /> Min Rating</label>
                    <select
                      value={minRating}
                      onChange={e => setMinRating(Number(e.target.value))}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={3}>3+</option>
                      <option value={4}>4+</option>
                      <option value={4.5}>4.5+</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={e => setVerifiedOnly(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700 font-medium">Verified Only</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                {loading ? "Searching..." : `${professionals.length} professional${professionals.length !== 1 ? "s" : ""} found`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse overflow-hidden">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700">No professionals found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
                <button onClick={() => { setSearch(""); setSelectedProfession("All"); setSelectedLocation("All Locations"); setMinRating(0); setVerifiedOnly(false); }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {professionals.map(pro => (
                  <ProfessionalCard
                    key={pro.id}
                    professional={pro}
                    onFavourite={toggleFavourite}
                    isFavourited={favourites.includes(pro.id)}
                    onQuoteRequest={id => navigate(`/quote/${id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "quotes" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">My Quote Requests</h2>
            </div>
            {myQuotes.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No quote requests yet</p>
                <button onClick={() => setActiveTab("discover")} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Browse Professionals</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myQuotes.map(q => (
                  <div key={q.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{q.projectType || "General Request"}</p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{q.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize ${q.status === "accepted" ? "bg-emerald-100 text-emerald-700" : q.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favourites" && (
          <>
            {favouritePros.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">No favourites yet</h3>
                <p className="text-gray-400 mt-1">Click the heart icon on any professional card</p>
                <button onClick={() => setActiveTab("discover")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Browse Professionals</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {favouritePros.map(pro => (
                  <ProfessionalCard
                    key={pro.id}
                    professional={pro}
                    onFavourite={toggleFavourite}
                    isFavourited={true}
                    onQuoteRequest={id => navigate(`/quote/${id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
