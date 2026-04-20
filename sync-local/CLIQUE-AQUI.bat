@echo off
REM Atalho que chama o sync.bat - evita confusao com o sync.js
cd /d "%~dp0"
call sync.bat %*
