import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle, FileText, Star, TrendingUp, Eye, LogOut, Bell,
  Camera, Edit2, MapPin, Phone, Briefcase, CheckCircle2, Upload,
  X, BarChart2, Calendar, Check, XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

interface ProfessionalProfile {
  id: string;
  name: string;
  profession: string;
  specialization: string;
  location: string;
  experience: number;
  bio: string;
  phoneNumber: string;
  avatar: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
  isVerified: boolean;
  isAvailable: boolean;
  profileViews: number;
  leadsCount: number;
}

interface QuoteRequest {
  id: string;
  userId: string;
  projectType: string;
  description: string;
  budget: string;
  timeline: string;
  phone: string;
  status: string;
  createdAt: string;
}

interface ChatThread {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Stats {
  profileViews: number;
  leadsCount: number;
  conversionRate: number;
  totalQuotes: number;
  acceptedQuotes: number;
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
}

type TabType = "overview" | "quotes" | "portfolio" | "messages" | "profile";

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateSession } = useAuth();

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showNotifs, setShowNotifs] = useState(false);

  // Profile editing
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "", profession: "Architect", specialization: "", location: "",
    experience: 0, bio: "", phoneNumber: "", isAvailable: true
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const profId = user?.id;

  useEffect(() => {
    if (!profId) return;
    loadAll();
  }, [profId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [profRes, quotesRes, threadsRes, statsRes, notifsRes] = await Promise.all([
        fetch(`${API_BASE}/api/professionals/${profId}`),
        fetch(`${API_BASE}/api/quotes?professionalId=${profId}`),
        fetch(`${API_BASE}/api/chat/threads/${profId}`),
        fetch(`${API_BASE}/api/professionals/${profId}/stats`),
        fetch(`${API_BASE}/api/notifications/${profId}`),
      ]);

      if (profRes.ok) {
        const data = await profRes.json();
        setProfile(data);
        setForm({
          name: data.name || "",
          profession: data.profession || "Architect",
          specialization: data.specialization || "",
          location: data.location || "",
          experience: data.experience || 0,
          bio: data.bio || "",
          phoneNumber: data.phoneNumber || "",
          isAvailable: data.isAvailable !== false,
        });
      }
      if (quotesRes.ok) setQuotes(await quotesRes.json());
      if (threadsRes.ok) setThreads(await threadsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
    } catch (err) { /* network error */ }
    finally { setLoading(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const fd = new FormData();
      fd.append("userId", profId!);
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

      const res = await fetch(`${API_BASE}/api/professionals/${profId}`, { method: "PUT", body: fd });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        updateSession({ name: updated.name });
        setEditMode(false);
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      } else {
        setProfileMsg({ type: "error", text: "Failed to save profile." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error." });
    }
    setSavingProfile(false);
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !profId) return;
    setUploadingPortfolio(true);
    const fd = new FormData();
    fd.append("userId", profId);
    Array.from(e.target.files).forEach(f => fd.append("images", f));

    try {
      const res = await fetch(`${API_BASE}/api/professionals/${profId}`, { method: "PUT", body: fd });
      if (res.ok) {
        const updated = await res.json();
        setProfile(prev => prev ? { ...prev, portfolio: updated.portfolio } : prev);
        setProfileMsg({ type: "success", text: "Portfolio updated!" });
      }
    } catch { setProfileMsg({ type: "error", text: "Upload failed." }); }
    setUploadingPortfolio(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !profId) return;
    const fd = new FormData();
    fd.append("avatar", e.target.files[0]);
    try {
      const res = await fetch(`${API_BASE}/api/professionals/${profId}/avatar`, { method: "POST", body: fd });
      if (res.ok) {
        const { avatar } = await res.json();
        setProfile(prev => prev ? { ...prev, avatar } : prev);
      }
    } catch {}
  };

  const handleQuoteAction = async (quoteId: string, action: "accepted" | "rejected") => {
    try {
      const res = await fetch(`${API_BASE}/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: action } : q));
      }
    } catch {}
  };

  const handleLogout = () => { logout(); navigate("/select-role"); };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingQuotes = quotes.filter(q => q.status === "pending");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const imgUrl = (src: string) => src?.startsWith('/') ? `${API_BASE}${src}` : src;

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

          <div className="flex items-center gap-2">
            {/* Availability toggle */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100">
              <div className={`w-2 h-2 rounded-full ${profile?.isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span className="text-xs font-medium text-gray-600">{profile?.isAvailable ? "Available" : "Busy"}</span>
            </div>

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
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 text-xs">✕</button>
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

            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile?.avatar ? imgUrl(profile.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.username || 'P')}&background=1E3A8A&color=fff&size=128`}
              alt={profile?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=1E3A8A&color=fff`; }}
            />
            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{profile?.name || user?.username}</h1>
              {profile?.isVerified && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-blue-600 font-semibold text-sm mt-0.5">{profile?.profession || "Architect"}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>}
              {profile?.experience !== undefined && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{profile.experience} yrs</span>}
              {profile?.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{profile.phoneNumber}</span>}
              {profile?.rating !== undefined && profile.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{profile.rating.toFixed(1)}</span>}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Profile Views", value: stats?.profileViews || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Leads", value: stats?.leadsCount || 0, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Quotes", value: stats?.totalQuotes || 0, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Conversion", value: `${stats?.conversionRate || 0}%`, icon: BarChart2, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {(["overview", "quotes", "portfolio", "messages", "profile"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all relative ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
              {tab === "quotes" && pendingQuotes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{pendingQuotes.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent messages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Messages</h2>
                <button onClick={() => setActiveTab("messages")} className="text-blue-600 text-xs font-medium hover:underline">View all</button>
              </div>
              {threads.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No conversations yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {threads.slice(0, 4).map(t => (
                    <div key={t.partnerId} onClick={() => navigate(`/professional/chat/${t.partnerId}`)} className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50">
                      <img src={t.partnerAvatar ? imgUrl(t.partnerAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(t.partnerName)}&background=E5E7EB&color=374151`} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{t.partnerName}</p>
                        <p className="text-xs text-gray-400 truncate">{t.lastMessage}</p>
                      </div>
                      {t.unreadCount > 0 && <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center shrink-0">{t.unreadCount}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent quotes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Quotes</h2>
                <button onClick={() => setActiveTab("quotes")} className="text-blue-600 text-xs font-medium hover:underline">View all</button>
              </div>
              {quotes.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No quote requests yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {quotes.slice(0, 4).map(q => (
                    <div key={q.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{q.projectType || "General"}</p>
                        <p className="text-xs text-gray-400 truncate">{q.description}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${q.status === "accepted" ? "bg-emerald-100 text-emerald-700" : q.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {q.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotes tab */}
        {activeTab === "quotes" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Quote Requests</h2>
            </div>
            {quotes.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No quote requests yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {quotes.map(q => (
                  <div key={q.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${q.status === "accepted" ? "bg-emerald-100 text-emerald-700" : q.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {q.status}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-medium text-gray-900">{q.projectType || "General Request"}</p>
                        <p className="text-sm text-gray-500 mt-1">{q.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          {q.budget && <span>💰 {q.budget}</span>}
                          {q.timeline && <span>📅 {q.timeline}</span>}
                          {q.phone && <span>📞 {q.phone}</span>}
                        </div>
                      </div>
                      {q.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleQuoteAction(q.id, "accepted")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleQuoteAction(q.id, "rejected")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portfolio tab */}
        {activeTab === "portfolio" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Portfolio ({profile?.portfolio?.length || 0} images)</h2>
              <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-blue-700 ${uploadingPortfolio ? 'opacity-60' : ''}`}>
                <Upload className="w-3.5 h-3.5" />
                {uploadingPortfolio ? "Uploading..." : "Upload Images"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioUpload} disabled={uploadingPortfolio} />
              </label>
            </div>
            {profileMsg && (
              <div className={`mx-5 mt-4 px-4 py-3 rounded-xl text-sm ${profileMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {profileMsg.text}
              </div>
            )}
            {!profile?.portfolio?.length ? (
              <div className="text-center py-16">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No portfolio images yet</p>
                <p className="text-gray-400 text-sm mt-1">Upload your work to attract clients</p>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {profile.portfolio.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={imgUrl(img)} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80'; }} />
                    <button
                      onClick={async () => {
                        if (!confirm("Remove this image?")) return;
                        await fetch(`${API_BASE}/api/professionals/${profId}/portfolio/${idx}`, { method: "DELETE" });
                        setProfile(prev => prev ? { ...prev, portfolio: prev.portfolio.filter((_, i) => i !== idx) } : prev);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages tab */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Messages</h2>
            </div>
            {threads.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                No conversations yet
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {threads.map(t => (
                  <div key={t.partnerId} onClick={() => navigate(`/professional/chat/${t.partnerId}`)} className="px-5 py-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <img src={t.partnerAvatar ? imgUrl(t.partnerAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(t.partnerName)}&background=E5E7EB&color=374151`} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{t.partnerName}</p>
                      <p className="text-sm text-gray-400 truncate">{t.lastMessage}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{t.lastMessageTime ? new Date(t.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</p>
                      {t.unreadCount > 0 && <span className="inline-flex w-5 h-5 bg-blue-600 text-white text-xs rounded-full items-center justify-center mt-1">{t.unreadCount}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile edit tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Edit Profile</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>
            {profileMsg && (
              <div className={`mx-5 mt-4 px-4 py-3 rounded-xl text-sm ${profileMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {profileMsg.text}
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Display Name", key: "name", type: "text" },
                  { label: "Profession", key: "profession", type: "select", options: ["Architect", "Interior Designer", "Builder"] },
                  { label: "Specialization", key: "specialization", type: "text" },
                  { label: "Location", key: "location", type: "text" },
                  { label: "Experience (years)", key: "experience", type: "number" },
                  { label: "Phone Number", key: "phoneNumber", type: "tel" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        value={(form as any)[field.key]}
                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        disabled={!editMode}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {field.options?.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={(form as any)[field.key]}
                        onChange={e => setForm(prev => ({ ...prev, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                        disabled={!editMode}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 text-gray-900"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!editMode}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 text-gray-900 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={form.isAvailable}
                  onChange={e => setForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  disabled={!editMode}
                  className="w-4 h-4"
                />
                <label htmlFor="isAvailable" className="text-sm text-gray-700">Available for new projects</label>
              </div>
              {editMode && (
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={savingProfile} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60">
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
