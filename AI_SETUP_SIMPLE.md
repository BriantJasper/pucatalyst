# 🚀 START HERE - AI Recommendation Setup

## Quick 3-Step Setup (Pertama Kali Saja)

### Step 1: Install Dependencies

Buka terminal di folder `pucatalyst`, lalu jalankan:

```powershell
cd ai_recommendation_service
pip install -r requirements.txt
```

**PENTING:** Tunggu hingga selesai. SBERT model (~100MB) akan di-download otomatis.

### Step 2: Generate Sample Data

Masih di folder `ai_recommendation_service`:

```powershell
python generate_sample_data.py
```

Output yang diharapkan:
```
Loading SBERT model...
Generating embeddings for alumni data...
Saving alumni data...
Saving alumni embeddings...

Successfully created data for 10 alumni!
```

### Step 3: Start Service

```powershell
python app.py
```

Service berjalan di: **http://localhost:5001**

Test dengan buka browser: http://localhost:5001/health

---

## ✅ Setelah Setup Selesai

Untuk menjalankan kembali (tidak perlu install lagi):

```powershell
cd ai_recommendation_service
python app.py
```

ATAU gunakan batch file:

```powershell
cd ai_recommendation_service
start_service.bat
```

---

## 🌐 Cara Menggunakan di Frontend

1. **Login** sebagai Student
2. Klik menu **"Roadmap"**
3. Di bagian atas ada search box **"Explore Career Paths"**
4. Ketik career goal: `web developer`, `data scientist`, `mobile app developer`, dll
5. Autocomplete akan muncul saat mengetik
6. Klik suggestion atau tekan **Enter**
7. Lihat hasil rekomendasi:
   - **Top Alumni** yang cocok dengan similarity score
   - **Skills** yang harus dikuasai (sorted by frequency)
   - **Certifications** yang disarankan
   - **Organizations** yang harus diikuti
   - **Project Portfolio** yang harus dibuat

---

## 🎯 Contoh Search Query

- `mobile app developer` → Rekomendasi untuk mobile dev
- `web developer` → Rekomendasi untuk web dev
- `data scientist` → Rekomendasi untuk data science
- `UI/UX designer` → Rekomendasi untuk design
- `machine learning` → Rekomendasi untuk ML engineer
- `devops` → Rekomendasi untuk DevOps

---

## 📊 Data Alumni yang Sudah Ada (10 Alumni)

1. **Mobile App Developer** (5 alumni) - Information Technology
2. **Web Developer** (1 alumni) - Computer Science
3. **Data Scientist** (1 alumni) - Information Technology
4. **UI/UX Designer** (1 alumni) - Information Technology
5. **Full Stack Developer** (1 alumni) - Computer Science
6. **DevOps Engineer** (1 alumni) - Information Technology

Setiap alumni punya:
- 5-8 skills (technical & soft skills)
- 3-5 certifications
- 3-5 organizations
- 3-5 project types

---

## 🐛 Troubleshooting

### Error: Module 'sentence_transformers' not found
**Solusi:** Install dependencies lagi:
```powershell
pip install sentence-transformers
```

### Error: No such file 'alumni_data.pkl'
**Solusi:** Generate data lagi:
```powershell
python generate_sample_data.py
```

### Port 5001 sudah dipakai
**Solusi:** Edit `app.py` baris terakhir ganti port:
```python
app.run(host='0.0.0.0', port=5002, debug=True)
```

### Service lambat pertama kali
**Normal!** SBERT model loading pertama kali butuh waktu. Setelah itu cepat.

---

## 🔗 Lihat Juga

- **Full Documentation:** `ai_recommendation_service/README.md`
- **Detailed Guide:** `AI_RECOMMENDATION_QUICKSTART.md`
- **Face Recognition Setup:** `FACE_RECOGNITION_QUICKSTART.md`

---

**That's it! 3 langkah dan siap digunakan! 🎉**
