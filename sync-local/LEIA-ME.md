# 📊 Sync IXC → Dashboard (versão local)

Este programa busca os dados do **IXC Soft** e grava no Supabase para o dashboard
mostrar. Roda no seu PC do escritório (o IP já é liberado no IXC), por isso
funciona — diferente da versão do GitHub Actions que estava bloqueada.

## ✅ Passo a passo (uma vez só)

### 1. Instalar o Node.js
Baixe e instale: **https://nodejs.org/pt-br/download**
→ Escolha a opção **LTS** (botão do lado esquerdo).
→ No instalador, vai clicando "Avançar / Next" até o fim.

### 2. Baixar esta pasta
- Abra: https://github.com/brunohrb/indicadores
- Clique no botão verde **Code** → **Download ZIP**
- Extraia o ZIP em qualquer lugar (ex: `C:\texnet-sync\`)
- Entre na pasta `indicadores-main\sync-local\`

## ▶️ Para sincronizar (sempre que quiser)

> ⚠️ **ATENÇÃO:** só dê dois cliques no **`sync.bat`** (Windows) ou **`sync.command`** (Mac).
> **NUNCA** clique no `sync.js` — o Windows tenta abrir com o "Windows Script Host"
> e dá erro `Caractere inválido / 800A03F6`. Esse arquivo só é executado pelo `.bat`.

**Dois cliques** no arquivo:
- **Windows:** `sync.bat`
- **Mac:** `sync.command`

Na primeira vez vai demorar 1 minuto (baixando dependências). Depois disso é rápido (~30s).

No final vai aparecer:
```
🎉 Sync concluído! Abra o dashboard e clique em "Atualizar agora".
```

Aí é só abrir o dashboard e clicar em **Atualizar agora** na aba IXC.

## 🗓️ Opções especiais

Se quiser sincronizar um mês antigo ou vários meses, abra o terminal na pasta e rode:

```
node sync.js --mes 2026-03        # só março/2026
node sync.js --full               # últimos 12 meses
```

(Ou crie um atalho de `sync.bat` com o parâmetro no final.)

## ❓ Deu erro?

| Erro | O que fazer |
|---|---|
| `Caractere inválido` / `800A03F6` (Windows Script Host) | Você clicou no `sync.js` — clique no **`sync.bat`** |
| `Node.js não encontrado` | Instalar o Node.js (passo 1 acima) |
| `Seu IP não está liberado` | Você não está na rede do escritório — conecte na VPN ou vá para o escritório |
| `Failed to fetch` / `ECONNREFUSED` | Problema de rede — veja se consegue abrir o IXC no navegador |
| `Supabase erro` | Token Supabase mudou — me avise |

## 🔒 Segurança

Este arquivo contém o token do IXC e a chave anônima do Supabase. Eles já estão
públicos no repositório GitHub. Se trocar qualquer um, edite `sync.js` na parte
de cima (`const cfg = { ... }`).
