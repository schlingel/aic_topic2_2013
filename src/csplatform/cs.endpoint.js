var restify = require('restify');
var orm = require('./orm.js');
var jsdom = require('jsdom');
var $ = require('jquery')(jsdom.jsdom().createWindow());
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
            TaskParameter.findOrCreate({taskId: task.id, name: par.name, type: par.type}).error(function(err) {
                console.log("Unable to create task parameter.")
                console.log(err)
            });
        });
        res.send({success: true, task_id: task.id});
        next();
    }).error(function(err) {
        console.log("Couldn't create new task!");
        console.log(err);
        
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
    Task.sync().success(function() {
    	TaskParameter.sync().success(function() {
		    Task.findAll({ include: [TaskParameter]}).success(function(tasks) {
		        var result = {
		            success : true,
		            tasks : tasks
		        };
		
		        res.send(result);
		        next();
		    });
    	});
    });
    
};


function simulateTask(req, res, next) {
    var taskId = req.params.id,
    	promises = [],
        USER_IDS = ["b6589fc6ab0dc82cf12099d1c2d40ab994e8410c","356a192b7913b04c54574d18c28d46e6395428ab","da4b9237bacccdf19c0760cab7aec4a8359010b0","77de68daecd823babbb58edb1c8e14d7106e83bb","1b6453892473a467d07372d45eb05abc2031647a","ac3478d69a3c81fa62e60f5c3696165a4e5e6ac4","c1dfd96eea8cc2b62785275bca38ac261256e278","902ba3cda1883801594b6e1b452790cc53948fda","fe5dbbcea5ce7e2988b8c69bcfdfde8904aabc1f","0ade7c2cf97f75d009975f4d720d1fa6c19f4897","b1d5781111d84f7b3fe45a0852e59758cd7a87e5","17ba0791499db908433b80f37c5fbc89b870084b","7b52009b64fd0a2a49e6d8a939753077792b0554","bd307a3ec329e10a2cff8fb87480823da114f8f4","fa35e192121eabf3dabf9f5ea6abdbcbc107ac3b","f1abd670358e036c31296e66b3b66c382ac00812","1574bddb75c78a6fd2251d61e2993b5146201319","0716d9708d321ffb6a00818614779e779925365c","9e6a55b6b4563e652a23be9d623ca5055c356940","b3f0c7f6bb763af1be91d9e74eabfeb199dc1f1f","91032ad7bbcb6cf72875e8e8207dcfba80173f7c","472b07b9fcf2c2451e8781e944bf5f77cd8457c8","12c6fc06c99a462375eeb3f43dfd832b08ca9e17","d435a6cdd786300dff204ee7c2ef942d3e9034e2","4d134bc072212ace2df385dae143139da74ec0ef","f6e1126cedebf23e1463aee73f9df08783640400","887309d048beef83ad3eabf2a79a64a389ab1c9f","bc33ea4e26e5e1af1408321416956113a4658763","0a57cb53ba59c46fc4b692527a38a87c78d84028","7719a1c782a1ba91c031a682a0a2f8658209adbf","22d200f8670dbdb3e253a90eee5098477c95c23d","632667547e7cd3e0466547863e1207a8c0c0c549","cb4e5208b4cd87268b208e49452ed6e89a68e0b8","b6692ea5df920cad691c20319a6fffd7a4a766b8","f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59","972a67c48192728a34979d9a35164c1295401b71","fc074d501302eb2b93e2554793fcaf50b3bf7291","cb7a1d775e800fd1ee4049f7dca9e041eb9ba083","5b384ce32d8cdef02bc3a139d4cac0a22bb029e8","ca3512f4dfa95a03169c5a670a4c91a19b3077b4","af3e133428b9e25c55bc59fe534248e6a0c0f17b","761f22b2c1593d0bb87e0b606f990ba4974706de","92cfceb39d57d914ed8b14d0e37643de0797ae56","0286dd552c9bea9a69ecb3759e7b94777635514b","98fbc42faedc02492397cb5962ea3a3ffc0a9243","fb644351560d8296fe6da332236b1f8d61b2828a","fe2ef495a1152561572949784c16bf23abb28057","827bfc458708f0b442009c9c9836f7e4b65557fb","64e095fe763fc62418378753f9402623bea9e227","2e01e17467891f7c933dbaa00e1459d23db3fe4f","e1822db470e60d090affd0956d743cb0e7cdf113","b7eb6c689c037217079766fdb77c3bac3e51cb4c","a9334987ece78b6fe8bf130ef00b74847c1d3da6","c5b76da3e608d34edb07244cd9b875ee86906328","80e28a51cbc26fa4bd34938c5e593b36146f5e0c","8effee409c625e1a2d8f5033631840e6ce1dcb64","54ceb91256e8190e474aa752a6e0650a2df5ba37","9109c85a45b703f87f1413a405549a2cea9ab556","667be543b02294b7624119adc3a725473df39885","5a5b0f9b7d3f8fc84c3cef8fd8efaaa6c70d75ab","e6c3dd630428fd54834172b8fd2735fed9416da4","6c1e671f9af5b46d9c1a52067bdf0e53685674f7","511a418e72591eb7e33f703f04c3fa16df6c90bd","a17554a0d2b15a664c0e73900184544f19e70227","c66c65175fecc3103b3b587be9b5b230889c8628","2a459380709e2fe4ac2dae5733c73225ff6cfee1","59129aacfb6cebbe2c52f30ef3424209f7252e82","4d89d294cd4ca9f2ca57dc24a53ffb3ef5303122","b4c96d80854dd27e76d8cc9e21960eebda52e962","a72b20062ec2c47ab2ceb97ac1bee818f8b6c6cb","b7103ca278a75cad8f7d065acda0c2e80da0b7dc","d02560dd9d7db4467627745bd6701e809ffca6e3","c097638f92de80ba8d6c696b26e6e601a5f61eb7","35e995c107a71caeb833bb3b79f9f54781b33fa1","1f1362ea41d1bc65be321c0a378a20159f9a26d0","450ddec8dd206c2e2ab1aeeaa90e85e51753b8b7","d54ad009d179ae346683cfc3603979bc99339ef7","d321d6f7ccf98b51540ec9d933f20898af3bd71e","eb4ac3033e8ab3591e0fcefa8c26ce3fd36d5a0f","b74f5ee9461495ba5ca4c72a7108a23904c27a05","b888b29826bb53dc531437e723738383d8339b56","1d513c0bcbe33b2e7440e5e14d0b22ef95c9d673","76546f9a641ede2beab506b96df1688d889e629a","7d7116e23efef7292cad5e6f033d9a962708228c","be461a0cd1fda052a69c3fd94f8cf5f6f86afa34","1352246e33277e9d3c9090a434fa72cfa6536ae2","3c26dffc8a2e8804dfe2c8a1195cfaa5ef6d0014","e62d7f1eb43d87c202d2f164ba61297e71be80f4","b37f6ddcefad7e8657837d3177f9ef2462f98acf","16b06bd9b738835e2d134fe8d596e9ab0086a985","2d0c8af807ef45ac17cafb2973d866ba8f38caa9","4cd66dfabbd964f8c6c4414b07cdb45dae692e19","8ee51caaa2c2f4ee2e5b4b7ef5a89db7df1068d7","08a35293e09f508494096c1c1b3819edb9df50db","215bb47da8fac3342b858ac3db09b033c6c46e0b","8e63fd3e77796b102589b1ba1e4441c7982e4132","6fb84aed32facd1299ee1e77c8fd2b1a6352669e","812ed4562d3211363a7b813aa9cd2cf042b63bb2","31bd9b9f5f7b338e41b56183a2f3008b541d7c84","9a79be611e0267e1d943da0737c6c51be67865a0"],
    	isSuccess = true;

    function userId() {
        return USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
    };

    TaskParameter.findAll({ where : { taskId : taskId}}).success(function(taskPars) {
        taskPars.forEach(function(taskPar) {
        	var deferred = $.Deferred();
        	
        	promises.push(deferred.promise());
        	
        	function onSuccess(deferred) {
        		return function() {
        			console.log('parameters updated!');
        			deferred.resolve();
        		}
        	};
        	
        	function onError(deferred) {
        		return function(err) {
        			console.log('got error!', err);
        			isSuccess = false;
        			deferred.resolve();
        		}
        	};
        	
        	var value = (taskPar.type == "numeric") ? Math.random().toString().substring(0, 8) : Math.random().toString(36).substring(2, 10);
        	
            taskPar.updateAttributes({
                value: value,
                worker : userId()
            })
            	.success(onSuccess(deferred))
            	.error(onError(deferred));
        });
        
        if(promises.length > 0) {
        	$.when.apply(promises).done(function() {
        		res.send({
        			success : isSuccess
        		});
        		
	        	next();
        	});
        } else {
	        res.send({success : true});
	        next();
        }
    });
};

server.get('/tasks/:id', getTaskById);
server.post('/tasks', createTask);
server.get('/tasks', getAllTasks);
server.get('/simulate/:id', simulateTask);

server.listen(serverCfg.port, function() {
    console.log("Listening on port: %d", serverCfg.port);
});
