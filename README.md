# react-native-httptrace

Uma biblioteca completa e flexível para capturar e exibir requisições HTTP em tempo real em aplicações React Native.

## 🚀 Características

- ✅ **Captura automática** de todas as requisições HTTP
- ✅ **Modal reutilizável** em vez de tela fixa
- ✅ **Configurações personalizáveis** (BASE_URL, maxRequests, etc.)
- ✅ **Interface em tempo real** com atualizações automáticas
- ✅ **Detalhes completos** de cada requisição (headers, body, response, error)
- ✅ **Botão flutuante** para acesso global
- ✅ **Limpeza de logs** com confirmação
- ✅ **Geração de cURL** automática
- ✅ **Cópia para clipboard** de JSON, headers, body, response e error
- ✅ **Compartilhamento** de requisições
- ✅ **Seções expansíveis** para melhor organização
- ✅ **Cores por status** HTTP (verde para 2xx, laranja para 4xx, vermelho para 5xx)
- ✅ **Programação funcional** com código limpo e autoexplicativo
- ✅ **TypeScript** com tipagem completa
- ✅ **Styled Components** para UI moderna e responsiva

## 📦 Instalação

```bash
npm install react-native-httptrace
# ou
yarn add react-native-httptrace
```

## 🔧 Como Usar

### 1. Configuração Inicial (Opcional)

```typescript
import { networkLogger } from 'react-native-httptrace';

// Configurar o logger
networkLogger.configure({
  baseUrl: 'https://api.meuapp.com',
  maxRequests: 500,
  enableConsoleLogs: true,
});
```

### 2. Aplicar o Logger em uma instância Axios

```typescript
import { networkLogger } from 'react-native-httptrace';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.exemplo.com',
});

// Aplicar o logger
networkLogger.createAxiosInterceptors(api);
```

### 3. Usar o Hook com Configurações (Recomendado)

```typescript
import { useNetworkLogger } from 'react-native-httptrace';
import axios from 'axios';

function App() {
  const api = axios.create({
    baseURL: 'https://api.exemplo.com',
  });

  // Aplicar automaticamente com configurações
  useNetworkLogger(api, {
    baseUrl: 'https://api.meuapp.com',
    maxRequests: 1000,
    enableConsoleLogs: false,
  });

  return (
    // seu app
  );
}
```

### 4. Adicionar o Modal do Logger

```typescript
import { NetworkLoggerModal } from 'react-native-httptrace';
import { useState } from 'react';

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Seu app */}
      <NetworkLoggerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Debug de Rede"
        showCloseButton={true}
      />
    </View>
  );
}
```

### 5. Adicionar o Botão Flutuante

```typescript
import { NetworkLoggerButton } from 'react-native-httptrace';

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Seu app */}
      <NetworkLoggerButton 
        onPress={() => setIsModalVisible(true)} 
      />
      <NetworkLoggerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}
```

## 🎨 API

### `networkLogger`

```typescript
interface NetworkLogger {
  createAxiosInterceptors(axiosInstance: AxiosInstance): void;
  subscribe(callback: (requests: NetworkRequest[]) => void): () => void;
  clearRequests(): void;
  configure(config: Partial<NetworkLoggerConfig>): void;
}
```

### `useNetworkLogger`

```typescript
function useNetworkLogger(
  axiosInstance?: AxiosInstance,
  config?: Partial<NetworkLoggerConfig>
): void;
```

### `NetworkLoggerModal`

```typescript
interface NetworkLoggerModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}
```

### `NetworkLoggerButton`

```typescript
interface NetworkLoggerButtonProps {
  onPress: () => void;
  visible?: boolean;
}
```

### `NetworkLoggerConfig`

```typescript
interface NetworkLoggerConfig {
  baseUrl?: string;
  maxRequests?: number;
  enableConsoleLogs?: boolean;
}
```

### `NetworkRequest`

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
}
```

## 🎯 Exemplo Completo

```typescript
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { 
  useNetworkLogger, 
  NetworkLoggerModal, 
  NetworkLoggerButton 
} from 'react-native-httptrace';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Aplicar o logger com configurações
  useNetworkLogger(api, {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    maxRequests: 1000,
    enableConsoleLogs: true,
  });

  const fetchData = async () => {
    try {
      await api.get('/posts/1');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Fazer Requisição" onPress={fetchData} />
      
      <NetworkLoggerButton 
        onPress={() => setIsModalVisible(true)} 
      />
      
      <NetworkLoggerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Debug de Rede"
        showCloseButton={true}
      />
    </View>
  );
}
```

## 🎨 Funcionalidades da Interface

### Modal Reutilizável
- **Apresentação como modal** em vez de tela fixa
- **Título personalizável** via props
- **Botão de fechar** opcional
- **Animação suave** de entrada e saída

### Lista de Requisições
- **Método HTTP** com cor baseada no status
- **URL** da requisição
- **Status** com cores (verde=2xx, laranja=4xx, vermelho=5xx)
- **Duração** da requisição
- **Timestamp** de quando foi feita

### Detalhes da Requisição
- **Headers** expansíveis com cópia
- **Body** expansível com cópia
- **Response** expansível com cópia
- **Error** expansível com cópia (se houver)
- **cURL Command** gerado automaticamente

### Ações Disponíveis
- **Copy JSON** - Copia toda a requisição em JSON
- **Copy cURL** - Copia o comando cURL gerado
- **Share** - Compartilha a requisição
- **Copy** individual para cada seção

## ⚙️ Configurações

### `baseUrl`
URL base para requisições que não têm URL completa. Padrão: `process.env.BASE_URL` ou `"http://localhost"`

### `maxRequests`
Número máximo de requisições mantidas em memória. Padrão: `1000`

### `enableConsoleLogs`
Habilita ou desabilita logs no console. Padrão: `true`

## 🏗️ Arquitetura

A biblioteca segue os princípios de **código limpo** e **programação funcional**:

- **Imutabilidade**: Estado nunca é modificado diretamente
- **Funções puras**: Sem side effects desnecessários
- **Composição**: Funções pequenas e reutilizáveis
- **Autoexplicativo**: Nomes descritivos e código legível
- **SOLID**: Cada função tem uma responsabilidade única
- **Styled Components**: UI moderna e responsiva
- **Configurável**: Flexível para diferentes projetos

## 📝 Licença

MIT

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de submeter um PR. 