import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// prefer VITE_API_URL for consistency; fall back to localhost
const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === "user") return navigate("/user-dashboard", { replace: true });
      if (user.role === "professional") return navigate("/professional-dashboard", { replace: true });
      return navigate("/admin-dashboard", { replace: true });
    }
  }, [user, navigate]);

  // enforce that a role is selected before showing login
  useEffect(() => {
    try {
      const sel = localStorage.getItem("archifind_selected_role");
      if (!sel) {
        navigate("/select-role");
      } else {
        setSelectedRole(sel);
      }
    } catch (err) {
      navigate("/select-role");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = `${API_BASE}/api/auth/login`;
      console.log('Attempting login', { url, username });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      let body: any = null;
      try { body = await res.json(); } catch (parseErr) {
        console.error('Failed to parse JSON response', parseErr);
      }

      console.log('Login response', { status: res.status, ok: res.ok, body });

      if (!res.ok) {
        if (res.status === 401) {
          setError((body && (body.error || body.message)) || 'Invalid username or password');
        } else {
          setError((body && (body.error || body.message)) || `Login failed (status ${res.status})`);
        }
        setLoading(false);
        return;
      }

      if (!body || !body.id) {
        setError('Login succeeded but server returned unexpected data');
        setLoading(false);
        return;
      }

      // Only log in and navigate after successful response
      login(body);
      setLoading(false);
      if (body?.role === "user") return navigate("/user-dashboard", { replace: true });
      if (body?.role === "professional") return navigate("/professional-dashboard", { replace: true });
      return navigate("/admin-dashboard", { replace: true });
    } catch (err: any) {
      console.error('Network/login error', err);
      setError(err?.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card p-6 rounded-2xl shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Sign in</h1>
          {selectedRole && (
            <div className={`badge-role ${selectedRole === "user" ? "badge-user" : selectedRole === "professional" ? "badge-professional" : "badge-admin"}`}>
              {selectedRole}
            </div>
          )}
        </div>

        <label className="block mb-3">
          <span className="text-sm text-muted-foreground">Username</span>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError(null);
            }}
            className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30"
            required
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-muted-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30"
            required
          />
        </label>

        {error && <div className="text-sm text-error mb-3">{error}</div>}

        <div className="flex items-center justify-between">
          <button disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg opacity-100 disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("archifind_selected_role");
              navigate("/select-role");
            }}
            className="text-sm text-muted-foreground"
          >
            Change role
          </button>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          Don't have an account? <button type="button" onClick={() => navigate("/register")} className="text-primary">Register</button>
        </div>
      </form>
    </div>
  );
}
