'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var basementConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        basement: basementConfig,
        watch: {
            coffee: {
                files: ['<%= basement.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:server']
            },
            jade: {
                files: ["<%= basement.app %>/*.jade"],
                tasks: ["jade:server"]
            },
            less: {
                files: ['<%= basement.app %>/styles/{,*/}*.less'],
                tasks: ['less:server']
            },
            livereload: {
                files: [
                    '<%= basement.app %>/*.html',
                    '.tmp/*.html',
                    '{.tmp,<%= basement.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= basement.app %>}/scripts/{,*/}*.js',
                    '<%= basement.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'app')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= basement.dist %>/*'],
            server: '.tmp'
        },
        coffee: {
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= basement.app %>/scripts',
                    src: '**/*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            dist: {
                files: [{
                    // rather than compiling multiple files here you should
                    // require them into your main .coffee file
                    expand: true,
                    cwd: '<%= basement.app %>/scripts',
                    src: '**/*.coffee',
                    dest: '<%= basement.dist %>/scripts',
                    ext: '.js'
                }]
            }
        },
        jade: {
            server: {
                files: [{
                    // rather than compiling multiple files here you should
                    // require them into your main .coffee file
                    expand: true,
                    cwd: '<%= basement.app %>',
                    src: '*.jade',
                    dest: '.tmp',
                    ext: '.html'
                }],
                options: {
                    client: false,
                    pretty: true
                }
            },
            dist: {
                files: [{
                    // rather than compiling multiple files here you should
                    // require them into your main .coffee file
                    expand: true,
                    cwd: '<%= basement.app %>',
                    src: '*.jade',
                    dest: '<%= basement.dist %>',
                    ext: '.html'
                }],
                options: {
                    client: false,
                    pretty: false
                }
            }
        },
        less: {
            options: {
                paths: ['app/components'],
                cssDir: '.tmp/styles',
                imagesDir: '<%= basement.app %>/images',
                javascriptsDir: '<%= basement.app %>/scripts',
                fontsDir: '<%= basement.app %>/styles/fonts',
                importPath: 'app/bower_components',
                relativeAssets: true
            },
            server: {
                options: {
                    paths: ["<%= basement.app %>/styles"],
                    yuicompress: true
                },
                files: {
                    ".tmp/styles/main.css": "<%= basement.app %>/styles/main.less"
                }
            },
            dist: {
                options: {
                    paths: ["<%= basement.app %>/styles"],
                    yuicompress: true
                },
                files: {
                    "<%= basement.dist %>/styles/main.css": "<%= basement.app %>/styles/main.less"
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= basement.app %>',
                    dest: '<%= basement.dist %>',
                    src: [
                        '*.{ico,txt}',
                        'scripts/**/*.js',
                        'styles/fonts*.{eot,svg,ttf,woff}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif,jpg,png}'
                    ]
                }]
            }
        },
        'ftp-deploy': {
          build: {
            auth: {
              host: 's215831426.mialojamiento.es',
              port: 21,
              authKey: 'bernatfortet'
            },
            src: 'dist',
            dest: '/stubs.bernatfortet.com/morten-hake'
            //exclusions: ['dist/images', 'dist/styles/fonts']
          }
        }
    });

    grunt.renameTask('regarde', 'watch');
    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'coffee:server',
            'jade:server',
            'less:server',
            'livereload-start',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'coffee:dist',
        'less:dist',
        'jade:dist',
        'copy',
        'ftp-deploy'
    ]);

    grunt.registerTask('default', ['livereload-start', 'connect', 'watch']);

};
