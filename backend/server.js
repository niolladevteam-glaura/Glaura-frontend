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


// Allowed origins
const allowedOrigins = [
  'http://localhost:3000', // local development
  'http://127.0.0.1:3000', // local development
  'http://192.168.0.100:5173' // replace with your local IP address and port
];


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

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => {
  console.log(`Server running --> http://localhost:${PORT}`);
});
