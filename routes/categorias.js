const express = require('express');
const { Categoria, Receita, Aluno, Habilidade } = require('../models');

const router = express.Router();

router.get('/categorias', async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    const rows = categorias
      .map(
        (categoria) => `
          <tr>
            <td>${categoria.id}</td>
            <td>${categoria.name}</td>
            <td><a href="/categorias/${categoria.id}">View Receitas</a></td>
          </tr>`
      )
      .join('');

    res.send(`
      <html>
        <head>
          <title>Categorias</title>
        </head>
        <body>
          <h1>Categorias</h1>
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
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to load categorias.');
  }
});

router.get('/categorias/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: {
        model: Receita,
        include: [Aluno]
      }
    });

    if (!categoria) {
      return res.status(404).send('Categoria not found.');
    }

    const rows = categoria.Receitas
      .map(
        (receita) => `
          <tr>
            <td>${receita.id}</td>
            <td>${receita.name}</td>
            <td>${receita.description || ''}</td>
            <td>${receita.externalLink || ''}</td>
            <td>${receita.Alunos.map((aluno) => aluno.name).join(', ')}</td>
          </tr>`
      )
      .join('');

    res.send(`
      <html>
        <head>
          <title>Receitas da Categoria ${categoria.name}</title>
        </head>
        <body>
          <h1>Receitas da Categoria: ${categoria.name}</h1>
          <a href="/categorias">Back to Categorias</a>
          <table border="1" cellpadding="8">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Description</th><th>Link</th><th>Alunos</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to load categoria receitas.');
  }
});

// Rota pública para filtrar receitas por categoria
router.get('/receitas/categoria', async (req, res) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.redirect('/');
    }

    const categoria = await Categoria.findByPk(categoryId, {
      include: {
        model: Receita,
        as: 'Receitas',
        include: [{ model: Aluno, as: 'Alunos' }]
      }
    });

    if (!categoria) {
      return res.redirect('/');
    }

    const receitasRows = categoria.Receitas
      .map((receita, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${receita.name}</strong></td>
          <td>${receita.description ? receita.description.substring(0, 60) + (receita.description.length > 60 ? '...' : '') : '-'}</td>
          <td>${receita.Alunos.map((aluno) => aluno.name).join(', ')}</td>
          <td>${receita.externalLink ? `<a href="${receita.externalLink}" target="_blank" class="link-btn">🔗 Ver</a>` : '-'}</td>
        </tr>`)
      .join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receitas - ${categoria.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }

            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              padding: 40px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }

            header {
              margin-bottom: 30px;
              text-align: center;
            }

            header h1 {
              color: #667eea;
              font-size: 2.5em;
              margin-bottom: 10px;
            }

            header p {
              color: #666;
              font-size: 1.1em;
            }

            .breadcrumb {
              margin-bottom: 20px;
              font-size: 0.95em;
            }

            .breadcrumb a {
              color: #667eea;
              text-decoration: none;
              margin-right: 10px;
            }

            .breadcrumb a:hover {
              text-decoration: underline;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            thead {
              background-color: #f5f5f5;
            }

            th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              color: #333;
              border-bottom: 2px solid #e0e0e0;
            }

            td {
              padding: 12px 15px;
              border-bottom: 1px solid #f0f0f0;
              color: #555;
            }

            tr:hover {
              background-color: #f9f9f9;
            }

            .link-btn {
              display: inline-block;
              padding: 6px 12px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 0.9em;
              transition: all 0.3s;
            }

            .link-btn:hover {
              background-color: #764ba2;
              transform: scale(1.05);
            }

            .empty-state {
              text-align: center;
              padding: 40px;
              color: #999;
            }

            .empty-state h3 {
              margin-bottom: 10px;
              color: #666;
            }

            .stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }

            .stat-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }

            .stat-card .number {
              font-size: 2.5em;
              font-weight: 700;
              margin-bottom: 5px;
            }

            .stat-card .label {
              font-size: 0.95em;
              opacity: 0.95;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>🍳 Receitas: ${categoria.name}</h1>
              <p>Veja todas as receitas nesta categoria</p>
            </header>

            <div class="breadcrumb">
              <a href="/">← Voltar</a>
            </div>

            ${categoria.Receitas.length > 0 ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="number">${categoria.Receitas.length}</div>
                  <div class="label">Receitas Nesta Categoria</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome da Receita</th>
                    <th>Descrição</th>
                    <th>Criada por</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  ${receitasRows}
                </tbody>
              </table>
            ` : `
              <div class="empty-state">
                <h3>📭 Nenhuma receita nesta categoria</h3>
                <p>Ainda não há receitas cadastradas na categoria "${categoria.name}".</p>
              </div>
            `}
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to load receitas filtradas.');
  }
});

router.get('/relatorio', async (req, res) => {
  try {
    const totalAlunos = await Aluno.count();
    const habilidades = await Habilidade.findAll({
      include: {
        model: Aluno,
        attributes: ['id'],
        through: { attributes: [] }
      }
    });

    const habilidadesRows = habilidades
      .map((habilidade) => {
        const count = habilidade.Alunos ? habilidade.Alunos.length : 0;
        const percentage = totalAlunos === 0 ? 0 : ((count / totalAlunos) * 100).toFixed(1);
        const barWidth = percentage;
        return `
          <tr>
            <td><strong>${habilidade.name}</strong></td>
            <td>${count} / ${totalAlunos}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${barWidth}%"></div>
                <span class="progress-text">${percentage}%</span>
              </div>
            </td>
          </tr>`;
      })
      .join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Relatório de Habilidades</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }

            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              padding: 40px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }

            header {
              margin-bottom: 30px;
              text-align: center;
            }

            header h1 {
              color: #667eea;
              font-size: 2.5em;
              margin-bottom: 10px;
            }

            header p {
              color: #666;
              font-size: 1.1em;
            }

            .breadcrumb {
              margin-bottom: 20px;
              font-size: 0.95em;
            }

            .breadcrumb a {
              color: #667eea;
              text-decoration: none;
              margin-right: 10px;
            }

            .breadcrumb a:hover {
              text-decoration: underline;
            }

            .info-section {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              border-left: 4px solid #667eea;
            }

            .info-section h3 {
              color: #333;
              margin-bottom: 10px;
            }

            .info-section p {
              color: #666;
              line-height: 1.6;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            thead {
              background-color: #f5f5f5;
            }

            th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              color: #333;
              border-bottom: 2px solid #e0e0e0;
            }

            td {
              padding: 12px 15px;
              border-bottom: 1px solid #f0f0f0;
              color: #555;
            }

            tr:hover {
              background-color: #f9f9f9;
            }

            /* Progress Bar */
            .progress-bar {
              position: relative;
              height: 35px;
              background-color: #f0f0f0;
              border-radius: 17px;
              overflow: hidden;
              display: flex;
              align-items: center;
            }

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
              transition: width 0.5s ease;
            }

            .progress-text {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              color: #333;
              font-weight: 600;
              font-size: 0.95em;
              z-index: 1;
              text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
            }

            .stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }

            .stat-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }

            .stat-card .number {
              font-size: 2.5em;
              font-weight: 700;
              margin-bottom: 5px;
            }

            .stat-card .label {
              font-size: 0.95em;
              opacity: 0.95;
            }

            .empty-state {
              text-align: center;
              padding: 40px;
              color: #999;
            }

            .empty-state h3 {
              margin-bottom: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>⭐ Relatório de Habilidades Culinárias</h1>
              <p>Veja a proporção de alunos que dominam cada habilidade</p>
            </header>

            <div class="breadcrumb">
              <a href="/">← Voltar</a>
            </div>

            <div class="info-section">
              <h3>📊 Sobre este relatório</h3>
              <p>Este relatório mostra quantos alunos do sistema têm cada habilidade culinária cadastrada. 
              É uma ótima forma de ver quais são as habilidades mais comuns entre os alunos.</p>
            </div>

            ${habilidades.length > 0 ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="number">${totalAlunos}</div>
                  <div class="label">Total de Alunos</div>
                </div>
                <div class="stat-card">
                  <div class="number">${habilidades.length}</div>
                  <div class="label">Habilidades</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Habilidade</th>
                    <th>Alunos com Habilidade</th>
                    <th>Proporção (%)</th>
                  </tr>
                </thead>
                <tbody>
                  ${habilidadesRows}
                </tbody>
              </table>
            ` : `
              <div class="empty-state">
                <h3>📭 Nenhuma habilidade cadastrada</h3>
                <p>Ainda não há habilidades registradas no sistema.</p>
              </div>
            `}
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to load relatorio.');
  }
});

module.exports = router;
