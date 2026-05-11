const bcrypt = require('bcryptjs');
const { Aluno, Categoria, Habilidade } = require('../models');

class AdminController {
  static async listAlunos(req, res) {
    try {
      const alunos = await Aluno.findAll();
      return res.json(alunos);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to list alunos.');
    }
  }

  static async createAluno(req, res) {
    try {
      const { name, email, password } = req.body;
      const aluno = await Aluno.create({ name, email, password });
      return res.status(201).json(aluno);
    } catch (error) {
      console.error(error);
      req.flash('error', 'Unable to create aluno.');
      return res.status(500).json({ error: 'Unable to create aluno.' });
    }
  }

  static async editAlunoForm(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) {
        return res.status(404).send('Aluno not found.');
      }
      return res.json(aluno);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to load aluno.');
    }
  }

  static async updateAluno(req, res) {
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
      return res.json(aluno);
    } catch (error) {
      console.error(error);
      req.flash('error', 'Unable to update aluno.');
      return res.status(500).send('Unable to update aluno.');
    }
  }

  static async deleteAluno(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) {
        return res.status(404).send('Aluno not found.');
      }

      await aluno.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      req.flash('error', 'Unable to delete aluno.');
      return res.status(500).send('Unable to delete aluno.');
    }
  }

  static async listCategorias(req, res) {
    try {
      const categorias = await Categoria.findAll();
      return res.json(categorias);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to list categorias.');
    }
  }

  static async createCategoria(req, res) {
    try {
      const { name } = req.body;
      const categoria = await Categoria.create({ name });
      return res.status(201).json(categoria);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to create categoria.');
    }
  }

  static async editCategoriaForm(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) {
        return res.status(404).send('Categoria not found.');
      }
      return res.json(categoria);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to load categoria.');
    }
  }

  static async updateCategoria(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) {
        return res.status(404).send('Categoria not found.');
      }

      await categoria.update({ name: req.body.name });
      return res.json(categoria);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to update categoria.');
    }
  }

  static async deleteCategoria(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) {
        return res.status(404).send('Categoria not found.');
      }

      await categoria.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to delete categoria.');
    }
  }

  static async listHabilidades(req, res) {
    try {
      const habilidades = await Habilidade.findAll();
      return res.json(habilidades);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to list habilidades.');
    }
  }

  static async createHabilidade(req, res) {
    try {
      const { name } = req.body;
      const habilidade = await Habilidade.create({ name });
      return res.status(201).json(habilidade);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to create habilidade.');
    }
  }

  static async editHabilidadeForm(req, res) {
    try {
      const habilidade = await Habilidade.findByPk(req.params.id);
      if (!habilidade) {
        return res.status(404).send('Habilidade not found.');
      }
      return res.json(habilidade);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to load habilidade.');
    }
  }

  static async updateHabilidade(req, res) {
    try {
      const habilidade = await Habilidade.findByPk(req.params.id);
      if (!habilidade) {
        return res.status(404).send('Habilidade not found.');
      }

      await habilidade.update({ name: req.body.name });
      return res.json(habilidade);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to update habilidade.');
    }
  }

  static async deleteHabilidade(req, res) {
    try {
      const habilidade = await Habilidade.findByPk(req.params.id);
      if (!habilidade) {
        return res.status(404).send('Habilidade not found.');
      }

      await habilidade.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send('Unable to delete habilidade.');
    }
  }
}

module.exports = AdminController;
