#!/usr/bin/env node
// =====================================================
// Sincroniza CLIENTES do IXC → Supabase (pra o Coach IA responder)
// Roda LOCAL, do PC do escritório (IP autorizado no IXC).
// SEM dependências (só módulos nativos do Node). Dois cliques no .bat.
// Grava em app_storage: ixc_clientes (lista) + ixc_clientes_sync (data).
// =====================================================

const https = require('https');

const IXC_URL   = 'https://ixcsoft.texnet.net.br';
const IXC_TOKEN = '185:ef49bcecf6129a5b61690ac3da0ab99acdaca9171ea63d06cc403a73eef8c547';
const SB_URL    = 'https://xuwwgprchhfshrqdhuqn.supabase.co';
const SB_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1d3dncHJjaGhmc2hycWRodXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTI0NTQsImV4cCI6MjA4MjUyODQ1NH0.MEUMQ4_z1R5tF3_wQbEj_eTitGJia03b0M0LT3aOAnc';
const BASIC = 'Basic ' + Buffer.from(IXC_TOKEN).toString('base64');

function postJSON(urlStr, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const payload = JSON.stringify(bodyObj);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(payload) }, timeout: 120000,
    }, (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('tempo esgotado')));
    req.write(payload); req.end();
  });
}

async function ixc(tabela, body) {
  const r = await postJSON(`${IXC_URL}/webservice/v1/${tabela}`, { Authorization: BASIC, 'Content-Type': 'application/json', ixcsoft: 'listar' }, body);
  let j; try { j = JSON.parse(r.body); } catch { throw new Error(`IXC ${tabela} HTTP ${r.status}: ${r.body.slice(0, 150)}`); }
  if (j && j.type === 'error') throw new Error(`IXC ${tabela}: ${j.message}`);
  return { registros: Array.isArray(j.registros) ? j.registros : [], total: parseInt(j.total) || 0 };
}

async function listarTodos(tabela, filtros, pageSize = 1000, maxPages = 300) {
  let page = 1, todos = [], total = 0;
  while (page <= maxPages) {
    const { registros, total: t } = await ixc(tabela, { ...filtros, page: String(page), rp: String(pageSize) });
    todos.push(...registros); total = t;
    process.stdout.write(`\r   ${tabela}: ${todos.length}/${total}     `);
    if (todos.length >= total || registros.length < pageSize) break;
    page++;
    await new Promise((r) => setTimeout(r, 150));
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

(async () => {
  console.log('\n🔄 Sincronizando clientes do IXC para o sistema (Coach IA)...\n');

  console.log('1/3 Baixando clientes...');
  const clientes = await listarTodos('cliente', { qtype: 'cliente.id', query: '0', oper: '>', sortname: 'cliente.id', sortorder: 'asc' });

  console.log('2/3 Baixando contratos (plano)...');
  const planoPorCliente = {};
  try {
    const contratos = await listarTodos('cliente_contrato', { qtype: 'cliente_contrato.id', query: '0', oper: '>', sortname: 'cliente_contrato.id', sortorder: 'asc' });
    for (const ct of contratos) {
      const k = String(ct.id_cliente);
      if (!planoPorCliente[k] || Number(ct.id) > Number(planoPorCliente[k]._id)) {
        planoPorCliente[k] = { plano: ct.contrato, status: ct.status, _id: ct.id };
      }
    }
  } catch (e) { console.log('   (sem plano: ' + e.message + ')'); }

  console.log('3/3 Baixando faturas recentes (valor mensal)...');
  const valorPorCliente = {};
  try {
    const ini = new Date(); ini.setMonth(ini.getMonth() - 2);
    const dataIni = ini.toISOString().slice(0, 10);
    let page = 1;
    while (page <= 300) {
      const { registros } = await ixc('fn_areceber', { qtype: 'fn_areceber.data_vencimento', query: dataIni, oper: '>=', sortname: 'fn_areceber.id', sortorder: 'desc', page: String(page), rp: '2000' });
      for (const f of registros) { const k = String(f.id_cliente); if (valorPorCliente[k] === undefined) valorPorCliente[k] = Number(f.valor) || 0; }
      process.stdout.write(`\r   faturas: pagina ${page} (${Object.keys(valorPorCliente).length} clientes c/ valor)     `);
      if (registros.length < 2000) break;
      page++;
      await new Promise((r) => setTimeout(r, 150));
    }
    process.stdout.write('\n');
  } catch (e) { console.log('   (sem valor: ' + e.message + ')'); }

  const lista = clientes.map((c) => ({
    id: c.id,
    nome: c.razao || c.fantasia,
    cpf: c.cnpj_cpf,
    ativo: c.ativo,
    valor: valorPorCliente[String(c.id)] ?? null,
    plano: planoPorCliente[String(c.id)] ? planoPorCliente[String(c.id)].plano : null,
  }));

  console.log(`\nEnviando ${lista.length} clientes pro Supabase...`);
  await upsert('ixc_clientes', lista);
  await upsert('ixc_clientes_sync', { timestamp: new Date().toISOString(), total: lista.length });

  console.log(`\n✅ Pronto! ${lista.length} clientes sincronizados. Agora pergunte no Coach IA: "quanto o cliente X paga?"`);
})().catch((e) => { console.error('\n❌ ERRO:', e.message); console.error('   Se for erro de IP/tempo esgotado, libere o IP deste PC no IXC.'); process.exit(1); });
