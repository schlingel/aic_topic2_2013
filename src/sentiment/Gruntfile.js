module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        execute : {
            jobs : {
                src : ['jobfactory.js'],
                options : { cwd : '.'}
            },
            tasks : {
                src : ['tasks.endpoint.js'],
                options : { cwd : '.' }
            },
            scrapper : {
                src : ['scrapper.js'],
                options : { cwd : '.' }
            }
        },
        concurrent : {
            run : {
                tasks : ['execute:jobs', 'execute:tasks', 'execute:scrapper', 'http-server:adminsrv'],
                options : { logConcurrentOutput: true }
            }
        },
        'http-server' : {
            adminsrv : {
                root : './website',
                port : 9123,
                host : '127.0.0.1',
                showDir : true,
                autoIndex : true,
                defaultExt : 'html',
                runInBackground : false
            }
        }
    });

    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-http-server');

    grunt.registerTask('default', ['concurrent:run']);
};