# CLAUDE.md

Guia pra sessões futuras do Claude trabalhando neste repo.
**Sempre leia este arquivo ANTES de começar a trabalhar. Atualize ele ao final de cada sessão com decisões/mudanças importantes.**

## O que é

Dashboard interno da TEXNET hospedado no GitHub Pages. Vários painéis (financeiro, operacional, IXC, PRB lucro real, **Diretoria Power BI**, etc), tudo num único `index.html` (~4.300 linhas) + scripts em `js/`.

Backend de dados: **Supabase** (Postgres + REST). Tabela principal: `app_storage` (key/value, coluna `value` é tipo `text` — dados JSON vêm serializados, precisa `JSON.parse` ao ler).

## Ambientes e branches

- **main** — produção (GitHub Pages serve daqui)
- Branch de trabalho atual depende da sessão. Verificar com `git branch --show-current`. Histórico recente: `claude/add-month-year-selection-LfBgM` (mai/2026).
- **MCP do GitHub disponível**: posso criar PR (`mcp__github__create_pull_request`) e mergear (`mcp__github__merge_pull_request`) eu mesmo. NÃO tenho `workflow_dispatch` nem `gh` CLI — usuário precisa rodar workflows manualmente.

## Aba "Diretoria (Power BI)" — UNIFICADA (mai/2026)

Em mai/2026 a aba antiga "Comercial PF (Power BI)" foi **removida** e seus cards foram **mesclados** dentro da aba Diretoria. Frontend lê dos 2 datasets do Power BI (`powerbi_diretoria_*` + `powerbi_comercial_pf_*`) e mostra tudo junto numa view só.

### Features da aba (frontend, `index.html`)

- **Picker de mês/ano** (`<input type="month">`) + 3 botões:
  - **Ver este mês** (azul) — substitui seleção atual
  - **+ Comparar** (preto) — adiciona aos meses já visíveis
  - **🔄 Recarregar** (cinza) — re-lê do Supabase
- **Chips** dos meses selecionados com status: 🔒 fechado, 🔄 ao vivo, ❓ sem dados
- **Botão "Fechar mês"** — congela snapshot imutável tanto da Diretoria quanto do Comercial PF do mesmo mês (cria `*_fechado_YYYY-MM`)
- **Agregação multi-mês** (quando 2+ chips):
  - **soma** (default) — contagens/valores
  - **media** — tickets, % churn, % cancelamento, Performance Meta, Meta Vendas
  - **ultimo** (mais recente) — Bases (PF, PJ+PME, Isentos, Contratos, Dual Net, Planet) — snapshots não acumulam
- Funções principais em `index.html`:
  - `abrirDiretoriaPBIView()` — entry point do menu
  - `renderDiretoriaPBI()` — main render
  - `diretoriaPBI_carregarMes(mes)` — lê fechado → per-mês → live, mescla Diretoria + Comercial PF
  - `diretoriaPBI_fecharMes(mes)` — fecha ambos datasets
  - `DIRETORIA_PBI_GRUPOS` — agrupamento dos cards
  - `DIRETORIA_PBI_AGREGACAO` — regras de agregação

### Storage no Supabase (`app_storage`)

- `powerbi_diretoria_YYYY-MM` — snapshot mutável do mês (sobrescrito pelo sync)
- `powerbi_diretoria` — atalho compat: aponta pro mês mais recente sincronizado
- `powerbi_diretoria_fechado_YYYY-MM` — snapshot IMUTÁVEL (sync não sobrescreve)
- `powerbi_diretoria_meses_fechados` — array JSON dos meses fechados
- `powerbi_diretoria_meses_disponiveis` — array JSON dos meses com snapshot per-mês
- Análogo para Comercial PF: `powerbi_comercial_pf_*` com mesmos sufixos

## Power BI sync (`powerbi-sync/`)

### Arquivos
- `powerbi-sync/sync.js` — sync Diretoria. Autentica via Azure AD (client_credentials), executa DAX, grava per-mês. Aceita `--mes=YYYY-MM`, `--meses=YYYY-MM,YYYY-MM,...` ou `--meses=last:N`. Limpa rows lixo a cada execução. **Respeita `meses_fechados` — não sobrescreve.**
- `powerbi-sync/sync-comercial.js` — sync do Comercial PF (mesmo padrão).
- Workflows de descoberta/debug foram removidos em mai/2026 — schema já está cravado. Se precisar de novo, recriar a partir do histórico git.

### Workflows (`.github/workflows/`)
- `sync-powerbi.yml` — agendado 15x/dia (08-19h BRT 1/1h + 23h/03h/07h BRT). Schedule roda `--meses=last:3`. Inputs `mes` e `meses` — ambos aceitam YYYY-MM, lista vírgula-separada, ou `last:N`.
- `sync-powerbi-comercial.yml` — mesmo padrão, dataset Comercial PF.
- `limpar-ixc-zerados.yml` — utilitário manual IXC.
- **Roda em Node 22** (Node 20 não tem WebSocket nativo, exigido pelo Supabase JS recente).

### Credenciais
Hardcoded nos workflows (não-secret): `PBI_TENANT_ID`, `PBI_CLIENT_ID`, `PBI_WORKSPACE_ID`, `PBI_DATASET_ID`, `SB_URL`, `SB_KEY` (anon key). Único secret: `PBI_CLIENT_SECRET`.

## Estado dos cards (mai/2026, comparado com Power BI direto)

### ✅ Batem (Maio 2026)
Base de Cliente PF (16.072), Base de Isentos (744), OS Suporte PF (107), Novos Clientes PJ (6), Cancelamento PF (52), Cancelam. PME+PJ (7), Cancelamento s/equip. retirado (2), Reativações Retiradas (0), Novos Negócios PF (R$ 3.982), Novos Negócios PJ (R$ 1.388,60), Valor Upgrade (R$ 142,93), Valor Downgrade (R$ -360,40), Valor Cancelamento (R$ 6.025,83), Valor Cancelamento PF (R$ 5.032,23), Valor Canc. PJ+PME (R$ 993,60), Valor Reativações (R$ 84,90), Resultado Líquido (R$ -787,80), Juros > 45 (R$ 319,96), Reajuste PF/PJ (vazios — bate), Ticket Médio Venda/PF/PJ, Pós Pago Qtd. de Venda (13).

### ⚠️ Pequenas diferenças (poucas unidades)
- Base PJ+PME: sync 4.507 vs PB 4.509 (-2)
- Base de Contratos: sync 21.331 vs PB 21.325 (+6)
- OS Suporte PJ: sync 54 vs PB 53 (+1)
- Retiradas: sync 31 vs PB 30 (+1)
- Juros < 45: sync 11.893 vs PB 11.880 (+13)
- Ticket médio da Base: sync 27,87 vs PB 27,85 (+0,02)
- Pós Pago Novos Negocios: sync 1.290 vs PB 1.289,70

### ❌ Diferenças GRANDES (precisam de fix DAX)
1. **Novos Clientes PF** — sync 42 vs PB 375 (9x menor!). DAX está filtrando algo a mais.
2. **Valor Canc. 1 Men.** — sync `—` (null) ou R$ 269 vs PB R$ 6.172. A correção anterior do `DATEDIFF(data_ativacao, data_cancelamento, DAY) <= 30` não bateu. **Pode ser que o "1 Men." do PB seja "1 Mensalidade paga" não "1 mês na base"** — investigar relação com `dCancelamentos[Mensalidades_Pagas]` ou similar.
3. **QTD. Canc. 1 Men.** e **Pós Pago QTD. Canc. 1 Men.** — sync mostra `—`, PB mostra 0. Provavelmente DAX retornando null que deveria ser 0 (default = soma SUM com filtro vazio = null).
4. **Novos Negócios** total ≠ PF + PJ — sync 5.370,60 ≠ (3.982 + 1.388,60 = 5.370,60). Na verdade BATE. Mas PB mostra "Novos Negócios = R$ 5.513,53" que é o que sync chama de "Receita". Pode ser só nomenclatura confusa entre os 2 cards. Investigar se PB "Novos Negócios" = sync "Receita" ou se há duas medidas distintas.

### Comercial PF — cards exclusivos (não estavam na Diretoria)
Base Dual Net, Base Planet, Contratos Ativos (novos/mês), Cancelamento 1a Mensalidade, Valor Canc. 1a Mensalidade, Valor Cancelamento Novo, % Churn, % Cancelamento Base PF/PJ, % Canc./Novos Clientes, Diferença Novos vs Cancel., Diferença Mês Anterior, Juros (Recebimentos), Meta (Vendas), Total Venda, Performance Meta, Qtd./Valor Taxa Instalação, Qtd./Valor/Pago/Não Pago Mesh.

### Conflito de nome resolvido
**"Novos Negócios"** existe nos 2 datasets com valores diferentes. Frontend usa o da Diretoria (sobrescreve o do Comercial PF) em `diretoriaPBI_carregarMes`. **"Novos Clientes"** (Comercial PF) NÃO é exibido (foi removido dos grupos pra evitar confusão com "Novos Clientes PF/PJ" da Diretoria).

## Schema do Power BI

### Tabelas existentes
`dContratos`, `dCancelamentos`, `fVendas`, `Recebimentos`, `dCalendario`.
NÃO existem: `fFinanceiro`, `dPlanos`.

### Colunas-chave
- **`dContratos[Tipo_Pessoa]`**: `"Física"`, `"Jurídica"`, `"E"` (Empresarial/PME), `null`
- **`dContratos[Tipo_Cliente]`**: 18 valores. `"ISENTO"` marca isentos.
- **`dContratos[ID_Filial]`**: PF = `{1, 2, 3, 5, 10, 20, 22, 26, 27, 28, 29, 43, 45, 47}`, PJ = `{12, 13, 14, 16, 17, 18, 19, 21, 31, 33, 35, 37, 39}`, Isentos = `11`. (Cravado por print de filtros do PB.)
- **`fVendas[tipo_pessoa]`**: `"Física"`, `"Jurídica"`, `"E"`, `null`
- **`fVendas[tipo_pagamento]`**: `"Pre"`, `"Pos"`, `null`
- **`dCancelamentos[tipo_pagamento]`**: `"Pre"`, `"Pos"`, `null`
- **`dCancelamentos[TempoNaBase]`**: STRING `"3 ano(s), 5 mês(es) e 2 dia(s)"` — NÃO usar pra comparar. Use `DATEDIFF(data_ativacao, data_cancelamento, DAY)`.
- **`Recebimentos[dias_pagamento]`**: numérico

### DAX patterns importantes
- Medidas do modelo `[Novos Clientes]`, `[Novos Negócios]`, `[Cancelamento]`, `[New Can.]` JÁ EXCLUEM internamente os motivos administrativos, filiais 11/15/26 e vendedores 1/107.
- Para filtrar por filial sem perder isso, use `FILTER('dContratos', ID_Filial IN FILIAIS_PF)` em vez de `dContratos[ID_Filial] IN FILIAIS_PF` direto. (O FILTER cria filtro de linha, não sobrescreve o CALCULATE interno.)
- INFO.MEASURES (listar medidas via DAX) está BLOQUEADO pra service principal — não dá pra descobrir as medidas via API.

## Pendências (TODOs reais)

1. **Valor Canc. 1 Men. / QTD. Canc. 1 Men.** — investigar fórmula real do PB. Hipótese: "1 Men." = "1 Mensalidade paga" (não "1 mês na base"). Buscar coluna `Mensalidades_Pagas` ou similar em `dCancelamentos`.

2. **Novos Clientes PF** — sync 42 vs PB 375 em Maio. Filtro de `dContratos[ID_Filial] IN FILIAIS_PF` provavelmente está cortando demais. Verificar se a medida nativa `[PF - Novos Clientes]` existe no modelo.

3. **Pequenas diferenças** (poucas unidades) — talvez timing de sync vs Power BI ao vivo, ou pequeno desvio em filtros. Baixa prioridade.

4. **Botão "Recarregar" dispara só re-leitura do Supabase** — usuário pediu pra disparar sync de verdade. Precisaria Supabase Edge Function chamando GitHub Actions REST. Alternativa quick'n'dirty: link pra Actions page.

5. **Ticket médio da Base** — em out/2025 estava errado, mas em mai/2026 sync (R$ 27,87) bate com PB (R$ 27,85). Resolveu sozinho? Reconfirmar.

## Tom da comunicação com este usuário

- Português, objetivo, curto.
- Frustra-se rápido com etapas longas — ofereça opções A/B/C numeradas.
- Não conhece bem GitHub UI — explique passo-a-passo quando pedir cliques.
- "Hard refresh" precisa ser explicado.
- Aprecia ser informado quando há ambiguidade ("não bate 100% mesmo no caso ideal" etc).
- Workflows novos só aparecem na aba Actions **depois do merge na main** — sempre lembrar.
- Se o usuário disser "vc tinha resolvido isso antes" — provavelmente está certo, ler CLAUDE.md de novo antes de duvidar.

## Histórico (referência)

- **abr/2026**: criação do sync Power BI (Diretoria) + aba inicial. 36 cards. Schema descoberto via workflows de debug.
- **abr/2026**: sync Comercial PF criado em aba separada.
- **mai/2026**: ferramenta de seleção multi-mês + agregação + fechamento de mês imutável. Sync passa a gravar per-mês. Schedule roda `last:3`. Node bumpado pra 22 (WebSocket). 22 workflows de debug removidos.
- **mai/2026**: aba Comercial PF removida — cards mesclados dentro da aba Diretoria. Botão "Fechar mês" fecha ambos datasets simultaneamente.
