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
	console.log('got: ', req.body, req.params);

    var taskText = req.body.text;
    var callback = req.body.callback_url;
	
    Task.create({text: taskText, callback: callback}).success(function(task) {
        var description = req.body.description || [];
        
        description.forEach(function(par) {
            TaskParameter.create({taskId: task.id, name: par.name, type: par.type}).error(function() {
                console.log("Unable to create task parameter.")
            });
        });
        res.send({success: true, task_id: task.id});
        next();
    }).error(function() {
        res.send({success: false, error: "Unable to create new task."});
        next();
    });
};

function getTaskById(req, res, next) {
    var taskId = req.params.id;

    TaskParameter.findAll({ where : { taskId : taskId },
                            attributes: ['name', 'type', 'value']}).success(function(taskPars) {
        
		if(!!taskPars && taskPars.length > 0) {
			var result = {
				success : true,
				results : taskPars
			};

			res.send(result);
		} else {
			res.send({
				success : false,
				error : "No task with id " + taskId + " found."
			});
		}
		
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


function getAllTasks(req, res, next) {
    Task.findAll({ include: [TaskParameter]}).success(function(tasks) {
        var result = {
            success : true,
            tasks : tasks
        };

        res.send(result);
        next();
    });
};


function simulateTask(req, res, next) {
    var taskId = req.params.id;
    TaskParameter.findAll({ where : { taskId : taskId}}).success(function(taskPars) {
        taskPars.forEach(function(taskPar) {
            if (taskPar.type == "numeric") {
                taskPar.updateAttributes({value: Math.random().toString().substring(0, 8)});
            } else {
                taskPar.updateAttributes({value: Math.random().toString(36).substring(2, 10)});
            }
        });
        res.send({success : true});
        next();
    });
};

server.get('/tasks/:id', getTaskById);
server.post('/tasks', createTask);
server.get('/tasks', getAllTasks);
server.get('/simulate/:id', simulateTask);

server.listen(serverCfg.port, function() {
    console.log("Listening on port: %d", serverCfg.port);
});
