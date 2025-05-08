/**
 * Tipos para o PumpFun Alert
 */

// Status de conexão do WebSocket
export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

// Status da aplicação
export type AppStatus = "waiting" | "connecting" | "watching" | "error";

// Modelo de Token
export interface Token {
  name: string;
  address: string;
  timestamp: string;
  url: string;
  symbol?: string;
  marketCapSol?: number;
  solAmount?: number;
  initialBuy?: number;
}

// Opções de configuração do WebSocket
export interface WebSocketOptions {
  onTokenReceived?: (token: Token) => void;
  onConnectionStatusChange?: (
    status: ConnectionStatus,
    error?: string | null
  ) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

// Opções de notificação
export interface NotificationOptions {
  soundPath?: string;
  enableSound?: boolean;
  enableNotifications?: boolean;
}

// Opções para alertas de usuário
export interface AlertOptions {
  title?: string;
  message?: string;
  sound?: boolean;
  wait?: boolean;
  [key: string]: any;
}

// Opções para monitoramento de tokens
export interface TokenMonitorOptions {
  onTokenMatched?: (token: Token) => void;
}

// Extensões globais
declare global {
  interface Window {
    __addRecentToken?: (token: Token) => void;
  }
}
