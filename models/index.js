const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aluno = require('./Aluno');
const Categoria = require('./Categoria');
const Habilidade = require('./Habilidade');
const Receita = require('./Receita');

const AlunoHabilidade = sequelize.define('AlunoHabilidade', {
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10
    }
  }
}, { timestamps: false });

Receita.belongsToMany(Categoria, { through: 'ReceitaCategoria', as: 'Categorias' });
Categoria.belongsToMany(Receita, { through: 'ReceitaCategoria', as: 'Receitas' });

Receita.belongsToMany(Aluno, { through: 'ReceitaAluno', as: 'Alunos' });
Aluno.belongsToMany(Receita, { through: 'ReceitaAluno', as: 'Receitas' });

Aluno.belongsToMany(Habilidade, { through: AlunoHabilidade });
Habilidade.belongsToMany(Aluno, { through: AlunoHabilidade });

module.exports = {
  sequelize,
  Aluno,
  Categoria,
  Habilidade,
  Receita,
  AlunoHabilidade
};
