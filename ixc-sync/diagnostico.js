#!/usr/bin/env node
/**
 * ixc-sync/diagnostico.js
 * Diagnóstico e reparo dos dados IXC no Supabase.
 *
 * Uso:
 *   node diagnostico.js                  — lista todos os registros IXC
 *   node diagnostico.js --limpar 2026-03 — apaga chaves zeradas de um mês
 *   node diagnostico.js --apagar 2026-03 — força remoção de TODAS as chaves do mês
 */

const { createClient } = require('@supabase/supabase-js');

const SB_URL = 'https://xuwwgprchhfshrqdhuqn.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1d3dncHJjaGhmc2hycWRodXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTI0NTQsImV4cCI6MjA4MjUyODQ1NH0.MEUMQ4_z1R5tF3_wQbEj_eTitGJia03b0M0LT3aOAnc';

const sb = createClient(SB_URL, SB_KEY);

const TIPOS_MES   = ['receitas', 'despesas', 'fluxo', 'comercial'];
const TIPOS_FIXOS = ['ixc_operacional', 'ixc_ultima_sync'];

// ── helpers ────────────────────────────────────────────────────────────────

function eZerado(valor) {
  if (!valor || typeof valor !== 'object') return true;
  const nums = Object.values(valor).filter(v => typeof v === 'number');
  return nums.length > 0 && nums.every(v => v === 0);
}

function resumirValor(valor) {
  if (!valor) return '(nulo)';
  if (typeof valor !== 'object') return String(valor);
  const campos = Object.entries(valor)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `${k}: ${v.toLocaleString('pt-BR')}`);
  return campos.length ? campos.join(' | ') : JSON.stringify(valor).slice(0, 80);
}

// ── lista tudo ─────────────────────────────────────────────────────────────

async function listar() {
  console.log('\n📋  DADOS IXC NO SUPABASE\n' + '─'.repeat(70));

  const { data, error } = await sb
    .from('app_storage')
    .select('key, value, updated_at')
    .like('key', 'ixc_%')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌  Erro ao acessar Supabase:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('⚠️   Nenhum registro IXC encontrado na tabela app_storage.');
    return;
  }

  const problemas = [];

  for (const row of data) {
    let valor;
    try { valor = JSON.parse(row.value); } catch { valor = null; }

    const zerado  = eZerado(valor);
    const dt      = new Date(row.updated_at).toLocaleString('pt-BR');
    const status  = zerado ? '🔴 ZERADO' : '🟢 OK';
    const resumo  = resumirValor(valor);

    console.log(`\n${status}  ${row.key}`);
    console.log(`   Atualizado : ${dt}`);
    console.log(`   Dados      : ${resumo}`);

    if (zerado) problemas.push(row.key);
  }

  console.log('\n' + '─'.repeat(70));
  if (problemas.length === 0) {
    console.log('✅  Todos os registros têm valores.\n');
  } else {
    console.log(`\n⚠️   ${problemas.length} chave(s) com valores ZERADOS:`);
    problemas.forEach(k => console.log(`   • ${k}`));
    console.log('\n💡  Para limpar as chaves zeradas de um mês, rode:');
    const meses = [...new Set(problemas
      .map(k => k.match(/(\d{4}-\d{2})$/)?.[1])
      .filter(Boolean))];
    meses.forEach(m => console.log(`   node diagnostico.js --limpar ${m}`));
    console.log();
  }
}

// ── limpar entradas zeradas de um mês ──────────────────────────────────────

async function limparMes(anoMes) {
  console.log(`\n🧹  Limpando chaves zeradas de ${anoMes}...\n`);
  let removidas = 0;

  for (const tipo of TIPOS_MES) {
    const chave = `ixc_${tipo}_${anoMes}`;
    const { data } = await sb.from('app_storage').select('value').eq('key', chave).maybeSingle();
    if (!data) { console.log(`   ⏭️  ${chave} — não existe, pulando`); continue; }

    let valor;
    try { valor = JSON.parse(data.value); } catch { valor = null; }

    if (eZerado(valor)) {
      const { error } = await sb.from('app_storage').delete().eq('key', chave);
      if (error) {
        console.log(`   ❌  ${chave} — erro ao remover: ${error.message}`);
      } else {
        console.log(`   ✅  ${chave} — REMOVIDO (estava zerado)`);
        removidas++;
      }
    } else {
      console.log(`   ✔️   ${chave} — tem dados reais, mantido`);
    }
  }

  // Atualiza ixc_ultima_sync removendo o mês se estiver zerado
  const { data: syncRow } = await sb.from('app_storage').select('value').eq('key', 'ixc_ultima_sync').maybeSingle();
  if (syncRow) {
    try {
      const sync = JSON.parse(syncRow.value);
      const meses = (sync.meses || []).filter(m => m !== anoMes);
      if (meses.length !== (sync.meses || []).length) {
        await sb.from('app_storage').upsert(
          { key: 'ixc_ultima_sync', value: JSON.stringify({ ...sync, meses }), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
        console.log(`   ✅  ixc_ultima_sync — mês ${anoMes} removido da lista`);
      }
    } catch { /* ignora */ }
  }

  console.log(`\n📊  ${removidas} chave(s) removida(s).`);
  if (removidas > 0) {
    console.log(`\n💡  O dashboard agora mostrará "Sem dados para este período" em vez de zeros.`);
    console.log(`   Rode o script de sincronização para repopular: node sync.js --mes ${anoMes}\n`);
  }
}

// ── forçar remoção total de um mês ─────────────────────────────────────────

async function apagarMes(anoMes) {
  const conf = process.argv.includes('--sim');
  if (!conf) {
    console.log(`\n⚠️   Isso vai APAGAR TODAS as chaves de ${anoMes} (zeradas ou não).`);
    console.log(`   Para confirmar, adicione --sim ao comando:\n`);
    console.log(`   node diagnostico.js --apagar ${anoMes} --sim\n`);
    return;
  }

  console.log(`\n🗑️   Apagando todas as chaves de ${anoMes}...\n`);
  for (const tipo of TIPOS_MES) {
    const chave = `ixc_${tipo}_${anoMes}`;
    const { error } = await sb.from('app_storage').delete().eq('key', chave);
    console.log(error ? `   ❌  ${chave} — ${error.message}` : `   ✅  ${chave} — removido`);
  }
  console.log();
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--limpar')) {
    const anoMes = args[args.indexOf('--limpar') + 1];
    if (!anoMes || !/^\d{4}-\d{2}$/.test(anoMes)) {
      console.error('Uso: node diagnostico.js --limpar YYYY-MM');
      process.exit(1);
    }
    await limparMes(anoMes);
    return;
  }

  if (args.includes('--apagar')) {
    const anoMes = args[args.indexOf('--apagar') + 1];
    if (!anoMes || !/^\d{4}-\d{2}$/.test(anoMes)) {
      console.error('Uso: node diagnostico.js --apagar YYYY-MM [--sim]');
      process.exit(1);
    }
    await apagarMes(anoMes);
    return;
  }

  await listar();
}

main().catch(e => { console.error(e); process.exit(1); });
