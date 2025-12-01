# AI Recommendation Service - SBERT

Service AI untuk memberikan rekomendasi karir berdasarkan data alumni menggunakan SBERT (Sentence-BERT).

## 🚀 Quick Start

### 1. Generate Sample Data (First Time Only)

```powershell
cd ai_recommendation_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python generate_sample_data.py
```

### 2. Start the Service

```powershell
# Cara 1: Menggunakan batch file
start_service.bat

# Cara 2: Manual
cd ai_recommendation_service
venv\Scripts\activate
python app.py
```

Service akan berjalan di: **http://localhost:5001**

## 📋 API Endpoints

### 1. Health Check
```
GET /health
```
Response:
```json
{
  "status": "healthy",
  "model": "paraphrase-multilingual-MiniLM-L12-v2",
  "alumni_count": 10
}
```

### 2. Get Recommendations
```
POST /recommend
```
Body:
```json
{
  "query": "mobile app developer",
  "top_n": 5
}
```
Response:
```json
{
  "query": "mobile app developer",
  "top_alumni": [...],
  "recommendations": {
    "skills": [["CI/CD", 6], ["AWS", 5], ...],
    "certifications": [["CompTIA A+", 7], ...],
    "organizations": [["PUFA_COMPUTER_SCIENCE", 8], ...],
    "projects": [["APP INTERFACE", 3], ...]
  },
  "total_alumni_analyzed": 5
}
```

### 3. Autocomplete Suggestions
```
POST /autocomplete
```
Body:
```json
{
  "query": "web",
  "max_suggestions": 5
}
```
Response:
```json
{
  "suggestions": ["Web Developer", "Web Design", ...]
}
```

### 4. Alumni Statistics
```
GET /alumni-stats
```
Response:
```json
{
  "total_alumni": 10,
  "unique_skills": 25,
  "unique_certifications": 12,
  "unique_organizations": 8,
  "majors": {...},
  "top_job_titles": {...}
}
```

## 🎯 Features

- ✅ **SBERT Model** - Menggunakan `paraphrase-multilingual-MiniLM-L12-v2` untuk multilingual support
- ✅ **Autocomplete** - Real-time suggestions saat mengetik
- ✅ **Similarity Search** - Mencari alumni dengan karir yang mirip
- ✅ **Aggregated Recommendations** - Merangkum skills, certifications, organizations, projects dari top alumni
- ✅ **Flask REST API** - Easy integration dengan Laravel backend
- ✅ **CORS Enabled** - Dapat diakses dari frontend React

## 📊 Data Structure

### Alumni Data Format
```python
{
    'name': 'Nama Alumni',
    'job_title': 'Mobile App Developer',
    'major': 'Information Technology',
    'skills': ['CI/CD', 'AWS', 'JavaScript', 'SQL', 'React'],
    'certifications': ['CompTIA A+', 'AWS Certified Cloud Practitioner'],
    'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY'],
    'projects': ['APP INTERFACE', 'MACHINE LEARNING']
}
```

## 🔧 How It Works

1. **Text Embedding**: Setiap alumni data dikonversi menjadi vector embedding menggunakan SBERT
2. **Similarity Calculation**: Query user juga di-embed, lalu dihitung cosine similarity dengan semua alumni
3. **Top-N Selection**: Alumni dengan similarity tertinggi dipilih
4. **Aggregation**: Skills, certifications, organizations, projects dari top alumni dijumlahkan
5. **Ranking**: Hasil diurutkan berdasarkan frekuensi kemunculan

## 💡 Usage Example

### Frontend Integration (React)

```javascript
// Search for recommendations
const handleSearch = async (query) => {
    const response = await fetch('http://localhost:5001/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_n: 5 })
    });
    const data = await response.json();
    console.log(data.recommendations);
};

// Autocomplete
const fetchSuggestions = async (partialQuery) => {
    const response = await fetch('http://localhost:5001/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: partialQuery })
    });
    const data = await response.json();
    return data.suggestions;
};
```

## 📁 Files Structure

```
ai_recommendation_service/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── generate_sample_data.py     # Script to create sample data
├── start_service.bat           # Windows startup script
└── README.md                   # This file
```

## 🛠️ Development

### Add New Alumni Data

Edit `generate_sample_data.py` dan tambahkan data alumni baru, lalu run:

```powershell
python generate_sample_data.py
```

### Update SBERT Model

Edit `MODEL_NAME` di `app.py` untuk menggunakan model SBERT yang berbeda. Lihat: https://www.sbert.net/docs/pretrained_models.html

## 🐛 Troubleshooting

### Port Already in Use
Jika port 5001 sudah digunakan, edit `app.py` baris terakhir:
```python
app.run(host='0.0.0.0', port=5002, debug=True)  # Change port
```

### Model Download Slow
Model SBERT (~100MB) akan di-download otomatis saat pertama kali run. Pastikan koneksi internet stabil.

### CORS Error
Jika ada CORS error, pastikan `flask-cors` sudah terinstall dan CORS enabled di `app.py`.

## 📝 Notes

- Service ini berjalan terpisah dari Laravel dan Face Recognition service
- Data alumni disimpan di `../AI-SBERT-PUCATALYST/` (pickle + numpy)
- Model SBERT di-cache di `~/.cache/torch/sentence_transformers/`

## 🎉 Result Example

Ketika user search "mobile app developer", service akan return:

1. **Top 5 Alumni** dengan similarity score tertinggi
2. **Skills Prioritas** (e.g., CI/CD: 6, AWS: 5, JavaScript: 5)
3. **Certifications** (e.g., CompTIA A+: 7, AWS: 5)
4. **Organizations** (e.g., PUFA_CS: 8, PUMA_IT: 6)
5. **Project Types** (e.g., APP INTERFACE: 3, ML: 3)

UI akan menampilkan hasil dengan format yang menarik seperti di gambar yang diberikan.
