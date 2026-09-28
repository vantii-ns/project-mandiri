import app from './app.js';
import pool from './db.js';

const PORT = process.env.PORT || 3000;

async function cekKoneksi() {
    try {
        const [rows] = await pool.execute('SELECT 1 AS hasil');
        console.log('Koneksi MySQL berhasil:', rows);
    } catch (error) {
        console.error('Koneksi MySQL gagal:', error.message);
    }
}

cekKoneksi();

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});