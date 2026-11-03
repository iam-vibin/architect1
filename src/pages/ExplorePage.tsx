import React, { useState, useEffect } from 'react';
import { Search, MapPin, TrendingUp, Award, Clock, ArrowLeft, Star, Heart, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = [
  {
    label: 'Architects',
    category: 'Architect',
    icon: Award,
    color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/30',
    description: 'Residential & commercial planners',
  },
  {
    label: 'Interior Designers',
    category: 'Interior Designer',
    icon: TrendingUp,
    color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30',
    description: 'Modular kitchens, living & lighting',
  },
  {
    label: 'Builders & Civil',
    category: 'Builder',
    icon: MapPin,
    color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/30',
    description: 'Turnkey house construction',
  },
  {
    label: 'Fast Responding',
    category: 'All',
    icon: Clock,
    color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-950/30',
    description: 'Quotes within 24 hours',
  },
];

export default function ExplorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.professionals
      .list({
        search: search || undefined,
        category: selectedCat !== 'All' ? selectedCat : undefined,
      })
      .then((res) => {
        if (res && res.success) {
          setProfessionals(res.professionals || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, selectedCat]);

  const topRated = [...professionals].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, style, architect..."
              className="pl-9 h-10 text-xs bg-muted/40"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/user-dashboard')}
            className="text-xs hidden sm:flex"
          >
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Explore Categories</h2>
            {selectedCat !== 'All' && (
              <button onClick={() => setSelectedCat('All')} className="text-xs text-primary font-semibold">
                Show All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCat === cat.category;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCat(cat.category)}
                  className={cn(
                    'flex flex-col p-3.5 rounded-2xl text-left border transition-all active:scale-[0.98]',
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/60 bg-card hover:bg-muted/40'
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2.5', cat.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs text-foreground">{cat.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Top Rated Carousel */}
        {topRated.length > 0 && selectedCat === 'All' && !search && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">Highest Rated Studios</h2>
              <span className="text-xs text-muted-foreground">Top rated across Tamil Nadu & Karnataka</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {topRated.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => navigate(`/professional/${prof.id}`)}
                  className="flex-shrink-0 w-56 bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-card cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img src={prof.avatar} alt="" className="w-12 h-12 rounded-xl object-cover bg-muted" />
                    <div>
                      <h4 className="font-bold text-xs text-foreground truncate max-w-[120px]">{prof.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{prof.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                    <span className="text-[11px] text-muted-foreground font-medium">{prof.profession}</span>
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{prof.rating}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filtered Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              {selectedCat === 'All' ? 'All Verified Professionals' : `${selectedCat}s`} ({professionals.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground py-10 text-center">Loading marketplace...</p>
          ) : professionals.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
              No professionals matching your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionals.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => navigate(`/professional/${prof.id}`)}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-card cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="relative h-40 bg-muted">
                    <img
                      src={prof.portfolio?.[0]?.image || prof.avatar}
                      alt={prof.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                      {prof.profession}
                    </div>
                    {prof.isVerified && (
                      <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-foreground truncate">{prof.name}</h4>
                      <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{prof.rating}</span>
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">{prof.specialization}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{prof.location}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
