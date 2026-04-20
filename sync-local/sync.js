#!/usr/bin/env node
// =====================================================
// IXC → Supabase Sync — Versão LOCAL (roda no PC do escritório)
// Uso: dê dois cliques em sync.bat (Windows) ou sync.command (Mac)
// ou pela linha de comando: node sync.js [--mes YYYY-MM] [--full]
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const dayjs = require('dayjs');
const axios = require('axios');

// ─── Config embutida ─────────────────────────────────
const cfg = {
  IXC_URL:   process.env.IXC_URL   || 'https://ixcsoft.texnet.net.br',
  IXC_TOKEN: process.env.IXC_TOKEN || '185:ef49bcecf6129a5b61690ac3da0ab99acdaca9171ea63d06cc403a73eef8c547',
  SB_URL:    process.env.SB_URL    || 'https://xuwwgprchhfshrqdhuqn.supabase.co',
  SB_KEY:    process.env.SB_KEY    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1d3dncHJjaGhmc2hycWRodXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTI0NTQsImV4cCI6MjA4MjUyODQ1NH0.MEUMQ4_z1R5tF3_wQbEj_eTitGJia03b0M0LT3aOAnc',
  PAGE_SIZE: 2000,
  MESES_HISTORICO: 12,
};

const sb = createClient(cfg.SB_URL, cfg.SB_KEY);
const BASIC = `Basic ${Buffer.from(cfg.IXC_TOKEN).toString('base64')}`;
const http = axios.create({
  baseURL: `${cfg.IXC_URL}/webservice/v1`,
  headers: { Authorization: BASIC, 'Content-Type': 'application/json' },
  timeout: 60000,
});

// ─── Utilitários ─────────────────────────────────────

function log(msg, tipo = 'info') {
  const cor = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', erro: '\x1b[31m' };
  const reset = '\x1b[0m';
  const hora = new Date().toLocaleTimeString('pt-BR');
  console.log(`${cor[tipo] || ''}[${hora}] ${msg}${reset}`);
}

function moeda(v) {
  return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

async function ixcPost(tabela, body) {
  const { data } = await http.post(`/${tabela}`, body, { headers: { ixcsoft: 'listar' } });
  if (data.type === 'error') throw new Error(`IXC API erro em ${tabela}: ${data.message}`);
  return data;
}

async function listarTodos(tabela, filtros = {}, opcoes = {}) {
  const pageSize = opcoes.pageSize || cfg.PAGE_SIZE;
  const maxRegistros = opcoes.maxRegistros || Infinity;
  let page = 1;
  let totalRegistros = 0;
  const todos = [];
  while (true) {
    const data = await ixcPost(tabela, { ...filtros, page: String(page), rp: String(pageSize) });
    const registros = data.registros || [];
    todos.push(...registros);
    totalRegistros = parseInt(data.total) || 0;
    if (todos.length >= totalRegistros || todos.length >= maxRegistros || registros.length < pageSize) break;
    page++;
    await new Promise(r => setTimeout(r, 200));
  }
  return { registros: todos, total: totalRegistros };
}

async function contar(tabela, filtros = {}) {
  const data = await ixcPost(tabela, { ...filtros, page: '1', rp: '1' });
  return parseInt(data.total) || 0;
}

// ─── Supabase ────────────────────────────────────────

async function salvarSupabase(chave, valor) {
  const { error } = await sb.from('app_storage').upsert(
    { key: chave, value: JSON.stringify(valor), updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) throw new Error(`Supabase erro: ${error.message}`);
}

// ─── Sync de Receitas ─────────────────────────────────

async function syncReceitas(anoMes) {
  const dataIni = `${anoMes}-01`;
  const dataFim = dayjs(dataIni).endOf('month').format('YYYY-MM-DD');
  log(`  📥 Receitas ${anoMes}: buscando fn_areceber...`);

  let totalRecebido = 0, totalEmitido = 0, countRecebido = 0, countEmitido = 0;
  let page = 1;

  while (true) {
    const data = await ixcPost('fn_areceber', {
      qtype: 'fn_areceber.baixa_data',
      query: dataIni, oper: '>=',
      sortname: 'fn_areceber.baixa_data', sortorder: 'asc',
      page: String(page), rp: String(cfg.PAGE_SIZE),
    });
    const registros = data.registros || [];
    const totalPagina = parseInt(data.total) || 0;

    for (const r of registros) {
      const baixa = (r.baixa_data || '').substring(0, 10);
      if (baixa >= dataIni && baixa <= dataFim) {
        totalRecebido += parseFloat(r.valor_recebido || 0);
        countRecebido++;
      }
      const emissao = (r.data_emissao || '').substring(0, 10);
      if (emissao >= dataIni && emissao <= dataFim) {
        totalEmitido += parseFloat(r.valor || 0);
        countEmitido++;
      }
    }

    const ultima = registros.length > 0 ? (registros[registros.length - 1].baixa_data || '').substring(0, 10) : '';
    if (ultima > dataFim || registros.length < cfg.PAGE_SIZE || page * cfg.PAGE_SIZE >= totalPagina) break;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }

  let totalJurosMulta = 0;
  try {
    const { registros } = await listarTodos('fn_areceber', {
      qtype: 'fn_areceber.baixa_data', query: dataIni, oper: '>=',
    });
    totalJurosMulta = registros
      .filter(r => (r.baixa_data || '').substring(0, 10) <= dataFim && r.tipo_cobranca === 'J')
      .reduce((s, r) => s + parseFloat(r.valor_recebido || 0), 0);
  } catch (e) { log(`     Aviso juros: ${e.message}`, 'warn'); }

  return {
    anoMes,
    totalRecebido: Math.round(totalRecebido * 100) / 100,
    totalEmitido: Math.round(totalEmitido * 100) / 100,
    totalJurosMulta: Math.round(totalJurosMulta * 100) / 100,
    countRecebido, countEmitido,
  };
}

// ─── Sync de Despesas ─────────────────────────────────

async function syncDespesas(anoMes) {
  const dataIni = `${anoMes}-01`;
  const dataFim = dayjs(dataIni).endOf('month').format('YYYY-MM-DD');
  log(`  📤 Despesas ${anoMes}: buscando fn_apagar...`);

  let totalPago = 0, countPago = 0;
  const porConta = {};
  let page = 1;

  while (true) {
    const data = await ixcPost('fn_apagar', {
      qtype: 'fn_apagar.data_pagamento',
      query: dataIni, oper: '>=',
      sortname: 'fn_apagar.data_pagamento', sortorder: 'asc',
      page: String(page), rp: String(cfg.PAGE_SIZE),
    });
    const registros = data.registros || [];
    const totalPagina = parseInt(data.total) || 0;

    for (const r of registros) {
      const dtPag = (r.data_pagamento || '').substring(0, 10);
      if (dtPag >= dataIni && dtPag <= dataFim) {
        const vPago = parseFloat(r.valor_pago || r.valor_total_pago || 0);
        totalPago += vPago;
        countPago++;
        const idConta = r.id_contas || r.id_conta || 'outros';
        if (!porConta[idConta]) porConta[idConta] = { id: idConta, total: 0, count: 0, obs: r.obs || '' };
        porConta[idConta].total += vPago;
        porConta[idConta].count++;
      }
    }

    const ultima = registros.length > 0 ? (registros[registros.length - 1].data_pagamento || '').substring(0, 10) : '';
    if (ultima > dataFim || registros.length < cfg.PAGE_SIZE || page * cfg.PAGE_SIZE >= totalPagina) break;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }

  return {
    anoMes,
    totalPago: Math.round(totalPago * 100) / 100,
    countPago,
    porConta: Object.values(porConta).sort((a, b) => b.total - a.total),
  };
}

// ─── Sync Operacional ─────────────────────────────────

async function syncOperacional() {
  log('  🔢 Operacional: clientes e usuários...');
  const [clientesAtivos, usuariosAtivos, clientesTotal, clientesPF, clientesPJ] = await Promise.all([
    contar('cliente', { qtype: 'cliente.ativo', query: 'S', oper: '=' }),
    contar('radusuarios', { qtype: 'radusuarios.ativo', query: 'S', oper: '=' }),
    contar('cliente', {}),
    contar('cliente', { qtype: 'cliente.tipo_pessoa', query: 'F', oper: '=' }),
    contar('cliente', { qtype: 'cliente.tipo_pessoa', query: 'J', oper: '=' }),
  ]);
  return { clientesAtivos, usuariosAtivos, clientesTotal, clientesPF, clientesPJ, atualizadoEm: new Date().toISOString() };
}

// ─── Sync Fluxo de Caixa ─────────────────────────────

async function syncFluxoCaixa(anoMes) {
  const dataIni = `${anoMes}-01`;
  const dataFim = dayjs(dataIni).endOf('month').format('YYYY-MM-DD');
  log(`  💰 Fluxo de caixa ${anoMes}: agregando por dia...`);

  const entradas = {}, saidas = {};

  let page = 1;
  while (true) {
    const data = await ixcPost('fn_areceber', {
      qtype: 'fn_areceber.baixa_data', query: dataIni, oper: '>=',
      page: String(page), rp: String(cfg.PAGE_SIZE),
    });
    const registros = data.registros || [];
    for (const r of registros) {
      const dia = (r.baixa_data || '').substring(0, 10);
      if (dia < dataIni || dia > dataFim) continue;
      entradas[dia] = (entradas[dia] || 0) + parseFloat(r.valor_recebido || 0);
    }
    const ultima = registros.length > 0 ? (registros[registros.length - 1].baixa_data || '').substring(0, 10) : '';
    if (ultima > dataFim || registros.length < cfg.PAGE_SIZE) break;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }

  page = 1;
  while (true) {
    const data = await ixcPost('fn_apagar', {
      qtype: 'fn_apagar.data_pagamento', query: dataIni, oper: '>=',
      page: String(page), rp: String(cfg.PAGE_SIZE),
    });
    const registros = data.registros || [];
    for (const r of registros) {
      const dia = (r.data_pagamento || '').substring(0, 10);
      if (dia < dataIni || dia > dataFim) continue;
      saidas[dia] = (saidas[dia] || 0) + parseFloat(r.valor_pago || r.valor_total_pago || 0);
    }
    const ultima = registros.length > 0 ? (registros[registros.length - 1].data_pagamento || '').substring(0, 10) : '';
    if (ultima > dataFim || registros.length < cfg.PAGE_SIZE) break;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }

  const dias = [];
  let saldo = 0;
  let dia = dayjs(dataIni);
  const fim = dayjs(dataFim);
  while (dia.isBefore(fim) || dia.isSame(fim, 'day')) {
    const d = dia.format('YYYY-MM-DD');
    const e = Math.round((entradas[d] || 0) * 100) / 100;
    const s = Math.round((saidas[d] || 0) * 100) / 100;
    saldo += e - s;
    dias.push({ data: d, entrada: e, saida: s, saldo: Math.round(saldo * 100) / 100 });
    dia = dia.add(1, 'day');
  }
  return { anoMes, dias };
}

// ─── DEBUG — imprime campos crus de registros fn_areceber ──

async function debugReceitas(anoMes) {
  const dataIni = `${anoMes}-01`;
  const dataFim = dayjs(dataIni).endOf('month').format('YYYY-MM-DD');
  log(`\n🔍 DEBUG Receitas ${anoMes} — buscando amostras...`);

  const data = await ixcPost('fn_areceber', {
    qtype: 'fn_areceber.baixa_data', query: dataIni, oper: '>=',
    sortname: 'fn_areceber.baixa_data', sortorder: 'asc',
    page: '1', rp: '20',
  });

  const registros = (data.registros || []).filter(r => {
    const d = (r.baixa_data || '').substring(0, 10);
    return d >= dataIni && d <= dataFim;
  }).slice(0, 5);

  if (!registros.length) {
    log('  Nenhum registro no período.', 'warn');
    return;
  }

  log(`\n📋 Campos do 1º registro (todos):`);
  console.log(JSON.stringify(registros[0], null, 2));

  log(`\n💰 Somando ${registros.length} registros de amostra com várias fórmulas:`);

  const formulas = {
    'valor_recebido (atual)':
      r => parseFloat(r.valor_recebido || 0),
    'valor':
      r => parseFloat(r.valor || 0),
    'valor - desconto - desconto_adicional':
      r => parseFloat(r.valor||0) - parseFloat(r.valor_desconto||0) - parseFloat(r.valor_desconto_adicional||0),
    'valor_recebido - desconto - desconto_adicional':
      r => parseFloat(r.valor_recebido||0) - parseFloat(r.valor_desconto||0) - parseFloat(r.valor_desconto_adicional||0),
    'valor + juros + multa - desconto - desconto_adicional':
      r => parseFloat(r.valor||0) + parseFloat(r.valor_juros||0) + parseFloat(r.valor_multa||0)
         - parseFloat(r.valor_desconto||0) - parseFloat(r.valor_desconto_adicional||0),
    'valor_baixa':
      r => parseFloat(r.valor_baixa || 0),
    'valor_liquido (se existir)':
      r => parseFloat(r.valor_liquido || 0),
  };

  for (const [nome, fn] of Object.entries(formulas)) {
    const soma = registros.reduce((s, r) => s + fn(r), 0);
    log(`   ${nome}  →  ${moeda(soma)}`);
  }

  log(`\n📊 Por registro — Baixa / Acréscimo / Desconto / Valor Líquido esperados:`);
  for (const r of registros) {
    console.log({
      id: r.id,
      cliente: r.id_cliente,
      baixa_data: r.baixa_data,
      valor: r.valor,
      valor_recebido: r.valor_recebido,
      valor_juros: r.valor_juros,
      valor_multa: r.valor_multa,
      valor_acrescimo: r.valor_acrescimo,
      valor_desconto: r.valor_desconto,
      valor_desconto_adicional: r.valor_desconto_adicional,
      valor_baixa: r.valor_baixa,
      valor_liquido: r.valor_liquido,
      tipo_cobranca: r.tipo_cobranca,
      status: r.status,
    });
  }

  log(`\n✅ Copia e cola TUDO isso pra eu diagnosticar e corrigir.`, 'ok');
}

// ─── MAIN ─────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const agora = dayjs();
  let meses = [];

  if (args.includes('--debug')) {
    const mesArg = args[args.indexOf('--debug') + 1];
    const anoMes = (mesArg && /^\d{4}-\d{2}$/.test(mesArg)) ? mesArg : agora.format('YYYY-MM');
    await debugReceitas(anoMes);
    return;
  }

  if (args.includes('--full')) {
    for (let i = cfg.MESES_HISTORICO - 1; i >= 0; i--) meses.push(agora.subtract(i, 'month').format('YYYY-MM'));
    log(`🔄 Sync COMPLETO — ${meses.length} meses (${meses[0]} → ${meses[meses.length - 1]})`);
  } else if (args.includes('--mes')) {
    const mesArg = args[args.indexOf('--mes') + 1];
    if (!mesArg || !/^\d{4}-\d{2}$/.test(mesArg)) { log('Uso: node sync.js --mes YYYY-MM', 'erro'); process.exit(1); }
    meses = [mesArg];
    log(`🔄 Sync MÊS ESPECÍFICO — ${mesArg}`);
  } else {
    meses = [agora.subtract(1, 'month').format('YYYY-MM'), agora.format('YYYY-MM')];
    log(`🔄 Sync PADRÃO — ${meses.join(', ')}`);
  }

  try {
    const op = await syncOperacional();
    await salvarSupabase('ixc_operacional', op);
    log(`  ✅ Operacional: ${op.clientesAtivos} ativos | ${op.usuariosAtivos} radius`, 'ok');
  } catch (e) { log(`  ❌ Operacional: ${e.message}`, 'erro'); }

  for (const anoMes of meses) {
    log(`\n📅 ${anoMes}`);
    try {
      const r = await syncReceitas(anoMes);
      await salvarSupabase(`ixc_receitas_${anoMes}`, r);
      log(`  ✅ Receitas: recebido ${moeda(r.totalRecebido)} (${r.countRecebido} tít.)`, 'ok');
    } catch (e) { log(`  ❌ Receitas: ${e.message}`, 'erro'); }

    try {
      const d = await syncDespesas(anoMes);
      await salvarSupabase(`ixc_despesas_${anoMes}`, d);
      log(`  ✅ Despesas: pago ${moeda(d.totalPago)} (${d.countPago} tít.)`, 'ok');
    } catch (e) { log(`  ❌ Despesas: ${e.message}`, 'erro'); }

    try {
      const f = await syncFluxoCaixa(anoMes);
      await salvarSupabase(`ixc_fluxo_${anoMes}`, f);
      log(`  ✅ Fluxo: ${f.dias.length} dias`, 'ok');
    } catch (e) { log(`  ❌ Fluxo: ${e.message}`, 'erro'); }
  }

  await salvarSupabase('ixc_ultima_sync', { timestamp: new Date().toISOString(), meses, versao: 'local-1.0' });
  log('\n🎉 Sync concluído! Abra o dashboard e clique em "Atualizar agora".', 'ok');
}

main().catch(e => { console.error('\n❌ ERRO FATAL:', e.message); process.exit(1); });