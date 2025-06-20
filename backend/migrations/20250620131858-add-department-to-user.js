'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'department', {
      type: Sequelize.STRING,
      allowNull: true, // or false if you want it required
      defaultValue: 'Other' // optional
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'department');
  }
};