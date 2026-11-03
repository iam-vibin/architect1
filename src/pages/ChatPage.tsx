import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, Send, CheckCheck, Building2, FileText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
  const { id } = useParams(); // professionalId or other participant
  const navigate = useNavigate();
  const { user } = useAuth();

  const [partner, setPartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load partner info
  useEffect(() => {
    if (!id) return;
    api.professionals.get(id).then((res) => {
      if (res && res.success && res.professional) {
        setPartner(res.professional);
      }
    }).catch(() => {});
  }, [id]);

  const fetchMessages = async () => {
    if (!user || !id) return;
    try {
      const data = await api.chat.getMessages(user.id, id);
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [user, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user || !id || loading) return;

    const messageText = input.trim();
    setInput("");
    setLoading(true);

    // Optimistic message append
    const tempMsg = {
      id: `temp-${Date.now()}`,
      from: user.id,
      to: id,
      message: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.chat.send({
        from: user.id,
        to: id,
        message: messageText,
      });
      fetchMessages();
    } catch (err) {
      console.error("Chat send error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <img
              src={partner?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
              alt=""
              className="w-10 h-10 rounded-xl object-cover bg-muted border border-border"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm text-foreground leading-tight">
                  {partner?.name || `Studio Partner`}
                </h2>
                {partner?.isVerified && (
                  <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{partner?.profession || "Architecture Specialist"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {partner && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/quote/${partner.id}`)}
                className="text-xs h-8 gap-1 hidden sm:flex"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Get Quote</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <h3 className="font-semibold text-sm text-foreground">Start the conversation</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Ask about preliminary floor plans, design ideas, site measurements, or quotation estimates.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.from === user?.id;

            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.message}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-muted-foreground">
                  <span>
                    {m.timestamp
                      ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "now"}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 text-sky-500" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Input Bottom Bar */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border p-3">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or project requirements..."
            className="h-11 text-xs bg-muted/30"
          />
          <Button type="submit" disabled={!input.trim() || loading} size="icon" className="h-11 w-11 flex-shrink-0 bg-primary">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
