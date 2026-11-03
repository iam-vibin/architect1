import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Star,
  BadgeCheck,
  MessageCircle,
  Phone,
  Mail,
  Heart,
  Clock,
  CheckCircle2,
  Share2,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [professional, setProfessional] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');
  const [isLiked, setIsLiked] = useState(false);
  const [refreshReviewsTrigger, setRefreshReviewsTrigger] = useState(0);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.professionals
      .get(id)
      .then((res) => {
        if (res && res.success && res.professional) {
          setProfessional(res.professional);
        }
      })
      .catch((err) => console.error('Error fetching professional:', err))
      .finally(() => setLoading(false));

    if (user?.savedProfessionals) {
      setIsLiked(user.savedProfessionals.includes(id));
    }
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!id) return;
    try {
      const res = await api.favorites.toggle(id);
      if (res && res.success) {
        setIsLiked(res.saved);
        updateUser({ savedProfessionals: res.favoriteIds });
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-muted-foreground animate-pulse">Loading architect profile...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
        <p className="text-muted-foreground text-sm mb-4">Professional profile not found.</p>
        <Button onClick={() => navigate('/user-dashboard')} size="sm">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <span className="font-bold text-sm text-foreground truncate max-w-[200px]">{professional.name}</span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={`text-foreground ${isLiked ? 'text-rose-500' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Header Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative">
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-24 h-24 rounded-2xl object-cover bg-muted border-2 border-border shadow-sm"
              />
              {professional.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow"
                  title="Verified Professional"
                >
                  ✓
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground leading-tight">{professional.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
                  {professional.profession}
                </span>
                {professional.isAvailable ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    ● Available for projects
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-muted text-muted-foreground">
                    Busy
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground font-medium mt-1">{professional.specialization}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-foreground">{professional.rating}</span>
                  <span>({professional.reviewsCount || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{professional.location}</span>
                </div>
                {professional.hourlyRate && (
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <span>Rate: {professional.hourlyRate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border text-center">
            <div className="p-2.5 bg-muted/40 rounded-xl">
              <p className="text-lg font-bold text-foreground">{professional.experience} Yrs</p>
              <p className="text-[11px] text-muted-foreground">Experience</p>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-xl">
              <p className="text-lg font-bold text-foreground">{professional.projectsCompleted}+</p>
              <p className="text-[11px] text-muted-foreground">Completed Works</p>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-xl">
              <p className="text-lg font-bold text-emerald-600">
                {professional.isVerified ? 'Verified' : 'Registered'}
              </p>
              <p className="text-[11px] text-muted-foreground">Account Status</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'about'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            About & Highlights
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'portfolio'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Portfolio Works ({professional.portfolio?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Reviews & Ratings ({professional.reviewsCount || 0})
          </button>
        </div>

        {/* TAB: About */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
              <h3 className="font-bold text-base text-foreground">About the Studio</h3>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{professional.about}</p>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground">Verified Credentials & Highlights</h3>
              <div className="space-y-2.5 text-xs text-foreground/90">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Licensed Architecture Practice / Professional Contractor</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <span>Prompt Response Time • Usually quotes within 24 hours</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span>Protected by ArchiFind Escrow Payment Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Portfolio */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            {(!professional.portfolio || professional.portfolio.length === 0) ? (
              <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                No portfolio projects uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professional.portfolio.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPortfolioItem(item)}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-card cursor-pointer transition flex flex-col justify-between"
                  >
                    <div className="relative h-52 bg-muted overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        {item.category || professional.profession}
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                        <span className="text-xs font-semibold text-emerald-600">{item.cost || 'Custom'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <ReviewsList professional={professional.id} refreshTrigger={refreshReviewsTrigger} />
            <ReviewForm
              professional={professional.id}
              onReviewSubmitted={() => setRefreshReviewsTrigger((prev) => prev + 1)}
            />
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-md border-t border-border p-3.5 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/chat/${professional.id}`)}
            className="flex-1 h-11 text-xs font-semibold gap-1.5"
          >
            <MessageCircle className="w-4 h-4 text-primary" />
            <span>Chat with {professional.name.split(' ')[0]}</span>
          </Button>

          <Button
            onClick={() => navigate(`/quote/${professional.id}`)}
            className="flex-1 h-11 text-xs font-semibold bg-primary hover:bg-primary/90 gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Request Quotation</span>
          </Button>
        </div>
      </div>

      {/* Portfolio Lightbox Modal */}
      {selectedPortfolioItem && (
        <div
          onClick={() => setSelectedPortfolioItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
          >
            <div className="relative max-h-[60vh] bg-black">
              <img
                src={selectedPortfolioItem.image}
                alt={selectedPortfolioItem.title}
                className="w-full h-full object-contain max-h-[60vh]"
              />
              <button
                onClick={() => setSelectedPortfolioItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground">{selectedPortfolioItem.title}</h3>
                <span className="text-xs font-semibold text-emerald-600">{selectedPortfolioItem.cost}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{selectedPortfolioItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
