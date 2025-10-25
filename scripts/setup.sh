#!/bin/bash

# ========================================
# Clinic Companion Enterprise - Setup Script
# ========================================

set -e

echo "🏥 Clinic Companion Enterprise - Setup"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
print_info "Verificando pré-requisitos..."

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js não encontrado. Instale Node.js 20+ primeiro."
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  print_error "Node.js 20+ é necessário. Versão atual: $(node -v)"
  exit 1
fi
print_success "Node.js $(node -v) encontrado"

# Check npm
if ! command -v npm &> /dev/null; then
  print_error "npm não encontrado"
  exit 1
fi
print_success "npm $(npm -v) encontrado"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
  print_warning "PostgreSQL CLI (psql) não encontrado. Certifique-se de ter PostgreSQL 16+ instalado."
else
  print_success "PostgreSQL encontrado"
fi

# Check Docker (opcional)
if command -v docker &> /dev/null; then
  print_success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') encontrado"
else
  print_warning "Docker não encontrado (opcional)"
fi

echo ""
print_info "Iniciando setup do projeto..."
echo ""

# Setup Backend
print_info "📦 Configurando Backend..."
cd backend

if [ -f "package.json" ]; then
  print_info "Instalando dependências do backend..."
  npm install
  print_success "Dependências do backend instaladas"

  # Copy .env.example
  if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Arquivo .env criado (configure as variáveis)"
    print_warning "⚠️  IMPORTANTE: Edite o arquivo backend/.env com suas configurações!"
  fi
else
  print_warning "package.json não encontrado no backend"
fi

cd ..

# Setup Frontend
print_info "📦 Configurando Frontend..."
cd frontend

if [ -f "package.json" ]; then
  print_info "Instalando dependências do frontend..."
  npm install
  print_success "Dependências do frontend instaladas"

  # Copy .env.example
  if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Arquivo .env criado (configure as variáveis)"
    print_warning "⚠️  IMPORTANTE: Edite o arquivo frontend/.env com suas configurações!"
  fi
else
  print_warning "package.json não encontrado no frontend"
fi

cd ..

# Setup Mobile
print_info "📦 Configurando Mobile..."
cd mobile

if [ -f "package.json" ]; then
  print_info "Instalando dependências do mobile..."
  npm install
  print_success "Dependências do mobile instaladas"

  # Copy .env.example
  if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Arquivo .env criado (configure as variáveis)"
    print_warning "⚠️  IMPORTANTE: Edite o arquivo mobile/.env com suas configurações!"
  fi
else
  print_warning "package.json não encontrado no mobile"
fi

cd ..

echo ""
print_success "Setup concluído!"
echo ""

# Next steps
echo "📋 Próximos passos:"
echo ""
echo "1. Configure os arquivos .env:"
echo "   - backend/.env"
echo "   - frontend/.env"
echo "   - mobile/.env"
echo ""
echo "2. Configure o banco de dados PostgreSQL"
echo ""
echo "3. Execute as migrations:"
echo "   cd backend"
echo "   npm run migration:run"
echo ""
echo "4. Execute os seeds (opcional):"
echo "   npm run seed"
echo ""
echo "5. Inicie o backend:"
echo "   npm run start:dev"
echo ""
echo "6. Em outro terminal, inicie o frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "7. (Opcional) Inicie o mobile:"
echo "   cd mobile"
echo "   npm start"
echo ""
print_success "Pronto para começar! 🚀"
