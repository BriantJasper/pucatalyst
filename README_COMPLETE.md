# PU Catalyst - University Roadmap AI Web Application

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 📌 Project Overview

**PU Catalyst** adalah platform AI-powered yang membantu mahasiswa universitas membuat roadmap karir yang dipersonalisasi. Platform ini menganalisis pola alumni sukses dan menggunakan AI untuk merekomendasikan organisasi, kursus, sertifikat, dan proyek yang sesuai dengan tujuan karir setiap mahasiswa.

### Problem yang Dipecahkan
- ❓ Mahasiswa tidak tahu aktivitas apa yang harus dilakukan di universitas
- ❓ Kesulitan memilih organisasi yang tepat
- ❓ Kebingungan dengan sertifikat apa yang perlu diambil
- ❓ Tidak memiliki mentor atau role model yang jelas
- ❓ Tidak ada data tentang success path dari alumni

### Solusi
PU Catalyst memberikan:
✅ Roadmap AI yang dipersonalisasi
✅ Analisis gap skill otomatis
✅ Rekomendasi berbasis alumni patterns
✅ Face Recognition login untuk keamanan
✅ Mentorship matching dengan alumni
✅ Analytics dan progress tracking

## 🎯 Key Features

### 1. **Authentication Module**
```
- Email/Password Login & Registration
- Face Recognition Login (face-api.js)
- JWT Token-based Authorization
- Multi-role Support (Student, Alumni, Admin)
- Email Verification
```

### 2. **Student Onboarding**
```
- Complete Profile Setup
- Major, Year, GPA Input
- Interest Tags Selection
- Skill Assessment (0-5 scale)
- Resume Upload & AI Extraction
- Career Goal Selection
```

### 3. **AI Recommendation Engine**
```
- Alumni Pattern Matching
- Skill Gap Analysis
- Semester-by-Semester Roadmap Generation
- Organization Recommendations
- Course Recommendations
- Certificate & Project Suggestions
- Success Probability Scoring
- AI Insights & Tips
```

### 4. **Alumni Data Collection**
```
- Alumni Career Data Input
- LinkedIn Profile Integration (optional)
- Organization & Certificate History
- Internship & Project Experience
- Success Metrics & Advice
- Verification System
```

### 5. **Dashboard & Explorers**
```
- Student Dashboard (progress tracking)
- Roadmap Visualization
- Organization Explorer
- Course Catalog
- Certificate & Skill Browser
- Alumni Mentorship Matching
```

### 6. **Admin Panel**
```
- Organization Management
- Course Catalog Management
- Certificate Directory
- Alumni Verification
- Analytics & Reports
- Career Outcome Tracking
```

## 🏗️ Architecture & Tech Stack

### Backend
```
Framework:      Laravel 12 (PHP)
Auth:          Tymon JWT-Auth
Database:      SQLite (dev) / MySQL (prod)
API:           RESTful API
Cache:         Database/Redis
Queue:         Database/Redis
```

### Frontend
```
Framework:      React 18+
Build Tool:     Vite
Styling:        Tailwind CSS
Icons:          Lucide React
Face Detection: face-api.js
Routing:        React Router v7
HTTP:           Axios
State:          React Hooks
```

### Database Schema
```
users
├── students
│   ├── student_skills
│   ├── student_organizations
│   ├── student_certificates
│   ├── recommendations
│   └── roadmaps
└── alumni
    └── mentorship_pairs

organizations
courses
skills
certificates
projects
face_recognitions
```

## 📋 Installation & Setup

### Prerequisites
```bash
- PHP 8.2+ 
- Node.js 18+ (or 20+ recommended)
- Composer
- SQLite or MySQL
```

### Step-by-Step Installation

```bash
# 1. Navigate to project
cd pu-catalyst

# 2. Install Backend Dependencies
composer install

# 3. Install Frontend Dependencies
npm install

# 4. Setup Environment
cp .env.example .env

# 5. Generate Application Key
php artisan key:generate

# 6. Generate JWT Secret
php artisan jwt:secret

# 7. Run Database Migrations
php artisan migrate

# 8. (Optional) Seed Demo Data
php artisan db:seed

# 9. Start Development Servers
# Terminal 1 - Backend
php artisan serve

# Terminal 2 - Frontend
npm run dev

# Application will be available at http://localhost:5173
```

## 🔌 API Endpoints Overview

### Authentication Endpoints
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Email/Password login
POST   /api/auth/login-face            - Face Recognition login
POST   /api/auth/register-face         - Register face data
GET    /api/auth/me                    - Get current user
POST   /api/auth/refresh               - Refresh JWT token
POST   /api/auth/logout                - Logout
```

### Student Endpoints
```
GET    /api/students/{id}              - Get student profile
PUT    /api/students/{id}              - Update profile
POST   /api/students/{id}/upload-resume - Upload resume
GET    /api/students/{id}/roadmap      - Get roadmap
POST   /api/roadmaps/generate          - Generate AI roadmap
```

### Public Data Endpoints
```
GET    /api/organizations              - List organizations
GET    /api/organizations/{id}         - Get org details
GET    /api/courses                    - List courses
GET    /api/skills                     - List skills
GET    /api/certificates               - List certificates
```

### Admin Endpoints
```
POST   /api/admin/organizations        - Create organization
PUT    /api/admin/organizations/{id}   - Update organization
POST   /api/admin/alumni/{id}/verify   - Verify alumni
GET    /api/admin/analytics            - Get analytics
GET    /api/admin/students             - List all students
GET    /api/admin/alumni               - List all alumni
```

## 📁 Project Structure

```
pu-catalyst/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Student.php
│   │   ├── Alumni.php
│   │   ├── Organization.php
│   │   ├── Course.php
│   │   ├── Skill.php
│   │   ├── Certificate.php
│   │   ├── Roadmap.php
│   │   ├── MentorshipPair.php
│   │   └── FaceRecognition.php
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── StudentController.php
│   │   │   ├── RoadmapController.php
│   │   │   ├── AdminController.php
│   │   │   └── ...
│   │   └── Middleware/
│   │       └── CheckRole.php
│   └── Services/ (optional)
├── resources/
│   ├── js/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── Student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── RoadmapGenerator.jsx
│   │   │   │   ├── OrganizationExplorer.jsx
│   │   │   │   └── CertificateExplorer.jsx
│   │   │   └── Admin/
│   │   │       └── AdminDashboard.jsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── Cards/
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── authService.js
│   │   └── hooks/
│   ├── css/
│   │   └── app.css
│   └── views/
│       └── app.blade.php (for Vite integration)
├── routes/
│   ├── api.php
│   └── web.php
├── database/
│   ├── migrations/
│   │   ├── 2025_*_create_users_table.php
│   │   ├── 2025_*_create_students_table.php
│   │   └── ...
│   └── seeders/
├── config/
│   ├── auth.php
│   ├── database.php
│   └── ...
├── vite.config.js
├── tailwind.config.js
├── package.json
├── composer.json
└── .env
```

## 🔐 Authentication Flow

### Email/Password Login
```
1. User submit email + password
2. Backend validate credentials
3. Generate JWT token
4. Return token + user data
5. Frontend save token to localStorage
6. Add token to Authorization header
```

### Face Recognition Login
```
1. User enable webcam
2. face-api.js capture face descriptors
3. Send descriptors to backend
4. Backend match with stored descriptors
5. Generate JWT token if match
6. Return token + user data
7. Update last_login_with_face timestamp
```

## 🤖 AI Features

### Roadmap Generation Algorithm
```
1. Get student profile (major, skills, interests, goals)
2. Fetch all alumni with same/similar career goals
3. Analyze alumni patterns:
   - Organizations they joined
   - Courses they took
   - Certificates they earned
   - Projects they built
   - Skills progression
4. Calculate relevance scores
5. Generate recommendations:
   - Semester-by-semester plan
   - Priority-ordered skills
   - Suggested organizations
   - Recommended courses
   - Certificate paths
   - Project ideas
6. Perform gap analysis
7. Estimate success probability
8. Return complete roadmap
```

### Skills Gap Analysis
```
1. Get student current skills
2. Get target career skills required
3. Compare and identify gaps
4. Recommend learning resources
5. Estimate time to proficiency
6. Suggest learning path
```

## 📊 Database Models

### Users
```php
- id: bigint (PK)
- name: string
- email: string (unique)
- password: string (hashed)
- role: enum (student, alumni, admin)
- phone: string (nullable)
- avatar: string (nullable)
- email_verified: boolean
- timestamps, soft deletes
```

### Students
```php
- id: bigint (PK)
- user_id: bigint (FK)
- student_id: string (unique)
- major: string
- year: enum (1-4)
- gpa: decimal
- career_goal: string
- interests: json (array)
- skill_assessment: json
- resume_path: string (nullable)
- bio: text (nullable)
- timestamps, soft deletes
```

### Roadmaps
```php
- id: bigint (PK)
- student_id: bigint (FK, unique)
- career_goal: string
- semester_plans: json (array)
- skills_to_learn: json (array)
- organizations_to_join: json (array)
- courses_to_take: json (array)
- certificates_to_earn: json (array)
- projects_to_build: json (array)
- internships_to_pursue: json (array)
- gap_analysis: json (array)
- success_probability: decimal (0-1)
- ai_insights: text (nullable)
- completion_percentage: integer
- timestamps
```

## 🚀 Deployment

### Development
```bash
# Run with Vite development server
npm run dev

# Backend serves API on http://localhost:8000
# Frontend on http://localhost:5173
```

### Production
```bash
# Build frontend
npm run build

# Output in public/build/

# Deploy backend to VPS
# Set .env for production

# Run migrations
php artisan migrate --force

# Serve with production server (Nginx/Apache)
```

### Deploy Targets
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: DigitalOcean, AWS EC2, Heroku, Railway
- **Database**: Supabase, AWS RDS, Google Cloud SQL
- **Storage**: AWS S3, Google Cloud Storage

## 📈 Future Roadmap

### Phase 2 Features
- [ ] Mobile App (React Native)
- [ ] Advanced AI Model (OpenAI/Claude integration)
- [ ] Video Mentorship Calls
- [ ] Email Notifications
- [ ] Calendar Sync
- [ ] Discussion Forums
- [ ] Progress Badges
- [ ] Peer Connections

### Phase 3 Features
- [ ] Job Marketplace Integration
- [ ] Resume AI Enhancement
- [ ] Interview Prep Tools
- [ ] Alumni Success Stories
- [ ] Corporate Partnerships
- [ ] Internship Portal

## 🔒 Security Considerations

- ✅ JWT Token Authentication
- ✅ Password Hashing (Bcrypt)
- ✅ CORS Protection
- ✅ Input Validation & Sanitization
- ✅ Role-Based Access Control
- ✅ Rate Limiting
- ✅ SQL Injection Protection (Eloquent ORM)
- ✅ XSS Protection
- ✅ CSRF Tokens (for web forms)
- ✅ Soft Deletes for Data Integrity

## 📝 Environment Variables

```env
# Application
APP_NAME="PU Catalyst"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=sqlite
# or for MySQL:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=pu_catalyst
# DB_USERNAME=root
# DB_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key

# Frontend
VITE_API_URL=http://localhost:8000/api
```

## 🧪 Testing

```bash
# Run PHP Unit Tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Unit/ExampleTest.php
```

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Architecture Diagram](./docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under MIT License - see [LICENSE](LICENSE) file for details

## 💬 Support & Contact

- Issues: [Create GitHub Issue](https://github.com/yourrepo/issues)
- Email: support@puCatalyst.com
- Website: www.puCatalyst.com

## 🙏 Acknowledgments

- Laravel Community
- React Community
- Face-API.js Contributors
- Tailwind CSS
- All Beta Testers

---

**PU Catalyst** - Empowering Students Through AI-Driven Career Guidance

Last Updated: November 2025
