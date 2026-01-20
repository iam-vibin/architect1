import React from 'react';
import { Search, MapPin, TrendingUp, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { professionals } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const categories = [
  { 
    label: 'Top Rated', 
    icon: Award, 
    color: 'bg-secondary/20 text-secondary-foreground',
    description: 'Highest rated professionals'
  },
  { 
    label: 'Near You', 
    icon: MapPin, 
    color: 'bg-primary/10 text-primary',
    description: 'Professionals in your area'
  },
  { 
    label: 'Trending', 
    icon: TrendingUp, 
    color: 'bg-success/10 text-success',
    description: 'Popular this week'
  },
  { 
    label: 'Quick Response', 
    icon: Clock, 
    color: 'bg-accent text-accent-foreground',
    description: 'Fast responding pros'
  },
];

export default function ExplorePage() {
  const navigate = useNavigate();
  const topRated = [...professionals].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="app-container min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Explore</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, skill, or location..."
            className="pl-10 h-12 bg-muted border-0"
          />
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Categories */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-semibold text-foreground mb-4">Browse by</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98] animate-scale-in',
                    cat.color
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-6 h-6 mt-0.5" />
                  <div>
                    <p className="font-semibold">{cat.label}</p>
                    <p className="text-xs opacity-80 mt-0.5">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Top Rated */}
        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Top Rated</h2>
            <button className="text-sm text-primary font-medium">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {topRated.map((prof, index) => (
              <div
                key={prof.id}
                className="flex-shrink-0 w-40 bg-card rounded-2xl p-4 shadow-card cursor-pointer transition-all hover:shadow-elevated active:scale-[0.98] animate-scale-in"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
                onClick={() => navigate(`/professional/${prof.id}`)}
              >
                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden mx-auto mb-3">
                  <img 
                    src={prof.avatar} 
                    alt={prof.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-foreground text-center truncate text-sm">
                  {prof.name}
                </h3>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {prof.profession}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Award className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-medium">{prof.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recently Viewed</h2>
          <div className="bg-muted/50 rounded-2xl p-8 text-center">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Professionals you view will appear here
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
