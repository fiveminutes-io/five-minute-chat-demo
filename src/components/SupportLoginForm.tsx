import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SupportLoginFormProps {
  onJoinTicket: (username: string, applicationId: string, applicationSecret: string, ticketId: string) => void;
  onCreateTicket: (username: string, applicationId: string, applicationSecret: string, topic: string, description: string) => void;
  onBack: () => void;
  status: "disconnected" | "connecting" | "connected" | "error";
  error?: string;
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

export const SupportLoginForm = ({ onJoinTicket, onCreateTicket, onBack, status, error }: SupportLoginFormProps) => {
  const [serverConfig] = useState<ServerConfig>(SERVER_PRESETS.Global);
  const [username, setUsername] = useState("");
  const [applicationId, setApplicationId] = useState(serverConfig.appId);
  const [applicationSecret, setApplicationSecret] = useState(serverConfig.appSecret);
  const [existingTicketId, setExistingTicketId] = useState("");
  const [newTicketTopic, setNewTicketTopic] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);

  const handleJoinExistingTicket = () => {
    if (!username.trim() || !existingTicketId.trim()) {
      return;
    }

    if (!applicationId.trim() || !applicationSecret.trim()) {
      return;
    }

    onJoinTicket(username, applicationId, applicationSecret, existingTicketId);
  };

  const handleCreateNewTicket = () => {
    if (!username.trim() || !newTicketTopic.trim() || !newTicketDescription.trim()) {
      return;
    }

    if (!applicationId.trim() || !applicationSecret.trim()) {
      return;
    }

    onCreateTicket(username, applicationId, applicationSecret, newTicketTopic, newTicketDescription);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute top-4 left-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="text-slate-300 border-slate-600 hover:bg-slate-800"
        >
          ← Back
        </Button>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-white text-2xl font-bold mb-2">Support Tickets</h2>
          <p className="text-slate-400 mb-6">Manage your support requests</p>

          <div className="space-y-3 mb-6">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <Input
              placeholder="Application ID"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <Input
              placeholder="Application Secret"
              type="password"
              value={applicationSecret}
              onChange={(e) => setApplicationSecret(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          {!showNewTicket ? (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Join Existing Ticket
                </label>
                <Input
                  placeholder="Ticket ID"
                  value={existingTicketId}
                  onChange={(e) => setExistingTicketId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
                <Button
                  onClick={handleJoinExistingTicket}
                  disabled={status === "connecting"}
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                >
                  {status === "connecting" ? "Connecting..." : "Resume Ticket"}
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              <Button
                onClick={() => setShowNewTicket(true)}
                variant="outline"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Create New Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Topic
                </label>
                <Input
                  placeholder="Topic"
                  value={newTicketTopic}
                  onChange={(e) => setNewTicketTopic(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your issue..."
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateNewTicket}
                  disabled={status === "connecting"}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {status === "connecting" ? "Creating..." : "Create"}
                </Button>
                <Button
                  onClick={() => setShowNewTicket(false)}
                  variant="outline"
                  className="flex-1 text-slate-300 border-slate-600 hover:bg-slate-700"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
