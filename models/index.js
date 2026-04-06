const { Sequelize } = require('sequelize');

const raw = process.env.DATABASE_URL || '';
console.log('DATABASE_URL length:', raw.length);
console.log('DATABASE_URL starts with:', raw.substring(0, 15) || '(EMPTY)');

if (!raw || raw.length < 10) {
  console.error('ERRO: DATABASE_URL nao esta configurada!');
  process.exit(1);
}

const url = raw.replace(/^postgres:\/\//, 'postgresql://');

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

const Utilizador = require('./Utilizador')(sequelize);
const NiparTotal25 = require('./NiparTotal25')(sequelize);
const EncabCad25 = require('./EncabCad25')(sequelize);
const Avaliacao = require('./Avaliacao')(sequelize);

module.exports = { sequelize, Utilizador, NiparTotal25, EncabCad25, Avaliacao };
