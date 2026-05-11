const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Aluno = sequelize.define('Aluno', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: async (aluno) => {
      if (aluno.password) {
        const salt = await bcrypt.genSalt(10);
        aluno.password = await bcrypt.hash(aluno.password, salt);
      }
    }
  }
});

module.exports = Aluno;
