# 🏥 Clinic Companion Enterprise

> Sistema completo de gestão clínica com IA para análise pós-operatória

## 🎯 Visão Geral

Clinic Companion Enterprise é uma plataforma completa para gestão de clínicas de cirurgia plástica, oferecendo:

- 👥 Gestão de pacientes e profissionais
- 📅 Agendamento de consultas e procedimentos
- 🤖 Análise de fotos por IA (detecção de complicações)
- 📊 Protocolos pós-operatórios personalizados
- 🔔 Sistema de notificações multi-canal
- 📱 Apps web e mobile
- 🔐 Autenticação e autorização robusta

## 🚀 Quick Start

### **Pré-requisitos:**
- Node.js 20+
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (opcional)

### **Instalação:**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/clinic-companion-enterprise.git
cd clinic-companion-enterprise

# Backend
cd backend
npm install
cp .env.example .env
npm run migration:run
npm run seed
npm run start:dev

# Frontend (em outro terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# Mobile (em outro terminal)
cd mobile
npm install
cp .env.example .env
npm start
```

## 📁 Estrutura do Projeto

```
clinic-companion-enterprise/
├── backend/       # NestJS API
├── frontend/      # Next.js Web App
├── mobile/        # React Native App
├── docker/        # Docker configs
├── docs/          # Documentação
└── scripts/       # Utility scripts
```

📖 **Veja [STRUCTURE.md](STRUCTURE.md) para detalhes completos da estrutura.**

## 🔧 Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | NestJS, TypeScript, PostgreSQL, Redis, TypeORM |
| **Frontend** | Next.js 14, React 18, Tailwind CSS, shadcn/ui |
| **Mobile** | React Native, Expo, TypeScript |
| **IA** | OpenAI GPT-4 Vision, Custom ML Models |
| **DevOps** | Docker, GitHub Actions, Railway/AWS |

## 🎯 Módulos Principais

### **🤖 Medical AI**
Análise automática de fotos pós-operatórias:
- Score de recuperação (0-100)
- Detecção de complicações (hematoma, edema, infecção, etc.)
- Recomendações personalizadas
- Alertas para revisão médica

**API Endpoint:**
```bash
POST /api/medical-ai/analyze
Content-Type: application/json
Authorization: Bearer <token>

{
  "patientId": "PAC-12345-2025",  # ✅ Aceita STRING
  "photoUrl": "https://...",
  "procedureType": "lipoaspiracao",
  "daysPostOp": 7
}
```

### **📋 Protocols**
Protocolos pós-operatórios detalhados:
- 82 milestones por procedimento
- Recomendações diárias (D+0 até D+180)
- Sinais de alerta
- Cuidados específicos

### **🔔 Notifications**
Sistema multi-canal:
- Push notifications (web + mobile)
- Email
- SMS
- In-app notifications

## 🧪 Testes

```bash
# Backend - Unit tests
cd backend
npm run test

# Backend - Coverage
npm run test:cov

# Backend - E2E tests
npm run test:e2e

# Frontend - Tests
cd frontend
npm run test
```

## 🐳 Docker

```bash
# Build e start todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 📊 Banco de Dados

### **Migrations:**
```bash
# Criar migration
npm run migration:create src/database/migrations/NomeDaMigration

# Gerar migration (auto)
npm run migration:generate src/database/migrations/NomeDaMigration

# Executar migrations
npm run migration:run

# Reverter última migration
npm run migration:revert
```

### **Seeds:**
```bash
# Rodar seeds
npm run seed

# Seed específico
npm run seed:run -- --class=UserSeeder
```

## 🚀 Deploy

### **Railway:**
```bash
# Login
railway login

# Link projeto
railway link

# Deploy
railway up
```

### **Manual (VPS):**
```bash
# Usar script de deploy
./scripts/deploy.sh production
```

## 📚 Documentação

- [Estrutura do Projeto](STRUCTURE.md)
- [API Docs](docs/api/README.md) (Swagger: `/api/docs`)
- [Arquitetura](docs/architecture/README.md)
- [Deployment Guide](docs/deployment/README.md)

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Refresh tokens
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet.js
- ✅ Validação de dados (class-validator)
- ✅ SQL injection protection (TypeORM)
- ✅ XSS protection

## 📈 Performance

- ✅ Redis cache
- ✅ Database indexing
- ✅ Query optimization
- ✅ Lazy loading
- ✅ Image optimization (Next.js)
- ✅ CDN para assets estáticos
- ✅ Compression

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### **Conventional Commits:**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Jaiane** - Desenvolvimento inicial
- **Claude Code** - Assistente de desenvolvimento IA

## 📞 Suporte

- 📧 Email: suporte@cliniccompanion.com
- 💬 Discord: [Link do servidor]
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/clinic-companion-enterprise/issues)

---

## 🎉 Changelog

### **v1.0.0** - 2025-10-24

#### ✨ Features Implementadas:
- ✅ Estrutura enterprise-grade criada
- ✅ Medical AI: patientId aceita STRING (VARCHAR 255)
- ✅ Backend: 8 módulos principais
- ✅ Frontend: Next.js 14 + shadcn/ui
- ✅ Mobile: React Native + Expo (estrutura)
- ✅ CI/CD: GitHub Actions
- ✅ Tests: 121 testes passando (100%)
- ✅ Cache: Redis com hit/miss tracking
- ✅ Protocols: 2 procedimentos com 82 milestones cada

#### 🔧 Tecnologias:
- NestJS 10
- Next.js 14
- PostgreSQL 16
- Redis 7
- TypeScript 5

#### 📊 Estatísticas:
- 1,500+ linhas de código backend
- 500+ linhas de código frontend
- 800+ linhas de testes
- 90-100% coverage (módulos testados)

---

**🚀 Desenvolvido com ❤️ usando NestJS, Next.js e React Native**
