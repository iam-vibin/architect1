import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "@/lib/api";
import { Building2, ArrowLeft, Shield, User, HardHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("user");

  useEffect(() => {
    if (user) {
      if (user.role === "user") return navigate("/user-dashboard", { replace: true });
      if (user.role === "professional") return navigate("/professional-dashboard", { replace: true });
      return navigate("/admin-dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      const sel = localStorage.getItem("archifind_selected_role");
      if (sel) {
        setSelectedRole(sel);
      }
    } catch (err) {
      // fallback to user
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = await api.auth.login({ username, password });

      if (!body || !body.success) {
        setError(body?.error || body?.message || "Invalid username or password");
        setLoading(false);
        return;
      }

      const loggedUser = body.user || body;
      login(loggedUser, body.token);
      setLoading(false);

      if (loggedUser.role === "user") return navigate("/user-dashboard", { replace: true });
      if (loggedUser.role === "professional") return navigate("/professional-dashboard", { replace: true });
      return navigate("/admin-dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error", err);
      setError(err?.message || "Unable to connect to ArchiFind backend server");
      setLoading(false);
    }
  };

  const fillQuickCredentials = (u: string, p: string, r: string) => {
    setUsername(u);
    setPassword(p);
    setSelectedRole(r);
    localStorage.setItem("archifind_selected_role", r);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-elevated">
        {/* Back and Brand */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/select-role"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch Role</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">ArchiFind</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Sign in to ArchiFind</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in as <strong className="capitalize text-primary">{selectedRole}</strong> to access your dashboard
          </p>
        </div>

        {error && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl mb-4 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
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
              placeholder="Enter password"
              className="h-11"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 font-medium">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Demo Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickCredentials("user1", "1234", "user")}
              className="p-2 border rounded-xl hover:bg-muted text-center transition flex flex-col items-center gap-1"
            >
              <User className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-[11px]">User</span>
              <span className="text-[10px] text-muted-foreground">user1 / 1234</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials("pro1", "1234", "professional")}
              className="p-2 border rounded-xl hover:bg-muted text-center transition flex flex-col items-center gap-1"
            >
              <HardHat className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-[11px]">Professional</span>
              <span className="text-[10px] text-muted-foreground">pro1 / 1234</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials("admin", "admin123", "admin")}
              className="p-2 border rounded-xl hover:bg-muted text-center transition flex flex-col items-center gap-1"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-[11px]">Admin</span>
              <span className="text-[10px] text-muted-foreground">admin / admin123</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
