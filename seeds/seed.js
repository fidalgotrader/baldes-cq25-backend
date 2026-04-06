require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, Utilizador, NiparTotal25, EncabCad25, Avaliacao } = require('../models');

// Dados reais extraídos da BD Access BALDES_CQ25
const TECNICOS = ['César Montalvão', 'Manuel Camacho', 'Orlando Sousa', 'Carla Gomes'];
// BALDE = UNIT_AMOUNT_GRP — códigos romanos com 10 grupos de UNIT_AMOUNTs
const BALDES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
// Culturas reais (COD_CULT_DECL1)
const CULTS = ['BLG','MIL','GIR','SOJ','TOT','CEB','AVO','AZE','OLI','VIN','ARR','HORT','FF','CT','PP'];
// Intervenções ECOregimes / FTAs / MAAs reais
const INTERVS = ['FTA1','FTA2','MAA1','MAA2','ECO1','ECO2','MZD','PDI','AAS'];
// Distritos reais
const DISTRITOS = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18'];
const DISTRITOOUILHAS = ['Viana do Castelo','Braga','Vila Real','Bragança','Porto','Aveiro','Viseu','Guarda','Coimbra','Leiria','Lisboa','Setúbal','Portalegre','Évora','Beja','Faro','Açores','Madeira'];
const QA_VALS = ['OK', 'KO', 'NA', null];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndNum(min, max, dec = 4) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }
function rndNifap(balde_idx) {
  // NIFAPs reais começam por dígito 1-9, 7-11 dígitos
  const base = 1000000 + (balde_idx * 500000) + Math.floor(Math.random() * 400000);
  return base;
}

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

    // Utilizadores reais
    const adminHash = await bcrypt.hash('admin123', 10);
    const tecHash = await bcrypt.hash('tecnico123', 10);
    const leituraHash = await bcrypt.hash('leitura123', 10);
    await Utilizador.bulkCreate([
      { tecnico_nome: 'Administrador', username: 'admin', password_hash: adminHash, perfil: 'admin' },
      { tecnico_nome: 'César Montalvão', username: 'cesar.montalvao', password_hash: tecHash, perfil: 'tecnico' },
      { tecnico_nome: 'Manuel Camacho', username: 'manuel.camacho', password_hash: tecHash, perfil: 'tecnico' },
      { tecnico_nome: 'Orlando Sousa', username: 'orlando.sousa', password_hash: tecHash, perfil: 'tecnico' },
      { tecnico_nome: 'Carla Gomes', username: 'carla.gomes', password_hash: tecHash, perfil: 'tecnico' },
      { tecnico_nome: 'Visualizador', username: 'leitura', password_hash: leituraHash, perfil: 'leitura' },
    ]);
    console.log('Users created');

    // Gerar NIFAPs únicos por balde (estrutura real: ~8-15 NIFAPs por balde, cada um com várias parcelas/culturas)
    const niparRows = [];
    const encabRows = [];
    let ranking = 1;

    for (let bi = 0; bi < BALDES.length; bi++) {
      const balde = BALDES[bi];
      const numNifaps = 8 + Math.floor(Math.random() * 8); // 8-15 NIFAPs por balde
      const distIdx = bi % DISTRITOS.length;

      for (let ni = 0; ni < numNifaps; ni++) {
        const nifap = rndNifap(bi * 10 + ni);
        const numParcs = 2 + Math.floor(Math.random() * 5); // 2-6 parcelas por NIFAP
        const tecnico = rnd(TECNICOS);
        const dat_alt = new Date(Date.now() - Math.random() * 90 * 86400000);

        // Encabeçamento para este NIFAP
        encabRows.push({
          dte_nifap: nifap,
          balde,
          interv: rnd(['I', 'II', 'III', 'IV', 'V']),
          total_cn: rndNum(0.5, 300, 2),
          total_sa: rndNum(0.5, 250, 2),
          total_sf: rndNum(0, 100, 2),
          dat_alt,
          nome_uti_alt: tecnico
        });

        for (let pi = 0; pi < numParcs; pi++) {
          const gsa_qa = rnd(QA_VALS);
          const ams_qa = rnd(QA_VALS);
          const ccampo = rnd(QA_VALS);
          const ca = rnd([...QA_VALS, ...QA_VALS, 'OK']); // mais OKs
          const cc = rnd([...QA_VALS, ...QA_VALS, 'OK']);
          const encab = rnd([...QA_VALS, 'OK', 'OK']);

          // SMO calculado automaticamente
          let smo = null;
          const allQa = [gsa_qa, ams_qa, ca, cc, encab].filter(Boolean);
          if (allQa.length > 0) {
            smo = allQa.includes('KO') ? 'KO' : 'OK';
          }

          // Observações realistas
          const obs_gsa = gsa_qa === 'KO' ? rnd([
            'Área GSA não corresponde à área declarada no CF',
            'Divergência entre área GSA e área declarada superior a 0,1ha',
            'Área GSA inferior à área mínima exigida',
            'Subparcela não localizada na área GSA declarada'
          ]) : null;

          const obs_ams = ams_qa === 'KO' ? rnd([
            'Área AMS não coincide com a área declarada',
            'Cultura não elegível para AMS nesta subparcela',
            'Área AMS excede o limite declarado em 0,05ha',
            'Ausência de manutenção da superfície forrageira'
          ]) : null;

          const obs_ca = ca === 'KO' ? rnd([
            'Critério de acesso não satisfeito: área mínima',
            'Produção animal não atingiu o mínimo exigido',
            'Ausência de registo de encabeçamento no período'
          ]) : null;

          niparRows.push({
            ranking: ranking++,
            dte_nifap: nifap,
            balde,
            parc_num: pi + 1,
            sub_parc_num: Math.random() > 0.7 ? 1 : 0,
            cul_id: 900000000 + Math.floor(Math.random() * 9999999),
            cod_cult_decl1: rnd(CULTS),
            unit_amount: rndNum(0.1, 50, 4),
            area_decl1: rndNum(0.1, 45, 4),
            unit_amount_grp: balde,
            recolhido: Math.random() > 0.35,
            selecao: rnd(['S', 'N', null, null]),
            area_gsa: rndNum(0.05, 44, 4),
            obs_gsa,
            gsa_qa,
            area_cf: rndNum(0.05, 40, 4),
            obs_ams,
            ams_qa,
            obs_ccampo: null,
            ccampo_aval: ccampo,
            obs_crits_ca: obs_ca,
            crits_ca_aval: ca,
            obs_crits_cc: null,
            crits_cc_aval: cc,
            obs_encab: null,
            encab_aval: encab,
            out_crits: null,
            ua_fta: rndNum(0, 3, 4),
            sin_fta: rnd(['OK', 'NA', null]),
            ua_maa: rndNum(0, 2, 4),
            sin_maa: rnd(['OK', 'NA', null]),
            ua_eco: rndNum(0, 1.5, 4),
            sin_eco: rnd(['OK', 'NA', null]),
            sin_mzd: rnd(['S', 'N', null]),
            sin_aas: rnd(['S', 'N', null]),
            sin_pdi: rnd(['S', 'N', null]),
            covered: Math.random() > 0.2,
            smo_result: smo,
            nome_tec_atrib: tecnico,
            satisfaz_area: Math.random() > 0.15,
            dat_alt,
            nome_uti_alt: tecnico
          });
        }
      }
    }

    await NiparTotal25.bulkCreate(niparRows);
    console.log(`${niparRows.length} NIPAR rows created`);

    await EncabCad25.bulkCreate(encabRows);
    console.log(`${encabRows.length} Encab rows created`);

    console.log('\n✅ Seed completo!');
    console.log('Credenciais de acesso:');
    console.log('  admin / admin123  (administrador)');
    console.log('  cesar.montalvao / tecnico123  (técnico)');
    console.log('  manuel.camacho / tecnico123  (técnico)');
    console.log('  orlando.sousa / tecnico123  (técnico)');
    console.log('  carla.gomes / tecnico123  (técnico)');
    console.log('  leitura / leitura123  (só leitura)');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
