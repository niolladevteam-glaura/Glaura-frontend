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
const Permission = db.Permission;

const generateUserId = require('../utils/generateUserId');

exports.createUser = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      first_name,
      last_name,
      contact_number,
      profile_picture,
      dob,
      email,
      password,
      role,
      access_level,
      permissions
    } = req.body;

    const user_id = await generateUserId(User);

    const user = await User.create({
      user_id,
      first_name,
      last_name,
      contact_number,
      profile_picture,
      dob,
      email,
      password,
      role,
      access_level
    }, { transaction: t });

    await Permission.create({
      user_id,
      ...permissions
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'User and permissions created successfully',
      data: user
    });

  } catch (err) {
    await t.rollback();
    res.status(500).json({
      success: false,
      error: err.message
    });
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

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
        const user = await User.findOne({
      where: { user_id: id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    const [updated] = await User.update(req.body, {
      where: { user_id: id }
    });

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found or no changes made`
      });
    }

    res.status(200).json({
      success: true,
      message: `User with ID ${id} updated successfully`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await User.destroy({
      where: { user_id: id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`
      });
    }

    await Permission.destroy({
      where: { user_id: id }
    });

    res.status(200).json({
      success: true,
      message: `User with ID ${id} deleted successfully`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
