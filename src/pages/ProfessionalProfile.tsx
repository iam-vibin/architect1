import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Briefcase, Star, BadgeCheck, MessageCircle, 
  Phone, Mail, Share2, Heart, Clock, CheckCircle2 
} from 'lucide-react';
import { professionals } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('about');
  const [isLiked, setIsLiked] = useState(false);

  const professional = professionals.find(p => p.id === id);

  if (!professional) {
    return (
      <div className="app-container min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Professional not found</p>
      </div>
    );
  }

  const professionColors: Record<string, string> = {
    'Architect': 'bg-primary/10 text-primary',
    'Interior Designer': 'bg-secondary/20 text-secondary-foreground',
    'Builder': 'bg-accent text-accent-foreground',
  };

  return (
    <div className="app-container min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn('w-5 h-5', isLiked && 'fill-destructive text-destructive')} />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="px-4 pb-6">
        <div className="flex gap-4 items-start animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden">
              <img 
                src={professional.avatar} 
                alt={professional.name}
                className="w-full h-full object-cover"
              />
            </div>
            {professional.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-success-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{professional.name}</h1>
            <span className={cn(
              'inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-1',
              professionColors[professional.profession]
            )}>
              {professional.profession}
            </span>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="font-medium text-foreground">{professional.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{professional.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{professional.experience}</p>
            <p className="text-xs text-muted-foreground">Years Exp.</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{professional.projectsCompleted}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{professional.rating}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex bg-muted rounded-xl p-1">
          <button
            onClick={() => setActiveTab('about')}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
              activeTab === 'about' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground'
            )}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
              activeTab === 'portfolio' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground'
            )}
          >
            Portfolio
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-6 animate-fade-in">
        {activeTab === 'about' ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {professional.about}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Specialization</h3>
              <p className="text-sm text-muted-foreground">{professional.specialization}</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Highlights</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-muted-foreground">Verified Professional</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Quick Response Time</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  <span className="text-muted-foreground">{professional.projectsCompleted}+ Projects Completed</span>
                </div>
              </div>
            </div>
            <ReviewsList professional={professional.id} />
            <ReviewForm professional={professional.id} />
          </div>
        ) : (
          <div className="portfolio-grid">
            {professional.portfolio.map((item, index) => (
              <div 
                key={item.id} 
                className="animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="portfolio-image"
                />
                <p className="text-xs text-muted-foreground mt-1 truncate">{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 max-w-md mx-auto">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-12 gap-2"
            onClick={() => navigate(`/quote/${professional.id}`)}
          >
            Request Quote
          </Button>
          <Button 
            className="flex-1 h-12 gap-2"
            onClick={() => navigate(`/chat/${professional.id}`)}
          >
            <MessageCircle className="w-5 h-5" />
            Chat Now
          </Button>
        </div>
      </div>
    </div>
  );
}
