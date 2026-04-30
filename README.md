# react-native-httptrace

Biblioteca leve para capturar e inspecionar requisições HTTP em tempo real em aplicações React Native.

## 🚀 Características

- ✅ **Interceptação universal** — `fetch` e `XMLHttpRequest` (axios funciona automaticamente via XHR)
- 🔍 **Busca e filtros** — busca por URL/método, filtros por tipo (XHR/Fetch) e status (2xx, 4xx, 5xx, errors)
- 📋 **Detalhes completos** — headers, body, response, erro, geração de cURL
- 🎨 **Syntax highlight** — JSON colorido nas responses (chaves, strings, números, booleans, null)
- 🟢 **Badge no FAB** — contagem de requests (verde) ou erros (vermelho)
- 👆 **Ativação por gesto** — long press (1.5s) ou swipe com 3 dedos
- ⚙️ **Dev Menu** — item no menu de desenvolvedor do React Native
- ⏱️ **Duração colorida** — cinza (<1s), amarelo (1-3s), vermelho (>3s)
- ✨ **Animações suaves** — transições via LayoutAnimation
- 📱 **Cross-platform** — iOS e Android com fontes nativas
- 🔷 **TypeScript** — tipagem completa
- 📦 **Leve** — zero dependências de UI (apenas `react-native-reanimated` no FAB e `react-native-share` para compartilhar)

## 📦 Instalação

```bash
npm install react-native-httptrace
# ou
yarn add react-native-httptrace
```

### Peer dependencies

```bash
npm install react-native-reanimated react-native-share
```

## 🔨 Desenvolvimento (repositório)

A pasta `lib/` é gerada pelo TypeScript e **não entra no Git** (só o `src/`). Depois do clone: `npm install` e `npm run build` quando for trabalhar no código.

**Publicar:** suba a versão no `package.json` (ou `npm version patch`) e rode **`npm publish`**. O hook `prepack` roda sozinho `build` + `test` antes de gerar o pacote — não precisa encadear outros comandos na mão.

Opcional antes do publish: `npm pack --dry-run` para ver o que entra no `.tgz`.

## 🔧 Uso

### HttpTraceView (Recomendado)

Envolve a árvore do app. Use a prop `enabled` para controlar em quais ambientes o inspector fica ativo. Abre o modal por **long press** ou **gesto de 3 dedos + swipe**.

```tsx
import { HttpTraceView } from 'react-native-httptrace';

function App() {
  return (
    <HttpTraceView enabled={__DEV__}>
      <YourApp />
    </HttpTraceView>
  );
}
```

### HttpTraceButton (FAB)

Botão flutuante arrastável. Toque abre o modal, long press esconde temporariamente. Mostra badge verde com total de requests ou vermelho com contagem de erros.

```tsx
import { HttpTraceButton } from 'react-native-httptrace';

function App() {
  return (
    <>
      <YourApp />
      <HttpTraceButton />
    </>
  );
}
```

### HttpTraceDevMenu

Adiciona item "Http trace" ao Dev Menu do React Native.

```tsx
import { HttpTraceDevMenu } from 'react-native-httptrace';

function App() {
  return (
    <>
      <YourApp />
      <HttpTraceDevMenu />
    </>
  );
}
```

### ⚡ Controle manual

```typescript
import { networkLogger } from 'react-native-httptrace';

networkLogger.startLogging();
networkLogger.stopLogging();
networkLogger.clearRequests();
networkLogger.configure({ maxRequests: 500 });
```

## 📥 Copiar código-fonte (uso local)

O pacote no npm contém apenas a pasta compilada `lib`. Para copiar o TypeScript (`src`) para dentro do seu projeto, clone o repositório da lib, rode `npm run build` se precisar, e na raiz do clone execute:

```bash
node bin/react-native-httptrace.js copy
node bin/react-native-httptrace.js copy /caminho/do/seu/projeto
```

Depois atualize os imports:

```typescript
import { HttpTraceView } from './httptrace/components/HttpTraceView';
import { networkLogger } from './httptrace/services/network-logger';
```

## 🎯 Modal — funcionalidades

### 🔍 Busca e filtros

- Campo de busca por URL ou método HTTP
- Filtros por tipo: **XHR** / **Fetch** (toggle)
- Filtros por status: **2xx** / **4xx** / **5xx** / **Errors** (toggle)
- Badges ativas com ✕ para remoção rápida
- Painel de filtros colapsável com animação

### 📄 Detalhe da request

- Informações gerais: URL completa, método, status (colorido), duração, timestamp
- Seções expansíveis: Request Headers, Request Body, Response, Error
- Syntax highlight de JSON (chaves, strings, números, booleans, null)
- Geração e cópia de comando cURL
- Compartilhamento via `react-native-share`

### 📋 Listagem

- Exibe apenas o pathname (sem domínio) para leitura rápida
- Duração colorida: cinza (<1s), amarelo (1-3s), vermelho (>3s)
- Badge de método com cor por status

## 🎨 API

### networkLogger

```typescript
interface NetworkLogger {
  startLogging(): void;
  stopLogging(): void;
  clearRequests(): void;
  subscribe(callback: (requests: NetworkRequest[]) => void): () => void;
  configure(config: Partial<NetworkLoggerConfig>): void;
}
```

### useHttpTrace

```typescript
function useHttpTrace(options?: {
  enabled?: boolean;    // padrão: true
  config?: Partial<NetworkLoggerConfig>;
  autoStart?: boolean;  // padrão: true
}): {
  shouldShowHttpTrace: boolean;
};
```

O controle de ambiente é responsabilidade do projeto consumidor via `enabled`.

### NetworkLoggerConfig

```typescript
interface NetworkLoggerConfig {
  maxRequests?: number; // padrão: 1000
}
```

### NetworkRequest

```typescript
interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  fullUrl?: string;
  headers: Record<string, string>;
  responseHeaders?: Record<string, string>;
  body?: any;
  status?: number;
  response?: any;
  error?: any;
  startTime: number;
  endTime?: number;
  duration?: number;
  timestamp: Date;
  type?: 'fetch' | 'xhr' | 'axios';
}
```

## 📱 Componentes

### HttpTraceView

```typescript
interface HttpTraceViewProps {
  children?: React.ReactNode;
  enabled?: boolean;            // padrão: true
  longPressDuration?: number;   // padrão: 1500ms
  enableLongPress?: boolean;    // padrão: true
}
```

### HttpTraceButton

```typescript
interface HttpTraceButtonProps {
  visible?: boolean; // padrão: true
}
```

### HttpTraceModal

```typescript
interface HttpTraceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;            // padrão: '🌐 HTTP Trace'
  showCloseButton?: boolean; // padrão: true
}
```

### HttpTraceDevMenu

```typescript
interface HttpTraceDevMenuProps {
  enabled?: boolean; // padrão: true
  title?: string;    // padrão: 'HTTP Trace'
}
```

## 📝 Licença

MIT

## 🤝 Contribuição

PRs são bem-vindos!
