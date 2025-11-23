# 🚀 Quick Start Guide - PU Catalyst

## ⚡ Fastest Way to Run

### Option 1: Run Both Servers (Recommended)

```bash
# Terminal 1 - Laravel
cd pu-catalyst
php artisan serve

# Terminal 2 - Vite
cd pu-catalyst
npm run dev
```

**Access**: http://localhost:8000

---

### Option 2: One-Command Run

```bash
# Install dependencies (first time only)
npm install

# Run both servers concurrently
npm run dev & php artisan serve
```

---

## 📱 What You'll See

### 1. Landing Page (/)
- Beautiful hero section
- Features showcase
- Call-to-action buttons

### 2. Login (/login)
- Email/password authentication
- Google OAuth (placeholder)
- Role-based redirects

### 3. Register (/register)
- Student or Alumni role selection
- Complete registration form
- Terms acceptance

### 4. Student Dashboard (/student/dashboard)
After login as student:
- Progress statistics
- AI recommendations
- Recent activity
- Quick actions

---

## 🎯 Test Accounts (After Backend Setup)

```javascript
// Student
Email: student@university.edu
Password: password123

// Alumni
Email: alumni@university.edu
Password: password123

// Admin
Email: admin@university.edu
Password: password123
```

---

## 🛠️ Development Workflow

### Make Changes
1. Edit files in `resources/js/`
2. Changes auto-reload (HMR)
3. Check browser for updates

### Add New Page
```bash
# Create new page file
touch resources/js/pages/student/NewPage.jsx

# Add route in App.jsx
# Add navigation link
```

### Build for Production
```bash
npm run build
```

---

## 📦 Folder Structure

```
resources/js/
├── main.jsx              # Entry point
├── App.jsx               # Routes & auth
├── lib/
│   └── axios.js          # API client
├── store/
│   └── authStore.js      # Global state
├── pages/
│   ├── LandingPage.jsx
│   ├── auth/
│   ├── student/
│   ├── alumni/
│   └── admin/
└── components/           # Reusable components
```

---

## 🎨 Styling Guide

### Use Tailwind Classes
```jsx
<div className="bg-white p-6 rounded-xl shadow-lg">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

### Colors
- Primary: `text-primary-600`, `bg-primary-500`
- Secondary: `text-secondary-600`, `bg-secondary-500`
- Gray: `text-gray-600`, `bg-gray-50`

---

## 🔥 Hot Tips

1. **Fast Refresh**: Changes reflect instantly
2. **Check Console**: F12 for errors
3. **Network Tab**: Monitor API calls
4. **React DevTools**: Install for debugging

---

## ❓ Troubleshooting

### Vite Not Starting?
```bash
rm -rf node_modules
npm install
npm run dev
```

### Port Already in Use?
```bash
# Kill process
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Styling Not Working?
```bash
# Rebuild Tailwind
npm run dev
# Hard refresh browser: Ctrl+Shift+R
```

---

## 🎉 You're Ready!

Visit **http://localhost:8000** and start building! 🚀

For full documentation, see `FRONTEND_README.md`
