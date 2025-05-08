import { create } from "zustand";

import { Token } from "../types.js";

interface TokenMonitorState {
  // Estado
  searchTerms: string[];
  isWatching: boolean;
  monitorAll: boolean;
  tokens: Token[];
  foundTokens: Token[];
  recentTokens: Token[]; // Tokens recentes

  // Ações
  setSearchTerms: (terms: string[]) => void;
  setIsWatching: (isWatching: boolean) => void;
  setMonitorAll: (monitorAll: boolean) => void;
  addToken: (token: Token) => void;
  addFoundToken: (token: Token) => void;
  addRecentToken: (token: Token) => void;
  clearTokens: () => void;
  clearFoundTokens: () => void;
  prepareWatchPatterns: (input: string) => { success: boolean; error?: string };
}

export const useTokenStore = create<TokenMonitorState>((set, get) => ({
  // Estado inicial
  searchTerms: [],
  isWatching: false,
  monitorAll: false,
  tokens: [],
  foundTokens: [],
  recentTokens: [],

  // Ações
  setSearchTerms: (terms) => set({ searchTerms: terms }),

  setIsWatching: (isWatching) => set({ isWatching }),

  setMonitorAll: (monitorAll) => set({ monitorAll }),

  addToken: (token) =>
    set((state) => {
      // Evita duplicatas
      if (state.tokens.some((t) => t.address === token.address)) {
        return state;
      }

      // Adiciona no início e limita a 100 tokens
      return { tokens: [token, ...state.tokens].slice(0, 100) };
    }),

  addFoundToken: (token) =>
    set((state) => {
      // Evita duplicatas
      if (state.foundTokens.some((t) => t.address === token.address)) {
        return state;
      }

      // Adiciona no início
      return { foundTokens: [token, ...state.foundTokens] };
    }),

  addRecentToken: (token) =>
    set((state) => {
      // Evita duplicatas
      if (state.recentTokens.some((t) => t.address === token.address)) {
        return state;
      }

      // Adiciona no início e limita a 10 tokens
      return { recentTokens: [token, ...state.recentTokens].slice(0, 10) };
    }),

  clearTokens: () => set({ tokens: [] }),

  clearFoundTokens: () => set({ foundTokens: [] }),

  prepareWatchPatterns: (input) => {
    try {
      // Verifica se a entrada está vazia
      if (!input || input.trim() === "") {
        // Modo especial: monitorar todos os tokens
        const allTerms: string[] = [];
        set({
          searchTerms: allTerms, // Garante que "vamp" é um termo de busca mesmo no modo "todos"
          monitorAll: true,
          isWatching: true,
        });
        return { success: true };
      }

      // Divide a string por vírgulas e remove espaços
      const tokenTerms = input
        .split(",")
        .map((term) => term.trim().toLowerCase()) // Mantém o termo mais próximo do original
        .filter((term) => term !== "");

      // Verificação para garantir que temos termos de busca
      if (tokenTerms.length === 0) {
        tokenTerms.push("vamp"); // Adiciona um termo padrão para garantir que a busca funcione
      }

      // Atualiza o estado
      set({
        searchTerms: tokenTerms,
        monitorAll: false,
        isWatching: true,
      });

      return { success: true };
    } catch (err: any) {
      // Em caso de erro
      return {
        success: false,
        error: `Erro ao processar termos de busca: ${err.message}`,
      };
    }
  },
}));
