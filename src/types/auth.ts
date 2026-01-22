export interface AuthCredentials {
  username: string;
  applicationId: string;
  applicationSecret: string;
}

export type ConnectionStatus = "Disconnected" | "Connecting" | "Connected" | "Reconnecting" | "Error";

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthCredentials | null;
  status: ConnectionStatus;
  error?: string;
}
