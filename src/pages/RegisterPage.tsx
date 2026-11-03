import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password, role: selectedRole }),
        credentials: "include",
      });

      let body: any = null;
      try { body = await res.json(); } catch (_) {}

      if (!res.ok) {
        setError((body && (body.message || body.error)) || `Registration failed (status ${res.status})`);
        setLoading(false);
        return;
      }

      // success - go to login
      localStorage.setItem("archifind_selected_role", selectedRole);
      navigate("/login");
    } catch (err: any) {
      setError(err?.message || "Network error");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0369a1 100%)" }}
    >
      <div
        className="w-full max-w-md p-8"
        style={{
          background: "rgba(255, 255, 255, 0.97)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/select-role")}
          className="flex items-center gap-1.5 text-gray-500 text-sm mb-6 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to role selection
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join ArchiFind as a {selectedRole}</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl">
          {["user", "professional"].map(role => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${selectedRole === role ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
            >
              {role === "user" ? "Client" : "Professional"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="block w-full text-gray-900 bg-white border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
              style={{ padding: "12px", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className="block w-full text-gray-900 bg-white border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
              style={{ padding: "12px", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="block w-full text-gray-900 bg-white border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
              style={{ padding: "12px", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="block w-full text-gray-900 bg-white border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors pr-12"
                style={{ padding: "12px", borderRadius: "10px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="block w-full text-gray-900 bg-white border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
              style={{ padding: "12px", borderRadius: "10px" }}
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold transition-all duration-300 flex items-center justify-center hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            style={{
              background: "linear-gradient(to right, #2563eb, #1e40af)",
              padding: "13px",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(37,99,235,0.3)",
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-blue-600 font-semibold hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
