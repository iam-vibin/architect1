import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  FileText,
  Star,
  TrendingUp,
  Eye,
  Calendar,
  LogOut,
  Bell,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { professionals, mockChatThreads } from "@/data/mockData";
import { Button } from "@/components/ui/button";

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Demo professional
  const professional = professionals[0];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    { label: "Profile Views", value: 234, icon: Eye, trend: "+18%" },
    { label: "Quote Requests", value: 12, icon: FileText, trend: "+5" },
    { label: "Active Chats", value: mockChatThreads.length, icon: MessageCircle },
    { label: "Rating", value: professional.rating, icon: Star },
  ];

  const quickActions = [
    { label: "View Messages", icon: MessageCircle, badge: 2 },
    { label: "Quote Requests", icon: FileText, badge: 3 },
    { label: "My Portfolio", icon: Eye },
    { label: "Availability", icon: Calendar },
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
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/professional/profile')}>Profile</Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={professional.avatar}
            alt={professional.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm opacity-80">{professional.profession}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full">
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
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-4 shadow-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  {stat.trend && (
                    <span className="text-xs text-success flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-card"
                  onClick={() => {
                    if (action.label === "View Messages") {
                      navigate("/messages");
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative">
                    <Icon className="w-5 h-5 text-primary" />
                    {action.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Messages */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <button
              className="text-sm text-primary"
              onClick={() => navigate("/messages")}
            >
              View all
            </button>
          </div>

          <div className="bg-card rounded-xl overflow-hidden">
            {mockChatThreads.map((thread) => (
              <div
                key={thread.id}
                className="flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-muted"
                onClick={() => navigate(`/chat/${thread.id}`)}
              >
                <img
                  src={thread.participantAvatar}
                  alt={thread.participantName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{thread.participantName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {thread.lastMessage}
                  </p>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
