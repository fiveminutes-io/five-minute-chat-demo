import { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  isWhisper?: boolean;
}

export const ChatMessage = ({ message, isWhisper }: ChatMessageProps) => {
  const formattedTime = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex animate-fade-in",
        message.isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-md",
          isWhisper
            ? message.isOwn
              ? "bg-purple-600/20 border border-purple-500/30 text-foreground rounded-br-md"
              : "bg-purple-600/10 border border-purple-500/20 text-foreground rounded-bl-md"
            : message.isOwn
            ? "bg-chat-user text-foreground rounded-br-md"
            : "bg-chat-other text-foreground rounded-bl-md"
        )}
      >
        {isWhisper && (
          <p className="text-xs font-semibold text-purple-400 mb-1">
            🔒 Private
          </p>
        )}
        {!message.isOwn && (
          <p className="text-xs font-semibold text-primary mb-1">
            {message.sender}
          </p>
        )}
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1.5",
            message.isOwn ? "text-foreground/60" : "text-muted-foreground"
          )}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
};
