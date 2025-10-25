@echo off
REM ========================================
REM Clinic Companion Enterprise - Setup Script (Windows)
REM ========================================

echo.
echo ========================================
echo Clinic Companion Enterprise - Setup
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js nao encontrado. Instale Node.js 20+ primeiro.
    exit /b 1
)

echo [OK] Node.js encontrado:
node -v

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm nao encontrado
    exit /b 1
)

echo [OK] npm encontrado:
npm -v

REM Check PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] PostgreSQL CLI (psql) nao encontrado. Certifique-se de ter PostgreSQL 16+ instalado.
) else (
    echo [OK] PostgreSQL encontrado
)

REM Check Docker (optional)
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Docker nao encontrado (opcional)
) else (
    echo [OK] Docker encontrado
)

echo.
echo [INFO] Iniciando setup do projeto...
echo.

REM Setup Backend
echo [INFO] Configurando Backend...
cd backend

if exist package.json (
    echo [INFO] Instalando dependencias do backend...
    call npm install
    echo [OK] Dependencias do backend instaladas

    REM Copy .env.example
    if exist .env.example (
        if not exist .env (
            copy .env.example .env
            echo [OK] Arquivo .env criado (configure as variaveis)
            echo [WARN] IMPORTANTE: Edite o arquivo backend\.env com suas configuracoes!
        )
    )
) else (
    echo [WARN] package.json nao encontrado no backend
)

cd ..

REM Setup Frontend
echo [INFO] Configurando Frontend...
cd frontend

if exist package.json (
    echo [INFO] Instalando dependencias do frontend...
    call npm install
    echo [OK] Dependencias do frontend instaladas

    REM Copy .env.example
    if exist .env.example (
        if not exist .env (
            copy .env.example .env
            echo [OK] Arquivo .env criado (configure as variaveis)
            echo [WARN] IMPORTANTE: Edite o arquivo frontend\.env com suas configuracoes!
        )
    )
) else (
    echo [WARN] package.json nao encontrado no frontend
)

cd ..

REM Setup Mobile
echo [INFO] Configurando Mobile...
cd mobile

if exist package.json (
    echo [INFO] Instalando dependencias do mobile...
    call npm install
    echo [OK] Dependencias do mobile instaladas

    REM Copy .env.example
    if exist .env.example (
        if not exist .env (
            copy .env.example .env
            echo [OK] Arquivo .env criado (configure as variaveis)
            echo [WARN] IMPORTANTE: Edite o arquivo mobile\.env com suas configuracoes!
        )
    )
) else (
    echo [WARN] package.json nao encontrado no mobile
)

cd ..

echo.
echo [OK] Setup concluido!
echo.

REM Next steps
echo ========================================
echo Proximos passos:
echo ========================================
echo.
echo 1. Configure os arquivos .env:
echo    - backend\.env
echo    - frontend\.env
echo    - mobile\.env
echo.
echo 2. Configure o banco de dados PostgreSQL
echo.
echo 3. Execute as migrations:
echo    cd backend
echo    npm run migration:run
echo.
echo 4. Execute os seeds (opcional):
echo    npm run seed
echo.
echo 5. Inicie o backend:
echo    npm run start:dev
echo.
echo 6. Em outro terminal, inicie o frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 7. (Opcional) Inicie o mobile:
echo    cd mobile
echo    npm start
echo.
echo [OK] Pronto para comecar!
echo.

pause
