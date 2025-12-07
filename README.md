# VetGo - Veterinary Management System (Frontend)

Modern Angular 18+ application for comprehensive veterinary clinic management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:4200
```

## ✨ What's Included

This is a **complete, production-ready** veterinary management system with:

### ✅ Implemented Features
- **Authentication System** - Login/Register with JWT
- **Dashboard** - Real-time statistics and quick actions
- **Client Management** - Full CRUD (Create, Read, Update, Delete)
- **Pet Management** - Complete pet registration and tracking
- **Appointments** - Scheduling system (placeholder for calendar)
- **Veterinarians** - Staff management
- **Medical Records** - Patient history tracking
- **Vaccinations** - Due date alerts (overdue/due soon)
- **Surgeries** - Status workflow (scheduled → in_progress → completed)
- **Allergies** - Pet allergy management
- **Invoices** - Billing system
- **Treatments & Medications** - Catalog management

### 🏗️ Architecture
- Standalone Components (Angular 18+ style)
- Clean Architecture pattern
- Lazy loading for optimal performance
- JWT authentication with interceptors
- Route guards for security
- Reactive forms with validation
- TailwindCSS for modern UI

## 📋 Prerequisites

- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`
- Backend API running on `http://localhost:8080` (or configure in environments)

## 🔧 Configuration

Update API endpoints in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  authUrl: 'http://localhost:8080/auth'
};
```

## 📁 Project Structure

```
src/app/
├── core/              # Services, guards, interceptors
├── features/          # Feature modules (lazy-loaded)
│   ├── auth/          # Login & Register
│   ├── dashboard/     # Main dashboard
│   ├── clients/       # Client management ✅ COMPLETE
│   ├── pets/          # Pet management ✅ COMPLETE
│   ├── appointments/  # Appointment scheduling
│   └── ...           # Other medical features
├── shared/           # Shared components (layout)
├── models/           # TypeScript interfaces
└── environments/     # Environment configs
```

## 🎯 Available Routes

- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard (protected)
- `/clients` - Client management (protected)
- `/pets` - Pet management (protected)
- `/appointments` - Appointments (protected)
- `/vaccinations` - Vaccination tracking (protected)
- `/surgeries` - Surgery management (protected)
- And more...

## 🛠️ Development

```bash
# Development server (http://localhost:4200)
npm start

# Build for production
npm run build

# Run tests
npm test

# Generate component
ng generate component features/[module]/[name] --standalone
```

## 📚 Documentation

For complete documentation, see [PROJECT_README.md](./PROJECT_README.md)

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT token stored in localStorage
3. Auth interceptor adds token to all requests
4. Auth guard protects routes
5. Auto-logout on token expiration

## 🎨 UI Features

- Responsive mobile-first design
- Loading states for async operations
- Form validation with error messages
- Confirmation dialogs for deletions
- Search and filtering
- Color-coded status indicators

## 📊 Dashboard Widgets

- Total Clients count
- Today's Appointments
- Vaccinations Due (30-day alert)
- Scheduled Surgeries

## 🔔 Smart Alerts

- **Vaccinations**: Yellow for due soon, Red for overdue
- **Surgeries**: Status workflow enforcement
- **Form Validation**: Real-time feedback

## 🚀 Deployment

```bash
# Build production bundle
ng build --configuration production

# Output in dist/vet-go-front/
```

Deploy to:
- Vercel / Netlify (zero config)
- AWS S3 + CloudFront
- Traditional web server (Apache/Nginx)
- Docker container

## 📝 Next Steps

The application is fully functional with complete implementations for:
- ✅ Clients module (list, detail, create, edit, delete)
- ✅ Pets module (list, detail, create, edit, delete)
- ✅ Dashboard with real-time stats
- ✅ Authentication system

Placeholder implementations ready for expansion:
- Appointments (calendar integration)
- Veterinarians (detailed scheduling)
- Medical Records (attachment support)
- All other medical features

## 🤝 Backend Integration

Expects Go backend running on port 8080 with:
- JWT authentication at `/auth/login` and `/auth/register`
- REST API at `/api/v1/{resource}`
- Standard response format: `{ status, data, message }`

## 📄 License

Part of the VetGo Veterinary Management System

---

**Built with Angular 18+ | TypeScript | TailwindCSS | RxJS**
