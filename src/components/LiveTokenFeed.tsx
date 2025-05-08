import { Box, Text, useInput } from "ink";
import React, { useCallback, useEffect, useState } from "react";
import { Token } from "../types.js";
import {
  createClickableLink,
  generateJupiterSwapUrl,
  generatePumpFunUrl,
  openUrl,
} from "../utils/links.js";

interface LiveTokenFeedProps {
  maxTokens?: number;
  onClose?: () => void;
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
 * Componente que mostra uma janela dedicada apenas para lançamentos em tempo real de tokens
 */
const LiveTokenFeed: React.FC<LiveTokenFeedProps> = ({
  maxTokens = 20,
  onClose,
}) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  // Estado para forçar a atualização do componente
  const [, setUpdateCounter] = useState(0);

  // Função para abrir URL do token selecionado
  const openTokenUrl = useCallback((token: Token) => {
    const pumpFunUrl = generatePumpFunUrl(token.address);
    openUrl(pumpFunUrl);
  }, []);

  // Função para abrir Jupiter Swap para o token selecionado
  const openJupiterSwap = useCallback((token: Token) => {
    const jupiterUrl = generateJupiterSwapUrl(token.address);
    openUrl(jupiterUrl);
  }, []);

  // Ouve teclas de controle
  useInput((input, key) => {
    if (input === "q" || key.escape) {
      onClose?.();
      return;
    }

    // Navegação com teclas de seta
    if (tokens.length > 0) {
      if (key.upArrow) {
        setSelectedIndex((prev) => (prev <= 0 ? tokens.length - 1 : prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => (prev >= tokens.length - 1 ? 0 : prev + 1));
      } else if (input === "o" && selectedIndex >= 0) {
        // 'o' para abrir URL
        openTokenUrl(tokens[selectedIndex]);
      } else if (input === "s" && selectedIndex >= 0) {
        // 's' para swap
        openJupiterSwap(tokens[selectedIndex]);
      }
    }
  });

  // Configurar um temporizador para atualizar o componente a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setUpdateCounter((prev) => prev + 1);
    }, 1000);

    // Limpar o temporizador quando o componente for desmontado
    return () => clearInterval(timer);
  }, []);

  // Conecta ao store global para receber tokens
  useEffect(() => {
    // @ts-ignore - Acessa o armazenamento global
    const tokenStore = global.__tokenStore;

    if (!tokenStore) {
      return;
    }

    // Função para atualizar os tokens
    const updateTokens = (newTokens: Token[]) => {
      setTokens(newTokens.slice(0, maxTokens));
    };

    // Adiciona o listener
    tokenStore.subscribers.push(updateTokens);

    // Inicializa com tokens existentes
    updateTokens(tokenStore.tokens);

    // Cleanup
    return () => {
      if (tokenStore) {
        const index = tokenStore.subscribers.indexOf(updateTokens);
        if (index !== -1) {
          tokenStore.subscribers.splice(index, 1);
        }
      }
    };
  }, [maxTokens]);

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="green"
      width="100%"
      height={Math.min(tokens.length + 7, 27)}
      padding={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="green">
          📊 Lançamentos de Tokens em Tempo Real
        </Text>
        <Text color="gray">(Pressione ESC ou Q para fechar)</Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        {tokens.length === 0 ? (
          <Box justifyContent="center" height={5}>
            <Text italic color="gray">
              Aguardando lançamentos de tokens...
            </Text>
          </Box>
        ) : (
          tokens.map((token, index) => {
            // Gerar URL da PumpFun
            const pumpFunUrl = generatePumpFunUrl(token.address);

            // Gerar link clicável para o Jupiter Swap
            const jupiterSwapUrl = generateJupiterSwapUrl(token.address);
            const jupiterSwapLink = createClickableLink("Swap", jupiterSwapUrl);

            // Verificar se o item está selecionado
            const isSelected = index === selectedIndex;

            return (
              <Box
                key={token.address}
                flexDirection="row"
                width="100%"
                marginY={1}
                borderColor={isSelected ? "blue" : undefined}
                borderStyle={isSelected ? "single" : undefined}
              >
                <Box width="50%" paddingRight={1}>
                  <Text
                    color={
                      isSelected
                        ? "blue"
                        : index === 0
                        ? "green"
                        : index < 3
                        ? "cyan"
                        : "white"
                    }
                    bold={index === 0 || isSelected}
                    underline={isSelected}
                  >
                    {token.name}
                  </Text>
                </Box>

                <Box width="25%" justifyContent="center">
                  <Text backgroundColor="green" color="black" bold>
                    {jupiterSwapLink}
                  </Text>
                </Box>

                <Box width="25%" justifyContent="flex-end">
                  <Text dimColor={!isSelected}>
                    {formatPreciseTimeAgo(token.timestamp)}
                  </Text>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Box marginTop={1} justifyContent="center">
        <Text italic color="gray">
          Total: {tokens.length} tokens
        </Text>
      </Box>

      {tokens.length > 0 && selectedIndex >= 0 && (
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text>
            <Text>Token: </Text>
            <Text color="blue" underline>
              {generatePumpFunUrl(tokens[selectedIndex].address)}
            </Text>
          </Text>
          <Text>
            <Text>Swap: </Text>
            <Text color="green" underline>
              {generateJupiterSwapUrl(tokens[selectedIndex].address)}
            </Text>
          </Text>
        </Box>
      )}

      {tokens.length > 0 && (
        <Box marginTop={1} justifyContent="center">
          <Text>
            Use as{" "}
            <Text color="yellow" bold>
              setas
            </Text>{" "}
            para navegar,{" "}
            <Text color="yellow" bold>
              O
            </Text>{" "}
            para abrir URL e{" "}
            <Text color="yellow" bold>
              S
            </Text>{" "}
            para swap
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default LiveTokenFeed;
