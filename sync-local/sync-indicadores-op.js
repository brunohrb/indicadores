#!/usr/bin/env node
// =====================================================
// Sincroniza dados operacionais do IXC → Supabase
// OS 1ª Mensalidade, Cancelamentos, Vendas por rede
// Roda LOCAL, do PC do escritório (IP autorizado no IXC).
// Grava em app_storage: ixc_op_YYYY-MM
// =====================================================

const https = require('https');

const IXC_URL   = 'https://ixcsoft.texnet.net.br';
const IXC_TOKEN = '185:ef49bcecf6129a5b61690ac3da0ab99acdaca9171ea63d06cc403a73eef8c547';
const SB_URL    = 'https://xuwwgprchhfshrqdhuqn.supabase.co';
const SB_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1d3dncHJjaGhmc2hycWRodXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTI0NTQsImV4cCI6MjA4MjUyODQ1NH0.MEUMQ4_z1R5tF3_wQbEj_eTitGJia03b0M0LT3aOAnc';
const BASIC = 'Basic ' + Buffer.from(IXC_TOKEN).toString('base64');

// Filiais conhecidas (do Power BI)
const FILIAIS_VTAL_FOR  = [3, 5, 29];          // Rede VTAL Fortaleza (estimativa)
const FILIAIS_VTAL_FORA = [43, 45, 47];         // Rede VTAL Fora (estimativa)
const FILIAIS_PF_TEXNET = [1, 2, 10, 20, 22, 26, 27, 28]; // Rede Texnet PF
const FILIAIS_PJ        = [12, 13, 14, 16, 17, 18, 19, 21, 31, 33, 35, 37, 39];

// Mês a sincronizar: padrão = mês atual, ou passe argumento ex: node sync-indicadores-op.js 2026-05
const argMes = process.argv[2];
const hoje = new Date();
const anoMes = argMes || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
const [anoStr, mesStr] = anoMes.split('-');
const ano = parseInt(anoStr);
const mes = parseInt(mesStr);
const dataIni = `${anoStr}-${mesStr}-01`;
const ultimoDia = new Date(ano, mes, 0).getDate();
const dataFim   = `${anoStr}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`;

console.log(`\n📅 Sincronizando dados operacionais: ${anoMes} (${dataIni} a ${dataFim})\n`);

function postJSON(urlStr, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const payload = JSON.stringify(bodyObj);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(payload) }, timeout: 90000,
    }, (res) => { let d = ''; res.on('data', (c) => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('tempo esgotado')));
    req.write(payload); req.end();
  });
}

async function ixc(tabela, body) {
  const r = await postJSON(`${IXC_URL}/webservice/v1/${tabela}`,
    { Authorization: BASIC, 'Content-Type': 'application/json', ixcsoft: 'listar' }, body);
  let j; try { j = JSON.parse(r.body); } catch { throw new Error(`IXC ${tabela} HTTP ${r.status}: ${r.body.slice(0, 200)}`); }
  if (j && j.type === 'error') throw new Error(`IXC ${tabela}: ${j.message}`);
  return { registros: Array.isArray(j.registros) ? j.registros : [], total: parseInt(j.total) || 0 };
}

async function listarTodos(tabela, filtros, pageSize = 1000, maxPages = 200) {
  let page = 1, todos = [], total = 0;
  while (page <= maxPages) {
    const { registros, total: t } = await ixc(tabela, { ...filtros, page: String(page), rp: String(pageSize) });
    todos.push(...registros); total = t;
    process.stdout.write(`\r   ${tabela}: ${todos.length}/${total || '?'}     `);
    if (todos.length >= total || registros.length < pageSize) break;
    page++;
    await new Promise(r => setTimeout(r, 200));
  }
  process.stdout.write('\n');
  return todos;
}

async function upsert(key, value) {
  const r = await postJSON(`${SB_URL}/rest/v1/app_storage?on_conflict=key`,
    { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    { key, value: JSON.stringify(value), updated_at: new Date().toISOString() });
  if (r.status >= 300) throw new Error(`Supabase ${key} HTTP ${r.status}: ${r.body.slice(0, 200)}`);
}

function classRede(idFilial) {
  const f = parseInt(idFilial) || 0;
  if (FILIAIS_VTAL_FOR.includes(f))  return 'vtal_fortaleza';
  if (FILIAIS_VTAL_FORA.includes(f)) return 'vtal_fora';
  if (FILIAIS_PJ.includes(f))        return 'pj';
  return 'texnet'; // default: filial Texnet PF
}

(async () => {
  const resultado = { anoMes, geradoEm: new Date().toISOString() };

  // ──────────────────────────────────────────────────────────────────
  // 1. CANCELAMENTOS DO MÊS (por filial/rede + motivo)
  // ──────────────────────────────────────────────────────────────────
  console.log('1/3 Cancelamentos do mês...');
  try {
    // Tenta filtrar por status C/D e depois filtra por data localmente
    // (evita campo data_desativacao que pode não existir nesta versão do IXC)
    const contratos = await listarTodos('cliente_contrato', {
      qtype: 'cliente_contrato.status',
      query: 'C',
      oper: '=',
      sortname: 'cliente_contrato.id',
      sortorder: 'desc',
    });

    // Campos possíveis de data de cancelamento em diferentes versões do IXC
    const canceladosMes = contratos.filter(c => {
      const dt = (c.data_cancelamento || c.data_desativacao || c.data_rescisao || c.updated_at || '').slice(0, 10);
      return dt >= dataIni && dt <= dataFim;
    });

    const por_rede = { texnet: [], vtal_fortaleza: [], vtal_fora: [], pj: [] };
    const motivos  = {};

    for (const c of canceladosMes) {
      const rede = classRede(c.id_filial || c.filial);
      (por_rede[rede] = por_rede[rede] || []).push(c.id);
      const m = (c.motivo_cancelamento || c.motivo || 'desconhecido').toString().toLowerCase();
      motivos[m] = (motivos[m] || 0) + 1;
    }

    // Tenta identificar "Retenção" por motivo
    const retencao = Object.entries(motivos)
      .filter(([k]) => k.includes('reten') || k.includes('desistiu') || k.includes('manteve'))
      .reduce((s, [, v]) => s + v, 0);

    resultado.cancelamentos = {
      total:          canceladosMes.length,
      texnet:         (por_rede.texnet || []).length,
      vtal_fortaleza: (por_rede.vtal_fortaleza || []).length,
      vtal_fora:      (por_rede.vtal_fora || []).length,
      pj:             (por_rede.pj || []).length,
      retencao_estimada: retencao,
      top_motivos:    Object.entries(motivos).sort((a, b) => b[1] - a[1]).slice(0, 10),
    };
    console.log(`   ✅ ${canceladosMes.length} cancelamentos encontrados`);
  } catch (e) {
    console.log(`   ⚠️  Cancelamentos: ${e.message}`);
    resultado.cancelamentos = { erro: e.message };
  }

  // ──────────────────────────────────────────────────────────────────
  // 2. NOVOS CONTRATOS DO MÊS (vendas por rede)
  // ──────────────────────────────────────────────────────────────────
  console.log('2/3 Novos contratos do mês (vendas por rede)...');
  try {
    const novos = await listarTodos('cliente_contrato', {
      qtype: 'cliente_contrato.data_ativacao',
      query: dataIni,
      oper: '>=',
      sortname: 'cliente_contrato.id',
      sortorder: 'desc',
    });

    const novosMes = novos.filter(c => {
      const dt = (c.data_ativacao || '').slice(0, 10);
      return dt >= dataIni && dt <= dataFim;
    });

    const por_rede = {};
    for (const c of novosMes) {
      const rede = classRede(c.id_filial || c.filial);
      if (!por_rede[rede]) por_rede[rede] = { qtd: 0, ids_filial: new Set() };
      por_rede[rede].qtd++;
      por_rede[rede].ids_filial.add(String(c.id_filial || c.filial || '?'));
    }

    // Serializar Sets pra JSON
    const por_rede_serial = {};
    for (const [k, v] of Object.entries(por_rede)) {
      por_rede_serial[k] = { qtd: v.qtd, filiais_encontradas: [...v.ids_filial].sort() };
    }

    resultado.vendas_por_rede = {
      total:          novosMes.length,
      por_rede:       por_rede_serial,
      aviso:          'Filiais VTAL_FOR/VTAL_FORA sao estimativas — conferir com a diretora quais filiais sao VTAL',
    };
    console.log(`   ✅ ${novosMes.length} novos contratos encontrados`);
  } catch (e) {
    console.log(`   ⚠️  Vendas por rede: ${e.message}`);
    resultado.vendas_por_rede = { erro: e.message };
  }

  // ──────────────────────────────────────────────────────────────────
  // 3. OS DO MÊS (suporte + inadimplência + 1ª mensalidade)
  // ──────────────────────────────────────────────────────────────────
  console.log('3/3 Ordens de Serviço do mês...');
  try {
    const os = await listarTodos('sn_oss', {
      qtype: 'sn_oss.data_abertura',
      query: dataIni,
      oper: '>=',
      sortname: 'sn_oss.id',
      sortorder: 'desc',
    });

    const osMes = os.filter(o => {
      const dt = (o.data_abertura || '').slice(0, 10);
      return dt >= dataIni && dt <= dataFim;
    });

    const tipos = {};
    for (const o of osMes) {
      const t = (o.tipo || o.descricao_tipo || o.tipo_oss || 'desconhecido').toString();
      tipos[t] = (tipos[t] || 0) + 1;
    }

    // Tenta identificar OS de 1ª mensalidade e inadimplência por nome do tipo
    const os1men = osMes.filter(o => {
      const t = (o.tipo || o.descricao_tipo || o.tipo_oss || '').toString().toLowerCase();
      return t.includes('1') && (t.includes('men') || t.includes('mens'));
    });
    const osInadimp = osMes.filter(o => {
      const t = (o.tipo || o.descricao_tipo || o.tipo_oss || '').toString().toLowerCase();
      return t.includes('inadimp') || t.includes('cobran') || t.includes('boleto');
    });

    resultado.ordens_servico = {
      total_mes:       osMes.length,
      os_1mensalidade: os1men.length,
      os_inadimplencia: osInadimp.length,
      top_tipos:       Object.entries(tipos).sort((a, b) => b[1] - a[1]).slice(0, 15),
      aviso:           'Classif. de 1a mensalidade/inadimp. baseada no nome do tipo — confirmar com diretora',
    };
    console.log(`   ✅ ${osMes.length} OS encontradas (${os1men.length} possível 1ª men., ${osInadimp.length} possível inadimp.)`);
  } catch (e) {
    console.log(`   ⚠️  OS: ${e.message}`);
    resultado.ordens_servico = { erro: e.message };
  }

  // ──────────────────────────────────────────────────────────────────
  // Salva no Supabase
  // ──────────────────────────────────────────────────────────────────
  const key = `ixc_op_${anoMes}`;
  console.log(`\n💾 Salvando em app_storage["${key}"]...`);
  await upsert(key, resultado);
  await upsert('ixc_op_sync', { timestamp: new Date().toISOString(), ultimo_mes: anoMes });

  console.log('\n✅ Pronto!');
  console.log(`   Cancelamentos: ${resultado.cancelamentos?.total ?? 'erro'}`);
  console.log(`   Vendas/novos:  ${resultado.vendas_por_rede?.total ?? 'erro'}`);
  console.log(`   OS abertas:    ${resultado.ordens_servico?.total_mes ?? 'erro'}`);

  if (resultado.vendas_por_rede?.por_rede) {
    console.log('\n   Filiais encontradas nos novos contratos:');
    for (const [rede, v] of Object.entries(resultado.vendas_por_rede.por_rede)) {
      console.log(`   ${rede}: ${v.qtd} contratos — filiais: ${v.filiais_encontradas.join(', ')}`);
    }
    console.log('\n   ⚠️  Confira as filiais acima com a diretora para confirmar quais são VTAL.');
  }

})().catch((e) => {
  console.error('\n❌ ERRO:', e.message);
  console.error('   Se for erro de IP/tempo esgotado, certifique-se de estar no escritório (IP autorizado).');
  process.exit(1);
});
