import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, Clock, MessageCircle, CheckCircle, XCircle,
  LogOut, ChevronRight, Shield, TrendingUp, AlertCircle
} from 'lucide-react';
import { adminStats, pendingVerifications, professionals } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [verificationActions, setVerificationActions] = useState<Record<string, 'approved' | 'rejected' | null>>({});

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleVerification = (id: string, action: 'approved' | 'rejected') => {
    setVerificationActions(prev => ({ ...prev, [id]: action }));
  };

  const stats = [
    { 
      label: 'Total Users', 
      value: adminStats.totalUsers, 
      icon: Users, 
      color: 'bg-primary/10 text-primary',
      trend: '+12%'
    },
    { 
      label: 'Professionals', 
      value: adminStats.totalProfessionals, 
      icon: Building2, 
      color: 'bg-secondary/20 text-secondary-foreground',
      trend: '+5%'
    },
    { 
      label: 'Pending', 
      value: adminStats.pendingVerifications, 
      icon: Clock, 
      color: 'bg-destructive/10 text-destructive',
      trend: null
    },
    { 
      label: 'Active Chats', 
      value: adminStats.activeChats, 
      icon: MessageCircle, 
      color: 'bg-success/10 text-success',
      trend: '+28%'
    },
  ];

  return (
    <div className="app-container min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground pt-8 pb-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        <h1 className="text-2xl font-bold animate-fade-in">Dashboard Overview</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Manage your platform</p>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="stat-card animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.trend && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground mt-3">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </section>

        {/* Pending Verifications */}
        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Verifications</h2>
            <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
              {pendingVerifications.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingVerifications.map((verification, index) => {
              const action = verificationActions[verification.id];
              
              return (
                <div 
                  key={verification.id}
                  className={cn(
                    'bg-card rounded-xl p-4 shadow-card transition-all animate-scale-in',
                    action && 'opacity-60'
                  )}
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{verification.name}</h3>
                      <p className="text-sm text-muted-foreground">{verification.profession}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {verification.documents.map(doc => (
                          <span 
                            key={doc}
                            className="px-2 py-0.5 bg-muted text-xs text-muted-foreground rounded-full"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {action ? (
                    <div className={cn(
                      'mt-4 py-2 text-center text-sm font-medium rounded-lg',
                      action === 'approved' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      {action === 'approved' ? 'Approved' : 'Rejected'}
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                        onClick={() => handleVerification(verification.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-success hover:bg-success/90"
                        onClick={() => handleVerification(verification.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            {[
              { label: 'Manage Professionals', icon: Building2 },
              { label: 'User Reports', icon: AlertCircle },
              { label: 'View All Chats', icon: MessageCircle },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
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
        </section>

        {/* All Professionals */}
        <section className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Professionals</h2>
          <div className="space-y-2">
            {professionals.map((prof) => (
              <div 
                key={prof.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                  <img src={prof.avatar} alt={prof.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{prof.name}</p>
                  <p className="text-xs text-muted-foreground">{prof.profession}</p>
                </div>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  prof.isVerified 
                    ? 'bg-success/10 text-success' 
                    : 'bg-secondary/20 text-secondary-foreground'
                )}>
                  {prof.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
