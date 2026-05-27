@echo off
REM ===============================================================
REM  TEXNET - Consultar Cliente no IXC (roda local, IP autorizado)
REM  Duplo clique neste arquivo, digite o nome e veja o valor.
REM ===============================================================
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo   TEXNET - Consultar Cliente no IXC
echo ===========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale em: https://nodejs.org/pt-br/download
  echo Depois feche esta janela e abra de novo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Primeira execucao - instalando dependencias... ^(demora ~1 min^)
  echo.
  call npm install --no-fund --no-audit
)

node consulta-cliente.js %*

echo.
echo ===========================================================
echo   Terminado. Voce pode fechar esta janela.
echo ===========================================================
pause
endlocal
