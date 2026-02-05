import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<string[]>([
    "Hi! How can I help you?",
  ]);
  const [input, setInput] = useState("");
  


  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <div style={{ padding: 30, maxWidth: 600 }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2 style={{ marginTop: 20 }}>
        Chat with Professional {id}
      </h2>

      <div
        style={{
          marginTop: 20,
          border: "1px solid #ccc",
          height: 300,
          padding: 10,
          overflowY: "auto",
          background: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: 10,
              background: "#fff",
              padding: 8,
              borderRadius: 4,
            }}
          >
            {msg}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
