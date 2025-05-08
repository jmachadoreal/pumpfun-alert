import { Box, Text } from "ink";
import React, { memo, useEffect, useState } from "react";
import { Token } from "../types.js";
import {
  createClickableLink,
  generateJupiterSwapUrl,
  generatePumpFunUrl,
  openUrl,
} from "../utils/links.js";

interface TokenItemProps {
  token: Token;
  index: number;
}

interface TokenListProps {
  tokens: Token[];
}

/**
 * Formata o tempo decorrido em segundos de maneira precisa
 * @param timestamp String de data ISO
 * @returns Texto formatado com precisão de segundos
 */
const formatPreciseTimeAgo = (timestamp: string): string => {
  if (!timestamp) return "";

  try {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Menos de 1 segundo
    if (seconds < 1) {
      return `agora`;
    }

    // Menos de 1 minuto
    if (seconds < 60) {
      return `${seconds}s atrás`;
    }

    // Menos de 1 hora (mostra minutos)
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}min atrás`;
    }

    // Para tempos maiores que 1 hora
    return `+1h atrás`;
  } catch (err) {
    console.error("Erro ao formatar data:", err);
    return timestamp;
  }
};

/**
 * Componente que renderiza um item de token individual
 */
const TokenItem: React.FC<TokenItemProps> = memo(({ token, index }) => {
  // Estado para forçar a atualização do componente
  const [, setUpdateCounter] = useState(0);

  // Configurar um temporizador para atualizar o componente a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setUpdateCounter((prev) => prev + 1);
    }, 1000);

    // Limpar o temporizador quando o componente for desmontado
    return () => clearInterval(timer);
  }, []);

  // Gera a URL correta da PumpFun para o token
  const pumpFunUrl = generatePumpFunUrl(token.address);

  // Abre a URL do token no navegador padrão
  const openTokenUrl = async (): Promise<void> => {
    await openUrl(pumpFunUrl);
  };

  // Abre a URL do Jupiter Swap no navegador padrão
  const openJupiterSwap = async (): Promise<void> => {
    const jupiterUrl = generateJupiterSwapUrl(token.address);
    await openUrl(jupiterUrl);
  };

  // Formatando o tempo decorrido
  const timeAgo = formatPreciseTimeAgo(token.timestamp);

  // Cores alternadas para melhor visualização
  const borderColor = index % 2 === 0 ? "magenta" : "blue";

  // Gerar links clicáveis
  const tokenUrlLink = createClickableLink(pumpFunUrl, pumpFunUrl);

  // Gerar link clicável para o Jupiter Swap
  const jupiterSwapUrl = generateJupiterSwapUrl(token.address);
  const jupiterSwapLink = createClickableLink("Swap on JUP", jupiterSwapUrl);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={borderColor}
      padding={1}
      marginBottom={1}
    >
      <Box justifyContent="space-between" width="100%" marginBottom={1}>
        <Text bold color="green">
          {token.name}
        </Text>
        <Text color="gray">{timeAgo}</Text>
      </Box>

      <Box flexDirection="column">
        <Text>
          <Text color="yellow">Address: </Text>
          <Text>{token.address}</Text>
        </Text>

        <Text>
          <Text color="cyan">PumpFun: </Text>
          <Text color="blue" underline>
            {tokenUrlLink}
          </Text>
        </Text>

        <Box marginTop={1} flexDirection="row" alignItems="center">
          <Text backgroundColor="green" color="black" bold>
            {jupiterSwapLink}
          </Text>
          <Text color="gray" dimColor>
            {" "}
            {jupiterSwapUrl}
          </Text>
        </Box>
      </Box>
    </Box>
  );
});

/**
 * Componente que exibe a lista de tokens encontrados
 */
const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  // Exibe mensagem de espera se não houver tokens
  if (!tokens || tokens.length === 0) {
    return (
      <Box borderStyle="round" borderColor="yellow" padding={1}>
        <Text color="yellow" italic>
          Aguardando tokens correspondentes...
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="green">
          🔍 Tokens Encontrados:
        </Text>
      </Box>

      {/* Lista de tokens limitada a 10 para performance */}
      <Box flexDirection="column">
        {tokens.slice(0, 10).map((token, index) => (
          <TokenItem key={token.address} token={token} index={index} />
        ))}

        {tokens.length > 10 && (
          <Box justifyContent="center" marginTop={1}>
            <Text color="gray" italic>
              ... e mais {tokens.length - 10} tokens
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Define displayName para o componente memo
TokenItem.displayName = "TokenItem";

export default TokenList;
