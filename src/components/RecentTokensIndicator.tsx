import { Box, Text } from "ink";
import React, { memo, useEffect, useMemo, useState } from "react";
import { useTokenStore } from "../store/tokenStore.js";

interface RecentTokensIndicatorProps {
  maxItems?: number;
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
 * Componente que mostra os tokens recentemente recebidos, mesmo que não atendam aos critérios
 */
const RecentTokensIndicator: React.FC<RecentTokensIndicatorProps> = memo(
  ({ maxItems = 3 }) => {
    // Estado para forçar a atualização do componente
    const [, setUpdateCounter] = useState(0);

    // Acesso aos tokens recentes via Zustand com seletor estável
    // Usando seletor com referência estável para evitar re-renders desnecessários
    const recentTokens = useTokenStore((state) => state.recentTokens);

    // Memoiza a lista filtrada para evitar recalcular a cada render
    const tokensToDisplay = useMemo(() => {
      return recentTokens.slice(0, maxItems);
    }, [recentTokens, maxItems]);

    // Configurar um temporizador para atualizar o componente a cada segundo
    useEffect(() => {
      const timer = setInterval(() => {
        setUpdateCounter((prev) => prev + 1);
      }, 1000);

      // Limpar o temporizador quando o componente for desmontado
      return () => clearInterval(timer);
    }, []);

    // Se não houver tokens recentes, não renderiza nada
    if (tokensToDisplay.length === 0) {
      return null;
    }

    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="blue"
        padding={1}
        marginBottom={1}
        width="100%"
      >
        <Box marginBottom={1}>
          <Text bold color="blue">
            📡 Tokens Recentes na Rede:
          </Text>
        </Box>

        {tokensToDisplay.map((token, index) => (
          <Box key={token.address} justifyContent="space-between" width="100%">
            <Text color={index === 0 ? "cyan" : "gray"}>{token.name}</Text>
            <Text dimColor>{formatPreciseTimeAgo(token.timestamp)}</Text>
          </Box>
        ))}
      </Box>
    );
  }
);

// Adiciona displayName para facilitar a depuração
RecentTokensIndicator.displayName = "RecentTokensIndicator";

export default RecentTokensIndicator;
