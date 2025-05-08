/**
 * Funções utilitárias para formatação
 */

/**
 * Trunca um texto para não exceder o comprimento máximo
 * @param text Texto a ser truncado
 * @param maxLength Comprimento máximo
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number = 20): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Formata um timestamp para exibição "há X tempo"
 * @param timestamp String de data ISO
 * @returns Texto formatado
 */
export const formatTimeAgo = (timestamp: string): string => {
  if (!timestamp) return "";

  try {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Menos de 1 minuto
    if (seconds < 60) {
      return `agora`;
    }

    // Menos de 1 hora
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m atrás`;
    }

    // Menos de 1 dia
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h atrás`;
    }

    // Menos de 30 dias
    if (seconds < 2592000) {
      const days = Math.floor(seconds / 86400);
      return `${days}d atrás`;
    }

    // Mais de 30 dias
    const months = Math.floor(seconds / 2592000);
    return `${months}m atrás`;
  } catch (err) {
    console.error("Erro ao formatar data:", err);
    return timestamp;
  }
};

/**
 * Formata o endereço do token para exibição
 * @param address Endereço do token
 * @returns Endereço formatado
 */
export const formatAddress = (address: string): string => {
  if (!address) return "";
  if (address.length <= 13) return address;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 6
  )}`;
};

/**
 * Normaliza um texto removendo acentos e caracteres especiais
 * @param text Texto a ser normalizado
 * @returns Texto normalizado
 */
export const normalizeText = (text: string): string => {
  if (!text) return "";

  // Converte para minúsculas
  const lowerCase = text.toLowerCase();

  // Remove acentos
  const withoutAccents = lowerCase
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Substitui caracteres comuns que podem aparecer em diferentes foromas
  const standardized = withoutAccents
    .replace(/['']/g, "") // Remove aspas simples
    .replace(/[""]/g, "") // Remove aspas duplas
    .replace(/[-–—]/g, " ") // Substitui hífens por espaços
    .replace(/[_\.]/g, " ") // Substitui underscores e pontos por espaços
    .replace(/\s+/g, " "); // Normaliza espaços múltiplos

  // Remove caracteres especiais mantendo letras, números e espaços
  const normalized = standardized.replace(/[^a-z0-9\s]/g, "").trim();

  return normalized;
};
