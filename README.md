# 🚀 PumpFun Alert 🚀

Uma aplicação CLI elegante para monitorar e alertar sobre novos lançamentos de tokens na plataforma PumpFun, desenvolvida com React Ink e TypeScript.

## ✨ Funcionalidades

- 🔍 **Monitoramento em tempo real** - Conecta-se ao WebSocket da PumpFun para receber atualizações instantâneas
- 👁️ **Visualização de todos os lançamentos** - Acompanhe todos os tokens sendo lançados, mesmo sem filtros específicos
- 🔔 **Notificações avançadas** - Alertas sonoros e visuais quando tokens correspondentes são encontrados
- 🖥️ **Interface moderna no terminal** - UI bonita e intuitiva construída com React Ink
- 🔗 **Links interativos** - Acesse os tokens encontrados diretamente do terminal
- 🔄 **Reconexão automática** - Mantém a conexão mesmo em caso de instabilidade na rede
- 🎯 **Busca inteligente** - Identifica tokens através de padrões parciais em seus nomes (ex: "vamp" encontra "vampire")
- 🧩 **TypeScript** - Código completamente tipado para melhor manutenção e confiabilidade
- 📊 **Gerenciamento de estado global** - Utiliza Zustand para um gerenciamento de estado confiável e eficiente

## 🔧 Pré-requisitos

- Node.js 16.x ou superior
- NPM ou Yarn

## 📦 Instalação

### Usando o script de setup (recomendado)

```bash
./setup.sh
```

### Instalação manual

Instale as dependências e compile o TypeScript:

```bash
npm install
npm run build
```

## 🚀 Uso

Execute a aplicação:

```bash
npm start
```

Para desenvolvimento com recarga automática:

```bash
npm run dev
```

### Passo a passo

1. Digite os nomes dos tokens que deseja monitorar, separados por vírgula (exemplo: `SOOS, SOCIAL, PUMP`)
   - **OU** pressione `CTRL+A` para monitorar TODOS os lançamentos de tokens
2. Pressione `ENTER` para começar a monitorar termos específicos
3. A aplicação irá se conectar ao WebSocket da PumpFun e monitorar novos lançamentos
4. Durante o monitoramento, pressione `F` para abrir/fechar a janela de lançamentos em tempo real
5. Quando um token correspondente for encontrado, você receberá uma notificação e um alerta sonoro
6. Para sair da visualização de tokens em tempo real, pressione `ESC` ou `Q`

## 🏗️ Estrutura do Projeto

```
/src
  /assets        # Arquivos de mídia (sons, etc.)
  /components    # Componentes React em TypeScript
  /hooks         # Custom hooks para lógica de negócio
  /store         # Gerenciamento de estado com Zustand
  /utils         # Funções utilitárias e constantes
  App.tsx        # Componente principal
  index.tsx      # Ponto de entrada
  types.ts       # Tipos e interfaces
/dist            # Código compilado (gerado pelo TypeScript)
```

## 🛠️ Tecnologias

- **React** - Biblioteca para construção de interfaces
- **Ink** - Framework para interfaces de terminal baseado em React
- **TypeScript** - Linguagem de programação com tipagem estática
- **Zustand** - Biblioteca leve para gerenciamento de estado global
- **WebSocket** - Para comunicação em tempo real com a API da PumpFun
- **Node.js** - Ambiente de execução JavaScript no servidor

## 💡 Recursos avançados

- **Modo de visualização em tempo real**: Pressione `F` durante o monitoramento para ver todos os tokens sendo lançados.
- **Monitoramento global**: Use `CTRL+A` na tela inicial para monitorar todos os tokens sem filtros específicos.
- **Busca inteligente de subpalavras**: A busca encontra termos parciais nos nomes dos tokens (ex: 'vamp' encontra 'vampire', 'vampiro', etc.).
- **Detecção robusta de correspondências**: Várias estratégias para garantir que tokens similares sejam encontrados mesmo com variações nos nomes.

## 📝 Licença

Este projeto está sob a licença ISC.

---

Desenvolvido com ❤️ para a comunidade PumpFun
