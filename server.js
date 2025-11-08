// Import dependensi
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5500; //

// Konfigurasi koneksi MySQL ke database "media"
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // ganti jika MySQL kamu punya password
  database: 'media'
}).promise();

app.use(cors());
app.use(express.json());

// 🔹 Tes koneksi database
app.get('/test-connection', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Koneksi database berhasil!', result: rows[0].result });
  } catch (error) {
    console.error('Koneksi gagal:', error);
    res.status(500).json({ message: 'Koneksi database gagal!', error: error.message });
  }
});

//
// === CRUD API untuk tabel `media` ===
//

// ✅ GET semua data media
app.get('/api/media', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Kesalahan Server:', error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// ✅ GET satu media berdasarkan ID
app.get('/api/media/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media WHERE id_media = ?', [req.params.id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Media tidak ditemukan' });
    }
  } catch (error) {
    console.error('Kesalahan Server:', error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// ✅ POST tambah media baru
app.post('/api/media', async (req, res) => {
  const { judul, tahun_rilis, genre } = req.body;

  if (!judul || !tahun_rilis || !genre) {
    return res.status(400).json({ message: 'Judul, Tahun Rilis, dan Genre harus diisi' });
  }

  try {
    const sql = 'INSERT INTO media (judul, tahun_rilis, genre) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [judul, tahun_rilis, genre]);
    res.status(201).json({ id_media: result.insertId, judul, tahun_rilis, genre });
  } catch (error) {
    console.error('Kesalahan Server:', error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// ✅ PUT perbarui data media
app.put('/api/media/:id', async (req, res) => {
  const id = req.params.id;
  const { judul, tahun_rilis, genre } = req.body;

  if (!judul || !tahun_rilis || !genre) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  try {
    const sql = 'UPDATE media SET judul = ?, tahun_rilis = ?, genre = ? WHERE id_media = ?';
    const [result] = await db.query(sql, [judul, tahun_rilis, genre, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Media tidak ditemukan untuk diperbarui' });
    }

    res.status(200).json({ id_media: parseInt(id), judul, tahun_rilis, genre });
  } catch (error) {
    console.error('Kesalahan Server:', error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// ✅ DELETE hapus media
app.delete('/api/media/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM media WHERE id_media = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Media tidak ditemukan untuk dihapus' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Kesalahan Server:', error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// Jalankan server di port 5500
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
