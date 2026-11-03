import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Star, MapPin, Briefcase, Phone, CheckCircle2, MessageSquare,
  FileText, Heart, Share2, Eye, Users
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Professional {
  id: string;
  name: string;
  profession: string;
  specialization: string;
  location: string;
  experience: number;
  bio: string;
  phoneNumber: string;
  avatar: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
  isVerified: boolean;
  isAvailable: boolean;
  profileViews: number;
  leadsCount: number;
  reviews?: Review[];
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "portfolio" | "reviews">("about");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/professionals/${id}`).then(r => r.ok ? r.json() : null),
      user ? fetch(`${API_BASE}/api/favourites/${user.id}`).then(r => r.ok ? r.json() : []) : Promise.resolve([]),
    ]).then(([pro, favs]) => {
      if (pro) setProfessional(pro);
      if (favs) setIsFav(favs.some((f: any) => f.professionalId === id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, user]);

  const toggleFav = async () => {
    if (!user || !id) return;
    if (isFav) {
      await fetch(`${API_BASE}/api/favourites/${user.id}/${id}`, { method: "DELETE" });
      setIsFav(false);
    } else {
      await fetch(`${API_BASE}/api/favourites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, professionalId: id }),
      });
      setIsFav(true);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          professionalId: id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          userName: user.name || user.username,
        }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setProfessional(prev => prev ? {
          ...prev,
          reviews: [newReview, ...(prev.reviews || [])],
          reviewCount: (prev.reviewCount || 0) + 1,
        } : prev);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: "" });
        setReviewMsg("Review submitted!");
        setTimeout(() => setReviewMsg(null), 3000);
      }
    } catch {}
    setSubmittingReview(false);
  };

  const imgUrl = (src: string) => src?.startsWith('/') ? `${API_BASE}${src}` : src;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Professional not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-semibold text-gray-900 flex-1 truncate">{professional.name}</h1>
          <button onClick={toggleFav} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isFav ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"}`}>
            <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
          </button>
          <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          {/* Cover */}
          <div className="h-40 relative bg-gradient-to-br from-blue-600 to-blue-800">
            {professional.portfolio?.[0] && (
              <img src={imgUrl(professional.portfolio[0])} alt="cover" className="w-full h-full object-cover opacity-40" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Info */}
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex items-end gap-4 mb-4">
              <img
                src={professional.avatar ? imgUrl(professional.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=1E3A8A&color=fff&size=128`}
                alt={professional.name}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=1E3A8A&color=fff`; }}
              />
              <div className="mb-2">
                {professional.isVerified && (
                  <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full w-fit mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ID Verified
                  </div>
                )}
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full w-fit ${professional.isAvailable ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {professional.isAvailable ? "✅ Available" : "🔴 Busy"}
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{professional.name}</h1>
            <p className="text-blue-600 font-semibold mt-0.5">{professional.profession}</p>
            {professional.specialization && <p className="text-gray-500 text-sm mt-0.5">{professional.specialization}</p>}

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {professional.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{professional.location}</span>}
              {professional.experience !== undefined && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{professional.experience} years</span>}
              {professional.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{professional.phoneNumber}</span>}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-700">{professional.rating?.toFixed(1) || "N/A"}</span>
                <span className="text-amber-600/70 text-xs">({professional.reviewCount || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl text-blue-700 text-sm">
                <Users className="w-4 h-4" />
                <span className="font-bold">{professional.projectsCompleted || 0}</span>
                <span className="text-blue-600/70 text-xs">projects</span>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl text-purple-700 text-sm">
                <Eye className="w-4 h-4" />
                <span className="font-bold">{professional.profileViews || 0}</span>
                <span className="text-purple-600/70 text-xs">views</span>
              </div>
            </div>

            {/* Action buttons */}
            {user?.role === "user" && (
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => navigate(`/chat/${professional.id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Chat Now
                </button>
                <button
                  onClick={() => navigate(`/quote/${professional.id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Request Quote
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          {(["about", "portfolio", "reviews"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
              {tab === "portfolio" && professional.portfolio?.length ? ` (${professional.portfolio.length})` : ""}
              {tab === "reviews" && professional.reviewCount ? ` (${professional.reviewCount})` : ""}
            </button>
          ))}
        </div>

        {/* About tab */}
        {activeTab === "about" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {professional.bio ? (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{professional.bio}</p>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No bio provided yet.</p>
            )}
          </div>
        )}

        {/* Portfolio tab */}
        {activeTab === "portfolio" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {!professional.portfolio?.length ? (
              <p className="text-gray-400 text-center py-8">No portfolio images yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {professional.portfolio.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                      src={imgUrl(img)}
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Reviews</h2>
              {user?.role === "user" && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700">
                  Write Review
                </button>
              )}
            </div>

            {reviewMsg && <div className="mx-5 mt-4 px-4 py-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl">{reviewMsg}</div>}

            {showReviewForm && (
              <form onSubmit={submitReview} className="px-5 py-4 border-b border-gray-100 bg-blue-50/30">
                <h3 className="font-medium text-gray-900 mb-3">Your Review</h3>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                      <Star className={`w-6 h-6 ${s <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
                  required
                />
                <div className="flex gap-2 mt-3">
                  <button type="submit" disabled={submittingReview} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60">
                    {submittingReview ? "Submitting..." : "Submit"}
                  </button>
                  <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!professional.reviews?.length ? (
              <div className="text-center py-12 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {professional.reviews.map(review => (
                  <div key={review.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {review.userName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{review.userName}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
