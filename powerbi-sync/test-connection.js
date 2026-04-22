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

    log('Etapa 3/3 — consultando TODAS as 34 medidas do modelo (fev/2026)...', 'info');

    // Medidas descobertas pelo usuário ao expandir as tabelas no Power BI.
    const medidasAlvo = [
      // Tabela: dTaxaInstalacao
      'Valor Instalacao',
      // Tabela: Medidas
      '% Total Ret.', 'Detalhe % Ating. Meta', 'Eqp. Retirados Real', 'Eqp. Retirados s/equip',
      'Meta', 'Meta Retirada', 'PF - Qtd. OS PF', 'PF - Qtd. OS Suporte PF',
      'PJ - Qtd. OS Finalizada PJ', 'Qtd. Contratos', 'Qtd. Downgrade',
      'Qtd. Reativacoes 30 dias', 'Qtd. Suporte PJ', 'Qtd. Taxa Instalacao',
      'Qtd. Upgrade', 'Reativados', 'Valor Downgrade',
      'Valor Reativacoes 30 dias', 'Valor Upgrade',
      // Tabela: Medidas Cancelamento
      'Cancelamento',
      // Tabela: Medidas Clientes
      'Base Dual Net', 'BASE GERAL', 'Base Planet',
      'Calculo Base Ativos Mês Anterior', 'Calculo Base Cancelados',
      'Contratos Ativos', 'Novos Clientes',
      // Tabela: Medidas Financeiro
      '$ Valor Reajuste', 'Diferença Nv. Negocios e Cancelalemnto', 'New Can.',
      'Novos Negócios', 'Real Cancelamento', 'Receita', 'Ticket Medio',
      // Tabela: Recebimentos
      'Juros1',
    ];

    const escapar = n => n.replace(/"/g, '""');

    // Consulta uma por uma com CALCULATE + filtro Ano=2026, Mês=2 (fev).
    // Mais lento que batch, mas resiliente — se uma medida der erro (nome de
    // coluna dCalendario diferente ou outro problema), as outras seguem.
    const resultados = [];
    for (const m of medidasAlvo) {
      try {
        const dax = `EVALUATE ROW("v", CALCULATE([${m}], dCalendario[Ano]=2026, dCalendario[Mês numero]=2))`;
        const r = await executarDAX(token, dax);
        resultados.push({ nome: m, valor: r[0]?.['[v]'], ok: true });
      } catch (err) {
        // Tenta sem filtro (retorna total anual) — pra pelo menos saber se a medida existe
        try {
          const r = await executarDAX(token, `EVALUATE ROW("v", [${m}])`);
          resultados.push({ nome: m, valor: r[0]?.['[v]'], ok: true, anual: true });
        } catch (_) {
          resultados.push({ nome: m, ok: false });
        }
      }
    }

    log(`Consulta de ${medidasAlvo.length} medidas concluída:`, 'ok');
    console.log('');
    console.log('  Valores de fev/2026 (compare com o print do relatório):');
    console.log('  ' + '─'.repeat(78));
    for (const r of resultados) {
      if (!r.ok) {
        console.log(`  ✗ ${r.nome.padEnd(42)} [erro ao consultar]`);
      } else {
        const vfmt = typeof r.valor === 'number'
          ? r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : String(r.valor);
        const flag = r.anual ? ' (anual!)' : '';
        console.log(`  ✓ ${r.nome.padEnd(42)} ${vfmt.padStart(18)}${flag}`);
      }
    }
    console.log('  ' + '─'.repeat(78));

    log('Pronto. Valores listados acima — hora de mapear cada card.', 'ok');
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
