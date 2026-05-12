const express = require('express');
const bcrypt = require('bcryptjs');
const { Aluno, Habilidade, Receita, Categoria } = require('../models');

const router = express.Router();

router.get('/login', async (req, res) => {
  try {
    // 1. Captura o filtro da URL
    const { categoriaNome } = req.query;

    // 2. Busca dados para o Relatório de Habilidades
    const totalAlunos = await Aluno.count();
    const habilidades = await Habilidade.findAll({
      include: [{ model: Aluno, as: 'Alunos' }]
    });

    const relatorioHabilidades = habilidades.map(hab => {
      const quantidadeAlunos = hab.Alunos ? hab.Alunos.length : 0;
      return {
        nome: hab.name,
        // Proporção: (alunos com a habilidade / total de alunos) * 100
        proporcao: totalAlunos > 0 ? (quantidadeAlunos / totalAlunos) * 100 : 0,
        quantidade: quantidadeAlunos
      };
    });

    // 3. Busca Receitas (com filtro opcional) e Categorias
    let includeCondition = { 
      model: Categoria, 
      as: 'Categorias' 
    };

    if (categoriaNome) {
      includeCondition.where = { name: categoriaNome };
    }

    const [receitas, categorias] = await Promise.all([
      Receita.findAll({
        include: [{ model: Aluno, as: 'Alunos' }, includeCondition]
      }),
      Categoria.findAll()
    ]);

    
    if (req.session && req.session.alunoId) {
      if (req.session.isAdmin || req.session.alunoId === 1) {
        return res.redirect('/admin/alunos');
      }
      return res.redirect('/aluno/receitas');
    }

   
    res.render('login', { 
      receitas, 
      categorias, 
      categoriaSelecionada: categoriaNome || '', 
      relatorioHabilidades,
      totalAlunos
    });
  } catch (error) {
    console.error('Erro na rota /login:', error);
    res.status(500).send('Erro ao carregar página de login');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    const aluno = await Aluno.findOne({ where: { email } });
    if (!aluno) {
      return res.status(401).send('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, aluno.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password.');
    }

    req.session.alunoId = aluno.id;
    req.session.alunoName = aluno.name;

    // Redirect based on admin status
    if (aluno.email === 'admin@example.com') {
      return res.redirect('/admin/alunos');
    } else {
      return res.redirect('/aluno/receitas');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('An error occurred while logging in.');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Unable to log out.');
    }

    res.redirect('/login');
  });
});

module.exports = router;
