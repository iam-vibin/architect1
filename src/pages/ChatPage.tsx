import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

export default function ChatPage() {
  const { id } = useParams(); // professionalId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<number | null>(null);

  const fetchMessages = async () => {
    if (!user || !id) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat/${user.id}/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchMessages();
    pollRef.current = window.setInterval(fetchMessages, 2000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: user.id, to: id, message: input }),
      });

      if (res.ok) {
        setInput('');
        fetchMessages();
      }
    } catch (err) {
      // ignore
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm mb-2">⬅ Back</button>

      <h2 className="text-lg font-semibold mb-3">Chat with Professional {id}</h2>

      <div className="border rounded h-80 p-3 overflow-y-auto bg-gray-50 mb-3">
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 p-2 rounded ${m.from === user?.id ? 'bg-sky-600 text-white ml-auto max-w-[80%]' : 'bg-white'}`}>
            <div className="text-sm">{m.message}</div>
            <div className="text-xs text-muted-foreground mt-1">{new Date(m.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded" />
        <button onClick={sendMessage} disabled={loading} className="px-4 py-2 bg-sky-600 text-white rounded">Send</button>
      </div>
    </div>
  );
}
