import { Box, Text, useApp, useInput } from "ink";
import React, { useCallback, useEffect, useState } from "react";

import {
  Header,
  InputForm,
  LiveTokenFeed,
  RecentTokensIndicator,
  StatusBar,
  TokenList,
} from "./components/index.js";

import {
  useNotifications,
  useTokenMonitor,
  useWebSocket,
} from "./hooks/index.js";
import { useTokenStore } from "./store/tokenStore.js";
import { AppStatus, Token } from "./types.js";
import {
  ALERT_SOUND_PATH,
  APP_STATUS,
  RECONNECT_DELAY,
} from "./utils/index.js";

/**
 * Componente principal da aplicação
 */
const App: React.FC = React.memo(() => {
  const { exit } = useApp();
  const [status, setStatus] = useState<AppStatus>(APP_STATUS.WAITING);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [showLiveFeed, setShowLiveFeed] = useState<boolean>(false);

  // Acesso à store Zustand
  const { prepareWatchPatterns, isWatching } = useTokenStore();

  // Hook para gerenciar notificações
  const { alertUser } = useNotifications({
    soundPath: ALERT_SOUND_PATH,
    enableSound: true,
    enableNotifications: true,
  });

  // Callback quando um token corresponde aos critérios de busca
  const handleTokenMatch = useCallback(
    (token: Token) => {
      alertUser(token, {
        title: "🚨 PumpFun Alert! 🚨",
        message: `Token encontrado: ${token.name}`,
      });
    },
    [alertUser]
  );

  // Hook para monitorar tokens
  const { tokens, foundTokens, foundCount, processToken, clearFoundTokens } =
    useTokenMonitor({
      onTokenMatched: handleTokenMatch,
    });

  // Callback para receber novos tokens da API
  const handleTokenReceived = useCallback(
    (token: Token) => {
      processToken(token);
    },
    [processToken]
  );

  // Callback para mudanças no status da conexão
  const handleConnectionStatusChange = useCallback(
    (connectionStatus: string, errorMessage?: string | null) => {
      if (connectionStatus === "error") {
        setStatus(APP_STATUS.ERROR);
        setError(errorMessage ?? "Erro de conexão desconhecido");
      } else if (connectionStatus === "connected") {
        setStatus(APP_STATUS.WATCHING);
        // Limpa qualquer erro anterior quando conecta com sucesso
        setError(null);
      } else if (connectionStatus === "connecting") {
        setStatus(APP_STATUS.CONNECTING);
      }
    },
    []
  );

  // Hook para gerenciar a conexão WebSocket
  const { connect, disconnect, connectionStatus } = useWebSocket({
    onTokenReceived: handleTokenReceived,
    onConnectionStatusChange: handleConnectionStatusChange,
    autoReconnect: isWatching,
    reconnectDelay: RECONNECT_DELAY,
  });

  // Limpa o erro quando o input muda
  useEffect(() => {
    if (inputValue.trim() !== "" && error) {
      setError(null);
    }
  }, [inputValue, error]);

  // Gerencia teclas de atalho usando useInput do Ink
  useInput((input, key) => {
    // Só ativa quando estiver no modo de monitoramento
    if (status === APP_STATUS.WATCHING) {
      // Tecla F para alternar a visualização do feed em tempo real
      if (input === "f" || input === "F") {
        setShowLiveFeed((prev) => !prev);
      }
    }

    // Tecla R para reconectar manualmente quando houver erro
    if ((input === "r" || input === "R") && status === APP_STATUS.ERROR) {
      setStatus(APP_STATUS.CONNECTING);
      connect();
    }
  });

  // Função para iniciar o monitoramento
  const startWatching = useCallback(
    (input: string) => {
      // Salva o valor do input para verificações subsequentes
      setInputValue(input);

      // Verifica se a entrada é válida antes de continuar
      if (!input || input.trim() === "") {
        setError("Por favor, insira pelo menos um token para monitorar");
        return;
      }

      const result = prepareWatchPatterns(input);

      if (result.success) {
        // Limpa qualquer erro anterior e conecta
        setError(null);
        connect();
      } else {
        // Exibe o erro retornado pela função prepareWatchPatterns
        setError(result.error ?? "Erro desconhecido ao preparar padrões");
      }
    },
    [connect, prepareWatchPatterns]
  );

  // Função para monitorar todos os tokens
  const monitorAllTokens = useCallback(() => {
    // Define um padrão que pegue tudo (usando a string vazia que mostrará todos os tokens)
    // Usa um valor especial para o inputValue para indicar que estamos no modo "todos os tokens"
    setInputValue("*TODOS*");

    // Prepara um padrão que corresponda a todos os tokens
    // Vamos garantir que "vamp" esteja incluído para detectar tokens com "vamp"
    const result = prepareWatchPatterns("");

    // Limpa qualquer erro e conecta
    setError(null);
    connect();

    // Mostra imediatamente o feed em tempo real
    setShowLiveFeed(true);
  }, [connect, prepareWatchPatterns]);

  // Handler para fechar o feed em tempo real
  const handleCloseLiveFeed = useCallback(() => {
    setShowLiveFeed(false);
  }, []);

  // Renderiza o feed em tempo real quando solicitado
  if (showLiveFeed && status === APP_STATUS.WATCHING) {
    return <LiveTokenFeed maxTokens={30} onClose={handleCloseLiveFeed} />;
  }

  return (
    <Box flexDirection="column" padding={1} width="100%">
      <Header />

      {status === APP_STATUS.WAITING && (
        <InputForm
          onSubmit={startWatching}
          onMonitorAll={monitorAllTokens}
          error={error}
        />
      )}

      {status === APP_STATUS.CONNECTING && (
        <Box justifyContent="center" padding={1}>
          <Text color="yellow">Conectando ao servidor da PumpFun...</Text>
        </Box>
      )}

      {status === APP_STATUS.ERROR && (
        <Box flexDirection="column" padding={1}>
          <Text color="red" bold>
            Erro de Conexão:
          </Text>
          <Text color="red">{error}</Text>

          <Box marginY={1}>
            <Text>
              A conexão com o servidor da PumpFun falhou. Isto pode ocorrer
              devido a:
            </Text>
          </Box>

          <Box flexDirection="column" marginLeft={2} marginBottom={1}>
            <Text>• Problemas temporários no servidor</Text>
            <Text>• Problemas com sua conexão de internet</Text>
            <Text>• Alterações na API do serviço</Text>
          </Box>

          <Box marginY={1}>
            <Text>O aplicativo tentará reconectar automaticamente.</Text>
          </Box>

          <Box marginTop={1} justifyContent="space-between">
            <Box>
              <Text>Pressione </Text>
              <Text color="yellow" bold>
                R
              </Text>
              <Text> para tentar reconectar manualmente</Text>
            </Box>

            <Box>
              <Text>Pressione </Text>
              <Text color="green" bold>
                CTRL+C
              </Text>
              <Text> para sair</Text>
            </Box>
          </Box>
        </Box>
      )}

      {status === APP_STATUS.WATCHING && (
        <>
          <StatusBar
            connectionStatus={connectionStatus}
            tokens={tokens}
            foundCount={foundCount}
          />

          {/* Indicador de tokens recentes */}
          <RecentTokensIndicator maxItems={5} />

          <TokenList tokens={foundTokens} />

          <Box marginTop={1} justifyContent="center">
            <Text>
              Pressione{" "}
              <Text color="yellow" bold>
                F
              </Text>{" "}
              para mostrar a janela de
              <Text color="green" bold>
                {" "}
                lançamentos em tempo real
              </Text>
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
});

// Adiciona displayName para facilitar a depuração
App.displayName = "PumpFunAlert";

export default App;
