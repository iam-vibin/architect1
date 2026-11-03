import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  ChevronRight,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  User,
  Heart,
  FileText,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Edit,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [quotesCount, setQuotesCount] = useState(0);
  const [favsCount, setFavsCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || user?.username || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.quotes.list().then((res) => {
      if (res && res.success) setQuotesCount(res.quotes?.length || 0);
    }).catch(() => {});

    api.favorites.list().then((res) => {
      if (res && res.success) setFavsCount(res.favoriteIds?.length || 0);
    }).catch(() => {});

    api.chat.threads().then((res) => {
      if (res && res.success) setChatsCount(res.threads?.length || 0);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.auth.updateProfile(editForm);
      if (res && res.success) {
        updateUser(res.user);
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          setShowEditModal(false);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-sm text-foreground">My Profile & Account</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowEditModal(true)} className="text-foreground">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* User Card */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-xl text-primary border-2 border-border shadow-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                (user?.fullName || user?.username || 'U')[0].toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground truncate">{user?.fullName || user?.username}</h2>
                <span className="capitalize text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">@{user?.username}</p>
              {user?.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{user.location}</span>
                </p>
              )}
            </div>
          </div>

          {user?.bio && (
            <p className="text-xs text-foreground/80 bg-muted/30 p-3 rounded-xl border border-border/40">
              {user.bio}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="text-xs h-8 gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Account Info</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div
            onClick={() => navigate('/user-dashboard')}
            className="p-4 bg-card border border-border rounded-2xl text-center shadow-sm cursor-pointer hover:border-primary/40 transition"
          >
            <p className="text-xl font-bold text-primary">{quotesCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Quote Requests</p>
          </div>
          <div
            onClick={() => navigate('/user-dashboard')}
            className="p-4 bg-card border border-border rounded-2xl text-center shadow-sm cursor-pointer hover:border-primary/40 transition"
          >
            <p className="text-xl font-bold text-rose-500">{favsCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Saved Pros</p>
          </div>
          <div
            onClick={() => navigate('/chats')}
            className="p-4 bg-card border border-border rounded-2xl text-center shadow-sm cursor-pointer hover:border-primary/40 transition"
          >
            <p className="text-xl font-bold text-emerald-600">{chatsCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Conversations</p>
          </div>
        </div>

        {/* Action Menu */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          <button
            onClick={() => navigate('/user-dashboard')}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">My Quotations & Projects</h4>
                <p className="text-[11px] text-muted-foreground">Track estimate responses and project status</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate('/user-dashboard')}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">Saved Architects & Studios</h4>
                <p className="text-[11px] text-muted-foreground">Quick access to bookmarked professionals</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate('/chats')}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">Escrow Guarantee & Protection</h4>
                <p className="text-[11px] text-muted-foreground">Learn how ArchiFind protects your milestone funds</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-11 text-xs text-destructive border-destructive/30 hover:bg-destructive/5 font-semibold gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of ArchiFind</span>
        </Button>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Edit Account Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-success/10 text-success text-xs rounded-xl flex items-center gap-2 mt-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Display Name</label>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Phone Number</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">City / Region</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g. Coimbatore, Tamil Nadu"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Bio / Architectural Preferences</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Briefly describe your home improvement or design interests..."
                  className="w-full text-xs p-3 border border-border rounded-xl bg-background min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 text-xs h-10 bg-primary hover:bg-primary/90">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
