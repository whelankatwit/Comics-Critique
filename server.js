const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'comics_critique',
  password: 'postgres',
  port: 5432,
});

// JWT secret
const JWT_SECRET = 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Search comics endpoint
app.get('/api/comics/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = `
      SELECT * FROM comics 
      WHERE 
        LOWER(title) LIKE LOWER($1) OR
        LOWER(author) LIKE LOWER($1) OR
        LOWER(artist) LIKE LOWER($1) OR
        LOWER(synopsis) LIKE LOWER($1)
      ORDER BY title ASC
    `;

    const searchPattern = `%${query}%`;
    const result = await pool.query(searchQuery, [searchPattern]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching comics:', error);
    res.status(500).json({ message: 'Error searching comics' });
  }
});

// ... rest of existing routes ... 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 