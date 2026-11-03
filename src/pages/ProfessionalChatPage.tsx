import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, Send, CheckCheck, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfessionalChatPage() {
  const { id } = useParams(); // client userId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-bold text-sm text-foreground leading-tight">Client Inquiry</h2>
              <p className="text-[11px] text-muted-foreground font-mono">ID: {id?.slice(0, 12)}</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/professional-dashboard')}
            className="text-xs"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <User className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <h3 className="font-semibold text-sm text-foreground">Client conversation started</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Respond with consultation details, architectural questions, or quotation options.
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
                      ? "bg-emerald-600 text-white rounded-br-none"
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
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
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
            placeholder="Type your response to the client..."
            className="h-11 text-xs bg-muted/30"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className="h-11 w-11 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
