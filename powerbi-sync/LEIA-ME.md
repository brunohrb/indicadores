# Power BI → Dashboard de Indicadores

Este script conecta no **Power BI** (workspace Diretoria, dataset Diretoria)
via API oficial da Microsoft e traz os indicadores pro dashboard.

Diferente do `sync-local/` (IXC), **aqui roda tudo no GitHub Actions**:
o Power BI é API pública da Microsoft, sem bloqueio de IP.

## Testar direto no GitHub (recomendado)

1. Adicione o Client Secret como **GitHub Secret**:
   - https://github.com/brunohrb/indicadores/settings/secrets/actions
   - Clica em **`New repository secret`**
   - Name: `PBI_CLIENT_SECRET`
   - Value: o segredo que você copiou do Bloco de Notas
   - **Add secret**

2. Rodar o workflow:
   - https://github.com/brunohrb/indicadores/actions
   - Clica em **"Testar conexão Power BI"** na lista
   - **Run workflow** → escolhe a branch `claude/azure-ad-automation-XG3Qo` → **Run workflow**

3. Esperar ~30s, clicar no run que apareceu e ver o log.

Se funcionar, vai aparecer no log:
- ✓ Token obtido
- Lista de tabelas do dataset
- Lista de medidas DAX do modelo
- "Conexão 100% funcional!"

## Rodar local (opcional, só pra dev)

Copie `.env.local.example` → `.env.local`, cole o Client Secret, e rode:
```
npm install
npm test
```

## Segurança

- `.env.local` está no `.gitignore` — **nunca sobe pro GitHub**.
- No workflow, o secret vem de `${{ secrets.PBI_CLIENT_SECRET }}` — o GitHub
  mascara automaticamente em qualquer log.
