const {Sequelize,Model, DataTypes} = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

module.exports = {sequelize}