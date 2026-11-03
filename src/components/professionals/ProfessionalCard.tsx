import { useNavigate } from "react-router-dom";

export function ProfessionalCard({ professional }: { professional: any }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/professional/${professional.id}`)}
      role="button"
      tabIndex={0}
      className="snap-start min-w-[85vw] sm:min-w-[280px] bg-card rounded-xl overflow-hidden shadow-card mr-3 cursor-pointer transition hover:scale-[1.01]"
    >
      <div className="relative w-full h-[48vw] sm:h-56 bg-gray-100">
        <img
          src={professional.avatar}
          alt={professional.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <div className="absolute left-3 bottom-3 right-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold leading-tight truncate">{professional.name}</h3>
              <p className="text-sm opacity-90 truncate">{professional.profession}</p>
            </div>
            {professional.isVerified && (
              <span className="ml-2 inline-flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">✔ Verified</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{professional.specialization || professional.location}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/professional/${professional.id}`);
            }}
            className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-md"
          >
            View
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chat/${professional.id}`);
            }}
            className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-md shadow-sm"
          >
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
