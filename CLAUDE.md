# CLAUDE.md

Guia pra sessões futuras do Claude trabalhando neste repo.

## O que é

Dashboard interno da TEXNET hospedado no GitHub Pages. Vários painéis (financeiro, operacional, IXC, PRB lucro real, **Diretoria Power BI**, etc), tudo num único `index.html` (~4.200 linhas) + scripts em `js/`.

Backend de dados: **Supabase** (Postgres + REST). Tabela principal: `app_storage` (key/value).

## Ambientes e branches

- **main** — produção (GitHub Pages serve daqui)
- **claude/improve-code-quality-XxR6q** — branch de trabalho atual deste agente. Sempre commitar aqui e abrir PR pra main.
- O usuário precisa **mergear o PR manualmente** depois que você pusha — você não tem GH MCP de workflow_dispatch nem `gh` CLI.

## Power BI sync (`powerbi-sync/`)

Estrutura nova adicionada em abril/2026 pra puxar 36 indicadores do relatório "Diretoria" do Power BI da TEXNET e jogar no Supabase.

### Arquivos
- `powerbi-sync/sync.js` — script principal Diretoria. Autentica via Azure AD (client_credentials), executa DAX no dataset, grava em `app_storage` key `powerbi_diretoria_YYYY-MM` (per-mês) + `powerbi_diretoria` (atalho do mais recente). Aceita `--mes=YYYY-MM`, `--meses=YYYY-MM,YYYY-MM,...` ou `--meses=last:N`.
- `powerbi-sync/sync-comercial.js` — sync do Comercial PF (mesmo padrão).
- Workflows de descoberta/debug foram removidos em maio/2026 — schema já está cravado. Se precisar de novo, recriar a partir do histórico git.

### Workflows correspondentes (`.github/workflows/`)
- `sync-powerbi.yml` — agendado 15x/dia (08-19h BRT 1/1h + 23h/03h/07h BRT). Schedule roda `--meses=last:3`. Inputs: `mes` (1 mês) ou `meses` (lista ou `last:N`).
- `sync-powerbi-comercial.yml` — agendado/manual, sync do Comercial PF.
- `limpar-ixc-zerados.yml` — utilitário manual.
- Roda em **Node 22** (Node 20 não tem WebSocket nativo, exigido pelo Supabase JS recente).

### Credenciais
Hardcoded nos workflows (não-secret): `PBI_TENANT_ID`, `PBI_CLIENT_ID`, `PBI_WORKSPACE_ID`, `PBI_DATASET_ID`, `SB_URL`, `SB_KEY` (anon key). Único secret: `PBI_CLIENT_SECRET`.

### Frontend (`index.html`)
- Aba "📊 Diretoria (Power BI)" criada via `abrirDiretoriaPBIView()` em `index.html:3152`.
- Render em `renderDiretoriaPBI()` — `index.html:3168`.
- **Importante:** `data.value` vem como **string JSON serializado** (coluna `text` no Supabase), tem que `JSON.parse` antes de usar — vide `index.html:3194`.
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

## Schema descoberto

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

1. **Botão "Recarregar" deve disparar sync de verdade** (usuário pediu, fica pra próxima sessão).
   - Hoje só re-lê do Supabase (`renderDiretoriaPBI()`).
   - Plano: criar Supabase Edge Function que recebe POST do frontend e faz `POST https://api.github.com/repos/brunohrb/indicadores/actions/workflows/sync-powerbi.yml/dispatches` com PAT salvo no secret da function. Frontend chama essa function via `fetch`. Polling pra detectar fim do run (ou só "vai sincronizar, recarregue em 1min").
   - Alternativa quick'n'dirty: abrir página do GitHub Actions em nova aba (1 click manual).

2. **Ticket médio da Base** — descobrir a medida real (precisa Power BI Desktop, INFO.MEASURES bloqueado via API).

3. **Validar resultados pós-push do TREATAS** (commit `2aa138f`) — se Cancelamento PF/PJ continuar igual, mudar pra filtrar `dCancelamentos[tipo_cliente]` por categoria.

4. **OS Suporte PF/PJ** dão valores um pouco maiores que Power BI (523 vs 506; 288 vs 267). Provavelmente as medidas `[PF - Qtd. OS Suporte PF]` e `[Qtd. Suporte PJ]` já têm filtro interno, mas pode ter sido alterado. Validar.

## Tom da comunicação com este usuário

- Português, objetivo, curto.
- Frustra-se rápido com etapas longas — ofereça opções A/B/C numeradas.
- Não conhece bem GitHub UI — explique passo-a-passo quando pedir cliques.
- "Hard refresh" precisa ser explicado.
- Aprecia ser informado quando há ambiguidade ("não bate 100% mesmo no caso ideal" etc).
- Workflows novos só aparecem na aba Actions **depois do merge na main** — sempre lembrar.
