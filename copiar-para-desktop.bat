@echo off
echo ========================================
echo  COPIANDO PROJETO PARA SEU DESKTOP
echo ========================================
echo.

set SOURCE=%cd%
set DESTINATION=C:\Users\JAIANE\Desktop\clinic-companion-v4

echo Origem: %SOURCE%
echo Destino: %DESTINATION%
echo.

echo Criando pasta de destino...
if not exist "%DESTINATION%" mkdir "%DESTINATION%"

echo Copiando arquivos do projeto...
xcopy /E /I /Y "%SOURCE%\*" "%DESTINATION%\"

echo.
echo ========================================
echo  PROJETO COPIADO COM SUCESSO!
echo ========================================
echo.
echo Agora voce pode:
echo.
echo 1. Abrir a pasta: C:\Users\JAIANE\Desktop\clinic-companion-v4
echo 2. Executar: install.bat (primeira vez)
echo 3. Executar: start-dev.bat (para iniciar)
echo.
echo ========================================
pause
