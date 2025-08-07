# react-native-httptrace

Uma biblioteca completa para capturar e exibir **TODAS** as requisições HTTP (fetch, XMLHttpRequest, axios) em tempo real em aplicações React Native.

## 🚀 Características

- ✅ **Captura UNIVERSAL** - fetch, XMLHttpRequest, axios - sem dependências
- ✅ **Interceptors nativos** - funciona com qualquer biblioteca HTTP
- ✅ **Múltiplas interfaces** - botão, shake, toast, badge, status indicator
- ✅ **Modal integrado** - todos os componentes incluem o modal
- ✅ **Detalhes completos** - headers, body, response, error, cURL
- ✅ **Clipboard nativo** - cópia real para área de transferência
- ✅ **Interface moderna** - StyleSheet nativo sem dependências
- ✅ **TypeScript** com tipagem completa
- ✅ **Compatibilidade total** - código axios existente funciona igual
- ✅ **Configurável** - controle total sobre comportamento

## 📦 Instalação

```bash
npm install react-native-httptrace
# ou
yarn add react-native-httptrace
```

## 🔧 Como Usar

### Método 1: Automático (Recomendado)

Captura **TODAS** as requests automaticamente:

```typescript
import { useHttpTrace } from 'react-native-httptrace';

function App() {
  useHttpTrace();
  
  return <YourApp />;
}
```

### Método 2: Manual

Controle quando iniciar/parar:

```typescript
import { networkLogger } from 'react-native-httptrace';

networkLogger.startLogging();
```

### Método 3: Compatibilidade Axios

Seu código existente continua funcionando:

```typescript
import { useHttpTrace } from 'react-native-httptrace';
import axios from 'axios';

function App() {
  const api = axios.create();
  useHttpTrace(api);
  
  return <YourApp />;
}
```

## 🎨 Componentes de Interface

### HttpTraceButton - Botão Flutuante

```typescript
import { HttpTraceButton } from 'react-native-httptrace';

<HttpTraceButton />
```

### HttpTraceShake - Abrir por Shake

```typescript
import { HttpTraceShake } from 'react-native-httptrace';

<HttpTraceShake />
```

### HttpTraceBadge - Badge Discreto

```typescript
import { HttpTraceBadge } from 'react-native-httptrace';

<HttpTraceBadge position="top-right" showOnlyErrors />
```

### HttpTraceToast - Toast de Erros

```typescript
import { HttpTraceToast } from 'react-native-httptrace';

<HttpTraceToast showOnlyErrors duration={3000} />
```

### HttpTraceStatusIndicator - Indicador de Status

```typescript
import { HttpTraceStatusIndicator } from 'react-native-httptrace';

<HttpTraceStatusIndicator position="top" />
```

### useHttpTraceDevMenu - Menu do Desenvolvedor

```typescript
import { useHttpTraceDevMenu } from 'react-native-httptrace';

function App() {
  useHttpTraceDevMenu();
  return <YourApp />;
}
```

## 🎯 Exemplos Completos

### Exemplo 1: Setup Mínimo

```typescript
import React from 'react';
import { View } from 'react-native';
import { useHttpTrace, HttpTraceButton } from 'react-native-httptrace';

function App() {
  useHttpTrace();

  return (
    <View style={{ flex: 1 }}>
      <YourApp />
      <HttpTraceButton />
    </View>
  );
}
```

### Exemplo 2: UI Avançada

```typescript
import React from 'react';
import { View } from 'react-native';
import { 
  useHttpTrace, 
  HttpTraceShake, 
  HttpTraceToast,
  HttpTraceBadge 
} from 'react-native-httptrace';

function App() {
  useHttpTrace({
    config: {
      maxRequests: 500,
      captureRequestBody: true,
      captureResponseBody: true,
    }
  });

  return (
    <View style={{ flex: 1 }}>
      <YourApp />
      <HttpTraceShake />
      <HttpTraceToast />
      <HttpTraceBadge position="top-right" />
    </View>
  );
}
```

### Exemplo 3: Migração Axios

```typescript
import React from 'react';
import { useHttpTrace } from 'react-native-httptrace';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.exemplo.com',
});

function App() {
  useHttpTrace(api, {
    maxRequests: 1000,
    enableConsoleLogs: false,
  });

  return <YourApp />;
}
```

## 🎨 API

### `networkLogger`

```typescript
interface NetworkLogger {
  startLogging(): void;
  stopLogging(): void;
  clearRequests(): void;
  subscribe(callback: (requests: NetworkRequest[]) => void): () => void;
  configure(config: Partial<NetworkLoggerConfig>): void;
  createAxiosInterceptors(axiosInstance: any): void;
}
```

### `useHttpTrace`

```typescript
function useHttpTrace(options?: {
  axiosInstance?: any;
  config?: Partial<NetworkLoggerConfig>;
  autoStart?: boolean;
}): {
  startLogging: () => void;
  stopLogging: () => void;
  clearRequests: () => void;
};
```

### Configuração

```typescript
interface NetworkLoggerConfig {
  baseUrl?: string;
  maxRequests?: number;
  enableConsoleLogs?: boolean;
  captureRequestBody?: boolean;
  captureResponseBody?: boolean;
}
```

### Request

```typescript
interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  fullUrl?: string;
  headers: Record<string, string>;
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

### HttpTraceButton

```typescript
interface HttpTraceButtonProps {
  visible?: boolean;
}
```

### HttpTraceShake

```typescript
interface HttpTraceShakeProps {
  enabled?: boolean;
  shakeThreshold?: number;
}
```

### HttpTraceBadge

```typescript
interface HttpTraceBadgeProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOnlyErrors?: boolean;
  showCount?: boolean;
}
```

### HttpTraceToast

```typescript
interface HttpTraceToastProps {
  position?: 'top' | 'bottom';
  duration?: number;
  showOnlyErrors?: boolean;
  maxWidth?: number;
}
```

### HttpTraceStatusIndicator

```typescript
interface HttpTraceStatusIndicatorProps {
  position?: 'top' | 'bottom';
  showPending?: boolean;
  showErrors?: boolean;
}
```

## ⚙️ Configurações

### `maxRequests`
Número máximo de requisições em memória. Padrão: `1000`

### `enableConsoleLogs`
Logs no console. Padrão: `true`

### `captureRequestBody`
Captura corpo das requests. Padrão: `true`

### `captureResponseBody`
Captura corpo das responses. Padrão: `true`

## 🚀 Migração

### De versões antigas

Seu código existente continua funcionando:

```typescript
// ✅ Funciona igual
useNetworkLogger(axiosInstance) → useHttpTrace(axiosInstance)
NetworkLoggerButton → HttpTraceButton
NetworkLoggerModal → HttpTraceModal
```

### De outras libs

```typescript
// Flipper Network Plugin → react-native-httptrace
useHttpTrace();

// React Native Debugger → react-native-httptrace  
<HttpTraceButton />

// Custom solutions → react-native-httptrace
<HttpTraceShake />
```

## 🔧 Funcionalidades

- **Universal**: Captura fetch, XMLHttpRequest, axios
- **Sem setup**: `useHttpTrace()` e pronto
- **Múltiplas UIs**: Botão, shake, toast, badge
- **Modal integrado**: Todos os componentes incluem
- **Clipboard real**: Cópia funcional
- **Sem styled-components**: Bundle menor
- **TypeScript**: Tipagem completa
- **Configurável**: Controle total

## 📝 Licença

MIT

## 🤝 Contribuição

PRs são bem-vindos! 