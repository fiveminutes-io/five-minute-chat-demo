import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SupportMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface SupportInterfaceProps {
  ticketId: string;
  username: string;
  messages: SupportMessage[];
  whispers: SupportMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export function SupportInterface({
  ticketId,
  messages,
  whispers,
  onSendMessage,
  onLogout,
}: SupportInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   useEffect(() => {
     scrollToBottom();
   }, [messages, whispers]);

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(messageInput);
      setMessageInput("");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl h-screen max-h-[600px] bg-slate-800 border border-slate-700 rounded-lg flex flex-col">
        <div className="border-b border-slate-700 p-4 flex flex-row items-center justify-between">
          <div>
            <h2 className="text-white font-bold">Support Ticket</h2>
            <p className="text-slate-400 text-sm">ID: {ticketId}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            Logout
          </Button>
        </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {messages.length === 0 && whispers.length === 0 ? (
             <p className="text-slate-400 text-center py-8">No messages yet. Start the conversation!</p>
           ) : (
             <>
               {[...messages, ...whispers]
                 .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                 .map((msg) => {
                   const isWhisper = whispers.some(w => w.id === msg.id);
                   return (
                     <div
                       key={msg.id}
                       className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                     >
                       <div
                         className={`max-w-xs rounded-lg px-4 py-2 ${
                           isWhisper
                             ? msg.isOwn
                               ? "bg-purple-600/20 border border-purple-500/30 text-slate-100"
                               : "bg-purple-600/10 border border-purple-500/20 text-slate-100"
                             : msg.isOwn
                             ? "bg-cyan-600 text-white"
                             : "bg-slate-700 text-slate-100"
                         }`}
                       >
                         {isWhisper && (
                           <p className="text-xs font-semibold text-purple-400 mb-1">
                             🔒 Private
                           </p>
                         )}
                         {!msg.isOwn && (
                           <p className="text-xs font-semibold text-slate-300 mb-1">
                             {msg.sender}
                           </p>
                         )}
                         <p className="break-words">{msg.content}</p>
                         <p className="text-xs mt-1 opacity-70">
                           {msg.timestamp.toLocaleTimeString()}
                         </p>
                       </div>
                     </div>
                   );
                 })}
             </>
           )}
           <div ref={messagesEndRef} />
         </div>

        <div className="border-t border-slate-700 p-4 bg-slate-750">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isSending}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 disabled:opacity-50"
            />
            <Button
              onClick={handleSend}
              disabled={isSending || !messageInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSending ? "..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
