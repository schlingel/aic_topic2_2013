var Sequelize = require("sequelize");
var $ = require('jquery');

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
});

Task.hasMany(TaskParameter, {foreignKeyConstraint: true});
TaskParameter.belongsTo(Task);

exports.Task = Task;
exports.TaskParameter = TaskParameter;

exports.sequelize = sequelize;
