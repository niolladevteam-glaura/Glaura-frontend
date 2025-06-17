/**
 * © 2025 Niolla. All rights reserved.
 *
 * This file is part of the Niolla software project and is intended for internal use only.
 * Unauthorized copying, modification, distribution, or disclosure of this file,
 * via any medium, is strictly prohibited without written permission from Niolla.
 *
 * For inquiries, contact: support@niolla.lk
 */

// app/models/perms.model.js

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'User', // must match tableName of User model
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_management: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    system_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reports_access: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    audit_logs: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    create_port_calls: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    edit_port_calls: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delete_port_calls: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    view_port_calls: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    assign_port_calls: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    create_customers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    edit_customers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    view_customers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delete_customers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    create_vendors: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    edit_vendors: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    view_vendors: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delete_vendors: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    create_documents: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    edit_documents: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    view_documents: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delete_documents: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    send_messages: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    view_messages: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    whatsApp_access: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    manage_phone_book: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    manage_vessels: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    clearance_operations: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    bunkering_operations: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    view_disbursements: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    create_disbursements: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    invoicing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  });

  return Permission;
};
