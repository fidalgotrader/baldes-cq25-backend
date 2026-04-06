const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Utilizador', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tecnico_nome: { type: DataTypes.STRING(100), allowNull: false },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  perfil: { type: DataTypes.ENUM('admin', 'tecnico', 'leitura'), defaultValue: 'tecnico' },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'tab_utilizadores', timestamps: true, createdAt: 'criado_em', updatedAt: false });
