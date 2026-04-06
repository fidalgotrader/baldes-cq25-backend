const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
  dialect: 'postgres',
  dialectOptions: process.env.DATABASE_URL ? {
    ssl: { require: true, rejectUnauthorized: false }
  } : {},
  logging: false
});

const Utilizador = require('./Utilizador')(sequelize);
const NiparTotal25 = require('./NiparTotal25')(sequelize);
const EncabCad25 = require('./EncabCad25')(sequelize);
const Avaliacao = require('./Avaliacao')(sequelize);

module.exports = { sequelize, Utilizador, NiparTotal25, EncabCad25, Avaliacao };
