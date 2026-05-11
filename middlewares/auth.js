module.exports = function isAuthenticated(req, res, next) {
  if (req.session && req.session.alunoId) {
    return next();
  }

  return res.redirect('/login');
};
