const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);
app.use(flash());

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const alunoRoutes = require('./routes/aluno');
const categoriasRoutes = require('./routes/categorias');
const { Receita, Categoria, Aluno, Habilidade, AlunoHabilidade } = require('./models');

app.use('/', authRoutes);
app.use(adminRoutes);
app.use(alunoRoutes);
app.use(categoriasRoutes);

// ROTAS PÚBLICAS - Visualização de Receitas
app.get('/', async (req, res) => {
  try {
    const receitas = await Receita.findAll({
      include: [{ model: Categoria, as: 'Categorias' }, { model: Aluno, as: 'Alunos' }]
    });
    const categorias = await Categoria.findAll();
    const totalAlunos = await Aluno.count();
    const habilidades = await Habilidade.findAll({
      include: {
        model: Aluno,
        attributes: ['id'],
        through: { attributes: [] }
      }
    });

    const receitasRows = receitas
      .map((receita, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${receita.name}</strong></td>
          <td>${receita.description ? receita.description.substring(0, 60) + (receita.description.length > 60 ? '...' : '') : '-'}</td>
          <td>${receita.Categorias.map((cat) => `<span class="badge">${cat.name}</span>`).join('')}</td>
          <td>${receita.Alunos.map((aluno) => aluno.name).join(', ')}</td>
          <td>${receita.externalLink ? `<a href="${receita.externalLink}" target="_blank" class="link-btn">🔗 Ver</a>` : '-'}</td>
        </tr>`)
      .join('');

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
          <title>🍳 Sistema de Receitas Culinárias</title>
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
              max-width: 1400px;
              margin: 0 auto;
            }

            /* Header */
            header {
              background: white;
              padding: 30px;
              border-radius: 10px;
              margin-bottom: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

            /* Main Layout */
            .main-layout {
              display: grid;
              grid-template-columns: 350px 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }

            /* Login Card */
            .login-card {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              height: fit-content;
              position: sticky;
              top: 20px;
            }

            .login-card h2 {
              color: #333;
              margin-bottom: 20px;
              font-size: 1.5em;
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .login-card form div {
              margin-bottom: 15px;
            }

            .login-card label {
              display: block;
              margin-bottom: 5px;
              color: #555;
              font-weight: 500;
              font-size: 0.95em;
            }

            .login-card input {
              width: 100%;
              padding: 10px 12px;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              font-size: 1em;
              transition: border-color 0.3s;
            }

            .login-card input:focus {
              outline: none;
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .login-card button {
              width: 100%;
              padding: 12px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 1em;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
              margin-top: 10px;
            }

            .login-card button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
            }

            /* Content Tabs */
            .content-card {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .tabs {
              display: flex;
              border-bottom: 2px solid #e0e0e0;
              background-color: #f9f9f9;
            }

            .tab-button {
              flex: 1;
              padding: 15px 20px;
              background: none;
              border: none;
              cursor: pointer;
              font-size: 1em;
              font-weight: 500;
              color: #666;
              transition: all 0.3s;
              border-bottom: 3px solid transparent;
              margin-bottom: -2px;
            }

            .tab-button.active {
              color: #667eea;
              border-bottom-color: #667eea;
              background-color: white;
            }

            .tab-button:hover {
              color: #667eea;
              background-color: #fafafa;
            }

            .tab-content {
              display: none;
              padding: 30px;
              animation: fadeIn 0.3s;
            }

            .tab-content.active {
              display: block;
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            /* Table Styles */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
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

            /* Badge Styles */
            .badge {
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 0.85em;
              margin-right: 5px;
              margin-bottom: 5px;
            }

            .badge.filter {
              background-color: #764ba2;
              padding: 6px 12px;
              font-size: 0.9em;
              cursor: pointer;
              transition: all 0.3s;
            }

            .badge.filter:hover {
              background-color: #667eea;
              transform: scale(1.05);
            }

            /* Filter Section */
            .filter-section {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #667eea;
            }

            .filter-section h3 {
              margin-bottom: 15px;
              color: #333;
            }

            .filter-form {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
            }

            .filter-form select {
              padding: 10px 15px;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              font-size: 1em;
              flex: 1;
              min-width: 200px;
              cursor: pointer;
              transition: border-color 0.3s;
            }

            .filter-form select:focus {
              outline: none;
              border-color: #667eea;
            }

            .filter-form button {
              padding: 10px 25px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              transition: transform 0.2s, box-shadow 0.2s;
            }

            .filter-form button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
            }

            /* Progress Bar */
            .progress-bar {
              position: relative;
              height: 30px;
              background-color: #f0f0f0;
              border-radius: 15px;
              overflow: hidden;
              display: flex;
              align-items: center;
            }

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
              transition: width 0.3s;
            }

            .progress-text {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              color: #333;
              font-weight: 600;
              font-size: 0.9em;
              z-index: 1;
            }

            /* Link Button */
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

            /* Empty State */
            .empty-state {
              text-align: center;
              padding: 40px;
              color: #999;
            }

            .empty-state h3 {
              margin-bottom: 10px;
              color: #666;
            }

            /* Stats */
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

            /* Responsive */
            @media (max-width: 768px) {
              .main-layout {
                grid-template-columns: 1fr;
              }

              .login-card {
                position: relative;
                top: 0;
              }

              header h1 {
                font-size: 2em;
              }

              .tabs {
                flex-wrap: wrap;
              }

              .tab-button {
                flex: 1;
                min-width: 120px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>🍳 Sistema de Receitas Culinárias</h1>
              <p>Descubra receitas deliciosas e aprenda com os melhores alunos chefs</p>
            </header>

            <div class="main-layout">
              <!-- Coluna Esquerda: Login -->
              <div class="login-card">
                <h2>🔐 Fazer Login</h2>
                <form method="POST" action="/login">
                  <div>
                    <label for="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="seu@email.com"
                      required 
                    />
                  </div>
                  <div>
                    <label for="password">Senha</label>
                    <input 
                      type="password" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••"
                      required 
                    />
                  </div>
                  <button type="submit">Entrar no Sistema</button>
                </form>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
                <div style="font-size: 0.9em; color: #666; text-align: center;">
                  <p><strong>Dados de Teste:</strong></p>
                  <p><strong>Admin:</strong><br>admin@example.com</p>
                  <p><strong>Aluno:</strong><br>aluno1@example.com</p>
                </div>
              </div>

              <!-- Coluna Direita: Conteúdo com Abas -->
              <div class="content-card">
                <div class="tabs">
                  <button class="tab-button active" onclick="showTab(event, 'receitas')">📖 Todas as Receitas</button>
                  <button class="tab-button" onclick="showTab(event, 'filtro')">🔍 Filtrar por Categoria</button>
                  <button class="tab-button" onclick="showTab(event, 'habilidades')">⭐ Habilidades Dominadas</button>
                </div>

                <!-- Tab: Receitas -->
                <div id="receitas" class="tab-content active">
                  <div class="stats">
                    <div class="stat-card">
                      <div class="number">${receitas.length}</div>
                      <div class="label">Receitas Cadastradas</div>
                    </div>
                    <div class="stat-card">
                      <div class="number">${categorias.length}</div>
                      <div class="label">Categorias</div>
                    </div>
                    <div class="stat-card">
                      <div class="number">${totalAlunos}</div>
                      <div class="label">Alunos Cadastrados</div>
                    </div>
                  </div>

                  ${receitas.length > 0 ? `
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nome da Receita</th>
                          <th>Descrição</th>
                          <th>Categorias</th>
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
                      <h3>📭 Nenhuma receita cadastrada</h3>
                      <p>Faça login para cadastrar suas receitas favoritas!</p>
                    </div>
                  `}
                </div>

                <!-- Tab: Filtro por Categoria -->
                <div id="filtro" class="tab-content">
                  <div class="filter-section">
                    <h3>🔎 Selecione uma categoria para filtrar receitas</h3>
                    <form method="GET" action="/receitas/categoria" class="filter-form">
                      <select name="categoryId" required>
                        <option value="">-- Escolha uma categoria --</option>
                        ${categorias.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                      </select>
                      <button type="submit">🔍 Filtrar</button>
                    </form>
                  </div>
                  <p style="margin-top: 20px; color: #666;">
                    <strong>💡 Dica:</strong> Selecione uma categoria acima para ver apenas as receitas daquela categoria.
                  </p>
                </div>

                <!-- Tab: Habilidades -->
                <div id="habilidades" class="tab-content">
                  <p style="margin-bottom: 20px; color: #666;">
                    <strong>📊 Proporção de alunos que dominam cada habilidade culinária:</strong>
                  </p>
                  
                  ${habilidades.length > 0 ? `
                    <table>
                      <thead>
                        <tr>
                          <th>Habilidade</th>
                          <th>Alunos</th>
                          <th>Domínio (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${habilidadesRows}
                      </tbody>
                    </table>
                  ` : `
                    <div class="empty-state">
                      <h3>📭 Nenhuma habilidade registrada</h3>
                      <p>Ainda não há habilidades cadastradas no sistema.</p>
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>

          <script>
            function showTab(event, tabId) {
              // Esconder todos os tabs
              const tabs = document.querySelectorAll('.tab-content');
              tabs.forEach(tab => tab.classList.remove('active'));

              // Remover classe active de todos os botões
              const buttons = document.querySelectorAll('.tab-button');
              buttons.forEach(btn => btn.classList.remove('active'));

              // Mostrar tab selecionado
              document.getElementById(tabId).classList.add('active');
              event.target.classList.add('active');
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar página: ' + error.message);
  }
});

// Visualizar receitas por categoria
app.get('/receitas/categoria', async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    
    if (!categoryId) {
      return res.redirect('/');
    }

    const categoria = await Categoria.findByPk(categoryId);
    if (!categoria) {
      return res.status(404).send('Categoria não encontrada.');
    }

    const receitas = await Receita.findAll({
      include: [
        { model: Categoria, as: 'Categorias' },
        { model: Aluno, as: 'Alunos' }
      ]
    });

    // Filtrar receitas da categoria
    const receitasFiltradas = receitas.filter(r => 
      r.Categorias.some(cat => cat.id == categoryId)
    );

    const rows = receitasFiltradas
      .map(
        (receita) => `
          <tr>
            <td>${receita.id}</td>
            <td>${receita.name}</td>
            <td>${receita.description ? receita.description.substring(0, 50) + (receita.description.length > 50 ? '...' : '') : '-'}</td>
            <td>${receita.externalLink ? `<a href="${receita.externalLink}" target="_blank">Link</a>` : '-'}</td>
            <td>${receita.Categorias.map((cat) => cat.name).join(', ')}</td>
            <td>${receita.Alunos.map((aluno) => aluno.name).join(', ')}</td>
          </tr>`
      )
      .join('');

    const todasCategorias = await Categoria.findAll();

    res.send(`
      <html>
        <head>
          <title>Receitas - ${categoria.name}</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            nav { background-color: #f0f0f0; padding: 15px; margin-bottom: 20px; border-bottom: 1px solid #ccc; border-radius: 4px; }
            nav a { margin-right: 20px; color: #0066cc; text-decoration: none; }
            nav a:hover { text-decoration: underline; }
            h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .filter-section { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #0066cc; }
            select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button[type="submit"] { padding: 8px 15px; background-color: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button[type="submit"]:hover { background-color: #0052a3; }
            .empty { text-align: center; color: #999; padding: 30px; font-style: italic; }
          </style>
        </head>
        <body>
          <nav>
            <a href="/">← Voltar</a> |
            <a href="/relatorio">Relatório de Habilidades</a>
          </nav>
          
          <h1>📖 Receitas da Categoria: <strong>${categoria.name}</strong></h1>
          
          <div class="filter-section">
            <h3>Mudar de Categoria</h3>
            <form method="GET" action="/receitas/categoria" style="display: inline;">
              <select name="categoryId" required>
                <option value="">-- Selecione uma categoria --</option>
                ${todasCategorias.map((cat) => `<option value="${cat.id}" ${cat.id == categoryId ? 'selected' : ''}>${cat.name}</option>`).join('')}
              </select>
              <button type="submit">Filtrar</button>
            </form>
          </div>

          ${rows ? `
            <p><strong>${receitasFiltradas.length}</strong> receita(s) encontrada(s)</p>
            <table>
              <thead>
                <tr><th>#</th><th>Nome</th><th>Descrição</th><th>Link</th><th>Categorias</th><th>Criada por</th></tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          ` : `
            <div class="empty">Nenhuma receita cadastrada nesta categoria.</div>
          `}
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar receitas: ' + error.message);
  }
});

// Relatório de Habilidades
app.get('/relatorio', async (req, res) => {
  try {
    const habilidades = await Habilidade.findAll();
    const totalAlunos = await Aluno.count();

    let relatorioRows = '';
    
    for (const habilidade of habilidades) {
      const alunosComHabilidade = await habilidade.countAlunos();
      const percentual = totalAlunos > 0 ? ((alunosComHabilidade / totalAlunos) * 100).toFixed(1) : 0;
      const barWidth = percentual * 2; // Para visualização em pixel

      relatorioRows += `
        <tr>
          <td>${habilidade.name}</td>
          <td style="text-align: center;">${alunosComHabilidade}/${totalAlunos}</td>
          <td>
            <div style="background-color: #eee; width: 300px; height: 25px; border-radius: 4px; overflow: hidden;">
              <div style="background-color: #4CAF50; width: ${percentual}%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                ${percentual > 5 ? percentual + '%' : ''}
              </div>
            </div>
          </td>
          <td style="text-align: center; font-weight: bold;">${percentual}%</td>
        </tr>
      `;
    }

    res.send(`
      <html>
        <head>
          <title>Relatório de Habilidades</title>
          <style>
            body { font-family: Arial; margin: 20px; background-color: #f5f5f5; }
            nav { background-color: #f0f0f0; padding: 15px; margin-bottom: 20px; border-bottom: 1px solid #ccc; border-radius: 4px; }
            nav a { margin-right: 20px; color: #0066cc; text-decoration: none; }
            nav a:hover { text-decoration: underline; }
            .container { max-width: 1000px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 20px; }
            .info-box { background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #4CAF50; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #4CAF50; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .empty { text-align: center; color: #999; padding: 30px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <nav>
              <a href="/">← Voltar</a>
            </nav>
            
            <h1>📊 Relatório de Habilidades Culinárias</h1>
            
            <div class="info-box">
              <h2>Resumo</h2>
              <p><strong>Total de alunos no sistema:</strong> ${totalAlunos}</p>
              <p><strong>Total de habilidades cadastradas:</strong> ${habilidades.length}</p>
            </div>

            ${relatorioRows ? `
              <h2>Proporção de Alunos por Habilidade</h2>
              <table>
                <thead>
                  <tr><th>Habilidade</th><th>Alunos</th><th>Progresso Visual</th><th>Percentual</th></tr>
                </thead>
                <tbody>
                  ${relatorioRows}
                </tbody>
              </table>
            ` : `
              <div class="empty">Nenhuma habilidade cadastrada no sistema.</div>
            `}
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar relatório: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
