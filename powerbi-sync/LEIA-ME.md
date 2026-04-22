# Power BI → Dashboard de Indicadores

Este script conecta no **Power BI** (workspace Diretoria, dataset Diretoria)
via API oficial da Microsoft e traz os indicadores pro dashboard.

## 📦 Primeiro uso (uma vez só)

### 1. Node.js instalado
Se já instalou pro `sync-local/` (IXC), tá tudo certo. Senão, baixe em
https://nodejs.org (versão LTS).

### 2. Preencher credenciais

Copie `.env.local.example` pra `.env.local`:

**Windows (PowerShell):**
```
copy .env.local.example .env.local
```

**Mac/Linux:**
```
cp .env.local.example .env.local
```

Abra o `.env.local` no Bloco de Notas e **cole o Client Secret** no campo:
```
PBI_CLIENT_SECRET=cole-aqui-o-secret-que-voce-salvou-no-notepad
```

(Os outros IDs já vêm preenchidos.)

### 3. Instalar dependências
Na pasta `powerbi-sync/`, abra o terminal e rode:
```
npm install
```

## ▶️ Testar conexão

```
npm test
```

Se funcionar, vai imprimir:
- ✓ Token obtido
- Lista de tabelas do dataset
- Lista de medidas DAX do modelo
- "Conexão 100% funcional!"

## 🔒 Segurança

- O arquivo `.env.local` está no `.gitignore` — **não sobe pro GitHub**.
- O Client Secret **nunca aparece no código fonte**.
- Em produção (GitHub Actions / sync automático), as credenciais
  vão como "GitHub Secrets" (próximo passo, depois do teste passar).
