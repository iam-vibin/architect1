import { useNavigate } from "react-router-dom";
import { User, Home, Shield } from "lucide-react";

const roles: { key: 'user' | 'professional' | 'admin'; label: string; Icon: any; desc: string }[] = [
  { key: 'user', label: 'User', Icon: User, desc: 'Find professionals and request quotes' },
  { key: 'professional', label: 'Professional', Icon: Home, desc: 'Manage your profile and respond to requests' },
  { key: 'admin', label: 'Admin', Icon: Shield, desc: 'Platform admin tools' },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const selectRole = (r: string) => {
    try {
      localStorage.setItem('archifind_selected_role', r);
    } catch (err) {}
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Select your role</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">Choose how you want to use ArchiFind</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {roles.map((r) => {
            const gradientClass = r.key === 'user' ? 'from-blue-600 to-indigo-600' : r.key === 'professional' ? 'from-emerald-500 to-emerald-700' : 'from-violet-600 to-purple-700';
            return (
              <button
                key={r.key}
                onClick={() => selectRole(r.key)}
                className={`role-card relative overflow-hidden p-4 rounded-xl text-left text-white flex items-end h-40 bg-gradient-to-br ${gradientClass}`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center">
                    <r.Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{r.label}</h3>
                    <p className="text-sm opacity-90 max-w-xs">{r.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
