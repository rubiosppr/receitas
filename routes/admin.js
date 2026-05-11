const express = require('express');
const bcrypt = require('bcryptjs');
const { Aluno, Categoria, Habilidade } = require('../models');
const isAuthenticated = require('../middlewares/auth');

const router = express.Router();
router.use(isAuthenticated);

router.get('/admin/alunos', async (req, res) => {
  const alunos = await Aluno.findAll();

  const rows = alunos
    .map(
      (aluno) => `
        <tr>
          <td>${aluno.id}</td>
          <td>${aluno.name}</td>
          <td>${aluno.email}</td>
          <td>
            <a href="/admin/alunos/${aluno.id}/edit">Edit</a>
            <form method="POST" action="/admin/alunos/${aluno.id}/delete" style="display:inline">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>`
    )
    .join('');

  res.send(`
    <html>
      <head>
        <title>Alunos</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          table { border-collapse: collapse; }
          td, th { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/alunos">Alunos</a> | 
          <a href="/admin/categorias">Categorias</a> | 
          <a href="/admin/habilidades">Habilidades</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Alunos</h1>
        <a href="/admin/alunos/new">Novo Aluno</a>
        <table border="1" cellpadding="8">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `);
});

router.get('/admin/alunos/new', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Novo Aluno</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          form div { margin-bottom: 10px; }
          label { display: inline-block; width: 120px; font-weight: bold; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/alunos">Back to Alunos</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Novo Aluno</h1>
        <form method="POST" action="/admin/alunos">
          <div>
            <label>Name</label>
            <input type="text" name="name" required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" name="password" required />
          </div>
          <button type="submit">Create</button>
        </form>
      </body>
    </html>
  `);
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

  res.send(`
    <html>
      <head>
        <title>Edit Aluno</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          form div { margin-bottom: 10px; }
          label { display: inline-block; width: 120px; font-weight: bold; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/alunos">Back to Alunos</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Edit Aluno</h1>
        <form method="POST" action="/admin/alunos/${aluno.id}">
          <div>
            <label>Name</label>
            <input type="text" name="name" value="${aluno.name}" required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value="${aluno.email}" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" name="password" placeholder="Leave blank to keep current" />
          </div>
          <button type="submit">Update</button>
        </form>
      </body>
    </html>
  `);
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

  const rows = categorias
    .map(
      (categoria) => `
        <tr>
          <td>${categoria.id}</td>
          <td>${categoria.name}</td>
          <td>
            <a href="/admin/categorias/${categoria.id}/edit">Edit</a>
            <form method="POST" action="/admin/categorias/${categoria.id}/delete" style="display:inline">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>`
    )
    .join('');

  res.send(`
    <html>
      <head>
        <title>Categorias</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          table { border-collapse: collapse; }
          td, th { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/alunos">Alunos</a> | 
          <a href="/admin/categorias">Categorias</a> | 
          <a href="/admin/habilidades">Habilidades</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Categorias</h1>
        <a href="/admin/categorias/new">Nova Categoria</a>
        <table border="1" cellpadding="8">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `);
});

router.get('/admin/categorias/new', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Nova Categoria</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          form div { margin-bottom: 10px; }
          label { display: inline-block; width: 120px; font-weight: bold; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/categorias">Back to Categorias</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Nova Categoria</h1>
        <form method="POST" action="/admin/categorias">
          <div>
            <label>Name</label>
            <input type="text" name="name" required />
          </div>
          <button type="submit">Create</button>
        </form>
      </body>
    </html>
  `);
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

  res.send(`
    <html>
      <head>
        <title>Edit Categoria</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          form div { margin-bottom: 10px; }
          label { display: inline-block; width: 120px; font-weight: bold; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/categorias">Back to Categorias</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Edit Categoria</h1>
        <form method="POST" action="/admin/categorias/${categoria.id}">
          <div>
            <label>Name</label>
            <input type="text" name="name" value="${categoria.name}" required />
          </div>
          <button type="submit">Update</button>
        </form>
      </body>
    </html>
  `);
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

  const rows = habilidades
    .map(
      (habilidade) => `
        <tr>
          <td>${habilidade.id}</td>
          <td>${habilidade.name}</td>
          <td>
            <a href="/admin/habilidades/${habilidade.id}/edit">Edit</a>
            <form method="POST" action="/admin/habilidades/${habilidade.id}/delete" style="display:inline">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>`
    )
    .join('');

  res.send(`
    <html>
      <head>
        <title>Habilidades</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          table { border-collapse: collapse; }
          td, th { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/alunos">Alunos</a> | 
          <a href="/admin/categorias">Categorias</a> | 
          <a href="/admin/habilidades">Habilidades</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Habilidades</h1>
        <a href="/admin/habilidades/new">Nova Habilidade</a>
        <table border="1" cellpadding="8">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `);
});

router.get('/admin/habilidades/new', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Nova Habilidade</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          form div { margin-bottom: 10px; }
          label { display: inline-block; width: 120px; font-weight: bold; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/habilidades">Back to Habilidades</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Nova Habilidade</h1>
        <form method="POST" action="/admin/habilidades">
          <div>
            <label>Name</label>
            <input type="text" name="name" required />
          </div>
          <button type="submit">Create</button>
        </form>
      </body>
    </html>
  `);
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

  res.send(`
    <html>
      <head>
        <title>Edit Habilidade</title>
        <style>
          nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
          nav a { margin-right: 15px; }
          form div { margin-bottom: 10px; }
          label { display: inline-block; width: 120px; font-weight: bold; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/admin/habilidades">Back to Habilidades</a> | 
          <span>Logged in as: <strong>${req.session.alunoName || 'Admin'}</strong></span> | 
          <a href="/logout">Logout</a>
        </nav>
        <h1>Edit Habilidade</h1>
        <form method="POST" action="/admin/habilidades/${habilidade.id}">
          <div>
            <label>Name</label>
            <input type="text" name="name" value="${habilidade.name}" required />
          </div>
          <button type="submit">Update</button>
        </form>
      </body>
    </html>
  `);
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
