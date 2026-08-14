# GIDORA

GIDORA adalah project website e-commerce untuk brand fashion bernama **GIDORA** yang sedang dalam tahap awal pengembangan. Project ini menggunakan **React** sebagai frontend dan **Django** sebagai backend, dengan **PostgreSQL** sebagai database.

> **Status:** 🚧 Early Development / Work in Progress

Project ini masih aktif dikembangkan sehingga struktur, fitur, maupun konfigurasi dapat berubah sewaktu-waktu.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- pnpm

### Backend

- Django
- Django REST Framework
- Pipenv

### Database

- PostgreSQL

## Project Structure

```text
project-gidora/
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── carts/
│   │   ├── orders/
│   │   └── products/
│   ├── config/
│   ├── manage.py
│   ├── Pipfile
│   └── Pipfile.lock
│
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    ├── pnpm-lock.yaml
    └── vite.config.js
```

## Requirements

Pastikan software berikut sudah terpasang:

- Git
- Python
- Pipenv
- Node.js
- pnpm
- PostgreSQL

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/rifkymltzm/project-gidora.git
cd project-gidora
```

### 2. Setup Backend

Masuk ke direktori backend:

```bash
cd backend
```

Install dependency:

```bash
pipenv install
```

Aktifkan virtual environment:

```bash
pipenv shell
```

### 3. Setup Database

Gidora menggunakan PostgreSQL sebagai database.

Buat database baru pada PostgreSQL untuk digunakan oleh aplikasi.

Contoh konfigurasi:

```text
Database : gidora
Username : postgres
Password : your_password
Host     : localhost
Port     : 5432
```

Kemudian buat file `.env` di dalam direktori `backend/`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gidora
SECRET_KEY=your_secret_key
DEBUG=True
```

Sesuaikan `DATABASE_URL` dengan konfigurasi PostgreSQL pada komputer masing-masing.

> **Catatan:** File `.env` tidak boleh di-commit ke repository karena dapat berisi informasi sensitif.

### 4. Run Database Migration

Masih di dalam direktori `backend/`, jalankan:

```bash
python manage.py migrate
```

Jika ingin membuat akun administrator Django:

```bash
python manage.py createsuperuser
```

### 5. Run Backend

Jalankan development server Django:

```bash
python manage.py runserver
```

Backend secara default dapat diakses melalui:

```text
http://127.0.0.1:8000/
```

## Setup Frontend

Buka terminal baru, kemudian masuk ke direktori frontend:

```bash
cd frontend
```

Install dependency menggunakan pnpm:

```bash
pnpm install
```

Jalankan development server:

```bash
pnpm dev
```

Frontend kemudian dapat diakses melalui URL yang ditampilkan oleh Vite, biasanya:

```text
http://localhost:5173/
```

## Development

Untuk menjalankan Gidora secara lokal, backend dan frontend perlu dijalankan secara bersamaan menggunakan terminal yang berbeda.

```text
┌──────────────────────┬──────────────────────┐
│ Frontend             │ Backend              │
├──────────────────────┼──────────────────────┤
│ React + Vite         │ Django               │
│ localhost:5173       │ localhost:8000       │
└──────────────────────┴──────────────────────┘
```

### Backend

```bash
cd backend
pipenv shell
python manage.py runserver
```

### Frontend

```bash
cd frontend
pnpm dev
```

## Current Status

Project saat ini masih berada pada tahap awal pengembangan.

Beberapa bagian yang masih dalam proses:

- Pengembangan fitur utama aplikasi
- Pengembangan API
- Integrasi frontend dan backend
- Pengembangan model dan database
- Pengembangan UI/UX

Informasi mengenai fitur akan diperbarui seiring perkembangan project.

## Notes

Gidora masih dalam tahap pengembangan aktif. Struktur project, fitur, API, maupun konfigurasi dapat berubah tanpa pemberitahuan.

Untuk menjalankan project setelah melakukan clone, pastikan PostgreSQL telah berjalan dan environment variable telah dikonfigurasi dengan benar.

Dependency frontend dikelola menggunakan **pnpm**, sedangkan dependency backend dikelola menggunakan **Pipenv**.

## License

License belum ditentukan.
