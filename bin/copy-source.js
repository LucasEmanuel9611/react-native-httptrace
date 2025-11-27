#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TARGET_DIR = "httptrace";
const SOURCE_DIR = path.join(__dirname, "..", "src");

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return { basePath: process.cwd() };
  }

  if (args.length > 1) {
    console.log(
      `❌ Muitos argumentos. Use: npx react-native-httptrace copy [caminho]`
    );
    process.exit(1);
  }

  const providedPath = args[0];
  const resolvedPath = path.resolve(process.cwd(), providedPath);

  if (!fs.existsSync(resolvedPath)) {
    console.log(`❌ O caminho "${providedPath}" não existe.`);
    process.exit(1);
  }

  const stats = fs.statSync(resolvedPath);
  if (!stats.isDirectory()) {
    console.log(`❌ O caminho "${providedPath}" não é um diretório.`);
    process.exit(1);
  }

  return { basePath: resolvedPath };
}

function getRelativePath(targetPath, currentDir) {
  const relative = path.relative(currentDir, targetPath);
  return relative.startsWith(".") ? relative : `./${relative}`;
}

function prepareTargetDirectory(targetPath, relativeTargetPath) {
  if (!fs.existsSync(targetPath)) {
    return { updated: false };
  }

  const stats = fs.statSync(targetPath);
  if (!stats.isDirectory()) {
    console.log(`❌ Já existe um arquivo em "${relativeTargetPath}".`);
    console.log(`   Remova ou renomeie o arquivo antes de continuar.`);
    process.exit(1);
  }

  console.log(`♻️ Diretório "${relativeTargetPath}" encontrado. Atualizando conteúdo...`);
  fs.rmSync(targetPath, { recursive: true, force: true });
  return { updated: true };
}

function main() {
  const { basePath } = parseArguments();
  const currentDir = process.cwd();
  const targetPath = path.join(basePath, TARGET_DIR);
  const relativeTargetPath = getRelativePath(targetPath, currentDir);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.log(`❌ Diretório fonte não encontrado: ${SOURCE_DIR}`);
    console.log(
      `   Certifique-se de que está executando o comando corretamente.`
    );
    process.exit(1);
  }

  console.log(`📦 Copiando código-fonte para "${relativeTargetPath}"...`);

  try {
    const { updated } = prepareTargetDirectory(targetPath, relativeTargetPath);
    copyDirectory(SOURCE_DIR, targetPath);

    const importBasePath = relativeTargetPath.replace(/\\/g, "/");

    const readmePath = path.join(targetPath, "README.md");
    const readmeContent = `# HttpTrace - Código Local

Este diretório contém o código-fonte copiado da biblioteca react-native-httptrace.

## Como usar

Importe diretamente dos arquivos locais usando o caminho completo relativo ao diretório raiz do seu projeto:

\`\`\`typescript
import { useHttpTrace } from '${importBasePath}/hooks/useHttpTrace';
import { HttpTraceButton } from '${importBasePath}/components/HttpTraceButton';
import { networkLogger } from '${importBasePath}/services/network-logger';
\`\`\`

**Importante:** Os caminhos acima são relativos ao diretório raiz do seu projeto (onde você executou o comando \`npx react-native-httptrace copy\`), não ao diretório httptrace.

## Remover

Para remover este código local, simplesmente delete este diretório:

\`\`\`bash
rm -rf ${relativeTargetPath}
\`\`\`

Depois disso, você pode desinstalar a biblioteca npm:

\`\`\`bash
npm uninstall react-native-httptrace
\`\`\`
`;

    fs.writeFileSync(readmePath, readmeContent, "utf8");

    console.log(
      `✅ Código ${updated ? "atualizado" : "copiado"} com sucesso em "${relativeTargetPath}"!`
    );
    console.log(`\n📝 Próximos passos:`);
    console.log(
      `   1. Atualize suas importações para usar os arquivos locais:`
    );
    console.log(
      `      import { useHttpTrace } from '${importBasePath}/hooks/useHttpTrace';`
    );
    console.log(`\n   2. Depois de migrar, você pode desinstalar a lib:`);
    console.log(`      npm uninstall react-native-httptrace`);
    console.log(`\n   3. Para remover o código local:`);
    console.log(`      rm -rf ${relativeTargetPath}`);
  } catch (error) {
    console.error(`❌ Erro ao copiar arquivos:`, error.message);
    process.exit(1);
  }
}

main();
