# Clinical Companion Frontend

A modern React application for clinical patient management with timeline tracking and photo documentation.

## 🚀 Features

- **JWT Authentication** - Secure login with token-based authentication
- **Patient Dashboard** - Comprehensive patient list with search functionality
- **Timeline Management** - Patient treatment timeline from D0 to M12
- **Photo Upload** - Drag-and-drop photo documentation with progress tracking
- **Responsive Design** - Modern healthcare-inspired UI with dark mode support
- **Real-time Updates** - Live data synchronization with backend API

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios with JWT interceptors
- **File Upload**: React Dropzone
- **Routing**: React Router v6
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (see API configuration below)

## 🔧 Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd clinical-companion-frontend
npm install
```

2. **Environment Configuration:**

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# MinIO/Storage Configuration (optional)
VITE_MINIO_URL=http://localhost:9000

# OAuth Configuration (optional)
VITE_OAUTH_REDIRECT=http://localhost:5173/auth/callback
```

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

## 🔑 Authentication

### Demo Credentials
- **Email:** demo@clinic.com
- **Password:** password123

### API Integration
The application uses JWT token-based authentication:
- Tokens are stored in localStorage as `clinical_companion_token`
- Automatic token refresh on API calls
- Redirect to login on 401 unauthorized responses

## 📚 API Integration

The frontend consumes the Clinical Companion API with the following endpoints:

### Authentication
- `POST /auth/login` - User login

### Patients
- `GET /patients` - List all patients (with optional clinicId filter)
- `POST /patients` - Create new patient
- `GET /patients/:id` - Get patient details

### Timeline
- `GET /patients/:id/timeline` - Get patient timeline events

### Photos
- `POST /patients/:id/photos` - Upload patient photos (multipart/form-data)

## 🎨 Design System

The application uses a custom healthcare-inspired design system with:

- **Primary Colors**: Medical blue (#3B82F6) for trust and professionalism
- **Accent Colors**: Teal (#059669) for highlights and success states
- **Typography**: Inter font family for readability
- **Components**: Customized shadcn/ui components
- **Responsive**: Mobile-first design with adaptive layouts

## 📱 Pages & Navigation

### Authentication Flow
1. **Login Page** (`/`) - JWT authentication with form validation
2. **Dashboard** (`/dashboard`) - Protected route showing patient list
3. **Patient Detail** (`/patients/:id`) - Individual patient timeline and photos

### Protected Routes
All routes except login require authentication. Users are automatically redirected to login if not authenticated.

## 🧪 Testing

### Smoke Tests
```bash
npm run test:smoke
```

Runs Playwright tests covering:
- Login functionality
- Dashboard navigation
- Patient detail views

### Manual Testing
1. Test login with demo credentials
2. Navigate to dashboard and verify patient list
3. Click on a patient to view timeline
4. Test photo upload functionality

## 🚀 Deployment

### Build Command
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_MINIO_URL=https://your-storage-domain.com
```

## 🔄 Integration with Backend

This frontend is designed to work with the Clinical Companion MVP backend. See `export_instructions.md` for details on integrating with the monorepo structure.

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── AuthForm.tsx     # Login form component
│   ├── AuthGuard.tsx    # Route protection HOC
│   ├── Header.tsx       # Main navigation header
│   ├── PatientCard.tsx  # Patient list item card
│   ├── TimelineCard.tsx # Timeline event card
│   └── PhotoUpload.tsx  # File upload component
├── hooks/               # Custom React hooks
│   └── useAuth.tsx      # Authentication state management
├── lib/                 # Utilities and configurations
│   └── axios.ts         # HTTP client with JWT interceptors
├── pages/               # Route components
│   ├── Login.tsx        # Authentication page
│   ├── Dashboard.tsx    # Patient list and search
│   └── PatientDetail.tsx # Timeline and photo upload
├── types/               # TypeScript type definitions
│   └── api.ts           # API response interfaces
└── App.tsx              # Main application component
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `VITE_API_URL` in `.env.local`
   - Ensure backend server is running
   - Check CORS configuration

2. **Authentication Issues**
   - Clear localStorage: `localStorage.clear()`
   - Verify JWT token format
   - Check token expiration

3. **Build Errors**
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`
   - Verify all imports are correct

### Support
For issues related to the backend API or integration, refer to the main Clinical Companion MVP documentation.

## 📄 License

This project is part of the Clinical Companion MVP and follows the same licensing terms.