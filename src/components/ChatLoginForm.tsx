import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCredentials, ConnectionStatus } from "@/types/auth";
import { MessageSquare, KeyRound, User, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChatLoginFormProps {
  onLogin: (credentials: AuthCredentials, serverUrl: string) => void;
  status: ConnectionStatus;
  error?: string;
}

const SERVER_OPTIONS = [
  { name: "Prod", url: "https://signalr.fiveminutes.cloud/signalr" },
];

export const ChatLoginForm = ({ onLogin, status, error }: ChatLoginFormProps) => {
  const [username, setUsername] = useState("");
  const [applicationId, setApplicationId] = useState("Demo01");
  const [applicationSecret, setApplicationSecret] = useState("DemoSecret");
  const [serverUrl, setServerUrl] = useState(SERVER_OPTIONS[0].url);

  const isLoading = status === "Connecting" || status === "Reconnecting";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      username,
      applicationId,
      applicationSecret,
    }, serverUrl);
  };

  const isFormValid = username.trim() && applicationId.trim() && applicationSecret.trim() && serverUrl.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">fiveminutes.io</h1>
          <p className="text-muted-foreground">Chat Demo</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-background/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Application ID Field */}
            <div className="space-y-2">
              <Label htmlFor="applicationId" className="text-sm font-medium text-foreground">
                Application ID
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="applicationId"
                  type="text"
                  placeholder="Enter your Application ID"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="pl-10 font-mono text-sm"
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Application Secret Field */}
            <div className="space-y-2">
              <Label htmlFor="applicationSecret" className="text-sm font-medium text-foreground">
                Application Secret
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="applicationSecret"
                  type="password"
                  placeholder="Enter your Application Secret"
                  value={applicationSecret}
                  onChange={(e) => setApplicationSecret(e.target.value)}
                  className="pl-10 font-mono text-sm"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            

            {/* Login Button */}
            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full mt-6"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure connection • Your data is encrypted
        </p>
      </div>
    </div>
  );
};
