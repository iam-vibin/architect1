import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../context/DataContext';
import { Send, Image as ImageIcon, Paperclip, Smile } from 'lucide-react';

export default function ChatBox({ 
  messages, 
  currentUserId, 
  onSendMessage,
  otherParticipantName = 'User'
}: { 
  messages: ChatMessage[], 
  currentUserId: string, 
  onSendMessage: (text: string) => void,
  otherParticipantName?: string
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white flex flex-col pt-8 custom-scrollbar relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Smile className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">It's quiet here...</h3>
            <p className="font-medium text-sm text-center max-w-xs">Send a message to start the conversation with {otherParticipantName}.</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                End-to-End Encrypted
              </span>
            </div>
            {messages.map(msg => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] sm:max-w-[65%] rounded-[1.5rem] px-6 py-3.5 shadow-sm relative ${
                    isMe 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    <p className="leading-relaxed text-[15px]">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 block font-bold tracking-wide ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white border-t border-gray-100 z-10">
        <form onSubmit={send} className="flex gap-3 items-center bg-gray-50 border border-gray-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
          
          <button type="button" className="p-2 sm:p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 sm:p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors hidden sm:block">
            <ImageIcon className="w-5 h-5" />
          </button>

          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-2 sm:px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 font-medium text-gray-800 placeholder-gray-400"
          />
          
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="p-3 sm:px-6 sm:py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-4 h-4 ml-0.5 sm:ml-0" />
          </button>
        </form>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
