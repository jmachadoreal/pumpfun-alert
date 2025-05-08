/**
 * Utilitários para gerar links clicáveis no terminal
 */
import open from "open";
import terminalLink from "terminal-link";

/**
 * Cria um link clicável no terminal
 * @param text Texto a ser exibido
 * @param url URL de destino
 * @param fallbackLabel Texto alternativo caso o terminal não suporte links (opcional)
 * @returns Link formatado
 */
export const createClickableLink = (
  text: string,
  url: string,
  fallbackLabel: string = ""
): string => {
  const isSupported = terminalLink.isSupported;

  if (isSupported) {
    return terminalLink(text, url);
  } else {
    // Se não forneceu fallback, usa apenas o texto
    return fallbackLabel ? `${text} (${fallbackLabel})` : text;
  }
};

/**
 * Gera a URL para visualizar o token na plataforma PumpFun
 * @param tokenAddress Endereço do token
 * @returns URL completa para o token na PumpFun
 */
export const generatePumpFunUrl = (tokenAddress: string): string => {
  // Base URL do PumpFun
  const baseUrl = "https://pump.fun/coin";

  // Construir a URL para o token
  const tokenUrl = `${baseUrl}/${tokenAddress}`;

  return tokenUrl;
};

/**
 * Gera a URL para o Swap no Jupiter Aggregator
 * @param tokenAddress Endereço do token
 * @returns URL completa para o Jupiter
 */
export const generateJupiterSwapUrl = (tokenAddress: string): string => {
  // Base URL do Jupiter
  const baseUrl = "https://jup.ag/swap";

  // Construir a URL: vai de SOL para o token especificado
  const swapUrl = `${baseUrl}/SOL-${tokenAddress}`;

  return swapUrl;
};

/**
 * Abre um URL no navegador
 * @param url URL a ser aberta
 */
export const openUrl = async (url: string): Promise<void> => {
  try {
    await open(url);
  } catch (error) {
    console.error("Erro ao abrir URL:", error);
  }
};
