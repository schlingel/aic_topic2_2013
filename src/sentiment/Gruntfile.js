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
                tasks : ['execute:jobs', 'execute:tasks', 'execute:scrapper'],
                options : { logConcurrentOutput: true }
            }
        }
    });

    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.registerTask('default', ['concurrent:run']);
};