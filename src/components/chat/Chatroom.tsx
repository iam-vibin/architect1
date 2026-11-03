import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function ChatRoom({ chatId, userId }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // Load existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at")
      .then(({ data }) => setMessages(data || []))

    // Realtime listener
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])

  return (
    <div>
      {messages.map((msg) => (
        <p key={msg.id}>
          <b>{msg.sender_id === userId ? "You" : "Them"}:</b> {msg.message}
        </p>
      ))}
    </div>
  )
}
