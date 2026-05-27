#!/usr/bin/env node
// =====================================================
// Consulta de cliente no IXC — roda LOCAL (PC do escritório, IP autorizado)
// Uso: dê dois cliques em CONSULTAR-CLIENTE.bat
//   ou pela linha de comando: node consulta-cliente.js "Lucas Peixoto Cavalcante"
// Reusa a MESMA conexão do sync.js (mesmo token/URL).
// =====================================================

const axios = require('axios');
const readline = require('readline');

const cfg = {
  IXC_URL:   process.env.IXC_URL   || 'https://ixcsoft.texnet.net.br',
  IXC_TOKEN: process.env.IXC_TOKEN || '185:ef49bcecf6129a5b61690ac3da0ab99acdaca9171ea63d06cc403a73eef8c547',
};
const BASIC = `Basic ${Buffer.from(cfg.IXC_TOKEN).toString('base64')}`;
const http = axios.create({
  baseURL: `${cfg.IXC_URL}/webservice/v1`,
  headers: { Authorization: BASIC, 'Content-Type': 'application/json' },
  timeout: 60000,
});

async function ixc(tabela, body) {
  const { data } = await http.post(`/${tabela}`, body, { headers: { ixcsoft: 'listar' } });
  if (data && data.type === 'error') throw new Error(`IXC: ${data.message}`);
  return Array.isArray(data.registros) ? data.registros : [];
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

async function consultar(termo) {
  const clientes = await buscarClientes(termo);
  if (!clientes.length) {
    console.log(`\n❌ Nenhum cliente encontrado para "${termo}".`);
    console.log('   Tente o CPF/CNPJ ou o ID do cliente.');
    return;
  }
  console.log(`\n✅ ${clientes.length} cliente(s) encontrado(s) para "${termo}":`);
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
      // Descobre automaticamente os campos de valor preenchidos (valor, mensalidade, etc.)
      const camposValor = Object.keys(ct).filter((k) => /valor|mensal|preco|preç/i.test(k) && Number(ct[k]) > 0);
      const valores = camposValor.map((k) => `${k}=${brl(ct[k])}`).join('   ');
      console.log(`   • Contrato ${ct.id} | status ${ct.status} | ${valores || '(sem valor preenchido — campos: ' + Object.keys(ct).filter(k => /valor|mensal/i.test(k)).join(', ') + ')'}`);
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
    console.error('   Se for erro de IP/autorização, libere o IP deste PC no IXC e tente de novo.');
  }
}

main();
