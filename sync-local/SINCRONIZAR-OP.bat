@echo off
REM ===============================================================
REM  TEXNET - Sincronizar Dados Operacionais (OS, Cancelamentos, Vendas por rede)
REM  Roda local (IP autorizado). Duplo clique. Sem dependencias extras.
REM ===============================================================
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo   TEXNET - Sincronizar Dados Operacionais (IXC)
echo ===========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale em: https://nodejs.org/pt-br/download
  pause
  exit /b 1
)

REM Passa o mes como argumento (opcional). Sem argumento = mes atual.
REM Exemplo: SINCRONIZAR-OP.bat 2026-05
if "%~1"=="" (
  node sync-indicadores-op.js
) else (
  node sync-indicadores-op.js %~1
)

echo.
echo ===========================================================
echo   Terminado. Voce pode fechar esta janela.
echo ===========================================================
pause
endlocal
