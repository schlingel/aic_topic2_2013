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
		id : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		text : Sequelize.TEXT,
		status : Sequelize.INTEGER,
		link_id : {
			type : Sequelize.INTEGER,
			references : 'link',
			referencesKey : 'id'
		}
	});
	
var Result = sequelize.define('result', {
		id : {
			type: Sequelize.INTEGER,
			primaryKey : true,
			autoIncrement : true
		},
		name : Sequelize.TEXT
	});
	
var JobsMapping = sequelize.define('jobmapping', {
		link_id : {
			type : Sequelize.INTEGER,
			references : 'link',
			referencesKey : 'id'
		}, 
		result_id : {
			type : Sequelize.INTEGER,
			references : 'link',
			referencesKey : 'id'
		},
		job_id : Sequelize.INTEGER
});
	
var Score = sequelize.define('score', {
		score : Sequelize.FLOAT,
		link_id : {
			type : Sequelize.INTEGER,
			references : 'link',
			referencesKey : 'id'
		}		
	});
		
Paragraph.hasOne(Link);
Result.hasOne(Link);
Score.hasOne(Link);
Link.hasMany(Paragraph);
Link.hasMany(Result);
Link.hasMany(Score);

exports.Score = Score;
exports.Result = Result;
exports.Link = Link;
exports.Paragraph = Paragraph;
	
