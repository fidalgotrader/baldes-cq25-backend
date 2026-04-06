const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Avaliacao', {
  cod_aval: { type: DataTypes.STRING(10), primaryKey: true },
  desc_semaf: DataTypes.STRING(100)
}, { tableName: 'tab_avaliacao', timestamps: false });
