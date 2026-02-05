import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function ChatPage() {
  const { id } = useParams(); // chat_id
  const { role } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // Load existing messages + realtime
  useEffect(() => {
    if (!id) return;

    // Initial load
    supabase
      .from("messages")
      .select("*")
      .eq("chat_id", Number(id))
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      });

    // Realtime subscription
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const sendMessage = async () => {
    if (!input.trim() || !id) return;

    await supabase.from("messages").insert({
      chat_id: Number(id),
      sender_id: role, // PoC: role as sender
      message: input,
    });

    setInput("");
  };

  return (
    <div style={{ padding: 30, maxWidth: 600 }}>
      <h2>Chat #{id}</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 6,
              textAlign: m.sender_id === role ? "right" : "left",
            }}
          >
            <strong>{m.sender_id}:</strong> {m.message}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
