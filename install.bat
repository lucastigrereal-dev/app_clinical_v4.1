@echo off
echo ========================================
echo  CLINIC COMPANION v4 - SETUP AUTOMATICO
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado! Instale em nodejs.org
    pause
    exit /b 1
)
echo OK - Node.js instalado

echo.
echo [2/5] Instalando dependencias raiz...
call npm install

echo.
echo [3/5] Configurando Backend...
cd backend
call npm install
cd ..

echo.
echo [4/5] Configurando Frontend...
cd frontend  
call npm install
cd ..

echo.
echo [5/5] Criando banco de dados...
if not exist "backend\database" mkdir backend\database

echo.
echo ========================================
echo  INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para iniciar o sistema, execute:
echo   start-dev.bat
echo.
echo Credenciais de acesso:
echo   Admin: admin@clinic.com / admin123
echo   Medico: dr.silva@clinic.com / medico123
echo   Paciente: maria@email.com / paciente123
echo.
echo ========================================
pause
