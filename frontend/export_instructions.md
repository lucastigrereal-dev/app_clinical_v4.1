# Export Instructions: Clinical Companion Frontend

This guide explains how to export this Clinical Companion frontend to GitHub and integrate it with your existing backend monorepo.

## 🚀 Quick Export to GitHub

### Option 1: Create New Repository
1. Create a new repository on GitHub: `clinical-companion-frontend`
2. Clone the new repository:
   ```bash
   git clone https://github.com/yourusername/clinical-companion-frontend.git
   cd clinical-companion-frontend
   ```
3. Copy all files from this Lovable project to the cloned repository
4. Commit and push:
   ```bash
   git add .
   git commit -m "Initial commit: Clinical Companion Frontend"
   git push origin main
   ```

### Option 2: Integration with Existing Monorepo

If you have an existing `clinical-companion-mvp` repository, integrate as follows:

```bash
# Navigate to your existing monorepo
cd clinical-companion-mvp

# Create frontend directory
mkdir -p frontend

# Copy all files from this Lovable project to frontend/
# (excluding .git, node_modules, dist)

# Update your monorepo structure:
clinical-companion-mvp/
├── backend/              # Your existing backend
├── frontend/             # This React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── docs/
├── docker-compose.yml    # Update to include frontend
└── README.md            # Update with frontend info
```

## 🔧 Integration Steps

### 1. Update Docker Configuration

Add frontend service to your `docker-compose.yml`:

```yaml
services:
  # ... existing backend services ...
  
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

### 2. Create Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 3. Update Environment Configuration

Create `frontend/.env.example`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Storage Configuration
VITE_MINIO_URL=http://localhost:9000

# OAuth Configuration (if implemented)
VITE_OAUTH_REDIRECT=http://localhost:3000/auth/callback
```

### 4. Update Main README.md

Add frontend section to your main repository README:

```markdown
## Frontend

The frontend is a React + TypeScript application built with Vite.

### Quick Start
```bash
cd frontend
npm install
npm run dev
```

### Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

See `frontend/README.md` for detailed documentation.
```

## 🔄 Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### Using Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 📦 Build & Deployment

### Production Build
```bash
cd frontend
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables:
   - `VITE_API_URL`: Your production API URL

### Deploy with Docker
```bash
# Production Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔐 Environment Variables

### Development (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
VITE_MINIO_URL=http://localhost:9000
```

### Production
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_MINIO_URL=https://storage.yourdomain.com
```

## 🧪 Testing Integration

### Backend API Tests
Ensure your backend has endpoints that match the frontend expectations:

```bash
# Test API endpoints
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@clinic.com","password":"password123"}'

curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/patients
```

### Frontend Smoke Tests
```bash
cd frontend
npm run test:smoke
```

## 📋 Checklist

- [ ] Frontend files copied to repository
- [ ] Environment variables configured
- [ ] Package.json scripts updated
- [ ] Docker configuration added (if using Docker)
- [ ] README.md updated with frontend information
- [ ] CI/CD pipeline updated to include frontend
- [ ] API endpoints tested and working
- [ ] Authentication flow tested
- [ ] File upload functionality tested

## 🆘 Common Issues

### API Connection Issues
- Verify `VITE_API_URL` matches your backend URL
- Check CORS configuration in backend
- Ensure backend is running on expected port

### Build Issues
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors with `npm run type-check`
- Verify all environment variables are set

### Authentication Issues
- Verify JWT secret matches between frontend and backend
- Check token storage in browser localStorage
- Ensure backend JWT middleware is configured correctly

## 🔗 Next Steps

1. **Setup CI/CD**: Add GitHub Actions for automated testing and deployment
2. **Monitoring**: Add error tracking (Sentry) and analytics
3. **Performance**: Optimize bundle size and add caching
4. **Features**: Implement additional features like notifications, search filters
5. **Security**: Add input validation and security headers

## 📞 Support

For integration issues or questions:
1. Check the main repository documentation
2. Review API documentation for endpoint compatibility
3. Test individual components in isolation
4. Verify environment configuration

Remember to update your backend CORS settings to allow requests from your frontend domain!