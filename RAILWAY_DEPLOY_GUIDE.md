# 🚀 Guia de Deploy no Railway - Clinic Companion Enterprise

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Conta no Railway (https://railway.app)
- [x] Código commitado no GitHub
- [x] Database PostgreSQL no Railway (já criado)

---

## 🎯 Passo a Passo - Deploy Backend

### 1️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Crie repositório com o nome: `clinic-companion-enterprise`
3. **NÃO** adicione README, .gitignore ou LICENSE (já temos)
4. Marque como **Privado** (recomendado para dados médicos)

### 2️⃣ Conectar Git Local ao GitHub

```bash
cd C:\Users\JAIANE\Desktop\clinic-companion-enterprise

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/clinic-companion-enterprise.git

# Fazer push
git push -u origin master
```

### 3️⃣ Deploy no Railway

#### A. Criar Novo Projeto
1. Acesse: https://railway.app/dashboard
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório: `clinic-companion-enterprise`
5. Railway detectará automaticamente o NestJS

#### B. Configurar Root Directory
1. No dashboard do projeto, clique em **Settings**
2. Em **"Root Directory"**, configure: `backend`
3. Salve as alterações

#### C. Configurar Variáveis de Ambiente

Clique em **Variables** e adicione:

```bash
# Database (já existe no Railway)
DATABASE_HOST=nozomi.proxy.rlwy.net
DATABASE_PORT=23483
DATABASE_NAME=railway
DATABASE_USER=postgres
DATABASE_PASSWORD=kfLomPIFIyvrojWOCZwvclxyKLQtgCSH

# App
NODE_ENV=production
API_PORT=3000
API_PREFIX=api

# JWT
JWT_SECRET=clinic-companion-jwt-secret-production-2025
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://seu-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Email (SMTP Gmail - obter senha de app)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-do-gmail
EMAIL_FROM=noreply@clinicompanion.com

# Stripe (usar chaves de produção)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis (se usar Railway Redis)
REDIS_HOST=containers-us-west-xxx.railway.app
REDIS_PORT=6379

# Frontend URL
FRONTEND_URL=https://seu-frontend.vercel.app
```

#### D. Conectar Database Existente
1. Clique em **"New"** > **"Database"** > **"Add PostgreSQL"**
2. ❌ **NÃO** crie novo database
3. ✅ Use as variáveis do database existente acima

### 4️⃣ Deploy Automático

O Railway vai:
1. ✅ Clonar repositório
2. ✅ Instalar dependências (`npm install`)
3. ✅ Compilar TypeScript (`npm run build`)
4. ✅ Executar migrations automaticamente
5. ✅ Iniciar servidor (`npm run start:prod`)

### 5️⃣ Verificar Deploy

1. Acesse a URL gerada pelo Railway (ex: `https://clinic-backend.up.railway.app`)
2. Teste endpoints:
   - `GET /api/health` - Health check
   - `GET /api/docs` - Swagger API docs
   - `POST /api/auth/login` - Login

---

## 🔧 Comandos Úteis

### Verificar Logs
```bash
railway logs
```

### Executar Migrations Manualmente
```bash
railway run npm run migration:run
```

### Conectar ao Database
```bash
railway connect postgres
```

---

## ⚠️ Importante

### Segurança
- ✅ Trocar `JWT_SECRET` para valor forte
- ✅ Trocar senha admin padrão (admin@clinic.com)
- ✅ Usar Stripe keys de **produção** (sk_live_)
- ✅ Configurar SMTP com credenciais reais
- ✅ Habilitar 2FA no Railway
- ✅ Configurar alertas de erro (Sentry)

### Performance
- ✅ Adicionar Redis para cache (opcional)
- ✅ Configurar CDN para assets estáticos
- ✅ Habilitar compressão (já configurado)
- ✅ Monitorar uso de recursos

### Backup
- ✅ Railway faz backup automático do PostgreSQL
- ✅ Configurar backup externo semanal
- ✅ Testar restore periodicamente

---

## 📊 Estrutura do Projeto no Railway

```
clinic-companion-enterprise/
├── backend/                    ← Root Directory no Railway
│   ├── Procfile               ← Comando de start
│   ├── railway.json           ← Configurações Railway
│   ├── nixpacks.toml          ← Build configuration
│   ├── package.json           ← Dependencies
│   ├── src/                   ← Source code
│   └── dist/                  ← Build output (gerado)
└── frontend/                  ← Deploy separado (Vercel)
```

---

## 🎯 Próximos Passos

### Backend ✅
- [x] GitHub push
- [x] Railway deploy
- [ ] Configurar domínio customizado
- [ ] Adicionar monitoring (Sentry)
- [ ] Configurar CI/CD (GitHub Actions)

### Frontend
- [ ] Deploy no Vercel
- [ ] Conectar com backend Railway
- [ ] Configurar variáveis de ambiente

---

## 🆘 Troubleshooting

### Build Falha
- Verificar logs: `railway logs`
- Checar se `npm run build` funciona localmente
- Confirmar Node version compatível (18.x)

### Migration Falha
- Executar manualmente: `railway run npm run migration:run`
- Verificar conexão com database
- Checar se migrations estão no dist/

### 502 Bad Gateway
- Verificar se app está ouvindo em `0.0.0.0:$PORT`
- Checar health check: `/api/health`
- Aumentar timeout no railway.json

---

**Criado por**: Claude Code (Sonnet 4.5)
**Data**: 24 de outubro de 2025

🚀 Boa sorte com o deploy!
