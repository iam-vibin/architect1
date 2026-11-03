import { mockChatThreads } from "../data/mockData";
import { useNavigate } from "react-router-dom";

export default function ProfessionalChatsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Chats</h2>

      {mockChatThreads.map(thread => (
        <div
          key={thread.id}
          onClick={() => navigate(`/professional/chat/${thread.participantId}`)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: 12,
            borderBottom: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          <img
            src={thread.participantAvatar}
            alt=""
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
          <div style={{ marginLeft: 12 }}>
            <strong>{thread.participantName}</strong>
            <div style={{ fontSize: 12, color: "#666" }}>
              {thread.lastMessage}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
