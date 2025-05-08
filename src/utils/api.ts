/**
 * Utilitários para conexão com API da PumpFun
 */

/**
 * Verifica se uma URL de WebSocket está disponível
 * @param url URL do WebSocket a ser verificada
 * @returns Promise que resolve para true se disponível, false caso contrário
 */
export const checkWebSocketAvailability = async (
  url: string
): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    try {
      // Use a API de WebSocket do navegador com timeout
      const socket = new WebSocket(url);
      const timeoutId = setTimeout(() => {
        // Se demorar muito, considere indisponível
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
          resolve(false);
        }
      }, 5000);

      socket.onopen = () => {
        clearTimeout(timeoutId);
        socket.close();
        resolve(true);
      };

      socket.onerror = () => {
        clearTimeout(timeoutId);
        socket.close();
        resolve(false);
      };
    } catch (err) {
      console.error(`Erro ao verificar disponibilidade de ${url}:`, err);
      resolve(false);
    }
  });
};

/**
 * Encontra a primeira URL disponível em uma lista de URLs
 * @param urls Lista de URLs para verificar
 * @returns Promise que resolve para a primeira URL disponível ou null se nenhuma estiver disponível
 */
export const findAvailableWebSocketUrl = async (
  urls: string[]
): Promise<string | null> => {
  for (const url of urls) {
    console.log(`Verificando disponibilidade de ${url}...`);
    const isAvailable = await checkWebSocketAvailability(url);
    if (isAvailable) {
      console.log(`URL disponível encontrada: ${url}`);
      return url;
    }
  }
  console.log("Nenhuma URL disponível encontrada.");
  return null;
};

/**
 * Verifica a saúde da API da PumpFun
 * @returns Promise que resolve para um objeto com informações de saúde
 */
export const checkApiHealth = async (): Promise<{
  isHealthy: boolean;
  message: string;
}> => {
  try {
    // Verifica se o site principal da PumpFun está acessível
    const response = await fetch("https://pump.fun/api/health", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        isHealthy: false,
        message: `Status ${response.status}: ${response.statusText}`,
      };
    }

    // Tenta ler os dados da resposta
    const data = await response.json();

    return {
      isHealthy: true,
      message: data.message || "API está funcionando normalmente",
    };
  } catch (err: any) {
    return {
      isHealthy: false,
      message: err.message || "Erro ao verificar saúde da API",
    };
  }
};
