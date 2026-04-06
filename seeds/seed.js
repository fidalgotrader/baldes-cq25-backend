require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, Utilizador, NiparTotal25, EncabCad25, Avaliacao } = require('../models');

const BALDES = ['BALDE_A', 'BALDE_B', 'BALDE_C', 'BALDE_D', 'BALDE_E'];
const CULTS = ['BLG','MIL','GIR','SOJ','TOT','CEB','AVO','AZE','OLI','VIN'];
const QA = ['OK', 'KO', 'NA', null];
const TECNICOS = ['Ana Silva', 'Bruno Costa', 'Carla Mendes', 'David Pereira'];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndNum(min, max, dec = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Tables created');

    // Avaliações
    await Avaliacao.bulkCreate([
      { cod_aval: 'OK', desc_semaf: 'Conforme' },
      { cod_aval: 'KO', desc_semaf: 'Não Conforme' },
      { cod_aval: 'NA', desc_semaf: 'Não Aplicável' },
    ]);

    // Utilizadores
    const adminHash = await bcrypt.hash('admin123', 10);
    const tecHash = await bcrypt.hash('tecnico123', 10);
    const leituraHash = await bcrypt.hash('leitura123', 10);
    await Utilizador.bulkCreate([
      { tecnico_nome: 'Administrador', username: 'admin', password_hash: adminHash, perfil: 'admin' },
      { tecnico_nome: 'Ana Silva', username: 'ana.silva', password_hash: tecHash, perfil: 'tecnico' },
      { tecnico_nome: 'Bruno Costa', username: 'bruno.costa', password_hash: tecHash, perfil: 'tecnico' },
      { tecnico_nome: 'Carla Mendes', username: 'carla.mendes', password_hash: tecHash, perfil: 'tecnico' },
      { tecnico_nome: 'Visualizador', username: 'leitura', password_hash: leituraHash, perfil: 'leitura' },
    ]);
    console.log('Users created');

    // NIPAR data - 200 registos
    const niparRows = [];
    let ranking = 1;
    for (const balde of BALDES) {
      const numNifaps = 8;
      for (let n = 0; n < numNifaps; n++) {
        const nifap = 100000000 + parseInt(balde.slice(-1).charCodeAt(0)) * 10000 + n * 100;
        const numParcs = Math.floor(Math.random() * 4) + 2;
        for (let p = 0; p < numParcs; p++) {
          const gsa_qa = rnd(QA);
          const ams_qa = rnd(QA);
          const ccampo = rnd(QA);
          const ca = rnd(QA);
          const cc = rnd(QA);
          const encab = rnd(QA);
          let smo = null;
          if (gsa_qa && ams_qa) {
            smo = (gsa_qa === 'KO' || ams_qa === 'KO' || ca === 'KO' || cc === 'KO') ? 'KO' : 'OK';
          }
          niparRows.push({
            ranking: ranking++,
            dte_nifap: nifap,
            balde,
            parc_num: p + 1,
            sub_parc_num: 0,
            cul_id: 900000000 + Math.floor(Math.random() * 999999),
            cod_cult_decl1: rnd(CULTS),
            unit_amount: rndNum(0.5, 50),
            area_decl1: rndNum(0.3, 45),
            unit_amount_grp: rndNum(1, 100),
            recolhido: Math.random() > 0.4,
            selecao: rnd(['S', 'N', null]),
            area_gsa: rndNum(0.1, 40),
            obs_gsa: gsa_qa === 'KO' ? 'Área GSA não corresponde à declarada' : null,
            gsa_qa,
            area_cf: rndNum(0.1, 35),
            obs_ams: ams_qa === 'KO' ? 'Divergência na área AMS detectada' : null,
            ams_qa,
            obs_ccampo: null,
            ccampo_aval: ccampo,
            obs_crits_ca: ca === 'KO' ? 'Critério CA não satisfeito' : null,
            crits_ca_aval: ca,
            obs_crits_cc: null,
            crits_cc_aval: cc,
            obs_encab: null,
            encab_aval: encab,
            out_crits: null,
            ua_fta: rndNum(0, 5),
            sin_fta: rnd(['OK', 'KO', null]),
            ua_maa: rndNum(0, 3),
            sin_maa: rnd(['OK', 'NA', null]),
            ua_eco: rndNum(0, 2),
            sin_eco: rnd(['OK', 'NA', null]),
            sin_mzd: rnd(['OK', 'KO', 'NA', null]),
            sin_aas: rnd(['OK', 'NA', null]),
            sin_pdi: rnd(['OK', 'NA', null]),
            covered: Math.random() > 0.3,
            smo_result: smo,
            nome_tec_atrib: rnd(TECNICOS),
            satisfaz_area: Math.random() > 0.2,
            dat_alt: new Date(Date.now() - Math.random() * 30 * 86400000),
            nome_uti_alt: rnd(TECNICOS)
          });
        }
      }
    }
    await NiparTotal25.bulkCreate(niparRows);
    console.log(`${niparRows.length} NIPAR rows created`);

    // Encab data
    const encabRows = [];
    for (const balde of BALDES) {
      for (let n = 0; n < 8; n++) {
        const nifap = 100000000 + parseInt(balde.slice(-1).charCodeAt(0)) * 10000 + n * 100;
        encabRows.push({
          dte_nifap: nifap, balde,
          interv: rnd(['INTERV_1','INTERV_2','INTERV_3']),
          total_cn: rndNum(1, 200),
          total_sa: rndNum(1, 150),
          total_sf: rndNum(1, 100),
          dat_alt: new Date(),
          nome_uti_alt: rnd(TECNICOS)
        });
      }
    }
    await EncabCad25.bulkCreate(encabRows);
    console.log(`${encabRows.length} Encab rows created`);

    console.log('\n✅ Seed completo!');
    console.log('Credenciais de acesso:');
    console.log('  admin / admin123  (administrador)');
    console.log('  ana.silva / tecnico123  (técnico)');
    console.log('  leitura / leitura123  (só leitura)');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
