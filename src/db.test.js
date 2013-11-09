var Sequelize = require("sequelize"),
	sequelize = new Sequelize('main', '', '', {
		dialect : 'sqlite',
		storage : 'aic.tasks',
		omitNull : true
	});
	
var Link = sequelize.define('link', {
		link : Sequelize.TEXT,
		id : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		status : Sequelize.INTEGER
	});
	
	
Link.sync().success(function() {
	console.log('synced!');

	Link.create({ link : 'asdf', status : 12 }).success(function() { console.log('created!'); });
});
	
