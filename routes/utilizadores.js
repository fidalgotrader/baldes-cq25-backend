const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { Utilizador } = require('../models');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.perfil !== 'admin') return res.status(403).json({ error: 'Apenas administradores' });
  next();
};

router.get('/', auth, adminOnly, async (req, res) => {
  const users = await Utilizador.findAll({ attributes: { exclude: ['password_hash'] } });
  res.json(users);
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { tecnico_nome, username, password, perfil } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await Utilizador.create({ tecnico_nome, username, password_hash, perfil });
    res.json({ id: user.id, username: user.username, perfil: user.perfil });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await Utilizador.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    const updates = { tecnico_nome: req.body.tecnico_nome, perfil: req.body.perfil, ativo: req.body.ativo };
    if (req.body.password) updates.password_hash = await bcrypt.hash(req.body.password, 10);
    await user.update(updates);
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
