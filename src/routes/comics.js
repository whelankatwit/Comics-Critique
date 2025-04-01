import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all comics
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comics');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get specific comic
router.get('/:id', async (req, res) => {
  const comicId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM comics WHERE id = $1', [comicId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comic not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching comic details', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get top comics
router.get('/top/rated', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.title, 
        c.author, 
        c.artist, 
        c.release_year, 
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS review_count
      FROM comics c
      LEFT JOIN reviews r ON c.id = r.comic_id
      GROUP BY c.id
      ORDER BY average_rating DESC, review_count DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top-rated comics:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router; 