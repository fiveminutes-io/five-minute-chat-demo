import { useState, useRef } from "react";
import { SupportClient } from "@fiveminutes-io/support-client";
import type { SupportMessageEvent, WhisperMessageEvent } from "@fiveminutes-io/support-client";
import { toast } from "sonner";
import { SupportInterface } from "@/components/SupportInterface";
import { SupportLoginForm } from "@/components/SupportLoginForm";
import { v4 as uuid } from "uuid";

interface SupportLoginPageProps {
  onBack: () => void;
}

interface SupportState {
  isConnected: boolean;
  ticketId: string | null;
  messages: SupportMessage[];
  whispers: SupportMessage[];
  status: "disconnected" | "connecting" | "connected" | "error";
  error?: string;
}

interface SupportMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ServerConfig {
  url: string;
  appId: string;
  appSecret: string;
}

const SERVER_PRESETS: { [key: string]: ServerConfig } = {
  Global: {
    url: "https://signalr.fiveminutes.cloud/signalr",
    appId: "Demo01",
    appSecret: "DemoSecret",
  }
};

export function SupportLoginPage({ onBack }: SupportLoginPageProps) {
   const [serverConfig] = useState<ServerConfig>(SERVER_PRESETS.Global);

   // Get or create a persistent device ID
   const getDeviceId = () => {
     let deviceId = localStorage.getItem("support-device-id");
     if (!deviceId) {
       deviceId = uuid();
       localStorage.setItem("support-device-id", deviceId);
     }
     return deviceId;
   };

   const [supportState, setSupportState] = useState<SupportState>({
     isConnected: false,
     ticketId: null,
     messages: [],
     whispers: [],
     status: "disconnected",
   });

  const clientRef = useRef<SupportClient | null>(null);
  let setUsername = "";

  const connectClient = async (username: string, applicationId: string, applicationSecret: string, ticketId: string | null) => {
    if (!applicationId.trim() || !applicationSecret.trim()) {
      toast.error("Please enter Application ID and Secret");
      return;
    }

    const client = new SupportClient({
      serverUrl: serverConfig.url,
      applicationId,
      applicationSecret,
      username,
      deviceId: getDeviceId(),
    });

    clientRef.current = client;
    setUsername = username;

    client.onConnected(async () => {
      console.log("Connected to support server");
      toast.success("Connected to support");

      if (ticketId) {
        try {
          const ticket = await client.getSupportTicket(ticketId);
          console.log("Retrieved ticket:", ticket);

           setSupportState((prev) => ({
             ...prev,
             isConnected: true,
             ticketId,
             status: "connected",
             messages: [],
             whispers: [],
           }));
        } catch (error) {
          console.error("Error retrieving ticket:", error);
          toast.error("Failed to load ticket. Please check the ticket ID.");
          setSupportState((prev) => ({
            ...prev,
            status: "error",
            error: "Failed to load ticket",
          }));
        }
      }
    });

    client.onDisconnected((error) => {
      // console.log("Disconnected from support server", error);
      setSupportState((prev) => ({
        ...prev,
        isConnected: false,
        status: "disconnected",
        error: error || "Disconnected from server",
      }));
    });

     client.onSupportMessageReceived((msg: SupportMessageEvent) => {
       const supportMsg: SupportMessage = {
         id: msg.messageId,
         content: msg.content,
         sender: msg.sender,
         timestamp: msg.timestamp,
         isOwn: msg.sender === username,
       };
       setSupportState((prev) => ({
         ...prev,
         messages: [...prev.messages, supportMsg],
       }));
     });

     client.onWhisperReceived((msg: WhisperMessageEvent) => {
       const whisperMsg: SupportMessage = {
         id: msg.messageId,
         content: msg.content,
         sender: msg.sender,
         timestamp: msg.timestamp,
         isOwn: msg.sender === username,
       };
       setSupportState((prev) => ({
         ...prev,
         whispers: [...prev.whispers, whisperMsg],
       }));
       toast.info(`Whisper from ${msg.sender}: ${msg.content}`);
     });

     client.onTicketCreated((ticketId) => {
      console.log("Ticket created:", ticketId);
      toast.success(`Ticket created: ${ticketId}`);
      setSupportState((prev) => ({
        ...prev,
        isConnected: true,
        ticketId,
        status: "connected",
        messages: [],
      }));
    });

    client.onError((error) => {
      console.error("Support client error:", error);
      toast.error(`Error: ${error}`);
    });

    await client.connect();
  };

  const handleJoinExistingTicket = async (username: string, applicationId: string, applicationSecret: string, ticketId: string) => {
    if (!username.trim() || !ticketId.trim()) {
      toast.error("Please enter username and ticket ID");
      return;
    }

    if (!applicationId.trim() || !applicationSecret.trim()) {
      toast.error("Please enter Application ID and Secret");
      return;
    }

    setSupportState((prev) => ({ ...prev, status: "connecting", error: undefined }));

    try {
      await connectClient(username, applicationId, applicationSecret, ticketId);
    } catch (err: any) {
      console.error("Connection failed:", err);
      setSupportState((prev) => ({
        ...prev,
        status: "error",
        error: err.message || "Failed to connect",
      }));
      toast.error("Failed to connect to support server");
    }
  };

  const handleCreateNewTicket = async (username: string, applicationId: string, applicationSecret: string, topic: string, description: string) => {
    if (!username.trim() || !topic.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!applicationId.trim() || !applicationSecret.trim()) {
      toast.error("Please enter Application ID and Secret");
      return;
    }

    setSupportState((prev) => ({ ...prev, status: "connecting", error: undefined }));

    try {
      const client = new SupportClient({
        serverUrl: serverConfig.url,
        applicationId,
        applicationSecret,
        username,
        deviceId: getDeviceId(),
      });

      clientRef.current = client;

      let newTicketId: string | null = null;

      client.onConnected(async () => {
        console.log("Connected to support server");

        try {
          newTicketId = await client.createSupportTicket(topic, description);
          // console.log("Created ticket:", newTicketId);
          toast.success(`Ticket created: ${newTicketId}`);
        } catch (error) {
          console.error("Error creating ticket:", error);
          toast.error("Failed to create ticket");
          setSupportState((prev) => ({
            ...prev,
            status: "error",
            error: "Failed to create ticket",
          }));
        }
      });

      client.onDisconnected((error) => {
        console.log("Disconnected from support server", error);
        setSupportState((prev) => ({
          ...prev,
          isConnected: false,
          status: "disconnected",
          error: error || "Disconnected from server",
        }));
      });

      client.onSupportMessageReceived((msg: SupportMessageEvent) => {
        const supportMsg: SupportMessage = {
          id: msg.messageId,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
          isOwn: msg.sender === username,
        };
        setSupportState((prev) => ({
          ...prev,
          messages: [...prev.messages, supportMsg],
        }));
      });

      client.onWhisperReceived((msg: WhisperMessageEvent) => {
         const whisperMsg: SupportMessage = {
           id: msg.messageId,
           content: msg.content,
           sender: msg.sender,
           timestamp: msg.timestamp,
           isOwn: msg.sender === username,
         };
         setSupportState((prev) => ({
           ...prev,
           whispers: [...prev.whispers, whisperMsg],
         }));
         toast.info(`Whisper from ${msg.sender}: ${msg.content}`);
      });

      client.onTicketCreated((ticketId) => {
         setSupportState((prev) => ({
           ...prev,
           isConnected: true,
           ticketId,
           status: "connected",
           messages: [],
           whispers: [],
         }));
      });

      client.onError((error) => {
        console.error("Support client error:", error);
        toast.error(`Error: ${error}`);
      });

      await client.connect();
    } catch (err: any) {
      console.error("Connection failed:", err);
      setSupportState((prev) => ({
        ...prev,
        status: "error",
        error: err.message || "Failed to connect",
      }));
      toast.error("Failed to connect to support server");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!clientRef.current?.isConnectedToServer() || !supportState.ticketId) {
      toast.error("Not connected to server");
      return;
    }

    try {
      await clientRef.current.sendSupportMessage(supportState.ticketId, content);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

   const handleLogout = async () => {
     if (clientRef.current) {
       await clientRef.current.disconnect();
       clientRef.current = null;
     }
     setSupportState({
       isConnected: false,
       ticketId: null,
       messages: [],
       whispers: [],
       status: "disconnected",
     });
   };

   // If connected, show support interface
   if (supportState.isConnected && supportState.ticketId) {
     return (
       <SupportInterface
         ticketId={supportState.ticketId}
         username={setUsername}
         messages={supportState.messages}
         whispers={supportState.whispers}
         onSendMessage={handleSendMessage}
         onLogout={handleLogout}
       />
     );
   }

   // Show login options
   return (
     <SupportLoginForm
       onJoinTicket={handleJoinExistingTicket}
       onCreateTicket={handleCreateNewTicket}
       onBack={onBack}
       status={supportState.status}
       error={supportState.error}
     />
   );
 }
