var restify = require('restify');
var orm = require('./orm.js');
var $ = require('jquery');
var Task = orm.Task;
var TaskParameter = orm.TaskParameter;

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(cors);

var serverCfg = {
    url     : 'http://localhost',
    port    : 34555
};

function cors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
};


function createTask(req, res, next) {
    var taskText = req.params.text;
    var callback = req.params.callback_url;

    Task.sync().success(function() {
        Task.create({text: taskText, callback: callback}).success(function(task) {
            var taskDeferred = $.Deferred();

            TaskParameter.sync().success(function() {
                req.params.description.forEach(function(par) {
                    TaskParameter.create({taskId: task.id, title: par.name, type: par.type}).error(function() {
                        console.log("Unable to create task parameter.")
                    });
                });
                res.send({success: true, task_id: task.id});
                next();
            });
        }).error(function() {
            res.send({success: false, error: "Unable to create new task."});
            next();
        });
    });
};

function getTaskById(req, res, next) {
    var taskId = req.params.id;

    TaskParameter.findAll({ where : { taskId : taskId },
                            attributes: ['title', 'type', 'value']}).success(function(taskPars) {
        var result = {
            success : true,
            results : taskPars
        };

        res.send(result);
        next();
    }).error(function() {
        var result = {
            success : false,
            error : "No task with id " + taskId + " found."
        };

        res.send(result);
        next();
    });
};


server.get('/tasks/:id', getTaskById);
server.post('/tasks', createTask);

server.listen(serverCfg.port, function() {
    console.log("Listening on port: %d", serverCfg.port);
});
