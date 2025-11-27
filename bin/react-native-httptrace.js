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
  console.log('  copy [caminho]  Copia o código-fonte para o projeto');
  console.log('');
  console.log('Exemplos:');
  console.log('  npx react-native-httptrace copy');
  console.log('  npx react-native-httptrace copy ./src');
  process.exit(0);
} else {
  console.log(`❌ Comando desconhecido: "${command}"`);
  console.log('');
  console.log('Comandos disponíveis:');
  console.log('  copy [caminho]  Copia o código-fonte para o projeto');
  process.exit(1);
}

