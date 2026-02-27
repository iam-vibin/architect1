import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, ChevronRight, Bell, Shield, CreditCard, 
  HelpCircle, LogOut, User, Heart, FileText 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: Heart, label: 'Saved Professionals', path: '/saved' },
  { icon: FileText, label: 'My Quote Requests', path: '/quotes' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: CreditCard, label: 'Payment Methods', path: '/payments' },
  { icon: Shield, label: 'Privacy & Security', path: '/privacy' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground pt-8 pb-16 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 overflow-hidden">
            <img 
              src={user?.avatar || '/placeholder.svg'} 
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name || 'Guest User'}</h2>
            <p className="text-primary-foreground/80 text-sm">{user?.email || 'Not logged in'}</p>
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <div className="px-4 -mt-8">
        <div className="bg-card rounded-2xl shadow-elevated overflow-hidden animate-slide-up">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground mt-1">Quote Requests</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-secondary">3</p>
            <p className="text-xs text-muted-foreground mt-1">Saved Pros</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-success">2</p>
            <p className="text-xs text-muted-foreground mt-1">Active Chats</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-8 pb-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <Button 
          variant="outline" 
          className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/5 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
