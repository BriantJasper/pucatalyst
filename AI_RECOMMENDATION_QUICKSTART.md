# 🚀 AI Recommendation Service - Quick Start Guide

## Overview

Fitur AI Recommendation menggunakan SBERT (Sentence-BERT) untuk memberikan rekomendasi karir berdasarkan data alumni yang sukses. User bisa mengetik career goal (misalnya "web developer") dan mendapatkan rekomendasi:

- **Top Alumni** yang memiliki jalur karir serupa
- **Skills Prioritas** yang harus dikuasai
- **Certifications** yang disarankan
- **Organizations** yang harus diikuti
- **Project Portfolio** yang harus dibuat

## 🎯 Features

✅ **Search dengan Autocomplete** - Ketik career goal, muncul saran otomatis
✅ **AI-Powered Matching** - SBERT mencari alumni dengan similarity score tertinggi
✅ **Beautiful UI** - Tampilan modern dengan gradien dan card layout
✅ **Real-time Suggestions** - Autocomplete saat mengetik (debounced 300ms)
✅ **Aggregated Data** - Merangkum data dari top 5 alumni terbaik

## 📋 Prerequisites

- Python 3.8+ dengan pip
- Virtual environment (recommended)
- Laravel + React app sudah berjalan

## 🔧 Setup (First Time Only)

### Step 1: Navigate to Service Directory

```powershell
cd ai_recommendation_service
```

### Step 2: Create Virtual Environment

```powershell
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Note:** SBERT model (~100MB) akan di-download otomatis saat pertama kali run. Tunggu hingga selesai.

### Step 4: Generate Sample Alumni Data

```powershell
python generate_sample_data.py
```

Output:
```
Loading SBERT model...
Generating embeddings for alumni data...
Saving alumni data...
Saving alumni embeddings...

Successfully created data for 10 alumni!
Embedding shape: (10, 384)

Sample alumni:
1. Cahya Sari - Mobile App Developer
2. Bayu Firdaus - Mobile App Developer
3. Budi Lestari - Mobile App Developer
```

Files created:
- `../AI-SBERT-PUCATALYST/alumni_data.pkl` - Alumni information
- `../AI-SBERT-PUCATALYST/alumni_embeddings.npy` - Pre-computed SBERT embeddings

## 🚀 Running the Service

### Option 1: Using Batch File (Recommended)

```powershell
start_service.bat
```

### Option 2: Manual

```powershell
venv\Scripts\activate
python app.py
```

Service akan berjalan di: **http://localhost:5001**

## ✅ Testing the Service

### 1. Health Check

Open browser: http://localhost:5001/health

Expected response:
```json
{
  "status": "healthy",
  "model": "paraphrase-multilingual-MiniLM-L12-v2",
  "alumni_count": 10
}
```

### 2. Test Recommendation (Using curl or Postman)

```powershell
curl -X POST http://localhost:5001/recommend `
  -H "Content-Type: application/json" `
  -d '{"query":"mobile app developer","top_n":5}'
```

### 3. Test Autocomplete

```powershell
curl -X POST http://localhost:5001/autocomplete `
  -H "Content-Type: application/json" `
  -d '{"query":"web","max_suggestions":5}'
```

## 🌐 Frontend Integration

Service sudah terintegrasi di **Roadmap Page** (`/student/roadmap`).

### How to Use:

1. Login sebagai Student
2. Go to **Roadmap** menu
3. Di bagian atas ada search box dengan gradient purple/pink
4. Ketik career goal (misal: "web developer", "data scientist", "mobile app")
5. Autocomplete suggestions akan muncul
6. Klik suggestion atau tekan Enter untuk search
7. Hasil akan muncul dengan 4 section:
   - 🌟 **Top Alumni Match** - Alumni yang cocok dengan similarity score
   - **A. Skills Teknis & Non-Teknis Prioritas** - Skills yang harus dikuasai
   - **B. Sertifikat & Lisensi yang Disarankan** - Certifications yang direkomendasikan
   - **C. Organisasi yang Harus Diikuti** - Organizations berdasarkan frekuensi
   - **D. Fokus Proyek Portfolio** - Tipe project yang harus dibuat

## 🎨 UI Components

### Search Box
- Gradient border saat focus
- Autocomplete dropdown dengan suggestions
- Clear button (X) untuk reset
- Search button dengan loading state
- Debounced input (300ms) untuk performance

### Results Display
- **Top Alumni Cards**: Blue gradient, showing name, job title, major, similarity %
- **Skills Section**: Green gradient, showing frequency count
- **Certifications Section**: Amber/Orange gradient
- **Organizations Section**: Purple/Pink gradient
- **Projects Section**: Rose/Pink gradient

## 📊 Sample Data Included

Default data includes 10 alumni with various roles:
- Mobile App Developer (5 alumni)
- Web Developer
- Data Scientist
- UI/UX Designer
- Full Stack Developer
- DevOps Engineer

Each alumni has:
- 5-8 skills (technical & soft skills)
- 3-5 certifications
- 3-5 organizations
- 3-5 project types

## 🔄 Adding Your Own Alumni Data

### Method 1: Edit `generate_sample_data.py`

Add new alumni dict to `alumni_data` list:

```python
{
    'name': 'Your Name',
    'job_title': 'Your Job Title',
    'major': 'Your Major',
    'skills': ['Skill1', 'Skill2', ...],
    'certifications': ['Cert1', 'Cert2', ...],
    'organizations': ['Org1', 'Org2', ...],
    'projects': ['Project Type 1', 'Project Type 2', ...]
}
```

Then regenerate:
```powershell
python generate_sample_data.py
```

### Method 2: Import from Database (Future)

You can modify the script to load from MySQL database instead of hardcoded data.

## 🐛 Troubleshooting

### Service Won't Start

**Problem:** Port 5001 already in use
**Solution:** Edit `app.py` line 238:
```python
app.run(host='0.0.0.0', port=5002, debug=True)  # Change port
```
Then update frontend `AI_SERVICE_URL` in `RoadmapPage.jsx`

### Model Download Failed

**Problem:** SBERT model download timeout
**Solution:** 
1. Check internet connection
2. Try different network
3. Model will be cached after first successful download

### No Recommendations Returned

**Problem:** Alumni data not loaded
**Solution:**
1. Check if `alumni_data.pkl` and `alumni_embeddings.npy` exist in `AI-SBERT-PUCATALYST/`
2. Re-run `python generate_sample_data.py`
3. Restart service

### CORS Error from Frontend

**Problem:** Cross-origin request blocked
**Solution:** Make sure `flask-cors` is installed:
```powershell
pip install flask-cors
```

## 🔗 Integration with Main App

### All Services Running

You need 4 terminals:

**Terminal 1 - Laravel Backend:**
```powershell
php artisan serve
# http://localhost:8000
```

**Terminal 2 - React Frontend:**
```powershell
npm run dev
# http://localhost:5173
```

**Terminal 3 - Face Recognition Service:**
```powershell
cd face_recognition_service
venv\Scripts\activate
python app_simple.py
# http://localhost:5000
```

**Terminal 4 - AI Recommendation Service:**
```powershell
cd ai_recommendation_service
venv\Scripts\activate
python app.py
# http://localhost:5001
```

## 📝 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/recommend` | POST | Get recommendations |
| `/autocomplete` | POST | Get search suggestions |
| `/alumni-stats` | GET | Get statistics |

## 🎉 Result Preview

After searching "mobile app developer", you'll see:

### Top Alumni Section
```
🌟 Top Alumni Match
├── Cahya Sari - Mobile App Developer (33.5% similarity)
├── Bayu Firdaus - Mobile App Developer (31.8% similarity)
└── ... (3 more)
```

### Recommendations Grid
```
┌─────────────────────────────┬─────────────────────────────┐
│ A. Skills Prioritas         │ B. Certifications          │
│ - Kuasai: CI/CD (6)        │ - Ambil: CompTIA A+ (7)    │
│ - Kuasai: AWS (5)          │ - Ambil: AWS Cert (5)      │
└─────────────────────────────┴─────────────────────────────┘
┌─────────────────────────────┬─────────────────────────────┐
│ C. Organizations            │ D. Project Portfolio       │
│ - Gabung: PUFA CS (8)      │ - Buat: APP INTERFACE (3)  │
│ - Gabung: PUMA IT (6)      │ - Buat: MACHINE LEARNING   │
└─────────────────────────────┴─────────────────────────────┘
```

## 💡 Tips

1. **Search Tips:**
   - Use specific job titles: "web developer", "data scientist"
   - Or broader terms: "developer", "designer", "engineer"
   - Or technologies: "machine learning", "mobile app", "cloud"

2. **Performance:**
   - First search might be slow (model loading)
   - Subsequent searches are fast (model cached)
   - Autocomplete is debounced for better UX

3. **Data Quality:**
   - More alumni data = better recommendations
   - Diverse alumni profiles = better matching
   - Keep alumni data updated regularly

## 🔐 Security Notes

- Service runs locally (no external API calls)
- No sensitive data transmitted
- Alumni data stored locally
- CORS enabled for localhost only (update for production)

## 📚 Resources

- **SBERT Documentation:** https://www.sbert.net/
- **Flask Documentation:** https://flask.palletsprojects.com/
- **Sentence Transformers:** https://github.com/UKPLab/sentence-transformers

---

**That's it! Your AI Recommendation Service is now ready to help students find their career path! 🎓✨**
