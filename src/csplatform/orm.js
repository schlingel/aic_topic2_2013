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
    id          : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    text        : Sequelize.TEXT,
    callback    : Sequelize.TEXT
});


var TaskParameter = sequelize.define('taskParameter', {
    id          : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    title       : Sequelize.TEXT,
    type        : Sequelize.TEXT,
    value       : Sequelize.TEXT,
    taskId      : {
                    type: Sequelize.INTEGER,
                    references : 'task',
                    referencesKey: 'id'
                  }
});

Task.hasMany(TaskParameter);
TaskParameter.hasOne(Task);

exports.Task = Task;
exports.TaskParameter = TaskParameter;
