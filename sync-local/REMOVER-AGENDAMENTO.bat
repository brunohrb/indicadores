@echo off
REM ===============================================================
REM  TEXNET - Remover Agendamento Automatico
REM  Remove todas as tarefas criadas pelo CONFIGURAR-AGENDAMENTO.bat
REM ===============================================================
setlocal

net session >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Execute como ADMINISTRADOR.
  pause
  exit /b 1
)

set NOME_BASE=TEXNET-SyncClientes
echo Removendo tarefas TEXNET-SyncClientes...

for %%H in (07h30 08h30 09h30 10h30 11h30 12h30 13h30 14h30 15h30 16h30 17h30 18h30) do (
  SCHTASKS /DELETE /TN "%NOME_BASE%-%%H" /F >nul 2>&1
  echo   Removido: %NOME_BASE%-%%H
)

echo.
echo Pronto! Agendamento removido.
pause
endlocal
