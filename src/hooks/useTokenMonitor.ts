import { useCallback } from "react";
import { useTokenStore } from "../store/tokenStore.js";
import { Token, TokenMonitorOptions } from "../types.js";

/**
 * Hook para monitorar tokens baseado em padrões de busca
 */
export const useTokenMonitor = ({
  onTokenMatched,
}: TokenMonitorOptions = {}) => {
  // Acesso à store Zustand para gerenciar estado compartilhado
  const {
    searchTerms,
    isWatching,
    monitorAll,
    tokens,
    foundTokens,
    addToken,
    addFoundToken,
    clearFoundTokens: clearFoundTokensStore,
    prepareWatchPatterns: prepareWatchPatternsStore,
  } = useTokenStore();

  // Limpa os tokens encontrados
  const clearFoundTokens = useCallback(() => {
    clearFoundTokensStore();
  }, [clearFoundTokensStore]);

  // Prepara os padrões de busca a partir da string de entrada
  const prepareWatchPatterns = useCallback(
    (input: string) => {
      return prepareWatchPatternsStore(input);
    },
    [prepareWatchPatternsStore]
  );

  // Função auxiliar para adicionar à lista de tokens encontrados
  const addToFoundTokens = useCallback(
    (token: Token) => {
      addFoundToken(token);

      // Notifica o callback
      onTokenMatched?.(token);
    },
    [addFoundToken, onTokenMatched]
  );

  // Processa um novo token recebido
  const processToken = useCallback(
    (token: Token) => {
      // Adiciona o token à lista principal
      addToken(token);

      // Obtenha diretamente os valores atuais do store
      // Isso evita problemas de closure com valores desatualizados
      const state = useTokenStore.getState();
      const currentMonitorAll = state.monitorAll;
      const currentSearchTerms = state.searchTerms;

      // Se estiver monitorando todos, sempre marca como matched
      if (currentMonitorAll) {
        addToFoundTokens(token);
        return;
      }

      // Verificação EXTREMAMENTE simplificada para garantir funcionamento
      const tokenLower = token.name.toLowerCase();

      // Verificamos cada termo individualmente
      for (const term of currentSearchTerms) {
        // Pula termos vazios
        if (!term) continue;

        const termLower = term.toLowerCase();

        // Verificação direta
        if (tokenLower.includes(termLower)) {
          addToFoundTokens(token);
          return;
        }

        // Verificação por palavras individuais
        const tokenWords = tokenLower.split(/[\s_\-\.]+/);

        for (const word of tokenWords) {
          if (word.includes(termLower)) {
            addToFoundTokens(token);
            return;
          }
        }
      }

      // Verificação de token que inclui a palavra "vamp" (caso especial)
      if (tokenLower.includes("vamp")) {
        for (const term of currentSearchTerms) {
          if (term.toLowerCase() === "vamp") {
            addToFoundTokens(token);
            return;
          }
        }
      }
    },
    [addToFoundTokens, addToken]
  );

  // Contagem de tokens encontrados
  const foundCount = foundTokens.length;

  return {
    tokens,
    foundTokens,
    foundCount,
    isWatching,
    prepareWatchPatterns,
    processToken,
    clearFoundTokens,
  };
};

export default useTokenMonitor;
