import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.user_id, r.review_text, r.rating, r.created_at, 
             u.username, c.title, c.cover_url, 
             (SELECT COUNT(*) FROM likes l WHERE l.target_id = r.id) AS like_count
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN comics c ON r.comic_id = c.id
      ORDER BY r.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create review
router.post('/', async (req, res) => {
  const { comicId, userId, review, rating } = req.body;

  if (!comicId || !userId || !rating) {
    return res.status(400).json({ message: 'Missing Field.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (comic_id, user_id, review_text, rating) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [comicId, userId, review, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting review:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Like/Unlike review
router.post('/:id/like', async (req, res) => {
  const { userId } = req.body;
  const reviewId = req.params.id;

  try {
    const checkLike = await pool.query(
      'SELECT * FROM likes WHERE target_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (checkLike.rows.length === 0) {
      await pool.query(
        'INSERT INTO likes (target_id, user_id) VALUES ($1, $2)',
        [reviewId, userId]
      );
      res.status(201).send('Review liked');
    } else {
      await pool.query(
        'DELETE FROM likes WHERE target_id = $1 AND user_id = $2',
        [reviewId, userId]
      );
      res.status(200).send('Review unliked');
    }
  } catch (error) {
    console.error('Error liking/unliking review:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get reviews from following
router.get('/following/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        reviews.id,
        reviews.comic_id,
        reviews.user_id,
        reviews.review_text,
        reviews.rating,
        reviews.created_at,
        users.username,
        comics.title,
        comics.cover_url
      FROM reviews
      JOIN users ON reviews.user_id = users.id
      JOIN comics ON reviews.comic_id = comics.id
      WHERE reviews.user_id IN (
        SELECT following_id 
        FROM follows
        WHERE follower_id = $1
      )
      ORDER BY reviews.id DESC
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching followed reviews:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router; 