# 🏗️ Clinic Companion Enterprise - Estrutura do Projeto

## 📁 Estrutura de Diretórios

```
clinic-companion-enterprise/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
│
├── backend/                # Backend NestJS
│   ├── src/
│   │   ├── modules/        # Módulos de negócio
│   │   │   ├── auth/       # Autenticação e autorização
│   │   │   ├── users/      # Gestão de usuários
│   │   │   ├── patients/   # Gestão de pacientes
│   │   │   ├── appointments/    # Agendamentos
│   │   │   ├── procedures/ # Procedimentos médicos
│   │   │   ├── protocols/  # Protocolos pós-operatórios
│   │   │   ├── medical-ai/ # Análise de fotos por IA
│   │   │   └── notifications/   # Sistema de notificações
│   │   │
│   │   ├── database/       # Database related files
│   │   │   ├── migrations/ # TypeORM migrations
│   │   │   └── seeds/      # Database seeders
│   │   │
│   │   ├── common/         # Shared utilities
│   │   │   ├── decorators/ # Custom decorators
│   │   │   ├── filters/    # Exception filters
│   │   │   ├── guards/     # Auth guards
│   │   │   ├── interceptors/    # Request/response interceptors
│   │   │   └── pipes/      # Validation pipes
│   │   │
│   │   ├── config/         # Configuration files
│   │   └── cache/          # Cache service
│   │
│   └── test/               # Tests
│       ├── unit/           # Unit tests
│       ├── integration/    # Integration tests
│       └── e2e/            # End-to-end tests
│
├── frontend/               # Frontend Next.js
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   │   ├── ui/         # UI components (shadcn/ui)
│   │   │   ├── layout/     # Layout components
│   │   │   └── forms/      # Form components
│   │   │
│   │   ├── lib/            # Libraries and utilities
│   │   │   ├── api/        # API client
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   └── utils/      # Utility functions
│   │   │
│   │   └── styles/         # Global styles
│   │
│   └── public/             # Static assets
│
├── mobile/                 # Mobile App (React Native)
│   └── src/
│       ├── screens/        # Screen components
│       ├── components/     # Reusable components
│       ├── navigation/     # Navigation configuration
│       ├── services/       # API services
│       ├── hooks/          # Custom hooks
│       ├── utils/          # Utility functions
│       └── assets/         # Images, fonts, etc.
│
├── docker/                 # Docker configurations
│   ├── backend/            # Backend Dockerfile
│   ├── frontend/           # Frontend Dockerfile
│   └── nginx/              # Nginx configuration
│
├── docs/                   # Project documentation
│   ├── api/                # API documentation
│   ├── architecture/       # Architecture diagrams
│   └── deployment/         # Deployment guides
│
└── scripts/                # Utility scripts
    ├── setup.sh            # Project setup
    ├── deploy.sh           # Deployment script
    └── backup.sh           # Database backup
```

## 🎯 Módulos do Backend

### **auth/**
- Autenticação JWT
- Login/Logout
- Refresh tokens
- Password reset

### **users/**
- CRUD de usuários
- Perfis (admin, doctor, patient)
- Permissões

### **patients/**
- Cadastro de pacientes
- Histórico médico
- Documentos

### **appointments/**
- Agendamento de consultas
- Calendário médico
- Notificações

### **procedures/**
- Tipos de procedimentos
- Detalhes técnicos
- Protocolos associados

### **protocols/**
- Protocolos pós-operatórios
- Milestones por dia
- Recomendações

### **medical-ai/**
- Análise de fotos
- Detecção de complicações
- Score de recuperação
- **patientId aceita STRING** ✅

### **notifications/**
- Push notifications
- Email notifications
- SMS notifications
- In-app notifications

## 🔧 Stack Tecnológico

### **Backend:**
- Node.js 20+
- NestJS 10+
- TypeScript 5+
- PostgreSQL 16
- Redis 7
- TypeORM

### **Frontend:**
- Next.js 14+
- React 18+
- TypeScript 5+
- Tailwind CSS
- shadcn/ui

### **Mobile:**
- React Native
- Expo
- TypeScript

### **DevOps:**
- Docker & Docker Compose
- GitHub Actions
- Railway / AWS
- Nginx

## 📊 Padrões de Código

### **Backend - NestJS Module Structure:**
```
module-name/
├── dto/
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── query-*.dto.ts
├── entities/
│   └── *.entity.ts
├── controllers/
│   └── *.controller.ts
├── services/
│   └── *.service.ts
├── repositories/
│   └── *.repository.ts
├── *.module.ts
└── *.spec.ts
```

### **Frontend - Component Structure:**
```
component-name/
├── component-name.tsx
├── component-name.styles.ts (opcional)
├── component-name.spec.tsx
└── index.ts
```

## 🚀 Próximos Passos

1. ✅ Estrutura de diretórios criada
2. ⏳ Copiar código do projeto atual
3. ⏳ Configurar package.json
4. ⏳ Configurar Docker
5. ⏳ Configurar CI/CD
6. ⏳ Documentar APIs
7. ⏳ Configurar testes

---

**Criado em:** 24/10/2025
**Versão:** 1.0.0
**Status:** Estrutura inicial criada ✅
