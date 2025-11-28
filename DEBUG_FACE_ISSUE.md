## 🔍 DEBUG: Face Data Tidak Tersimpan

### **Masalah Ditemukan:**
❌ Face encoding **TIDAK TERSIMPAN** ke database meskipun:
- ✅ Kolom `face_encoding`, `face_auth_enabled`, `face_registered_at` **ADA** di database
- ✅ Migration sudah dijalankan
- ✅ Python Face Recognition Service **BERJALAN** (http://localhost:5000)
- ✅ User model sudah include field face_encoding di `$fillable`

### **Test Results:**
```
Total users: 2
- ID: 1, Name: test, Face Auth: OFF
- ID: 2, Name: test4, Face Auth: OFF
```

**Tidak ada satupun user yang punya face_encoding!**

### **Kemungkinan Penyebab:**

#### 1. **Frontend Tidak Mengirim `face_images`**
Cek di browser DevTools → Network → Request payload saat register:
```json
{
  "name": "...",
  "email": "...",
  "student_id": "...",
  "password": "...",
  "role": "student",
  "face_images": [  // ⚠️ Ini HARUS ada jika toggle enabled
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    // 5-7 images
  ]
}
```

#### 2. **Python Service Timeout/Error**
Laravel timeout default 30 detik mungkin kurang untuk process 5-7 images.
Sudah diperbaiki ke 60 detik.

#### 3. **Response dari Python Service Tidak `success: true`**
Cek log Python service saat ada request `/encode-faces`

### **Cara Debug:**

#### **Step 1: Test Manual Registration**
1. Buka http://localhost:5173/register
2. Isi form + **ENABLE toggle face auth**
3. Capture 5-7 face images
4. Submit

#### **Step 2: Check Browser Console**
```javascript
// Di browser console saat register
// Lihat payload yang dikirim:
```

#### **Step 3: Check Laravel Log** (REAL TIME)
```powershell
Get-Content storage/logs/laravel.log -Wait -Tail 50
```

Sambil register, lihat log ini. Harusnya muncul:
```
Starting face encoding process for user: X
Number of face images: 7
Face service URL: http://localhost:5000
Face service response status: 200
Encoding received, length: 384
User update result: SUCCESS
Verified - face_auth_enabled: true
Verified - face_encoding length: XXXX
```

#### **Step 4: Check Python Service Log**
```powershell
# Di terminal Python service, lihat request yang masuk
```

### **Quick Fix To Test:**

Coba register **ULANG** dengan user baru dan:
1. ✅ Pastikan toggle face auth **ON**
2. ✅ Capture 5-7 images dengan jelas
3. ✅ Check logs real-time
4. ✅ Setelah register, run:

```powershell
php test_face_db.php
```

Harusnya muncul user baru dengan face data!

### **Jika Masih Gagal:**

Kemungkinan masalah di **frontend** tidak mengirim `face_images` array ke backend.

Cek file `RegisterPage.jsx` line ~75-95:
```javascript
const registrationData = {
  ...formData,
  face_images: capturedImages,  // ⚠️ Ini HARUS ada
};

const response = await api.post('/auth/register', registrationData);
```

---

**Next Step:** Test register dengan face auth enabled dan monitor logs!
