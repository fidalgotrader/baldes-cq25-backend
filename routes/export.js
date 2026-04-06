const router = require('express').Router();
const ExcelJS = require('exceljs');
const { NiparTotal25, EncabCad25 } = require('../models');
const auth = require('../middleware/auth');

const QA_COLORS = { 'OK': 'FF90EE90', 'KO': 'FFFF9999', 'NA': 'FFD3D3D3' };

router.get('/nipar', auth, async (req, res) => {
  try {
    const { balde, nifap } = req.query;
    const where = {};
    if (balde) where.balde = balde;
    if (nifap) where.dte_nifap = nifap;
    const rows = await NiparTotal25.findAll({ where, order: [['ranking', 'ASC']] });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'BALDES CQ25 Web';
    wb.created = new Date();
    const ws = wb.addWorksheet('NIPAR_2025');

    const cols = [
      { header: 'Ranking', key: 'ranking', width: 10 },
      { header: 'NIFAP', key: 'dte_nifap', width: 15 },
      { header: 'Balde', key: 'balde', width: 12 },
      { header: 'Parc', key: 'parc_num', width: 8 },
      { header: 'Sub-Parc', key: 'sub_parc_num', width: 10 },
      { header: 'CUL_ID', key: 'cul_id', width: 14 },
      { header: 'Cult.', key: 'cod_cult_decl1', width: 12 },
      { header: 'Unit Amount', key: 'unit_amount', width: 14 },
      { header: 'Área Decl.', key: 'area_decl1', width: 12 },
      { header: 'Recolhido', key: 'recolhido', width: 12 },
      { header: 'GSA_QA', key: 'gsa_qa', width: 10 },
      { header: 'Obs GSA', key: 'obs_gsa', width: 20 },
      { header: 'AMS_QA', key: 'ams_qa', width: 10 },
      { header: 'Obs AMS', key: 'obs_ams', width: 20 },
      { header: 'CCampo Aval', key: 'ccampo_aval', width: 14 },
      { header: 'CritCA Aval', key: 'crits_ca_aval', width: 14 },
      { header: 'CritCC Aval', key: 'crits_cc_aval', width: 14 },
      { header: 'Encab Aval', key: 'encab_aval', width: 12 },
      { header: 'SMO Result', key: 'smo_result', width: 12 },
      { header: 'Técnico', key: 'nome_tec_atrib', width: 20 },
      { header: 'Data Alt.', key: 'dat_alt', width: 16 },
    ];
    ws.columns = cols;

    // Header style
    ws.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4F72' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    ws.getRow(1).height = 22;

    rows.forEach((r, i) => {
      const row = ws.addRow({
        ranking: r.ranking, dte_nifap: r.dte_nifap?.toString(), balde: r.balde,
        parc_num: r.parc_num, sub_parc_num: r.sub_parc_num, cul_id: r.cul_id?.toString(),
        cod_cult_decl1: r.cod_cult_decl1, unit_amount: r.unit_amount, area_decl1: r.area_decl1,
        recolhido: r.recolhido ? 'Sim' : 'Não',
        gsa_qa: r.gsa_qa, obs_gsa: r.obs_gsa, ams_qa: r.ams_qa, obs_ams: r.obs_ams,
        ccampo_aval: r.ccampo_aval, crits_ca_aval: r.crits_ca_aval, crits_cc_aval: r.crits_cc_aval,
        encab_aval: r.encab_aval, smo_result: r.smo_result,
        nome_tec_atrib: r.nome_tec_atrib,
        dat_alt: r.dat_alt ? new Date(r.dat_alt).toLocaleDateString('pt-PT') : ''
      });
      if (i % 2 === 1) row.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF5FB' } }; });

      // Color QA cells
      const qaFields = ['gsa_qa', 'ams_qa', 'ccampo_aval', 'crits_ca_aval', 'crits_cc_aval', 'encab_aval', 'smo_result'];
      qaFields.forEach(f => {
        const colIdx = cols.findIndex(c => c.key === f) + 1;
        const val = r[f];
        if (val && QA_COLORS[val]) {
          const cell = row.getCell(colIdx);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: QA_COLORS[val] } };
          cell.font = { bold: true };
        }
      });
    });

    ws.autoFilter = { from: 'A1', to: `U1` };
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=NIPAR_CQ25_${Date.now()}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/recolhidos', auth, async (req, res) => {
  try {
    const rows = await NiparTotal25.findAll({
      where: { recolhido: true }, order: [['balde', 'ASC'], ['dte_nifap', 'ASC']]
    });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Recolhidos');
    ws.columns = [
      { header: 'Balde', key: 'balde', width: 12 },
      { header: 'NIFAP', key: 'dte_nifap', width: 15 },
      { header: 'Ranking', key: 'ranking', width: 10 },
      { header: 'CUL_ID', key: 'cul_id', width: 14 },
      { header: 'SMO Result', key: 'smo_result', width: 12 },
      { header: 'Técnico', key: 'nome_tec_atrib', width: 20 },
    ];
    ws.getRow(1).eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF117A65' } };
      c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });
    rows.forEach(r => ws.addRow({ balde: r.balde, dte_nifap: r.dte_nifap?.toString(), ranking: r.ranking, cul_id: r.cul_id?.toString(), smo_result: r.smo_result, nome_tec_atrib: r.nome_tec_atrib }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Recolhidos_CQ25_${Date.now()}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
