const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Habilidade = sequelize.define('Habilidade', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Habilidade;
