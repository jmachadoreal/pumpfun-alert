import path from "path";
import { ConnectionStatus } from "../types.js";

/**
 * URL do WebSocket da PumpFun
 */
export const WEBSOCKET_URL = "wss://pumpportal.fun/api/data";

/**
 * URLs alternativas para WebSocket
 */
export const WEBSOCKET_ALTERNATE_URLS = ["wss://pumpportal.fun/api/data"];

/**
 * Tipos de status de conexão
 */
export const CONNECTION_STATUS: Record<string, ConnectionStatus> = {
  CONNECTED: "connected",
  CONNECTING: "connecting",
  DISCONNECTED: "disconnected",
  ERROR: "error",
};

/**
 * Estados da aplicação
 */
export const APP_STATUS = {
  WAITING: "waiting",
  CONNECTING: "connecting",
  WATCHING: "watching",
  ERROR: "error",
} as const;

/**
 * Caminho para os assets
 */
export const ASSETS_PATH = path.join(process.cwd(), "src", "assets");

/**
 * Caminho para o arquivo de som do alerta
 */
export const ALERT_SOUND_PATH = path.join(ASSETS_PATH, "alert.mp3");

/**
 * Tempo de espera para reconexão (em ms)
 */
export const RECONNECT_DELAY = 5000; // 5 segundos

/**
 * URLs de base para o site da PumpFun
 */
export const PUMPFUN_URLS = {
  TOKEN: "https://www.pump.fun/token/",
};
