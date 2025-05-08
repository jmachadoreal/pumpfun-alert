import { useCallback, useEffect, useRef, useState } from "react";
import * as WebSocketLib from "ws";
import { useTokenStore } from "../store/tokenStore.js";
import { ConnectionStatus, Token, WebSocketOptions } from "../types.js";
import { WEBSOCKET_URL } from "../utils/constants.js";

// Tipo simplificado para o websocket
type WebSocketInstance = WebSocketLib.WebSocket & {
  on(event: string, listener: (...args: any[]) => void): any;
  removeAllListeners(): any;
};

// Acesso à interface do armazenamento global de tokens
interface TokenStore {
  addToken: (token: Token) => void;
}

// @ts-ignore - Acesso ao armazenamento global de tokens
const globalTokenStore = global.__tokenStore as TokenStore | undefined;

/**
 * Hook para gerenciar a conexão WebSocket com a API da PumpFun
 */
export const useWebSocket = ({
  onTokenReceived,
  onConnectionStatusChange,
  autoReconnect = true,
  reconnectDelay = 5000,
}: WebSocketOptions) => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocketInstance | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 10;

  // Acesso à store Zustand
  const { addRecentToken } = useTokenStore();

  // Atualiza o status de conexão e notifica o callback
  const updateConnectionStatus = useCallback(
    (status: ConnectionStatus, errorMessage: string | null = null) => {
      setConnectionStatus(status);
      setError(errorMessage);
      onConnectionStatusChange?.(status, errorMessage);
    },
    [onConnectionStatusChange]
  );

  // Função para limpar timers e referências
  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current = null;
    }
  }, []);

  // Calcula o tempo de delay com backoff exponencial
  const getBackoffDelay = useCallback(() => {
    // Começa com o delay base e vai aumentando até um máximo
    const maxDelay = 30000; // 30 segundos
    const baseDelay = reconnectDelay;
    const attempt = reconnectAttemptsRef.current;

    // Backoff exponencial com jitter (variação aleatória)
    const exponentialDelay = Math.min(
      maxDelay,
      baseDelay * Math.pow(1.5, attempt) + Math.random() * 1000
    );

    return Math.floor(exponentialDelay);
  }, [reconnectDelay]);

  // Função para conectar ao WebSocket
  const connect = useCallback(() => {
    // Limpa qualquer conexão anterior
    cleanup();

    updateConnectionStatus("connecting");
    shouldReconnectRef.current = autoReconnect;

    try {
      // Criando instância do WebSocket com tipagem correta
      const socket = new WebSocketLib.WebSocket(
        WEBSOCKET_URL
      ) as WebSocketInstance;
      socketRef.current = socket;

      socket.on("open", () => {
        // Resetar contador de tentativas ao conectar com sucesso
        reconnectAttemptsRef.current = 0;
        updateConnectionStatus("connected");

        // Inscrever-se para eventos de novos tokens
        const payload = {
          method: "subscribeNewToken",
        };
        socket.send(JSON.stringify(payload));
      });

      socket.on("message", (data) => {
        try {
          // Parsear mensagem recebida
          const rawData = data.toString();
          let parsedData;

          try {
            parsedData = JSON.parse(rawData);
          } catch (parseErr) {
            return;
          }

          // Ignorar se tiver a chave "message" no corpo
          if (parsedData.message) {
            return;
          }

          // Verificar se temos o padrão de dados de token lançado
          if (parsedData.name && parsedData.txType === "create") {
            // Criar objeto Token a partir dos dados
            const token: Token = {
              name: parsedData.name,
              address: parsedData.mint || parsedData.signature,
              timestamp: new Date().toISOString(),
              url: `https://www.pump.fun/token/${parsedData.mint || ""}`,
              // Campos adicionais do formato enviado
              symbol: parsedData.symbol || "",
              marketCapSol: parsedData.marketCapSol,
              solAmount: parsedData.solAmount,
              initialBuy: parsedData.initialBuy,
            };

            // Adiciona o token à store Zustand usando setTimeout para quebrar o ciclo de atualização
            // Isso evita o problema de Maximum update depth exceeded
            setTimeout(() => {
              addRecentToken(token);
            }, 0);

            // Notificar o callback
            onTokenReceived?.(token);
            return;
          }

          // Processa padrão "type": "newToken" (formato original)
          if (parsedData.type === "newToken") {
            const token: Token = {
              name: parsedData.name,
              address: parsedData.ca,
              timestamp: parsedData.timestamp || new Date().toISOString(),
              url: `https://www.pump.fun/token/${parsedData.ca}`,
              // Inclui o símbolo, se disponível
              symbol: parsedData.symbol || "",
            };

            // Adiciona o token ao armazenamento global de tokens
            if (globalTokenStore) {
              globalTokenStore.addToken(token);
            }

            // Notificar o callback
            onTokenReceived?.(token);
          }
        } catch (err) {
          console.error("Erro ao processar mensagem:", err);
        }
      });

      socket.on("error", (err) => {
        const errorMessage = `Erro na conexão: ${err.message}`;
        updateConnectionStatus("error", errorMessage);
      });

      socket.on("close", (code, reason) => {
        updateConnectionStatus("disconnected");

        // Reconectar se necessário
        if (shouldReconnectRef.current) {
          reconnectAttemptsRef.current++;

          // Verificar se atingiu o limite de tentativas
          if (reconnectAttemptsRef.current > maxReconnectAttempts) {
            updateConnectionStatus(
              "error",
              "Falha após várias tentativas de reconexão. Por favor, reinicie o aplicativo."
            );
            return;
          }

          const nextDelay = getBackoffDelay();

          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, nextDelay);
        }
      });
    } catch (err: any) {
      updateConnectionStatus("error", `Erro ao criar conexão: ${err.message}`);

      // Tenta reconectar em caso de erro na criação do socket
      if (shouldReconnectRef.current) {
        reconnectAttemptsRef.current++;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, getBackoffDelay());
      }
    }
  }, [
    autoReconnect,
    cleanup,
    getBackoffDelay,
    onTokenReceived,
    updateConnectionStatus,
    addRecentToken,
  ]);

  // Função para desconectar do WebSocket
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (socketRef.current) {
      socketRef.current.terminate();
      socketRef.current = null;
    }

    cleanup();
    updateConnectionStatus("disconnected");
  }, [cleanup, updateConnectionStatus]);

  // Função para inscrever em eventos (ex: subscribeTrades, etc.)
  const subscribe = useCallback(
    (method: string, keys: string[] = []) => {
      if (socketRef.current && connectionStatus === "connected") {
        const payload: { method: string; keys?: string[] } = { method };

        if (keys.length > 0) {
          payload.keys = keys;
        }

        socketRef.current.send(JSON.stringify(payload));
        return true;
      }
      return false;
    },
    [connectionStatus]
  );

  // Limpar recursos quando o componente for desmontado
  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    connect,
    disconnect,
    subscribe,
    connectionStatus,
    error,
    isConnected: connectionStatus === "connected",
    reconnectAttempts: reconnectAttemptsRef.current,
  };
};

export default useWebSocket;
