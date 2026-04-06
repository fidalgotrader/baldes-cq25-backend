const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('EncabCad25', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dte_nifap: DataTypes.BIGINT,
  interv: DataTypes.STRING(50),
  total_cn: DataTypes.DECIMAL(12, 4),
  total_sa: DataTypes.DECIMAL(12, 4),
  total_sf: DataTypes.DECIMAL(12, 4),
  balde: DataTypes.STRING(20),
  dat_alt: DataTypes.DATE,
  nome_uti_alt: DataTypes.STRING(100)
}, { tableName: 'tab_encab_cad_25', timestamps: false });
