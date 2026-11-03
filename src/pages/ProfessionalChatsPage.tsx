import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfessionalChatsPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    try {
      const res = await api.chat.threads();
      if (res && res.success) {
        setThreads(res.threads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
    const timer = setInterval(loadThreads, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-bold text-lg text-foreground">Studio Client Inquiries</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/professional-dashboard")}>
          Dashboard
        </Button>
      </div>

      {loading && threads.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-10">Loading messages...</p>
      ) : threads.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
          No client conversations yet.
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => navigate(`/professional/chat/${thread.participantId}`)}
              className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-emerald-500/50 cursor-pointer flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={thread.participantAvatar}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover bg-muted"
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{thread.participantName}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{thread.lastMessage}</p>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
