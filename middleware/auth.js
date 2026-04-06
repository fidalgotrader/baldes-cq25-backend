const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token em falta' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'baldes_secret_2025');
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
