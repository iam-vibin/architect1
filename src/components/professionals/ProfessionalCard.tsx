import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Star, BadgeCheck, MessageCircle } from 'lucide-react';
import { Professional } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfessionalCardProps {
  professional: Professional;
  animationDelay?: number;
}

export function ProfessionalCard({ professional, animationDelay = 0 }: ProfessionalCardProps) {
  const navigate = useNavigate();

  const professionColors: Record<string, string> = {
    'Architect': 'bg-primary/10 text-primary',
    'Interior Designer': 'bg-secondary/20 text-secondary-foreground',
    'Builder': 'bg-accent text-accent-foreground',
  };

  return (
    <div 
      className="professional-card animate-slide-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden">
            <img 
              src={professional.avatar} 
              alt={professional.name}
              className="w-full h-full object-cover"
            />
          </div>
          {professional.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
              <BadgeCheck className="w-3 h-3 text-success-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {professional.name}
              </h3>
              <span className={cn(
                'inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1',
                professionColors[professional.profession]
              )}>
                {professional.profession}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <span className="font-medium">{professional.rating}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{professional.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{professional.experience} yrs</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
            {professional.specialization}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => navigate(`/professional/${professional.id}`)}
        >
          View Profile
        </Button>
        <Button 
          size="sm" 
          className="flex-1 gap-2"
          onClick={() => navigate(`/chat/${professional.id}`)}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </Button>
      </div>
    </div>
  );
}
