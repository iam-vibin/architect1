import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Star,
  CheckCircle2,
  Heart,
  MessageCircle,
  FileText,
  DollarSign,
  Bell,
  LogOut,
  User,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  X,
  CreditCard,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EscrowPaymentModal from "@/components/EscrowPaymentModal";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"browse" | "quotes" | "favorites" | "notifications">("browse");

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Data states
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(user?.savedProfessionals || []);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.username || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Quick Enquiry Modal
  const [enquiryModalProf, setEnquiryModalProf] = useState<any | null>(null);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquirySent, setEnquirySent] = useState(false);

  // Escrow Payment Modal
  const [paymentQuote, setPaymentQuote] = useState<any | null>(null);

  // Fetch data
  const loadData = async () => {
    setLoading(true);
    try {
      const [profsRes, quotesRes, notifsRes, favsRes] = await Promise.all([
        api.professionals.list({
          search: search || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          location: selectedLocation !== "All" ? selectedLocation : undefined,
          verified: onlyVerified ? true : undefined,
          available: onlyAvailable ? true : undefined,
          minRating: minRating > 0 ? minRating : undefined,
        }),
        api.quotes.list(),
        api.notifications.list(),
        api.favorites.list(),
      ]);

      if (profsRes && profsRes.success) {
        setProfessionals(profsRes.professionals || []);
      }
      if (quotesRes && quotesRes.success) {
        setQuotes(quotesRes.quotes || []);
      }
      if (notifsRes && notifsRes.success) {
        setNotifications(notifsRes.notifications || []);
        setUnreadNotifsCount(notifsRes.unreadCount || 0);
      }
      if (favsRes && favsRes.success) {
        setFavoriteIds(favsRes.favoriteIds || []);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll for updates every 10s
    const timer = setInterval(() => {
      api.notifications.list().then((res) => {
        if (res && res.success) {
          setNotifications(res.notifications || []);
          setUnreadNotifsCount(res.unreadCount || 0);
        }
      });
      api.quotes.list().then((res) => {
        if (res && res.success) {
          setQuotes(res.quotes || []);
        }
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [search, selectedCategory, selectedLocation, onlyVerified, onlyAvailable, minRating]);

  // Toggle favorite
  const toggleFavorite = async (e: React.MouseEvent, profId: string) => {
    e.stopPropagation();
    try {
      const res = await api.favorites.toggle(profId);
      if (res && res.success) {
        setFavoriteIds(res.favoriteIds || []);
        updateUser({ savedProfessionals: res.favoriteIds });
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  // Submit enquiry
  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryModalProf || !enquiryMessage.trim()) return;

    try {
      // Send message to professional in chat
      await api.chat.send({
        from: user?.id || "guest",
        to: enquiryModalProf.id,
        message: `Project Enquiry: ${enquiryMessage.trim()}`,
      });
      setEnquirySent(true);
      setTimeout(() => {
        setEnquirySent(false);
        setEnquiryModalProf(null);
        setEnquiryMessage("");
      }, 1500);
    } catch (err) {
      console.error("Error sending enquiry:", err);
    }
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.auth.updateProfile(profileForm);
      if (res && res.success) {
        updateUser(res.user);
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setProfileSaving(false);
    }
  };

  // Release Escrow
  const handleReleaseEscrow = async (quoteId: string) => {
    if (!confirm("Are you satisfied with the project deliverable and ready to release funds to the professional?")) {
      return;
    }
    try {
      const res = await api.payments.releaseEscrow(quoteId);
      if (res && res.success) {
        loadData();
      }
    } catch (err) {
      console.error("Release escrow error:", err);
    }
  };

  const categories = ["All", "Architect", "Interior Designer", "Builder"];
  const locations = ["All", "Chennai", "Coimbatore", "Madurai", "Trichy", "Bangalore"];

  // Filtered favorite professionals list
  const favoritedPros = professionals.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-foreground tracking-tight">ArchiFind</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-full">
                Client Portal
              </span>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("notifications")}
              className="relative text-foreground hover:bg-muted"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/chats")}
              className="gap-1.5 text-xs font-semibold hidden sm:flex"
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Messages</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 hover:bg-muted"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-xs text-primary">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  (user?.fullName || user?.username || "U")[0].toUpperCase()
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold">{user?.fullName || user?.username}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Logout"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Welcome Greeting & Quick Platform Stats */}
        <div className="mb-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {user?.fullName || user?.username || "Client"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Find architects, compare quotations, chat with verified experts, and manage escrow payments.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/50 rounded-xl border border-border/60 text-center">
                <p className="text-xl font-bold text-foreground">{professionals.filter((p) => p.isVerified).length}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Verified Pros</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border/60 text-center">
                <p className="text-xl font-bold text-primary">{quotes.length}</p>
                <p className="text-[11px] text-muted-foreground font-medium">My Quotes</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border/60 text-center">
                <p className="text-xl font-bold text-rose-500">{favoriteIds.length}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Saved Pros</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border/60 text-center">
                <p className="text-xl font-bold text-emerald-600">
                  ₹{quotes.reduce((sum, q) => sum + (q.escrowAmount || 0), 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">In Escrow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-border mb-6 gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("browse")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "browse"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Find Professionals</span>
            <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{professionals.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("quotes")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "quotes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Quotations & Escrow</span>
            {quotes.length > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">{quotes.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "favorites"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Favorites</span>
            {favoriteIds.length > 0 && (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-xs">{favoriteIds.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "notifications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="px-2 py-0.5 bg-destructive text-white rounded-full text-xs">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: BROWSE & SEARCH PROFESSIONALS */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            {/* Search & Advanced Filters Bar */}
            <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, skill, specialization, keyword..."
                    className="pl-10 h-11 text-sm bg-muted/30"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-40">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full h-11 px-3 text-xs bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          📍 {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-36">
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full h-11 px-3 text-xs bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none"
                    >
                      <option value={0}>⭐ Any Rating</option>
                      <option value={4.5}>⭐ 4.5 & Above</option>
                      <option value={4.8}>⭐ 4.8 & Above</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category selector chips & Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground font-medium">
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-0"
                    />
                    <span>Verified Only</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground font-medium">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="rounded border-border text-emerald-600 focus:ring-0"
                    />
                    <span>Available Now</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Professionals Grid */}
            {loading ? (
              <div className="py-20 text-center text-sm text-muted-foreground">Loading architecture experts...</div>
            ) : professionals.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No professionals found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords, location or category filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                    setSelectedLocation("All");
                    setOnlyVerified(false);
                    setOnlyAvailable(false);
                    setMinRating(0);
                  }}
                  className="mt-4 text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((prof) => {
                  const isFav = favoriteIds.includes(prof.id);
                  const heroImg = prof.portfolio?.[0]?.image || prof.avatar;

                  return (
                    <div
                      key={prof.id}
                      className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col group"
                    >
                      {/* Card Image Banner */}
                      <div className="relative h-48 bg-muted overflow-hidden">
                        <img
                          src={heroImg}
                          alt={prof.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Top action badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg">
                            {prof.profession}
                          </span>

                          <button
                            onClick={(e) => toggleFavorite(e, prof.id)}
                            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-white transition shadow-sm"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                        </div>

                        {/* Bottom overlay info */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                          <div className="flex items-center gap-2">
                            <img
                              src={prof.avatar}
                              alt={prof.name}
                              className="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm leading-tight">{prof.name}</h3>
                                {prof.isVerified && (
                                  <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/80 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{prof.location}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-lg font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{prof.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                            {prof.specialization}
                          </p>
                          <p className="text-xs text-foreground/80 mt-1.5 line-clamp-2 leading-relaxed">
                            {prof.about}
                          </p>
                        </div>

                        {/* Quick Specs */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground block">Experience:</span>
                            <span className="font-semibold text-foreground">{prof.experience} Years</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Projects Done:</span>
                            <span className="font-semibold text-foreground">{prof.projectsCompleted}+ completed</span>
                          </div>
                        </div>

                        {/* Portfolios Preview Strip */}
                        {prof.portfolio && prof.portfolio.length > 0 && (
                          <div className="flex gap-1.5 overflow-hidden">
                            {prof.portfolio.slice(0, 3).map((item: any) => (
                              <div
                                key={item.id}
                                className="w-1/3 h-14 rounded-lg overflow-hidden bg-muted relative group/thumb cursor-pointer"
                                onClick={() => navigate(`/professional/${prof.id}`)}
                              >
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 text-[10px] text-white flex items-center justify-center text-center p-1 font-medium transition">
                                  View
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Card Action Buttons */}
                        <div className="pt-2 border-t border-border flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/professional/${prof.id}`)}
                            className="flex-1 text-xs h-9"
                          >
                            Profile & Work
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => navigate(`/quote/${prof.id}`)}
                            className="flex-1 text-xs h-9 bg-primary hover:bg-primary/90"
                          >
                            Get Quote
                          </Button>

                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setEnquiryModalProf(prof)}
                            title="Quick Enquiry"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY QUOTATIONS & ESCROW TRACKER */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-foreground">Quotations & Escrow Tracker</h2>
                <p className="text-xs text-muted-foreground">
                  Track your project estimates, approve proposals, and deposit or release funds securely.
                </p>
              </div>
            </div>

            {quotes.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No quotation requests yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Browse professionals and click "Get Quote" to receive project estimates and timeline details.
                </p>
                <Button size="sm" onClick={() => setActiveTab("browse")} className="mt-4 text-xs">
                  Explore Professionals
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((q) => {
                  const statusColors: Record<string, string> = {
                    requested: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    quoted: "bg-sky-500/10 text-sky-600 border-sky-500/20",
                    accepted: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
                    in_progress: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    completed: "bg-purple-500/10 text-purple-600 border-purple-500/20",
                    rejected: "bg-destructive/10 text-destructive border-destructive/20",
                  };

                  return (
                    <div
                      key={q.id}
                      className="bg-card border border-border p-5 rounded-2xl shadow-card hover:shadow-elevated transition space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground text-base">{q.projectType}</h3>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  statusColors[q.status] || "bg-muted text-muted-foreground"
                                }`}
                              >
                                {q.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Quote Ref: <span className="font-mono">{q.quoteNumber}</span> • Professional:{' '}
                              <strong className="text-foreground">{q.professionalName}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Escrow badge */}
                        {q.escrowStatus === "held_in_escrow" && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Escrow Funded (₹{q.escrowAmount.toLocaleString()})</span>
                          </div>
                        )}
                        {q.escrowStatus === "released" && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-300 rounded-xl text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            <span>Payment Released</span>
                          </div>
                        )}
                      </div>

                      {/* Description & Requirements */}
                      <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40">
                        {q.description}
                      </p>

                      {/* Quotation Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-muted/40 p-2.5 rounded-xl">
                          <span className="text-muted-foreground block text-[11px]">Client Budget:</span>
                          <span className="font-semibold text-foreground">{q.clientBudget || "Flexible"}</span>
                        </div>
                        <div className="bg-muted/40 p-2.5 rounded-xl">
                          <span className="text-muted-foreground block text-[11px]">Timeline:</span>
                          <span className="font-semibold text-foreground">{q.timeline || "Not specified"}</span>
                        </div>
                        <div className="bg-muted/40 p-2.5 rounded-xl">
                          <span className="text-muted-foreground block text-[11px]">Estimated Price:</span>
                          <span className="font-bold text-foreground text-sm">
                            {q.quoteAmount > 0 ? `₹${q.quoteAmount.toLocaleString()}` : "Awaiting Estimate"}
                          </span>
                        </div>
                        <div className="bg-muted/40 p-2.5 rounded-xl">
                          <span className="text-muted-foreground block text-[11px]">Est. Duration:</span>
                          <span className="font-semibold text-foreground">
                            {q.estimatedDays ? `${q.estimatedDays} Days` : "TBD"}
                          </span>
                        </div>
                      </div>

                      {q.quoteNotes && (
                        <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-xl p-3 text-xs text-sky-900 dark:text-sky-300">
                          <strong>Professional Proposal Notes:</strong> {q.quoteNotes}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/chat/${q.professionalId}`)}
                          className="text-xs h-9 gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat with {q.professionalName}</span>
                        </Button>

                        {q.status === "quoted" && (
                          <Button
                            size="sm"
                            onClick={() => setPaymentQuote(q)}
                            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Accept & Deposit Escrow (₹{q.quoteAmount.toLocaleString()})</span>
                          </Button>
                        )}

                        {q.status === "in_progress" && q.escrowStatus === "held_in_escrow" && (
                          <Button
                            size="sm"
                            onClick={() => handleReleaseEscrow(q.id)}
                            className="text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Release Payment</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED FAVORITES */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Saved Professionals ({favoritedPros.length})</h2>
            {favoritedPros.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No saved professionals</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click the heart icon on any architect or designer card to bookmark them here for easy access.
                </p>
                <Button size="sm" onClick={() => setActiveTab("browse")} className="mt-4 text-xs">
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritedPros.map((prof) => (
                  <div
                    key={prof.id}
                    className="bg-card border border-border p-4 rounded-2xl shadow-card space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-14 h-14 rounded-xl object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm truncate">{prof.name}</h3>
                          {prof.isVerified && (
                            <span className="w-4 h-4 bg-emerald-500 rounded-full text-white text-[10px] flex items-center justify-center">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary font-medium">{prof.profession}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{prof.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/professional/${prof.id}`)}
                        className="flex-1 text-xs h-9"
                      >
                        Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/quote/${prof.id}`)}
                        className="flex-1 text-xs h-9"
                      >
                        Request Quote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Recent Notifications</h2>
              {unreadNotifsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await api.notifications.markAllRead();
                    loadData();
                  }}
                  className="text-xs text-primary"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No notifications</h3>
                <p className="text-xs text-muted-foreground mt-1">You are all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (!n.isRead) {
                        await api.notifications.markRead(n.id);
                        loadData();
                      }
                      if (n.link) navigate(n.link);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      n.isRead
                        ? "bg-card border-border text-foreground"
                        : "bg-primary/5 border-primary/20 text-foreground shadow-sm"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-foreground">{n.title}</h4>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Profile Management Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Manage Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Full Name</label>
                <Input
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Phone Number</label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Location / City</label>
                <Input
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Bio / Project Goals</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Describe your current architectural or interior design requirements..."
                  className="w-full text-xs p-3 border border-border rounded-xl bg-background min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 text-xs h-10 bg-primary hover:bg-primary/90"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Enquiry Modal */}
      {enquiryModalProf && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground text-base">Quick Project Enquiry</h3>
                <p className="text-xs text-muted-foreground">To: {enquiryModalProf.name}</p>
              </div>
              <button
                onClick={() => setEnquiryModalProf(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            {enquirySent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                <h4 className="font-bold text-foreground text-sm">Enquiry Sent!</h4>
                <p className="text-xs text-muted-foreground">Message delivered to professional's chat inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Your Message / Questions</label>
                  <textarea
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Hello, I have a residential renovation project and would like to know your earliest availability..."
                    className="w-full text-xs p-3 border border-border rounded-xl bg-background min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEnquiryModalProf(null)}
                    className="flex-1 text-xs h-10"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 text-xs h-10 bg-primary hover:bg-primary/90 gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Escrow Payment Modal */}
      {paymentQuote && (
        <EscrowPaymentModal
          quote={paymentQuote}
          isOpen={!!paymentQuote}
          onClose={() => setPaymentQuote(null)}
          onPaymentSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
