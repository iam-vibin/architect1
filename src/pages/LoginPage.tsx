import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

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
    } catch (err) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = `${API_BASE}/api/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send the role along with login to verify or mock easily
        body: JSON.stringify({ username, password, role: selectedRole }),
        credentials: 'include',
      });

      let body: any = null;
      try { body = await res.json(); } catch (parseErr) {}

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

      login(body);
      setLoading(false);
      
      const targetRole = body?.role || selectedRole;
      if (targetRole === "user") return navigate("/user-dashboard", { replace: true });
      if (targetRole === "professional") return navigate("/professional-dashboard", { replace: true });
      return navigate("/admin-dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Network error');
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    try {
      localStorage.setItem("archifind_selected_role", role);
    } catch {}
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 bg-[linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url('/bg.jpg')] bg-cover bg-center"
    >
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md p-8"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}
      >
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Sign in</h1>
          <p className="text-gray-500 text-sm">Welcome back to ArchiFind</p>
        </div>

        {/* ROLE SELECTOR FIX */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          {["user", "professional", "admin"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleChange(role)}
              className={`flex-1 text-sm font-medium py-2 rounded-lg capitalize transition-all duration-200 ${
                selectedRole === role 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700 block mb-1">Username</span>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError(null);
            }}
            className="block w-full text-gray-900 bg-white border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            style={{ padding: "12px", borderRadius: "10px" }}
            required
            placeholder="Enter your username"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium text-gray-700 block mb-1">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            className="block w-full text-gray-900 bg-white border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            style={{ padding: "12px", borderRadius: "10px" }}
            required
            placeholder="Enter your password"
          />
        </label>

        {error && <div className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

        <button 
          disabled={loading} 
          className="w-full text-white font-semibold transition-all duration-300 flex items-center justify-center hover:scale-[1.03] shadow-[0_5px_15px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:hover:scale-100"
          style={{
            background: "linear-gradient(to right, #2563eb, #1e40af)",
            padding: "12px",
            borderRadius: "10px",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <button type="button" onClick={() => navigate("/register")} className="text-blue-600 font-semibold hover:underline">Register</button>
        </div>
      </form>
    </div>
  );
}
