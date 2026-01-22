import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { AuthCredentials } from "@/types/auth";
import { Send, LogOut, Hash } from "lucide-react";

interface ChatInterfaceProps {
  user: AuthCredentials;
  onLogout: () => void;
  messages: ChatMessageType[];
  whispers: ChatMessageType[];
  onSendMessage: (content: string) => void;
}

export const ChatInterface = ({ user, onLogout, messages, whispers, onSendMessage }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   useEffect(() => {
     scrollToBottom();
   }, [messages, whispers]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    onSendMessage(newMessage.trim());
    setNewMessage("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Hash className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">general</h1>
            <p className="text-xs text-muted-foreground">Public channel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.username}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {user.applicationId.slice(0, 8)}...
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && whispers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {[...messages, ...whispers]
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                .map((msg) => {
                  const isWhisper = whispers.some(w => w.id === msg.id);
                  return <ChatMessage key={msg.id} message={msg} isWhisper={isWhisper} />;
                })}
            </>
          )}
          <div ref={messagesEndRef} />
        </main>

      {/* Message Input */}
      <footer className="px-4 py-4 bg-card border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
};
