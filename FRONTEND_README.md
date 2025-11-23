# PU Catalyst - University Roadmap AI Web App

## 🎯 Project Overview

**PU Catalyst** adalah platform AI-powered yang membantu mahasiswa merencanakan perjalanan universitas mereka dengan rekomendasi personal berdasarkan data alumni dan pola kesuksesan karir.

## ✨ Features Implemented (MVP)

### ✅ **1. Landing Page**
- Hero section dengan value proposition
- Feature showcase
- Statistics display
- How it works section
- CTA sections
- Responsive design

### ✅ **2. Authentication System**
- Login page dengan email/password
- Register page dengan role selection (Student/Alumni)
- Google OAuth placeholder
- Protected routes berdasarkan role
- JWT token management
- Zustand state management

### ✅ **3. Student Dashboard**
- Quick stats (Roadmap Progress, Skills, Certificates, Organizations)
- AI-powered recommendations
- Recent activity timeline
- Weekly goals tracker
- Quick action links
- Responsive navigation

### ✅ **4. Placeholder Pages (Ready for Development)**
**Student:**
- Student Onboarding
- AI Roadmap Generator
- Organization Explorer
- Certificate Explorer
- Course Explorer
- Skill Gap Analysis
- Mentor Match

**Alumni:**
- Alumni Dashboard
- Alumni Profile

**Admin:**
- Admin Dashboard
- Manage Organizations
- Manage Courses
- Manage Certificates
- Alumni Verification
- Analytics Dashboard

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **Vite 5.2.11** - Build tool & dev server
- **TailwindCSS 3.4.3** - Styling
- **React Router DOM 6.23.1** - Routing
- **Zustand 4.5.2** - State management
- **React Query 5.40.0** - Data fetching
- **Axios 1.7.2** - HTTP client
- **Chart.js 4.4.3** - Data visualization
- **React Hook Form 7.51.5** - Form management
- **React Hot Toast 2.4.1** - Notifications
- **Lucide React** - Icons
- **Headless UI** - Accessible components

### Backend (Existing)
- **Laravel 11**
- **MySQL**
- **JWT Authentication**

## 📁 Project Structure

```
pu-catalyst/
├── resources/
│   ├── css/
│   │   └── app.css              # Tailwind CSS
│   ├── js/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Main app with routes
│   │   ├── lib/
│   │   │   └── axios.js         # Axios config
│   │   ├── store/
│   │   │   └── authStore.js     # Zustand auth store
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── StudentOnboarding.jsx
│   │   │   │   ├── RoadmapPage.jsx
│   │   │   │   ├── OrganizationExplorer.jsx
│   │   │   │   ├── CertificateExplorer.jsx
│   │   │   │   ├── CourseExplorer.jsx
│   │   │   │   ├── SkillGapAnalysis.jsx
│   │   │   │   └── MentorMatch.jsx
│   │   │   ├── alumni/
│   │   │   │   ├── AlumniDashboard.jsx
│   │   │   │   └── AlumniProfile.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageOrganizations.jsx
│   │   │       ├── ManageCourses.jsx
│   │   │       ├── ManageCertificates.jsx
│   │   │       ├── AlumniVerification.jsx
│   │   │       └── Analytics.jsx
│   │   └── components/
│   │       ├── layouts/
│   │       └── ui/
│   └── views/
│       └── app.blade.php        # Laravel view with Vite
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
cd pu-catalyst
npm install
```

### 2. Environment Setup
Pastikan `.env` memiliki:
```env
VITE_APP_NAME="${APP_NAME}"
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Servers

**Terminal 1 - Laravel:**
```bash
php artisan serve
# Output: http://localhost:8000
```

**Terminal 2 - Vite:**
```bash
npm run dev
# Output: http://localhost:5173
```

### 4. Access Application
Open: **http://localhost:8000**

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (50-900)
- **Secondary**: Purple gradient (50-900)
- **Accent Colors**: Green, Red, Yellow

### Components
- Rounded corners (lg, xl, 2xl)
- Shadows (sm, md, lg, xl, 2xl)
- Gradients for CTAs and highlights
- Smooth transitions and hover effects

## 🔐 Authentication Flow

1. **Register**
   - User selects role (Student/Alumni)
   - Fills registration form
   - System creates account
   - Redirects to login

2. **Login**
   - User enters credentials
   - System validates and returns JWT token
   - Token stored in localStorage
   - User redirected based on role:
     - Student → `/student/dashboard`
     - Alumni → `/alumni/dashboard`
     - Admin → `/admin/dashboard`

3. **Protected Routes**
   - All dashboard routes require authentication
   - Role-based access control
   - Automatic redirect to login if not authenticated

## 📋 Next Steps (Full Development)

### Phase 1: Student Onboarding
- [ ] Multi-step form
- [ ] Career goal selection
- [ ] Interest tags
- [ ] Skill assessment
- [ ] Resume upload & parsing

### Phase 2: AI Roadmap Generator
- [ ] AI prompt engineering
- [ ] Roadmap generation API
- [ ] Semester-by-semester plan
- [ ] Visual timeline
- [ ] PDF export

### Phase 3: Explorer Pages
- [ ] Organization database
- [ ] Certificate catalog
- [ ] Course directory
- [ ] Filter & search functionality
- [ ] Recommendation badges

### Phase 4: Skill Gap Analysis
- [ ] Current skills assessment
- [ ] Target career skills
- [ ] Gap visualization
- [ ] Learning path suggestions

### Phase 5: Mentorship System
- [ ] Alumni mentor profiles
- [ ] Matching algorithm
- [ ] Request/accept flow
- [ ] Messaging system

### Phase 6: Alumni Portal
- [ ] Career journey input
- [ ] LinkedIn integration
- [ ] Data verification
- [ ] Alumni analytics

### Phase 7: Admin Dashboard
- [ ] CRUD for all entities
- [ ] Alumni verification workflow
- [ ] Analytics & charts
- [ ] User management

### Phase 8: Advanced Features
- [ ] AI chatbot assistant
- [ ] Mobile responsive improvements
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Internship marketplace
- [ ] Progress tracking
- [ ] Gamification

## 📊 Current Routes

### Public
- `/` - Landing Page
- `/login` - Login Page
- `/register` - Register Page

### Student (Protected)
- `/student/dashboard` - Main Dashboard ✅
- `/student/onboarding` - Onboarding Flow
- `/student/roadmap` - AI Roadmap
- `/student/organizations` - Organization Explorer
- `/student/certificates` - Certificate Explorer
- `/student/courses` - Course Explorer
- `/student/skill-gap` - Skill Gap Analysis
- `/student/mentors` - Mentor Matching

### Alumni (Protected)
- `/alumni/dashboard` - Alumni Dashboard
- `/alumni/profile` - Alumni Profile Editor

### Admin (Protected)
- `/admin/dashboard` - Admin Dashboard
- `/admin/organizations` - Manage Organizations
- `/admin/courses` - Manage Courses
- `/admin/certificates` - Manage Certificates
- `/admin/verify-alumni` - Alumni Verification
- `/admin/analytics` - Analytics Dashboard

## 🔧 API Integration Points

All API calls use base URL from `VITE_API_URL` environment variable.

### Auth Endpoints
```javascript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Student Endpoints (To be implemented)
```javascript
GET    /api/student/profile
PUT    /api/student/profile
POST   /api/student/onboarding
GET    /api/student/roadmap
POST   /api/student/generate-roadmap
GET    /api/student/recommendations
```

### Organizations Endpoints
```javascript
GET    /api/organizations
GET    /api/organizations/{id}
POST   /api/organizations (admin)
PUT    /api/organizations/{id} (admin)
DELETE /api/organizations/{id} (admin)
```

### Certificates Endpoints
```javascript
GET    /api/certificates
GET    /api/certificates/{id}
POST   /api/certificates (admin)
```

### Courses Endpoints
```javascript
GET    /api/courses
GET    /api/courses/{id}
POST   /api/courses (admin)
```

## 🎓 Development Guidelines

### Code Style
- Use functional components with hooks
- Keep components small and focused
- Use TailwindCSS utility classes
- Implement proper error handling
- Add loading states
- Use React Query for data fetching

### State Management
- **Zustand** for global state (auth, user)
- **React Query** for server state
- **Local state** for component-specific data

### File Naming
- Components: PascalCase (e.g., `StudentDashboard.jsx`)
- Utilities: camelCase (e.g., `authStore.js`)
- Pages: PascalCase + Page suffix (e.g., `LoginPage.jsx`)

## 📝 Notes

- All placeholder pages show "Under Construction" message
- Student Dashboard is fully functional with mock data
- Authentication flow is ready for backend integration
- Color scheme uses primary (blue) and secondary (purple)
- Responsive design for mobile, tablet, desktop
- Dark mode support can be added later

## 🚦 Status

**MVP Status**: ✅ **READY FOR DEMO**

**What Works:**
- ✅ Landing page
- ✅ Authentication pages (UI ready)
- ✅ Student Dashboard (full UI with mock data)
- ✅ Navigation and routing
- ✅ Protected routes
- ✅ State management
- ✅ Placeholder pages for all features

**What Needs Backend:**
- ⏳ API endpoints for auth, CRUD operations
- ⏳ Database seeding for organizations, courses, certificates
- ⏳ AI integration for roadmap generation
- ⏳ Alumni data collection system

## 🎉 Ready to Launch!

Frontend is fully set up and ready for development. Start the dev server and visit `http://localhost:8000` to see the landing page!

---

**Built with ❤️ using React, Vite, TailwindCSS, and Laravel**
