import { useCallback } from "react";
import { AlertOptions, NotificationOptions, Token } from "../types.js";

/**
 * Hook para gerenciar notificações do sistema e alertas sonoros
 */
export const useNotifications = ({
  soundPath,
  enableSound = true,
  enableNotifications = true,
}: NotificationOptions = {}) => {
  // Função para tocar um som de alerta
  const playSound = useCallback(
    async (filePath: string) => {
      if (!enableSound || !filePath) return;

      try {
        // Import dinâmico para evitar problemas no ambiente Node.js
        const { default: player } = await import("play-sound");
        const sound = player({});

        sound.play(filePath, (err: any) => {
          if (err) {
            console.error("Erro ao tocar alerta sonoro:", err);
          }
        });
      } catch (err) {
        console.error("Erro ao carregar módulo de som:", err);
      }
    },
    [enableSound]
  );

  // Função para mostrar uma notificação do sistema
  const showNotification = useCallback(
    async (options: AlertOptions) => {
      if (!enableNotifications) return;

      try {
        // Import dinâmico para evitar problemas no ambiente Node.js
        const { default: notifier } = await import("node-notifier");

        notifier.notify({
          title: options.title || "PumpFun Alert",
          message: options.message || "Novo token encontrado!",
          sound: options.sound !== undefined ? options.sound : true,
          wait: options.wait || false,
          ...options,
        });
      } catch (err) {
        console.error("Erro ao mostrar notificação:", err);
      }
    },
    [enableNotifications]
  );

  // Função para abrir a URL do token
  const openTokenUrl = useCallback(async (url: string) => {
    try {
      // Import dinâmico para evitar problemas no ambiente Node.js
      const { default: openUrl } = await import("open");
      await openUrl(url);
    } catch (err) {
      console.error("Erro ao abrir URL do token:", err);
    }
  }, []);

  // Função principal para alertar o usuário
  const alertUser = useCallback(
    (token: Token, options: AlertOptions = {}) => {
      // Toca o som de alerta se disponível
      if (soundPath) {
        playSound(soundPath);
      }

      // Mostra notificação do sistema
      showNotification({
        title: options.title || "PumpFun Alert",
        message: options.message || `Token encontrado: ${token.name}`,
        // Função para abrir a URL do token quando clicar na notificação
        click: () => {
          openTokenUrl(token.url);
        },
        ...options,
      });
    },
    [playSound, showNotification, openTokenUrl, soundPath]
  );

  return {
    alertUser,
    playSound,
    showNotification,
    openTokenUrl,
  };
};

export default useNotifications;
