@echo off
REM ===============================================================
REM  TEXNET IXC SYNC - executa localmente (ignora bloqueio de IP)
REM  Duplo clique neste arquivo
REM ===============================================================
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo   TEXNET - Sync IXC - Dashboard
echo ===========================================================
echo.

REM Verifica se Node esta instalado
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo.
  echo Instale em: https://nodejs.org/pt-br/download
  echo Depois feche esta janela e abra de novo.
  echo.
  pause
  exit /b 1
)

REM Instala dependencias se faltar
if not exist "node_modules" (
  echo Primeira execucao - instalando dependencias... ^(demora ~1 min^)
  echo.
  call npm install --no-fund --no-audit
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
  echo.
  echo Dependencias instaladas OK.
  echo.
)

REM Roda o sync
node sync.js %*

echo.
echo ===========================================================
echo   Terminado. Voce pode fechar esta janela.
echo ===========================================================
pause
endlocal
