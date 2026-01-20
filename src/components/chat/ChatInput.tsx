import React, { useState } from 'react';
import { Send, Paperclip, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-card border-t border-border">
      <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
        <Paperclip className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
        <Camera className="w-5 h-5" />
      </Button>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 bg-muted border-0"
        disabled={disabled}
      />
      <Button 
        size="icon" 
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="shrink-0"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
