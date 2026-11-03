import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "@/lib/api";
import { Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "professional">("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sel = localStorage.getItem("archifind_selected_role");
      if (sel === "professional" || sel === "user") {
        setRole(sel);
      }
    } catch (err) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.auth.register({
        fullName: name,
        username,
        password,
        role,
      });

      if (!res || !res.success) {
        setError(res?.error || res?.message || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created successfully! Logging you in...");

      // Automatically log the newly registered user in
      if (res.user && res.token) {
        login(res.user, res.token);
        setTimeout(() => {
          if (res.user.role === "professional") {
            navigate("/professional-dashboard", { replace: true });
          } else {
            navigate("/user-dashboard", { replace: true });
          }
        }, 800);
      } else {
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err: any) {
      console.error("Register Error:", err);
      setError(err?.message || "Failed to register. Please ensure backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-elevated">
        {/* Brand & Back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/login"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">ArchiFind</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Join ArchiFind to connect with architects, interior designers, and builders
          </p>
        </div>

        {/* Role toggle */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-foreground block mb-2">I want to join as</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setRole("user");
                localStorage.setItem("archifind_selected_role", "user");
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                role === "user"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              Client / Homeowner
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("professional");
                localStorage.setItem("archifind_selected_role", "professional");
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                role === "professional"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              Architect / Designer
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="text-xs text-success bg-success/10 border border-success/20 p-3 rounded-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Full Name / Business Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar or Studio Apex"
              className="h-11"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="h-11"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="h-11"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 font-medium mt-2">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
