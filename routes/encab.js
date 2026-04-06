const router = require('express').Router();
const { EncabCad25 } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { balde, nifap } = req.query;
    const where = {};
    if (balde) where.balde = balde;
    if (nifap) where.dte_nifap = nifap;
    const rows = await EncabCad25.findAll({ where, order: [['dte_nifap', 'ASC']] });
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.perfil === 'leitura') return res.status(403).json({ error: 'Sem permissão' });
    const row = await EncabCad25.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Registo não encontrado' });
    const { interv, total_cn, total_sa, total_sf } = req.body;
    await row.update({ interv, total_cn, total_sa, total_sf, dat_alt: new Date(), nome_uti_alt: req.user.nome });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
