import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get user's lists
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM lists WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create new list
router.post('/', async (req, res) => {
  const { user_id, title, description } = req.body;

  if (!user_id || !title || !description) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lists (user_id, title, description) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [user_id, title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get list details
router.get('/:listId', async (req, res) => {
  const { listId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM lists WHERE id = $1`,
      [listId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching list details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get comics in a list
router.get('/:listId/comics', async (req, res) => {
  const { listId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.cover_url 
       FROM list_comics lc
       JOIN comics c ON lc.comic_id = c.id
       WHERE lc.list_id = $1
       ORDER BY lc.created_at DESC`,
      [listId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add comic to list
router.post('/comics', async (req, res) => {
  const { listId, comicId } = req.body;
  try {
    await pool.query(
      `INSERT INTO list_comics (list_id, comic_id, created_at) 
       VALUES ($1, $2, NOW())`,
      [listId, comicId]
    );
    res.status(201).send('Comic added to list');
  } catch (error) {
    console.error('Error adding comic:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router; 