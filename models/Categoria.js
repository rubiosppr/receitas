const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Categoria;
