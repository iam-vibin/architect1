import { useNavigate } from "react-router-dom";
import { User, HardHat, Shield } from "lucide-react";

const roles = [
  {
    key: "user",
    label: "Client",
    Icon: User,
    desc: "Find and hire architects, designers, and builders",
    gradient: "from-blue-600 to-blue-800",
    badge: "🏠 Homeowners & Businesses",
  },
  {
    key: "professional",
    label: "Professional",
    Icon: HardHat,
    desc: "Showcase your portfolio and get quality leads",
    gradient: "from-emerald-600 to-teal-700",
    badge: "🏆 Architects & Designers",
  },
  {
    key: "admin",
    label: "Admin",
    Icon: Shield,
    desc: "Manage the ArchiFind platform",
    gradient: "from-violet-600 to-purple-800",
    badge: "🛡️ Platform Management",
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const selectRole = (r: string) => {
    try { localStorage.setItem("archifind_selected_role", r); } catch {}
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0c4a6e 100%)" }}
    >
      <div className="w-full max-w-4xl">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-5">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ArchiFind</h1>
          <p className="text-white/70 text-lg">Connect with top architecture professionals</p>
          <p className="text-white/50 text-sm mt-2">Select your role to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => selectRole(r.key)}
              className={`group relative overflow-hidden bg-gradient-to-br ${r.gradient} rounded-3xl p-6 text-left text-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30 border border-white/10`}
              style={{ minHeight: 200 }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/20" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <r.Icon className="w-6 h-6 text-white" />
                </div>

                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium mb-3">
                  {r.badge}
                </div>

                <h3 className="text-2xl font-bold mb-2">{r.label}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{r.desc}</p>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                  Continue as {r.label}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-white/40 text-xs mt-8">
          By continuing, you agree to ArchiFind's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
