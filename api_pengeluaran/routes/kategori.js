import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET semua kategori
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                id,
                nama
            FROM kategori
            ORDER BY id ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            pesan: 'Gagal mengambil data kategori'
        });
    }
});

// GET ringkasan total pengeluaran per kategori
router.get('/ringkasan', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                k.nama,
                COALESCE(SUM(p.nominal), 0) AS total
            FROM kategori k
            LEFT JOIN pengeluaran p
                ON p.id_kategori = k.id
            GROUP BY k.id, k.nama
            ORDER BY k.id ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            pesan: 'Gagal mengambil ringkasan pengeluaran'
        });
    }
});

export default router;