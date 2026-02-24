# PropenChill Frontend

Frontend application for **PropenChill**, developed using Vue.  
This repository is responsible for UI/UX, client-side interactions, and backend API communication.

---

## Team Members

| Nama Lengkap | NPM | Branch Prefix |
| :--- | :--- | :--- |
| **Alica Kinar Deska** | 2306245642 | `dev-kinar` |
| **Delya Ardiyanti** | 2306245586 | |
| **Nazwa Arifah Ikhsan** | 2206082625 | |
| **Orlando Devito** | 2306165950 | `dev-orlando` |
| **Raffi Dary Hibban** | 2306203690 | `dev-raffi` |

---

## Prerequisites & Environment Setup

Sebelum menjalankan *project*, pastikan Anda telah menginstal **Node.js (>= 18.x)** dan **Git**. 

Buat file `.env` di *root directory* (sejajar dengan `package.json`) dengan variabel berikut:

```env
# --- BACKEND API CONNECTION ---
VITE_API_URL=...

# --- SUPABASE CONNECTION  ---
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

> **⚠️ WARNING:** File `.env` sudah masuk ke dalam `.gitignore`. Jangan pernah melakukan *commit* pada file `.env` asli!

---

## Langkah-Langkah Instalasi (Local Setup)

Ikuti instruksi berikut untuk menjalankan *environment* lokal untuk pertama kalinya (Reproducibility):

1. **Clone Repository & Update**
```bash
git clone https://gitlab.cs.ui.ac.id/propensi-2025-2026-genap/kelas-b/propenchill/propenchill-frontend.git
cd propenchill-frontend
git pull origin main
```

2. **Install Dependencies**
Untuk memastikan versi *library* yang diinstal sama persis dengan yang digunakan tim (menghindari *error* beda versi), jalankan:
```bash
npm ci
```

*(Jika mengalami kendala dengan `npm ci`, Anda dapat menggunakan `npm install`)*

3. **Jalankan Local Development Server**
```bash
npm run dev
```

Akses `http://localhost:5173` (atau *port* yang tertera di terminal) di *browser* untuk melihat antarmuka aplikasi.

4. **Jalankan Unit Testing (Sanity Check)**
Untuk memastikan *test runner* berjalan dengan baik:
```bash
npm run test:unit
```

---

## Development Workflow (SOP Kelompok)

Agar pengerjaan tidak bentrok dan *history git* tetap bersih, mohon patuhi *flow* berikut:

**1. Mulai Mengerjakan Task**
Selalu buat *branch* baru dari `main` untuk setiap fitur atau *development* masing-masing.

```bash
git checkout main
git pull origin main
git checkout -b dev-<nama-kalian>  # Contoh: git checkout -b dev-fio
```

Pastikan Anda sudah berada di *branch* yang tepat dengan menjalankan `git status`.

**2. Commit & Push**
Lakukan *commit* dan *push* **HANYA** ke *branch* masing-masing (`dev-...`).

```bash
git add .
git commit -m "Feat: Menambahkan halaman UI X"
git push origin dev-<nama-kalian>
```

**3. Merge ke Main & Conflict Resolution**

* Jika ingin melakukan *merge* ke `main`, **WAJIB memberitahu terlebih dahulu ke grup** untuk menghindari *conflict*.
* Jika terdapat *conflict*, lakukan *resolve conflict* di lokal terlebih dahulu sebelum di-*merge*.
* Selalu tarik perubahan terbaru jika ada anggota lain yang baru saja melakukan *merge*:
```bash
git checkout main
git pull origin main
```

---

## Struktur Direktori

Berikut adalah penjelasan struktur direktori utama pada *repository* Frontend ini:

```py
propenchill-frontend/
├── public/                 # Aset publik (favicon, dll) yang tidak diproses Vite
├── src/                    # Source code utama aplikasi Vue
│   ├── __tests__/          # Folder untuk Unit Testing (Vitest)
│   ├── assets/             # Aset statis (Gambar, Logo, CSS tambahan)
│   ├── components/         # Komponen UI Vue yang dapat digunakan ulang (Reusable)
│   ├── lib/                # Konfigurasi library eksternal (Supabase client)
│   ├── router/             # Konfigurasi routing halaman aplikasi (Vue Router)
│   ├── stores/             # State management aplikasi (Pinia)
│   ├── views/              # Komponen halaman penuh (Pages)
│   ├── App.vue             # Root component Vue
│   └── main.ts             # Entry point aplikasi TypeScript
├── .env.example            # Template variabel environment
├── package.json            # Daftar dependencies & NPM scripts
└── vite.config.ts          # Konfigurasi build tools Vite
```