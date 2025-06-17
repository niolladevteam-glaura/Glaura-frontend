/**
 * © 2025 Niolla. All rights reserved.
 *
 * This file is part of the Niolla software project and is intended for internal use only.
 * Unauthorized copying, modification, distribution, or disclosure of this file,
 * via any medium, is strictly prohibited without written permission from Niolla.
 *
 * For inquiries, contact: support@niolla.lk
 */

// server.js

require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./app/models');
const userRoutes = require('./app/routes/user.routes');
const authRoutes = require('./app/routes/auth.routes');

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
