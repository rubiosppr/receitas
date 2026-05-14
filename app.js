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

app.use(authRoutes);
app.use(adminRoutes);
app.use(alunoRoutes);
app.use(categoriasRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
