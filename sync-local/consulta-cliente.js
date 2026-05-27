#!/usr/bin/env node
// =====================================================
// Consulta de cliente no IXC — roda LOCAL (PC do escritório, IP autorizado)
// SEM dependências: usa só módulos nativos do Node (não precisa npm install).
// Uso: dê dois cliques em CONSULTAR-CLIENTE.bat
//   ou: node consulta-cliente.js "Lucas Peixoto Cavalcante"
// =====================================================

const https = require('https');
const readline = require('readline');

const IXC_URL   = 'https://ixcsoft.texnet.net.br';
const IXC_TOKEN = '185:ef49bcecf6129a5b61690ac3da0ab99acdaca9171ea63d06cc403a73eef8c547';
const BASIC = 'Basic ' + Buffer.from(IXC_TOKEN).toString('base64');

function ixc(tabela, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const u = new URL(`${IXC_URL}/webservice/v1/${tabela}`);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        Authorization: BASIC,
        'Content-Type': 'application/json',
        ixcsoft: 'listar',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 60000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); }
        catch { return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`)); }
        if (json && json.type === 'error') return reject(new Error(`IXC: ${json.message}`));
        resolve(Array.isArray(json.registros) ? json.registros : []);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('tempo esgotado (IP pode estar bloqueado no IXC)')));
    req.write(payload);
    req.end();
  });
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const brl = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

async function buscarClientes(termo) {
  const dig = termo.replace(/\D/g, '');
  let cl = [];
  if (dig.length >= 11) {
    cl = await ixc('cliente', { qtype: 'cliente.cnpj_cpf', query: dig, oper: '=', page: '1', rp: '5', sortname: 'cliente.id', sortorder: 'asc' });
  }
  if (!cl.length && /^\d+$/.test(termo)) {
    cl = await ixc('cliente', { qtype: 'cliente.id', query: termo, oper: '=', page: '1', rp: '5', sortname: 'cliente.id', sortorder: 'asc' });
  }
  if (!cl.length) {
    const pal = termo.split(/\s+/).filter((w) => w.length >= 3);
    const tentativas = [termo, ...(pal.length >= 2 ? [pal[pal.length - 1], pal[0]] : [])];
    for (const t of tentativas) {
      cl = await ixc('cliente', { qtype: 'cliente.razao', query: t, oper: 'L', page: '1', rp: '50', sortname: 'cliente.razao', sortorder: 'asc' });
      if (cl.length) break;
    }
    if (cl.length > 1 && pal.length) {
      const pn = pal.map(norm);
      const exatos = cl.filter((c) => { const r = norm(c.razao); return pn.every((w) => r.includes(w)); });
      if (exatos.length) cl = exatos;
    }
  }
  return cl;
}

async function valorDoContrato(ct) {
  // 1) campo direto no próprio contrato
  for (const k of ['valor', 'mensalidade', 'valor_mensal', 'valor_servico', 'valor_total']) {
    if (Number(ct[k]) > 0) return { valor: Number(ct[k]), origem: 'contrato.' + k };
  }
  // 2) plano de venda vinculado (vd_contrato)
  const idPlano = ct.id_vd_contrato || ct.id_contrato || ct.id_plano;
  if (idPlano) {
    try {
      const p = await ixc('vd_contrato', { qtype: 'vd_contrato.id', query: String(idPlano), oper: '=', page: '1', rp: '1', sortname: 'vd_contrato.id', sortorder: 'asc' });
      if (p[0]) {
        for (const k of ['valor', 'valor_total', 'valor_servico', 'valor_plano']) {
          if (Number(p[0][k]) > 0) return { valor: Number(p[0][k]), origem: 'plano.' + k };
        }
      }
    } catch { /* ignora */ }
  }
  return { valor: 0, origem: null };
}

async function consultar(termo) {
  const clientes = await buscarClientes(termo);
  if (!clientes.length) {
    console.log(`\n❌ Nenhum cliente encontrado para "${termo}".`);
    console.log('   Tente o CPF/CNPJ ou o ID do cliente.');
    return;
  }
  console.log(`\n✅ ${clientes.length} cliente(s) encontrado(s) para "${termo}":`);
  let jaMostrouCampos = false;
  for (const c of clientes.slice(0, 8)) {
    console.log('\n────────────────────────────────────────────');
    console.log(`👤 ${c.razao || c.fantasia}   (ID ${c.id})`);
    console.log(`   CPF/CNPJ: ${c.cnpj_cpf || '-'}   Cidade: ${c.cidade || '-'}   Ativo: ${c.ativo || '-'}`);
    const contratos = await ixc('cliente_contrato', {
      qtype: 'cliente_contrato.id_cliente', query: String(c.id), oper: '=',
      page: '1', rp: '30', sortname: 'cliente_contrato.id', sortorder: 'asc',
    });
    if (!contratos.length) { console.log('   (sem contratos)'); continue; }
    for (const ct of contratos) {
      const { valor, origem } = await valorDoContrato(ct);
      const txtValor = valor > 0 ? `${brl(valor)} (${origem})` : 'valor não localizado';
      console.log(`   • Contrato ${ct.id} | status ${ct.status} | ${txtValor}`);
      // Diagnóstico (1x): se não achou valor, mostra todos os campos do contrato
      if (valor === 0 && !jaMostrouCampos) {
        jaMostrouCampos = true;
        console.log('\n   [DIAGNÓSTICO] todos os campos deste contrato (pra achar o valor):');
        console.log('   ' + JSON.stringify(ct));
        console.log('');
      }
    }
  }
}

async function main() {
  let termo = process.argv.slice(2).join(' ').trim();
  if (!termo) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    termo = (await new Promise((res) => rl.question('\nDigite o NOME, CPF ou ID do cliente: ', res))).trim();
    rl.close();
  }
  if (!termo) { console.log('Nada digitado.'); return; }
  try {
    await consultar(termo);
  } catch (e) {
    console.error('\n❌ ERRO:', e.message);
    console.error('   Se for erro de IP / tempo esgotado, libere o IP deste PC no IXC e tente de novo.');
  }
}

main();
