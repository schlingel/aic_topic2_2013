var Sequelize = require("sequelize");
var jsdom = require('jsdom');
var $ = require('jquery')(jsdom.jsdom().createWindow());

var sequelize = new Sequelize('main', '', '', {
    dialect     : 'sqlite',
    storage     : 'tasks.db',
    omitNull    : true,
    define      : {
        freezeTableName : true
    }
});

var Task = sequelize.define('task', {
    text        : Sequelize.TEXT,
    callback    : Sequelize.TEXT
});


var TaskParameter = sequelize.define('taskParameter', {
    name        : Sequelize.TEXT,
    type        : Sequelize.TEXT,
    value       : Sequelize.TEXT,
    worker      : Sequelize.TEXT // user id = sha1 hex code as string
});

Task.hasMany(TaskParameter, {foreignKeyConstraint: true});
TaskParameter.belongsTo(Task);

exports.Task = Task;
exports.TaskParameter = TaskParameter;

exports.sequelize = sequelize;
