const express = require('express');
const bcrypt = require('bcryptjs');
const { Aluno, Categoria, Habilidade } = require('../models');
const isAuthenticated = require('../middlewares/auth');

const router = express.Router();
router.use(isAuthenticated);

router.get('/admin/alunos', async (req, res) => {
  const alunos = await Aluno.findAll();
  res.render('admin/alunos', {
    alunos: alunos,
    alunoName: req.session.alunoName
  });
});

router.get('/admin/alunos/new', (req, res) => {
  res.render('admin/aluno-new', {
    alunoName: req.session.alunoName
  });
});

router.post('/admin/alunos', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await Aluno.create({ name, email, password });
    res.redirect('/admin/alunos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create aluno.');
  }
});

router.get('/admin/alunos/:id/edit', async (req, res) => {
  const aluno = await Aluno.findByPk(req.params.id);

  if (!aluno) {
    return res.status(404).send('Aluno not found.');
  }

  res.render('admin/aluno-edit', {
    aluno: aluno,
    alunoName: req.session.alunoName
  });
});

router.post('/admin/alunos/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).send('Aluno not found.');
    }

    const { name, email, password } = req.body;
    const updates = { name, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    await aluno.update(updates);
    res.redirect('/admin/alunos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to update aluno.');
  }
});

router.post('/admin/alunos/:id/delete', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).send('Aluno not found.');
    }

    await aluno.destroy();
    res.redirect('/admin/alunos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to delete aluno.');
  }
});

router.get('/admin/categorias', async (req, res) => {
  const categorias = await Categoria.findAll();
  res.render('admin/categorias', {
    categorias: categorias,
    alunoName: req.session.alunoName
  });
});

router.get('/admin/categorias/new', (req, res) => {
  res.render('admin/categoria-new', {
    alunoName: req.session.alunoName
  });
});

router.post('/admin/categorias', async (req, res) => {
  const { name } = req.body;

  try {
    await Categoria.create({ name });
    res.redirect('/admin/categorias');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create categoria.');
  }
});

router.get('/admin/categorias/:id/edit', async (req, res) => {
  const categoria = await Categoria.findByPk(req.params.id);

  if (!categoria) {
    return res.status(404).send('Categoria not found.');
  }

  res.render('admin/categoria-edit', {
    categoria: categoria,
    alunoName: req.session.alunoName
  });
});

router.post('/admin/categorias/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).send('Categoria not found.');
    }

    await categoria.update({ name: req.body.name });
    res.redirect('/admin/categorias');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to update categoria.');
  }
});

router.post('/admin/categorias/:id/delete', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).send('Categoria not found.');
    }

    await categoria.destroy();
    res.redirect('/admin/categorias');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to delete categoria.');
  }
});

router.get('/admin/habilidades', async (req, res) => {
  const habilidades = await Habilidade.findAll();
  res.render('admin/habilidades', {
    habilidades: habilidades,
    alunoName: req.session.alunoName
  });
});

router.get('/admin/habilidades/new', (req, res) => {
  res.render('admin/habilidade-new', {
    alunoName: req.session.alunoName
  });
});

router.post('/admin/habilidades', async (req, res) => {
  const { name } = req.body;

  try {
    await Habilidade.create({ name });
    res.redirect('/admin/habilidades');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create habilidade.');
  }
});

router.get('/admin/habilidades/:id/edit', async (req, res) => {
  const habilidade = await Habilidade.findByPk(req.params.id);

  if (!habilidade) {
    return res.status(404).send('Habilidade not found.');
  }

  res.render('admin/habilidade-edit', {
    habilidade: habilidade,
    alunoName: req.session.alunoName
  });
});

router.post('/admin/habilidades/:id', async (req, res) => {
  try {
    const habilidade = await Habilidade.findByPk(req.params.id);
    if (!habilidade) {
      return res.status(404).send('Habilidade not found.');
    }

    await habilidade.update({ name: req.body.name });
    res.redirect('/admin/habilidades');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to update habilidade.');
  }
});

router.post('/admin/habilidades/:id/delete', async (req, res) => {
  try {
    const habilidade = await Habilidade.findByPk(req.params.id);
    if (!habilidade) {
      return res.status(404).send('Habilidade not found.');
    }

    await habilidade.destroy();
    res.redirect('/admin/habilidades');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to delete habilidade.');
  }
});

module.exports = router;
