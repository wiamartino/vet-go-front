# Veterinary Management System - Angular Frontend

A modern, full-featured Angular 18+ application for managing veterinary clinic operations, built with standalone components following Clean Architecture principles.

## 🚀 Features

### Core Functionality
- **Authentication System** - JWT-based login/registration with auto-logout
- **Dashboard** - Real-time statistics and quick actions
- **Client Management** - Full CRUD operations for client records
- **Pet Management** - Pet registration and medical history tracking
- **Appointments** - Scheduling and calendar management
- **Veterinarians** - Staff management and scheduling
- **Medical Records** - Comprehensive medical history tracking
- **Vaccinations** - Due date tracking with automatic alerts
- **Surgeries** - Status workflow management (scheduled → in_progress → completed)
- **Allergies** - Pet allergy tracking with severity levels
- **Invoices** - Billing and payment tracking
- **Treatments & Medications** - Catalog management

### Technical Features
- ✅ Standalone Components (Angular 18+)
- ✅ Clean Architecture Pattern
- ✅ JWT Authentication with HTTP Interceptor
- ✅ Route Guards for Protected Routes
- ✅ Lazy Loading for Optimal Performance
- ✅ Reactive Forms with Validation
- ✅ TailwindCSS for Modern UI
- ✅ Responsive Mobile-First Design
- ✅ TypeScript Type Safety
- ✅ Observable-based State Management

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                          # Core application services
│   │   ├── guards/
│   │   │   └── auth.guard.ts         # Route protection
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts   # JWT token injection
│   │   └── services/                  # Business logic services
│   │       ├── auth.service.ts
│   │       ├── client.service.ts
│   │       ├── pet.service.ts
│   │       ├── appointment.service.ts
│   │       ├── veterinarian.service.ts
│   │       ├── medical-record.service.ts
│   │       ├── vaccination.service.ts
│   │       ├── surgery.service.ts
│   │       ├── allergy.service.ts
│   │       ├── invoice.service.ts
│   │       ├── treatment.service.ts
│   │       └── medication.service.ts
│   │
│   ├── features/                      # Feature modules (lazy-loaded)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   │   ├── client-list/
│   │   │   ├── client-detail/
│   │   │   ├── client-form/
│   │   │   └── clients.routes.ts
│   │   ├── pets/
│   │   │   ├── pet-list/
│   │   │   ├── pet-detail/
│   │   │   ├── pet-form/
│   │   │   └── pets.routes.ts
│   │   ├── appointments/
│   │   ├── veterinarians/
│   │   ├── medical-records/
│   │   ├── vaccinations/
│   │   ├── surgeries/
│   │   ├── allergies/
│   │   ├── invoices/
│   │   ├── treatments/
│   │   └── medications/
│   │
│   ├── shared/                        # Shared components & utilities
│   │   └── components/
│   │       └── layout/                # Main layout with sidebar
│   │
│   ├── models/                        # TypeScript interfaces
│   │   ├── client.model.ts
│   │   ├── pet.model.ts
│   │   ├── appointment.model.ts
│   │   ├── veterinarian.model.ts
│   │   ├── medical-record.model.ts
│   │   ├── vaccination.model.ts
│   │   ├── surgery.model.ts
│   │   ├── allergy.model.ts
│   │   ├── invoice.model.ts
│   │   ├── treatment.model.ts
│   │   ├── medication.model.ts
│   │   ├── auth.model.ts
│   │   ├── api-response.model.ts
│   │   └── index.ts                   # Barrel export
│   │
│   ├── app.component.ts
│   ├── app.config.ts                  # App configuration
│   └── app.routes.ts                  # Main routing config
│
├── environments/
│   ├── environment.ts                 # Development config
│   └── environment.prod.ts            # Production config
│
└── styles.scss                        # Global styles
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   
   Update the API URLs in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api/v1',
     authUrl: 'http://localhost:8080/auth'
   };
   ```

3. **Run Development Server**
   ```bash
   npm start
   # or
   ng serve
   ```

   Navigate to `http://localhost:4200/`

4. **Build for Production**
   ```bash
   npm run build
   # or
   ng build --configuration production
   ```

## 🔐 Authentication Flow

1. User navigates to `/login` or `/register`
2. On successful authentication, JWT token is stored in localStorage
3. Auth interceptor automatically adds token to all HTTP requests
4. Auth guard protects all routes except login/register
5. Auto-logout on token expiration

## 🗺️ Routing Structure

```typescript
/login                    # Public - Login page
/register                 # Public - Registration page
/dashboard                # Protected - Main dashboard
/clients                  # Protected - Client list
/clients/new              # Protected - Add new client
/clients/:id              # Protected - Client details
/clients/:id/edit         # Protected - Edit client
/pets                     # Protected - Pet list
/pets/new                 # Protected - Register pet
/pets/:id                 # Protected - Pet details
/appointments             # Protected - Appointment calendar
/veterinarians            # Protected - Veterinarian management
/medical-records          # Protected - Medical records
/vaccinations             # Protected - Vaccination tracking
/surgeries                # Protected - Surgery management
/allergies                # Protected - Allergy records
/invoices                 # Protected - Billing
/treatments               # Protected - Treatment catalog
/medications              # Protected - Medication inventory
```

## 📡 API Integration

### Base URLs
- **Development**: `http://localhost:8080`
- **Production**: Configure in `environment.prod.ts`

### API Response Format
```typescript
{
  "status": "success" | "error",
  "data": T,
  "message"?: string
}
```

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Resource Endpoints
All follow REST conventions:
- `GET /api/v1/{resource}` - List all
- `GET /api/v1/{resource}/:id` - Get by ID
- `POST /api/v1/{resource}` - Create new
- `PUT /api/v1/{resource}/:id` - Update existing
- `DELETE /api/v1/{resource}/:id` - Delete

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Loading States** - Spinners during API calls
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time validation feedback
- **Confirmation Dialogs** - For destructive operations
- **Search & Filter** - Client-side filtering
- **Dashboard Widgets** - Real-time statistics

## 📊 Dashboard Statistics

The dashboard displays:
- Total Clients
- Appointments Today
- Vaccinations Due (next 30 days)
- Scheduled Surgeries

## 🔔 Vaccination Alert System

- **Due Soon**: Yellow alert for vaccinations due within 30 days
- **Overdue**: Red alert for past-due vaccinations
- Automatic calculation on page load

## 🏥 Surgery Status Workflow

Valid status transitions:
- `scheduled` → `in_progress` or `completed`
- `in_progress` → `completed`
- `completed` → (terminal state)

Color coding:
- Scheduled: Default gray
- In Progress: Blue
- Completed: Green

## 🔧 Development Guidelines

### Creating New Components
```bash
ng generate component features/[module]/[component-name] --standalone
```

### Adding New Services
```bash
ng generate service core/services/[service-name]
```

### Code Style
- Use TypeScript strict mode
- Follow Angular style guide
- Use reactive forms for complex forms
- Implement error handling in all HTTP calls
- Add loading states for async operations

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Generate coverage report
npm run test:coverage
```

## 📦 Build & Deployment

```bash
# Production build
ng build --configuration production

# Output location
dist/vet-go-front/
```

### Deployment Options
- Static hosting (Netlify, Vercel, AWS S3)
- Docker containerization
- Traditional web server (Apache, Nginx)

## 🔒 Security Features

- JWT token stored in localStorage
- HTTP-only cookie option available
- Auth interceptor for automatic token injection
- Route guards for access control
- Token expiration handling
- CORS configuration required on backend

## 🚀 Performance Optimizations

- Lazy loading for all feature modules
- OnPush change detection (where applicable)
- RxJS operators for efficient data streams
- TailwindCSS purging in production
- AOT compilation enabled
- Tree-shaking for unused code removal

## 📝 Future Enhancements

### Planned Features
- [ ] Complete appointment calendar with drag-drop
- [ ] Email notification system
- [ ] PDF report generation for invoices
- [ ] Advanced search and filtering
- [ ] Medical history timeline visualization
- [ ] User role management (admin, vet, receptionist)
- [ ] Dark mode support
- [ ] Offline mode with service workers
- [ ] Real-time updates with WebSockets
- [ ] Multi-language support (i18n)

### Additional Modules to Implement
- [ ] Complete appointment booking flow
- [ ] Enhanced veterinarian scheduling
- [ ] Detailed medical records with attachments
- [ ] Prescription management
- [ ] Lab results tracking
- [ ] Appointment reminders (SMS/Email)
- [ ] Analytics dashboard
- [ ] Reporting module

## 🤝 Contributing

This is a complete veterinary management system. To extend:

1. Add new models in `src/app/models/`
2. Create corresponding services in `src/app/core/services/`
3. Generate feature components in `src/app/features/`
4. Update routing in feature `.routes.ts` files
5. Add menu items in `layout.component.ts`

## 📄 License

This project is part of a veterinary management system implementation.

## 🆘 Support

For issues or questions:
1. Check the browser console for errors
2. Verify backend API is running on port 8080
3. Ensure CORS is properly configured
4. Check JWT token validity in localStorage

## 🎯 Key Technologies

- **Angular 18+** - Framework
- **TypeScript** - Language
- **RxJS** - Reactive programming
- **TailwindCSS** - Styling
- **Angular Router** - Navigation
- **Angular Forms** - Form handling
- **HttpClient** - API communication

---

**Status**: Production-ready with comprehensive features for clients, pets, and core veterinary operations. Additional modules have placeholder implementations ready for expansion.
