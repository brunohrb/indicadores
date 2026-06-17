#!/usr/bin/env node
// DIAGNÓSTICO TEMPORÁRIO: compara, mês a mês (2026), o "Valor Recebido" por:
//  (M) medida [Valor Recebido Total] agrupada pelo calendário de pagamento + dFilial[Tipo_Pessoa]
//  (C) CALCULATE([Valor Recebido Total]) com filtro direto de mês de pagamento + tipo
//  (S) SUM(Valor_Reajustado) por Data_Pagamento_MINX (fórmula atual do sync)
// Objetivo: achar qual reproduz a linha "Valor Recebido Por Mês" do relatório.
const axios = require('axios');
const WS = 'e8de7e89-a44d-4c9b-aebf-ca7e658e1bdb';
const DS = 'e97a6d33-6761-49f3-8869-3635fb107219';
function log(m){console.log(m);}
async function token(){
  const {PBI_TENANT_ID,PBI_CLIENT_ID,PBI_CLIENT_SECRET}=process.env;
  const {data}=await axios.post(`https://login.microsoftonline.com/${PBI_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({client_id:PBI_CLIENT_ID,client_secret:PBI_CLIENT_SECRET,scope:'https://analysis.windows.net/powerbi/api/.default',grant_type:'client_credentials'}),
    {headers:{'Content-Type':'application/x-www-form-urlencoded'},timeout:15000});
  return data.access_token;
}
async function q(tk,dax){
  const url=`https://api.powerbi.com/v1.0/myorg/groups/${WS}/datasets/${DS}/executeQueries`;
  const {data}=await axios.post(url,{queries:[{query:dax}],serializerSettings:{includeNulls:true}},
    {headers:{Authorization:`Bearer ${tk}`,'Content-Type':'application/json'},timeout:60000});
  return data.results?.[0]?.tables?.[0]?.rows||[];
}
function erro(e){return e.response?.data?.error?.['pbi.error']?.code||e.response?.data?.error?.code||e.message;}

(async()=>{
  const tk=await token();
  log('=== (M) MEDIDA [Valor Recebido Total] por MÊS DE PAGAMENTO + tipo (2026, Pago) ===');
  try{
    const rows=await q(tk,`EVALUATE SUMMARIZECOLUMNS('dCalendario Pagamento'[NumeroMes Pgto], 'dFilial'[Tipo_Pessoa], FILTER(ALL('dCalendario Pagamento'[Ano Pgto]),'dCalendario Pagamento'[Ano Pgto]=2026), FILTER('fReajustes','fReajustes'[Status_Reajuste]="Pago"), "v", [Valor Recebido Total])`);
    rows.sort((a,b)=>(a['dCalendario Pagamento[NumeroMes Pgto]']-b['dCalendario Pagamento[NumeroMes Pgto]']));
    rows.forEach(r=>log(`   mes ${r['dCalendario Pagamento[NumeroMes Pgto]']} | ${r['dFilial[Tipo_Pessoa]']} | ${r['[v]']}`));
  }catch(e){log('   ERRO (M): '+erro(e));}

  log('\n=== (C) CALCULATE([Valor Recebido Total]) filtro direto mês pgto + tipo — MAIO e JUNHO ===');
  for(const mes of [5,6]){ for(const tp of ['PF','PJ']){
    try{
      const r=await q(tk,`EVALUATE ROW("v", CALCULATE([Valor Recebido Total], 'dCalendario Pagamento'[Ano Pgto]=2026, 'dCalendario Pagamento'[NumeroMes Pgto]=${mes}, 'dFilial'[Tipo_Pessoa]="${tp}"))`);
      log(`   mes ${mes} ${tp}: ${r[0]?.['[v]']}`);
    }catch(e){log(`   mes ${mes} ${tp}: ERRO ${erro(e)}`);}
  }}

  log('\n=== (S) SUM(Valor_Reajustado) por Data_Pagamento_MINX + dFilial[Tipo_Pessoa] (fórmula atual) ===');
  for(const mes of [1,2,3,4,5,6]){ for(const tp of ['PF','PJ']){
    try{
      const r=await q(tk,`EVALUATE ROW("v", CALCULATE(SUM('fReajustes'[Valor_Reajustado]), FILTER('fReajustes','fReajustes'[Status_Reajuste]="Pago" && YEAR('fReajustes'[Data_Pagamento_MINX])=2026 && MONTH('fReajustes'[Data_Pagamento_MINX])=${mes}), 'dFilial'[Tipo_Pessoa]="${tp}"))`);
      log(`   mes ${mes} ${tp}: ${r[0]?.['[v]']}`);
    }catch(e){log(`   mes ${mes} ${tp}: ERRO ${erro(e)}`);}
  }}
  log('\nFIM');
})().catch(e=>{log('FALHOU: '+e.message);process.exit(1);});
