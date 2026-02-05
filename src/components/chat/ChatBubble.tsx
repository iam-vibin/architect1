import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: string;
  timestamp: Date;
  isSent: boolean;
  isRead?: boolean;
}

export function ChatBubble({ message, timestamp, isSent, isRead = false }: ChatBubbleProps) {
  return (
    <div className={cn('flex', isSent ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[80%] animate-scale-in',
        isSent ? 'chat-bubble-sent' : 'chat-bubble-received'
      )}>
        <p className="text-sm leading-relaxed">{message}</p>
        <div className={cn(
          'flex items-center justify-end gap-1 mt-1',
          isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          <span className="text-[10px]">
            {format(timestamp, 'h:mm a')}
          </span>
          {isSent && (
            isRead ? (
              <CheckCheck className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
