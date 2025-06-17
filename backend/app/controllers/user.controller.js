/**
 * © 2025 Niolla. All rights reserved.
 *
 * This file is part of the Niolla software project and is intended for internal use only.
 * Unauthorized copying, modification, distribution, or disclosure of this file,
 * via any medium, is strictly prohibited without written permission from Niolla.
 *
 * For inquiries, contact: support@niolla.lk
 */

// app/controllers/user.controller.js

const db = require('../models');
const User = db.User;

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: err.message,
    });
  }
};

