import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, MessageCircle } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

interface ChatThread {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ProfessionalChatsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE}/api/chat/threads/${user.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(setThreads)
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [user]);

  const imgUrl = (src: string) => src?.startsWith('/') ? `${API_BASE}${src}` : src;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-semibold text-gray-900">Messages</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No conversations yet</h3>
            <p className="text-gray-400 text-sm mt-1">Your messages will appear here</p>
          </div>
        ) : (
          <div className="bg-white mt-2 rounded-2xl border border-gray-100 shadow-sm overflow-hidden mx-4">
            {threads.map(thread => (
              <div
                key={thread.partnerId}
                onClick={() => {
                  const route = user?.role === "professional"
                    ? `/professional/chat/${thread.partnerId}`
                    : `/chat/${thread.partnerId}`;
                  navigate(route);
                }}
                className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors last:border-0"
              >
                <div className="relative">
                  <img
                    src={thread.partnerAvatar ? imgUrl(thread.partnerAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.partnerName)}&background=E5E7EB&color=374151`}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.partnerName)}&background=E5E7EB&color=374151`; }}
                  />
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{thread.partnerName}</p>
                  <p className="text-sm text-gray-400 truncate">{thread.lastMessage || "No messages yet"}</p>
                </div>
                <div className="text-right shrink-0">
                  {thread.lastMessageTime && (
                    <p className="text-xs text-gray-400">{new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  )}
                  {thread.unreadCount > 0 && (
                    <span className="inline-flex w-5 h-5 bg-blue-600 text-white text-xs rounded-full items-center justify-center mt-1">{thread.unreadCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
