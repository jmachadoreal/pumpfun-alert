import { Box, Text, useInput } from "ink";
import React, { useEffect, useState } from "react";

interface InputFormProps {
  onSubmit: (input: string) => void;
  onMonitorAll?: () => void;
  error?: string | null;
}

/**
 * Componente de formulário para entrada de tokens a serem monitorados
 */
const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  onMonitorAll,
  error,
}) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Limpa o erro local quando o input muda
  useEffect(() => {
    if (input.trim() !== "" && localError) {
      setLocalError(null);
    }
  }, [input, localError]);

  // Limpa o erro local quando o erro externo muda
  useEffect(() => {
    if (error === null && localError) {
      setLocalError(null);
    }
  }, [error, localError]);

  useInput((inputChar, key) => {
    if (focused) {
      if (key.return) {
        // Valida se há texto antes de submeter
        if (!input.trim()) {
          setLocalError("Por favor, digite ao menos um token para monitorar");
          return;
        }

        // Limpa erros locais e submete
        setLocalError(null);
        onSubmit(input);
      } else if (key.backspace || key.delete) {
        setInput((prev) => prev.slice(0, -1));
      } else if (inputChar && !key.ctrl && !key.meta) {
        setInput((prev) => prev + inputChar);
      } else if ((inputChar === "a" || inputChar === "A") && key.ctrl) {
        // Ctrl+A para monitorar todos os tokens
        if (onMonitorAll) {
          onMonitorAll();
        }
      }
    }
  });

  // Determina qual erro mostrar (prioriza o erro local)
  const displayError = localError || error;

  // Determina a cor da borda com base no erro
  const borderColor = displayError ? "red" : "blue";

  return (
    <Box
      flexDirection="column"
      padding={1}
      borderStyle="round"
      borderColor={borderColor}
    >
      <Box marginBottom={1}>
        <Text bold>
          Digite os tokens que deseja monitorar (separados por vírgula):
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">Exemplo: SOOS, SOCIAL, PUMP, FUN</Text>
      </Box>

      <Box
        borderStyle="single"
        paddingX={1}
        paddingY={0}
        borderColor={focused ? (displayError ? "red" : "green") : "gray"}
      >
        <Text>{input || "Clique e digite aqui..."}</Text>
      </Box>

      {displayError && (
        <Box marginTop={1}>
          <Text color="red">⚠️ {displayError}</Text>
        </Box>
      )}

      <Box marginTop={2} justifyContent="center">
        <Text>
          Pressione{" "}
          <Text color="green" bold>
            ENTER
          </Text>{" "}
          para começar a monitorar
        </Text>
      </Box>

      {onMonitorAll && (
        <Box marginTop={1} justifyContent="center">
          <Text>
            Ou pressione{" "}
            <Text color="yellow" bold>
              CTRL+A
            </Text>{" "}
            para mostrar TODOS os lançamentos em tempo real
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default InputForm;
