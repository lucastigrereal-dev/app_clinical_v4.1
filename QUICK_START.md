# ⚡ Quick Start - Clinic Companion Enterprise

**Data:** 24/10/2025
**Status:** ✅ Pronto para uso!

---

## 🚀 Início Rápido (3 minutos)

### **Opção 1: Docker (Recomendado) - Tudo automático**

```bash
# 1. Ir para o diretório
cd C:\Users\JAIANE\Desktop\clinic-companion-enterprise

# 2. Iniciar todos os serviços
docker-compose --profile dev up -d

# 3. Aguardar ~30 segundos e acessar:
# - Frontend: http://localhost:3001
# - Backend: http://localhost:3000
# - API Docs: http://localhost:3000/api/docs
```

**Pronto! 🎉**

---

### **Opção 2: Manual**

#### **Backend:**
```bash
cd C:\Users\JAIANE\Desktop\clinic-companion-enterprise\backend
npm install
npm run start:dev
```

#### **Frontend (em outro terminal):**
```bash
cd C:\Users\JAIANE\Desktop\clinic-companion-enterprise\frontend
npm install
npm run dev
```

---

## 📝 Comandos Úteis

### **Backend**

```bash
# Iniciar desenvolvimento
npm run start:dev

# Build para produção
npm run build

# Executar migrations
npm run migration:run

# Reverter última migration
npm run migration:revert

# Criar nova migration
npm run migration:generate src/database/migrations/NomeDaMigration

# Executar seeds
npm run seed

# Executar testes
npm run test

# Coverage de testes
npm run test:cov

# Lint
npm run lint
```

### **Frontend**

```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start

# Executar testes
npm run test

# Lint
npm run lint
```

### **Docker**

```bash
# Iniciar todos os serviços (development)
docker-compose --profile dev up -d

# Iniciar todos os serviços (production)
docker-compose --profile production up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild
docker-compose build --no-cache

# Restart serviço
docker-compose restart backend
```

---

## 🔐 Credenciais Padrão

### **Usuário Admin (Backend)**
```
Email: admin@clinic.com
Password: admin123
```

### **PgAdmin (Docker)**
```
URL: http://localhost:5050
Email: admin@clinic.com
Password: admin123
```

### **PostgreSQL (Docker)**
```
Host: localhost
Port: 5432
Database: clinic_companion
User: postgres
Password: postgres
```

### **Redis (Docker)**
```
Host: localhost
Port: 6379
Password: redis123
```

### **Railway PostgreSQL (Produção)**
```
Host: nozomi.proxy.rlwy.net
Port: 23483
Database: railway
User: postgres
Password: kfLomPIFIyvrojWOCZwvclxyKLQtgCSH
```

---

## 🧪 Testar API

### **1. Login (obter token)**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@clinic.com\",\"password\":\"admin123\"}"
```

### **2. Testar Medical AI**

```bash
# Copie o access_token do login acima

curl -X POST http://localhost:3000/api/medical-ai/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{
    \"patientId\": \"PAC-2025-001\",
    \"photoUrl\": \"https://example.com/photo.jpg\",
    \"procedureType\": \"lipoaspiracao\",
    \"daysPostOp\": 7
  }"
```

### **3. Listar Pacientes**

```bash
curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🐛 Troubleshooting

### **Erro: Port already in use**

```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número retornado)
taskkill /PID PID_NUMBER /F
```

### **Erro: Cannot connect to database**

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs -f postgres
```

### **Erro: Redis connection refused**

```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Ver logs
docker-compose logs -f redis
```

### **Erro: Module not found**

```bash
# Reinstalar dependências
cd backend
rm -rf node_modules package-lock.json
npm install
```

### **Erro: Migration already exists**

```bash
# Verificar migrations executadas
npm run typeorm migration:show

# Reverter última migration
npm run migration:revert

# Executar migrations
npm run migration:run
```

---

## 📁 Estrutura de Diretórios

```
clinic-companion-enterprise/
├── backend/           # NestJS API (porta 3000)
├── frontend/          # Next.js Web (porta 3001)
├── mobile/            # React Native (estrutura)
├── docker/            # Docker configs
├── docs/              # Documentação
└── scripts/           # Utility scripts
```

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| **README.md** | Visão geral do projeto |
| **STRUCTURE.md** | Estrutura detalhada |
| **SETUP_COMPLETE.md** | Guia completo de setup |
| **MIGRATION_REPORT.md** | Relatório da migração |
| **QUICK_START.md** | Este arquivo |

---

## 🎯 Checklist Inicial

Após clonar/baixar o projeto:

- [ ] Instalar dependências: `npm install` (backend e frontend)
- [ ] Copiar .env.example para .env
- [ ] Configurar variáveis de ambiente
- [ ] Iniciar PostgreSQL (Docker ou local)
- [ ] Executar migrations: `npm run migration:run`
- [ ] Iniciar backend: `npm run start:dev`
- [ ] Iniciar frontend: `npm run dev`
- [ ] Acessar http://localhost:3001
- [ ] Fazer login com admin@clinic.com
- [ ] Testar Medical AI endpoint

---

## 🔥 Comandos One-Liner

### **Setup completo com Docker:**
```bash
cd C:\Users\JAIANE\Desktop\clinic-companion-enterprise && docker-compose --profile dev up -d
```

### **Setup completo manual:**
```bash
cd C:\Users\JAIANE\Desktop\clinic-companion-enterprise\backend && npm install && npm run migration:run && npm run start:dev
```

### **Rebuild completo:**
```bash
docker-compose down -v && docker-compose build --no-cache && docker-compose --profile dev up -d
```

---

## ⚡ Atalhos

### **Windows (criar arquivo .bat)**

Crie `start-dev.bat`:
```batch
@echo off
cd C:\Users\JAIANE\Desktop\clinic-companion-enterprise
docker-compose --profile dev up -d
start http://localhost:3001
start http://localhost:3000/api/docs
```

### **Linux/Mac (criar arquivo .sh)**

Crie `start-dev.sh`:
```bash
#!/bin/bash
cd /Users/JAIANE/Desktop/clinic-companion-enterprise
docker-compose --profile dev up -d
open http://localhost:3001
open http://localhost:3000/api/docs
```

---

## 🎉 Pronto!

Agora você pode:

✅ Desenvolver localmente
✅ Testar APIs
✅ Fazer deploy
✅ Escalar a aplicação

**Boa sorte! 🚀**

---

**Criado em:** 24/10/2025
**Versão:** 1.0.0
