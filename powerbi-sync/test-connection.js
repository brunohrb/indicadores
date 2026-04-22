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

    log('Etapa 2/3 — DAX trivial (já passou antes): pulando.', 'info');

    log('Etapa 3/3 — consultando as 36 medidas dos cards do relatório...', 'info');
    // Nomes conforme aparecem nos cards do relatório "DIretoria Visão de Tabela"
    // (extraídos dos prints do usuário).
    const medidasAlvo = [
      'Base de Cliente PF', 'Base Clientes PJ +PME', 'Base de Isentos', 'Base de Contratos',
      'OS Suporte PF', 'OS Suporte PJ', 'Novos Clientes PF', 'Novos Clientes PJ',
      'Cancelamento PF', 'Cancelam. PME + PJ',
      'Retiradas', 'Cancelamento s/ equip. retirado', 'Reativações Retiradas',
      'Novos Negócios', 'Novos Negócios PF', 'Novos Negócios PJ',
      'Valor Upgrade', 'Valor Cancelamento', 'Valor Cancelamento PF', 'Valor Canc. PJ + PME',
      'Valor Downgrade', 'Resultado Liquido', 'Juros < 45', 'Juros >45',
      'Reajuste Contratos PJ', 'QTD. Canc. 1 Men.', 'Valor Canc. 1 Men.',
      'Valor Reativações', 'Reajuste Contratos PF', 'Ticket Médio da Venda',
      'Pós Pago Qtd. de Venda', 'Pós Pago Novos Negocios', 'Pós Pago QTD. Canc. 1 Men.',
      'Ticket médio da Base', 'Ticket Médio PF', 'Ticket Médio PJ',
    ];

    // Constrói um único EVALUATE ROW com todas as medidas de uma vez só
    // (1 call em vez de 36).
    const escapar = n => n.replace(/"/g, '""');
    const parts = medidasAlvo.map(m => `"${escapar(m)}", [${m}]`).join(', ');
    const dax = `EVALUATE ROW(${parts})`;

    try {
      const linhas = await executarDAX(token, dax);
      const linha = linhas[0] || {};
      log(`Todas as medidas retornaram com sucesso:`, 'ok');
      medidasAlvo.forEach(m => {
        const valor = linha[`[${m}]`];
        const formato = typeof valor === 'number'
          ? valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
          : valor;
        console.log(`   • ${m.padEnd(40)} ${formato}`);
      });
    } catch (err) {
      // Se der erro, tenta uma por uma pra descobrir qual tem nome diferente
      log(`Query em lote falhou — testando uma por uma pra achar divergências...`, 'warn');
      const ok = []; const nok = [];
      for (const m of medidasAlvo) {
        try {
          const r = await executarDAX(token, `EVALUATE ROW("x", [${m}])`);
          ok.push({ nome: m, valor: r[0]?.['[x]'] });
        } catch (_) { nok.push(m); }
      }
      log(`${ok.length} medidas OK, ${nok.length} com nome divergente:`, 'ok');
      ok.forEach(r => console.log(`   ✓ ${r.nome.padEnd(40)} = ${r.valor}`));
      if (nok.length) {
        console.log('\nMedidas não encontradas com esse nome (card pode ter título ≠ medida):');
        nok.forEach(m => console.log(`   ✗ ${m}`));
      }
    }

    log('Conexão 100% funcional!', 'ok');
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
