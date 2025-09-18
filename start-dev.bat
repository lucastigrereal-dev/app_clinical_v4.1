@echo off
echo ========================================
echo  CLINIC COMPANION v4 - INICIANDO...
echo ========================================
echo.

echo [1/3] Verificando instalacao...
if not exist "node_modules" (
    echo ERRO: Execute install.bat primeiro!
    pause
    exit /b 1
)

echo [2/3] Iniciando Backend (porta 3001)...
start "Backend - Clinic Companion" cmd /k "cd backend && npm run start:dev"

echo [3/3] Iniciando Frontend (porta 3000)...
timeout /t 5 /nobreak >nul
start "Frontend - Clinic Companion" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Aguarde 10 segundos e acesse:
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001/api
echo   API Docs: http://localhost:3001/api/docs
echo.
echo Credenciais de demonstracao:
echo   Admin:    admin@clinic.com / admin123
echo   Medico:   dr.silva@clinic.com / medico123
echo   Paciente: maria@email.com / paciente123
echo.
echo Para parar: Feche as janelas do cmd
echo ========================================
echo.
timeout /t 10 /nobreak >nul
start http://localhost:3000
