import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatThread } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ChatThreadItemProps {
  thread: ChatThread;
  animationDelay?: number;
}

export function ChatThreadItem({ thread, animationDelay = 0 }: ChatThreadItemProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center gap-3 p-4 bg-card rounded-xl cursor-pointer transition-all hover:shadow-card active:scale-[0.98] animate-slide-up"
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => navigate(`/chat/${thread.participantId}`)}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
          <img 
            src={thread.participantAvatar} 
            alt={thread.participantName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="status-dot status-online absolute bottom-0 right-0 border-2 border-card" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground truncate">
            {thread.participantName}
          </h3>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(thread.lastMessageTime, { addSuffix: false })}
          </span>
        </div>
        <p className={cn(
          'text-sm truncate mt-0.5',
          thread.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
        )}>
          {thread.lastMessage}
        </p>
      </div>

      {thread.unreadCount > 0 && (
        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-foreground">
            {thread.unreadCount}
          </span>
        </div>
      )}
    </div>
  );
}
