var $ = require('jquery'),
	Sequelize = require("sequelize");
	
	
var	sequelize = new Sequelize('main', '', '', {
		dialect : 'sqlite',
		storage : 'aic.tasks',
		omitNull : true,
		define : {
			freezeTableName : true
		}
	});
	
var Link = sequelize.define('link', {
		link : Sequelize.TEXT,
		title : Sequelize.TEXT,
		id : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		status : Sequelize.INTEGER
	});
	
var Paragraph = sequelize.define('par', {
		text : Sequelize.TEXT,
		status : Sequelize.INTEGER,
		link_id : {
			type : Sequelize.INTEGER,
			references : 'link',
			referencesKey : 'id'
		}
	});
		
Paragraph.hasOne(Link);
Link.hasMany(Paragraph);
		
exports.Link = Link;
exports.Paragraph = Paragraph;
	
