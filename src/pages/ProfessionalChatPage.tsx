import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function ProfessionalChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [partnerName, setPartnerName] = useState(`User`);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);

  const fetchMessages = async () => {
    if (!user || !id) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat/${id}/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Mark as read
        fetch(`${API_BASE}/api/chat/read`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from: id, to: user.id }),
        }).catch(() => {});
      }
    } catch {}
  };

  useEffect(() => {
    // Try to get user info
    fetch(`${API_BASE}/api/users`)
      .then(r => r.ok ? r.json() : [])
      .then((users: any[]) => {
        const u = users.find(u => u.id === id);
        if (u) setPartnerName(u.name || u.username);
      })
      .catch(() => {});

    fetchMessages();
    pollRef.current = window.setInterval(fetchMessages, 2000);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !id) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: user.id, to: id, message: input }),
      });
      if (res.ok) {
        setInput("");
        await fetchMessages();
      }
    } catch {}
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {partnerName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{partnerName}</p>
              <p className="text-xs text-emerald-500">Client</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col" style={{ height: "calc(100vh - 65px)" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-gray-400 text-sm mt-1">Start responding to your client!</p>
              </div>
            </div>
          )}
          {messages.map((m, idx) => {
            const isMine = m.from === user?.id;
            const showDate = idx === 0 || new Date(m.timestamp).toDateString() !== new Date(messages[idx - 1].timestamp).toDateString();
            return (
              <div key={m.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(m.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-blue-600 text-white rounded-br-md" : "bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm"}`}>
                    <p className="leading-relaxed">{m.message}</p>
                    <p className={`text-xs mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isMine && <span className="ml-1">{m.read ? "✓✓" : "✓"}</span>}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 resize-none focus:outline-none placeholder-gray-400"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
