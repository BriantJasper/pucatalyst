# PU Catalyst - University Roadmap AI Web Application

## Overview
PU Catalyst adalah aplikasi web komprehensif yang dirancang untuk membantu mahasiswa Universitas membuat roadmap karir yang personal menggunakan AI, alumni patterns, dan rekomendasi berbasis data.

## Features

### 1. **Authentication dengan Face Recognition**
- Login/Register dengan email dan password
- Face Recognition menggunakan face-api.js
- JWT Token untuk secure API access
- Multi-role support (Student, Alumni, Admin)

### 2. **Student Onboarding Module**
- Pendaftaran profil lengkap
- Penilaian keahlian (hard & soft skills)
- Pemilihan karir & interest tags
- Upload resume (opsional)

### 3. **AI Recommendation Engine**
- Analisis profil mahasiswa vs alumni patterns
- Roadmap generation per semester
- Gap analysis (skills yang kurang)
- Rekomendasi organisasi, kursus, sertifikat, dan proyek

### 4. **Alumni Data Collection**
- Form submission untuk alumni
- LinkedIn data extraction (opsional)
- Career patterns visualization
- Mentorship matching dengan students

### 5. **Admin Dashboard**
- Management organisasi, kursus, sertifikat
- Verifikasi data alumni
- Analytics & career outcome tracking
- Student behavior patterns

## Technology Stack

### Backend
- **Framework**: Laravel 12
- **Auth**: JWT (Tymon JWT-Auth)
- **Database**: SQLite (dev), MySQL (production)
- **API**: RESTful API

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Face Recognition**: face-api.js
- **Routing**: React Router v7
- **HTTP Client**: Axios

### Database Schema
- **Users**: Main user table with roles
- **Students**: Student profiles with skills, orgs, certs
- **Alumni**: Alumni profiles with career data
- **Organizations**: University organizations
- **Courses**: Course catalog
- **Skills**: Skill database
- **Certificates**: Certificate listings
- **Projects**: Project recommendations
- **Roadmaps**: Generated roadmaps
- **Mentorship Pairs**: Mentoring relationships
- **Face Recognition**: Face data storage

## Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- SQLite or MySQL

### Setup

1. **Clone dan masuk ke directory**
```bash
cd pu-catalyst
```

2. **Install Backend Dependencies**
```bash
composer install
```

3. **Install Frontend Dependencies**
```bash
npm install
```

4. **Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

5. **Database Migration**
```bash
php artisan migrate
php artisan db:seed # optional - untuk dummy data
```

6. **Run Development Server**
```bash
# Terminal 1 - Backend
php artisan serve

# Terminal 2 - Frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login dengan email/password
- `POST /api/auth/login-face` - Login dengan face recognition
- `POST /api/auth/register-face` - Daftar face recognition
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Students
- `GET /api/students` - List all students (admin)
- `GET /api/students/{id}` - Get student profile
- `POST /api/students` - Create student profile
- `PUT /api/students/{id}` - Update student
- `GET /api/students/{id}/roadmap` - Get student roadmap

### Roadmap
- `POST /api/roadmaps/generate` - Generate AI roadmap
- `GET /api/roadmaps/{student}` - Get roadmap

### Organizations
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/{id}` - Get organization details

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/{id}` - Get course details

### Admin
- `POST /api/admin/organizations` - Create organization
- `GET /api/admin/analytics` - Get analytics
- `POST /api/admin/alumni/{id}/verify` - Verify alumni

## Project Structure

```
pu-catalyst/
├── app/
│   ├── Models/           # Eloquent Models
│   ├── Http/Controllers/ # API Controllers
│   └── Http/Middleware/  # Custom Middleware
├── resources/
│   ├── views/           # Blade templates (if needed)
│   └── js/              # React JSX files
├── routes/
│   ├── api.php          # API routes
│   └── web.php          # Web routes
├── database/
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── public/              # Static files
└── config/              # Configuration files
```

## Frontend Components (React)

- `src/pages/Auth/LoginPage` - Login dengan password & face recognition
- `src/pages/Auth/RegisterPage` - Registration page
- `src/pages/StudentDashboard` - Student dashboard utama
- `src/pages/RoadmapGenerator` - AI Roadmap generator
- `src/pages/OrganizationExplorer` - Browse organizations
- `src/pages/CertificateExplorer` - Browse certificates
- `src/pages/AdminDashboard` - Admin panel

## Authentication Flow

1. User register/login
2. Backend generate JWT token
3. Token disimpan di localStorage (frontend)
4. Semua request include token di Authorization header
5. Backend validate JWT token
6. Return protected resources

## Face Recognition Implementation

1. User register/login page menampilkan webcam
2. face-api.js mengambil face descriptors
3. Descriptors disimpan di database
4. Saat login dengan face:
   - Ambil face descriptors dari webcam
   - Match dengan stored descriptors
   - Generate JWT token jika match

## Security Features

- JWT Token dengan expiration
- Password hashing (bcrypt)
- CORS protection
- Input validation
- Role-based access control
- Soft deletes untuk data integrity

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced AI model integration (OpenAI/Claude)
- [ ] Video call untuk mentorship
- [ ] Calendar integration
- [ ] Email notifications
- [ ] Payment gateway untuk sertifikasi premium
- [ ] Resume enhancement dengan AI
- [ ] Job marketplace integration
- [ ] Analytics dashboard improvement

## Contributors
- Development Team: PU Catalyst Project

## License
MIT License

## Support
For issues dan questions, silakan create issue di repository ini.
