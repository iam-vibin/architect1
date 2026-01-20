import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, FileText, Star, TrendingUp, Eye, 
  Calendar, Settings, LogOut, Bell, ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { professionals, mockChatThreads } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get the professional data (using first professional for demo)
  const professional = professionals[0];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { label: 'Profile Views', value: 234, icon: Eye, trend: '+18%' },
    { label: 'Quote Requests', value: 12, icon: FileText, trend: '+5' },
    { label: 'Active Chats', value: mockChatThreads.length, icon: MessageCircle, trend: null },
    { label: 'Rating', value: professional.rating, icon: Star, trend: null },
  ];

  const quickActions = [
    { label: 'View Messages', icon: MessageCircle, badge: 2 },
    { label: 'Quote Requests', icon: FileText, badge: 3 },
    { label: 'My Portfolio', icon: Eye, badge: null },
    { label: 'Availability', icon: Calendar, badge: null },
  ];

  return (
    <div className="app-container min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-secondary via-secondary to-secondary/90 text-secondary-foreground pt-8 pb-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-secondary-foreground/80 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{professional.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-secondary-foreground hover:bg-secondary-foreground/10 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-14 h-14 rounded-xl bg-secondary-foreground/20 overflow-hidden">
            <img 
              src={professional.avatar} 
              alt={professional.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-secondary-foreground/80">{professional.profession}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-secondary-foreground/20 text-xs font-medium rounded-full">
                Verified
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-current" />
                {professional.rating}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="bg-card rounded-xl p-4 shadow-card animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  {stat.trend && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-card hover:shadow-elevated transition-all active:scale-[0.98] animate-scale-in"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative">
                    <Icon className="w-5 h-5 text-primary" />
                    {action.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Messages */}
        <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Messages</h2>
            <button className="text-sm text-primary font-medium">View all</button>
          </div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            {mockChatThreads.map((thread, index) => (
              <div
                key={thread.id}
                className="flex items-center gap-3 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/chat/${thread.participantId}`)}
              >
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                  <img 
                    src={thread.participantAvatar} 
                    alt={thread.participantName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{thread.participantName}</p>
                  <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio Preview */}
        <section className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">My Portfolio</h2>
            <button className="text-sm text-primary font-medium">Edit</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {professional.portfolio.slice(0, 3).map((item) => (
              <div key={item.id} className="aspect-square rounded-xl bg-muted overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
