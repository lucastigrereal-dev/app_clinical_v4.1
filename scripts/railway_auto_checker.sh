#!/bin/bash

# 🚂 RAILWAY AUTO CHECKER & CONFIGURATOR
# Autor: Opus Assistant
# Data: 26/10/2025
# Objetivo: Verificar e configurar Railway automaticamente

set -e

# ========================================
# CONFIGURAÇÕES
# ========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações do projeto
PROJECT_NAME="app_clinical_v4.1"
DOMAIN_BASE="appclinicalv41-production.up.railway.app"
API_URL="https://${DOMAIN_BASE}"
CHECK_INTERVAL=10  # segundos entre verificações
MAX_ATTEMPTS=60     # máximo de tentativas (10 minutos)

# Uso: ./railway_auto_checker.sh --auto
# Ou: ./railway_auto_checker.sh (menu interativo)

echo "🚂 Railway Auto Checker - Opus Edition"
echo "Execute com --auto para modo automático"
