import React from 'react';
import { Search, Edit } from 'lucide-react';
import { mockChatThreads } from '@/data/mockData';
import { ChatThreadItem } from '@/components/chat/ChatThreadItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatsListPage() {
  return (
    <div className="app-container min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <Button variant="ghost" size="icon">
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 h-11 bg-muted border-0"
          />
        </div>
      </header>

      {/* Chat Threads */}
      <main className="px-4 py-4 space-y-3">
        {mockChatThreads.length > 0 ? (
          mockChatThreads.map((thread, index) => (
            <ChatThreadItem 
              key={thread.id} 
              thread={thread}
              animationDelay={index * 100}
            />
          ))
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Edit className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground">
              Start chatting with professionals to see your conversations here
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
