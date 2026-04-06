const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilizador } = require('../models');
const authMiddleware = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'baldes_secret_2025';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Utilizador.findOne({ where: { username, ativo: true } });
    if (!user) return res.status(401).json({ error: 'Utilizador não encontrado' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Password incorreta' });
    const token = jwt.sign(
      { id: user.id, username: user.username, perfil: user.perfil, nome: user.tecnico_nome },
      SECRET, { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, perfil: user.perfil, nome: user.tecnico_nome } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
