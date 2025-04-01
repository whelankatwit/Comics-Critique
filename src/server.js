import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import client from 'prom-client';

const app = express();
const port = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics()


app.use(cors());
app.use(express.json());

//PostgreSQL client connection pool
const pool = new Pool({
  user: 'postgres',
  host: '::1', 
  database: 'Comics Critique',
  password: 'Merrimack00!',
  port: 5432,
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Retrieve full comics list
app.get('/api/comics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comics');
    res.json(result.rows);  // Send the result as a JSON response
  } catch (error) {
    console.error('Error fetching data', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve specific comic
app.get('/api/comics/:id', async (req, res) => {
  const comicId = req.params.id;
  console.log('comicId:', comicId);

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

// Write review for comic
app.post('/api/reviews', async (req, res) => {
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

// Log in
app.post('/api/login', async (req, res) => {
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

// Retrieve reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.user_id, r.review_text, r.rating, r.created_at, u.username, c.title, c.cover_url, (SELECT COUNT(*) FROM likes l WHERE l.target_id = r.id) AS like_count
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN comics c ON r.comic_id = c.id
      ORDER BY r.id DESC
    `);

    res.json(result.rows);  // Send reviews as JSON response
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Like Review
app.post('/api/reviews/:id/like', async (req, res) => {
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

//Retrieve Likes
app.post('/api/likes', async (req, res) => {
  const { reviewId, userId } = req.body;

  if (!reviewId || !userId) {
    return res.status(400).json({ message: 'Missing reviewId or userId.' });
  }

  try {
    // Check if the like already exists to prevent duplicate likes
    const checkLike = await pool.query(
      'SELECT * FROM likes WHERE target_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (checkLike.rows.length > 0) {
      return res.status(400).json({ message: 'You already liked this review.' });
    }

    // Insert the new like
    const result = await pool.query(
      'INSERT INTO likes (target_id, user_id) VALUES ($1, $2) RETURNING *',
      [reviewId, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Popular comics
app.get('/api/top-comics', async (req, res) => {
  try {
    const result = await pool.query(
      `
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
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top-rated comics:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Follow
app.post('/api/follow', async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: 'Missing data.' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) 
      DO NOTHING
      `,
      [followerId, followingId]
    );

    res.status(201).json({ message: 'Followed successfully.' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Unfollow
app.delete('/api/unfollow', async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: 'Missing data.' });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM follows
      WHERE follower_id = $1 AND following_id = $2
      `,
      [followerId, followingId]
    );

    res.status(200).json({ message: 'Unfollowed successfully.' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Check for follow
app.get('/api/is-following', async (req, res) => {
  const { followerId, followingId } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT * FROM follows
      WHERE follower_id = $1 AND following_id = $2
      `,
      [followerId, followingId]
    );

    res.json({ isFollowing: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve reviews from following only
app.get('/api/following/reviews/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
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
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching followed reviews:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch user lists
app.get('/api/lists/:userId', async (req, res) => {
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

// Add comic to list
app.post('/api/list_comics', async (req, res) => {
  const { listId, comicId } = req.body;
  try {
    await pool.query(
      `INSERT INTO list_comics (list_id, comic_id, created_at) VALUES ($1, $2, NOW())`,
      [listId, comicId]
    );
    res.status(201).send('Comic added to list');
  } catch (error) {
    console.error('Error adding comic:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get list details
app.get('/api/lists/:listId', async (req, res) => {
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
app.get('/api/list_comics/:listId', async (req, res) => {
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

// Create List
app.post('/api/lists', async (req, res) => {
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

// Allows writing to Prometheus
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Expose metrics at /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:5000`);
});