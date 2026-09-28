import { Router } from 'express';
import pool from '../db.js';

const router = Router();


// =====================================================
// GET SEMUA PENGELUARAN
// GET /pengeluaran
// =====================================================

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.judul,
        p.nominal,
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        p.catatan,
        p.id_kategori,
        k.nama AS kategori
      FROM pengeluaran p
      LEFT JOIN kategori k
        ON p.id_kategori = k.id
      ORDER BY p.id ASC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      pesan: 'Gagal mengambil data pengeluaran'
    });
  }
});


// =====================================================
// GET DETAIL
// GET /pengeluaran/:id
// =====================================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.judul,
        p.nominal,
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        p.catatan,
        p.id_kategori,
        k.nama AS kategori
      FROM pengeluaran p
      LEFT JOIN kategori k
        ON p.id_kategori = k.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        pesan: 'Data tidak ditemukan'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      pesan: 'Gagal mengambil detail pengeluaran'
    });
  }
});


// =====================================================
// POST TAMBAH PENGELUARAN
// POST /pengeluaran
// =====================================================

router.post('/', async (req, res) => {
  try {
    const {
      judul,
      nominal,
      id_kategori
    } = req.body;

    // Validasi judul
    if (!judul || !judul.trim()) {
      return res.status(400).json({
        pesan: 'Judul wajib diisi'
      });
    }

    // Validasi nominal
    const nominalAngka = Number(nominal);

    if (
      !Number.isInteger(nominalAngka) ||
      nominalAngka < 1
    ) {
      return res.status(400).json({
        pesan: 'Nominal harus berupa bilangan positif'
      });
    }

    // Validasi panjang judul
    if (judul.trim().length > 100) {
      return res.status(400).json({
        pesan: 'Judul maksimal 100 karakter'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO pengeluaran
        (judul, nominal, id_kategori)
      VALUES
        (?, ?, ?)
    `, [
      judul.trim(),
      nominalAngka,
      id_kategori ?? null
    ]);

    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.judul,
        p.nominal,
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        p.catatan,
        p.id_kategori,
        k.nama AS kategori
      FROM pengeluaran p
      LEFT JOIN kategori k
        ON p.id_kategori = k.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      pesan: 'Gagal menambahkan pengeluaran'
    });
  }
});


// =====================================================
// PUT UBAH PENGELUARAN
// PUT /pengeluaran/:id
// =====================================================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      judul,
      nominal
    } = req.body;

    // Validasi judul
    if (!judul || !judul.trim()) {
      return res.status(400).json({
        pesan: 'Judul wajib diisi'
      });
    }

    // Validasi panjang judul
    if (judul.trim().length > 100) {
      return res.status(400).json({
        pesan: 'Judul maksimal 100 karakter'
      });
    }

    // Validasi nominal
    const nominalAngka = Number(nominal);

    if (
      !Number.isInteger(nominalAngka) ||
      nominalAngka < 1
    ) {
      return res.status(400).json({
        pesan: 'Nominal harus berupa bilangan positif'
      });
    }

    const [result] = await pool.execute(`
      UPDATE pengeluaran
      SET
        judul = ?,
        nominal = ?
      WHERE id = ?
    `, [
      judul.trim(),
      nominalAngka,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        pesan: 'Data tidak ditemukan'
      });
    }

    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.judul,
        p.nominal,
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        p.catatan,
        p.id_kategori,
        k.nama AS kategori
      FROM pengeluaran p
      LEFT JOIN kategori k
        ON p.id_kategori = k.id
      WHERE p.id = ?
    `, [id]);

    res.json(rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      pesan: 'Gagal mengubah pengeluaran'
    });
  }
});


// =====================================================
// DELETE
// DELETE /pengeluaran/:id
// =====================================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM pengeluaran
      WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        pesan: 'Data tidak ditemukan'
      });
    }

    res.status(204).send();

  } catch (error) {
    console.error(error);

    res.status(500).json({
      pesan: 'Gagal menghapus pengeluaran'
    });
  }
});


export default router;