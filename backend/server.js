/**
 * © 2025 Niolla. All rights reserved.
 */

// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors'); // ✅ Import cors
const app = express();

const db = require('./app/models');
const userRoutes = require('./app/routes/user.routes');
const authRoutes = require('./app/routes/auth.routes');

// ✅ Setup CORS with .env origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Optional: allow cookies/auth headers
}));

app.use(express.json());

// Sync database
db.sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Failed to sync DB:', err);
});

app.get('/', (req, res) => {
  res.send('App with Sequelize and .env working!');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running --> http://localhost:${PORT}`);
});
