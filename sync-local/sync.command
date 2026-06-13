#!/bin/bash
# ===============================================================
#  TEXNET IXC SYNC - Mac/Linux - duplo clique (ou ./sync.command)
# ===============================================================
cd "$(dirname "$0")"

echo
echo "==========================================================="
echo "  TEXNET - Sync IXC → Dashboard"
echo "==========================================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[ERRO] Node.js não encontrado."
  echo
  echo "Instale em: https://nodejs.org/pt-br/download"
  echo
  read -n 1 -s -r -p "Aperte qualquer tecla para fechar..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Primeira execução — instalando dependências... (~1 min)"
  echo
  npm install --no-fund --no-audit || {
    echo
    echo "[ERRO] Falha ao instalar dependências."
    read -n 1 -s -r -p "Aperte qualquer tecla para fechar..."
    exit 1
  }
  echo
fi

node sync.js "$@"

echo
echo "==========================================================="
echo "  Terminado. Pode fechar a janela."
echo "==========================================================="
read -n 1 -s -r -p "Aperte qualquer tecla para fechar..."
