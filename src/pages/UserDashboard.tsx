import React, { useState } from 'react';
import { Search, Bell, Filter, Building2, Paintbrush, HardHat } from 'lucide-react';
import { professionals, Professional } from '@/data/mockData';
import { ProfessionalCard } from '@/components/professionals/ProfessionalCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type ProfessionFilter = 'All' | 'Architect' | 'Interior Designer' | 'Builder';

interface FilterOption {
  label: ProfessionFilter;
  icon: React.ElementType;
}

const filterOptions: FilterOption[] = [
  { label: 'All', icon: Filter },
  { label: 'Architect', icon: Building2 },
  { label: 'Interior Designer', icon: Paintbrush },
  { label: 'Builder', icon: HardHat },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProfessionFilter>('All');

  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch = prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || prof.profession === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const verifiedCount = professionals.filter(p => p.isVerified).length;

  return (
    <div className="app-container bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-xl font-bold text-foreground">{user?.name || 'User'}</h1>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search professionals, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-muted border-0"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeFilter === option.label;
              
              return (
                <button
                  key={option.label}
                  onClick={() => setActiveFilter(option.label)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground">
            <p className="text-3xl font-bold">{verifiedCount}</p>
            <p className="text-sm opacity-90">Verified Professionals</p>
          </div>
          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-4 text-secondary-foreground">
            <p className="text-3xl font-bold">{professionals.length}</p>
            <p className="text-sm opacity-90">Available Experts</p>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {activeFilter === 'All' ? 'All Professionals' : `${activeFilter}s`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredProfessionals.length} found
          </span>
        </div>

        {/* Professional Cards */}
        <div className="space-y-4">
          {filteredProfessionals.map((professional, index) => (
            <ProfessionalCard 
              key={professional.id} 
              professional={professional}
              animationDelay={index * 100}
            />
          ))}
        </div>

        {filteredProfessionals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
