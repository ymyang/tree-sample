var Sequelize = require('sequelize');
var config = require('../config.json');
var models = module.exports = {};

var sequelize = new Sequelize('tree_demo', config.mysql.username, config.mysql.password, {
	host: config.mysql.host,
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 10
	}
});

models.sequelize = sequelize;
models.Node = sequelize.import('./Node.js');