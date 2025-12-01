# 🎓 Alumni Data - Generate & Sync Guide

## Overview

Guide ini untuk:
1. **Generate 50 alumni random** ke MySQL database
2. **Sync data alumni** dari MySQL ke SBERT embeddings
3. **Test AI Recommendation** dengan data real

## 🚀 Quick Setup (3 Steps)

### Step 1: Generate Alumni Data ke Database

Buka terminal di root folder `pucatalyst`:

```powershell
php artisan db:seed --class=AlumniSeeder
```

**Output yang diharapkan:**
```
Generating 50 random alumni...
✓ Created alumni: John Doe - Mobile App Developer at Gojek
✓ Created alumni: Jane Smith - Data Scientist at Tokopedia
...
✅ Successfully generated 50 alumni with complete data!
```

**Ini akan membuat:**
- 50 user accounts dengan role "alumni"
- 50 alumni records dengan data lengkap:
  - Job title & company
  - 5-10 technical skills
  - 3-5 soft skills
  - 2-5 certifications
  - 2-5 organizations
  - 1-3 internship history
  - Career description
  - Advice for juniors

### Step 2: Install Python Dependencies

```powershell
cd ai_recommendation_service
pip install -r requirements.txt
```

Ini akan install:
- Flask & Flask-CORS
- Sentence Transformers (SBERT)
- NumPy & Scikit-learn
- **MySQL Connector** (untuk sync database)
- Python-dotenv (untuk read .env file)

### Step 3: Sync Data dari MySQL ke SBERT

```powershell
python sync_from_database.py
```

**Output yang diharapkan:**
```
============================================================
  Alumni Data Sync - MySQL to SBERT Embeddings
============================================================

Connecting to MySQL database...
Fetched 50 verified alumni from database

Loading SBERT model...
Generating embeddings...
Batches: 100%|████████████████| 1/1 [00:02<00:00,  0.43it/s]

Saving alumni data...
Saving alumni embeddings...

✅ Successfully saved 50 alumni records!
   - Data saved to: ../AI-SBERT-PUCATALYST/alumni_data.pkl
   - Embeddings saved to: ../AI-SBERT-PUCATALYST/alumni_embeddings.npy
   - Embedding shape: (50, 384)

📊 Sample Alumni Data:
   1. John Doe - Mobile App Developer at Gojek
      Skills: Python, React, JavaScript, AWS, Docker...
   ...
```

### Step 4: Start AI Service

```powershell
python app.py
```

Service berjalan di: **http://localhost:5001**

Test: http://localhost:5001/health

---

## 📊 Data Alumni yang Di-generate

### Job Titles (20 tipe):
- Mobile App Developer
- Web Developer / Full Stack / Frontend / Backend
- Data Scientist / Machine Learning Engineer / Data Analyst
- UI/UX Designer / Product Designer
- DevOps Engineer / Cloud Engineer
- Software Engineer / QA Engineer
- Business Analyst / Product Manager
- Cybersecurity Analyst
- Database Administrator / System Admin / Network Engineer

### Companies (26 perusahaan Indonesia + Global):
- **Startup Unicorn:** Gojek, Tokopedia, Bukalapak, Traveloka, Grab, Shopee
- **Fintech:** OVO, Dana, LinkAja, GoTo Financial, Kredivo, Akulaku
- **E-commerce:** Blibli, Sea Group
- **Global Tech:** Google, Microsoft, Amazon, Meta, Apple
- **BUMN:** Telkom, Bank Mandiri, BCA, BRI, Pertamina, PLN, Garuda

### Technical Skills (60+ skills):
- **Languages:** Python, Java, JavaScript, TypeScript, PHP, C++, C#, Go, Rust, Swift, Kotlin
- **Frontend:** React, Vue.js, Angular, HTML, CSS, Tailwind, Bootstrap
- **Backend:** Node.js, Express, Django, Flask, Laravel, Spring Boot
- **Database:** MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch
- **Cloud & DevOps:** AWS, GCP, Azure, Docker, Kubernetes, Jenkins, CI/CD
- **Data Science:** Machine Learning, TensorFlow, PyTorch, Pandas, NumPy
- **Design:** Figma, Adobe XD, Sketch, Photoshop

### Soft Skills:
- Communication, Teamwork, Leadership
- Problem Solving, Critical Thinking
- Time Management, Adaptability, Creativity

### Certifications (25+ options):
- **Cloud:** AWS Solutions Architect, Google Cloud, Azure
- **Dev:** CompTIA A+, Cisco CCNA, Docker, Kubernetes
- **Data:** IBM Data Science, Google Data Analytics
- **Management:** Certified ScrumMaster, Agile
- **Design:** Google UX Design, Adobe Certified

### Organizations:
- PUFA Computer Science, PUMA IT, PURTC, PUSC, AIESEC
- Google Developer Student Clubs (GDSC)
- Microsoft Learn Student Ambassador
- AI Research Club, Data Science Community, Design Community

---

## 🔄 Update Data Alumni

### Tambah Alumni Manual:

**Option 1: Lewat Database (SQL)**
```sql
INSERT INTO users (name, email, student_id, password, role) 
VALUES ('New Alumni', 'new@alumni.president.ac.id', '002202200250', 'hashed_pass', 'alumni');

INSERT INTO alumni (user_id, current_position, current_company, skills_developed, ...)
VALUES (last_insert_id(), 'Job Title', 'Company', '["Skill1","Skill2"]', ...);
```

**Option 2: Run Seeder Lagi (tambah 50 lagi)**
```powershell
php artisan db:seed --class=AlumniSeeder
```

**Lalu sync lagi:**
```powershell
cd ai_recommendation_service
python sync_from_database.py
```

### Re-sync Data (Update Embeddings):

Kapan perlu re-sync?
- Setelah tambah alumni baru
- Setelah update data alumni existing
- Setelah hapus alumni

Command:
```powershell
cd ai_recommendation_service
python sync_from_database.py
```

---

## 🧪 Testing

### Test 1: Check Database

```sql
SELECT COUNT(*) FROM users WHERE role = 'alumni';  -- Should be 50+
SELECT COUNT(*) FROM alumni WHERE verification_status = 1;  -- Should be 50+
```

### Test 2: Check SBERT Files

```powershell
ls AI-SBERT-PUCATALYST
```

Should see:
- `alumni_data.pkl` (~100KB+)
- `alumni_embeddings.npy` (~150KB+)

### Test 3: Test AI Service

```powershell
# Health check
curl http://localhost:5001/health

# Get statistics
curl http://localhost:5001/alumni-stats

# Test recommendation
curl -X POST http://localhost:5001/recommend -H "Content-Type: application/json" -d "{\"query\":\"mobile app developer\",\"top_n\":5}"
```

### Test 4: Frontend Test

1. Login sebagai Student
2. Go to **Roadmap** menu
3. Search: "mobile app developer"
4. Should see real alumni data!

---

## 📁 Files Structure

```
pucatalyst/
├── database/
│   └── seeders/
│       └── AlumniSeeder.php          ← Generate 50 alumni
├── ai_recommendation_service/
│   ├── app.py                        ← Flask API
│   ├── sync_from_database.py         ← Sync MySQL → SBERT
│   ├── generate_sample_data.py       ← Old (hardcoded data)
│   └── requirements.txt              ← Dependencies
└── AI-SBERT-PUCATALYST/
    ├── alumni_data.pkl               ← Alumni data from MySQL
    └── alumni_embeddings.npy         ← SBERT embeddings
```

---

## 🐛 Troubleshooting

### Error: Can't connect to MySQL

**Problem:** `mysql.connector.errors.DatabaseError`

**Solution:**
1. Check `.env` file:
   ```
   DB_HOST=localhost
   DB_DATABASE=pucatalyst
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```
2. Make sure MySQL service is running
3. Test connection: `php artisan migrate --pretend`

### Error: No alumni found

**Problem:** `⚠️  No alumni data found in database!`

**Solution:**
```powershell
php artisan db:seed --class=AlumniSeeder
```

### Error: Module not found

**Problem:** `ModuleNotFoundError: No module named 'mysql.connector'`

**Solution:**
```powershell
pip install mysql-connector-python python-dotenv
```

### Service returns old data

**Problem:** Updated alumni in database but service shows old data

**Solution:** Re-sync!
```powershell
cd ai_recommendation_service
python sync_from_database.py
# No need to restart service - it loads data on startup
# So restart service after sync:
python app.py
```

---

## 🎯 Workflow Summary

### Initial Setup (One Time):
1. `php artisan db:seed --class=AlumniSeeder` → Generate 50 alumni
2. `pip install -r requirements.txt` → Install Python deps
3. `python sync_from_database.py` → Sync to SBERT
4. `python app.py` → Start service

### Daily Usage:
- Just start service: `python app.py`

### When Alumni Data Changes:
1. Add/update alumni in database (via seeder or manual)
2. `python sync_from_database.py` → Re-sync
3. Restart service: `python app.py`

---

## 💡 Pro Tips

### Tip 1: Batch Operations

Kalau mau tambah banyak alumni sekaligus:
```powershell
# Generate 50 alumni
php artisan db:seed --class=AlumniSeeder

# Sync
cd ai_recommendation_service
python sync_from_database.py
```

### Tip 2: Auto-sync on Startup

Edit `app.py` untuk auto-sync setiap kali service start (optional):
```python
if __name__ == '__main__':
    # Auto-sync before starting
    import subprocess
    subprocess.run(['python', 'sync_from_database.py'])
    
    if load_data():
        app.run(...)
```

### Tip 3: Cron Job untuk Auto-sync

Setup scheduled task (Windows Task Scheduler atau cron):
```
Daily at 2 AM: python sync_from_database.py
```

---

## ✅ Verification Checklist

- [ ] Alumni seeder berhasil generate 50 alumni
- [ ] Sync script berhasil fetch data dari MySQL
- [ ] File `alumni_data.pkl` dan `alumni_embeddings.npy` ter-create
- [ ] Service health check return 50+ alumni count
- [ ] Frontend search return real alumni names
- [ ] Recommendations match alumni data in database

---

**🎉 Setup Complete! Sekarang AI Recommendation menggunakan data alumni REAL dari database!**
