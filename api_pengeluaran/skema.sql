CREATE DATABASE IF NOT EXISTS db_pengeluaran;

USE db_pengeluaran;

-- Tabel kategori
CREATE TABLE IF NOT EXISTS kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL
);

-- Tabel pengeluaran
CREATE TABLE IF NOT EXISTS pengeluaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    nominal INT NOT NULL,
    keterangan VARCHAR(255),
    id_kategori INT,
    FOREIGN KEY (id_kategori)
        REFERENCES kategori(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Data awal kategori
INSERT INTO kategori (nama)
SELECT 'Pendidikan'
WHERE NOT EXISTS (
    SELECT 1 FROM kategori WHERE nama = 'Pendidikan'
);

INSERT INTO kategori (nama)
SELECT 'Makanan'
WHERE NOT EXISTS (
    SELECT 1 FROM kategori WHERE nama = 'Makanan'
);

INSERT INTO kategori (nama)
SELECT 'Transport'
WHERE NOT EXISTS (
    SELECT 1 FROM kategori WHERE nama = 'Transport'
);

INSERT INTO kategori (nama)
SELECT 'Hiburan'
WHERE NOT EXISTS (
    SELECT 1 FROM kategori WHERE nama = 'Hiburan'
);