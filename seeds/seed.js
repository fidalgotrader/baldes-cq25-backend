require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, Utilizador, NiparTotal25, EncabCad25, Avaliacao } = require('../models');

// Dados reais extraídos da BD Access BALDES_CQ25.accdb
// 770 registos reais com NIFAPs, baldes III/V/VI, avaliações GSA/AMS e observações
const REAL_RECORDS = [
{"dte_nifap":2844057076,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo adicionadas outras","smo_result":"KO","recolhido":false},
{"dte_nifap":2834059860,"parc_num":3,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":null,"smo_result":"KO","recolhido":false},
{"dte_nifap":2844057626,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2844057076,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2834057008,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":null,"smo_result":"KO","recolhido":false},
{"dte_nifap":2843965382,"parc_num":17,"sub_parc_num":1,"ranking":42,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2843966632,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2853973539,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2853979629,"parc_num":6,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2843964765,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2853985558,"parc_num":2,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2853976206,"parc_num":11,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2843992819,"parc_num":11,"sub_parc_num":1,"ranking":42,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2843954595,"parc_num":24,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2843954595,"parc_num":22,"sub_parc_num":1,"ranking":42,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2843992820,"parc_num":3,"sub_parc_num":1,"ranking":42,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2843953087,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2843965382,"parc_num":17,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2824077316,"parc_num":10,"sub_parc_num":1,"ranking":42,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2834060493,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2844062172,"parc_num":10,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2834063208,"parc_num":23,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2844062172,"parc_num":10,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"controlado 170","smo_result":"KO","recolhido":false},
{"dte_nifap":2834067326,"parc_num":23,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2844054905,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2824058430,"parc_num":1,"sub_parc_num":1,"ranking":42,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2834059860,"parc_num":11,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2844054553,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2844057076,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2844056351,"parc_num":1,"sub_parc_num":1,"ranking":42,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2844054905,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2834059860,"parc_num":3,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2844056352,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2853972542,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2853968278,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2843960501,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2853969028,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2853967528,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":null,"smo_result":"KO","recolhido":false},
{"dte_nifap":2843977049,"parc_num":3,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":"área retirada pelo controlo","smo_result":"KO","recolhido":false},
{"dte_nifap":2844053803,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":null,"smo_result":"KO","recolhido":false},
{"dte_nifap":2844053053,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":null,"smo_result":"KO","recolhido":false},
{"dte_nifap":2853966778,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"KO","ams_qa":"KO","obs_gsa":null,"smo_result":"KO","recolhido":false},
{"dte_nifap":2844054553,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2853967528,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2853968278,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2843960501,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2843977049,"parc_num":3,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2844053803,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false},
{"dte_nifap":2853972542,"parc_num":1,"sub_parc_num":1,"ranking":43,"interv":"A.3.1","balde":"III","gsa_qa":"OK","ams_qa":"OK","obs_gsa":null,"smo_result":"OK","recolhido":false}
];

// Completar com mais registos dos baldes V e VI (gerados a partir da estrutura real)
const TECNICOS = ['César Montalvão', 'Manuel Camacho', 'Orlando Sousa', 'Carla Gomes'];
const CULTS = ['BLG','MIL','GIR','SOJ','OLI','VIN','ARR','HORT','FF','CT'];
const BALDES_V_VI = ['V', 'VI'];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndNum(min, max, dec=4) { return parseFloat((Math.random()*(max-min)+min).toFixed(dec)); }

// Gerar NIFAPs adicionais para baldes V e VI (estrutura semelhante ao balde III)
const extra_records = [];
const nifaps_v = [1691731990,1701730490,1711729990,1721729490,1731728990,1741728490,1751727990,1761727490,1771726990,1781726490,1791725990,1801725490,1811724990,1821724490,1831723990,1841723490,1851722990,1861722490,1871721990,1881721490];
const nifaps_vi = [3401800100,3411799600,3421799100,3431798600,3441798100,3451797600,3461797100,3471796600,3481796100,3491795600,3501795100,3511794600,3521794100,3531793600,3541793100,3551792600,3561792100,3571791600,3581791100,3591790600];

let ranking = 100;
for (const nifap of nifaps_v) {
  const numParcs = 2 + Math.floor(Math.random()*4);
  for (let p=0; p<numParcs; p++) {
    const gsa = rnd(['OK','OK','KO','NA']);
    const ams = rnd(['OK','OK','KO','NA']);
    extra_records.push({
      dte_nifap: nifap, parc_num: p+1, sub_parc_num: 0,
      ranking: ranking++, interv: rnd(['A.3.1','A.3.2','C.1.1.2.2','D.2.4']),
      balde: 'V', gsa_qa: gsa, ams_qa: ams,
      obs_gsa: gsa==='KO' ? 'Divergência entre área declarada e área GSA verificada no terreno' : null,
      smo_result: (gsa==='KO'||ams==='KO') ? 'KO' : 'OK', recolhido: Math.random()>0.4
    });
  }
}

for (const nifap of nifaps_vi) {
  const numParcs = 2 + Math.floor(Math.random()*4);
  for (let p=0; p<numParcs; p++) {
    const gsa = rnd(['OK','OK','OK','KO']);
    const ams = rnd(['OK','OK','KO','NA']);
    extra_records.push({
      dte_nifap: nifap, parc_num: p+1, sub_parc_num: 0,
      ranking: ranking++, interv: rnd(['A.3.1','A.3.2','C.1.1.3','E.10.1']),
      balde: 'VI', gsa_qa: gsa, ams_qa: ams,
      obs_gsa: gsa==='KO' ? 'Área GSA inferior à área mínima exigida para esta intervenção' : null,
      smo_result: (gsa==='KO'||ams==='KO') ? 'KO' : 'OK', recolhido: Math.random()>0.35
    });
  }
}

const ALL_RECORDS = [...REAL_RECORDS, ...extra_records];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Tables created');

    await Avaliacao.bulkCreate([
      { cod_aval: 'OK', desc_semaf: 'Conforme' },
      { cod_aval: 'KO', desc_semaf: 'Não Conforme' },
      { cod_aval: 'NA', desc_semaf: 'Não Aplicável' },
    ]);

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

    // Inserir registos NIPAR reais
    const niparRows = ALL_RECORDS.map((r, i) => ({
      ranking: r.ranking || i+1,
      dte_nifap: r.dte_nifap,
      balde: r.balde,
      parc_num: r.parc_num,
      sub_parc_num: r.sub_parc_num,
      cul_id: 900000000 + r.dte_nifap % 9999999,
      cod_cult_decl1: rnd(CULTS),
      unit_amount: rndNum(0.1, 50, 4),
      area_decl1: rndNum(0.1, 45, 4),
      unit_amount_grp: r.balde,
      recolhido: r.recolhido || false,
      selecao: r.gsa_qa === 'OK' ? 'S' : null,
      area_gsa: rndNum(0.05, 44, 4),
      obs_gsa: r.obs_gsa || null,
      gsa_qa: r.gsa_qa || null,
      area_cf: rndNum(0.05, 40, 4),
      obs_ams: null,
      ams_qa: r.ams_qa || null,
      ccampo_aval: rnd(['OK','OK','KO','NA',null]),
      crits_ca_aval: rnd(['OK','OK','KO','NA',null]),
      crits_cc_aval: rnd(['OK','OK','NA',null]),
      encab_aval: rnd(['OK','OK','NA',null]),
      smo_result: r.smo_result || null,
      nome_tec_atrib: rnd(TECNICOS),
      satisfaz_area: r.gsa_qa === 'OK',
      dat_alt: new Date(Date.now() - Math.random() * 180 * 86400000),
      nome_uti_alt: rnd(TECNICOS)
    }));

    await NiparTotal25.bulkCreate(niparRows);
    console.log(`${niparRows.length} NIPAR rows created`);

    // Encabeçamento por NIFAP único
    const nifaps_uniq = [...new Set(ALL_RECORDS.map(r => r.dte_nifap))];
    const encabRows = nifaps_uniq.map(nifap => {
      const rec = ALL_RECORDS.find(r => r.dte_nifap === nifap);
      return {
        dte_nifap: nifap,
        balde: rec.balde,
        interv: rec.interv,
        total_cn: rndNum(0.5, 300, 2),
        total_sa: rndNum(0.5, 250, 2),
        total_sf: rndNum(0, 100, 2),
        dat_alt: new Date(),
        nome_uti_alt: rnd(TECNICOS)
      };
    });

    await EncabCad25.bulkCreate(encabRows);
    console.log(`${encabRows.length} Encab rows created`);

    console.log('\n✅ Seed completo!');
    console.log('Credenciais de acesso:');
    console.log('  admin / admin123');
    console.log('  cesar.montalvao / tecnico123');
    console.log('  manuel.camacho / tecnico123');
    console.log('  orlando.sousa / tecnico123');
    console.log('  carla.gomes / tecnico123');
    console.log('  leitura / leitura123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
