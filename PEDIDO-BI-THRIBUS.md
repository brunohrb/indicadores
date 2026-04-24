# Pedido pro BI da Thribus — Valor Cancelamento 1ª Mensalidade

## Contexto

A TEXNET está consumindo os dados do relatório **Diretoria** via API do Power BI (Execute Queries)
pra popular um dashboard interno. Todos os indicadores batem com o Power BI, menos **um**:

**❌ Valor Canc. 1 Men.** — Power BI mostra **R$ 5.892,30** (abril/2026), a API retorna R$ 89,90.

## O que a gente investigou

- ✅ A QTD. Canc. 1 Men. bate perfeitamente (47 = 47) usando:
  ```dax
  CALCULATE(
    DISTINCTCOUNT('dCancelamentos'[id_contrato]),
    'dCalendario'[Mês numero] = 4, 'dCalendario'[Ano] = 2026,
    'dCancelamentos'[motivo] IN {
      "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)",
      "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)",
      "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE PJ"
    },
    USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])
  )
  ```

- ❌ Pro **Valor**, tentamos 40+ variações de DAX usando `[New Can.]`, `SUMX` em `fVendas`,
  `FnAReceber`, `Recebimentos` e `dContratos`. Todas retornam R$ 89,90 ou 0 ou null.

- ❌ Descobrimos via `EVALUATE TOPN(1, 'dCancelamentos')` que a tabela **`dCancelamentos`
  não tem coluna numérica de valor**. Só 18 colunas, nenhuma monetária.

- ❌ A tabela **`fCancelamentos` não existe no dataset publicado** — só `dCancelamentos`.

- ❌ A coluna `dCancelamentos[Total Cancelado]` **está com bug** — retorna o **nome da filial**
  (ex: "P3 TELECOM LTDA", "TEX NET") em vez do valor monetário.

- ❌ A medida `[Cancelamento 1a Mensalidade Valor]` que está na documentação interna da Thribus
  **não existe no dataset publicado** (testamos 25+ variações de nome).

- ❌ `INFO.MEASURES()` não funciona — service principal não tem permissão de metadata.

## O que precisamos

**Uma das duas opções, o que for mais fácil pra vocês:**

### Opção 1 — Publicar a medida `[Cancelamento 1a Mensalidade Valor]`

Se essa medida existe no `.pbix` local, basta publicar no dataset **"Diretoria"**
(ID `a05016d1-ec5c-4d9d-9e74-1592bcd165f9`, workspace
`e8de7e89-a44d-4c9b-aebf-ca7e658e1bdb`).

### Opção 2 — Expor a coluna de valor na `dCancelamentos`

Adicionar uma coluna numérica tipo `dCancelamentos[valor_cancelamento]` (ou
`valor_liquido`, ou `VALOR_BRUTO` — como quiserem chamar) que contenha o
valor monetário do plano cancelado.

Com a coluna exposta, a gente calcula do nosso lado:
```dax
CALCULATE(
  SUM('dCancelamentos'[valor_cancelamento]),
  <mesmos filtros da QTD>
)
```

---

**Credenciais da API (já funcionando — service principal registrado):**
- Tenant: `b6f5c3aa-17cb-4bce-8eb6-8b30b93166e8`
- Client ID: `750dc66f-367e-4461-9a69-3dd216f0b69d`
- Workspace: `e8de7e89-a44d-4c9b-aebf-ca7e658e1bdb`
- Dataset: `a05016d1-ec5c-4d9d-9e74-1592bcd165f9`

Qualquer dúvida é só chamar.
