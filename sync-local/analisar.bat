@echo off
REM Analise completa do mes: agrupa registros para achar onde ta sobrando valor
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo   TEXNET - Analise Receitas (mes atual)
echo ===========================================================
echo.

where node >nul 2>nul
if errorlevel 1 ( echo [ERRO] Node.js nao encontrado. & pause & exit /b 1 )

if not exist "node_modules" ( call npm install --no-fund --no-audit )

node sync.js --analisar

echo.
echo ===========================================================
echo  Copie TUDO acima e me envie no chat
echo ===========================================================
pause
endlocal
