#!/bin/bash

# Cores para saída no terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}      PumpFun Alert - Setup         ${NC}"
echo -e "${CYAN}=====================================${NC}"

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js não encontrado. Por favor, instale o Node.js v16 ou superior.${NC}"
  exit 1
fi

# Verifica a versão do Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
  echo -e "${RED}Este aplicativo requer Node.js v16 ou superior. Versão atual: $(node -v)${NC}"
  exit 1
fi

echo -e "${YELLOW}Instalando dependências...${NC}"
npm install

# Verifica se a instalação foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}Falha ao instalar dependências. Verifique as mensagens de erro acima.${NC}"
  exit 1
fi

echo -e "${GREEN}Dependências instaladas com sucesso!${NC}"
echo -e "${YELLOW}Compilando o TypeScript...${NC}"

# Compilar o TypeScript
npm run build

# Verifica se a compilação foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}Falha ao compilar o TypeScript. Verifique as mensagens de erro acima.${NC}"
  exit 1
fi

echo -e "${GREEN}TypeScript compilado com sucesso!${NC}"

echo -e "${GREEN}Configuração concluída!${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "${YELLOW}Para iniciar o aplicativo, execute:${NC}"
echo -e "${GREEN}npm start${NC}"
echo -e "${YELLOW}ou para desenvolvimento:${NC}"
echo -e "${GREEN}npm run dev${NC}"
echo -e "${CYAN}=====================================${NC}"

# Perguntar se deseja executar o aplicativo agora
read -p "Deseja iniciar o aplicativo agora? (s/n): " INICIAR
if [[ $INICIAR =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Iniciando PumpFun Alert...${NC}"
  npm start
else
  echo -e "${CYAN}Obrigado por instalar o PumpFun Alert!${NC}"
fi 