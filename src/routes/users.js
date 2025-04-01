import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password_hash = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Follow user
router.post('/follow', async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: 'Missing data.' });
  }

  try {
    await pool.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, following_id) 
       DO NOTHING`,
      [followerId, followingId]
    );
    res.status(201).json({ message: 'Followed successfully.' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Unfollow user
router.delete('/unfollow', async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: 'Missing data.' });
  }

  try {
    await pool.query(
      `DELETE FROM follows
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );
    res.status(200).json({ message: 'Unfollowed successfully.' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Check follow status
router.get('/is-following', async (req, res) => {
  const { followerId, followingId } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM follows
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );
    res.json({ isFollowing: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router; 