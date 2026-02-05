import ChatRoom from "./ChatRoom"
import ChatInput from "./ChatInput"

export default function ChatPage() {
  const chatId = 1       // TEMP: from DB
  const userId = "uuid"  // TEMP: from auth

  return (
    <div>
      <ChatRoom chatId={chatId} userId={userId} />
      <ChatInput chatId={chatId} userId={userId} />
    </div>
  )
}
