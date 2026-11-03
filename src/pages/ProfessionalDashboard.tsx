import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  Building2,
  HardHat,
  Eye,
  FileText,
  MessageCircle,
  Star,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  LogOut,
  Bell,
  UploadCloud,
  DollarSign,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  AlertCircle,
  CreditCard,
  User,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // Active dashboard view
  const [activeTab, setActiveTab] = useState<"quotes" | "portfolio" | "chats" | "profile">("quotes");

  // Professional profile state
  const [professional, setProfessional] = useState<any | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showQuoteModal, setShowQuoteModal] = useState<any | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    quoteAmount: "",
    estimatedDays: "30",
    quoteNotes: "",
  });
  const [respondingQuote, setRespondingQuote] = useState(false);

  // New Project Modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    category: "Residential",
    cost: "",
    imageUrl: "",
  });
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [uploadingProject, setUploadingProject] = useState(false);

  // Verification Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [licenseText, setLicenseText] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Profile Edit Form
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    location: "",
    specialization: "",
    experience: 0,
    hourlyRate: "",
    about: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Load professional data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Find my professional record
      const profsRes = await api.professionals.list();
      let myProf = null;
      if (profsRes && profsRes.success) {
        myProf = profsRes.professionals.find(
          (p: any) => p.userId === user?.id || p.username === user?.username || p.name === user?.fullName
        );
      }

      if (myProf) {
        setProfessional(myProf);
        setProfileForm({
          name: myProf.name || "",
          phone: myProf.phone || "",
          location: myProf.location || "",
          specialization: myProf.specialization || "",
          experience: myProf.experience || 0,
          hourlyRate: myProf.hourlyRate || "",
          about: myProf.about || "",
        });
      }

      // Load quotes
      const quotesRes = await api.quotes.list();
      if (quotesRes && quotesRes.success) {
        setQuotes(quotesRes.quotes || []);
      }

      // Load chat threads
      const chatsRes = await api.chat.threads();
      if (chatsRes && chatsRes.success) {
        setThreads(chatsRes.threads || []);
      }
    } catch (err) {
      console.error("Professional dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => {
      api.quotes.list().then((res) => {
        if (res && res.success) setQuotes(res.quotes || []);
      });
      api.chat.threads().then((res) => {
        if (res && res.success) setThreads(res.threads || []);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Toggle availability
  const handleToggleAvailability = async () => {
    if (!professional) return;
    try {
      const res = await api.professionals.toggleAvailability(professional.id, !professional.isAvailable);
      if (res && res.success) {
        setProfessional({ ...professional, isAvailable: res.isAvailable });
      }
    } catch (err) {
      console.error("Availability toggle error:", err);
    }
  };

  // Submit quote response
  const handleSendQuoteResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQuoteModal) return;
    setRespondingQuote(true);

    try {
      const res = await api.quotes.respond(showQuoteModal.id, {
        quoteAmount: Number(quoteForm.quoteAmount),
        estimatedDays: Number(quoteForm.estimatedDays),
        quoteNotes: quoteForm.quoteNotes,
        action: "accept",
      });

      if (res && res.success) {
        setShowQuoteModal(null);
        setQuoteForm({ quoteAmount: "", estimatedDays: "30", quoteNotes: "" });
        loadDashboard();
      }
    } catch (err) {
      console.error("Send quote response error:", err);
    } finally {
      setRespondingQuote(false);
    }
  };

  // Decline quote
  const handleDeclineQuote = async (quoteId: string) => {
    if (!confirm("Decline this quotation request?")) return;
    try {
      const res = await api.quotes.respond(quoteId, { action: "reject" });
      if (res && res.success) {
        loadDashboard();
      }
    } catch (err) {
      console.error("Decline quote error:", err);
    }
  };

  // Add portfolio project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professional) return;
    setUploadingProject(true);

    try {
      const form = new FormData();
      form.append("title", projectForm.title);
      form.append("description", projectForm.description);
      form.append("category", projectForm.category);
      form.append("cost", projectForm.cost);
      if (projectImageFile) {
        form.append("image", projectImageFile);
      } else if (projectForm.imageUrl) {
        form.append("imageUrl", projectForm.imageUrl);
      }

      const res = await api.professionals.addPortfolio(professional.id, form);
      if (res && res.success) {
        setShowProjectModal(false);
        setProjectForm({ title: "", description: "", category: "Residential", cost: "", imageUrl: "" });
        setProjectImageFile(null);
        loadDashboard();
      }
    } catch (err) {
      console.error("Add project error:", err);
    } finally {
      setUploadingProject(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this portfolio project?")) return;
    try {
      const res = await api.professionals.deletePortfolio(professional.id, projectId);
      if (res && res.success) {
        loadDashboard();
      }
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  // Submit verification request
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const form = new FormData();
      form.append("docNames", licenseText || "Professional Architectural License");
      const res = await api.professionals.submitVerification(form);
      if (res && res.success) {
        setVerifySuccess(true);
        setTimeout(() => {
          setVerifySuccess(false);
          setShowVerifyModal(false);
          loadDashboard();
        }, 1500);
      }
    } catch (err) {
      console.error("Verification submit error:", err);
    } finally {
      setVerifying(false);
    }
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaved(false);

    try {
      const form = new FormData();
      form.append("name", profileForm.name);
      form.append("phoneNumber", profileForm.phone);
      form.append("location", profileForm.location);
      form.append("specialization", profileForm.specialization);
      form.append("experience", String(profileForm.experience));
      form.append("hourlyRate", profileForm.hourlyRate);
      form.append("bio", profileForm.about);

      const res = await api.professionals.saveProfile(form);
      if (res && res.success) {
        setProfileSaved(true);
        loadDashboard();
        setTimeout(() => setProfileSaved(false), 2000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const pendingQuotes = quotes.filter((q) => q.status === "requested");
  const activeQuotes = quotes.filter((q) => q.status === "quoted" || q.status === "accepted" || q.status === "in_progress");
  const totalInEscrow = quotes
    .filter((q) => q.escrowStatus === "held_in_escrow" || q.escrowStatus === "released")
    .reduce((sum, q) => sum + (q.escrowAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-foreground tracking-tight">ArchiFind Pro</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200">
                Partner Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Availability pill toggle */}
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                professional?.isAvailable
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-300"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  professional?.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span>{professional?.isAvailable ? "Accepting Projects" : "Busy"}</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/chats")}
              className="text-xs font-semibold gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Inbox ({threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)})</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Verification Status Banner */}
        {professional && !professional.isVerified && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                  {professional.verificationStatus === "pending"
                    ? "Verification Review Underway"
                    : "Get Verified on ArchiFind"}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  {professional.verificationStatus === "pending"
                    ? "Your professional documents have been submitted to administrators for inspection."
                    : "Upload your Council of Architecture or PWD license to earn the verified badge and boost quote win rates."}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setShowVerifyModal(true)}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold flex-shrink-0"
            >
              {professional.verificationStatus === "pending" ? "Update Documents" : "Upload Credentials"}
            </Button>
          </div>
        )}

        {/* Overview Header & Statistics */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={professional?.avatar || user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                alt={professional?.name}
                className="w-16 h-16 rounded-2xl object-cover bg-muted border-2 border-border shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{professional?.name || user?.fullName}</h1>
                  {professional?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {professional?.profession} • {professional?.location} • {professional?.experience} Years Experience
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/40 rounded-xl text-center border border-border/60">
                <p className="text-xl font-bold text-foreground">{quotes.length}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Quote Requests</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl text-center border border-border/60">
                <p className="text-xl font-bold text-emerald-600">₹{totalInEscrow.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Total In Escrow</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl text-center border border-border/60">
                <p className="text-xl font-bold text-amber-500">⭐ {professional?.rating || 5.0}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{professional?.reviewsCount || 0} Reviews</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl text-center border border-border/60">
                <p className="text-xl font-bold text-foreground">{professional?.portfolio?.length || 0}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Portfolio Works</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-border gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("quotes")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "quotes"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manage Quotation Requests</span>
            {pendingQuotes.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">
                {pendingQuotes.length} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("portfolio")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "portfolio"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Portfolio & Projects</span>
            <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
              {professional?.portfolio?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("chats")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "chats"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Client Inquiries ({threads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "profile"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Studio Profile</span>
          </button>
        </div>

        {/* TAB 1: QUOTATION REQUESTS */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Client Quotation Inquiries</h2>
                <p className="text-xs text-muted-foreground">
                  Review requirements, send pricing estimates, and track funded escrow projects.
                </p>
              </div>
            </div>

            {quotes.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No quote requests yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  When homeowners and clients request an estimate for their projects, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((q) => {
                  return (
                    <div
                      key={q.id}
                      className="bg-card border border-border p-5 rounded-2xl shadow-card space-y-4 hover:border-emerald-500/40 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground text-base">{q.projectType}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {q.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Client: <strong className="text-foreground">{q.userName}</strong> • Ref:{' '}
                            <span className="font-mono">{q.quoteNumber}</span> • Requested:{' '}
                            {new Date(q.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {q.escrowStatus === "held_in_escrow" && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 rounded-xl text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Escrow Funded (₹{q.escrowAmount.toLocaleString()})</span>
                          </div>
                        )}
                      </div>

                      {/* Client project description */}
                      <div className="bg-muted/30 p-3 rounded-xl border border-border/40 text-xs text-foreground/90 space-y-2">
                        <p>{q.description}</p>
                        <div className="flex flex-wrap gap-4 text-muted-foreground pt-1 border-t border-border/40">
                          <span>📍 Location: <strong>{q.location}</strong></span>
                          <span>💰 Client Budget: <strong>{q.clientBudget}</strong></span>
                          <span>⏱️ Timeline: <strong>{q.timeline}</strong></span>
                          {q.userPhone && <span>📞 Phone: <strong>{q.userPhone}</strong></span>}
                        </div>
                      </div>

                      {/* If already responded */}
                      {q.quoteAmount > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span>Your Quote: <strong>₹{q.quoteAmount.toLocaleString()}</strong> ({q.estimatedDays} Days)</span>
                            {q.quoteNotes && <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">Notes: {q.quoteNotes}</p>}
                          </div>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
                            Status: {q.status}
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/chat/${q.userId}`)}
                          className="text-xs h-9 gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat with Client</span>
                        </Button>

                        {q.status === "requested" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeclineQuote(q.id)}
                              className="text-xs h-9 text-destructive border-destructive/30 hover:bg-destructive/5"
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setShowQuoteModal(q);
                                setQuoteForm({
                                  quoteAmount: "",
                                  estimatedDays: "30",
                                  quoteNotes: "Includes architectural drawings, 3D renderings, and structural coordination.",
                                });
                              }}
                              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Create & Send Quotation</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PORTFOLIO & PROJECTS */}
        {activeTab === "portfolio" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Project Portfolio</h2>
                <p className="text-xs text-muted-foreground">
                  Showcase your completed architecture and interior projects to attract new clients.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setShowProjectModal(true)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Project</span>
              </Button>
            </div>

            {(!professional?.portfolio || professional.portfolio.length === 0) ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No portfolio items yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Upload photos of your completed projects to showcase your design expertise.
                </p>
                <Button size="sm" onClick={() => setShowProjectModal(true)} className="mt-4 text-xs bg-emerald-600 text-white">
                  Add First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professional.portfolio.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-card flex flex-col justify-between"
                  >
                    <div className="relative h-48 bg-muted">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        {item.category || professional.profession}
                      </div>
                      <button
                        onClick={() => handleDeleteProject(item.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-destructive-foreground hover:bg-destructive flex items-center justify-center transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground truncate">{item.title}</h4>
                        <span className="text-xs font-semibold text-emerald-600">{item.cost || "Custom"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLIENT CONVERSATIONS */}
        {activeTab === "chats" && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-foreground">Client Conversations ({threads.length})</h2>
            {threads.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-6">
                <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-base">No active client chats</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  When homeowners send enquiries or quote questions, their conversations will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => navigate(`/professional/chat/${thread.participantId}`)}
                    className="p-4 bg-card border border-border rounded-2xl shadow-card hover:border-emerald-500/50 cursor-pointer flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={thread.participantAvatar}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-muted"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{thread.participantName}</h4>
                          {thread.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{thread.lastMessage}</p>
                      </div>
                    </div>

                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STUDIO PROFILE MANAGEMENT */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Studio Profile & Settings</h2>
              <p className="text-xs text-muted-foreground">
                Update your professional credentials, specialization tags, rates, and bio.
              </p>
            </div>

            {profileSaved && (
              <div className="p-3 bg-success/10 text-success text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Studio / Professional Name</label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Phone Number</label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Operating City</label>
                  <Input
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Experience (Years)</label>
                  <Input
                    type="number"
                    min={0}
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm({ ...profileForm, experience: Number(e.target.value) })}
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Hourly / Consultation Rate</label>
                  <Input
                    value={profileForm.hourlyRate}
                    onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                    placeholder="e.g. ₹2,500/hr"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Specialization Tags</label>
                <Input
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                  placeholder="e.g. Sustainable Eco-Design, Luxury Interiors, Turnkey Construction"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">About / Bio</label>
                <textarea
                  value={profileForm.about}
                  onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                  className="w-full text-xs p-3 border border-border rounded-xl bg-background min-h-[90px]"
                />
              </div>

              <Button
                type="submit"
                disabled={savingProfile}
                className="w-full h-10 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {savingProfile ? "Saving Profile..." : "Save Profile Details"}
              </Button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: Send Quotation Response */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground text-base">Create Project Quotation</h3>
                <p className="text-xs text-muted-foreground">For: {showQuoteModal.userName}</p>
              </div>
              <button
                onClick={() => setShowQuoteModal(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendQuoteResponse} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Quote Amount (₹)</label>
                <Input
                  type="number"
                  value={quoteForm.quoteAmount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quoteAmount: e.target.value })}
                  placeholder="e.g. 150000"
                  className="h-10 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Estimated Duration (Days)</label>
                <Input
                  type="number"
                  value={quoteForm.estimatedDays}
                  onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDays: e.target.value })}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Proposal Notes & Deliverables</label>
                <textarea
                  value={quoteForm.quoteNotes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quoteNotes: e.target.value })}
                  placeholder="Detail what is included: site visits, 2D floor plans, 3D renders, municipal approval drawings..."
                  className="w-full text-xs p-3 border border-border rounded-xl bg-background min-h-[90px]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQuoteModal(null)}
                  className="flex-1 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={respondingQuote}
                  className="flex-1 text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {respondingQuote ? "Sending..." : "Submit Quotation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Portfolio Project */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Add Project to Portfolio</h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Project Title</label>
                <Input
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. Modern Minimalist Beach Villa"
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full h-10 px-3 text-xs border border-border rounded-xl bg-background"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Interior">Interior</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Project Cost / Value</label>
                  <Input
                    value={projectForm.cost}
                    onChange={(e) => setProjectForm({ ...projectForm, cost: e.target.value })}
                    placeholder="e.g. ₹75,00,000"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Project Photo (Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProjectImageFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-muted file:text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Or Image URL</label>
                <Input
                  value={projectForm.imageUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Describe design inspiration, materials, square footage, structural feats..."
                  className="w-full text-xs p-3 border border-border rounded-xl bg-background min-h-[70px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingProject}
                  className="flex-1 text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {uploadingProject ? "Adding Project..." : "Add to Portfolio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Verification Credentials */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Submit Verification Credentials</h3>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            {verifySuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                <h4 className="font-bold text-foreground text-sm">Credentials Submitted!</h4>
                <p className="text-xs text-muted-foreground">Admin will inspect and activate your verified badge.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitVerification} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    License / Council Registration Number
                  </label>
                  <Input
                    value={licenseText}
                    onChange={(e) => setLicenseText(e.target.value)}
                    placeholder="e.g. Council of Architecture #CA/2020/56789"
                    className="h-10 text-xs"
                    required
                  />
                </div>

                <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground leading-relaxed">
                  🛡️ ArchiFind verifies council registrations, diplomas, and PWD civil contractor certificates.
                  Approval is typically granted within 24 hours.
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVerifyModal(false)}
                    className="flex-1 text-xs h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={verifying}
                    className="flex-1 text-xs h-10 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  >
                    {verifying ? "Submitting..." : "Submit for Approval"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
