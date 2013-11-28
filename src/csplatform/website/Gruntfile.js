
module.exports = function(grunt) {

    grunt.initConfig({
        execute: {
            service: {
                src: ['../cs.endpoint.js'],
                options: {
                    cwd: '../'
                }
            },
            server: {
                src: ['./scripts/web-server.js']
            }
        },

        concurrent: {
            run: {
                tasks: ['execute:service', 'execute:server'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('default', ['concurrent:run']);
};
