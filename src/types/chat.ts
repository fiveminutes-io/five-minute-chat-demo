export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}
