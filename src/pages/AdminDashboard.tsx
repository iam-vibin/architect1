import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  Shield,
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers,
  FileText,
  DollarSign,
  LogOut,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "verifications" | "users" | "professionals" | "quotes" | "categories" | "reports"
  >("overview");

  // State data
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalProfessionals: 0,
    verifiedProfessionals: 0,
    pendingVerifications: 0,
    activeChats: 0,
    totalQuotes: 0,
    escrowVolume: 0,
    activeEscrowAmount: 0,
    pendingReports: 0,
  });

  const [usersList, setUsersList] = useState<any[]>([]);
  const [professionalsList, setProfessionalsList] = useState<any[]>([]);
  const [quotesList, setQuotesList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter/search
  const [searchQuery, setSearchQuery] = useState("");

  // Category modal
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, profsRes, quotesRes, catsRes, reportsRes] = await Promise.all([
        api.admin.stats(),
        api.admin.users(),
        api.admin.professionals(),
        api.quotes.list(),
        api.admin.categories(),
        api.admin.reports(),
      ]);

      if (statsRes && statsRes.success) setStats(statsRes.stats);
      if (usersRes && usersRes.success) setUsersList(usersRes.users || []);
      if (profsRes && profsRes.success) setProfessionalsList(profsRes.professionals || []);
      if (quotesRes && quotesRes.success) setQuotesList(quotesRes.quotes || []);
      if (catsRes && catsRes.success) setCategoriesList(catsRes.categories || []);
      if (reportsRes && reportsRes.success) setReportsList(reportsRes.reports || []);
    } catch (err) {
      console.error("Admin data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Verification action
  const handleVerify = async (profId: string, action: "approved" | "rejected") => {
    try {
      const res = await api.admin.verifyProfessional(profId, action);
      if (res && res.success) {
        loadAdminData();
      }
    } catch (err) {
      console.error("Verification update error:", err);
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await api.admin.toggleUserStatus(userId, newStatus);
      if (res && res.success) {
        loadAdminData();
      }
    } catch (err) {
      console.error("Toggle user status error:", err);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      const res = await api.admin.deleteUser(userId);
      if (res && res.success) {
        loadAdminData();
      }
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.admin.addCategory(newCategoryName.trim(), newCategoryDesc.trim());
      if (res && res.success) {
        setShowAddCatModal(false);
        setNewCategoryName("");
        setNewCategoryDesc("");
        loadAdminData();
      }
    } catch (err) {
      console.error("Add category error:", err);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await api.admin.deleteCategory(catId);
      if (res && res.success) {
        loadAdminData();
      }
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  // Resolve Report
  const handleResolveReport = async (reportId: string) => {
    try {
      const res = await api.admin.resolveReport(reportId, "Reviewed and action taken by administrator");
      if (res && res.success) {
        loadAdminData();
      }
    } catch (err) {
      console.error("Resolve report error:", err);
    }
  };

  const pendingVerificationList = professionalsList.filter(
    (p) => p.verificationStatus === "pending" || (!p.isVerified && p.verificationDocs?.length > 0)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">ArchiFind Admin</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-purple-300 font-bold px-2 py-0.5 bg-purple-950/60 rounded-full border border-purple-800">
                System Control Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAdminData}
              className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Logout"
              className="text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Professionals</span>
              <Building2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalProfessionals}</p>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Verify</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingVerifications}</p>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Quotes</span>
              <FileText className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalQuotes}</p>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Escrow Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-600">₹{(stats.escrowVolume || 0).toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Open Reports</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600">{stats.pendingReports}</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-border gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("verifications")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "verifications"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Verifications</span>
            {pendingVerificationList.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">
                {pendingVerificationList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "users"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("professionals")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "professionals"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Professionals ({professionalsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quotes")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "quotes"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Platform Quotes & Escrow ({quotesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "categories"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categoriesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "reports"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Reports ({reportsList.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending verifications quick card */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-foreground text-base">Pending Verifications</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("verifications")}
                  className="text-xs text-primary"
                >
                  View All ({pendingVerificationList.length})
                </Button>
              </div>

              {pendingVerificationList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No pending verification requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingVerificationList.slice(0, 3).map((prof) => (
                    <div key={prof.id} className="p-3 bg-muted/30 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={prof.avatar} alt="" className="w-10 h-10 rounded-lg object-cover bg-muted" />
                        <div>
                          <p className="font-bold text-xs text-foreground">{prof.name}</p>
                          <p className="text-[11px] text-muted-foreground">{prof.profession} • {prof.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(prof.id, "rejected")}
                          className="text-xs h-8 text-destructive"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(prof.id, "approved")}
                          className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Escrow Overview */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-foreground text-base">Escrow Financial Highlights</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("quotes")}
                  className="text-xs text-primary"
                >
                  View All Quotes
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Currently Held in Escrow</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    ₹{(stats.activeEscrowAmount || 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <p className="text-xs text-purple-800 dark:text-purple-300 font-medium">Lifetime Processed Volume</p>
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1">
                    ₹{(stats.escrowVolume || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted/40 rounded-xl leading-relaxed">
                🛡️ ArchiFind automated escrow guarantees client funds remain safely locked until satisfactory milestone
                approval. In case of project disputes, admin mediation can refund or release funds directly.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERIFICATIONS */}
        {activeTab === "verifications" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Professional Verification Queue</h2>
              <p className="text-xs text-muted-foreground">
                Inspect Council of Architecture numbers, diplomas, and PWD contractor certificates.
              </p>
            </div>

            {pendingVerificationList.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">Verification queue is clear</h3>
                <p className="text-xs text-muted-foreground mt-1">All professional accounts have been verified.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerificationList.map((prof) => (
                  <div
                    key={prof.id}
                    className="p-5 bg-card border border-border rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={prof.avatar}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover bg-muted border border-border"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground">{prof.name}</h3>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-300">
                            {prof.verificationStatus || "Pending"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {prof.profession} • {prof.location} • {prof.experience} Years Exp. • {prof.email}
                        </p>

                        <div className="mt-2 text-xs">
                          <strong className="text-foreground">Submitted Credentials:</strong>
                          <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                            {(prof.verificationDocs && prof.verificationDocs.length > 0
                              ? prof.verificationDocs
                              : ["Council of Architecture Registered License", "Degree Certificate"]
                            ).map((doc: string, idx: number) => (
                              <li key={idx} className="truncate max-w-md">
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 md:pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(prof.id, "rejected")}
                        className="text-xs h-9 text-destructive border-destructive/30 hover:bg-destructive/5"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleVerify(prof.id, "approved")}
                        className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Approve & Verify
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">User Management</h2>
                <p className="text-xs text-muted-foreground">Manage user accounts, roles, access permissions, and status.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Registered</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersList
                      .filter(
                        (u) =>
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {(u.fullName || u.username)[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{u.fullName || u.username}</p>
                                <p className="text-[11px] text-muted-foreground font-mono">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5 text-muted-foreground">{u.email || "—"}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === "suspended"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {u.status || "active"}
                            </span>
                          </td>
                          <td className="p-3.5 text-muted-foreground">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Seed"}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(u.id, u.status || "active")}
                                className="text-[11px] h-7"
                              >
                                {u.status === "suspended" ? "Activate" : "Suspend"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFESSIONALS MANAGEMENT */}
        {activeTab === "professionals" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Registered Architecture Studios & Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionalsList.map((prof) => (
                <div key={prof.id} className="p-4 bg-card border border-border rounded-2xl shadow-card space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={prof.avatar} alt="" className="w-12 h-12 rounded-xl object-cover bg-muted" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-foreground truncate">{prof.name}</h4>
                        {prof.isVerified && (
                          <span className="w-4 h-4 bg-emerald-500 rounded-full text-white text-[10px] flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{prof.profession} • {prof.location}</p>
                      <p className="text-[11px] text-amber-500 font-semibold mt-0.5">⭐ {prof.rating} ({prof.reviewsCount || 0} reviews)</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                    <span className="text-muted-foreground">Verification Status:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(prof.id, prof.isVerified ? "rejected" : "approved")}
                      className={`text-[11px] h-7 ${prof.isVerified ? "text-emerald-600" : "text-amber-600"}`}
                    >
                      {prof.isVerified ? "Verified (Toggle)" : "Verify Account"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: QUOTES & ESCROW OVERVIEW */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">All Platform Quotations & Escrow Transactions</h2>
            <div className="space-y-3">
              {quotesList.map((q) => (
                <div key={q.id} className="p-4 bg-card border border-border rounded-2xl shadow-sm space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{q.projectType}</h4>
                      <p className="text-xs text-muted-foreground">
                        Ref: <span className="font-mono">{q.quoteNumber}</span> • Client: <strong>{q.userName}</strong> •
                        Studio: <strong>{q.professionalName}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {q.quoteAmount > 0 ? `₹${q.quoteAmount.toLocaleString()}` : "Pending"}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {q.status}
                      </span>
                    </div>
                  </div>
                  {q.escrowAmount > 0 && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl">
                      🛡️ Escrow Amount: <strong>₹{q.escrowAmount.toLocaleString()}</strong> (Status: {q.escrowStatus})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Marketplace Professional Categories</h2>
                <p className="text-xs text-muted-foreground">Configure specialties available on ArchiFind.</p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddCatModal(true)}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categoriesList.map((cat) => (
                <div key={cat.id} className="p-4 bg-card border border-border rounded-2xl shadow-card space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{cat.name}</h4>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.description || "Architecture specialty"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Safety & Moderation Reports</h2>
            {reportsList.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No reported accounts</h3>
                <p className="text-xs text-muted-foreground mt-1">Platform community safety is currently healthy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportsList.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-card border border-border rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{r.reason}</h4>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            r.status === "resolved"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reported By: <strong>{r.reporterName}</strong> • Target: <strong>{r.targetName || r.targetId}</strong>
                      </p>
                      {r.details && <p className="text-xs text-foreground/80 mt-1">{r.details}</p>}
                    </div>

                    {r.status !== "resolved" && (
                      <Button
                        size="sm"
                        onClick={() => handleResolveReport(r.id)}
                        className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Add New Category</h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Category Name</label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Sustainable Green Architect"
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                <textarea
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Short description of this specialty..."
                  className="w-full text-xs p-3 border border-border rounded-xl bg-background min-h-[70px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddCatModal(false)}
                  className="flex-1 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 text-xs h-10 bg-purple-600 hover:bg-purple-700 text-white">
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
