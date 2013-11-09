var $ = require('jquery'),
	Sequelize = require("sequelize");
	
	
var	sequelize = new Sequelize('main', '', '', {
		dialect : 'sqlite',
		storage : 'aic.tasks',
		omitNull : true
	});
	
var Link = sequelize.define('link', {
		link : Sequelize.TEXT,
		title : Sequelize.TEXT,
		id : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		status : Sequelize.INTEGER
	});
	

	
exports.Link = Link;
	
