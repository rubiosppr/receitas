# Sistema de Receitas Culinárias

Este é um sistema web para gerenciamento de receitas culinárias, desenvolvido em Node.js utilizando o framework Express, ORM Sequelize para banco de dados relacional (MySQL) e EJS como motor de templates (view engine) para a interface.

O sistema permite a gestão de:
- **Alunos (Usuários):** Pessoas que utilizam o sistema e podem ter diferentes permissões (ex: Admin).
- **Receitas:** Pratos culinários com nome, descrição e link externo.
- **Categorias:** Classificação das receitas (ex: Doce, Salgado, Vegetariano).
- **Habilidades:** Competências culinárias que os alunos podem possuir.

Existem relacionamentos complexos, como Receitas pertencendo a Categorias e a Alunos, e Alunos possuindo diversas Habilidades.

## Estrutura do Projeto

- `app.js`: Ponto de entrada da aplicação. Configura o servidor, middlewares de sessão, EJS e rotas.
- `config/database.js`: Configuração da conexão com o banco de dados MySQL usando Sequelize.
- `models/`: Definições da estrutura das tabelas e seus relacionamentos.
- `controllers/`: Regras de negócio e comunicação entre os modelos e as views.
- `routes/`: Mapeamento das URLs do sistema para os seus respectivos controllers.
- `views/`: Telas e componentes da interface escritos em HTML/EJS.
- `scripts/`: Scripts utilitários para criar tabelas, popular o banco e gerar usuários iniciais.

---

## Configuração do Banco de Dados

A conexão com o banco de dados é feita através do arquivo **`config/database.js`**. 

- **Host:** Definido pela variável de ambiente `DB_HOST` ou, se ausente, será `localhost`.

### Como configurar:
1. Certifique-se de ter um servidor MySQL rodando localmente (ou em outro host).
2. Se necessário, altere as credenciais diretamente no arquivo `config/database.js` para corresponderem ao seu ambiente, ou crie um arquivo `.env` na raiz do projeto e defina a variável `DB_HOST`.
3. Crie o banco de dados no seu MySQL antes de rodar a aplicação:
   ```sql
   CREATE DATABASE receitas_db;
   ```

---

## Utilizando os Scripts do Banco de Dados

Para facilitar o desenvolvimento e a configuração inicial, o projeto conta com alguns scripts dentro da pasta `scripts/`. Você deve executá-los pelo terminal, na raiz do projeto.

### 1. Sincronizar as Tabelas (`sync.js`)
Gera e atualiza a estrutura de tabelas no banco de dados baseado nos seus Modelos. É útil quando você faz alguma alteração nas estruturas e precisa refleti-la no banco sem perder os dados (`alter: true`).

**Comando:**
```bash
node scripts/sync.js
```

### 2. Popular o Banco de Dados (`seed.js`)
Ideal para o primeiro uso ou para resetar o ambiente de testes.
⚠️ **Atenção:** Este script recria todas as tabelas (usando `force: true`), **apagando todos os dados existentes** e preenchendo o banco com:
- 4 alunos (incluindo um Admin).
- 4 categorias.
- 5 habilidades.
- 6 receitas pré-cadastradas e vinculadas aos alunos e categorias.

**Comando:**
```bash
node scripts/seed.js
```
*(Após rodar o seed, você poderá fazer login no sistema usando `admin@example.com` e a senha `admin123`)*

### 3. Criar apenas o Administrador (`createAdmin.js`)
Se você não quiser limpar e popular todo o banco de dados, mas apenas garantir que exista um usuário Administrador para acessar o sistema.

**Comando:**
```bash
node scripts/createAdmin.js
```
*(Cria o usuário com email `admin@example.com` e senha `admin123`)*

---

## Como Rodar a Aplicação

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```

2. Configure seu banco de dados e rode a sincronização ou o seed (como explicado acima):
   ```bash
   node scripts/seed.js
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```
   *(Durante o desenvolvimento, você pode usar `nodemon app.js` para recarregar o servidor automaticamente ao salvar os arquivos).*

4. Acesse a aplicação no seu navegador:
   http://localhost:3000
