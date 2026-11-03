import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { professionals } from "@/data/mockData";
import { ProfessionalCard } from "@/components/professionals/ProfessionalCard";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-sm text-muted-foreground">Welcome back,</h2>
          <h1 className="text-2xl font-semibold">User</h1>
        </div>

        <button
          onClick={logout}
          className="h-10 px-4 bg-red-600 text-white rounded-md"
        >
          Logout
        </button>
      </div>

      <div className="mb-3">
        <input
          placeholder="Search professionals, locations..."
          className="w-full max-w-md px-3 py-2 rounded-md border"
        />
      </div>

      <div className="flex gap-4 text-sm mb-4">
        <button className="px-2 py-1 rounded-md bg-slate-100">All</button>
        <button className="px-2 py-1 rounded-md">Architect</button>
        <button className="px-2 py-1 rounded-md">Interior Designer</button>
        <button className="px-2 py-1 rounded-md">Builder</button>
      </div>

      <div className="mb-4 flex gap-10">
        <div>
          <h3 className="text-2xl font-semibold">3</h3>
          <p className="text-sm text-muted-foreground">Verified Professionals</p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold">4</h3>
          <p className="text-sm text-muted-foreground">Available Experts</p>
        </div>
      </div>

      <hr className="my-4" />

      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Professionals</h2>
          <p className="text-sm text-muted-foreground">{professionals.length} found</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 pb-4 flex snap-x snap-mandatory">
        {professionals.map((pro) => (
          <div key={pro.id} className="snap-start">
            <ProfessionalCard professional={pro} />
          </div>
        ))}
      </div>
    </div>
  );
}
