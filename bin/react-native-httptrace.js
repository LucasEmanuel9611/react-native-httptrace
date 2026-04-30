#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'copy') {
  const copyScriptPath = path.join(__dirname, 'copy-source.js');
  const copyArgs = args.slice(1);
  
  const child = spawn('node', [copyScriptPath, ...copyArgs], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else if (!command) {
  console.log('react-native-httptrace');
  console.log('');
  console.log('Comandos disponíveis:');
  console.log('  copy [caminho-do-app]  Copia o código-fonte para <app>/httptrace');
  console.log('');
  console.log('Exemplos (rode na raiz do app, onde está o package.json do projeto):');
  console.log('  npx react-native-httptrace copy');
  console.log('');
  console.log('Ou informando o diretório do app:');
  console.log('  npx react-native-httptrace copy /caminho/do/app-react-native');
  console.log('');
  console.log('Com o repositório da lib no disco (sem npm):');
  console.log('  cd /caminho/do/app-react-native');
  console.log('  node /caminho/do/react-native-httptrace/bin/react-native-httptrace.js copy');
  process.exit(0);
} else {
  console.log(`❌ Comando desconhecido: "${command}"`);
  console.log('');
  console.log('Comandos disponíveis:');
  console.log('  copy [caminho-do-app]  Copia o código-fonte para <app>/httptrace');
  process.exit(1);
}

