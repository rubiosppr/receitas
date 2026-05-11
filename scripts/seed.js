const { sequelize, Aluno, Categoria, Habilidade, Receita } = require('../models');

(async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true }); // Use force: true to reset tables

    // Create Alunos (including 1 admin)
    const alunos = await Promise.all([
      Aluno.create({ name: 'Admin User', email: 'admin@example.com', password: 'admin123' }),
      Aluno.create({ name: 'Aluno 1', email: 'aluno1@example.com', password: 'password1' }),
      Aluno.create({ name: 'Aluno 2', email: 'aluno2@example.com', password: 'password2' }),
      Aluno.create({ name: 'Aluno 3', email: 'aluno3@example.com', password: 'password3' })
    ]);

    // Create Categorias
    const categorias = await Promise.all([
      Categoria.create({ name: 'Doce' }),
      Categoria.create({ name: 'Salgado' }),
      Categoria.create({ name: 'Vegetariano' }),
      Categoria.create({ name: 'Carnes' })
    ]);

    // Create Habilidades
    const habilidades = await Promise.all([
      Habilidade.create({ name: 'Cozinhar' }),
      Habilidade.create({ name: 'Assar' }),
      Habilidade.create({ name: 'Fritar' }),
      Habilidade.create({ name: 'Cortar' }),
      Habilidade.create({ name: 'Temperar' })
    ]);

    // Create Receitas and link to categorias and alunos
    const receitas = await Promise.all([
      Receita.create({ name: 'Bolo de Chocolate', description: 'Um bolo delicioso', externalLink: 'http://example.com/bolo' }),
      Receita.create({ name: 'Salada de Tomate', description: 'Salada fresca', externalLink: 'http://example.com/salada' }),
      Receita.create({ name: 'Frango Assado', description: 'Frango suculento', externalLink: 'http://example.com/frango' }),
      Receita.create({ name: 'Pudim', description: 'Sobremesa cremosa', externalLink: 'http://example.com/pudim' }),
      Receita.create({ name: 'Macarrão ao Molho', description: 'Massa italiana', externalLink: 'http://example.com/macarrao' }),
      Receita.create({ name: 'Sopa de Legumes', description: 'Sopa saudável', externalLink: 'http://example.com/sopa' })
    ]);

    // Link Receitas to Categorias (each to at least 2)
    await receitas[0].setCategorias([categorias[0], categorias[1]]); // Bolo: Doce, Salgado
    await receitas[1].setCategorias([categorias[2], categorias[3]]); // Salada: Vegetariano, Carnes
    await receitas[2].setCategorias([categorias[1], categorias[3]]); // Frango: Salgado, Carnes
    await receitas[3].setCategorias([categorias[0], categorias[2]]); // Pudim: Doce, Vegetariano
    await receitas[4].setCategorias([categorias[1], categorias[2]]); // Macarrão: Salgado, Vegetariano
    await receitas[5].setCategorias([categorias[2], categorias[3]]); // Sopa: Vegetariano, Carnes

    // Link Receitas to Alunos (each to at least 1)
    await receitas[0].setAlunos([alunos[0]]);
    await receitas[1].setAlunos([alunos[1]]);
    await receitas[2].setAlunos([alunos[2]]);
    await receitas[3].setAlunos([alunos[3]]);
    await receitas[4].setAlunos([alunos[0]]);
    await receitas[5].setAlunos([alunos[1]]);

    // Optionally, link some Habilidades to Alunos
    await alunos[0].addHabilidades([habilidades[0], habilidades[1]], { through: { level: 8 } });
    await alunos[1].addHabilidades([habilidades[2], habilidades[3]], { through: { level: 7 } });
    await alunos[2].addHabilidades([habilidades[4]], { through: { level: 9 } });
    await alunos[3].addHabilidades([habilidades[0], habilidades[2]], { through: { level: 6 } });

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to seed the database:', error);
    process.exit(1);
  }
})();
