# PropenChill Frontend

Frontend application for **PropenChill**, developed using Vue.  
This repository is responsible for UI/UX, client-side interactions, and backend API communication.

---

## Team Members

| Nama Lengkap            | NPM        | Branch Prefix |
| :---------------------- | :--------- | :------------ |
| **Alica Kinar Deska**   | 2306245642 | `dev-kinar`   |
| **Delya Ardiyanti**     | 2306245586 | `dev-delya`   |
| **Nazwa Arifah Ikhsan** | 2206082625 | `dev-nazwa`   |
| **Orlando Devito**      | 2306165950 | `dev-orlando` |
| **Raffi Dary Hibban**   | 2306203690 | `dev-raffi`   |

---

## Prerequisites & Environment Setup

Sebelum menjalankan _project_, pastikan Anda telah menginstal **Node.js (>= 18.x)** dan **Git**.

Buat file `.env` di _root directory_ (sejajar dengan `package.json`) dengan variabel berikut:

```env
# --- BACKEND API CONNECTION ---
VITE_API_URL=...

# --- SUPABASE CONNECTION  ---
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

> **⚠️ WARNING:** File `.env` sudah masuk ke dalam `.gitignore`. Jangan pernah melakukan _commit_ pada file `.env` asli!

---

## Langkah-Langkah Instalasi (Local Setup)

Ikuti instruksi berikut untuk menjalankan _environment_ lokal untuk pertama kalinya (Reproducibility):

1. **Clone Repository & Update**

```bash
git clone https://gitlab.cs.ui.ac.id/propensi-2025-2026-genap/kelas-b/propenchill/propenchill-frontend.git
cd propenchill-frontend
git pull origin main
```

2. **Install Dependencies**
   Untuk memastikan versi _library_ yang diinstal sama persis dengan yang digunakan tim (menghindari _error_ beda versi), jalankan:

```bash
npm ci
```

_(Jika mengalami kendala dengan `npm ci`, Anda dapat menggunakan `npm install`)_

3. **Jalankan Local Development Server**

```bash
npm run dev
```

Akses `http://localhost:5173` (atau _port_ yang tertera di terminal) di _browser_ untuk melihat antarmuka aplikasi.

4. **Jalankan Unit Testing (Sanity Check)**
   Untuk memastikan _test runner_ berjalan dengan baik:

```bash
npm run test:unit
```

---

## Development Workflow (SOP Kelompok)

Agar pengerjaan tidak bentrok dan _history git_ tetap bersih, mohon patuhi _flow_ berikut:

**1. Mulai Mengerjakan Task**
Selalu buat _branch_ baru dari `main` untuk setiap fitur atau _development_ masing-masing.

```bash
git checkout main
git pull origin main
git checkout -b dev-<nama-kalian>  # Contoh: git checkout -b dev-fio
```

Pastikan Anda sudah berada di _branch_ yang tepat dengan menjalankan `git status`.

**2. Commit & Push**
Lakukan _commit_ dan _push_ **HANYA** ke _branch_ masing-masing (`dev-...`).

```bash
git add .
git commit -m "Feat: Menambahkan halaman UI X"
git push origin dev-<nama-kalian>
```

**3. Merge ke Main & Conflict Resolution**

- Jika ingin melakukan _merge_ ke `main`, **WAJIB memberitahu terlebih dahulu ke grup** untuk menghindari _conflict_.
- Jika terdapat _conflict_, lakukan _resolve conflict_ di lokal terlebih dahulu sebelum di-_merge_.
- Selalu tarik perubahan terbaru jika ada anggota lain yang baru saja melakukan _merge_:

```bash
git checkout main
git pull origin main
```

---

## Struktur Direktori

Berikut adalah penjelasan struktur direktori utama pada _repository_ Frontend ini:

```py
propenchill-frontend/
├── public/                     # Aset publik (favicon, dll) yang tidak diproses Vite
├── src/                        # Source code utama aplikasi Vue
│   ├── __tests__/              # Unit testing (Vitest)
│   ├── assets/                 # Aset statis (gambar, logo, stylesheet)
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Komponen khusus admin (management, parents, students, teachers)
│   │   ├── common/             # Komponen umum (button, modal, table, alert, dll)
│   │   ├── icons/              # Komponen icon SVG Vue
│   │   └── layout/             # Komponen layout (mis. auth layout)
│   ├── composables/            # Vue composables (custom hooks)
│   ├── lib/                    # Utility/helper dan konfigurasi library (Supabase, field errors)
│   ├── plugins/                # Konfigurasi plugin (axios)
│   ├── router/                 # Konfigurasi routing (Vue Router)
│   ├── stores/                 # State management (Pinia)
│   │   ├── parents/            # Store domain parents
│   │   ├── teacher/            # Store domain teacher
│   │   └── users/              # Store domain auth/password user
│   ├── views/                  # Halaman aplikasi (pages)
│   │   ├── admin/              # Views admin (parents & teacher)
│   │   ├── management/         # Views management akun admin
│   │   ├── students/           # View manajemen siswa
│   │   └── users/              # Views autentikasi user
│   ├── App.vue                 # Root component Vue
│   └── main.ts                 # Entry point aplikasi TypeScript
├── env.d.ts                    # Type declarations untuk Vite env variables
├── eslint.config.ts            # Konfigurasi ESLint
├── package.json                # Daftar dependencies & npm scripts
├── tsconfig*.json              # Konfigurasi TypeScript (app/node/vitest)
├── vite.config.ts              # Konfigurasi build tool Vite
└── vitest.config.ts            # Konfigurasi unit test (Vitest)
```
