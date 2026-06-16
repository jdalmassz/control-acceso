@echo off
title Control de Acceso - Servidor
echo ============================================
echo   Control de Acceso - Iniciando servidor...
echo ============================================
echo.

cd /d "%~dp0backend"
node index.js

pause
