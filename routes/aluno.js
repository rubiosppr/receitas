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
    
    res.render('aluno/receitas', {
      receitas: minhasReceitas,
      alunoName: req.session.alunoName
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar receitas: ' + error.message);
  }
});

router.get('/aluno/receitas/new', async (req, res) => {
  try {
    const categories = await Categoria.findAll();
    res.render('aluno/receita-new', {
      categories: categories,
      alunoName: req.session.alunoName
    });
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

    res.render('aluno/receita-edit', {
      receita: receita,
      categories: categories,
      alunos: alunos,
      selectedCategoryIds: selectedCategoryIds,
      selectedAlunoIds: selectedAlunoIds,
      alunoName: req.session.alunoName
    });
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

    res.render('aluno/habilidades', {
      habilidades: aluno.Habilidades,
      availableHabilidades: availableHabilidades,
      alunoName: req.session.alunoName
    });
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

    res.render('aluno/habilidade-edit', {
      habilidade: habilidade,
      currentLevel: currentLevel,
      alunoName: req.session.alunoName
    });
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
