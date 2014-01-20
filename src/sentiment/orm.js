var Sequelize = require("sequelize");
	
	
var	sequelize = new Sequelize('main', '', '', {
		dialect : 'sqlite',
		storage : 'aic.tasks',
		omitNull : true,
        maxConcurrentQueries : 1000,
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
	
var Job = sequelize.define('job', {
		id : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		crowd_sourcing_id : Sequelize.INTEGER,
		link_id : { type: Sequelize.INTEGER, references: 'link', referencesKey : 'id' },
		par_id : { type: Sequelize.INTEGER, references: 'par', referencesKey : 'id' },
		cs_id : Sequelize.INTEGER,
		status : Sequelize.INTEGER
	});
	
var ScoreEntity = sequelize.define('entity', {
		id : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		name : Sequelize.STRING,
		type : Sequelize.INTEGER // 0 -> company, 1 -> product
	});
	
var JobEntity = sequelize.define('jobentity', {
		job_id : Sequelize.INTEGER,
		entity_id : Sequelize.INTEGER
	});
	
var Score = sequelize.define('score', {
		score : Sequelize.FLOAT,
		entity_id : { type : Sequelize.INTEGER, references : 'entity', referencesKey : 'id' },
		link_id : { type : Sequelize.INTEGER, references : 'link', referencesKey : 'id' }		
	});
	
	
Paragraph.hasOne(Link);
Paragraph.hasOne(Job);
Result.hasOne(Link);
Score.hasOne(Link);
Link.hasMany(Paragraph);
Link.hasMany(Result);
Link.hasMany(Score);
Score.hasOne(ScoreEntity);
ScoreEntity.hasMany(Score);
Job.hasOne(Link);
Job.hasOne(Paragraph);

exports.Score = Score;
exports.JobEntity = JobEntity;
exports.Result = Result;
exports.Job = Job;
exports.ScoreEntity = ScoreEntity;
exports.Score = Score;
exports.Link = Link;
exports.Paragraph = Paragraph;
	
