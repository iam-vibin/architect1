import { Star, MessageSquare, CheckCircle2, Heart, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ProfessionalData {
  id: string;
  userId?: string;
  name: string;
  profession?: string;
  specialization?: string;
  location?: string;
  experience?: number;
  bio?: string;
  avatar?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  projectsCompleted?: number;
  isVerified?: boolean;
  profileViews?: number;
}

interface Props {
  professional: ProfessionalData;
  onQuoteRequest?: (id: string) => void;
  onFavourite?: (id: string) => void;
  isFavourited?: boolean;
}

export default function ProfessionalCard({ professional, onQuoteRequest, onFavourite, isFavourited }: Props) {
  const navigate = useNavigate();
  const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

  const coverImage = professional.portfolio?.[0]
    ? (professional.portfolio[0].startsWith('/') ? `${API_BASE}${professional.portfolio[0]}` : professional.portfolio[0])
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

  const avatarImage = professional.avatar
    ? (professional.avatar.startsWith('/') ? `${API_BASE}${professional.avatar}` : professional.avatar)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=1E3A8A&color=fff&size=128`;

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Cover image */}
      <div className="h-44 w-full overflow-hidden relative bg-gray-100">
        <img
          src={coverImage}
          alt="cover"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {professional.isVerified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </div>
        )}

        {onFavourite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavourite(professional.id); }}
            className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all ${isFavourited ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${isFavourited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Profile info */}
      <div className="flex flex-col items-center -mt-10 px-5 relative z-10">
        <img
          src={avatarImage}
          alt={professional.name}
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-white"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=1E3A8A&color=fff`; }}
        />
        <h3 className="text-base font-bold mt-2 text-gray-900 text-center">{professional.name}</h3>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full mt-1">
          {professional.profession || 'Professional'}
        </span>
        {professional.location && (
          <p className="text-xs text-gray-500 mt-1">📍 {professional.location}</p>
        )}

        <div className="flex items-center gap-1 mt-2 bg-amber-50 px-3 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-amber-700">{professional.rating?.toFixed(1) || '5.0'}</span>
          {professional.reviewCount !== undefined && (
            <span className="text-xs text-amber-600/70">({professional.reviewCount} reviews)</span>
          )}
        </div>

        {professional.experience !== undefined && (
          <p className="text-xs text-gray-500 mt-1">{professional.experience} yrs exp • {professional.projectsCompleted || 0} projects</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 mt-auto grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate(`/profile/${professional.id}`)}
          className="col-span-3 sm:col-span-1 flex items-center justify-center gap-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-xl hover:bg-gray-100 transition-all"
        >
          View Profile
        </button>
        <button
          onClick={() => navigate(`/chat/${professional.id}`)}
          className="col-span-3 sm:col-span-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-blue-700 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => onQuoteRequest ? onQuoteRequest(professional.id) : navigate(`/quote/${professional.id}`)}
          className="col-span-3 sm:col-span-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-emerald-700 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          Quote
        </button>
      </div>
    </div>
  );
}
