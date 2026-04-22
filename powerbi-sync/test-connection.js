#!/usr/bin/env node
// =====================================================
// Power BI — Teste de Conexão
// Valida credenciais Azure AD e acesso ao dataset.
// Uso: node test-connection.js
// =====================================================

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ─── Carrega .env.local quando rodando local. No GitHub Actions,
//     as vars já vêm do workflow via "env:" e esse passo é pulado.
function carregarEnv() {
  if (process.env.PBI_CLIENT_SECRET) return; // já setado (CI / shell)
  const caminho = path.join(__dirname, '.env.local');
  if (!fs.existsSync(caminho)) {
    throw new Error(
      'Nem variáveis de ambiente nem .env.local encontrados.\n' +
      '   Rodando local? Copie .env.local.example → .env.local e preencha.\n' +
      '   Rodando GitHub Actions? Configure o secret PBI_CLIENT_SECRET.'
    );
  }
  const linhas = fs.readFileSync(caminho, 'utf8').split('\n');
  for (const linha of linhas) {
    const m = linha.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

// ─── Logging colorido ─────────────────────────────────
const cor = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', erro: '\x1b[31m', reset: '\x1b[0m' };
function log(msg, tipo = 'info') {
  console.log(`${cor[tipo] || ''}[${new Date().toLocaleTimeString('pt-BR')}] ${msg}${cor.reset}`);
}

// ─── OAuth2 client_credentials ────────────────────────
async function obterToken() {
  const { PBI_TENANT_ID, PBI_CLIENT_ID, PBI_CLIENT_SECRET } = process.env;
  if (!PBI_TENANT_ID || !PBI_CLIENT_ID || !PBI_CLIENT_SECRET) {
    throw new Error('Faltam PBI_TENANT_ID, PBI_CLIENT_ID ou PBI_CLIENT_SECRET no .env.local');
  }
  const url = `https://login.microsoftonline.com/${PBI_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: PBI_CLIENT_ID,
    client_secret: PBI_CLIENT_SECRET,
    scope: 'https://analysis.windows.net/powerbi/api/.default',
    grant_type: 'client_credentials',
  });
  const { data } = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  });
  return data.access_token;
}

// ─── Execute DAX Query ────────────────────────────────
async function executarDAX(token, dax) {
  const { PBI_WORKSPACE_ID, PBI_DATASET_ID } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_ID}/datasets/${PBI_DATASET_ID}/executeQueries`;
  const body = {
    queries: [{ query: dax }],
    serializerSettings: { includeNulls: true },
  };
  const { data } = await axios.post(url, body, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 60000,
  });
  return data.results[0].tables[0].rows;
}

// ─── Main ─────────────────────────────────────────────
(async () => {
  try {
    carregarEnv();

    log('Etapa 1/3 — obtendo token OAuth2 no Azure AD...', 'info');
    const token = await obterToken();
    log(`Token obtido (${token.length} caracteres) ✓`, 'ok');

    log('Etapa 2/4 — DAX trivial (prova que o motor executa queries)...', 'info');
    const ping = await executarDAX(token, 'EVALUATE ROW("ping", 1)');
    log(`Resposta: ${JSON.stringify(ping[0])} ✓`, 'ok');

    log('Etapa 3/4 — tentando DAX INFO.TABLES() (API nova, pode falhar)...', 'info');
    try {
      const tabelas = await executarDAX(
        token,
        'EVALUATE SELECTCOLUMNS(INFO.TABLES(), "Tabela", [Name])'
      );
      log(`${tabelas.length} tabelas encontradas:`, 'ok');
      tabelas.forEach(t => console.log(`   • ${t['[Tabela]']}`));
    } catch (err) {
      log(`INFO.TABLES() não disponível neste modelo — usando DMV fallback...`, 'warn');
      // DMV: query SQL-like sobre o esquema do modelo (sempre funciona)
      const tabelas = await executarDAX(
        token,
        'SELECT [Name], [IsHidden] FROM $SYSTEM.TMSCHEMA_TABLES'
      );
      log(`${tabelas.length} tabelas (via DMV):`, 'ok');
      tabelas.forEach(t => {
        const nome = t['Name'] || t['[Name]'];
        const ocul = t['IsHidden'] || t['[IsHidden]'];
        console.log(`   • ${nome}${ocul ? ' (oculta)' : ''}`);
      });
    }

    log('Etapa 4/4 — listando as medidas DAX (nomes dos cards do relatório)...', 'info');
    try {
      const medidas = await executarDAX(
        token,
        'EVALUATE SELECTCOLUMNS(INFO.MEASURES(), "Medida", [Name])'
      );
      log(`${medidas.length} medidas encontradas:`, 'ok');
      medidas.forEach(m => console.log(`   • ${m['[Medida]']}`));
    } catch (err) {
      log(`INFO.MEASURES() falhou — tentando via DMV...`, 'warn');
      const medidas = await executarDAX(
        token,
        'SELECT [Name], [Expression] FROM $SYSTEM.TMSCHEMA_MEASURES'
      );
      log(`${medidas.length} medidas (via DMV):`, 'ok');
      medidas.forEach(m => {
        const nome = m['Name'] || m['[Name]'];
        console.log(`   • ${nome}`);
      });
    }

    log('Conexão 100% funcional! Pronto para implementar o sync completo.', 'ok');
    process.exit(0);
  } catch (e) {
    log(`FALHOU: ${e.message}`, 'erro');
    if (e.response) {
      log(`Status HTTP: ${e.response.status}`, 'erro');
      log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`, 'erro');
    }
    process.exit(1);
  }
})();
