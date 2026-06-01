@echo off
REM ===============================================================
REM  TEXNET - Configurar Agendamento Automatico
REM  Cria tarefas no Agendador de Tarefas do Windows para rodar
REM  SINCRONIZAR-CLIENTES.bat a cada hora das 07:30 as 18:30.
REM  Execute UMA VEZ como Administrador.
REM ===============================================================
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo   TEXNET - Configurar Agendamento Automatico
echo   Sincronizacao de Clientes: 07:30 ate 18:30 (de hora em hora)
echo ===========================================================
echo.

REM Verifica se esta rodando como Administrador
net session >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Execute este arquivo como ADMINISTRADOR.
  echo.
  echo  Clique com botao direito no arquivo e escolha:
  echo  "Executar como administrador"
  echo.
  pause
  exit /b 1
)

REM Caminho do script (usa a pasta onde este BAT esta)
set SCRIPT="%~dp0SINCRONIZAR-CLIENTES.bat"
set NOME_BASE=TEXNET-SyncClientes

echo Removendo tarefas antigas (se existirem)...
for %%H in (07h30 08h30 09h30 10h30 11h30 12h30 13h30 14h30 15h30 16h30 17h30 18h30) do (
  SCHTASKS /DELETE /TN "%NOME_BASE%-%%H" /F >nul 2>&1
)

echo Criando tarefas (uma por horario)...

SCHTASKS /CREATE /TN "%NOME_BASE%-07h30" /TR %SCRIPT% /SC DAILY /ST 07:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-08h30" /TR %SCRIPT% /SC DAILY /ST 08:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-09h30" /TR %SCRIPT% /SC DAILY /ST 09:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-10h30" /TR %SCRIPT% /SC DAILY /ST 10:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-11h30" /TR %SCRIPT% /SC DAILY /ST 11:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-12h30" /TR %SCRIPT% /SC DAILY /ST 12:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-13h30" /TR %SCRIPT% /SC DAILY /ST 13:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-14h30" /TR %SCRIPT% /SC DAILY /ST 14:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-15h30" /TR %SCRIPT% /SC DAILY /ST 15:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-16h30" /TR %SCRIPT% /SC DAILY /ST 16:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-17h30" /TR %SCRIPT% /SC DAILY /ST 17:30 /F >nul
SCHTASKS /CREATE /TN "%NOME_BASE%-18h30" /TR %SCRIPT% /SC DAILY /ST 18:30 /F >nul

echo.
echo Verificando tarefas criadas...
SCHTASKS /QUERY /FO LIST /TN "%NOME_BASE%-07h30" 2>nul | findstr /i "tarefa status"
SCHTASKS /QUERY /FO LIST /TN "%NOME_BASE%-12h30" 2>nul | findstr /i "tarefa status"
SCHTASKS /QUERY /FO LIST /TN "%NOME_BASE%-18h30" 2>nul | findstr /i "tarefa status"

echo.
echo ===========================================================
echo   PRONTO! 12 tarefas criadas:
echo   07:30 / 08:30 / 09:30 / 10:30 / 11:30 / 12:30
echo   13:30 / 14:30 / 15:30 / 16:30 / 17:30 / 18:30
echo.
echo   Para ver todas: Agendador de Tarefas do Windows
echo   (Pesquise "Agendador de Tarefas" no menu Iniciar)
echo.
echo   Para REMOVER tudo, rode REMOVER-AGENDAMENTO.bat
echo ===========================================================
pause
endlocal
