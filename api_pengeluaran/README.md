# API Pengeluaran

REST API sederhana untuk mengelola data pengeluaran menggunakan Node.js, Express.js, dan MySQL.

## Teknologi yang Digunakan

- Node.js
- Express.js
- MySQL
- MySQL2
- CORS
- Dotenv
- Thunder Client untuk pengujian API

## Struktur Project

```text
api_pengeluaran/
├── node_modules/
├── routes/
│   ├── pengeluaran.js
│   └── kategori.js
├── .env
├── .env.example
├── .gitignore
├── db.js
├── app.js
├── server.js
├── skema.sql
├── package-lock.json
├── package.json
└── README.md
```

## Database

Nama database:

```text
db_pengeluaran
```

Database terdiri dari dua tabel:

### 1. kategori

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT | Primary Key |
| nama | VARCHAR(100) | Nama kategori |

### 2. pengeluaran

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT | Primary Key |
| tanggal | DATE | Tanggal pengeluaran |
| nominal | INT | Nominal pengeluaran |
| keterangan | VARCHAR(255) | Keterangan pengeluaran |
| id_kategori | INT | Foreign Key ke tabel kategori |

## Instalasi

Pastikan Node.js dan MySQL sudah terinstall.

### 1. Install dependency

Jalankan:

```bash
npm install
```

### 2. Konfigurasi database

Buat file `.env` dengan konfigurasi:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_pengeluaran
PORT=3000
```

### 3. Menjalankan server

Jalankan:

```bash
node server.js
```

Jika berhasil, akan muncul:

```text
Server berjalan di http://localhost:3000
```

## Endpoint API

### Pengeluaran

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/pengeluaran` | Menampilkan semua pengeluaran |
| GET | `/pengeluaran/:id` | Menampilkan pengeluaran berdasarkan ID |
| POST | `/pengeluaran` | Menambahkan pengeluaran |
| PUT | `/pengeluaran/:id` | Mengubah pengeluaran |
| DELETE | `/pengeluaran/:id` | Menghapus pengeluaran |

### Kategori

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/kategori` | Menampilkan semua kategori |
| GET | `/kategori/ringkasan` | Menampilkan total pengeluaran setiap kategori |

## Contoh Request POST

Endpoint:

```text
POST /pengeluaran
```

Body:

```json
{
    "tanggal": "2026-09-04",
    "nominal": 25000,
    "keterangan": "Makan siang",
    "id_kategori": 2
}
```

## Contoh Request PUT

Endpoint:

```text
PUT /pengeluaran/1
```

Body:

```json
{
    "tanggal": "2026-09-04",
    "nominal": 30000,
    "keterangan": "Makan siang dan minum",
    "id_kategori": 2
}
```

## Query JOIN dan Agregasi

API menggunakan `LEFT JOIN` untuk menghubungkan tabel `kategori` dengan tabel `pengeluaran`.

Endpoint:

```text
GET /kategori/ringkasan
```

Query digunakan untuk menghitung total pengeluaran berdasarkan kategori menggunakan fungsi `SUM()`.

Contoh hasil:

```json
[
    {
        "nama": "Pendidikan",
        "total": 25000
    },
    {
        "nama": "Makanan",
        "total": 50000
    }
]
```

## Pengujian

Pengujian API dilakukan menggunakan Thunder Client.

Endpoint yang diuji meliputi:

- GET semua data pengeluaran
- GET data berdasarkan ID
- POST data pengeluaran
- PUT data pengeluaran
- DELETE data pengeluaran
- GET semua kategori
- GET ringkasan pengeluaran berdasarkan kategori
- Validasi data kosong
- Validasi nominal negatif
- Pengujian ID yang tidak ditemukan

## Keamanan Query

Query database menggunakan prepared statement melalui:

```javascript
pool.execute()
```

Hal ini digunakan untuk membantu mencegah SQL Injection.

## Author

Nama: [Isi Nama]
NIM: [Isi NIM]
Program Studi: Sistem Informasi