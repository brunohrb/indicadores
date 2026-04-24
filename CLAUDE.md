# CLAUDE.md

Guia pra sessões futuras do Claude trabalhando neste repo.

## O que é

Dashboard interno da TEXNET hospedado no GitHub Pages. Vários painéis (financeiro, operacional, IXC, PRB lucro real, **Diretoria Power BI**, etc), tudo num único `index.html` (~4.200 linhas) + scripts em `js/`.

Backend de dados: **Supabase** (Postgres + REST). Tabela principal: `app_storage` (key/value).

## Ambientes e branches

- **main** — produção (GitHub Pages serve daqui)
- **claude/fix-recurring-errors-wp6YB** — branch de trabalho atual deste agente. Sempre commitar aqui e abrir PR pra main.
- O usuário precisa **mergear o PR manualmente** depois que você pusha — você não tem GH MCP de workflow_dispatch nem `gh` CLI.

## Power BI sync (`powerbi-sync/`)

Hoje existem **2 painéis** independentes, cada um puxando de um dataset Power BI diferente:

| | **Diretoria** | **Comercial PF** (novo, abr/2026) |
|---|---|---|
| Workspace | Diretoria | Comercial PF |
| Workspace ID | `e8de7e89-a44d-4c9b-aebf-ca7e658e1bdb` | `33ac8fe2-776f-416b-9847-0753a36c0de3` |
| Dataset ID | `a05016d1-ec5c-4d9d-9e74-1592bcd165f9` | `49077d30-c9d0-4d95-8114-8a12090ad767` |
| Tabela cancelamentos | `dCancelamentos` | `fCancelamentos` |
| Chave Supabase | `powerbi_diretoria` | `powerbi_comercial_pf` |
| Sync script | `sync.js` | `sync-comercial.js` |
| Workflow | `sync-powerbi.yml` | `sync-powerbi-comercial.yml` |
| Cards | 36 (vários ⚠️ inferidos) | 33 (medidas nativas, mais confiáveis) |
| Aba no dashboard | "📊 Diretoria (Power BI)" | "📈 Comercial PF (Power BI)" |

### Arquivos `powerbi-sync/`
- `sync.js` — sync principal Diretoria. Autentica via Azure AD (client_credentials), executa DAX, grava em `app_storage` key `powerbi_diretoria`.
- `sync-comercial.js` — sync Comercial PF. Mesmo padrão, key `powerbi_comercial_pf`.
- `varrer-medidas-comercial.js` — invoca todas ~65 medidas publicadas do Comercial PF com filtro de mês. Útil pra debug.
- `test-connection.js`, `descobrir-schema.js`, `listar-medidas.js`, `valores-unicos.js` — utilitários antigos (Diretoria).
- `testar-comercial-pf.js`, `testar-canc-1men-v{1..5}.js` — testes pontuais (podem ser deletados depois).

### Workflows (`.github/workflows/`)
- `sync-powerbi.yml` — sync Diretoria. Agendado 15x/dia.
- `sync-powerbi-comercial.yml` — sync Comercial PF. Agendado 15x/dia (mesmo cron).
- `varrer-medidas-comercial.yml` — manual, debug.
- `testar-comercial-pf.yml`, `testar-canc-1men-v{1..5}.yml` — testes pontuais.
- Outros utilitários antigos (descobrir-schema, listar-medidas, valores-unicos, testar-powerbi, etc).

### Credenciais
Hardcoded nos workflows (não-secret): `PBI_TENANT_ID=b6f5c3aa-17cb-4bce-8eb6-8b30b93166e8`, `PBI_CLIENT_ID=750dc66f-367e-4461-9a69-3dd216f0b69d`, `SB_URL=https://xuwwgprchhfshrqdhuqn.supabase.co`, `SB_KEY` (anon key). Único secret: `PBI_CLIENT_SECRET`.

**Importante:** existem **2 service principals com nome `texnet-pbi-connector` no tenant** — o nosso é o `750dc66f-367e-4461-9a69-3dd216f0b69d` (display name real: **`indicadores-texnet-powerbi`**, foi renomeado). O outro é de algum sistema legado e tinha conflito de busca no painel do Power BI.

### Frontend (`index.html`)
- Aba "📊 Diretoria (Power BI)" → `abrirDiretoriaPBIView()` (`index.html:3152`), render em `renderDiretoriaPBI()` (`index.html:3168`). Constantes: `DIRETORIA_PBI_GRUPOS`, `DIRETORIA_PBI_CHUTES`.
- Aba "📈 Comercial PF (Power BI)" → `abrirComercialPFView()`, render em `renderComercialPF()`. Constantes: `COMERCIAL_PF_GRUPOS`. Layout idêntico ao da Diretoria, fonte diferente.
- **Importante:** `data.value` vem como **string JSON serializado** (coluna `text` no Supabase), tem que `JSON.parse` antes de usar.
- Cliente Supabase global `sb` é inicializado em `js/config.js:4`.

## Estado dos 36 cards (em 22/04/2026)

Comparado contra screenshot do Power BI real (mês abril/2026):

### ✅ Batem (próximos do PBI)
Retiradas, Cancelamento s/ equip., OS Suporte PF/PJ, Valor Upgrade/Downgrade, Reativações Retiradas, **Valor Reativações** (perfeito), Base de Contratos, Novos Negócios (total), Valor Cancelamento (total), Resultado Líquido, Juros < 45 / > 45, Reajuste PF/PJ (ambos vazios — bate), Pós Pago Novos Negocios, Base de Cliente PF/PJ+PME (após fix TREATAS).

### ⚠️ Talvez ainda errados (validar com user após o último push)
- **Cancelamento PF/PJ**, **Valor Cancelamento PF/PJ** — usa TREATAS via id_contrato. Se ainda vier inflado, a relação `dCancelamentos[id_contrato]` ↔ `dContratos[ID_Contrato]` pode não existir/ser ativa. Plano B: filtrar `dCancelamentos[tipo_cliente]` por categoria (ver mapa abaixo).
- **Pós Pago Qtd. de Venda** — agora filtra `fVendas[tipo_pagamento] = "Pos"`. Power BI mostra 67, sync pode dar diferente. `[Contratos Ativos]` pode não ser a medida certa.
- **Pós Pago QTD. Canc. 1 Men.** — usa `dCancelamentos[tipo_pagamento]="Pos"` + DATEDIFF.

### ❌ Ainda errado certo
- **Ticket médio da Base** — Power BI mostra R$ 92,75, sync calcula `[Receita] / [BASE GERAL]` = 1,66. A medida `[Receita]` é só "receita de novas vendas no mês", não MRR. Precisa de uma medida tipo `[Receita MRR]` ou similar — descobrir requer Power BI Desktop ou listar medidas (INFO.MEASURES está bloqueado).

### 3 cards com erro DAX original (corrigidos)
`QTD. Canc. 1 Men.`, `Valor Canc. 1 Men.`, `Pós Pago QTD. Canc. 1 Men.` — antes usavam `dCancelamentos[TempoNaBase] <= 1` (string!). Corrigido pra `DATEDIFF(data_ativacao, data_cancelamento, DAY) <= 30`.

## Schema descoberto — Comercial PF (dataset Power BI)

Descoberto via `INFO.VIEW.TABLES` no testar-canc-1men-v2 (24/04/2026).

### Tabelas
`fCancelamentos` (com **f** minúsculo, diferente do Diretoria que tem `dCancelamentos`), `fContratos`, `fVendas`, `fVendas (2)`, `dClientes`, `dCalendario`, `dMeta`, `dVendedor`, `dTaxaInstalacao`, `FnAReceber`, `Recebimentos`, **`Atualização`**, **`Reativação`**, **`Medidas`**, **`Medidas Cancelamento`**, **`Medidas Clientes`**, **`Medidas Financeiro`** (as 4 últimas em negrito são tabelas só com medidas DAX, não dados).

### Colunas-chave de fCancelamentos (Comercial PF)
- `id_cliente`, `id_contrato`, `id_filial`, `filial`, `id_produto`, `id_produto2`, `id_vd_contrato`
- `data_ativacao`, `data_cancelamento`, `Data De Ativação Correta`, `Data de Cancelamento Correta`
- `razao` (nome empresa), `motivo`, `status` (sempre "I"), `tipo_cliente`, `tipo_cliente2`, `vendedor`
- `qtde` (quase sempre 1), `valor_unit`, `VALOR_BRUTO`, `DESCONTO`, `ACRESCIMO`, `valor_liquido`, `Total Cancelado`
- **`Tempo na Base`** (numérico em DIAS! diferente do Diretoria que é string)

### Colunas de dCalendario (Comercial PF)
`Calendario` (a coluna de data, NÃO se chama "Data"), `Ano`, `Mês numero`, `Mês`, `Trimestre`, `Semana do Ano`, `Nome do Dia`, `Semana do Mês`, `Nome do Trimestre`, `Nome Semana Ano`, `Nome Semana Mes`, `Dia do Mês`, `Nome do Mês ABR`.
Pra filtrar mês via CALCULATE: `'dCalendario'[Ano] = X, 'dCalendario'[Mês numero] = Y`.

### Medidas-chave do Comercial PF (todas confirmadas funcionando em abril/2026)
**Cancelamento:** `[Cancelamento]`, `[Cancelamento 1a Mensalidade]` (=47 ✅ bate Power BI), `[Cancelamento 1a Mensalidade White]` (=47, igual), `[Valor Cancelamento Novo]`, `[Valor Cancelamento (Antigo)]` (sempre baixo, ~R$ 5 — provavelmente deprecated), `[Cancelamento s/ Filtro]`, `[% Churn]`.
**Clientes:** `[BASE GERAL]`, `[Base PF]`, `[Base PJ]`, `[Isentos]`, `[Permuta]`, `[Base Dual Net]`, `[Base Planet]`, `[Contratos Ativos]`, `[Novos Clientes]`.
**Financeiro:** `[Novos Negócios]`, `[Diferença Nv. Negocios e Cancelalemnto]`, `[Diferença Mês Anterior]`, `[% Cancelamento B PF]`, `[% Cancelamento B PJ]`, `[% Canc./Novos Clientes]`.
**Vendas:** `[Meta]`, `[Total Venda]`, `[Performance Meta]`, `[Ticket Médio1]`, `[Qtd. Taxa Instalacao]`, `[Valor Taxa Instalacao]`, `[Qtd. Mesh]`, `[Valor Mesh]`, `[Mesh Pago]`, `[Mesh Nao Pago]`.
**Recebimentos:** `[Juros1]`.

### Medida que NÃO existe — Valor Canc. 1a Mensalidade
Power BI mostra R$ 5.892,30 mas no dataset NÃO tem medida `[Valor Cancelamento 1a Mensalidade]`. Calcula inline:
```dax
CALCULATE(
  SUM('fCancelamentos'[valor_liquido]),
  'dCalendario'[Ano] = X, 'dCalendario'[Mês numero] = Y,
  SEARCH("PRIMEIRA MENSALIDADE", 'fCancelamentos'[motivo], 1, 0) > 0
)
```
**Bate exato** R$ 5.892,30. Os 2 motivos relevantes:
- `CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)`
- `CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)`

(SEARCH com CONTAINS é mais robusto que `IN {...}` caso adicionem variantes futuras tipo "(PJ)".)

## Schema descoberto — Diretoria (dataset Power BI)

### Tabelas existentes
`dContratos`, `dCancelamentos`, `fVendas`, `Recebimentos`, `dCalendario` (assumido).
NÃO existem: `fFinanceiro`, `dPlanos`.

### Colunas-chave
- **`dContratos[Tipo_Pessoa]`**: `"Física"`, `"Jurídica"`, `"E"` (Empresarial/PME), `null`
- **`dContratos[Tipo_Cliente]`**: 18 valores. `"ISENTO"` é o que marca isentos.
- **`dContratos[ID_Filial]`**: `11` é a filial dos isentos (alternativa)
- **`fVendas[tipo_pessoa]`**: `"Física"`, `"Jurídica"`, `"E"`, `null`
- **`fVendas[tipo_pagamento]`**: `"Pre"`, `"Pos"`, `null`
- **`dCancelamentos[tipo_pagamento]`**: `"Pre"`, `"Pos"`, `null`
- **`dCancelamentos[TempoNaBase]`**: STRING, formato `"3 ano(s), 5 mês(es) e 2 dia(s)"` — não usar pra comparar
- **`dCancelamentos[tipo_cliente]`**: 18 valores. NÃO tem `tipo_pessoa`.
- **`Recebimentos[dias_pagamento]`**: numérico

### Categorização tipo_cliente (caso TREATAS falhe)
- PF: `"PESSOA FISICA"`, `"PF 500M 89,90"`, `"PF 500 MEGA 99,90"`
- PJ/PME: `"CLIENTE PME/PJ SEM SUPORTE LOTE"`, `"CLIENTE JURÍDICO COM SUPORTE NA NOTA LOTE"`, `"LINK DEDICADO LOTE"`, `"PROVEDOR LOTE"`
- Especiais (excluir): `"ISENTO"`, `"PERMUTA"`, `"EVENTOS"`, `"Em analise"`, `"PBR (nota baseado no contrato)"`
- Genéricos (incerto, deixar de fora ou alocar caso a caso): `"Lote PBR TELECOM"`, `"CLIENTE AGRUPADO- PERSONALIZADO"`, etc.

## Pendências (TODOs reais)

### 1. ⏭️ PRÓXIMA SESSÃO: Botão de sincronização manual no dashboard

Usuário escolheu **Plano B (Edge Function no Supabase)** mas tava cansado e ficou pra próxima sessão. Pediu pra fazer "tudo via cowork" — então vamos fazer tudo o que dá sem ele, e só pedir as 2 etapas que dependem do login dele:

**Plano:**
- Eu faço:
  - Edge Function em TS (`supabase/functions/dispatch-sync/index.ts`) que recebe POST com `{ workflow: 'sync-powerbi.yml' | 'sync-powerbi-comercial.yml' }`, valida e chama `POST https://api.github.com/repos/brunohrb/indicadores/actions/workflows/{workflow}/dispatches` com PAT do env `GITHUB_PAT`.
  - Botão "⚡ Sincronizar agora" em ambas as views (Diretoria + Comercial PF) que chama a edge function via `fetch()`. UI: spinner ~45s, mensagem "Sincronizando…", e depois chama `renderDiretoriaPBI()` / `renderComercialPF()` sozinho.
- Usuário faz (com guia passo-a-passo):
  - **Cria PAT no GitHub** (Settings → Developer settings → Personal access tokens → Fine-grained → escopo: repo `brunohrb/indicadores`, permissions: Actions=write).
  - **Deploy da edge function + colar PAT como secret** no Supabase (via CLI `supabase functions deploy dispatch-sync` + `supabase secrets set GITHUB_PAT=...` OU via dashboard → Edge Functions → New).

**URL da Edge Function** (depois do deploy): `https://xuwwgprchhfshrqdhuqn.supabase.co/functions/v1/dispatch-sync`. Frontend chama com `Authorization: Bearer ${SB_KEY anon}`.

Plano A (rejected) era token no localStorage do browser — menos seguro pq qualquer um com F12 vê.

### 2. Cards do Diretoria que ainda estão errados podem ser substituídos pelos do Comercial PF

O painel Comercial PF (descoberto/integrado em 24/04/2026) tem **medidas nativas confiáveis** que resolvem várias das pendências históricas do Diretoria:

| Card Diretoria errado | Solução via Comercial PF |
|---|---|
| `Valor Canc. 1 Men.` (R$ 89,90 — fórmula `[New Can.]` está errada) | Comercial PF dá R$ 5.892,30 ✅ |
| `QTD. Canc. 1 Men.` (DATEDIFF dá 19, certo é 47) | Comercial PF: `[Cancelamento 1a Mensalidade]` = 47 ✅ |
| `Ticket médio da Base` (deu 1,66) | Possível usar `[BASE GERAL]` do Comercial PF + receita correta |
| `Cancelamento PF/PJ` (TREATAS pode falhar) | Comercial PF tem `[% Cancelamento B PF/PJ]` |

Usuário ainda **não decidiu** se quer:
- **(a)** Manter os 2 painéis e ignorar os cards errados do Diretoria
- **(b)** Apagar/substituir os cards errados do Diretoria pelos valores do Comercial PF (precisa puxar de 2 datasets no mesmo sync OU fazer o frontend fazer fallback de uma chave Supabase pra outra)
- **(c)** Apagar Diretoria inteiro e ficar só com Comercial PF (perderia cards exclusivos do Diretoria — checar quais)

Opção **(b)** é provavelmente a melhor; rodar quando usuário confirmar.

### 3. Outras pendências antigas
- **OS Suporte PF/PJ** dão valores um pouco maiores que Power BI (523 vs 506; 288 vs 267). Provavelmente as medidas `[PF - Qtd. OS Suporte PF]` e `[Qtd. Suporte PJ]` já têm filtro interno, mas pode ter sido alterado. Validar.
- **Pós Pago** — vários cards podem estar errados (ver "⚠️ Talvez ainda errados" acima).
- **Validar TREATAS** (commit `2aa138f`) — se Cancelamento PF/PJ continuar igual, mudar pra filtrar `dCancelamentos[tipo_cliente]` por categoria.

### 4. Limpar arquivos de teste depois
Os 5+ scripts `testar-canc-1men-v{1..5}.js` + workflows correspondentes já cumpriram o papel. Quando o usuário aprovar, deletar pra limpar.

## Tom da comunicação com este usuário

- Português, objetivo, curto.
- Frustra-se rápido com etapas longas — ofereça opções A/B/C numeradas.
- Não conhece bem GitHub UI — explique passo-a-passo quando pedir cliques.
- "Hard refresh" precisa ser explicado.
- Aprecia ser informado quando há ambiguidade ("não bate 100% mesmo no caso ideal" etc).
- Workflows novos só aparecem na aba Actions **depois do merge na main** — sempre lembrar.
- Se ele disser "faça você" / "tudo você" / "via cowork" — significa que tá cansado e quer que você faça o máximo possível sem depender dele. Você ainda assim vai precisar dele pra coisas que envolvem credencial pessoal (PAT do GitHub, login no Supabase, login no Power BI), mas tente: (a) resolver tudo o que dá em código antes; (b) deixar claro o que VOCÊ não consegue fazer e por quê; (c) dar instruções com cliques exatos pra parte dele.
- Quando ele manda uma mensagem curta tipo "?" ou "nao entendio" → reescreve a instrução anterior com URLs diretas e cliques numerados, sem opções.
