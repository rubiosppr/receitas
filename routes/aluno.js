const express = require('express');
const isAuthenticated = require('../middlewares/auth');
const { Receita, Categoria, Aluno, Habilidade } = require('../models');

const router = express.Router();
router.use(isAuthenticated);

router.get('/aluno/receitas', async (req, res) => {
  try {
    const receitas = await Receita.findAll({
      include: [
        { model: Categoria, as: 'Categorias' },
        { model: Aluno, as: 'Alunos' }
      ]
    });
    
    // Filtrar apenas as receitas do aluno logado
    const minhasReceitas = receitas.filter(receita => 
      receita.Alunos.some(aluno => aluno.id == req.session.alunoId)
    );
    
    const rows = minhasReceitas
      .map(
        (receita) => `
          <tr>
            <td>${receita.id}</td>
            <td>${receita.name}</td>
            <td>${receita.description ? receita.description.substring(0, 50) + (receita.description.length > 50 ? '...' : '') : ''}</td>
            <td>${receita.externalLink ? `<a href="${receita.externalLink}" target="_blank">Link</a>` : '-'}</td>
            <td>${receita.Categorias.map((cat) => cat.name).join(', ') || 'Nenhuma'}</td>\n            <td><small>${receita.Alunos.map((aluno) => aluno.name).join(', ')}</small></td>
            <td>
              <a href="/aluno/receitas/${receita.id}/edit">Editar</a> | 
              <form method="POST" action="/aluno/receitas/${receita.id}/delete" style="display:inline" onsubmit="return confirm('Tem certeza que deseja deletar?');">
                <button type="submit">Deletar</button>
              </form>
            </td>
          </tr>`
      )
      .join('');

    res.send(`
      <html>
        <head>
          <title>Minhas Receitas</title>
          <style>
            nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
            nav a { margin-right: 15px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            button { background: none; border: none; color: #0066cc; cursor: pointer; text-decoration: none; padding: 0; }
            button:hover { text-decoration: underline; }
            .nova-receita { display: inline-block; margin-bottom: 20px; padding: 10px 20px; background-color: #0066cc; color: white; border-radius: 4px; text-decoration: none; }
            .nova-receita:hover { background-color: #0052a3; }
            .vazio { text-align: center; color: #999; padding: 20px; }
          </style>
        </head>
        <body>
          <nav>
            <span>Logged in as: <strong>${req.session.alunoName || 'User'}</strong></span> | 
            <a href="/aluno/habilidades">Habilidades</a> |
            <a href="/logout">Logout</a>
          </nav>
          <h1>Minhas Receitas</h1>
          <a href="/aluno/receitas/new" class="nova-receita">+ Nova Receita</a>
          ${rows ? `
            <table>
              <thead>
                <tr><th>ID</th><th>Nome</th><th>Descrição</th><th>Link</th><th>Categorias</th><th>Alunos</th><th>Ações</th></tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          ` : `<div class="vazio">Você ainda não cadastrou receitas. <a href="/aluno/receitas/new">Crie uma agora!</a></div>`}
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar receitas: ' + error.message);
  }
});

router.get('/aluno/receitas/new', async (req, res) => {
  try {
    const categories = await Categoria.findAll();
    res.send(`
      <html>
        <head>
          <title>Nova Receita</title>
          <style>
            nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
            nav a { margin-right: 15px; }
            form { max-width: 600px; }
            form div { margin-bottom: 15px; }
            label { display: block; font-weight: bold; margin-bottom: 5px; }
            input[type="text"], textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; }
            textarea { min-height: 100px; resize: vertical; }
            select[multiple] { min-height: 120px; }
            button { padding: 10px 20px; background-color: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
            button:hover { background-color: #0052a3; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .info { color: #666; font-size: 12px; }
            .required { color: red; }
          </style>
        </head>
        <body>
          <nav>
            <a href="/aluno/receitas">← Voltar</a> | 
            <span>Logged in as: <strong>${req.session.alunoName || 'User'}</strong></span> | 
            <a href="/logout">Logout</a>
          </nav>
          <h1>Cadastrar Nova Receita</h1>
          <form method="POST" action="/aluno/receitas">
            <div>
              <label>Nome <span class="required">*</span></label>
              <input type="text" name="name" required placeholder="Ex: Bolo de Chocolate" />
            </div>
            <div>
              <label>Descrição</label>
              <textarea name="description" placeholder="Digite os ingredientes, modo de preparo, etc..."></textarea>
              <p class="info">Campo opcional</p>
            </div>
            <div>
              <label>Link Externo</label>
              <input type="url" name="externalLink" placeholder="Ex: https://www.exemplo.com/receita" />
              <p class="info">Cole aqui um link para a receita completa (opcional)</p>
            </div>
            <div>
              <label>Categorias</label>
              <select name="categoryIds" multiple title="Selecione uma ou mais categorias (Ctrl+Click)">
                ${categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join('')}
              </select>
              <p class="info">Selecione as categorias desta receita (opcional - use Ctrl+Click para múltiplas seleções)</p>
            </div>
            <button type="submit">Cadastrar Receita</button>
          </form>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to load new receita form.');
  }
});

router.post('/aluno/receitas', async (req, res) => {
  try {
    const { name, description, externalLink, categoryIds } = req.body;
    
    // Validar nome
    if (!name || name.trim() === '') {
      return res.status(400).send('O nome da receita é obrigatório.');
    }
    
    // Validar URL se fornecida
    if (externalLink && externalLink.trim() !== '') {
      try {
        new URL(externalLink);
      } catch {
        return res.status(400).send('URL inválida no campo "Link Externo".');
      }
    }
    
    const receita = await Receita.create({ 
      name: name.trim(), 
      description: description ? description.trim() : null, 
      externalLink: externalLink ? externalLink.trim() : null 
    });

    // Adicionar categorias selecionadas
    const selectedCategoryIds = categoryIds
      ? Array.isArray(categoryIds) ? categoryIds : [categoryIds]
      : [];
    
    if (selectedCategoryIds.length > 0) {
      await receita.setCategorias(selectedCategoryIds);
    }
    
    // Sempre associar o aluno logado à receita
    await receita.addAlunos(req.session.alunoId);

    req.flash('success', 'Receita cadastrada com sucesso!');
    return res.redirect('/aluno/receitas');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erro ao cadastrar receita: ' + error.message);
  }
});

router.get('/aluno/receitas/:id/edit', async (req, res) => {
  try {
    const receita = await Receita.findByPk(req.params.id, { 
      include: [
        { model: Categoria, as: 'Categorias' }, 
        { model: Aluno, as: 'Alunos' }
      ] 
    });
    
    if (!receita) {
      req.flash('error', 'Receita não encontrada.');
      return res.redirect('/aluno/receitas');
    }

    // Verificar se o aluno logado é o criador da receita
    const isCreator = receita.Alunos.some(aluno => aluno.id == req.session.alunoId);
    if (!isCreator) {
      req.flash('error', 'Você não tem permissão para editar esta receita.');
      return res.redirect('/aluno/receitas');
    }

    const categories = await Categoria.findAll();
    const alunos = await Aluno.findAll();
    const selectedCategoryIds = receita.Categorias.map((cat) => cat.id.toString());
    const selectedAlunoIds = receita.Alunos.map((aluno) => aluno.id.toString());

    res.send(`
      <html>
        <head>
          <title>Editar Receita</title>
          <style>
            nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
            nav a { margin-right: 15px; }
            form { max-width: 600px; }
            form div { margin-bottom: 15px; }
            label { display: block; font-weight: bold; margin-bottom: 5px; }
            input[type="text"], textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; box-sizing: border-box; }
            textarea { min-height: 100px; resize: vertical; }
            select[multiple] { min-height: 120px; }
            button { padding: 10px 20px; background-color: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 10px; }
            button:hover { background-color: #0052a3; }
            button.cancel { background-color: #999; }
            button.cancel:hover { background-color: #777; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .info { color: #666; font-size: 12px; }
            .required { color: red; }
          </style>
        </head>
        <body>
          <nav>
            <a href="/aluno/receitas">← Voltar</a> | 
            <span>Logged in as: <strong>${req.session.alunoName || 'User'}</strong></span> | 
            <a href="/logout">Logout</a>
          </nav>
          <h1>Editar Receita</h1>
          <form method="POST" action="/aluno/receitas/${receita.id}">
            <div>
              <label>Nome <span class="required">*</span></label>
              <input type="text" name="name" value="${receita.name.replace(/"/g, '&quot;')}" required />
            </div>
            <div>
              <label>Descrição</label>
              <textarea name="description">${receita.description ? receita.description.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</textarea>
              <p class="info">Campo opcional</p>
            </div>
            <div>
              <label>Link Externo</label>
              <input type="url" name="externalLink" value="${receita.externalLink ? receita.externalLink.replace(/"/g, '&quot;') : ''}" />
              <p class="info">Cole aqui um link para a receita completa (opcional)</p>
            </div>
            <div>
              <label>Categorias</label>
              <select name="categoryIds" multiple title="Selecione uma ou mais categorias (Ctrl+Click)">
                ${categories.map((cat) => {
                  const selected = selectedCategoryIds.includes(cat.id.toString()) ? 'selected' : '';
                  return `<option value="${cat.id}" ${selected}>${cat.name}</option>`;
                }).join('')}
              </select>
              <p class="info">Selecione as categorias desta receita (opcional - use Ctrl+Click para múltiplas seleções)</p>
            </div>
            <div>
              <label>Alunos Responsáveis</label>
              <select name="alunoIds" multiple title="Selecione um ou mais alunos (Ctrl+Click)">
                ${alunos.map((aluno) => {
                  const selected = selectedAlunoIds.includes(aluno.id.toString()) ? 'selected' : '';
                  return `<option value="${aluno.id}" ${selected}>${aluno.name}</option>`;
                }).join('')}
              </select>
              <p class="info">Selecione os alunos responsáveis por esta receita (use Ctrl+Click para múltiplas seleções)</p>
            </div>
            <button type="submit">Salvar Alterações</button>
            <a href="/aluno/receitas"><button type="button" class="cancel">Cancelar</button></a>
          </form>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar formulário de edição: ' + error.message);
  }
});

router.post('/aluno/receitas/:id', async (req, res) => {
  try {
    const receita = await Receita.findByPk(req.params.id, { 
      include: [
        { model: Categoria, as: 'Categorias' }, 
        { model: Aluno, as: 'Alunos' }
      ] 
    });
    
    if (!receita) {
      req.flash('error', 'Receita não encontrada.');
      return res.redirect('/aluno/receitas');
    }

    // Verificar se o aluno logado é o criador
    const isCreator = receita.Alunos.some(aluno => aluno.id == req.session.alunoId);
    if (!isCreator) {
      req.flash('error', 'Você não tem permissão para atualizar esta receita.');
      return res.redirect('/aluno/receitas');
    }

    const { name, description, externalLink, categoryIds, alunoIds } = req.body;
    
    // Validar nome
    if (!name || name.trim() === '') {
      return res.status(400).send('O nome da receita é obrigatório.');
    }
    
    // Validar URL se fornecida
    if (externalLink && externalLink.trim() !== '') {
      try {
        new URL(externalLink);
      } catch {
        return res.status(400).send('URL inválida no campo "Link Externo".');
      }
    }
    
    await receita.update({ 
      name: name.trim(), 
      description: description ? description.trim() : null, 
      externalLink: externalLink ? externalLink.trim() : null 
    });

    // Atualizar categorias
    const selectedCategoryIds = categoryIds
      ? Array.isArray(categoryIds) ? categoryIds : [categoryIds]
      : [];
    
    await receita.setCategorias(selectedCategoryIds);

    // Atualizar alunos responsáveis
    const selectedAlunoIds = alunoIds
      ? Array.isArray(alunoIds) ? alunoIds.map(id => Number(id)) : [Number(alunoIds)]
      : [];
    
    // Garantir que o aluno logado permaneça na receita
    if (!selectedAlunoIds.includes(req.session.alunoId)) {
      selectedAlunoIds.push(req.session.alunoId);
    }
    
    await receita.setAlunos(selectedAlunoIds);

    req.flash('success', 'Receita atualizada com sucesso!');
    return res.redirect('/aluno/receitas');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erro ao atualizar receita: ' + error.message);
  }
});

router.post('/aluno/receitas/:id/delete', async (req, res) => {
  try {
    const receita = await Receita.findByPk(req.params.id, { 
      include: [{ model: Aluno, as: 'Alunos' }] 
    });
    
    if (!receita) {
      req.flash('error', 'Receita não encontrada.');
      return res.redirect('/aluno/receitas');
    }

    // Verificar se o aluno logado é o criador
    const isCreator = receita.Alunos.some(aluno => aluno.id == req.session.alunoId);
    if (!isCreator) {
      req.flash('error', 'Você não tem permissão para deletar esta receita.');
      return res.redirect('/aluno/receitas');
    }

    await receita.destroy();
    req.flash('success', 'Receita deletada com sucesso.');
    return res.redirect('/aluno/receitas');
  } catch (error) {
    console.error('Delete error:', error);
    req.flash('error', 'Erro ao deletar receita: ' + error.message);
    return res.redirect('/aluno/receitas');
  }
});

router.get('/aluno/habilidades', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.session.alunoId, {
      include: {
        model: Habilidade,
        through: { attributes: ['level'] }
      }
    });

    if (!aluno) {
      return res.status(404).send('Aluno não encontrado.');
    }

    const allHabilidades = await Habilidade.findAll();
    const alunoHabilidadeIds = aluno.Habilidades.map(h => h.id);
    
    // Habilidades não cadastradas
    const availableHabilidades = allHabilidades.filter(h => !alunoHabilidadeIds.includes(h.id));

    const rows = aluno.Habilidades
      .map(
        (habilidade) => {
          const level = habilidade.AlunoHabilidade.level;
          const barWidth = (level / 10) * 100;
          return `
          <tr>
            <td>${habilidade.name}</td>
            <td>${level}/10</td>
            <td>
              <div style="background-color: #eee; width: 200px; height: 20px; border-radius: 4px; overflow: hidden;">
                <div style="background-color: #4CAF50; width: ${barWidth}%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                  ${level > 2 ? level : ''}
                </div>
              </div>
            </td>
            <td>
              <a href="/aluno/habilidades/${habilidade.id}/edit">Editar</a> | 
              <form method="POST" action="/aluno/habilidades/${habilidade.id}/delete" style="display:inline" onsubmit="return confirm('Tem certeza?');">
                <button type="submit">Remover</button>
              </form>
            </td>
          </tr>`
        }
      )
      .join('');

    res.send(`
      <html>
        <head>
          <title>Minhas Habilidades Culinárias</title>
          <style>
            nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
            nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
            nav a:hover { text-decoration: underline; }
            body { font-family: Arial; margin: 20px; }
            h1 { color: #333; }
            h2 { color: #555; margin-top: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
            td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            button { background: none; border: none; color: #0066cc; cursor: pointer; text-decoration: none; }
            button:hover { text-decoration: underline; }
            .empty { text-align: center; color: #999; padding: 20px; font-style: italic; }
            form { max-width: 500px; margin-bottom: 20px; }
            form div { margin-bottom: 15px; }
            label { display: block; font-weight: bold; margin-bottom: 5px; }
            input[type="number"], select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            input[type="range"] { width: 100%; }
            .level-display { font-weight: bold; color: #0066cc; }
            button[type="submit"] { padding: 10px 20px; background-color: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button[type="submit"]:hover { background-color: #0052a3; }
            .info { color: #666; font-size: 12px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <nav>
            <a href="/aluno/receitas">← Minhas Receitas</a> | 
            <span>Logged in as: <strong>${req.session.alunoName || 'User'}</strong></span> | 
            <a href="/logout">Logout</a>
          </nav>
          
          <h1>Minhas Habilidades Culinárias</h1>
          
          ${aluno.Habilidades.length > 0 ? `
            <h2>Habilidades Cadastradas (${aluno.Habilidades.length})</h2>
            <table>
              <thead>
                <tr><th>Habilidade</th><th>Nível</th><th>Progresso</th><th>Ações</th></tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          ` : `
            <div class="empty">
              Você ainda não cadastrou nenhuma habilidade culinária. 
              <a href="#adicionar">Adicione uma agora!</a>
            </div>
          `}
          
          <h2 id="adicionar">Adicionar Nova Habilidade</h2>
          ${availableHabilidades.length > 0 ? `
            <form method="POST" action="/aluno/habilidades/add">
              <div>
                <label>Selecione uma Habilidade</label>
                <select name="habilidadeId" required>
                  <option value="">-- Escolha uma habilidade --</option>
                  ${availableHabilidades.map((habilidade) => `<option value="${habilidade.id}">${habilidade.name}</option>`).join('')}
                </select>
                <p class="info">Escolha uma habilidade não cadastrada</p>
              </div>
              <div>
                <label>Nível (0-10)</label>
                <input type="range" name="level" min="0" max="10" value="5" required />
                <input type="number" name="levelDisplay" min="0" max="10" value="5" disabled style="margin-top: 5px;" />
                <p class="info">Defina seu nível de proficiência nesta habilidade</p>
              </div>
              <button type="submit">Adicionar Habilidade</button>
            </form>
            <script>
              const rangeInput = document.querySelector('input[name="level"]');
              const displayInput = document.querySelector('input[name="levelDisplay"]');
              rangeInput.addEventListener('input', function() {
                displayInput.value = this.value;
              });
            </script>
          ` : `
            <div class="empty">Parabéns! Você já cadastrou todas as habilidades disponíveis no sistema.</div>
          `}
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar habilidades: ' + error.message);
  }
});

router.post('/aluno/habilidades/add', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.session.alunoId, {
      include: {
        model: Habilidade,
        through: { attributes: ['level'] }
      }
    });
    
    if (!aluno) {
      return res.status(404).send('Aluno não encontrado.');
    }

    const { habilidadeId, level } = req.body;
    
    // Validar habilidadeId
    if (!habilidadeId) {
      req.flash('error', 'Selecione uma habilidade.');
      return res.redirect('/aluno/habilidades');
    }
    
    // Verificar se habilidade existe
    const habilidade = await Habilidade.findByPk(habilidadeId);
    if (!habilidade) {
      req.flash('error', 'Habilidade não encontrada.');
      return res.redirect('/aluno/habilidades');
    }
    
    // Verificar se aluno já tem essa habilidade
    const alreadyHas = aluno.Habilidades.some(h => h.id == habilidadeId);
    if (alreadyHas) {
      req.flash('error', 'Você já cadastrou essa habilidade.');
      return res.redirect('/aluno/habilidades');
    }
    
    // Validar nível
    const parsedLevel = Number(level);
    if (Number.isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > 10) {
      req.flash('error', 'O nível deve ser um número entre 0 e 10.');
      return res.redirect('/aluno/habilidades');
    }

    await aluno.addHabilidade(habilidadeId, { through: { level: parsedLevel } });
    req.flash('success', `Habilidade "${habilidade.name}" adicionada com sucesso!`);
    return res.redirect('/aluno/habilidades');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erro ao adicionar habilidade: ' + error.message);
    return res.redirect('/aluno/habilidades');
  }
});

router.get('/aluno/habilidades/:id/edit', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.session.alunoId, {
      include: {
        model: Habilidade,
        through: { attributes: ['level'] }
      }
    });
    
    if (!aluno) {
      return res.status(404).send('Aluno não encontrado.');
    }

    const habilidade = aluno.Habilidades.find(h => h.id == req.params.id);
    if (!habilidade) {
      req.flash('error', 'Habilidade não encontrada.');
      return res.redirect('/aluno/habilidades');
    }

    const currentLevel = habilidade.AlunoHabilidade.level;

    res.send(`
      <html>
        <head>
          <title>Editar Habilidade</title>
          <style>
            nav { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-bottom: 1px solid #ccc; }
            nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
            nav a:hover { text-decoration: underline; }
            body { font-family: Arial; margin: 20px; }
            h1 { color: #333; }
            form { max-width: 500px; }
            form div { margin-bottom: 20px; }
            label { display: block; font-weight: bold; margin-bottom: 10px; }
            input[type="range"] { width: 100%; }
            input[type="number"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 80px; }
            button { padding: 10px 20px; background-color: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
            button:hover { background-color: #0052a3; }
            button.cancel { background-color: #999; }
            button.cancel:hover { background-color: #777; }
            .level-display { font-size: 24px; font-weight: bold; color: #0066cc; }
          </style>
        </head>
        <body>
          <nav>
            <a href="/aluno/habilidades">← Voltar</a> | 
            <span>Logged in as: <strong>${req.session.alunoName || 'User'}</strong></span> | 
            <a href="/logout">Logout</a>
          </nav>
          
          <h1>Editar: ${habilidade.name}</h1>
          
          <form method="POST" action="/aluno/habilidades/${habilidade.id}">
            <div>
              <label>Nível (0-10)</label>
              <input type="range" name="level" min="0" max="10" value="${currentLevel}" required />
              <div style="margin-top: 10px;">
                Nível atual: <span class="level-display">${currentLevel}/10</span>
              </div>
            </div>
            <button type="submit">Salvar</button>
            <a href="/aluno/habilidades"><button type="button" class="cancel">Cancelar</button></a>
          </form>
          
          <script>
            const rangeInput = document.querySelector('input[name="level"]');
            const display = document.querySelector('.level-display');
            rangeInput.addEventListener('input', function() {
              display.textContent = this.value + '/10';
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar formulário: ' + error.message);
  }
});

router.post('/aluno/habilidades/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.session.alunoId, {
      include: {
        model: Habilidade,
        through: { attributes: ['level'] }
      }
    });
    
    if (!aluno) {
      return res.status(404).send('Aluno não encontrado.');
    }

    const habilidade = aluno.Habilidades.find(h => h.id == req.params.id);
    if (!habilidade) {
      req.flash('error', 'Habilidade não encontrada.');
      return res.redirect('/aluno/habilidades');
    }

    const { level } = req.body;
    const parsedLevel = Number(level);
    
    if (Number.isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > 10) {
      req.flash('error', 'O nível deve ser um número entre 0 e 10.');
      return res.redirect('/aluno/habilidades');
    }

    await aluno.setHabilidades([habilidade.id], { through: { level: parsedLevel } });
    req.flash('success', `Nível de "${habilidade.name}" atualizado para ${parsedLevel}/10`);
    return res.redirect('/aluno/habilidades');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erro ao atualizar habilidade: ' + error.message);
    return res.redirect('/aluno/habilidades');
  }
});

router.post('/aluno/habilidades/:id/delete', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.session.alunoId, {
      include: {
        model: Habilidade,
        through: { attributes: ['level'] }
      }
    });
    
    if (!aluno) {
      return res.status(404).send('Aluno não encontrado.');
    }

    const habilidade = aluno.Habilidades.find(h => h.id == req.params.id);
    if (!habilidade) {
      req.flash('error', 'Habilidade não encontrada.');
      return res.redirect('/aluno/habilidades');
    }

    const habilidadeName = habilidade.name;
    await aluno.removeHabilidade(req.params.id);
    req.flash('success', `Habilidade "${habilidadeName}" removida com sucesso.`);
    return res.redirect('/aluno/habilidades');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erro ao remover habilidade: ' + error.message);
    return res.redirect('/aluno/habilidades');
  }
});

module.exports = router;
