module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        execute : {
            jobs : {
                src : ['jobfactory.js'],
                options : { cwd : '.'}
            }
        },
        concurrent : {
            run : {
                tasks : ['execute:jobs'],
                options : { logConcurrentOutput: true }
            }
        }
    });

    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.registerTask('default', ['concurrent:run']);
};