
module.exports = function(grunt) {

    grunt.initConfig({
        execute: {
            service: {
                src: ['./cs.endpoint.js'],
                options: { cwd: '../' }
            }
        },
        concurrent: {
            run: {
                tasks: ['execute:service', 'http-server:cssrv'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        'http-server' : {
            cssrv : {
                root : './website',
                port : 9321,
                host : '127.0.0.1',
                showDir : true,
                autoIndex : true,
                defaultExt : 'html',
                runInBackground: false
            }
        }
    });


    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-http-server');

    grunt.registerTask('default', ['concurrent:run']);
};
