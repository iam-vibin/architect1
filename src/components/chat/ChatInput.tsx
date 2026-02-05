import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ChatInput({ chatId, userId }) {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text) return;

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: userId,
      message: text,
    });

    setText("");
  };

  return (
    <div style={{ display: "flex", gap: "8px", padding: "10px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        style={{ flex: 1, padding: "8px" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
