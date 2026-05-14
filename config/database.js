const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  'receitas_db',
  'root',
  'senha',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: false,
      freezeTableName: true
    }
  }
);

module.exports = sequelize;
