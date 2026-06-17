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
  log('Alvo (linha real do relatorio, PF): jan 47.75, fev 893.23, mar 3738.67, abr 2995.68, mai 4394.24, jun 2357.29');

  log('\n=== (S) SUM(Valor_Reajustado) Pago, por MINX + tipo — SEM filtro de ano do reajuste ===');
  for(const mes of [1,2,3,4,5,6]){ for(const tp of ['PF','PJ']){
    try{
      const r=await q(tk,`EVALUATE ROW("v", CALCULATE(SUM('fReajustes'[Valor_Reajustado]), FILTER('fReajustes','fReajustes'[Status_Reajuste]="Pago" && YEAR('fReajustes'[Data_Pagamento_MINX])=2026 && MONTH('fReajustes'[Data_Pagamento_MINX])=${mes}), 'dFilial'[Tipo_Pessoa]="${tp}"))`);
      log(`   mes ${mes} ${tp}: ${r[0]?.['[v]']}`);
    }catch(e){log(`   mes ${mes} ${tp}: ERRO ${erro(e)}`);}
  }}

  log('\n=== (S2) IGUAL, MAS COM YEAR(Data_Reajuste)=2026 ===');
  for(const mes of [1,2,3,4,5,6]){ for(const tp of ['PF','PJ']){
    try{
      const r=await q(tk,`EVALUATE ROW("v", CALCULATE(SUM('fReajustes'[Valor_Reajustado]), FILTER('fReajustes','fReajustes'[Status_Reajuste]="Pago" && YEAR('fReajustes'[Data_Reajuste])=2026 && YEAR('fReajustes'[Data_Pagamento_MINX])=2026 && MONTH('fReajustes'[Data_Pagamento_MINX])=${mes}), 'dFilial'[Tipo_Pessoa]="${tp}"))`);
      log(`   mes ${mes} ${tp}: ${r[0]?.['[v]']}`);
    }catch(e){log(`   mes ${mes} ${tp}: ERRO ${erro(e)}`);}
  }}
  log('\nFIM');
})().catch(e=>{log('FALHOU: '+e.message);process.exit(1);});
