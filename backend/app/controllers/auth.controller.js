/**
 * © 2025 Niolla. All rights reserved.
 *
 * This file is part of the Niolla software project and is intended for internal use only.
 * Unauthorized copying, modification, distribution, or disclosure of this file,
 * via any medium, is strictly prohibited without written permission from Niolla.
 *
 * For inquiries, contact: support@niolla.lk
 */

// controllers/auth.controller.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Permission } = require("../models"); // adjust if your import is different

const SECRET_KEY = process.env.JWT_SECRET || "niolla-secret"; // Store in .env for security

// POST /signin
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Signin attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({
      where: { email },
    });

    const userPermissions = await Permission.findOne({ where: { user_id: user.user_id }, attributes: { exclude: ['id', 'user_id', 'createdAt', 'updatedAt'] } });



    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        access_level: user.access_level,
      },
      permissions: userPermissions || { message: "No permissions found" }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /signout (stateless for JWT - just a placeholder)
exports.signout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Signout endpoint hit. Just clear token on client-side.",
  });
};
