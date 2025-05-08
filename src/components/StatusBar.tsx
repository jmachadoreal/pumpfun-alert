import { Box, Text } from "ink";
import React from "react";
import { ConnectionStatus, Token } from "../types.js";

interface StatusBarProps {
  connectionStatus: ConnectionStatus;
  tokens: Token[];
  foundCount: number;
}

/**
 * Componente que exibe a barra de status da aplicação
 */
const StatusBar: React.FC<StatusBarProps> = ({
  connectionStatus,
  tokens,
  foundCount,
}) => {
  /**
   * Retorna a cor apropriada para o status da conexão
   */
  const getConnectionStatusColor = (): string => {
    switch (connectionStatus) {
      case "connected":
        return "green";
      case "connecting":
        return "yellow";
      case "disconnected":
      case "error":
        return "red";
      default:
        return "white";
    }
  };

  /**
   * Retorna o texto descritivo para o status da conexão
   */
  const getConnectionStatusText = (): string => {
    switch (connectionStatus) {
      case "connected":
        return "Conectado";
      case "connecting":
        return "Conectando...";
      case "disconnected":
        return "Desconectado";
      case "error":
        return "Erro de Conexão";
      default:
        return "Desconhecido";
    }
  };

  /**
   * Formata a lista de tokens para exibição
   */
  const formatTokens = (): string => {
    if (!tokens || tokens.length === 0) {
      return "Nenhum";
    }

    // Se a lista for muito grande, trunca e adiciona '...'
    const maxDisplay = 2;
    const tokenNames = tokens.map((token) => token.name);

    if (tokenNames.length > maxDisplay) {
      // Limita cada nome a 15 caracteres no máximo
      const truncatedNames = tokenNames
        .slice(0, maxDisplay)
        .map((name) =>
          name.length > 15 ? name.substring(0, 12) + "..." : name
        );

      return (
        truncatedNames.join(", ") +
        ` e ${tokenNames.length - maxDisplay} mais...`
      );
    }

    return tokenNames.join(", ");
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
        <Box flexDirection="column" width="100%">
          <Box justifyContent="space-between" width="100%" marginBottom={1}>
            <Text bold>Status:</Text>
            <Text color={getConnectionStatusColor()}>
              {getConnectionStatusText()}
            </Text>
          </Box>

          <Box justifyContent="space-between" width="100%" marginBottom={1}>
            <Text bold>Monitorando:</Text>
            <Text color="yellow">{formatTokens()}</Text>
          </Box>

          <Box justifyContent="space-between" width="100%">
            <Text bold>Tokens Encontrados:</Text>
            <Text color="green">{foundCount}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StatusBar;
