@echo off
REM ===============================================================
REM  TEXNET - Sincronizar Clientes do IXC para o Coach IA
REM  Roda local (IP autorizado). Duplo clique. Nao precisa instalar nada.
REM ===============================================================
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo   TEXNET - Sincronizar Clientes (IXC - Coach IA)
echo ===========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale em: https://nodejs.org/pt-br/download
  pause
  exit /b 1
)

node sync-clientes.js

echo.
echo ===========================================================
echo   Terminado. Voce pode fechar esta janela.
echo ===========================================================
pause
endlocal
