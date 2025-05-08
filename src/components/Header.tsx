import { Box, Text } from "ink";
import React from "react";

/**
 * Componente de cabeçalho da aplicação
 */
const Header: React.FC = () => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box
        borderStyle="round"
        borderColor="green"
        padding={1}
        justifyContent="center"
        alignItems="center"
      >
        <Text bold color="magenta">
          🚀 PumpFun Alert 🚀
        </Text>
      </Box>

      <Box justifyContent="center" marginTop={1} marginBottom={1}>
        <Text color="cyan" italic>
          Monitoramento de lançamentos de tokens em tempo real
        </Text>
      </Box>
    </Box>
  );
};

export default Header;
