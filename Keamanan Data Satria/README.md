# Keamanan Data - Satria

## Deskripsi Proyek
Proyek ini adalah bagian dari Ujian Akhir Semester (UAS) mata kuliah Keamanan Data. Proyek ini mendemonstrasikan implementasi keamanan pada aplikasi web frontend yang terhubung ke cloud backend.

## Fitur Keamanan yang Diimplementasikan
1. **Otentikasi Pengguna (Authentication):** Menggunakan Firebase Authentication untuk login, registrasi, dan reset password secara aman.
2. **Manajemen Sesi (Session Management):** Proteksi rute pada halaman utama (`index.html`). Jika pengguna belum login, sistem akan memblokir akses dan mengarahkannya kembali ke halaman `login.html` (Route Protection).
3. **Keamanan Akses API (Token-based Auth):** Pengambilan data dari database Supabase dilindungi menggunakan API Key dan Authorization Bearer Token pada HTTP headers untuk mencegah akses tidak sah.
4. **Validasi Input Dasar:** Pengecekan kolom input pada form login agar tidak boleh kosong sebelum diproses dan dikirim ke server.
5. **Enkripsi HTTPS & Firewall Vercel:** Menggunakan sertifikat keamanan Let's Encrypt (SSL/TLS) dan fitur Firewall yang sudah merupakan bawaan otomatis dari platform Vercel tempat web ini di-hosting.

## Kode IoT & Simulasi (Wokwi)
Kode program untuk perangkat IoT (ESP32/Arduino) yang mengirimkan data sensor ke Supabase dapat dilihat pada direktori `KEAMANAN SATRIA ( WOKWI IOT )` di dalam repositori ini. 
Anda juga dapat mencoba dan menjalankan simulasi rangkaian secara langsung melalui platform Wokwi pada tautan berikut:
- **Link Simulasi Wokwi:** [https://wokwi.com/projects/470187630262040577](https://wokwi.com/projects/470187630262040577)

## Konfigurasi Cloud & Deployment
Proyek ini mengintegrasikan dua layanan cloud backend. Berikut adalah kode konfigurasi yang digunakan dalam aplikasi (terdapat secara bawaan pada file `login.js` dan `index.js`):

### 1. Konfigurasi Cloud Firebase (Otentikasi)
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCzK3vNyfYEzwsy2uMewCHVzOtsKQKUaec",
    authDomain: "keamanan-satria.firebaseapp.com",
    databaseURL: "https://keamanan-satria-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "keamanan-satria",
    storageBucket: "keamanan-satria.firebasestorage.app",
    messagingSenderId: "617561225556",
    appId: "1:617561225556:web:3ac65ff64abb287c71f0c1",
    measurementId: "G-L9DGVX8020"
};
```

### 2. Konfigurasi Cloud Supabase (Database Sensor)
```javascript
const SUPABASE_URL = "https://pqeeujhjioclijlsafif.supabase.co/rest/v1/sensor_data?order=created_at.desc&limit=1000";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWV1amhqaW9jbGlqbHNhZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjIwODIsImV4cCI6MjA5ODQ5ODA4Mn0.keY1b1XJe9ri3d-H4Eaj4dk0UivC7ppX-3my_DcGz7M";
```

### 3. URL Deployment
Aplikasi telah berhasil di-deploy (di-hosting) secara online menggunakan layanan Cloud **Vercel** dan dapat diakses pada tautan berikut:
- **Link Website:** [https://keamanan-data-satria.vercel.app/login](https://keamanan-data-satria.vercel.app/login)

## Demo Sistem
Video demo (7-10 menit) yang menunjukkan hasil deployment dan fitur keamanan dapat dilihat pada tautan berikut:
- **Link Video Demo:** [https://drive.google.com/file/d/1cy98olMpCE9fOJK_aUs7PgzUif5gCeFF/view?usp=drive_link](https://drive.google.com/file/d/1cy98olMpCE9fOJK_aUs7PgzUif5gCeFF/view?usp=drive_link)

## Cara Menjalankan Proyek Secara Lokal
1. Clone repositori ini ke komputer Anda.
2. Buka file `login.html` di browser web.

