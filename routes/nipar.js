const router = require('express').Router();
const { Op } = require('sequelize');
const { NiparTotal25 } = require('../models');
const auth = require('../middleware/auth');

// GET lista com filtros
router.get('/', auth, async (req, res) => {
  try {
    const { balde, nifap, recolhido, gsa_qa, ams_qa, page = 1, limit = 50 } = req.query;
    const where = {};
    if (balde) where.balde = balde;
    if (nifap) where.dte_nifap = nifap;
    if (recolhido !== undefined && recolhido !== '') where.recolhido = recolhido === 'true';
    if (gsa_qa) where.gsa_qa = gsa_qa;
    if (ams_qa) where.ams_qa = ams_qa;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await NiparTotal25.findAndCountAll({
      where, limit: parseInt(limit), offset,
      order: [['ranking', 'ASC'], ['dte_nifap', 'ASC']]
    });
    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single
router.get('/:id', auth, async (req, res) => {
  try {
    const row = await NiparTotal25.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Registo não encontrado' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update (avaliações)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.perfil === 'leitura') return res.status(403).json({ error: 'Sem permissão para editar' });
    const row = await NiparTotal25.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Registo não encontrado' });
    const allowed = ['gsa_qa','obs_gsa','area_gsa','ams_qa','obs_ams','ccampo_aval','obs_ccampo',
      'crits_ca_aval','obs_crits_ca','crits_cc_aval','obs_crits_cc','encab_aval','obs_encab',
      'out_crits','smo_result','sin_fta','sin_maa','sin_eco','sin_mzd','sin_aas','sin_pdi',
      'covered','satisfaz_area','recolhido','selecao','nome_tec_atrib','area_cf'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    updates.dat_alt = new Date();
    updates.nome_uti_alt = req.user.nome;
    await row.update(updates);
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET baldes distintos
router.get('/meta/baldes', auth, async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const rows = await sequelize.query(
      'SELECT DISTINCT balde FROM grp_nipar_total_25 WHERE balde IS NOT NULL ORDER BY balde',
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(rows.map(r => r.balde));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET nifaps distintos (com filtro balde)
router.get('/meta/nifaps', auth, async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const { balde } = req.query;
    const where = balde ? `WHERE balde = '${balde}'` : '';
    const rows = await sequelize.query(
      `SELECT DISTINCT dte_nifap FROM grp_nipar_total_25 ${where} ORDER BY dte_nifap`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(rows.map(r => r.dte_nifap));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
