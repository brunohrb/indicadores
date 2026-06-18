// Sync XLSX do OneDrive → Supabase app_storage.consolidado_dados
// Replica a lógica de js/consolidado.js (consolidadoProcessarXlsxBytes).
// Roda em GitHub Actions a cada 2h (07h-21h BRT).

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const SB_URL = process.env.SB_URL;
const SB_KEY = process.env.SB_KEY;
if (!SB_URL || !SB_KEY) {
  console.error('SB_URL e SB_KEY são obrigatórios');
  process.exit(1);
}
const EDGE_URL = SB_URL + '/functions/v1/fluxo-caixa-download';

const sb = createClient(SB_URL, SB_KEY);

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();

// CSV_MAP espelha o mapeamento do navegador em js/consolidado.js
const CSV_MAP = {
  'link pessoa física':        { cat:'receitas', nome:'Link Pessoa Física' },
  'link pf':                   { cat:'receitas', nome:'Link Pessoa Física' },
  'link pessoa jurídica':      { cat:'receitas', nome:'Link Pessoa Jurídica' },
  'link pj':                   { cat:'receitas', nome:'Link Pessoa Jurídica' },
  'juros/multa':               { cat:'receitas', nome:'Juros/Multa' },
  'juros':                     { cat:'receitas', nome:'Juros/Multa' },
  'taxa de instalação':        { cat:'receitas', nome:'Taxa de instalação' },
  'eventos':                   { cat:'receitas', nome:'Eventos' },
  'multa fidelidade':          { cat:'receitas', nome:'Multa fidelidade e equipamento' },
  'multa fidelidade e equipamento': { cat:'receitas', nome:'Multa fidelidade e equipamento' },
  'rendimentos financeiros':   { cat:'receitas', nome:'Rendimentos financeiros' },
  'ativos imobilizados': { cat:'receitas', nome:'V. Ativos imobilizados' },
  'vendas canceladas e estornos': { cat:'receitas', nome:'Vendas canceladas e estornos' },
  'vendas canceladas':         { cat:'receitas', nome:'Vendas canceladas e estornos' },
  'icms':                      { cat:'impostos', nome:'ICMS' },
  'cofins':                    { cat:'impostos', nome:'COFINS' },
  'pis':                       { cat:'impostos', nome:'PIS' },
  'irpj':                      { cat:'impostos', nome:'IRPJ' },
  'csll':                      { cat:'impostos', nome:'CSLL' },
  'iss':                       { cat:'impostos', nome:'ISS' },
  'iss retido':                { cat:'impostos', nome:'ISS Retido' },
  'simples nacional':          { cat:'impostos', nome:'Simples Nacional' },
  'fust/funttel':              { cat:'impostos', nome:'FUST/FUNTTEL' },
  'fust':                      { cat:'impostos', nome:'FUST/FUNTTEL' },
  'kit instalação':            { cat:'custos', nome:'Kit Instalação' },
  'materiais de rede':         { cat:'custos', nome:'Materiais de Rede' },
  'links de dados':            { cat:'custos', nome:'Links de Dados / Voip' },
  'links de dados / voip':     { cat:'custos', nome:'Links de Dados / Voip' },
  'vtal':                      { cat:'custos', nome:'Vtal' },
  'alugueis de postes':        { cat:'custos', nome:'Alugueis de Postes' },
  'alugueis de torre':         { cat:'custos', nome:'Alugueis de Torre e POP' },
  'alugueis de torre e pop':   { cat:'custos', nome:'Alugueis de Torre e POP' },
  'custo com sva':             { cat:'custos', nome:'Custo com SVA' },
  'energia / pop':             { cat:'custos', nome:'Energia / POP' },
  'manutencao pop':            { cat:'custos', nome:'Manutenção POP' },
  'comissões de vendas':       { cat:'custos', nome:'Comissões de vendas' },
  'combustível técnico':       { cat:'custos', nome:'Combustivel técnico' },
  'manut. veículo':            { cat:'custos', nome:'Manut. Veículo' },
  'manutenção veículo':        { cat:'custos', nome:'Manut. Veículo' },
  'folha - direta':            { cat:'custos', nome:'Folha - Direta' },
  'folha direta':              { cat:'custos', nome:'Folha - Direta' },
  'telefonia':                 { cat:'custos', nome:'Telefonia' },
  'man. equipamento':          { cat:'custos', nome:'Man. Equipamento' },
  'ferramentas':               { cat:'custos', nome:'Ferramentas' },
  'moveis e equipamentos escritório ti': { cat:'custos', nome:'Moveis e equipamentos escritório TI' },
  'tercerização de serv. (instalações)': { cat:'custos', nome:'Tercerização de Serv. (Instalações)' },
  'custos lastmile':           { cat:'custos', nome:'Custos Lastmile' },
  'marketing':                 { cat:'despesas', nome:'Marketing' },
  'serv. terceiros':           { cat:'despesas', nome:'Serv. Terceiros, jurídicos e consultorias' },
  'serviços terceiros':        { cat:'despesas', nome:'Serv. Terceiros, jurídicos e consultorias' },
  'viagens/estadia':           { cat:'despesas', nome:'Viagens/Estadia' },
  'segurança trabalho/ epi':   { cat:'despesas', nome:'Segurança Trabalho/ EPI' },
  'aluguel de escritório':     { cat:'despesas', nome:'Desp. Aluguel de escritório' },
  'desp. aluguel':             { cat:'despesas', nome:'Desp. Aluguel de escritório' },
  'desp. reformas empresa':    { cat:'despesas', nome:'Desp. Reformas empresa' },
  'material de uso, consumo e papelaria': { cat:'despesas', nome:'Material de uso, consumo e papelaria' },
  'combustivel adm':           { cat:'despesas', nome:'Combustivel Adm' },
  'despesas e taxas com veiculos': { cat:'despesas', nome:'Despesas e taxas com Veiculos' },
  'despesas tributárias/ taxas legais': { cat:'despesas', nome:'Despesas Tributárias/ Taxas legais' },
  'despesas judiciais':        { cat:'despesas', nome:'Despesas Judiciais' },
  'treinamentos':              { cat:'despesas', nome:'Treinamentos' },
  'pró-labore':                { cat:'despesas', nome:'Pró-Labore' },
  'pro-labore':                { cat:'despesas', nome:'Pró-Labore' },
  'sistema':                   { cat:'despesas', nome:'Sistema' },
  'taxas boleto':              { cat:'despesas', nome:'Taxas Boleto' },
  'enérgia elétrica escritório': { cat:'despesas', nome:'Enérgia Elétrica escritório' },
  'despesas diversas / estacionamento': { cat:'despesas', nome:'Despesas Diversas / Estacionamento' },
  'tarifas bancárias':         { cat:'despesas', nome:'Tarifas bancárias' },
  'tarifas bancarias':         { cat:'despesas', nome:'Tarifas bancárias' },
  'ebitda':                    { cat:'ebitda', nome:'EBITDA' },
  'irpj (previsão)':           { cat:'ebitda_ajustado', nome:'IRPJ (Previsão)' },
  'cssl (previsão)':           { cat:'ebitda_ajustado', nome:'CSSL (Previsão)' },
  'trimestral':                { cat:'ebitda_ajustado', nome:'Trimestral' },
  'compra de provedor':        { cat:'ebitda_ajustado', nome:'Compra de Provedor' },
  'credito icms':              { cat:'ebitda_ajustado', nome:'Credito ICMS' },
  'ajuste (mark/equip)':       { cat:'ebitda_ajustado', nome:'Ajuste (Mark/Equip)' },
  'datora':                    { cat:'ebitda_ajustado', nome:'Datora' },
  'inclusão 2':                { cat:'ebitda_ajustado', nome:'Inclusão 2' },
  'inclusão 3':                { cat:'ebitda_ajustado', nome:'Inclusão 3' },
  'inclusão 4':                { cat:'ebitda_ajustado', nome:'Inclusão 4' },
  'inclusão 5':                { cat:'ebitda_ajustado', nome:'Inclusão 5' },
  'ajuste (postes)':           { cat:'ebitda_ajustado', nome:'Ajuste (Postes)' },
  'ajuste vtal fora':          { cat:'ebitda_ajustado', nome:'Ajuste Vtal Fora' },
  'ajuste vtal':               { cat:'ebitda_ajustado', nome:'Ajuste Vtal Fora' },
  'ebitda (ajustado)':         { cat:'ebitda_ajustado', nome:'EBITDA (Ajustado)' },
  'compra de veículos':        { cat:'ajustes', nome:'Compra de veículos' },
  'invest. técnico e administrativo': { cat:'ajustes', nome:'Invest. técnico e administrativo' },
  'aq. de provedor':           { cat:'ajustes', nome:'Aq. de provedor' },
  'parcel. impostos':          { cat:'ajustes', nome:'Parcel. Impostos' },
  'investimentos pop':         { cat:'ajustes', nome:'Investimentos POP' },
  'empréstimos para giro':     { cat:'ajustes', nome:'Empréstimos para giro' },
  'reneg. débitos':            { cat:'ajustes', nome:'Reneg. Débitos' },
  'sócios ou retiradas':       { cat:'ajustes', nome:'Sócios ou Retiradas' },
  'retiradas':                 { cat:'ajustes', nome:'Sócios ou Retiradas' }
};

const SECTIONS = {
  'receitas':'receitas', 'impostos':'impostos', 'custos':'custos',
  'despesas operac.':'despesas', 'despesas financ.':'despesas', 'ebitda':'ebitda_section'
};
const STOP_SECTIONS = new Set(['ajustes de caixa','saidas','entradas']);
const SKIP_ROWS = new Set(['desembolsos','receitas','custos','impostos','despesas operac.','despesas financ.']);
const EBITDA_AJ_STARTS = ['inclusao','irpj (previsao)','cssl (previsao)','trimestral',
  'compra de provedor','ajuste (postes)','ajuste vtal fora','credito icms',
  'ajuste (mark/equip)','datora','ebitda (ajustado)'];
const AJUSTES_NAMES = new Set(['investimento','compra de veiculos',
  'invest. tecnico e administrativo','aq. de provedor','empr/finac/parcel',
  'investimentos pop','emprestimos para giro','reneg. debitos','socios ou retiradas']);

// Extrai o bloco "Geração de Caixa / Saldos" (Geração de Caixa → Sald Final).
// Espelha js/consolidado.js > parseCaixaBlock.
function parseCaixaBlock(rows, headerIdx, colMeses) {
  const out = [];
  let started = false;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const nomeRaw = typeof row[0] === 'string' ? row[0].trim() : '';
    if (!nomeRaw) continue;
    const n = norm(nomeRaw);
    if (!started) {
      if (n === 'geracao de caixa') started = true;
      else continue;
    }
    const item = { nome: nomeRaw };
    MESES.forEach(m => {
      const v = row[colMeses[m]];
      item[m] = typeof v === 'number' ? Math.round(v * 100) / 100 : 0;
    });
    item.total = Math.round(MESES.reduce((s, m) => s + (item[m] || 0), 0) * 100) / 100;
    out.push(item);
    if (n === 'sald final' || n === 'saldo final') break;
  }
  return out;
}

async function main() {
  console.log('[1/4] Reconstruindo estrutura consolidado_dados...');
  // Inicializa estrutura COMPLETA do zero (não depende de dados anteriores)
  const dados = {
    receitas: [
      { nome:"Link Pessoa Física",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Link Pessoa Jurídica",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Juros/Multa",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Taxa de instalação",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Eventos",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Multa fidelidade e equipamento",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Rendimentos financeiros",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"V. Ativos imobilizados",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Vendas canceladas e estornos",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 }
    ],
    impostos: [
      { nome:"ICMS",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"COFINS",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"PIS",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"IRPJ",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"CSLL",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"ISS",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"ISS Retido",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Simples Nacional",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"FUST/FUNTTEL",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 }
    ],
    custos: [
      { nome:"Kit Instalação",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Materiais de Rede",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Links de Dados / Voip",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Vtal",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Alugueis de Postes",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Alugueis de Torre e POP",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Custo com SVA",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Energia / POP",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Manutenção POP",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Comissões de vendas",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Combustivel técnico",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Manut. Veículo",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Folha - Direta",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Telefonia",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Man. Equipamento",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Ferramentas",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Moveis e equipamentos escritório TI",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Tercerização de Serv. (Instalações)",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Custos Lastmile",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 }
    ],
    despesas: [
      { nome:"Marketing",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Serv. Terceiros, jurídicos e consultorias",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Viagens/Estadia",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Segurança Trabalho/ EPI",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Desp. Aluguel de escritório",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Desp. Reformas empresa",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Material de uso, consumo e papelaria",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Combustivel Adm",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Despesas e taxas com Veiculos",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Despesas Tributárias/ Taxas legais",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Despesas Judiciais",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Treinamentos",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Pró-Labore",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Sistema",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Taxas Boleto",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Enérgia Elétrica escritório",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Despesas Diversas / Estacionamento",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Tarifas bancárias",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 }
    ],
    ebitda: [
      { nome:"EBITDA",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 }
    ],
    ebitda_ajustado: [
      { nome:"IRPJ (Previsão)",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"CSSL (Previsão)",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Trimestral",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Compra de Provedor",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Credito ICMS",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Ajuste (Mark/Equip)",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Datora",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Inclusão 2",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Inclusão 3",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Inclusão 4",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Inclusão 5",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Ajuste (Postes)",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Ajuste Vtal Fora",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"EBITDA (Ajustado)",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 }
    ],
    ajustes: [
      { nome:"Compra de veículos",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Invest. técnico e administrativo",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Aq. de provedor",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Parcel. Impostos",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Investimentos POP",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Empréstimos para giro",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Reneg. Débitos",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
      { nome:"Sócios ou Retiradas",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 }
    ],
    caixa: []
  };

  console.log('[2/4] Baixando XLSX da Edge Function...');
  const resp = await fetch(EDGE_URL, { headers: { 'apikey': SB_KEY } });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '<sem corpo>');
    throw new Error(`Edge function HTTP ${resp.status}: ${body.slice(0, 800)}`);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 100) throw new Error('XLSX vazio (' + buf.length + ' bytes)');
  console.log('  ↓ ' + buf.length + ' bytes');

  console.log('[3/4] Parseando XLSX...');
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames.find(s => s.toLowerCase().includes('anual real')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: 0 });

  let headerIdx = -1;
  const colMeses = {};
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    rows[i].forEach((cel, ci) => {
      if (typeof cel === 'string') {
        const c = norm(cel).slice(0, 3);
        if (MESES.includes(c)) { colMeses[c] = ci; headerIdx = i; }
      }
    });
    if (Object.keys(colMeses).length >= 6) break;
  }
  if (headerIdx < 0) throw new Error('Colunas de meses não encontradas na aba "' + sheetName + '"');
  console.log('  aba: "' + sheetName + '" | meses: ' + Object.keys(colMeses).join(','));

  const itemIdx = {};
  ['receitas','impostos','custos','despesas','ebitda','ebitda_ajustado','ajustes'].forEach(cat => {
    (dados[cat] || []).forEach(item => { itemIdx[item.nome] = item; });
  });

  let cur = null, stopped = false, atualizados = 0;
  const ebitdaValuesRow = {};

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const nomeRaw = typeof r[0] === 'string' ? r[0].trim() : '';
    if (!nomeRaw) continue;
    const n = norm(nomeRaw);

    const v0 = r[Object.values(colMeses)[0]];
    if (typeof v0 === 'number' && v0 !== 0 && Math.abs(v0) < 2) continue;

    if (STOP_SECTIONS.has(n)) { stopped = true; continue; }
    if (stopped) continue;
    if (n in SECTIONS) { cur = SECTIONS[n]; continue; }
    if (!cur || SKIP_ROWS.has(n)) continue;

    if (n === 'ebitda' && cur === 'ebitda_section') {
      const v = r[colMeses['jan']];
      if (typeof v === 'number' && v > 100000) {
        MESES.forEach(m => {
          ebitdaValuesRow[m] = typeof r[colMeses[m]] === 'number' ? Math.round(r[colMeses[m]] * 100) / 100 : 0;
        });
        continue;
      }
    }

    // Procura pelo CSV_MAP primeiro (normalizado)
    const mapKey = norm(nomeRaw);
    const mapped = CSV_MAP[mapKey];
    const nomeCanonico = mapped ? mapped.nome : nomeRaw;
    const item = itemIdx[nomeCanonico];
    if (!item) continue;

    MESES.forEach(m => {
      const v = r[colMeses[m]];
      item[m] = typeof v === 'number' ? Math.round(v * 100) / 100 : 0;
    });
    item.total = Math.round(MESES.reduce((s, m) => s + (item[m] || 0), 0) * 100) / 100;
    atualizados++;
  }

  const ebitdaItem = itemIdx['EBITDA'];
  if (ebitdaItem && Object.keys(ebitdaValuesRow).length > 0) {
    MESES.forEach(m => { ebitdaItem[m] = ebitdaValuesRow[m] || 0; });
    ebitdaItem.total = Math.round(MESES.reduce((s, m) => s + (ebitdaItem[m] || 0), 0) * 100) / 100;
    atualizados++;
  }

  let inSaidas = false;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    const n = norm(String(r[0]).trim());
    if (n === 'ajustes de caixa' || n === 'saidas') { inSaidas = true; continue; }
    if (n === 'entradas' || n === 'geracao de caixa') { inSaidas = false; continue; }
    if (!inSaidas || !AJUSTES_NAMES.has(n)) continue;
    const nomeAjuste = String(r[0]).trim();
    const mapKeyAjuste = norm(nomeAjuste);
    const mappedAjuste = CSV_MAP[mapKeyAjuste];
    const nomeCanonicoAjuste = mappedAjuste ? mappedAjuste.nome : nomeAjuste;
    const item = itemIdx[nomeCanonicoAjuste];
    if (!item) continue;
    MESES.forEach(m => {
      const v = r[colMeses[m]];
      item[m] = typeof v === 'number' ? Math.round(v * 100) / 100 : 0;
    });
    item.total = Math.round(MESES.reduce((s, m) => s + (item[m] || 0), 0) * 100) / 100;
    atualizados++;
  }

  console.log('  ✓ ' + atualizados + ' itens atualizados');

  // ===== Seção "Geração de Caixa / Saldos" (linhas ~104-129 da Anual Real) =====
  dados.caixa = parseCaixaBlock(rows, headerIdx, colMeses);
  console.log('  ✓ Caixa/Saldos: ' + dados.caixa.length + ' linhas');

  console.log('[4/4] Salvando consolidado_dados no Supabase...');
  const { error: errSet } = await sb.from('app_storage').upsert({
    key: 'consolidado_dados',
    value: JSON.stringify(dados),
    updated_at: new Date().toISOString()
  }, { onConflict: 'key' });
  if (errSet) throw errSet;

  console.log('✅ Sync OneDrive concluído — ' + atualizados + ' itens em ' + new Date().toISOString());
}

main().catch(err => {
  console.error('❌ ERRO:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
