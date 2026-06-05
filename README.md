# Simari App - Internal Audit & Risk Management System

Simari App adalah platform manajemen risiko dan audit internal terintegrasi yang dirancang untuk memantau, menganalisis, dan melaporkan profil risiko entitas keuangan serta kepatuhan terhadap regulasi OJK (Otoritas Jasa Keuangan).

Sistem ini mendukung pengumpulan data profil risiko, penilaian KPMR (Kualitas Penerapan Manajemen Risiko), agregasi data holding company, analisis bertenaga AI, serta pembuatan laporan secara real-time.

---

## 🚀 Fitur Utama

### 1. **Modul Kepatuhan Regulasi OJK**
Penilaian komprehensif terhadap indikator kepatuhan regulasi OJK:
*   **Permodalan (Capital)**
*   **Rentabilitas (Profitability)**
*   **Tatakelola (Corporate Governance)**
*   **Hukum (Legal)**
*   **Likuiditas (Liquidity)**
*   **Reputasi (Reputation)**
*   **Strategis (Strategic)**

### 2. **Analisis Profil Risiko (KPMR - Kualitas Penerapan Manajemen Risiko)**
Sistem evaluasi mandiri (Self-Assessment) untuk mengukur kualitas kontrol dan tingkat risiko inheren pada kategori:
*   **KPMR Stratejik**
*   **KPMR Reputasi**
*   **KPMR Kepatuhan**
*   **KPMR Hukum**
*   **KPMR Operasional**

### 3. **Agregasi Data & Rekap Holding**
Fitur rekapitulasi data tingkat holding (`rekap-data-1` & `rekap-data-2`) untuk menggabungkan skor parameter risiko dari berbagai unit usaha ke dalam laporan konsolidasi.

### 4. **AI-Powered Insights (Google Gemini)**
Integrasi langsung dengan **Google Gemini AI SDK** baik pada sisi frontend maupun backend untuk menganalisis data mentah secara otomatis dan menghasilkan ringkasan naratif, rekomendasi perbaikan, serta laporan audit.

### 5. **Ekspor Data & Visualisasi**
*   Ekspor laporan langsung ke berkas Excel berformat premium menggunakan `exceljs`, `xlsx`, dan `xlsx-js-style`.
*   Visualisasi data tren dan parameter risiko menggunakan grafik interaktif dari `recharts`.

### 6. **Notifikasi Real-Time**
Pemberitahuan instan menggunakan WebSockets (`socket.io` & `@nestjs/websockets`) untuk status audit, pengisian parameter, dan perubahan data profil risiko.

---

## 🛠️ Tech Stack

### Sisi Frontend (`/client`)
*   **Framework**: React (v19) + Vite
*   **Styling**: Tailwind CSS (v4) + `framer-motion` (Animasi)
*   **UI Components**: `shadcn/ui` + Radix UI
*   **State Management**: Zustand
*   **Data Fetching**: TanStack React Query (v5) + Axios
*   **Charting**: Recharts

### Sisi Backend (`/server`)
*   **Framework**: NestJS (v11) (TypeScript)
*   **Database ORM**: TypeORM (MySQL)
*   **Autentikasi**: Passport JWT (`@nestjs/jwt`)
*   **Dokumentasi API**: OpenAPI Swagger
*   **Notifikasi**: WebSockets (`socket.io`)
*   **Ekstra/Dokumen**: PDFKit (Ekspor PDF)

### Layanan Tambahan (`/flask`)
*   **Framework**: Flask (Python) untuk modul pemrosesan data / analitis khusus.

---

## ⚙️ Petunjuk Instalasi & Menjalankan Aplikasi

### Prasyarat
Pastikan Anda telah menginstal aplikasi berikut di komputer Anda:
*   [Node.js](https://nodejs.org/) (Rekomendasi v18 ke atas)
*   [Python 3](https://www.python.org/) (Untuk modul Flask)
*   [MySQL Database](https://www.mysql.com/)

---

### 📂 Langkah 1: Menjalankan Backend (`server`)

1. Buka direktori server:
   ```bash
   cd server
   ```
2. Instal dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `server` (duplikasi dari `.env.example` jika ada) dan lengkapi konfigurasi database serta API Key Gemini:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password_db_anda
   DB_DATABASE=simari_audit_db
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Jalankan migrasi database (jika diperlukan):
   ```bash
   npm run typeorm migration:run
   ```
5. Jalankan backend server dalam mode development:
   ```bash
   npm run start:dev
   ```
   *Backend secara default berjalan di `http://localhost:3000` dan Swagger API docs dapat diakses di `http://localhost:3000/api`.*

---

### 💻 Langkah 2: Menjalankan Frontend (`client`)

1. Buka direktori client:
   ```bash
   cd ../client
   ```
2. Instal dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `client`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
4. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan dan dapat diakses di `http://localhost:5173`.*

---

### 🐍 Langkah 3: Menjalankan Flask Analytics Service (`flask`)

1. Buka direktori flask:
   ```bash
   cd ../flask
   ```
2. Aktifkan virtual environment (venv) dan instal Flask:
   ```bash
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate

   pip install flask
   ```
3. Jalankan aplikasi Flask:
   ```bash
   python app.py
   ```
   *Layanan Flask berjalan di `http://localhost:5000`.*

---

## 🔒 Lisensi & Keamanan
*   Proyek ini merupakan sistem internal. **Jangan pernah mengunggah kredensial atau file `.env` ke repository publik.**
*   Gunakan `.gitignore` yang sudah disediakan untuk menghindari kesalahan unggah.
