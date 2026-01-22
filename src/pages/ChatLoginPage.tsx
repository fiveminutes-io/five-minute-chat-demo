import { useState, useRef } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { ChatLoginForm } from "@/components/ChatLoginForm";
import { AuthCredentials, AuthState } from "@/types/auth";
import { ChatClient } from "@fiveminutes-io/chat-client";
import type { ChatMessageEvent, WhisperMessageEvent } from "@fiveminutes-io/chat-client";
import { toast } from "sonner";
import { ChatMessage } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";

interface ChatLoginPageProps {
  onBack: () => void;
}

export function ChatLoginPage({ onBack }: ChatLoginPageProps) {
   const [authState, setAuthState] = useState<AuthState>({
     isAuthenticated: false,
     user: null,
     status: "Disconnected",
   });

   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [whispers, setWhispers] = useState<ChatMessage[]>([]);
   const clientRef = useRef<ChatClient | null>(null);

   // Get or create a persistent device ID
   const getDeviceId = () => {
     let deviceId = localStorage.getItem("chat-device-id");
     if (!deviceId) {
       deviceId = uuid();
       localStorage.setItem("chat-device-id", deviceId);
     }
     return deviceId;
   };

  const handleSendMessage = async (content: string) => {
    if (!clientRef.current?.isConnectedToServer()) {
      toast.error("Not connected to server");
      return;
    }

    try {
      await clientRef.current.sendMessage(content, "Global");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  const handleLogin = async (credentials: AuthCredentials, serverUrl: string) => {
    setAuthState((prev) => ({ ...prev, status: "Connecting", error: undefined }));

    try {
       // Create and configure chat client
       const client = new ChatClient({
         serverUrl,
         applicationId: credentials.applicationId,
         applicationSecret: credentials.applicationSecret,
         username: credentials.username,
         deviceId: getDeviceId(),
         platform: "React Web Client",
         language: navigator.language || "en-US",
       });

      clientRef.current = client;

      // Setup event handlers
      client.onConnected(async () => {
        console.log("Connected to chat server");
        toast.success(`Welcome ${credentials.username}!`);
        setAuthState({
          isAuthenticated: true,
          user: credentials,
          status: "Connected",
        });

        try {
          // Join the Global channel
          await client.joinChannel("Global");
          console.log("Joined Global channel");

          // Fetch message history
          const historyMessages = await client.fetchChannelHistory("Global");
          console.log(`Fetched ${historyMessages.length} messages from history`);

          // Convert history to ChatMessage format and populate the UI
          const chatMessages = historyMessages.map((msg) => ({
            id: msg.messageId,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
            isOwn: msg.sender === credentials.username,
          } as ChatMessage));

          // Set initial messages from history
          setMessages(chatMessages);
        } catch (error) {
          console.error("Error during channel join or history fetch:", error);
          toast.error("Failed to load channel history");
        }
      });

      client.onDisconnected((error) => {
        //console.log("Disconnected from chat server", error);
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          status: "Disconnected",
          error: error || "Disconnected from server",
        }));
      });

       client.onMessageReceived((msg: ChatMessageEvent) => {
         const chatMsg: ChatMessage = {
           id: msg.messageId,
           content: msg.content,
           sender: msg.sender,
           timestamp: msg.timestamp,
           isOwn: msg.sender === credentials.username,
         };
         setMessages((prev) => [...prev, chatMsg]);
       });

       client.onWhisperReceived((msg: WhisperMessageEvent) => {
         const whisperMsg: ChatMessage = {
           id: msg.messageId,
           content: msg.content,
           sender: msg.sender,
           timestamp: msg.timestamp,
           isOwn: msg.sender === credentials.username,
         };
         setWhispers((prev) => [...prev, whisperMsg]);
         toast.info(`Whisper from ${msg.sender}: ${msg.content}`);
       });

       client.onError((error) => {
         console.error("Chat client error:", error);
         toast.error(`Error: ${error}`);
       });

      // Connect
      await client.connect();
    } catch (err: any) {
      console.error("Connection failed:", err);
      setAuthState((prev) => ({
        ...prev,
        status: "Error",
        error: err.message || "Failed to connect to server",
      }));
      toast.error("Failed to connect to chat server");
    }
  };

   const handleLogout = async () => {
     if (clientRef.current) {
       await clientRef.current.disconnect();
       clientRef.current = null;
     }
     setAuthState({
       isAuthenticated: false,
       user: null,
       status: "Disconnected",
     });
     setMessages([]);
     setWhispers([]);
   };

   // If authenticated, show chat
   if (authState.isAuthenticated && authState.user && clientRef.current?.isConnectedToServer()) {
     return (
       <ChatInterface
         user={authState.user}
         onLogout={handleLogout}
         messages={messages}
         whispers={whispers}
         onSendMessage={handleSendMessage}
       />
     );
   }

  // If not authenticated, show login form with back button
  return (
    <div>
      <div className="absolute top-4 left-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="text-slate-300 border-slate-600 hover:bg-slate-800"
        >
          ← Back
        </Button>
      </div>
      <ChatLoginForm
        onLogin={handleLogin}
        status={authState.status}
        error={authState.error}
      />
    </div>
  );
}
