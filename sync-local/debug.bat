@echo off
REM Diagnostico de campos fn_areceber - para ajustar calculo de Total Recebido
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo   TEXNET - Diagnostico campos IXC (fn_areceber)
echo ===========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias... (~1 min)
  call npm install --no-fund --no-audit
)

node sync.js --debug

echo.
echo ===========================================================
echo  Copie TUDO acima e cole no chat para eu ajustar o calculo
echo ===========================================================
pause
endlocal
