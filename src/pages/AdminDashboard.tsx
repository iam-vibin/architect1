import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Building2, Clock, MessageCircle, CheckCircle, XCircle,
  LogOut, Shield, TrendingUp, AlertCircle, Search, Trash2, Eye, FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

interface AdminStats {
  totalUsers: number;
  totalProfessionals: number;
  pendingVerifications: number;
  activeChats: number;
  totalQuotes: number;
  pendingQuotes: number;
}

type TabType = "overview" | "users" | "professionals" | "quotes" | "reports";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [proSearch, setProSearch] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, prosRes, quotesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`),
        fetch(`${API_BASE}/api/users`),
        fetch(`${API_BASE}/api/professionals`),
        fetch(`${API_BASE}/api/quotes`),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (prosRes.ok) setProfessionals(await prosRes.json());
      if (quotesRes.ok) setQuotes(await quotesRes.json());
    } catch {}
    finally { setLoading(false); }
  };

  const handleVerify = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`${API_BASE}/api/professionals/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setProfessionals(prev => prev.map(p =>
          p.id === id ? { ...p, isVerified: action === "approve", verificationStatus: action === "approve" ? "approved" : "rejected" } : p
        ));
        // Refresh stats
        fetch(`${API_BASE}/api/admin/stats`).then(r => r.json()).then(setStats).catch(() => {});
        setActionMsg(`Professional ${action === "approve" ? "approved" : "rejected"} successfully.`);
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch {}
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setActionMsg("User deleted.");
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch {}
  };

  const handleToggleUserStatus = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !isActive } : u));
      }
    } catch {}
  };

  const handleLogout = () => { logout(); navigate("/select-role"); };

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPros = professionals.filter(p =>
    !proSearch ||
    p.name?.toLowerCase().includes(proSearch.toLowerCase()) ||
    p.profession?.toLowerCase().includes(proSearch.toLowerCase()) ||
    p.location?.toLowerCase().includes(proSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", trend: "+12%" },
    { label: "Professionals", value: stats?.totalProfessionals || 0, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", trend: "+5%" },
    { label: "Pending Verif.", value: stats?.pendingVerifications || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", trend: null },
    { label: "Active Chats", value: stats?.activeChats || 0, icon: MessageCircle, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", trend: "+28%" },
    { label: "Total Quotes", value: stats?.totalQuotes || 0, icon: FileText, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", trend: null },
    { label: "Pending Quotes", value: stats?.pendingQuotes || 0, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", trend: null },
  ];

  const pendingPros = professionals.filter(p => !p.isVerified && p.verificationStatus !== "rejected");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base">ArchiFind Admin</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Panel</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Manage users, professionals, and platform activity</p>
        </div>

        {actionMsg && (
          <div className="mb-4 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100">
            {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map(s => (
            <div key={s.label} className={`bg-white border ${s.border} rounded-2xl p-4 shadow-sm`}>
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                {s.trend && <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{s.trend}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {(["overview", "users", "professionals", "quotes"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all relative ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
              {tab === "professionals" && pendingPros.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">{pendingPros.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pending verifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Pending Verifications</h2>
                {pendingPros.length > 0 && (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">{pendingPros.length}</span>
                )}
              </div>
              {pendingPros.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">All verifications handled ✅</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pendingPros.slice(0, 5).map(p => (
                    <div key={p.id} className="px-5 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                        {p.avatar ? <img src={p.avatar.startsWith('/') ? `${API_BASE}${p.avatar}` : p.avatar} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.profession}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(p.id, "rejected")} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleVerify(p.id, "approve")} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent professionals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Professionals</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {professionals.slice(0, 5).map(p => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                      {p.avatar ? <img src={p.avatar.startsWith('/') ? `${API_BASE}${p.avatar}` : p.avatar} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.profession}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">All Users ({filteredUsers.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{u.name || u.username}</p>
                          <p className="text-xs text-gray-400">{u.email || u.username}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${u.role === "admin" ? "bg-purple-100 text-purple-700" : u.role === "professional" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {u.isActive !== false ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.isActive !== false)}
                            className={`p-1.5 rounded-lg text-xs font-medium ${u.isActive !== false ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                          >
                            {u.isActive !== false ? "Suspend" : "Activate"}
                          </button>
                          {u.role !== "admin" && (
                            <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No users found</div>
              )}
            </div>
          </div>
        )}

        {/* Professionals tab */}
        {activeTab === "professionals" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">All Professionals ({filteredPros.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={proSearch}
                  onChange={e => setProSearch(e.target.value)}
                  placeholder="Search professionals..."
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredPros.map(p => (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {p.avatar ? <img src={p.avatar.startsWith('/') ? `${API_BASE}${p.avatar}` : p.avatar} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-400">{p.profession} • {p.location || "—"} • {p.experience || 0} yrs</p>
                    <p className="text-xs text-gray-400 mt-0.5">Views: {p.profileViews || 0} • Leads: {p.leadsCount || 0} • Rating: {p.rating?.toFixed(1) || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.isVerified ? "bg-emerald-100 text-emerald-700" : p.verificationStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.isVerified ? "Verified" : p.verificationStatus === "rejected" ? "Rejected" : "Pending"}
                    </span>
                    {!p.isVerified && p.verificationStatus !== "rejected" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleVerify(p.id, "rejected")} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleVerify(p.id, "approve")} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {p.isVerified && (
                      <button onClick={() => handleVerify(p.id, "reject")} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-medium" title="Revoke">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredPros.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No professionals found</div>
              )}
            </div>
          </div>
        )}

        {/* Quotes tab */}
        {activeTab === "quotes" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">All Quotes ({quotes.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quotes.map(q => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{q.projectType || "General"}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{q.description}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{q.budget || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${q.status === "accepted" ? "bg-emerald-100 text-emerald-700" : q.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {quotes.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No quotes yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
