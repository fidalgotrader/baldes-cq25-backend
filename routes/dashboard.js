const router = require('express').Router();
const { sequelize } = require('../models');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const { balde } = req.query;
    const where = balde ? `WHERE balde = '${balde}'` : '';
    const [stats] = await sequelize.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE recolhido = true) AS recolhidos,
        COUNT(*) FILTER (WHERE gsa_qa = 'OK') AS gsa_ok,
        COUNT(*) FILTER (WHERE gsa_qa = 'KO') AS gsa_ko,
        COUNT(*) FILTER (WHERE gsa_qa IS NULL OR gsa_qa = '') AS gsa_pendente,
        COUNT(*) FILTER (WHERE ams_qa = 'OK') AS ams_ok,
        COUNT(*) FILTER (WHERE ams_qa = 'KO') AS ams_ko,
        COUNT(*) FILTER (WHERE smo_result = 'OK') AS smo_ok,
        COUNT(*) FILTER (WHERE smo_result = 'KO') AS smo_ko,
        COUNT(DISTINCT balde) AS num_baldes,
        COUNT(DISTINCT dte_nifap) AS num_nifaps
      FROM grp_nipar_total_25 ${where}
    `, { type: sequelize.QueryTypes.SELECT });

    const baldes = await sequelize.query(`
      SELECT balde,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE recolhido = true) AS recolhidos,
        COUNT(*) FILTER (WHERE smo_result = 'OK') AS conformes,
        COUNT(*) FILTER (WHERE smo_result = 'KO') AS nao_conformes
      FROM grp_nipar_total_25
      WHERE balde IS NOT NULL
      GROUP BY balde ORDER BY balde
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({ stats: stats || {}, baldes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
