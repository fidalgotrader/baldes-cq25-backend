const { Sequelize } = require('sequelize');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

// Railway uses "postgres://" but Sequelize needs "postgresql://"
const normalizedUrl = dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')
  ? dbUrl.replace('postgres://', 'postgresql://')
  : dbUrl;

console.log('Connecting to DB host:', normalizedUrl.split('@')[1]?.split('/')[0] || 'unknown');

const sequelize = new Sequelize(normalizedUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false
});

const Utilizador = require('./Utilizador')(sequelize);
const NiparTotal25 = require('./NiparTotal25')(sequelize);
const EncabCad25 = require('./EncabCad25')(sequelize);
const Avaliacao = require('./Avaliacao')(sequelize);

module.exports = { sequelize, Utilizador, NiparTotal25, EncabCad25, Avaliacao };
