/**
 * © 2025 Niolla. All rights reserved.
 *
 * This file is part of the Niolla software project and is intended for internal use only.
 * Unauthorized copying, modification, distribution, or disclosure of this file,
 * via any medium, is strictly prohibited without written permission from Niolla.
 *
 * For inquiries, contact: support@niolla.lk
 */

// app/models/index.js

const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('./user.model')(sequelize, DataTypes);
db.Permission = require('./perms.model')(sequelize, DataTypes);

// Set up associations correctly
db.User.hasOne(db.Permission, {
  foreignKey: 'user_id',
  as: 'permissions',
  onDelete: 'CASCADE'
});

db.Permission.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = db;
