import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, BadgeCheck } from 'lucide-react';
import { professionals, mockChatMessages, ChatMessage } from '@/data/mockData';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const professional = professionals.find(p => p.id === id);
  const initialMessages = id ? mockChatMessages[id] || [] : [];
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!professional) {
    return (
      <div className="app-container min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      receiverId: professional.id,
      message,
      timestamp: new Date(),
      isRead: false,
    };
    setMessages([...messages, newMessage]);

    // Simulate professional response after 1.5 seconds
    setTimeout(() => {
      const responses = [
        "Thank you for your message! I'll get back to you shortly.",
        "That sounds interesting! Could you share more details?",
        "I'd be happy to help with your project. Let me review this.",
        "Great question! Let me prepare some information for you.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: professional.id,
        receiverId: 'user',
        message: randomResponse,
        timestamp: new Date(),
        isRead: false,
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1500);
  };

  return (
    <div className="app-container min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => navigate(`/professional/${professional.id}`)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                <img 
                  src={professional.avatar} 
                  alt={professional.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="status-dot status-online absolute bottom-0 right-0 border-2 border-card" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-foreground truncate">
                  {professional.name}
                </h2>
                {professional.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-success flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-success">Online</p>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <img 
                src={professional.avatar} 
                alt={professional.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h3 className="font-medium text-foreground mb-1">{professional.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {professional.profession} • {professional.location}
            </p>
            <p className="text-sm text-muted-foreground">
              Start a conversation to discuss your project
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.message}
              timestamp={msg.timestamp}
              isSent={msg.senderId === 'user'}
              isRead={msg.isRead}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
