import React, { useState, useEffect } from 'react';
import { Search, Edit, ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    try {
      const res = await api.chat.threads();
      if (res && res.success) {
        setThreads(res.threads || []);
      }
    } catch (err) {
      console.error('Error loading threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
    const interval = setInterval(loadThreads, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredThreads = threads.filter((t) =>
    t.participantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Messages</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              user?.role === 'professional' ? navigate('/professional-dashboard') : navigate('/user-dashboard')
            }
            className="text-xs"
          >
            Dashboard
          </Button>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-10 text-xs bg-muted/40"
          />
        </div>
      </header>

      {/* Threads list */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        {loading && threads.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-10">Loading messages...</p>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl p-6">
            <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="font-semibold text-foreground text-base">No conversations yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Start chatting with an architect or client to see your message history here.
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => {
                const targetRoute =
                  user?.role === 'professional'
                    ? `/professional/chat/${thread.participantId}`
                    : `/chat/${thread.participantId}`;
                navigate(targetRoute);
              }}
              className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 cursor-pointer flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={thread.participantAvatar}
                  alt={thread.participantName}
                  className="w-12 h-12 rounded-xl object-cover bg-muted border border-border flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground truncate">{thread.participantName}</h4>
                    {thread.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.lastMessage}</p>
                </div>
              </div>

              <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                {new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
